import React, { useState, useEffect, useMemo } from 'react';
import {
  Project,
  ProjectBundle,
  Scene,
  Entity,
  Thread,
  StoryEvent,
  ContinuityIssue,
  RevisionPass,
  Snapshot,
  CuttingRoomItem,
  NoteItem,
  AIAuditLog,
  Chapter
} from './types';
import {
  INITIAL_PROJECT,
  INITIAL_CHAPTERS,
  INITIAL_SCENES,
  INITIAL_ENTITIES,
  INITIAL_THREADS,
  INITIAL_EVENTS,
  INITIAL_CONTINUITY_ISSUES,
  INITIAL_REVISION_PASSES,
  INITIAL_CUTTING_ROOM,
  INITIAL_NOTES,
  INITIAL_SNAPSHOTS,
  INITIAL_PROJECTS,
  SECOND_PROJECT_BUNDLE
} from './data/initialData';
import { Navigation, ScreenType } from './components/Navigation';
import { HomeScreen } from './components/HomeScreen';
import { EditorScreen } from './components/EditorScreen';
import { StoryBibleScreen } from './components/StoryBibleScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { ContinuityInboxScreen } from './components/ContinuityInboxScreen';
import { RevisionsScreen } from './components/RevisionsScreen';
import { ExportScreen } from './components/ExportScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { NewProjectWizard } from './components/NewProjectWizard';
import { ProjectsRootScreen } from './components/ProjectsRootScreen';
import { LandingPage } from './components/LandingPage';
import { ToastProvider, useToast } from './components/Toast';
import { CommandPalette } from './components/CommandPalette';
import { VaultManagerModal } from './components/VaultManagerModal';
import { VaultInfo } from './services/storage/vaultTypes';
import { getVaultInfo, writeBundleToVault } from './services/storage/vaultStorage';
import { ensureChapters } from './utils/chapterUtils';

// Helper to retrieve a project bundle from local storage or defaults
function loadProjectBundle(projId: string): ProjectBundle {
  const saved = localStorage.getItem(`threadline_project_data_${projId}`);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.project) {
        return {
          ...parsed,
          chapters: ensureChapters(parsed.scenes || [], parsed.chapters)
        };
      }
    } catch (e) {
      console.error('Error parsing stored project bundle for ' + projId, e);
    }
  }

  // Check if it's the second sample project
  if (projId === SECOND_PROJECT_BUNDLE.project.id) {
    return {
      ...SECOND_PROJECT_BUNDLE,
      chapters: ensureChapters(SECOND_PROJECT_BUNDLE.scenes, SECOND_PROJECT_BUNDLE.chapters)
    };
  }

  // Default to Initial Project bundle with legacy fallback
  const legacyProj = localStorage.getItem('threadline_project');
  const legacyScenes = localStorage.getItem('threadline_scenes');
  const legacyChapters = localStorage.getItem('threadline_chapters');

  const resolvedScenes: Scene[] = legacyScenes ? JSON.parse(legacyScenes) : INITIAL_SCENES;
  const resolvedChapters: Chapter[] = legacyChapters ? JSON.parse(legacyChapters) : INITIAL_CHAPTERS;

  return {
    project: legacyProj ? JSON.parse(legacyProj) : INITIAL_PROJECT,
    chapters: ensureChapters(resolvedScenes, resolvedChapters),
    scenes: resolvedScenes,
    entities: localStorage.getItem('threadline_entities')
      ? JSON.parse(localStorage.getItem('threadline_entities')!)
      : INITIAL_ENTITIES,
    threads: localStorage.getItem('threadline_threads')
      ? JSON.parse(localStorage.getItem('threadline_threads')!)
      : INITIAL_THREADS,
    events: localStorage.getItem('threadline_events')
      ? JSON.parse(localStorage.getItem('threadline_events')!)
      : INITIAL_EVENTS,
    continuityIssues: localStorage.getItem('threadline_continuity')
      ? JSON.parse(localStorage.getItem('threadline_continuity')!)
      : INITIAL_CONTINUITY_ISSUES,
    revisionPasses: localStorage.getItem('threadline_revision_passes')
      ? JSON.parse(localStorage.getItem('threadline_revision_passes')!)
      : INITIAL_REVISION_PASSES,
    cuttingRoom: localStorage.getItem('threadline_cutting_room')
      ? JSON.parse(localStorage.getItem('threadline_cutting_room')!)
      : INITIAL_CUTTING_ROOM,
    notes: localStorage.getItem('threadline_notes')
      ? JSON.parse(localStorage.getItem('threadline_notes')!)
      : INITIAL_NOTES,
    snapshots: localStorage.getItem('threadline_snapshots')
      ? JSON.parse(localStorage.getItem('threadline_snapshots')!)
      : INITIAL_SNAPSHOTS,
    aiAuditLogs: localStorage.getItem('threadline_ai_logs')
      ? JSON.parse(localStorage.getItem('threadline_ai_logs')!)
      : [],
    activeSceneId: localStorage.getItem('threadline_active_scene_id') || 'scene-3'
  };
}

export default function App() {
  return (
    <ToastProvider>
      <ThreadlineApp />
    </ToastProvider>
  );
}

function ThreadlineApp() {
  const { showToast } = useToast();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Navigation State (supports /landing URL route or in-app navigation)
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (
        path === '/landing' ||
        path.startsWith('/landing/') ||
        hash === '#landing' ||
        search.includes('page=landing')
      ) {
        return 'landing';
      }
    }
    return 'home';
  });

  // Synchronize browser history / URL with /landing
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (currentScreen === 'landing') {
      if (window.location.pathname !== '/landing') {
        window.history.pushState({ screen: 'landing' }, '', '/landing');
      }
    } else {
      if (window.location.pathname === '/landing') {
        window.history.pushState({ screen: currentScreen }, '', '/');
      }
    }
  }, [currentScreen]);

  // Listen to popstate (back / forward navigation)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (
        path === '/landing' ||
        path.startsWith('/landing/') ||
        hash === '#landing' ||
        search.includes('page=landing')
      ) {
        setCurrentScreen('landing');
      } else {
        setCurrentScreen((prev) => (prev === 'landing' ? 'home' : prev));
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Multi-Project Catalog
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('threadline_projects_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    // Check if legacy single project was saved
    const legacy = localStorage.getItem('threadline_project');
    if (legacy) {
      try {
        const parsedLegacy = JSON.parse(legacy);
        return [parsedLegacy, SECOND_PROJECT_BUNDLE.project];
      } catch (e) {}
    }
    return INITIAL_PROJECTS;
  });

  // Active Project ID
  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    const saved = localStorage.getItem('threadline_active_project_id');
    if (saved) return saved;
    return INITIAL_PROJECT.id;
  });

  // Initial Bundle for active project
  const initialBundle = useMemo(() => {
    return loadProjectBundle(activeProjectId);
  }, []);

  // Active Project Data States
  const [project, setProject] = useState<Project>(initialBundle.project);
  const [chapters, setChapters] = useState<Chapter[]>(() =>
    ensureChapters(initialBundle.scenes, initialBundle.chapters)
  );
  const [scenes, setScenes] = useState<Scene[]>(initialBundle.scenes);
  const [activeSceneId, setActiveSceneId] = useState<string>(
    initialBundle.activeSceneId || project.lastActiveSceneId || scenes[0]?.id || 'scene-1'
  );
  const [entities, setEntities] = useState<Entity[]>(initialBundle.entities);
  const [threads, setThreads] = useState<Thread[]>(initialBundle.threads);
  const [events, setEvents] = useState<StoryEvent[]>(initialBundle.events);
  const [continuityIssues, setContinuityIssues] = useState<ContinuityIssue[]>(initialBundle.continuityIssues);
  const [revisionPasses, setRevisionPasses] = useState<RevisionPass[]>(initialBundle.revisionPasses);
  const [cuttingRoom, setCuttingRoom] = useState<CuttingRoomItem[]>(initialBundle.cuttingRoom);
  const [notes, setNotes] = useState<NoteItem[]>(initialBundle.notes);
  const [snapshots, setSnapshots] = useState<Snapshot[]>(initialBundle.snapshots);
  const [aiAuditLogs, setAiAuditLogs] = useState<AIAuditLog[]>(initialBundle.aiAuditLogs);

  const [lastSavedText, setLastSavedText] = useState('Saved locally');

  // Dedicated Folder Vault Storage State (Obsidian-Style)
  const [vaultInfo, setVaultInfo] = useState<VaultInfo | null>(null);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);

  // Load vault connection status when switching project
  useEffect(() => {
    if (!activeProjectId) return;
    getVaultInfo(activeProjectId).then((info) => {
      setVaultInfo(info);
      if (info && info.mode !== 'browser-cached') {
        setLastSavedText(`Vault: ${info.folderName}`);
      }
    });
  }, [activeProjectId]);

  // Debounced auto-sync to local folder vault (if connected)
  useEffect(() => {
    if (!activeProjectId || !vaultInfo || vaultInfo.mode === 'browser-cached') return;

    const timer = setTimeout(async () => {
      try {
        const currentActiveBundle: ProjectBundle = {
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
          aiAuditLogs,
          activeSceneId
        };
        const res = await writeBundleToVault(currentActiveBundle);
        if (res.success) {
          setLastSavedText(`Vault synced (${res.timestamp})`);
        }
      } catch (err) {
        console.warn('Auto-sync to vault skipped:', err);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [
    activeProjectId,
    vaultInfo,
    project,
    chapters,
    scenes,
    activeSceneId,
    entities,
    threads,
    events,
    continuityIssues,
    revisionPasses,
    cuttingRoom,
    notes,
    snapshots,
    aiAuditLogs
  ]);

  // Persist Projects List and Active ID
  useEffect(() => {
    localStorage.setItem('threadline_projects_list', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('threadline_active_project_id', activeProjectId);
  }, [activeProjectId]);

  // Persist active project bundle
  useEffect(() => {
    if (!activeProjectId) return;
    const bundle: ProjectBundle = {
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
      aiAuditLogs,
      activeSceneId
    };
    localStorage.setItem(`threadline_project_data_${activeProjectId}`, JSON.stringify(bundle));

    // Also sync legacy keys for backwards compatibility
    localStorage.setItem('threadline_project', JSON.stringify(project));
    localStorage.setItem('threadline_chapters', JSON.stringify(chapters));
    localStorage.setItem('threadline_scenes', JSON.stringify(scenes));
    localStorage.setItem('threadline_active_scene_id', activeSceneId);
    localStorage.setItem('threadline_entities', JSON.stringify(entities));
    localStorage.setItem('threadline_threads', JSON.stringify(threads));
    localStorage.setItem('threadline_events', JSON.stringify(events));
    localStorage.setItem('threadline_continuity', JSON.stringify(continuityIssues));
    localStorage.setItem('threadline_revision_passes', JSON.stringify(revisionPasses));
    localStorage.setItem('threadline_cutting_room', JSON.stringify(cuttingRoom));
    localStorage.setItem('threadline_notes', JSON.stringify(notes));
    localStorage.setItem('threadline_snapshots', JSON.stringify(snapshots));
    localStorage.setItem('threadline_ai_logs', JSON.stringify(aiAuditLogs));

    // Keep metadata in projects list synced
    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProjectId
          ? {
              ...p,
              title: project.title,
              type: project.type,
              protagonist: project.protagonist,
              genre: project.genre,
              situation: project.situation,
              targetWordCount: project.targetWordCount,
              status: project.status,
              lastActiveSceneId: activeSceneId,
              updatedAt: project.updatedAt
            }
          : p
      )
    );
  }, [
    activeProjectId,
    project,
    chapters,
    scenes,
    activeSceneId,
    entities,
    threads,
    events,
    continuityIssues,
    revisionPasses,
    cuttingRoom,
    notes,
    snapshots,
    aiAuditLogs
  ]);

  // Compute Word & Scene counts for all projects
  const projectStatsMap = useMemo(() => {
    const map: Record<string, { wordCount: number; sceneCount: number; lastSceneTitle?: string }> = {};

    projects.forEach((p) => {
      if (p.id === activeProjectId) {
        const words = scenes.reduce((acc, s) => acc + (s.wordCount || 0), 0);
        map[p.id] = {
          wordCount: words,
          sceneCount: scenes.length,
          lastSceneTitle: scenes.find((s) => s.id === activeSceneId)?.title || scenes[0]?.title
        };
      } else {
        const bundle = loadProjectBundle(p.id);
        if (bundle && Array.isArray(bundle.scenes)) {
          const words = bundle.scenes.reduce((acc, s) => acc + (s.wordCount || 0), 0);
          map[p.id] = {
            wordCount: words,
            sceneCount: bundle.scenes.length,
            lastSceneTitle: bundle.scenes[0]?.title
          };
        } else {
          map[p.id] = { wordCount: 0, sceneCount: 0 };
        }
      }
    });

    return map;
  }, [projects, activeProjectId, scenes, activeSceneId]);

  // Handler: Switch between projects
  const handleSwitchProject = (targetProjectId: string, targetScreen: ScreenType = 'home') => {
    if (targetProjectId === activeProjectId) {
      setCurrentScreen(targetScreen);
      return;
    }

    // Explicitly snapshot current active project state before switching
    const currentBundle: ProjectBundle = {
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
      aiAuditLogs,
      activeSceneId
    };
    localStorage.setItem(`threadline_project_data_${activeProjectId}`, JSON.stringify(currentBundle));

    // Load bundle for new project
    const newBundle = loadProjectBundle(targetProjectId);

    setActiveProjectId(targetProjectId);
    setProject(newBundle.project);
    setChapters(ensureChapters(newBundle.scenes, newBundle.chapters));
    setScenes(
      newBundle.scenes.length > 0
        ? newBundle.scenes
        : [
            {
              id: 'scene-1',
              title: '1. Opening Scene',
              order: 1,
              proseContent: '',
              premise: 'Opening scene.',
              characters: [],
              location: '',
              time: '',
              pov: 'Third Limited',
              notes: '',
              status: 'draft',
              wordCount: 0,
              comments: []
            }
          ]
    );
    setActiveSceneId(
      newBundle.activeSceneId || newBundle.project.lastActiveSceneId || newBundle.scenes[0]?.id || 'scene-1'
    );
    setEntities(newBundle.entities || []);
    setThreads(newBundle.threads || []);
    setEvents(newBundle.events || []);
    setContinuityIssues(newBundle.continuityIssues || []);
    setRevisionPasses(newBundle.revisionPasses || []);
    setCuttingRoom(newBundle.cuttingRoom || []);
    setNotes(newBundle.notes || []);
    setSnapshots(newBundle.snapshots || []);
    setAiAuditLogs(newBundle.aiAuditLogs || []);

    setCurrentScreen(targetScreen);
  };

  // Handler: Edit Project Metadata
  const handleEditProject = (updated: Project) => {
    setProjects((prev) => {
      const exists = prev.some((p) => p.id === updated.id);
      if (exists) {
        return prev.map((p) => (p.id === updated.id ? updated : p));
      } else {
        return [...prev, updated];
      }
    });

    if (updated.id === activeProjectId) {
      setProject(updated);
    } else {
      const bundle = loadProjectBundle(updated.id);
      bundle.project = updated;
      localStorage.setItem(`threadline_project_data_${updated.id}`, JSON.stringify(bundle));
    }
  };

  // Handler: Duplicate Project
  const handleDuplicateProject = (projId: string) => {
    const sourceBundle =
      projId === activeProjectId
        ? {
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
            aiAuditLogs,
            activeSceneId
          }
        : loadProjectBundle(projId);

    if (!sourceBundle) return;

    const newId = 'proj-' + Date.now();
    const clonedProject: Project = {
      ...sourceBundle.project,
      id: newId,
      title: `${sourceBundle.project.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const clonedBundle: ProjectBundle = {
      ...sourceBundle,
      project: clonedProject
    };

    localStorage.setItem(`threadline_project_data_${newId}`, JSON.stringify(clonedBundle));
    setProjects((prev) => [...prev, clonedProject]);
  };

  // Handler: Delete Project
  const handleDeleteProject = (projId: string) => {
    if (projects.length <= 1) {
      showToast('You must maintain at least one manuscript in Threadline.', 'warning');
      return;
    }

    localStorage.removeItem(`threadline_project_data_${projId}`);
    const remaining = projects.filter((p) => p.id !== projId);
    setProjects(remaining);
    showToast('Project deleted');

    if (projId === activeProjectId) {
      handleSwitchProject(remaining[0].id, 'projects');
    }
  };

  // Handler: Import Archive (.json)
  const handleImportProject = (importedData: any) => {
    if (!importedData) return;

    const newId = 'proj-' + Date.now();
    const baseProj = importedData.project || importedData;

    const finalProject: Project = {
      id: newId,
      title: baseProj.title || 'Imported Manuscript',
      type: baseProj.type || 'Novel',
      genre: baseProj.genre,
      protagonist: baseProj.protagonist,
      situation: baseProj.situation,
      targetWordCount: baseProj.targetWordCount || 75000,
      status: baseProj.status || 'drafting',
      lastActiveSceneId: importedData.scenes?.[0]?.id || 'scene-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newBundle: ProjectBundle = {
      project: finalProject,
      chapters: ensureChapters(
        Array.isArray(importedData.scenes) ? importedData.scenes : [],
        importedData.chapters
      ),
      scenes: Array.isArray(importedData.scenes) && importedData.scenes.length > 0
        ? importedData.scenes
        : [
            {
              id: 'scene-1',
              title: '1. Opening Scene',
              order: 1,
              proseContent: '',
              premise: 'Opening scene.',
              characters: [],
              status: 'draft',
              wordCount: 0,
              comments: []
            }
          ],
      entities: Array.isArray(importedData.entities) ? importedData.entities : [],
      threads: Array.isArray(importedData.threads) ? importedData.threads : [],
      events: Array.isArray(importedData.events) ? importedData.events : [],
      continuityIssues: Array.isArray(importedData.continuityIssues) ? importedData.continuityIssues : [],
      revisionPasses: Array.isArray(importedData.revisionPasses) ? importedData.revisionPasses : [],
      cuttingRoom: Array.isArray(importedData.cuttingRoom) ? importedData.cuttingRoom : [],
      notes: Array.isArray(importedData.notes) ? importedData.notes : [],
      snapshots: Array.isArray(importedData.snapshots) ? importedData.snapshots : [],
      aiAuditLogs: Array.isArray(importedData.aiAuditLogs) ? importedData.aiAuditLogs : [],
      activeSceneId: importedData.scenes?.[0]?.id || 'scene-1'
    };

    localStorage.setItem(`threadline_project_data_${newId}`, JSON.stringify(newBundle));
    setProjects((prev) => [...prev, finalProject]);
    handleSwitchProject(newId, 'editor');
  };

  // Handler: Export Single Project Archive
  const handleExportSingleProject = (projId: string) => {
    const bundle =
      projId === activeProjectId
        ? {
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
            aiAuditLogs,
            activeSceneId
          }
        : loadProjectBundle(projId);

    if (!bundle) return;

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `${bundle.project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_archive.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  useEffect(() => {
    localStorage.setItem('threadline_scenes', JSON.stringify(scenes));
  }, [scenes]);

  useEffect(() => {
    localStorage.setItem('threadline_active_scene_id', activeSceneId);
  }, [activeSceneId]);

  useEffect(() => {
    localStorage.setItem('threadline_entities', JSON.stringify(entities));
  }, [entities]);

  useEffect(() => {
    localStorage.setItem('threadline_threads', JSON.stringify(threads));
  }, [threads]);

  useEffect(() => {
    localStorage.setItem('threadline_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('threadline_continuity', JSON.stringify(continuityIssues));
  }, [continuityIssues]);

  useEffect(() => {
    localStorage.setItem('threadline_revision_passes', JSON.stringify(revisionPasses));
  }, [revisionPasses]);

  useEffect(() => {
    localStorage.setItem('threadline_cutting_room', JSON.stringify(cuttingRoom));
  }, [cuttingRoom]);

  useEffect(() => {
    localStorage.setItem('threadline_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('threadline_snapshots', JSON.stringify(snapshots));
  }, [snapshots]);

  useEffect(() => {
    localStorage.setItem('threadline_ai_logs', JSON.stringify(aiAuditLogs));
  }, [aiAuditLogs]);

  // Find active scene object
  const activeScene = scenes.find((s) => s.id === activeSceneId) || scenes[0] || {
    id: 'scene-1',
    title: '1. Opening Scene',
    order: 1,
    proseContent: '',
    premise: '',
    characters: [],
    location: '',
    time: '',
    pov: '',
    status: 'draft',
    wordCount: 0,
    notes: '',
    comments: []
  };

  // Scene Update Handler with automatic Word Count Calculation
  const handleUpdateActiveScene = (updatedFields: Partial<Scene>) => {
    setLastSavedText('Saving...');

    setScenes((prev) =>
      prev.map((s) => {
        if (s.id !== activeScene.id) return s;
        const merged = { ...s, ...updatedFields };
        if (updatedFields.proseContent !== undefined) {
          const words = updatedFields.proseContent.trim()
            ? updatedFields.proseContent.trim().split(/\s+/).filter(Boolean).length
            : 0;
          merged.wordCount = words;
        }
        return merged;
      })
    );

    // Update project timestamp
    setProject((prev) => ({
      ...prev,
      lastActiveSceneId: activeScene.id,
      updatedAt: new Date().toISOString()
    }));

    setTimeout(() => {
      setLastSavedText('Saved locally');
    }, 400);
  };

  // Add a new scene
  const handleAddScene = () => {
    const nextOrder = scenes.length + 1;
    const newId = 'scene-' + Date.now();
    const activeChap = chapters.find(
      (c) => c.id === activeScene.chapterId || c.number === activeScene.chapterNumber || c.sceneIds.includes(activeScene.id)
    ) || chapters[chapters.length - 1];

    const newScene: Scene = {
      id: newId,
      title: `${nextOrder}. Next Chapter Beat`,
      order: nextOrder,
      chapterId: activeChap?.id,
      chapterNumber: activeChap?.number,
      chapterTitle: activeChap?.title,
      actOrPhase: activeChap?.actOrPhase,
      proseContent: '',
      premise: 'Objective and dramatic tension for this beat.',
      characters: project.protagonist ? [project.protagonist] : [],
      location: 'Primary Setting',
      time: 'Next Day',
      pov: project.protagonist ? `${project.protagonist} (Third Limited)` : 'Third Limited',
      status: 'draft',
      wordCount: 0,
      notes: '',
      comments: []
    };

    setScenes((prev) => [...prev, newScene]);
    if (activeChap) {
      setChapters((prev) =>
        prev.map((c) =>
          c.id === activeChap.id
            ? { ...c, sceneIds: [...(c.sceneIds || []), newId] }
            : c
        )
      );
    }
    setActiveSceneId(newId);
    setCurrentScreen('editor');
    showToast(`Scene created: "${newScene.title}"`);
  };

  // Chapter management handlers
  const handleAddChapter = (title?: string, actOrPhase?: string) => {
    const nextNum = chapters.length + 1;
    const newChapId = 'chap-' + Date.now();
    const newChapter: Chapter = {
      id: newChapId,
      number: nextNum,
      title: title || `Chapter ${nextNum}`,
      actOrPhase: actOrPhase || (scenes[0]?.actOrPhase || 'Act I'),
      sceneIds: []
    };
    setChapters((prev) => [...prev, newChapter]);
    showToast(`Created Chapter ${nextNum}: "${newChapter.title}"`);
    return newChapId;
  };

  const handleUpdateChapter = (chapterId: string, fields: Partial<Chapter>) => {
    setChapters((prev) =>
      prev.map((c) => (c.id === chapterId ? { ...c, ...fields } : c))
    );
    if (fields.title || fields.actOrPhase || fields.number !== undefined) {
      setScenes((prev) =>
        prev.map((s) => {
          if (s.chapterId === chapterId) {
            return {
              ...s,
              ...(fields.title ? { chapterTitle: fields.title } : {}),
              ...(fields.actOrPhase ? { actOrPhase: fields.actOrPhase } : {}),
              ...(fields.number !== undefined ? { chapterNumber: fields.number } : {})
            };
          }
          return s;
        })
      );
    }
  };

  const handleDeleteChapter = (chapterId: string) => {
    const chapToDelete = chapters.find((c) => c.id === chapterId);
    if (!chapToDelete) return;
    setScenes((prev) =>
      prev.map((s) =>
        s.chapterId === chapterId
          ? { ...s, chapterId: undefined, chapterTitle: undefined, chapterNumber: undefined }
          : s
      )
    );
    setChapters((prev) => {
      const remaining = prev.filter((c) => c.id !== chapterId);
      return remaining.map((c, idx) => ({ ...c, number: idx + 1 }));
    });
    showToast(`Deleted Chapter: "${chapToDelete.title}"`);
  };

  const handleAddSceneToChapter = (chapterId: string, customTitle?: string) => {
    const targetChapter = chapters.find((c) => c.id === chapterId);
    const nextOrder = scenes.length + 1;
    const newSceneId = 'scene-' + Date.now();
    const sceneTitle = customTitle || `${nextOrder}. New Scene`;
    const newScene: Scene = {
      id: newSceneId,
      title: sceneTitle,
      order: nextOrder,
      chapterId,
      chapterNumber: targetChapter?.number,
      chapterTitle: targetChapter?.title,
      actOrPhase: targetChapter?.actOrPhase,
      proseContent: '',
      premise: `Drafting in Chapter ${targetChapter?.number || ''}: ${targetChapter?.title || ''}`,
      characters: project.protagonist ? [project.protagonist] : [],
      location: 'Primary Setting',
      time: 'Day 1',
      pov: project.protagonist ? `${project.protagonist} (Third Limited)` : 'Third Limited',
      status: 'draft',
      wordCount: 0,
      notes: '',
      comments: []
    };

    setScenes((prev) => [...prev, newScene]);
    setChapters((prev) =>
      prev.map((c) =>
        c.id === chapterId
          ? { ...c, sceneIds: [...(c.sceneIds || []), newSceneId] }
          : c
      )
    );
    setActiveSceneId(newSceneId);
    showToast(`Added scene to Chapter ${targetChapter?.number || ''}`);
  };

  // Duplicate an existing scene
  const handleDuplicateScene = (sceneId: string) => {
    const target = scenes.find((s) => s.id === sceneId);
    if (!target) return;
    const nextOrder = scenes.length + 1;
    const newId = 'scene-' + Date.now();
    const dup: Scene = {
      ...target,
      id: newId,
      title: `${target.title} (Copy)`,
      order: nextOrder
    };
    setScenes((prev) => [...prev, dup]);
    setActiveSceneId(newId);
    showToast('Scene duplicated');
  };

  // Delete a scene safely
  const handleDeleteScene = (sceneId: string) => {
    if (scenes.length <= 1) {
      showToast('Cannot delete the only scene in manuscript', 'warning');
      return;
    }
    const remaining = scenes.filter((s) => s.id !== sceneId);
    const reindexed = remaining.map((s, idx) => ({ ...s, order: idx + 1 }));
    setScenes(reindexed);
    setActiveSceneId(reindexed[0].id);
    showToast('Scene deleted');
  };

  // Snapshots Handlers
  const handleTakeSnapshot = (name: string) => {
    const newSnapshot: Snapshot = {
      id: 'snap-' + Date.now(),
      name,
      timestamp: new Date().toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      scenesSummary: scenes.map((s) => ({
        id: s.id,
        title: s.title,
        wordCount: s.wordCount,
        proseContent: s.proseContent
      }))
    };
    setSnapshots((prev) => [newSnapshot, ...prev]);
  };

  const handleRestoreSnapshot = (snapshot: Snapshot) => {
    // 1. Take safety backup snapshot of current state
    handleTakeSnapshot(`Auto-backup before restoring "${snapshot.name}"`);

    // 2. Restore scenes from snapshot
    const restoredScenes: Scene[] = snapshot.scenesSummary.map((sum, idx) => {
      const existing = scenes.find((s) => s.id === sum.id);
      return {
        id: sum.id,
        title: sum.title,
        order: idx + 1,
        proseContent: sum.proseContent,
        premise: existing?.premise || '',
        characters: existing?.characters || [],
        location: existing?.location || '',
        time: existing?.time || '',
        pov: existing?.pov || '',
        status: existing?.status || 'revised',
        wordCount: sum.wordCount,
        notes: existing?.notes || '',
        comments: existing?.comments || []
      };
    });

    setScenes(restoredScenes);
    setActiveSceneId(restoredScenes[0]?.id || 'scene-1');
    setCurrentScreen('editor');
  };

  // Restore Cutting Room Item directly to active scene
  const handleRestoreCuttingRoomItem = (item: CuttingRoomItem) => {
    setScenes((prev) =>
      prev.map((s) => {
        if (s.id !== activeScene.id) return s;
        const restoredProse = s.proseContent + '\n\n' + item.text;
        return {
          ...s,
          proseContent: restoredProse,
          wordCount: restoredProse.trim().split(/\s+/).filter(Boolean).length
        };
      })
    );
    // Remove from cutting room
    setCuttingRoom((prev) => prev.filter((c) => c.id !== item.id));
    setCurrentScreen('editor');
  };

  // Convert Cutting Room Item to Scratchpad Note
  const handleConvertCutToNote = (item: CuttingRoomItem) => {
    const newNote: NoteItem = {
      id: 'note-' + Date.now(),
      title: `Clipped from ${item.originalSceneTitle}`,
      content: item.text,
      category: 'idea',
      sceneId: activeScene.id,
      resolved: false
    };
    setNotes((prev) => [newNote, ...prev]);
    setCuttingRoom((prev) => prev.filter((c) => c.id !== item.id));
  };

  // Create Note from Continuity issue
  const handleCreateNoteFromIssue = (issue: ContinuityIssue) => {
    const newNote: NoteItem = {
      id: 'note-' + Date.now(),
      title: `Continuity: ${issue.title}`,
      content: `${issue.question}\n\nPassage 1: "${issue.passageA.excerpt}"\nPassage 2: "${issue.passageB.excerpt}"`,
      category: 'question',
      sceneId: issue.passageA.sceneId,
      resolved: false
    };
    setNotes((prev) => [newNote, ...prev]);
    showToast('Inquiry added as a private note in your Scratchpad');
  };

  // Reset demo project
  const handleResetToDemo = () => {
    setProject(INITIAL_PROJECT);
    setChapters(INITIAL_CHAPTERS);
    setScenes(INITIAL_SCENES);
    setActiveSceneId('scene-3');
    setEntities(INITIAL_ENTITIES);
    setThreads(INITIAL_THREADS);
    setEvents(INITIAL_EVENTS);
    setContinuityIssues(INITIAL_CONTINUITY_ISSUES);
    setRevisionPasses(INITIAL_REVISION_PASSES);
    setCuttingRoom(INITIAL_CUTTING_ROOM);
    setNotes(INITIAL_NOTES);
    setSnapshots(INITIAL_SNAPSHOTS);
    setAiAuditLogs([]);
    setCurrentScreen('home');
    showToast('Demo project restored');
  };

  const handleClearAllData = () => {
    localStorage.clear();
    const blankProj: Project = {
      id: 'proj-new',
      title: 'Untitled Story',
      type: 'Novel',
      targetWordCount: 50000,
      status: 'drafting',
      lastActiveSceneId: 'scene-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setProjects([blankProj]);
    setActiveProjectId(blankProj.id);
    setProject(blankProj);
    setChapters([
      {
        id: 'chap-1',
        number: 1,
        title: 'Chapter 1: The Beginning',
        actOrPhase: 'Act I',
        sceneIds: ['scene-1']
      }
    ]);
    setScenes([
      {
        id: 'scene-1',
        title: '1. Opening Beat',
        order: 1,
        proseContent: '',
        premise: 'Opening scene.',
        characters: [],
        location: 'Primary Setting',
        time: 'Day 1',
        pov: 'Third Person',
        status: 'draft',
        wordCount: 0,
        notes: '',
        comments: []
      }
    ]);
    setActiveSceneId('scene-1');
    setEntities([]);
    setThreads([]);
    setEvents([]);
    setContinuityIssues([]);
    setRevisionPasses([]);
    setCuttingRoom([]);
    setNotes([]);
    setSnapshots([]);
    setAiAuditLogs([]);
    setCurrentScreen('editor');
    showToast('Workspace reset to blank state');
  };

  const handleExportFullArchive = () => {
    const archive = {
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
      aiAuditLogs,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(archive, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.toLowerCase().replace(/\s+/g, '_')}_full_archive.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const openContinuityCount = continuityIssues.filter((i) => i.status === 'open').length;

  const currentBundleForVault: ProjectBundle = {
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
    aiAuditLogs,
    activeSceneId
  };

  const handleReloadBundleFromVault = (newBundle: ProjectBundle) => {
    setProject(newBundle.project);
    const normalizedChapters = ensureChapters(newBundle.scenes, newBundle.chapters);
    setChapters(normalizedChapters);
    setScenes(newBundle.scenes);
    setEntities(newBundle.entities || []);
    setThreads(newBundle.threads || []);
    setEvents(newBundle.events || []);
    setContinuityIssues(newBundle.continuityIssues || []);
    setRevisionPasses(newBundle.revisionPasses || []);
    setCuttingRoom(newBundle.cuttingRoom || []);
    setNotes(newBundle.notes || []);
    setSnapshots(newBundle.snapshots || []);
    setActiveSceneId(newBundle.activeSceneId || newBundle.scenes[0]?.id || 'scene-1');
    showToast(`Reloaded manuscript from ${vaultInfo?.folderName || 'folder'}!`);
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#221E18] flex flex-col font-sans">
      {/* Top Navigation Bar (Hidden in new project wizard and on the dedicated landing page) */}
      {currentScreen !== 'new-project' && currentScreen !== 'landing' && (
        <Navigation
          currentScreen={currentScreen}
          onNavigate={(screen) => setCurrentScreen(screen)}
          openContinuityCount={openContinuityCount}
          projectTitle={project.title}
          allProjects={projects}
          activeProjectId={activeProjectId}
          onSelectProject={(id) => handleSwitchProject(id, 'editor')}
          onStartNewProject={() => setCurrentScreen('new-project')}
          onOpenSearch={() => setIsCommandPaletteOpen(true)}
          vaultInfo={vaultInfo}
          onOpenVaultManager={() => setIsVaultModalOpen(true)}
        />
      )}

      {/* Screen Routing */}
      <main className="flex-1 flex flex-col">
        {currentScreen === 'projects' && (
          <ProjectsRootScreen
            projects={projects}
            activeProjectId={activeProjectId}
            projectStatsMap={projectStatsMap}
            onSelectProject={(id, target) => handleSwitchProject(id, target || 'editor')}
            onCreateNewProject={() => setCurrentScreen('new-project')}
            onEditProject={handleEditProject}
            onDuplicateProject={handleDuplicateProject}
            onDeleteProject={handleDeleteProject}
            onImportProject={handleImportProject}
            onExportProject={handleExportSingleProject}
            onOpenVaultManager={() => setIsVaultModalOpen(true)}
          />
        )}

        {currentScreen === 'home' && (
          <HomeScreen
            project={project}
            scenes={scenes}
            chapters={chapters}
            activeScene={activeScene}
            revisionPasses={revisionPasses}
            continuityIssues={continuityIssues}
            notes={notes}
            entities={entities}
            onContinueWriting={() => setCurrentScreen('editor')}
            onNavigateToScene={(sceneId) => {
              setActiveSceneId(sceneId);
              setCurrentScreen('editor');
            }}
            onNavigateToRevisions={() => setCurrentScreen('revisions')}
            onNavigateToContinuity={() => setCurrentScreen('continuity')}
            onNavigateToBible={() => setCurrentScreen('bible')}
            onStartNewProject={() => setCurrentScreen('new-project')}
            onNavigateToProjects={() => setCurrentScreen('projects')}
            onAddScene={handleAddScene}
          />
        )}

        {currentScreen === 'editor' && (
          <EditorScreen
            scene={activeScene}
            allScenes={scenes}
            chapters={chapters}
            entities={entities}
            threads={threads}
            lastSavedText={lastSavedText}
            onUpdateScene={handleUpdateActiveScene}
            onNavigateToScene={(sceneId) => setActiveSceneId(sceneId)}
            onSendToCuttingRoom={(item) => {
              setCuttingRoom((prev) => [item, ...prev]);
              showToast('Excerpt moved to Cutting Room');
            }}
            onAddEntity={(entity) => {
              setEntities((prev) => [...prev, entity]);
              showToast(`Added "${entity.name}" to Story Bible`);
            }}
            onLogAiAction={(log) => setAiAuditLogs((prev) => [log, ...prev])}
            onOpenStoryBible={() => setCurrentScreen('bible')}
            onDuplicateScene={handleDuplicateScene}
            onDeleteScene={handleDeleteScene}
            onAddChapter={handleAddChapter}
            onUpdateChapter={handleUpdateChapter}
            onDeleteChapter={handleDeleteChapter}
            onAddSceneToChapter={handleAddSceneToChapter}
          />
        )}

        {currentScreen === 'bible' && (
          <StoryBibleScreen
            entities={entities}
            threads={threads}
            events={events}
            scenes={scenes}
            onUpdateEntity={(updated) =>
              setEntities((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
            }
            onCreateEntity={(newEnt) => {
              setEntities((prev) => [...prev, newEnt]);
              showToast(`Created entity "${newEnt.name}"`);
            }}
            onDeleteEntity={(id) => {
              setEntities((prev) => prev.filter((e) => e.id !== id));
              showToast('Entity removed');
            }}
            onUpdateThread={(updated) =>
              setThreads((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
            }
            onCreateThread={(newTh) => {
              setThreads((prev) => [...prev, newTh]);
              showToast('Thread created');
            }}
            onDeleteThread={(id) => {
              setThreads((prev) => prev.filter((t) => t.id !== id));
              showToast('Thread deleted');
            }}
            onUpdateEvent={(updated) =>
              setEvents((prev) => prev.map((ev) => (ev.id === updated.id ? updated : ev)))
            }
            onCreateEvent={(newEv) => {
              setEvents((prev) => [...prev, newEv]);
              showToast('Event recorded');
            }}
            onDeleteEvent={(id) => {
              setEvents((prev) => prev.filter((ev) => ev.id !== id));
              showToast('Event removed');
            }}
            onNavigateToScene={(sceneId) => {
              setActiveSceneId(sceneId);
              setCurrentScreen('editor');
            }}
          />
        )}

        {currentScreen === 'dashboard' && (
          <DashboardScreen
            project={project}
            scenes={scenes}
            threads={threads}
            notes={notes}
            entities={entities}
            onNavigateToScene={(sceneId) => {
              setActiveSceneId(sceneId);
              setCurrentScreen('editor');
            }}
            onReorderScenes={(reordered) => setScenes(reordered)}
            onAddScene={handleAddScene}
            onUpdateNote={(updated) =>
              setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)))
            }
            onAddNote={() => {
              const newN: NoteItem = {
                id: 'note-' + Date.now(),
                title: 'New Research Inquiry',
                content: 'Notes, questions, or historical details to explore...',
                category: 'question',
                resolved: false
              };
              setNotes((prev) => [...prev, newN]);
              showToast('Research inquiry added');
            }}
          />
        )}

        {currentScreen === 'continuity' && (
          <ContinuityInboxScreen
            issues={continuityIssues}
            scenes={scenes}
            onUpdateIssue={(updated) => {
              setContinuityIssues((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
              showToast(`Inquiry marked as ${updated.status}`);
            }}
            onNavigateToScene={(sceneId) => {
              setActiveSceneId(sceneId);
              setCurrentScreen('editor');
            }}
            onCreateNoteFromIssue={handleCreateNoteFromIssue}
            onCreateIssue={(issue) => {
              setContinuityIssues((prev) => [issue, ...prev]);
              showToast('Continuity inquiry logged');
            }}
          />
        )}

        {currentScreen === 'revisions' && (
          <RevisionsScreen
            revisionPasses={revisionPasses}
            snapshots={snapshots}
            cuttingRoom={cuttingRoom}
            scenes={scenes}
            onUpdatePasses={(passes) => setRevisionPasses(passes)}
            onTakeSnapshot={handleTakeSnapshot}
            onRestoreSnapshot={handleRestoreSnapshot}
            onRestoreCuttingRoomItem={handleRestoreCuttingRoomItem}
            onDeleteCuttingRoomItem={(id) =>
              setCuttingRoom((prev) => prev.filter((c) => c.id !== id))
            }
            onConvertCutToNote={handleConvertCutToNote}
            onNavigateToScene={(sceneId) => {
              setActiveSceneId(sceneId);
              setCurrentScreen('editor');
            }}
          />
        )}

        {currentScreen === 'export' && (
          <ExportScreen
            project={project}
            scenes={scenes}
            entities={entities}
            threads={threads}
          />
        )}

        {currentScreen === 'settings' && (
          <SettingsScreen
            aiAuditLogs={aiAuditLogs}
            onResetToDemo={handleResetToDemo}
            onClearAllData={handleClearAllData}
            onExportFullArchive={handleExportFullArchive}
            vaultInfo={vaultInfo}
            onOpenVaultManager={() => setIsVaultModalOpen(true)}
          />
        )}

        {currentScreen === 'new-project' && (
          <NewProjectWizard
            onCancel={() => setCurrentScreen('projects')}
            onCreateProject={(newBundle) => {
              // Flush current project bundle
              const oldBundle: ProjectBundle = {
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
                aiAuditLogs,
                activeSceneId
              };
              localStorage.setItem(`threadline_project_data_${activeProjectId}`, JSON.stringify(oldBundle));

              const normalizedNewChapters = ensureChapters(newBundle.scenes, newBundle.chapters);
              const projectBundleToStore: ProjectBundle = {
                ...newBundle,
                chapters: normalizedNewChapters
              };

              // Register new project in state and bundle storage
              localStorage.setItem(`threadline_project_data_${newBundle.project.id}`, JSON.stringify(projectBundleToStore));

              setProjects((prev) => [...prev, newBundle.project]);
              setActiveProjectId(newBundle.project.id);
              setProject(newBundle.project);
              setChapters(normalizedNewChapters);
              setScenes(newBundle.scenes);
              setActiveSceneId(newBundle.activeSceneId || newBundle.scenes[0]?.id || 'scene-1');
              setEntities(newBundle.entities);
              setThreads(newBundle.threads);
              setEvents(newBundle.events);
              setContinuityIssues(newBundle.continuityIssues);
              setRevisionPasses(newBundle.revisionPasses);
              setCuttingRoom(newBundle.cuttingRoom);
              setNotes(newBundle.notes);
              setSnapshots(newBundle.snapshots);
              setAiAuditLogs(newBundle.aiAuditLogs);
              setCurrentScreen('editor');
              showToast(`Created project with ${newBundle.scenes.length} framework beats: "${newBundle.project.title}"`);
            }}
          />
        )}
        {currentScreen === 'landing' && (
          <LandingPage
            onEnterStudio={(targetScreen = 'home') => setCurrentScreen(targetScreen)}
            onOpenSampleProject={(projId) => handleSwitchProject(projId, 'editor')}
          />
        )}
      </main>

      {/* Global Command Palette (⌘K / Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        scenes={scenes}
        entities={entities}
        threads={threads}
        onNavigateToScreen={(screen) => setCurrentScreen(screen)}
        onNavigateToScene={(sceneId) => {
          setActiveSceneId(sceneId);
          setCurrentScreen('editor');
        }}
        onAddScene={handleAddScene}
      />

      {/* Dedicated Local Project Folder / Vault Manager Modal */}
      <VaultManagerModal
        isOpen={isVaultModalOpen}
        onClose={() => setIsVaultModalOpen(false)}
        currentBundle={currentBundleForVault}
        onReloadBundleFromVault={handleReloadBundleFromVault}
        onVaultStatusChange={(info) => setVaultInfo(info)}
      />
    </div>
  );
}
