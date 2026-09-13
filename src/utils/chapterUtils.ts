import { Chapter, Scene, Project } from '../types';

/**
 * Determines whether a given scene belongs to a specified chapter.
 * Enforces a strict single-chapter ownership hierarchy to prevent scene duplication across chapters:
 * 1. If the scene has an explicit `chapterId`, that is the primary source of truth. It belongs to
 *    the chapter if and only if `scene.chapterId === chapter.id`.
 * 2. If the scene lacks a `chapterId`, but the chapter's `sceneIds` contains `scene.id`, it belongs to this chapter.
 * 3. Fallback: If neither `chapterId` nor `sceneIds` provides a match, matches by `chapterNumber`
 *    provided the scene does NOT specify a different `chapterId`.
 */
export function isSceneInChapter(scene: Scene, chapter: Chapter): boolean {
  if (!scene || !chapter) return false;
  // 1. Primary rule: explicit chapterId
  if (scene.chapterId) {
    return scene.chapterId === chapter.id;
  }
  // 2. Secondary rule: chapter's registered sceneIds (only when scene has no explicit chapterId)
  if (chapter.sceneIds && chapter.sceneIds.includes(scene.id)) {
    return true;
  }
  // 3. Fallback rule: chapterNumber if scene has no conflicting chapterId
  if (scene.chapterNumber !== undefined && chapter.number !== undefined) {
    return scene.chapterNumber === chapter.number;
  }
  return false;
}

/**
 * Ensures that a project bundle or scene collection always has a clean, consistent list of Chapters.
 * If explicit chapters exist, it validates their scene mappings.
 * If scenes already have chapter attributes, it synthesizes the chapter records.
 * Otherwise, it creates chapter groupings automatically.
 */
export function ensureChapters(
  dataOrScenes: { chapters?: Chapter[]; scenes: Scene[]; project?: Project } | Scene[],
  maybeChapters?: Chapter[]
): Chapter[] {
  let chapters: Chapter[] | undefined;
  let scenes: Scene[] = [];

  if (Array.isArray(dataOrScenes)) {
    scenes = dataOrScenes;
    chapters = maybeChapters;
  } else if (dataOrScenes && typeof dataOrScenes === 'object') {
    scenes = dataOrScenes.scenes || [];
    chapters = dataOrScenes.chapters;
  }

  if (chapters && chapters.length > 0) {
    // Sync sceneIds in chapters to ensure consistency with current scenes
    return chapters.map((chap, idx) => {
      // Find scenes that strictly belong to this chapter
      const matchingScenes = scenes.filter((s) => s && isSceneInChapter(s, chap));
      const sceneIds = matchingScenes.map((s) => s.id);

      return {
        ...chap,
        number: chap.number || idx + 1,
        actOrPhase: chap.actOrPhase?.trim() || 'Act I: Setup',
        sceneIds
      };
    });
  }

  // Synthesize from scenes if scenes have chapter info
  const chapterMap = new Map<string, Chapter>();
  let currentChapterNum = 1;

  scenes.forEach((scene, index) => {
    if (!scene) return;
    const chapKey = scene.chapterId || (scene.chapterNumber ? `chap-${scene.chapterNumber}` : undefined);
    const sceneTitle = scene.title || `Scene ${index + 1}`;
    
    if (chapKey && chapterMap.has(chapKey)) {
      const existing = chapterMap.get(chapKey)!;
      if (!existing.sceneIds.includes(scene.id)) {
        existing.sceneIds.push(scene.id);
      }
    } else if (chapKey) {
      chapterMap.set(chapKey, {
        id: chapKey,
        number: scene.chapterNumber || currentChapterNum++,
        title: scene.chapterTitle || `Chapter ${scene.chapterNumber || currentChapterNum}`,
        actOrPhase: scene.actOrPhase || 'Act I',
        sceneIds: [scene.id]
      });
    } else {
      // Fallback: Group scene into a chapter
      const fallbackId = `chap-${index + 1}`;
      chapterMap.set(fallbackId, {
        id: fallbackId,
        number: index + 1,
        title: sceneTitle.replace(/^(\d+\.|\w+\s\w+:)\s*/i, '') || `Chapter ${index + 1}`,
        actOrPhase: scene.actOrPhase || 'Act I',
        sceneIds: [scene.id]
      });
    }
  });

  if (chapterMap.size > 0) {
    return Array.from(chapterMap.values()).sort((a, b) => a.number - b.number);
  }

  // Default empty chapter if no scenes exist
  return [
    {
      id: 'chap-1',
      number: 1,
      title: 'Chapter 1: The Beginning',
      actOrPhase: 'Act I',
      sceneIds: scenes.map((s) => s.id)
    }
  ];
}

/**
 * Calculates total word count for all scenes in a chapter.
 * Flexible signature accepting either (chapter, scenes) or (scenes, chapter).
 */
export function calculateChapterWordCount(a: Chapter | Scene[], b: Chapter | Scene[]): number {
  const chapter = (Array.isArray(a) ? b : a) as Chapter;
  const allScenes = (Array.isArray(a) ? a : b) as Scene[];
  if (!chapter || !Array.isArray(allScenes)) return 0;
  return allScenes
    .filter((s) => isSceneInChapter(s, chapter))
    .reduce((acc, s) => acc + (s.wordCount || 0), 0);
}

/**
 * Determines aggregate status for a chapter based on its scenes.
 * Flexible signature accepting either (chapter, scenes) or (scenes, chapter).
 */
export function getChapterStatus(a: Chapter | Scene[], b: Chapter | Scene[]): 'draft' | 'revised' | 'complete' {
  const chapter = (Array.isArray(a) ? b : a) as Chapter;
  const allScenes = (Array.isArray(a) ? a : b) as Scene[];
  if (!chapter || !Array.isArray(allScenes)) return 'draft';
  const chapterScenes = allScenes.filter((s) => isSceneInChapter(s, chapter));
  if (chapterScenes.length === 0) return 'draft';
  if (chapterScenes.every((s) => s.status === 'complete')) return 'complete';
  if (chapterScenes.some((s) => s.status === 'revised' || s.status === 'complete')) return 'revised';
  return 'draft';
}

/**
 * Returns scenes belonging to a chapter in display order.
 * Flexible signature accepting either (chapter, scenes) or (scenes, chapter).
 */
export function getScenesForChapter(a: Chapter | Scene[], b: Chapter | Scene[]): Scene[] {
  const chapter = (Array.isArray(a) ? b : a) as Chapter;
  const allScenes = (Array.isArray(a) ? a : b) as Scene[];
  if (!chapter || !Array.isArray(allScenes)) return [];
  return allScenes
    .filter((s) => isSceneInChapter(s, chapter))
    .sort((x, y) => (x.order || 0) - (y.order || 0));
}

/**
 * Returns scenes that are NOT assigned to any registered chapter.
 * Prevents "missing pieces" on the corkboard when scenes lack chapter mappings.
 */
export function getUnassignedScenes(scenes: Scene[], chapters: Chapter[]): Scene[] {
  if (!Array.isArray(scenes)) return [];
  if (!Array.isArray(chapters) || chapters.length === 0) return scenes;

  return scenes.filter((s) => {
    return !chapters.some((c) => isSceneInChapter(s, c));
  });
}

/**
 * Extracts a normalized, ordered list of all unique Acts / Narrative Phases
 * across the project's chapters and scenes.
 */
export function getAllActs(chapters: Chapter[], scenes: Scene[]): string[] {
  const acts: string[] = [];
  const addAct = (act?: string) => {
    const trimmed = act?.trim();
    if (trimmed && !acts.includes(trimmed)) {
      acts.push(trimmed);
    }
  };

  // Add from chapters first (preserves narrative order)
  chapters.forEach((c) => addAct(c.actOrPhase));
  // Then add any custom acts present in scenes
  scenes.forEach((s) => addAct(s.actOrPhase));

  if (acts.length === 0) {
    return ['Act I: Setup', 'Act II: Confrontation', 'Act III: Resolution'];
  }
  return acts;
}

/**
 * Returns all scenes mapped to a specific Act or Narrative Phase.
 * Falls back to checking the parent chapter's act if scene has no explicit act.
 */
export function getScenesForAct(allScenes: Scene[], actName: string, chapters: Chapter[]): Scene[] {
  if (!Array.isArray(allScenes)) return [];
  const targetAct = (actName || '').trim().toLowerCase();
  const chapterActMap = new Map<string, string>();
  (chapters || []).forEach((c) => {
    if (c?.actOrPhase) {
      chapterActMap.set(c.id, c.actOrPhase.trim().toLowerCase());
      chapterActMap.set(String(c.number), c.actOrPhase.trim().toLowerCase());
    }
  });

  return allScenes
    .filter((s) => {
      if (!s) return false;
      const sceneAct = s.actOrPhase?.trim().toLowerCase();
      if (sceneAct) {
        return sceneAct === targetAct;
      }
      // Fall back to chapter's act
      if (s.chapterId && chapterActMap.has(s.chapterId)) {
        return chapterActMap.get(s.chapterId) === targetAct;
      }
      if (s.chapterNumber !== undefined && chapterActMap.has(String(s.chapterNumber))) {
        return chapterActMap.get(String(s.chapterNumber)) === targetAct;
      }
      return false;
    })
    .sort((x, y) => (x.order || 0) - (y.order || 0));
}

/**
 * Returns all chapters categorized under a specific Act.
 */
export function getChaptersForAct(chapters: Chapter[], actName: string): Chapter[] {
  if (!Array.isArray(chapters)) return [];
  const targetAct = (actName || '').trim().toLowerCase();
  return chapters.filter((c) => (c?.actOrPhase?.trim().toLowerCase() || 'act i: setup') === targetAct);
}

export interface DramaticBeatDefinition {
  id: string;
  name: string;
  act: string;
  description: string;
  defaultOrder: number;
}

/**
 * Canonical 12 Dramatic Beats for storytelling architectures (Three-Act, Save the Cat, Hero's Journey).
 */
export const STANDARD_DRAMATIC_BEATS: DramaticBeatDefinition[] = [
  {
    id: 'beat-1',
    name: '1. Opening Image & Status Quo',
    act: 'Act I: Setup',
    description: 'Establish protagonist baseline world, flaws, rhythm, and the initial emotional state before disruption.',
    defaultOrder: 1
  },
  {
    id: 'beat-2',
    name: '2. The Catalyst & Inciting Incident',
    act: 'Act I: Setup',
    description: 'An unexpected messenger, artifact, or disruption breaks the status quo and introduces the dilemma.',
    defaultOrder: 2
  },
  {
    id: 'beat-3',
    name: '3. Refusal of the Call & Debate',
    act: 'Act I: Setup',
    description: 'The protagonist hesitates, assesses risks, or attempts to preserve the known world before committing.',
    defaultOrder: 3
  },
  {
    id: 'beat-4',
    name: '4. Crossing the Threshold (Plot Point 1)',
    act: 'Act I: The Crossing',
    description: 'Point of no return: The protagonist enters the unfamiliar world, accepting the mission or quest.',
    defaultOrder: 4
  },
  {
    id: 'beat-5',
    name: '5. First Trials & The B-Story',
    act: 'Act II: Confrontation',
    description: 'Exploration of new rules, new allies/rivals, initial skirmishes, and the thematic core relationship.',
    defaultOrder: 5
  },
  {
    id: 'beat-6',
    name: '6. The Midpoint Pivot (Stakes Double)',
    act: 'Act II: Confrontation',
    description: 'False victory or false defeat that raises the stakes from personal comfort to existential survival.',
    defaultOrder: 6
  },
  {
    id: 'beat-7',
    name: '7. Bad Guys Close In & Escalation',
    act: 'Act II: Confrontation',
    description: 'Opposition regroups with greater force; internal fractures and ticking clocks heighten pressure.',
    defaultOrder: 7
  },
  {
    id: 'beat-8',
    name: '8. All Hope Is Lost / The Crisis',
    act: 'Act II: Confrontation',
    description: 'The lowest point: Old strategies fail, mentors or tools are lost, and defeat appears inevitable.',
    defaultOrder: 8
  },
  {
    id: 'beat-9',
    name: '9. Dark Night of the Soul',
    act: 'Act II: Confrontation',
    description: 'Quiet moment of internal reckoning where the protagonist confronts their core flaw and discovers truth.',
    defaultOrder: 9
  },
  {
    id: 'beat-10',
    name: '10. Break into Act III & The Plan',
    act: 'Act III: Resolution',
    description: 'Armed with self-realization, the protagonist synthesizes an audacious final strategy.',
    defaultOrder: 10
  },
  {
    id: 'beat-11',
    name: '11. The Climax (Final Confrontation)',
    act: 'Act III: Resolution',
    description: 'The decisive showdown testing the newly transformed character against the primary conflict.',
    defaultOrder: 11
  },
  {
    id: 'beat-12',
    name: '12. Resolution & Transformed World',
    act: 'Act III: Resolution',
    description: 'The new equilibrium: Echoes of the opening image reveal how the world and protagonist have changed.',
    defaultOrder: 12
  }
];
