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
  ArrowUpDown,
  MoveUp,
  MoveDown,
  Plus,
  Compass,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Bookmark
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
    // Re-index order numbers
    const updated = next.map((s, i) => ({ ...s, order: i + 1 }));
    onReorderScenes(updated);
  };

  const filteredScenes = scenes.filter((s) => {
    if (filterStatus === 'all') return true;
    return s.status === filterStatus;
  });

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

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-[#AAA69F] uppercase font-mono">
            Manuscript Outline & Story Arc
          </span>
          <h2 className="text-2xl md:text-3xl font-serif text-[#1A1814] font-semibold mt-1">
            Story Structure & Chapters
          </h2>
          <p className="text-[#8C887F] text-xs mt-1">
            Visual hierarchy organized by chapters and framework beats, keeping pacing and narrative momentum aligned.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-[#EBE8E2] px-3.5 py-1.5 rounded-lg text-xs font-mono text-[#6C6960] shadow-2xs">
            {effectiveChapters.length} Chapters · {completedScenes} of {scenes.length} Beats Done ({totalWords.toLocaleString()} w)
          </div>
          <button
            onClick={() => setIsAddingChapter(true)}
            className="px-3.5 py-2 bg-white hover:bg-[#FAF9F5] border border-[#EBE8E2] text-[#2D2A26] rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Bookmark size={13} /> Add Chapter
          </button>
          <button
            onClick={onAddScene}
            className="px-3.5 py-2 bg-[#2D2A26] hover:bg-[#1A1814] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Plus size={13} /> Add Beat
          </button>
        </div>
      </div>

      {/* Quick Add Chapter Drawer/Modal Form */}
      {isAddingChapter && (
        <form
          onSubmit={handleCreateChapterSubmit}
          className="mb-8 p-5 bg-white border border-[#D4A373] rounded-xl shadow-xs animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-serif font-bold text-sm text-[#1A1814] flex items-center gap-2">
              <BookOpen size={14} className="text-[#D4A373]" />
              Create New Chapter
            </h4>
            <span className="text-[10px] font-mono text-[#8C887F]">
              Chapter #{effectiveChapters.length + 1}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[10px] font-bold text-[#8C887F] uppercase tracking-wider mb-1">
                Chapter Title
              </label>
              <input
                type="text"
                placeholder="e.g., The Return to the Threshold"
                value={newChapterTitle}
                onChange={(e) => setNewChapterTitle(e.target.value)}
                className="w-full p-2 bg-[#FAF9F5] border border-[#EBE8E2] rounded-lg text-xs focus:bg-white focus:outline-none"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#8C887F] uppercase tracking-wider mb-1">
                Act / Narrative Phase
              </label>
              <input
                type="text"
                placeholder="e.g., Act II: Confrontation or Act III: Resolution"
                value={newChapterPhase}
                onChange={(e) => setNewChapterPhase(e.target.value)}
                className="w-full p-2 bg-[#FAF9F5] border border-[#EBE8E2] rounded-lg text-xs focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-[10px] font-bold text-[#8C887F] uppercase tracking-wider mb-1">
              Chapter Synopsis / Dramatic Goal (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="What shifts dramatically in this chapter?"
              value={newChapterDesc}
              onChange={(e) => setNewChapterDesc(e.target.value)}
              className="w-full p-2 bg-[#FAF9F5] border border-[#EBE8E2] rounded-lg text-xs focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingChapter(false)}
              className="px-3 py-1.5 text-xs text-[#8C887F] hover:text-[#1A1814] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newChapterTitle.trim()}
              className="px-4 py-1.5 bg-[#2D2A26] hover:bg-[#1A1814] text-white rounded-lg text-xs font-semibold disabled:opacity-50 cursor-pointer"
            >
              Add Chapter to Manuscript
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Cols: Manuscript Structure */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#F1F0EC] p-1 rounded-lg border border-[#EBE8E2]">
              <button
                onClick={() => setViewMode('chapters')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'chapters'
                    ? 'bg-white shadow-xs text-[#1A1814] font-bold'
                    : 'text-[#6C6960] hover:text-[#1A1814]'
                }`}
              >
                <BookOpen size={12} />
                <span>Chapter View ({effectiveChapters.length})</span>
              </button>
              <button
                onClick={() => setViewMode('flat')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'flat'
                    ? 'bg-white shadow-xs text-[#1A1814] font-bold'
                    : 'text-[#6C6960] hover:text-[#1A1814]'
                }`}
              >
                <Layers size={12} />
                <span>Flat Sequence ({scenes.length})</span>
              </button>
            </div>

            {/* Status Filter */}
            <div className="flex gap-1 text-xs bg-[#F1F0EC] p-0.5 rounded-lg border border-[#EBE8E2]">
              {['all', 'draft', 'revised', 'complete'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 rounded-md capitalize transition-colors cursor-pointer ${
                    filterStatus === st
                      ? 'bg-white shadow-xs text-[#1A1814] font-bold'
                      : 'text-[#6C6960] hover:text-[#1A1814]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* CHAPTER VIEW MODE */}
          {viewMode === 'chapters' ? (
            <div className="space-y-4">
              {effectiveChapters.map((chap) => {
                const chapScenes = getScenesForChapter(scenes, chap).filter((s) => {
                  if (filterStatus === 'all') return true;
                  return s.status === filterStatus;
                });
                const totalChapScenes = getScenesForChapter(scenes, chap);
                const isCollapsed = !!collapsedChapters[chap.id];
                const chapWords = calculateChapterWordCount(scenes, chap);
                const completedInChap = totalChapScenes.filter((s) => s.status === 'complete').length;
                const progressPct =
                  totalChapScenes.length > 0
                    ? Math.round((completedInChap / totalChapScenes.length) * 100)
                    : 0;

                return (
                  <div
                    key={chap.id}
                    className="bg-white rounded-xl border border-[#EBE8E2] shadow-2xs overflow-hidden transition-all"
                  >
                    {/* Chapter Header Banner */}
                    <div className="p-4 bg-[#FAF9F5] border-b border-[#EBE8E2] flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <button
                          onClick={() => toggleChapter(chap.id)}
                          className="mt-1 text-[#8C887F] hover:text-[#1A1814] p-1 rounded transition-colors cursor-pointer"
                        >
                          {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                        </button>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {chap.actOrPhase && (
                              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#2D2A26] text-white">
                                {chap.actOrPhase}
                              </span>
                            )}
                            <span className="text-xs font-mono text-[#8C887F]">
                              Chapter {chap.number}
                            </span>
                          </div>

                          <h3 className="font-serif font-bold text-[#1A1814] text-base leading-snug">
                            {chap.title}
                          </h3>

                          {chap.description && (
                            <p className="text-xs text-[#6C6960] mt-1 leading-relaxed max-w-2xl">
                              {chap.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Chapter Progress & Actions */}
                      <div className="text-right shrink-0">
                        <div className="text-xs font-mono font-semibold text-[#1A1814]">
                          {chapWords.toLocaleString()} w
                        </div>
                        <div className="text-[10px] text-[#8C887F] mt-0.5 font-mono">
                          {completedInChap}/{totalChapScenes.length} beats complete
                        </div>
                        <div className="w-24 h-1.5 bg-[#EBE8E2] rounded-full overflow-hidden mt-2 ml-auto">
                          <div
                            className="h-full bg-emerald-600 transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Scenes in this Chapter */}
                    {!isCollapsed && (
                      <div className="p-4 space-y-3 bg-white">
                        {chapScenes.length === 0 ? (
                          <div className="text-center py-6 text-xs text-[#A8A49C] italic bg-[#FCFBF8] rounded-lg border border-dashed border-[#EBE8E2]">
                            {filterStatus !== 'all'
                              ? `No ${filterStatus} beats in this chapter.`
                              : 'No beats in this chapter yet.'}
                          </div>
                        ) : (
                          chapScenes.map((scene) => {
                            const actualIndex = scenes.findIndex((s) => s.id === scene.id);
                            const linkedThreads = threads.filter((t) =>
                              t.linkedSceneIds.includes(scene.id)
                            );

                            return (
                              <div
                                key={scene.id}
                                className="bg-[#FAF9F5] rounded-lg border border-[#EBE8E2] p-3.5 hover:border-stone-300 transition-all group"
                              >
                                <div className="flex items-start justify-between gap-3 mb-1.5">
                                  <div className="flex items-start gap-2.5 min-w-0">
                                    <span className="w-5 h-5 rounded bg-white border border-[#EBE8E2] text-[#8C887F] flex items-center justify-center font-mono text-[11px] font-semibold shrink-0 mt-0.5">
                                      {scene.order}
                                    </span>
                                    <div className="min-w-0">
                                      <h4
                                        onClick={() => onNavigateToScene(scene.id)}
                                        className="font-serif font-bold text-[#1A1814] text-sm hover:text-[#D4A373] cursor-pointer transition-colors truncate"
                                      >
                                        {scene.title}
                                      </h4>
                                      <p className="text-xs text-[#6C6960] line-clamp-2 mt-0.5 leading-relaxed">
                                        {scene.premise || scene.notes || 'No premise set for this scene.'}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <span
                                      className={`text-[9px] px-2 py-0.5 rounded font-mono uppercase ${
                                        scene.status === 'complete'
                                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                          : scene.status === 'revised'
                                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                          : 'bg-white text-[#6C6960] border border-[#EBE8E2]'
                                      }`}
                                    >
                                      {scene.status}
                                    </span>
                                    <button
                                      onClick={() => onNavigateToScene(scene.id)}
                                      className="px-2.5 py-1 bg-white hover:bg-[#FAF9F5] border border-[#EBE8E2] text-[#1A1814] rounded text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                                    >
                                      <span>Draft</span>
                                      <ArrowRight size={10} />
                                    </button>
                                  </div>
                                </div>

                                {/* Metadata footer */}
                                <div className="pt-2 border-t border-[#EBE8E2]/60 flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#8C887F]">
                                  <div className="flex flex-wrap items-center gap-3">
                                    {scene.pov && <span>POV: <strong className="text-[#3C3933] font-normal">{scene.pov}</strong></span>}
                                    {scene.location && <span>Loc: <strong className="text-[#3C3933] font-normal">{scene.location}</strong></span>}
                                    <span className="font-mono">{scene.wordCount || 0} words</span>
                                  </div>

                                  {linkedThreads.length > 0 && (
                                    <div className="flex items-center gap-1">
                                      {linkedThreads.map((th) => (
                                        <span
                                          key={th.id}
                                          className="w-2 h-2 rounded-full"
                                          style={{ backgroundColor: th.color || '#D4A373' }}
                                          title={th.title}
                                        />
                                      ))}
                                      <span className="text-[10px] text-[#8C887F]">
                                        {linkedThreads.length} thread{linkedThreads.length === 1 ? '' : 's'}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}

                        {onAddSceneToChapter && (
                          <button
                            onClick={() => onAddSceneToChapter(chap.id)}
                            className="w-full py-2 border border-dashed border-[#EBE8E2] hover:border-[#D4A373] text-[#8C887F] hover:text-[#1A1814] rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer bg-white"
                          >
                            <Plus size={12} /> Add Beat to Chapter {chap.number}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* FLAT SEQUENCE VIEW MODE */
            <div className="space-y-3">
              {filteredScenes.map((scene, idx) => {
                const actualIndex = scenes.findIndex((s) => s.id === scene.id);
                const linkedThreads = threads.filter((t) => t.linkedSceneIds.includes(scene.id));

                return (
                  <div
                    key={scene.id}
                    className="bg-white rounded-xl border border-[#EBE8E2] p-4 shadow-2xs hover:border-stone-300 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#EBE8E2] text-[#8C887F] flex items-center justify-center font-mono text-xs font-semibold shrink-0 mt-0.5">
                          {actualIndex + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            {scene.chapterTitle && (
                              <span className="text-[9px] font-mono text-[#8C887F] bg-[#FAF9F5] px-1.5 py-0.5 rounded border border-[#EBE8E2]">
                                Ch. {scene.chapterNumber}: {scene.chapterTitle}
                              </span>
                            )}
                            {scene.actOrPhase && (
                              <span className="text-[9px] font-mono text-[#A8A49C]">
                                {scene.actOrPhase}
                              </span>
                            )}
                          </div>
                          <h4
                            onClick={() => onNavigateToScene(scene.id)}
                            className="font-serif font-bold text-[#1A1814] text-sm hover:text-[#D4A373] cursor-pointer transition-colors"
                          >
                            {scene.title}
                          </h4>
                          <p className="text-xs text-[#8C887F] line-clamp-2 mt-0.5 leading-relaxed">
                            {scene.premise || 'No premise set for this scene.'}
                          </p>
                        </div>
                      </div>

                      {/* Sequence reorder buttons */}
                      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          disabled={actualIndex === 0}
                          onClick={() => moveSceneGlobal(actualIndex, 'up')}
                          className="p-1 text-[#AAA69F] hover:text-[#1A1814] disabled:opacity-20 cursor-pointer"
                          title="Move earlier"
                        >
                          <MoveUp size={13} />
                        </button>
                        <button
                          disabled={actualIndex === scenes.length - 1}
                          onClick={() => moveSceneGlobal(actualIndex, 'down')}
                          className="p-1 text-[#AAA69F] hover:text-[#1A1814] disabled:opacity-20 cursor-pointer"
                          title="Move later"
                        >
                          <MoveDown size={13} />
                        </button>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase ml-2 ${
                            scene.status === 'complete'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : scene.status === 'revised'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-[#F1F0EC] text-[#6C6960] border border-[#EBE8E2]'
                          }`}
                        >
                          {scene.status}
                        </span>
                      </div>
                    </div>

                    {/* Metadata tags */}
                    <div className="pt-2.5 border-t border-[#EBE8E2] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#8C887F]">
                      <div className="flex flex-wrap items-center gap-3">
                        <span>POV: <strong className="text-[#3C3933] font-normal">{scene.pov || 'Unset'}</strong></span>
                        <span>Location: <strong className="text-[#3C3933] font-normal">{scene.location || 'Unset'}</strong></span>
                        <span>Time: <strong className="text-[#3C3933] font-normal">{scene.time || 'Unset'}</strong></span>
                        <span className="font-mono">{scene.wordCount} words</span>
                      </div>

                      <button
                        onClick={() => onNavigateToScene(scene.id)}
                        className="text-[#1A1814] hover:text-[#D4A373] font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <span>Draft Scene</span>
                        <ArrowRight size={11} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 4 Cols: Active Narrative Threads & Open Questions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Narrative Threads */}
          <div className="bg-white rounded-xl border border-[#EBE8E2] p-5 shadow-2xs">
            <h3 className="font-serif font-semibold text-[#1A1814] text-sm mb-1 flex items-center justify-between">
              <span>Narrative Threads</span>
              <span className="text-xs font-mono text-[#AAA69F] font-normal">{threads.length}</span>
            </h3>
            <p className="text-[11px] text-[#8C887F] mb-3">
              Tracks plot arcs and recurring motifs across chapters.
            </p>

            <div className="space-y-2">
              {threads.map((th) => (
                <div key={th.id} className="p-3 rounded-lg border border-[#EBE8E2] bg-[#FAF9F5] text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: th.color || '#D4A373' }}
                    />
                    <div className="font-medium text-xs text-[#1A1814]">{th.title}</div>
                  </div>
                  <div className="text-[11px] text-[#6C6960] line-clamp-2 leading-relaxed">
                    {th.description}
                  </div>
                  <div className="mt-2 pt-1 border-t border-[#EBE8E2] text-[10px] text-[#8C887F] font-mono">
                    Touches {th.linkedSceneIds.length} scenes
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Research & Questions */}
          <div className="bg-white rounded-xl border border-[#EBE8E2] p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-serif font-semibold text-[#1A1814] text-sm">
                Open Questions & Research
              </h3>
              <button
                onClick={onAddNote}
                className="text-xs text-[#D4A373] hover:text-[#b88554] font-medium cursor-pointer"
              >
                + Note
              </button>
            </div>
            <p className="text-[11px] text-[#8C887F] mb-3">
              Unresolved inquiries to research before final passes.
            </p>

            <div className="space-y-2.5">
              {notes.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-lg border text-xs ${
                    n.resolved ? 'bg-[#FAF9F5] border-[#EBE8E2] opacity-60' : 'bg-white border-[#EBE8E2]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-[#1A1814] text-[11px]">{n.title}</span>
                    <button
                      onClick={() => onUpdateNote({ ...n, resolved: !n.resolved })}
                      className="text-[#AAA69F] hover:text-emerald-700 cursor-pointer"
                    >
                      <CheckCircle2 size={13} className={n.resolved ? 'text-emerald-600' : ''} />
                    </button>
                  </div>
                  <p className="text-[11px] text-[#8C887F] line-clamp-2 leading-relaxed">
                    {n.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
