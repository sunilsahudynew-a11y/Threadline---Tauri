import React, { useState } from 'react';
import { Scene, Thread, Chapter } from '../../types';
import { ensureChapters, calculateChapterWordCount, getScenesForChapter } from '../../utils/chapterUtils';
import { ChevronDown, ChevronRight, BookOpen, Layers, Plus } from 'lucide-react';

interface SceneOutlineDrawerProps {
  scene: Scene;
  allScenes: Scene[];
  chapters?: Chapter[];
  threads: Thread[];
  onNavigateToScene: (sceneId: string) => void;
  onAddScene?: () => void;
}

export const SceneOutlineDrawer: React.FC<SceneOutlineDrawerProps> = ({
  scene,
  allScenes,
  chapters,
  threads,
  onNavigateToScene,
  onAddScene
}) => {
  const [viewMode, setViewMode] = useState<'chapters' | 'flat'>('chapters');
  const [collapsedChapters, setCollapsedChapters] = useState<Record<string, boolean>>({});

  const effectiveChapters = ensureChapters(allScenes, chapters);

  const toggleChapter = (chapterId: string) => {
    setCollapsedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  const totalManuscriptWords = allScenes.reduce((acc, s) => acc + (s.wordCount || 0), 0);

  return (
    <aside className="w-72 border-r border-[rgba(34,30,24,0.12)] bg-[#FAF6EE] flex flex-col shrink-0 select-none overflow-hidden text-xs">
      {/* Drawer Header & Mode Switcher */}
      <div className="p-3 border-b border-[rgba(34,30,24,0.12)] bg-[#F1EAD9] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <BookOpen size={13} className="text-[#B54B32]" />
          <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-[#7A705F]">
            Manuscript Binder
          </span>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-[#FAF6EE] rounded-[5px] border border-[rgba(34,30,24,0.12)] p-0.5">
          <button
            onClick={() => setViewMode('chapters')}
            className={`px-2 py-0.5 text-[10px] font-medium rounded-[4px] transition-colors cursor-pointer ${
              viewMode === 'chapters'
                ? 'bg-[#221E18] text-[#FAF6EE] font-semibold'
                : 'text-[#7A705F] hover:text-[#221E18]'
            }`}
            title="Group by Chapter"
          >
            Chapters
          </button>
          <button
            onClick={() => setViewMode('flat')}
            className={`px-2 py-0.5 text-[10px] font-medium rounded-[4px] transition-colors cursor-pointer ${
              viewMode === 'flat'
                ? 'bg-[#221E18] text-[#FAF6EE] font-semibold'
                : 'text-[#7A705F] hover:text-[#221E18]'
            }`}
            title="Flat Scene Sequence"
          >
            Scenes
          </button>
        </div>
      </div>

      {/* Main Scenes / Chapters List */}
      <div className="flex-1 overflow-y-auto scrollbar-subtle p-3 space-y-2.5">
        {viewMode === 'chapters' ? (
          <div className="space-y-2.5">
            {effectiveChapters.map((chap) => {
              const chapScenes = getScenesForChapter(allScenes, chap);
              const isCollapsed = !!collapsedChapters[chap.id];
              const chapWords = calculateChapterWordCount(allScenes, chap);
              const hasActiveScene = chapScenes.some((s) => s.id === scene.id);

              return (
                <div
                  key={chap.id}
                  className={`rounded-[6px] border transition-all ${
                    hasActiveScene
                      ? 'border-[#B54B32] bg-[#F1EAD9] shadow-warm-sm'
                      : 'border-[rgba(34,30,24,0.12)] bg-[#FAF6EE]'
                  }`}
                >
                  {/* Chapter Header */}
                  <button
                    onClick={() => toggleChapter(chap.id)}
                    className="w-full text-left p-2.5 flex items-start justify-between gap-2 hover:bg-[#F1EAD9] transition-colors rounded-t-[6px] cursor-pointer"
                  >
                    <div className="flex items-start gap-1.5 min-w-0">
                      <span className="mt-0.5 text-[#7A705F] shrink-0">
                        {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                      </span>
                      <div className="min-w-0">
                        {chap.actOrPhase && (
                          <div className="text-[9px] font-mono uppercase tracking-wider text-[#7A705F] font-semibold truncate">
                            {chap.actOrPhase}
                          </div>
                        )}
                        <div className="text-xs font-serif font-bold text-[#221E18] truncate">
                          Ch. {chap.number}: {chap.title}
                        </div>
                        <div className="text-[10px] text-[#7A705F] font-mono mt-0.5">
                          {chapScenes.length} scene{chapScenes.length === 1 ? '' : 's'} · {chapWords.toLocaleString()} w
                        </div>
                      </div>
                    </div>

                    {hasActiveScene && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B54B32] shrink-0 mt-1" />
                    )}
                  </button>

                  {/* Scenes in this Chapter */}
                  {!isCollapsed && (
                    <div className="p-1.5 pt-0 space-y-1 border-t border-[rgba(34,30,24,0.08)]">
                      {chapScenes.length === 0 ? (
                        <div className="text-[10px] text-[#7A705F] italic p-2 text-center">
                          No scenes in this chapter
                        </div>
                      ) : (
                        chapScenes.map((sc) => {
                          const isActive = sc.id === scene.id;
                          return (
                            <button
                              key={sc.id}
                              onClick={() => onNavigateToScene(sc.id)}
                              className={`w-full text-left p-2 rounded-[5px] transition-all cursor-pointer min-h-[36px] ${
                                isActive
                                  ? 'bg-[#221E18] text-[#FAF6EE] shadow-warm-sm'
                                  : 'bg-[#FAF6EE] hover:bg-[#F1EAD9] border border-[rgba(34,30,24,0.08)] text-[#221E18]'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1.5 mb-0.5">
                                <span
                                  className={`text-[11px] font-medium truncate ${
                                    isActive ? 'text-[#FAF6EE]' : 'text-[#221E18]'
                                  }`}
                                >
                                  {sc.title}
                                </span>
                                <span
                                  className={`text-[9px] font-mono shrink-0 ${
                                    isActive ? 'text-[#FAF6EE]/70' : 'text-[#7A705F]'
                                  }`}
                                >
                                  {sc.wordCount || 0}w
                                </span>
                              </div>
                              <p
                                className={`text-[10px] truncate ${
                                  isActive ? 'text-[#FAF6EE]/70' : 'text-[#7A705F]'
                                }`}
                              >
                                {sc.premise || sc.notes || 'Drafting in progress...'}
                              </p>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Flat Scene List */
          <div className="space-y-1.5">
            {allScenes.map((sc) => {
              const isActive = sc.id === scene.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => onNavigateToScene(sc.id)}
                  className={`w-full text-left p-2 rounded-[6px] transition-colors cursor-pointer min-h-[36px] ${
                    isActive
                      ? 'bg-[#221E18] border border-[#221E18] text-[#FAF6EE] shadow-warm-sm'
                      : 'bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] hover:bg-[#F1EAD9] text-[#221E18]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className={`text-xs font-semibold truncate ${isActive ? 'text-[#FAF6EE]' : 'text-[#221E18]'}`}>
                      {sc.order}. {sc.title}
                    </span>
                    <span className={`text-[9px] font-mono shrink-0 ${isActive ? 'text-[#FAF6EE]/70' : 'text-[#7A705F]'}`}>
                      {sc.wordCount || 0}w
                    </span>
                  </div>
                  {sc.chapterTitle && (
                    <div className={`text-[9px] truncate mb-0.5 ${isActive ? 'text-[#FAF6EE]/70' : 'text-[#7A705F]'}`}>
                      Ch. {sc.chapterNumber || ''}: {sc.chapterTitle}
                    </div>
                  )}
                  <div className={`text-[10px] truncate ${isActive ? 'text-[#FAF6EE]/60' : 'text-[#7A705F]'}`}>
                    {sc.premise || sc.proseContent.slice(0, 35) || 'Drafting in progress...'}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {onAddScene && (
          <button
            onClick={onAddScene}
            className="w-full py-2 px-3 border border-dashed border-[#B54B32]/40 hover:border-[#B54B32] text-[#7A705F] hover:text-[#221E18] rounded-[6px] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer bg-[#F1EAD9]/40 min-h-[36px]"
          >
            <Plus size={13} className="text-[#B54B32]" />
            <span>Add New Scene</span>
          </button>
        )}
      </div>

      {/* Active Threads Section */}
      <div className="p-3 border-t border-[rgba(34,30,24,0.12)] bg-[#F1EAD9] max-h-36 overflow-y-auto scrollbar-subtle">
        <h3 className="text-[9px] font-mono font-semibold uppercase tracking-wider text-[#7A705F] mb-2">
          Codex Threads ({threads.length})
        </h3>
        <div className="space-y-1.5">
          {threads.slice(0, 3).map((th) => (
            <div key={th.id} className="flex items-center gap-2 text-xs">
              <div
                className="w-1.5 h-4 rounded-full shrink-0"
                style={{ backgroundColor: th.color || '#35505F' }}
              />
              <div className="truncate min-w-0">
                <div className="font-medium text-[#221E18] truncate text-[11px]">{th.title}</div>
                <div className="text-[9px] text-[#7A705F]">
                  {th.linkedSceneIds.length} scene{th.linkedSceneIds.length === 1 ? '' : 's'} linked
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer / Word Count Progress */}
      <div className="p-3 bg-[#FAF6EE] border-t border-[rgba(34,30,24,0.12)]">
        <div className="flex items-center justify-between text-[10px] mb-1.5">
          <span className="text-[#7A705F]">Manuscript Progress</span>
          <span className="font-bold text-[#221E18] font-mono">
            {totalManuscriptWords.toLocaleString()} words
          </span>
        </div>
        <div className="h-1.5 w-full bg-[rgba(34,30,24,0.08)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#B54B32] transition-all duration-300 rounded-full"
            style={{ width: `${Math.min(100, Math.round((totalManuscriptWords / 50000) * 100))}%` }}
          />
        </div>
      </div>
    </aside>
  );
};
