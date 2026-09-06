import React, { useState } from 'react';
import {
  Project,
  Scene,
  Thread,
  NoteItem,
  Entity,
  Chapter
} from '../types';
import {
  Layers,
  MoveUp,
  MoveDown,
  Plus,
  Compass,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Bookmark,
  Sparkles
} from 'lucide-react';
import { ensureChapters, calculateChapterWordCount, getScenesForChapter } from '../utils/chapterUtils';

interface DashboardScreenProps {
  project: Project;
  scenes: Scene[];
  chapters?: Chapter[];
  threads: Thread[];
  notes: NoteItem[];
  entities: Entity[];
  onNavigateToScene: (sceneId: string) => void;
  onReorderScenes: (scenes: Scene[]) => void;
  onAddScene: () => void;
  onAddSceneToChapter?: (chapterId: string) => void;
  onUpdateChapters?: (chapters: Chapter[]) => void;
  onUpdateNote: (note: NoteItem) => void;
  onAddNote: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  project,
  scenes,
  chapters,
  threads,
  notes,
  entities,
  onNavigateToScene,
  onReorderScenes,
  onAddScene,
  onAddSceneToChapter,
  onUpdateChapters,
  onUpdateNote,
  onAddNote
}) => {
  const [viewMode, setViewMode] = useState<'chapters' | 'flat'>('chapters');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [collapsedChapters, setCollapsedChapters] = useState<Record<string, boolean>>({});
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newChapterPhase, setNewChapterPhase] = useState('Act I: Setup');
  const [newChapterDesc, setNewChapterDesc] = useState('');

  const effectiveChapters = ensureChapters(scenes, chapters);

  const toggleChapter = (chapterId: string) => {
    setCollapsedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  const moveSceneGlobal = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= scenes.length) return;
    const next = [...scenes];
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;
    const updated = next.map((s, i) => ({ ...s, order: i + 1 }));
    onReorderScenes(updated);
  };

  const totalWords = scenes.reduce((acc, s) => acc + (s.wordCount || 0), 0);
  const completedScenes = scenes.filter((s) => s.status === 'complete').length;

  const handleCreateChapterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapterTitle.trim()) return;

    const nextNum = effectiveChapters.length > 0 ? Math.max(...effectiveChapters.map((c) => c.number)) + 1 : 1;
    const newChap: Chapter = {
      id: 'chap-' + Date.now(),
      number: nextNum,
      title: newChapterTitle.trim(),
      actOrPhase: newChapterPhase.trim() || 'Act I: Setup',
      description: newChapterDesc.trim() || undefined,
      sceneIds: []
    };

    if (onUpdateChapters) {
      onUpdateChapters([...effectiveChapters, newChap]);
    }

    setNewChapterTitle('');
    setNewChapterDesc('');
    setIsAddingChapter(false);
  };

  // Status badge styling per Brand v1.0 mapping (§3.1)
  const getStatusBadge = (status: Scene['status']) => {
    switch (status) {
      case 'complete':
        return { label: 'Final', bg: '#221E18', text: '#FAF6EE' };
      case 'revised':
        return { label: 'Revised', bg: '#B54B32', text: '#FAF6EE' };
      case 'draft':
      default:
        return { label: 'Drafting', bg: '#35505F', text: '#FAF6EE' };
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-24 md:pb-12 text-[#221E18]">
      {/* 1. SCREEN HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <span className="section-label block mb-1">
            Structure &amp; Arc Index
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#221E18] font-semibold">
            Corkboard &amp; Scene Matrix
          </h1>
          <p className="text-[#7A705F] text-xs sm:text-sm mt-1">
            Digital index cards organized by chapters and acts to balance pacing and narrative tension.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-[#F1EAD9] border border-[rgba(34,30,24,0.12)] px-3 py-1.5 rounded-[6px] text-xs font-mono text-[#7A705F]">
            {effectiveChapters.length} Ch · {completedScenes}/{scenes.length} Scenes Done · {totalWords.toLocaleString()} w
          </div>

          <button
            onClick={() => setIsAddingChapter(true)}
            className="px-3.5 py-1.5 bg-[#F1EAD9] hover:bg-[#EAE4D6] border border-[rgba(34,30,24,0.12)] text-[#221E18] rounded-[6px] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer min-h-[36px]"
          >
            <Bookmark size={13} className="text-[#35505F]" />
            <span>Add Chapter</span>
          </button>

          <button
            onClick={onAddScene}
            className="px-3.5 py-1.5 bg-[#B54B32] hover:bg-[#9E3E27] text-[#FAF6EE] rounded-[6px] text-xs font-semibold flex items-center gap-1.5 shadow-warm-sm transition-colors cursor-pointer min-h-[36px]"
          >
            <Plus size={13} />
            <span>Add Scene</span>
          </button>
        </div>
      </div>

      {/* 2. PACING HEATMAP BAR (Horizontally scrollable on mobile per §5.3) */}
      <div className="mb-6 bg-[#F1EAD9] p-4 rounded-[6px] border border-[rgba(34,30,24,0.12)] space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-serif font-semibold text-[#221E18] flex items-center gap-1.5">
            <Layers size={14} className="text-[#B54B32]" />
            <span>Manuscript Pacing &amp; Word Distribution</span>
          </span>
          <span className="text-[11px] font-mono text-[#7A705F]">
            Avg: {scenes.length > 0 ? Math.round(totalWords / scenes.length) : 0} w/scene
          </span>
        </div>

        <div className="overflow-x-auto no-scrollbar py-1">
          <div className="flex items-end gap-1.5 h-12 min-w-[320px]">
            {scenes.map((sc, idx) => {
              const maxWords = Math.max(...scenes.map((s) => s.wordCount || 100), 1000);
              const heightPct = Math.max(15, Math.min(100, Math.round(((sc.wordCount || 0) / maxWords) * 100)));
              const statusInfo = getStatusBadge(sc.status);

              return (
                <div
                  key={sc.id}
                  onClick={() => onNavigateToScene(sc.id)}
                  className="flex-1 rounded-[3px] transition-all cursor-pointer hover:opacity-80 group relative"
                  style={{
                    height: `${heightPct}%`,
                    backgroundColor: statusInfo.bg
                  }}
                  title={`Scene ${idx + 1}: ${sc.title} (${sc.wordCount || 0} words) - ${statusInfo.label}`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. NEW CHAPTER FORM (Inline Drawer) */}
      {isAddingChapter && (
        <form
          onSubmit={handleCreateChapterSubmit}
          className="mb-6 p-5 bg-[#F1EAD9] border border-[#B54B32]/40 rounded-[6px] shadow-warm-sm animate-in fade-in duration-150 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-serif font-semibold text-sm text-[#221E18] flex items-center gap-2">
              <Bookmark size={14} className="text-[#B54B32]" />
              <span>Create New Chapter #{effectiveChapters.length + 1}</span>
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono font-semibold text-[#7A705F] uppercase mb-1">
                Chapter Title
              </label>
              <input
                type="text"
                placeholder="e.g., The Midnight Threshold"
                value={newChapterTitle}
                onChange={(e) => setNewChapterTitle(e.target.value)}
                className="w-full p-2 bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[6px] text-xs text-[#221E18] focus:outline-none focus:border-[#35505F]"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono font-semibold text-[#7A705F] uppercase mb-1">
                Act / Narrative Phase
              </label>
              <input
                type="text"
                placeholder="e.g., Act I: Setup, Act II: Crossing"
                value={newChapterPhase}
                onChange={(e) => setNewChapterPhase(e.target.value)}
                className="w-full p-2 bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[6px] text-xs text-[#221E18] focus:outline-none focus:border-[#35505F]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono font-semibold text-[#7A705F] uppercase mb-1">
              Chapter Synopsis / Dramatic Goal (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="What core shift or confrontation occurs in this chapter?"
              value={newChapterDesc}
              onChange={(e) => setNewChapterDesc(e.target.value)}
              className="w-full p-2 bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[6px] text-xs text-[#221E18] focus:outline-none focus:border-[#35505F]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingChapter(false)}
              className="px-3 py-1.5 text-xs text-[#7A705F] hover:text-[#221E18] cursor-pointer min-h-[36px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newChapterTitle.trim()}
              className="px-4 py-1.5 bg-[#221E18] hover:bg-black text-[#FAF6EE] rounded-[6px] text-xs font-semibold disabled:opacity-50 cursor-pointer min-h-[36px]"
            >
              Add Chapter
            </button>
          </div>
        </form>
      )}

      {/* 4. CONTROLS: VIEW SWITCHER & STATUS FILTERS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center bg-[#F1EAD9] p-0.5 rounded-[6px] border border-[rgba(34,30,24,0.12)]">
          <button
            onClick={() => setViewMode('chapters')}
            className={`px-3 py-1.5 rounded-[5px] text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 min-h-[32px] ${
              viewMode === 'chapters'
                ? 'bg-[#FAF6EE] text-[#221E18] font-semibold shadow-warm-sm'
                : 'text-[#7A705F] hover:text-[#221E18]'
            }`}
          >
            <BookOpen size={12} />
            <span>By Chapter ({effectiveChapters.length})</span>
          </button>
          <button
            onClick={() => setViewMode('flat')}
            className={`px-3 py-1.5 rounded-[5px] text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 min-h-[32px] ${
              viewMode === 'flat'
                ? 'bg-[#FAF6EE] text-[#221E18] font-semibold shadow-warm-sm'
                : 'text-[#7A705F] hover:text-[#221E18]'
            }`}
          >
            <Layers size={12} />
            <span>Flat Sequence ({scenes.length})</span>
          </button>
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1 text-xs bg-[#F1EAD9] p-0.5 rounded-[6px] border border-[rgba(34,30,24,0.12)] overflow-x-auto no-scrollbar">
          {['all', 'draft', 'revised', 'complete'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-[5px] capitalize transition-colors cursor-pointer whitespace-nowrap min-h-[30px] ${
                filterStatus === st
                  ? 'bg-[#FAF6EE] text-[#221E18] font-semibold shadow-warm-sm'
                  : 'text-[#7A705F] hover:text-[#221E18]'
              }`}
            >
              {st === 'draft' ? 'Drafting' : st === 'complete' ? 'Final' : st}
            </button>
          ))}
        </div>
      </div>

      {/* 5. CORKBOARD INDEX CARDS (Responsive: Grid on desktop/tablet, vertical stack on phone per §5.3) */}
      <div className="space-y-6">
        {viewMode === 'chapters' ? (
          effectiveChapters.map((chap) => {
            const chapScenes = getScenesForChapter(scenes, chap).filter((s) => {
              if (filterStatus === 'all') return true;
              return s.status === filterStatus;
            });
            const isCollapsed = !!collapsedChapters[chap.id];
            const chapWords = calculateChapterWordCount(scenes, chap);

            return (
              <div
                key={chap.id}
                className="bg-[#F1EAD9] rounded-[6px] border border-[rgba(34,30,24,0.12)] shadow-warm-sm overflow-hidden"
              >
                {/* Chapter Banner */}
                <div className="p-3.5 sm:p-4 bg-[#F1EAD9] border-b border-[rgba(34,30,24,0.12)] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      onClick={() => toggleChapter(chap.id)}
                      className="text-[#7A705F] hover:text-[#221E18] p-1 rounded transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                    >
                      {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {chap.actOrPhase && (
                          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-[4px] bg-[#221E18] text-[#FAF6EE]">
                            {chap.actOrPhase}
                          </span>
                        )}
                        <span className="text-xs font-mono text-[#7A705F]">Ch. {chap.number}</span>
                      </div>
                      <h3 className="font-serif font-semibold text-sm sm:text-base text-[#221E18] truncate mt-0.5">
                        {chap.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono text-[#7A705F] hidden sm:inline">
                      {chapWords.toLocaleString()} words · {chapScenes.length} scenes
                    </span>
                    {onAddSceneToChapter && (
                      <button
                        onClick={() => onAddSceneToChapter(chap.id)}
                        className="px-2.5 py-1 text-xs text-[#221E18] hover:bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[6px] flex items-center gap-1 cursor-pointer min-h-[36px]"
                      >
                        <Plus size={13} className="text-[#B54B32]" />
                        <span className="hidden sm:inline">Add Scene</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Index Cards Container (Vertical on phone, grid on tablet & desktop) */}
                {!isCollapsed && (
                  <div className="p-4 bg-[#FAF6EE]">
                    {chapScenes.length === 0 ? (
                      <div className="p-6 text-center text-xs text-[#7A705F] italic">
                        No scenes in this chapter matching the current filter.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {chapScenes.map((scene) => {
                          const statusInfo = getStatusBadge(scene.status);
                          return (
                            <div
                              key={scene.id}
                              onClick={() => onNavigateToScene(scene.id)}
                              className="bg-[#F1EAD9] p-4 rounded-[6px] border border-[rgba(34,30,24,0.12)] shadow-warm-sm hover:border-[#B54B32] transition-all cursor-pointer space-y-2.5 min-h-[120px] flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <span className="text-[10px] font-mono text-[#7A705F]">
                                    Scene #{scene.order}
                                  </span>
                                  <span
                                    className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-[4px]"
                                    style={{ backgroundColor: statusInfo.bg, color: statusInfo.text }}
                                  >
                                    {statusInfo.label}
                                  </span>
                                </div>
                                <h4 className="font-serif font-semibold text-sm text-[#221E18] line-clamp-1">
                                  {scene.title}
                                </h4>
                                <p className="text-xs text-[#7A705F] line-clamp-2 mt-1">
                                  {scene.premise || (scene.proseContent ? scene.proseContent.slice(0, 100) : 'No premise drafted yet.')}
                                </p>
                              </div>

                              <div className="pt-2 border-t border-[rgba(34,30,24,0.08)] flex items-center justify-between text-[11px] text-[#7A705F]">
                                <span>{scene.pov ? `POV: ${scene.pov}` : 'No POV'}</span>
                                <span className="font-mono">{scene.wordCount || 0} w</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          /* FLAT SEQUENCE MODE */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {scenes.map((scene, idx) => {
              const statusInfo = getStatusBadge(scene.status);
              return (
                <div
                  key={scene.id}
                  onClick={() => onNavigateToScene(scene.id)}
                  className="bg-[#F1EAD9] p-4 rounded-[6px] border border-[rgba(34,30,24,0.12)] shadow-warm-sm hover:border-[#B54B32] transition-all cursor-pointer space-y-2.5 min-h-[120px] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-mono text-[#7A705F]">
                        Beat #{idx + 1}
                      </span>
                      <span
                        className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-[4px]"
                        style={{ backgroundColor: statusInfo.bg, color: statusInfo.text }}
                      >
                        {statusInfo.label}
                      </span>
                    </div>
                    <h4 className="font-serif font-semibold text-sm text-[#221E18] line-clamp-1">
                      {scene.title}
                    </h4>
                    <p className="text-xs text-[#7A705F] line-clamp-2 mt-1">
                      {scene.premise || (scene.proseContent ? scene.proseContent.slice(0, 100) : 'No synopsis.')}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[rgba(34,30,24,0.08)] flex items-center justify-between text-[11px] text-[#7A705F]">
                    <span>{scene.pov ? `POV: ${scene.pov}` : 'No POV'}</span>
                    <span className="font-mono">{scene.wordCount || 0} w</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
