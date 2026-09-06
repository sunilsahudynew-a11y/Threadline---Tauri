import { ProjectBundle, Scene, Chapter } from '../../types';
import { VaultInfo, VaultSyncResult } from './vaultTypes';

// Detect if running inside Tauri native runtime
export function isTauriEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  return '__TAURI_INTERNALS__' in window || '__TAURI__' in window;
}

// Detect if running in a modern browser that supports the File System Access API
export function isFileSystemAccessSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return typeof (window as any).showDirectoryPicker === 'function';
}

// In-memory reference to chosen browser DirectoryHandle (persisted in IndexedDB)
let activeBrowserDirHandle: FileSystemDirectoryHandle | null = null;
let activeTauriVaultPath: string | null = null;

const IDB_NAME = 'ThreadlineVaultDB';
const IDB_STORE = 'vault_handles';

/**
 * Open IndexedDB to store/retrieve browser DirectoryHandle across page reloads
 */
function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported'));
    }
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(IDB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveDirectoryHandleToIDB(projectId: string, handle: FileSystemDirectoryHandle): Promise<void> {
  try {
    const db = await openIDB();
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(handle, `handle_${projectId}`);
  } catch (e) {
    console.warn('Could not persist directory handle to IndexedDB:', e);
  }
}

async function getDirectoryHandleFromIDB(projectId: string): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await openIDB();
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get(`handle_${projectId}`);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
}

/**
 * Sanitize strings for safe filenames
 */
export function sanitizeFilename(str: string): string {
  return str
    .replace(/[<>:"/\\|?*]/g, '')
    .trim()
    .slice(0, 80) || 'untitled';
}

/**
 * Serialize a Scene into Markdown with YAML frontmatter
 */
export function sceneToMarkdownFile(scene: Scene): string {
  const frontmatter = [
    '---',
    `id: ${JSON.stringify(scene.id)}`,
    `title: ${JSON.stringify(scene.title || 'Untitled Scene')}`,
    `order: ${scene.order || 0}`,
    scene.chapterId ? `chapterId: ${JSON.stringify(scene.chapterId)}` : null,
    scene.chapterTitle ? `chapterTitle: ${JSON.stringify(scene.chapterTitle)}` : null,
    scene.actOrPhase ? `actOrPhase: ${JSON.stringify(scene.actOrPhase)}` : null,
    `status: ${JSON.stringify(scene.status || 'draft')}`,
    `pov: ${JSON.stringify(scene.pov || '')}`,
    `location: ${JSON.stringify(scene.location || '')}`,
    `time: ${JSON.stringify(scene.time || '')}`,
    `characters: ${JSON.stringify(scene.characters || [])}`,
    `wordCount: ${scene.wordCount || 0}`,
    scene.premise ? `premise: ${JSON.stringify(scene.premise)}` : null,
    scene.notes ? `notes: ${JSON.stringify(scene.notes)}` : null,
    '---',
    '',
    scene.proseContent || ''
  ]
    .filter((line) => line !== null)
    .join('\n');

  return frontmatter;
}

/**
 * Parse a Markdown file with YAML frontmatter back into a Scene
 */
export function markdownFileToScene(raw: string, fallbackId: string, defaultOrder: number): Scene {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
  const match = raw.match(frontmatterRegex);

  if (!match) {
    // Plain markdown with no frontmatter
    const trimmed = raw.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    return {
      id: fallbackId,
      title: 'Imported Scene',
      order: defaultOrder,
      proseContent: raw,
      premise: '',
      characters: [],
      location: '',
      time: '',
      pov: '',
      status: 'draft',
      wordCount: words,
      notes: '',
      comments: []
    };
  }

  const yamlBlock = match[1];
  const proseContent = match[2] || '';

  const meta: Record<string, any> = {};
  for (const line of yamlBlock.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      const valStr = line.slice(colonIdx + 1).trim();
      try {
        meta[key] = JSON.parse(valStr);
      } catch {
        meta[key] = valStr;
      }
    }
  }

  const words = proseContent.trim() ? proseContent.trim().split(/\s+/).length : 0;

  return {
    id: meta.id || fallbackId,
    title: meta.title || 'Untitled Scene',
    order: typeof meta.order === 'number' ? meta.order : defaultOrder,
    chapterId: meta.chapterId,
    chapterTitle: meta.chapterTitle,
    actOrPhase: meta.actOrPhase,
    status: meta.status || 'draft',
    pov: meta.pov || '',
    characters: Array.isArray(meta.characters) ? meta.characters : [],
    location: meta.location || '',
    time: meta.time || '',
    wordCount: typeof meta.wordCount === 'number' ? meta.wordCount : words,
    premise: meta.premise || '',
    notes: meta.notes || '',
    comments: [],
    proseContent
  };
}

/**
 * Prompt user to select a vault project directory on macOS / Windows
 */
export async function pickVaultFolder(projectId: string): Promise<VaultInfo | null> {
  // 1. Tauri Native Flow
  if (isTauriEnvironment()) {
    try {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select Dedicated Vault Folder for Threadline Project'
      });

      if (typeof selected === 'string') {
        activeTauriVaultPath = selected;
        localStorage.setItem(`threadline_vault_path_${projectId}`, selected);

        const folderName = selected.split(/[\/\\]/).filter(Boolean).pop() || 'Novel Vault';

        return {
          mode: 'tauri-fs',
          folderName,
          folderPath: selected,
          isAvailable: true,
          canSyncContinuously: true
        };
      }
      return null;
    } catch (e) {
      console.error('Tauri folder picker error:', e);
      return null;
    }
  }

  // 2. Browser File System Access API Flow
  if (isFileSystemAccessSupported()) {
    try {
      const handle = await (window as any).showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'documents'
      });

      if (handle) {
        activeBrowserDirHandle = handle;
        await saveDirectoryHandleToIDB(projectId, handle);
        localStorage.setItem(`threadline_vault_name_${projectId}`, handle.name);

        return {
          mode: 'browser-fsa',
          folderName: handle.name,
          isAvailable: true,
          canSyncContinuously: true
        };
      }
      return null;
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        console.error('Browser Directory Picker error:', e);
      }
      return null;
    }
  }

  // Fallback: File system access not supported
  return {
    mode: 'browser-cached',
    folderName: 'Browser Local Storage',
    isAvailable: true,
    canSyncContinuously: false
  };
}

/**
 * Get active vault info for a project
 */
export async function getVaultInfo(projectId: string): Promise<VaultInfo> {
  if (isTauriEnvironment()) {
    const savedPath = activeTauriVaultPath || localStorage.getItem(`threadline_vault_path_${projectId}`);
    if (savedPath) {
      const folderName = savedPath.split(/[\/\\]/).filter(Boolean).pop() || 'Novel Vault';
      return {
        mode: 'tauri-fs',
        folderName,
        folderPath: savedPath,
        isAvailable: true,
        canSyncContinuously: true
      };
    }
  }

  if (isFileSystemAccessSupported()) {
    if (!activeBrowserDirHandle) {
      activeBrowserDirHandle = await getDirectoryHandleFromIDB(projectId);
    }
    if (activeBrowserDirHandle) {
      return {
        mode: 'browser-fsa',
        folderName: activeBrowserDirHandle.name,
        isAvailable: true,
        canSyncContinuously: true
      };
    }
  }

  return {
    mode: 'browser-cached',
    folderName: 'Local Browser Cache',
    isAvailable: true,
    canSyncContinuously: false
  };
}

/**
 * Disconnect vault folder
 */
export function disconnectVaultFolder(projectId: string): void {
  activeBrowserDirHandle = null;
  activeTauriVaultPath = null;
  localStorage.removeItem(`threadline_vault_path_${projectId}`);
  localStorage.removeItem(`threadline_vault_name_${projectId}`);
}

/**
 * Write full ProjectBundle into the folder vault (Obsidian style)
 */
export async function writeBundleToVault(bundle: ProjectBundle): Promise<VaultSyncResult> {
  const projectId = bundle.project.id;
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // 1. Tauri File System write
  if (isTauriEnvironment()) {
    const rawVaultPath = activeTauriVaultPath || localStorage.getItem(`threadline_vault_path_${projectId}`);
    if (!rawVaultPath) {
      return { success: false, message: 'No vault folder selected', timestamp };
    }

    const vaultPath = rawVaultPath.trim().replace(/^["']|["']$/g, '').replace(/[/\\]+$/, '');

    try {
      const { writeTextFile, mkdir, exists } = await import('@tauri-apps/plugin-fs');
      const sep = vaultPath.includes('\\') ? '\\' : '/';

      const manuscriptDir = `${vaultPath}${sep}Manuscript`;
      const bibleDir = `${vaultPath}${sep}StoryBible`;
      const cuttingDir = `${vaultPath}${sep}CuttingRoom`;
      const notesDir = `${vaultPath}${sep}Notes`;
      const metaDir = `${vaultPath}${sep}.threadline`;

      // Ensure root vault and subdirectories exist
      const rootExists = await exists(vaultPath).catch(() => false);
      if (!rootExists) {
        await mkdir(vaultPath, { recursive: true });
      }

      for (const dir of [manuscriptDir, bibleDir, cuttingDir, notesDir, metaDir]) {
        const dirExists = await exists(dir).catch(() => false);
        if (!dirExists) {
          await mkdir(dir, { recursive: true });
        }
      }

      // Write project.json
      await writeTextFile(
        `${vaultPath}${sep}project.json`,
        JSON.stringify(bundle.project, null, 2)
      );

      // Write chapters.json
      await writeTextFile(
        `${vaultPath}${sep}chapters.json`,
        JSON.stringify(bundle.chapters || [], null, 2)
      );

      // Write each scene as individual Markdown file in Manuscript/
      let writtenFiles = 2;
      for (let i = 0; i < bundle.scenes.length; i++) {
        const sc = bundle.scenes[i];
        const numStr = String(i + 1).padStart(2, '0');
        const cleanTitle = sanitizeFilename(sc.title);
        const fileName = `${numStr} - ${cleanTitle}.md`;
        const mdContent = sceneToMarkdownFile(sc);

        await writeTextFile(`${manuscriptDir}${sep}${fileName}`, mdContent);
        writtenFiles++;
      }

      // Write StoryBible
      await writeTextFile(`${bibleDir}${sep}entities.json`, JSON.stringify(bundle.entities || [], null, 2));
      await writeTextFile(`${bibleDir}${sep}threads.json`, JSON.stringify(bundle.threads || [], null, 2));
      await writeTextFile(`${bibleDir}${sep}timeline.json`, JSON.stringify(bundle.events || [], null, 2));
      await writeTextFile(`${bibleDir}${sep}continuity.json`, JSON.stringify(bundle.continuityIssues || [], null, 2));
      await writeTextFile(`${bibleDir}${sep}revisions.json`, JSON.stringify(bundle.revisionPasses || [], null, 2));

      // Write Cutting Room & Notes
      await writeTextFile(`${cuttingDir}${sep}cuts.json`, JSON.stringify(bundle.cuttingRoom || [], null, 2));
      await writeTextFile(`${notesDir}${sep}notes.json`, JSON.stringify(bundle.notes || [], null, 2));

      // Write Snapshots & metadata
      await writeTextFile(`${metaDir}${sep}snapshots.json`, JSON.stringify(bundle.snapshots || [], null, 2));
      await writeTextFile(`${metaDir}${sep}active_scene.txt`, bundle.activeSceneId || '');

      return {
        success: true,
        message: `Synced ${writtenFiles + 7} files to vault`,
        fileCount: writtenFiles + 7,
        timestamp
      };
    } catch (e: any) {
      console.error('Tauri vault sync failed:', e);
      let errMsg = 'File write failed';
      if (typeof e === 'string') {
        errMsg = e;
      } else if (e?.message) {
        errMsg = e.message;
      } else if (e && typeof e === 'object') {
        errMsg = e.error || e.details || JSON.stringify(e);
      }
      return { success: false, message: `Sync error: ${errMsg}`, timestamp };
    }
  }

  // 2. Browser File System Access API write
  if (isFileSystemAccessSupported()) {
    if (!activeBrowserDirHandle) {
      activeBrowserDirHandle = await getDirectoryHandleFromIDB(projectId);
    }

    if (!activeBrowserDirHandle) {
      return { success: false, message: 'No local folder connected', timestamp };
    }

    try {
      // Check/request permission
      const perm = await (activeBrowserDirHandle as any).queryPermission({ mode: 'readwrite' });
      if (perm !== 'granted') {
        const reqPerm = await (activeBrowserDirHandle as any).requestPermission({ mode: 'readwrite' });
        if (reqPerm !== 'granted') {
          return { success: false, message: 'Folder permission denied', timestamp };
        }
      }

      const root = activeBrowserDirHandle;
      const manuscriptDir = await root.getDirectoryHandle('Manuscript', { create: true });
      const bibleDir = await root.getDirectoryHandle('StoryBible', { create: true });
      const cuttingDir = await root.getDirectoryHandle('CuttingRoom', { create: true });
      const notesDir = await root.getDirectoryHandle('Notes', { create: true });
      const metaDir = await root.getDirectoryHandle('.threadline', { create: true });

      // Helper to write text to a file handle
      const writeFile = async (dir: FileSystemDirectoryHandle, name: string, content: string) => {
        const fileHandle = await dir.getFileHandle(name, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
      };

      // Write project.json and chapters.json
      await writeFile(root, 'project.json', JSON.stringify(bundle.project, null, 2));
      await writeFile(root, 'chapters.json', JSON.stringify(bundle.chapters || [], null, 2));

      // Write scenes
      let writtenFiles = 2;
      for (let i = 0; i < bundle.scenes.length; i++) {
        const sc = bundle.scenes[i];
        const numStr = String(i + 1).padStart(2, '0');
        const cleanTitle = sanitizeFilename(sc.title);
        const fileName = `${numStr} - ${cleanTitle}.md`;
        const mdContent = sceneToMarkdownFile(sc);

        await writeFile(manuscriptDir, fileName, mdContent);
        writtenFiles++;
      }

      // Write Story Bible & secondary items
      await writeFile(bibleDir, 'entities.json', JSON.stringify(bundle.entities || [], null, 2));
      await writeFile(bibleDir, 'threads.json', JSON.stringify(bundle.threads || [], null, 2));
      await writeFile(bibleDir, 'timeline.json', JSON.stringify(bundle.events || [], null, 2));
      await writeFile(bibleDir, 'continuity.json', JSON.stringify(bundle.continuityIssues || [], null, 2));
      await writeFile(bibleDir, 'revisions.json', JSON.stringify(bundle.revisionPasses || [], null, 2));
      await writeFile(cuttingDir, 'cuts.json', JSON.stringify(bundle.cuttingRoom || [], null, 2));
      await writeFile(notesDir, 'notes.json', JSON.stringify(bundle.notes || [], null, 2));
      await writeFile(metaDir, 'snapshots.json', JSON.stringify(bundle.snapshots || [], null, 2));
      await writeFile(metaDir, 'active_scene.txt', bundle.activeSceneId || '');

      return {
        success: true,
        message: `Saved ${writtenFiles + 7} files to folder`,
        fileCount: writtenFiles + 7,
        timestamp
      };
    } catch (e: any) {
      console.error('Browser FSA vault write error:', e);
      return { success: false, message: e.message || 'Write error', timestamp };
    }
  }

  // Fallback: Browser local storage (always safe)
  return {
    success: true,
    message: 'Saved to browser cache',
    timestamp
  };
}

/**
 * Import a ProjectBundle from a chosen folder
 */
export async function readBundleFromVault(projectId: string): Promise<ProjectBundle | null> {
  // 1. Tauri File System read
  if (isTauriEnvironment()) {
    const rawVaultPath = activeTauriVaultPath || localStorage.getItem(`threadline_vault_path_${projectId}`);
    if (!rawVaultPath) return null;

    const vaultPath = rawVaultPath.replace(/[/\\]+$/, '');

    try {
      const { readTextFile, readDir, exists } = await import('@tauri-apps/plugin-fs');
      const sep = vaultPath.includes('\\') ? '\\' : '/';

      const projectJsonPath = `${vaultPath}${sep}project.json`;
      if (!(await exists(projectJsonPath))) return null;

      const project = JSON.parse(await readTextFile(projectJsonPath));

      let chapters: Chapter[] = [];
      const chaptersPath = `${vaultPath}${sep}chapters.json`;
      if (await exists(chaptersPath)) {
        try {
          chapters = JSON.parse(await readTextFile(chaptersPath));
        } catch {}
      }

      // Read Manuscript/
      const scenes: Scene[] = [];
      const manuscriptDir = `${vaultPath}${sep}Manuscript`;
      if (await exists(manuscriptDir)) {
        const entries = await readDir(manuscriptDir);
        // Sort entries by filename (01 - Title.md)
        entries.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        for (let idx = 0; idx < entries.length; idx++) {
          const entry = entries[idx];
          if (entry.name && entry.name.endsWith('.md')) {
            const raw = await readTextFile(`${manuscriptDir}${sep}${entry.name}`);
            const sc = markdownFileToScene(raw, `scene-${idx + 1}`, idx);
            scenes.push(sc);
          }
        }
      }

      // Read StoryBible
      const bibleDir = `${vaultPath}${sep}StoryBible`;
      let entities = [];
      let threads = [];
      let events = [];
      let continuityIssues = [];
      let revisionPasses = [];

      if (await exists(`${bibleDir}${sep}entities.json`)) {
        entities = JSON.parse(await readTextFile(`${bibleDir}${sep}entities.json`));
      }
      if (await exists(`${bibleDir}${sep}threads.json`)) {
        threads = JSON.parse(await readTextFile(`${bibleDir}${sep}threads.json`));
      }
      if (await exists(`${bibleDir}${sep}timeline.json`)) {
        events = JSON.parse(await readTextFile(`${bibleDir}${sep}timeline.json`));
      }
      if (await exists(`${bibleDir}${sep}continuity.json`)) {
        continuityIssues = JSON.parse(await readTextFile(`${bibleDir}${sep}continuity.json`));
      }
      if (await exists(`${bibleDir}${sep}revisions.json`)) {
        revisionPasses = JSON.parse(await readTextFile(`${bibleDir}${sep}revisions.json`));
      }

      let cuttingRoom = [];
      const cuttingPath = `${vaultPath}${sep}CuttingRoom${sep}cuts.json`;
      if (await exists(cuttingPath)) {
        cuttingRoom = JSON.parse(await readTextFile(cuttingPath));
      }

      let notes = [];
      const notesPath = `${vaultPath}${sep}Notes${sep}notes.json`;
      if (await exists(notesPath)) {
        notes = JSON.parse(await readTextFile(notesPath));
      }

      let snapshots = [];
      let activeSceneId = scenes[0]?.id || 'scene-1';
      const metaDir = `${vaultPath}${sep}.threadline`;
      if (await exists(`${metaDir}${sep}snapshots.json`)) {
        snapshots = JSON.parse(await readTextFile(`${metaDir}${sep}snapshots.json`));
      }
      if (await exists(`${metaDir}${sep}active_scene.txt`)) {
        activeSceneId = (await readTextFile(`${metaDir}${sep}active_scene.txt`)).trim() || activeSceneId;
      }

      return {
        project,
        chapters,
        scenes,
        entities,
        threads,
        events,
        continuityIssues,
        revisionPasses,
        cuttingRoom,
        notes,
        snapshots,
        aiAuditLogs: [],
        activeSceneId
      };
    } catch (e) {
      console.error('Failed to read vault bundle:', e);
      return null;
    }
  }

  // 2. Browser File System Access API read
  if (isFileSystemAccessSupported()) {
    if (!activeBrowserDirHandle) {
      activeBrowserDirHandle = await getDirectoryHandleFromIDB(projectId);
    }
    if (!activeBrowserDirHandle) return null;

    try {
      const root = activeBrowserDirHandle;
      const readFile = async (dir: FileSystemDirectoryHandle, name: string): Promise<string | null> => {
        try {
          const fileHandle = await dir.getFileHandle(name);
          const file = await fileHandle.getFile();
          return await file.text();
        } catch {
          return null;
        }
      };

      const projectRaw = await readFile(root, 'project.json');
      if (!projectRaw) return null;
      const project = JSON.parse(projectRaw);

      let chapters: Chapter[] = [];
      const chaptersRaw = await readFile(root, 'chapters.json');
      if (chaptersRaw) {
        try {
          chapters = JSON.parse(chaptersRaw);
        } catch {}
      }

      // Read scenes from Manuscript/
      const scenes: Scene[] = [];
      try {
        const manuscriptDir = await root.getDirectoryHandle('Manuscript');
        const files: { name: string; content: string }[] = [];

        // Iterate through files in directory
        for await (const [name, handle] of (manuscriptDir as any).entries()) {
          if (name.endsWith('.md') && handle.kind === 'file') {
            const file = await (handle as FileSystemFileHandle).getFile();
            files.push({ name, content: await file.text() });
          }
        }

        files.sort((a, b) => a.name.localeCompare(b.name));
        files.forEach((f, idx) => {
          scenes.push(markdownFileToScene(f.content, `scene-${idx + 1}`, idx));
        });
      } catch (e) {
        console.warn('Could not read Manuscript folder:', e);
      }

      // Read StoryBible
      let entities = [];
      let threads = [];
      let events = [];
      let continuityIssues = [];
      let revisionPasses = [];
      try {
        const bibleDir = await root.getDirectoryHandle('StoryBible');
        const entRaw = await readFile(bibleDir, 'entities.json');
        if (entRaw) entities = JSON.parse(entRaw);
        const thrRaw = await readFile(bibleDir, 'threads.json');
        if (thrRaw) threads = JSON.parse(thrRaw);
        const timRaw = await readFile(bibleDir, 'timeline.json');
        if (timRaw) events = JSON.parse(timRaw);
        const conRaw = await readFile(bibleDir, 'continuity.json');
        if (conRaw) continuityIssues = JSON.parse(conRaw);
        const revRaw = await readFile(bibleDir, 'revisions.json');
        if (revRaw) revisionPasses = JSON.parse(revRaw);
      } catch {}

      let cuttingRoom = [];
      try {
        const cutDir = await root.getDirectoryHandle('CuttingRoom');
        const cutRaw = await readFile(cutDir, 'cuts.json');
        if (cutRaw) cuttingRoom = JSON.parse(cutRaw);
      } catch {}

      let notes = [];
      try {
        const nDir = await root.getDirectoryHandle('Notes');
        const nRaw = await readFile(nDir, 'notes.json');
        if (nRaw) notes = JSON.parse(nRaw);
      } catch {}

      let snapshots = [];
      let activeSceneId = scenes[0]?.id || 'scene-1';
      try {
        const mDir = await root.getDirectoryHandle('.threadline');
        const sRaw = await readFile(mDir, 'snapshots.json');
        if (sRaw) snapshots = JSON.parse(sRaw);
        const actRaw = await readFile(mDir, 'active_scene.txt');
        if (actRaw) activeSceneId = actRaw.trim() || activeSceneId;
      } catch {}

      return {
        project,
        chapters,
        scenes,
        entities,
        threads,
        events,
        continuityIssues,
        revisionPasses,
        cuttingRoom,
        notes,
        snapshots,
        aiAuditLogs: [],
        activeSceneId
      };
    } catch (e) {
      console.error('Browser FSA read bundle failed:', e);
      return null;
    }
  }

  return null;
}
