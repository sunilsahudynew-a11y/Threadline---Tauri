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
    <aside className="w-72 border-r border-[#EBE8E2] bg-white flex flex-col shrink-0 select-none overflow-hidden text-xs">
      {/* Drawer Header & Mode Switcher */}
      <div className="p-3 border-b border-[#EBE8E2] bg-[#FAF9F5] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <BookOpen size={13} className="text-[#8C887F]" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#736F66]">
            Manuscript
          </span>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-white rounded-md border border-[#EBE8E2] p-0.5 shadow-2xs">
          <button
            onClick={() => setViewMode('chapters')}
            className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors ${
              viewMode === 'chapters'
                ? 'bg-[#2D2A26] text-white shadow-2xs'
                : 'text-[#8C887F] hover:text-[#1A1814]'
            }`}
            title="Group by Chapter"
          >
            Chapters
          </button>
          <button
            onClick={() => setViewMode('flat')}
            className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors ${
              viewMode === 'flat'
                ? 'bg-[#2D2A26] text-white shadow-2xs'
                : 'text-[#8C887F] hover:text-[#1A1814]'
            }`}
            title="Flat Scene Sequence"
          >
            Scenes
          </button>
        </div>
      </div>

      {/* Main Scenes / Chapters List */}
      <div className="flex-1 overflow-y-auto scrollbar-subtle p-3 space-y-3">
        {viewMode === 'chapters' ? (
          <div className="space-y-3">
            {effectiveChapters.map((chap) => {
              const chapScenes = getScenesForChapter(allScenes, chap);
              const isCollapsed = !!collapsedChapters[chap.id];
              const chapWords = calculateChapterWordCount(allScenes, chap);
              const hasActiveScene = chapScenes.some((s) => s.id === scene.id);

              return (
                <div
                  key={chap.id}
                  className={`rounded-lg border transition-all ${
                    hasActiveScene
                      ? 'border-[#D4A373]/60 bg-white shadow-2xs'
                      : 'border-[#EBE8E2] bg-[#FCFBF8]'
                  }`}
                >
                  {/* Chapter Header */}
                  <button
                    onClick={() => toggleChapter(chap.id)}
                    className="w-full text-left p-2.5 flex items-start justify-between gap-2 hover:bg-[#FAF9F5] transition-colors rounded-t-lg cursor-pointer"
                  >
                    <div className="flex items-start gap-1.5 min-w-0">
                      <span className="mt-0.5 text-[#8C887F] shrink-0">
                        {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                      </span>
                      <div className="min-w-0">
                        {chap.actOrPhase && (
                          <div className="text-[9px] font-mono uppercase tracking-wider text-[#A8A49C] font-semibold truncate">
                            {chap.actOrPhase}
                          </div>
                        )}
                        <div className="text-xs font-serif font-bold text-[#1A1814] truncate">
                          Ch. {chap.number}: {chap.title}
                        </div>
                        <div className="text-[10px] text-[#8C887F] font-mono mt-0.5">
                          {chapScenes.length} beat{chapScenes.length === 1 ? '' : 's'} · {chapWords.toLocaleString()} w
                        </div>
                      </div>
                    </div>

                    {hasActiveScene && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4A373] shrink-0 mt-1" />
                    )}
                  </button>

                  {/* Scenes in this Chapter */}
                  {!isCollapsed && (
                    <div className="p-1.5 pt-0 space-y-1 border-t border-[#F0EDE8]">
                      {chapScenes.length === 0 ? (
                        <div className="text-[10px] text-[#A8A49C] italic p-2 text-center">
                          No scenes in this chapter
                        </div>
                      ) : (
                        chapScenes.map((sc) => {
                          const isActive = sc.id === scene.id;
                          return (
                            <button
                              key={sc.id}
                              onClick={() => onNavigateToScene(sc.id)}
                              className={`w-full text-left p-2 rounded-md transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-[#2D2A26] text-white shadow-2xs'
                                  : 'bg-white hover:bg-[#FAF9F5] border border-[#EBE8E2]/70 text-[#3C3933]'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1.5 mb-0.5">
                                <span
                                  className={`text-[11px] font-medium truncate ${
                                    isActive ? 'text-white' : 'text-[#1A1814]'
                                  }`}
                                >
                                  {sc.title}
                                </span>
                                <span
                                  className={`text-[9px] font-mono shrink-0 ${
                                    isActive ? 'text-stone-300' : 'text-[#8C887F]'
                                  }`}
                                >
                                  {sc.wordCount || 0}w
                                </span>
                              </div>
                              <p
                                className={`text-[10px] truncate ${
                                  isActive ? 'text-stone-300' : 'text-[#8C887F]'
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
                  className={`w-full text-left p-2 rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#2D2A26] border border-[#2D2A26] shadow-xs text-white'
                      : 'bg-[#FAF9F5] border border-[#EBE8E2] hover:bg-white text-[#3C3933]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className={`text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-[#1A1814]'}`}>
                      {sc.order}. {sc.title}
                    </span>
                    <span className={`text-[9px] font-mono shrink-0 ${isActive ? 'text-stone-300' : 'text-[#8C887F]'}`}>
                      {sc.wordCount || 0}w
                    </span>
                  </div>
                  {sc.chapterTitle && (
                    <div className={`text-[9px] truncate mb-0.5 ${isActive ? 'text-stone-300' : 'text-[#A8A49C]'}`}>
                      Ch. {sc.chapterNumber || ''}: {sc.chapterTitle}
                    </div>
                  )}
                  <div className={`text-[10px] truncate ${isActive ? 'text-[#AAA69F]' : 'text-[#8C887F]'}`}>
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
            className="w-full py-2 px-3 border border-dashed border-[#D4A373]/50 hover:border-[#D4A373] text-[#736F66] hover:text-[#1A1814] rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer bg-white/50"
          >
            <Plus size={13} />
            <span>Add New Beat</span>
          </button>
        )}
      </div>

      {/* Active Threads Section */}
      <div className="p-3 border-t border-[#EBE8E2] bg-[#FAF9F5] max-h-36 overflow-y-auto scrollbar-subtle">
        <h3 className="text-[9px] font-bold uppercase tracking-widest text-[#AAA69F] mb-2">
          Active Threads ({threads.length})
        </h3>
        <div className="space-y-2">
          {threads.slice(0, 3).map((th) => (
            <div key={th.id} className="flex items-center gap-2 text-xs">
              <div
                className="w-1.5 h-5 rounded-full shrink-0"
                style={{ backgroundColor: th.color || '#D4A373' }}
              />
              <div className="truncate min-w-0">
                <div className="font-medium text-[#1A1814] truncate text-[11px]">{th.title}</div>
                <div className="text-[9px] text-[#8C887F]">
                  {th.linkedSceneIds.length} scene{th.linkedSceneIds.length === 1 ? '' : 's'} linked
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer / Word Count Progress */}
      <div className="p-3 bg-white border-t border-[#EBE8E2]">
        <div className="flex items-center justify-between text-[10px] mb-1.5">
          <span className="text-[#8C887F]">Manuscript Progress</span>
          <span className="font-bold text-[#1A1814] font-mono">
            {totalManuscriptWords.toLocaleString()} words
          </span>
        </div>
        <div className="h-1 w-full bg-[#EBE8E2] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#2D2A26] transition-all duration-300"
            style={{ width: `${Math.min(100, Math.round((totalManuscriptWords / 50000) * 100))}%` }}
          />
        </div>
      </div>
    </aside>
  );
};
