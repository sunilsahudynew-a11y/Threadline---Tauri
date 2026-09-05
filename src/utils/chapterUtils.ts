import { Chapter, Scene, Project } from '../types';

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
      // Find scenes that explicitly point to this chapter
      const matchingScenes = scenes.filter(
        (s) => s.chapterId === chap.id || s.chapterNumber === chap.number
      );
      const sceneIds = matchingScenes.length > 0
        ? matchingScenes.map((s) => s.id)
        : chap.sceneIds.filter((id) => scenes.some((s) => s.id === id));

      return {
        ...chap,
        number: chap.number || idx + 1,
        sceneIds
      };
    });
  }

  // Synthesize from scenes if scenes have chapter info
  const chapterMap = new Map<string, Chapter>();
  let currentChapterNum = 1;

  scenes.forEach((scene, index) => {
    const chapKey = scene.chapterId || (scene.chapterNumber ? `chap-${scene.chapterNumber}` : undefined);
    
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
        title: scene.title.replace(/^(\d+\.|\w+\s\w+:)\s*/i, '') || `Chapter ${index + 1}`,
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
    .filter((s) => (chapter.sceneIds || []).includes(s.id) || s.chapterId === chapter.id || s.chapterNumber === chapter.number)
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
  const chapterScenes = allScenes.filter(
    (s) => (chapter.sceneIds || []).includes(s.id) || s.chapterId === chapter.id || s.chapterNumber === chapter.number
  );
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
    .filter((s) => (chapter.sceneIds || []).includes(s.id) || s.chapterId === chapter.id || s.chapterNumber === chapter.number)
    .sort((x, y) => (x.order || 0) - (y.order || 0));
}
