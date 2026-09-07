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
  Sparkles,
  Sliders,
  Edit3,
  Check,
  RefreshCw,
  HelpCircle,
  X,
  Target,
  Flag,
  Calendar,
  Trash2,
  Filter,
  CheckSquare
} from 'lucide-react';
import {
  ensureChapters,
  calculateChapterWordCount,
  getScenesForChapter,
  getUnassignedScenes,
  getAllActs,
  getScenesForAct,
  getChaptersForAct,
  STANDARD_DRAMATIC_BEATS,
  DramaticBeatDefinition
} from '../utils/chapterUtils';

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
  onAddChapter?: (title?: string, actOrPhase?: string) => string | void;
  onUpdateChapter?: (chapterId: string, fields: Partial<Chapter>) => void;
  onDeleteChapter?: (chapterId: string) => void;
  onUpdateChapters?: (chapters: Chapter[]) => void;
  onUpdateScene?: (sceneId: string, updatedFields: Partial<Scene>) => void;
  onUpdateNote: (note: NoteItem) => void;
  onAddNote: () => void;
}

class DashboardErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Corkboard render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-6xl mx-auto p-6 sm:p-8 space-y-4 animate-fade-in">
          <div className="bg-[#FAF6EE] p-6 rounded-[8px] border border-amber-300 shadow-warm-md">
            <div className="flex items-center gap-3 text-amber-800 mb-2">
              <AlertCircle size={22} className="text-[#B54B32]" />
              <h2 className="font-serif font-bold text-lg text-[#221E18]">Corkboard Recovery Mode</h2>
            </div>
            <p className="text-xs text-[#7A705F] mb-4 leading-relaxed">
              Threadline detected an unexpected scene structure while rendering the index cards.
              Your scenes and manuscript remain completely safe.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-4 py-2 bg-[#221E18] text-[#FAF6EE] text-xs font-semibold rounded-[6px] hover:bg-black cursor-pointer shadow-warm-xs"
              >
                Reload Corkboard
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const DashboardScreenInner: React.FC<DashboardScreenProps> = ({
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
  onAddChapter,
  onUpdateChapter,
  onDeleteChapter,
  onUpdateChapters,
  onUpdateScene,
  onUpdateNote,
  onAddNote
}) => {
  const [viewMode, setViewMode] = useState<'chapters' | 'acts' | 'beats' | 'flat'>('chapters');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [collapsedChapters, setCollapsedChapters] = useState<Record<string, boolean>>({});
  const [collapsedActs, setCollapsedActs] = useState<Record<string, boolean>>({});

  // Chapter Creation State
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newChapterPhase, setNewChapterPhase] = useState('Act I: Setup');
  const [newChapterDesc, setNewChapterDesc] = useState('');

  // Chapter Edit State
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);

  // Scene Mapping Modal State
  const [mappingScene, setMappingScene] = useState<Scene | null>(null);
  const [mapChapterId, setMapChapterId] = useState('');
  const [mapActOrPhase, setMapActOrPhase] = useState('');
  const [mapNarrativeBeat, setMapNarrativeBeat] = useState('');

  // Beat Guide Modal State
  const [showBeatGuide, setShowBeatGuide] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  const effectiveChapters = ensureChapters(scenes, chapters);
  const unassignedScenes = getUnassignedScenes(scenes, effectiveChapters);
  const allActs = getAllActs(effectiveChapters, scenes);

  const toggleChapter = (chapterId: string) => {
    setCollapsedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  const toggleAct = (actName: string) => {
    setCollapsedActs((prev) => ({
      ...prev,
      [actName]: !prev[actName]
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

  // Diagnostic coverage counts
  const scenesWithActs = scenes.filter((s) => s.actOrPhase || effectiveChapters.find((c) => c.id === s.chapterId)?.actOrPhase).length;
  const scenesWithBeats = scenes.filter((s) => s.narrativeBeat?.trim()).length;

  const handleCreateChapterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapterTitle.trim()) return;

    const nextNum = effectiveChapters.length > 0 ? Math.max(...effectiveChapters.map((c) => c.number)) + 1 : 1;
    const newChapId = 'chap-' + Date.now();
    const newChap: Chapter = {
      id: newChapId,
      number: nextNum,
      title: newChapterTitle.trim(),
      actOrPhase: newChapterPhase.trim() || 'Act I: Setup',
      description: newChapterDesc.trim() || undefined,
      sceneIds: []
    };

    if (onAddChapter) {
      onAddChapter(newChap.title, newChap.actOrPhase);
    } else if (onUpdateChapters) {
      onUpdateChapters([...effectiveChapters, newChap]);
    }

    setNewChapterTitle('');
    setNewChapterDesc('');
    setIsAddingChapter(false);
    showNotice(`Created Chapter ${nextNum}: "${newChap.title}"`);
  };

  const handleEditChapterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChapter) return;

    if (onUpdateChapter) {
      onUpdateChapter(editingChapter.id, {
        title: editingChapter.title,
        actOrPhase: editingChapter.actOrPhase,
        description: editingChapter.description
      });
    } else if (onUpdateChapters) {
      onUpdateChapters(
        effectiveChapters.map((c) => (c.id === editingChapter.id ? editingChapter : c))
      );
    }

    setEditingChapter(null);
    showNotice(`Updated Chapter: "${editingChapter.title}"`);
  };

  const handleDeleteChapterClick = (chapterId: string) => {
    if (window.confirm('Delete this chapter? Scenes inside will remain as unassigned drafts.')) {
      if (onDeleteChapter) {
        onDeleteChapter(chapterId);
      } else if (onUpdateChapters) {
        onUpdateChapters(effectiveChapters.filter((c) => c.id !== chapterId));
      }
      setEditingChapter(null);
      showNotice('Chapter removed');
    }
  };

  // Open mapping modal for a scene
  const openMappingModal = (scene: Scene, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setMappingScene(scene);
    setMapChapterId(scene.chapterId || '');
    setMapActOrPhase(scene.actOrPhase || effectiveChapters.find((c) => c.id === scene.chapterId)?.actOrPhase || 'Act I: Setup');
    setMapNarrativeBeat(scene.narrativeBeat || '');
  };

  const handleSaveSceneMapping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mappingScene || !onUpdateScene) return;

    const targetChap = effectiveChapters.find((c) => c.id === mapChapterId);

    const updatedFields: Partial<Scene> = {
      chapterId: mapChapterId || undefined,
      chapterNumber: targetChap?.number,
      chapterTitle: targetChap?.title,
      actOrPhase: mapActOrPhase.trim() || targetChap?.actOrPhase || 'Act I: Setup',
      narrativeBeat: mapNarrativeBeat.trim() || undefined
    };

    onUpdateScene(mappingScene.id, updatedFields);

    // Update chapter sceneIds if changed
    if (onUpdateChapters && mapChapterId !== mappingScene.chapterId) {
      const updatedChapters = effectiveChapters.map((c) => {
        // Remove from old chapter
        if (c.id === mappingScene.chapterId) {
          return {
            ...c,
            sceneIds: (c.sceneIds || []).filter((id) => id !== mappingScene.id)
          };
        }
        // Add to new chapter
        if (c.id === mapChapterId) {
          return {
            ...c,
            sceneIds: [...(c.sceneIds || []).filter((id) => id !== mappingScene.id), mappingScene.id]
          };
        }
        return c;
      });
      onUpdateChapters(updatedChapters);
    }

    setMappingScene(null);
    showNotice(`Mapped "${mappingScene.title}" to ${targetChap?.title ? `Ch. ${targetChap.number}` : 'Unassigned'} & ${updatedFields.actOrPhase}`);
  };

  // Auto-sync acts from chapters to scenes
  const handleAutoSyncActs = () => {
    if (!onUpdateScene) return;
    let syncedCount = 0;
    scenes.forEach((sc) => {
      const parentChap = effectiveChapters.find((c) => c.id === sc.chapterId || c.number === sc.chapterNumber);
      if (parentChap?.actOrPhase && sc.actOrPhase !== parentChap.actOrPhase) {
        onUpdateScene(sc.id, {
          actOrPhase: parentChap.actOrPhase,
          chapterNumber: parentChap.number,
          chapterTitle: parentChap.title
        });
        syncedCount++;
      }
    });
    showNotice(syncedCount > 0 ? `Synced Acts for ${syncedCount} scenes from chapter structure.` : 'All scenes are already in sync with chapters.');
  };

  const showNotice = (msg: string) => {
    setSyncToast(msg);
    setTimeout(() => setSyncToast(null), 3200);
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

  // Standard Act Presets
  const actPresets = [
    'Act I: Setup',
    'Act I: The Crossing',
    'Act II: Confrontation',
    'Act II: Midpoint Pivot',
    'Act III: Resolution'
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-10 pb-24 md:pb-12 text-[#221E18] min-w-0 overflow-x-hidden">
      {/* TOAST NOTIFICATION */}
      {syncToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#221E18] text-[#FAF6EE] px-4 py-2.5 rounded-[6px] shadow-warm-lg text-xs font-mono flex items-center gap-2 border border-[rgba(255,255,255,0.1)] animate-fade-in">
          <Sparkles size={14} className="text-[#B54B32]" />
          <span>{syncToast}</span>
        </div>
      )}

      {/* 1. SCREEN HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 w-full min-w-0">
        <div>
          <span className="section-label block mb-1">
            Structure &amp; Arc Index
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#221E18] font-semibold">
            Corkboard &amp; Scene Matrix
          </h1>
          <p className="text-[#7A705F] text-xs sm:text-sm mt-1">
            Digital index cards organized by chapters, acts, and dramatic beats to ensure narrative continuity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-[#F1EAD9] border border-[rgba(34,30,24,0.12)] px-2.5 sm:px-3 py-1.5 rounded-[6px] text-[11px] sm:text-xs font-mono text-[#7A705F] max-w-full">
            {effectiveChapters.length} Ch · {allActs.length} Acts · {completedScenes}/{scenes.length} Scenes · {totalWords.toLocaleString()} w
          </div>

          <button
            onClick={() => setIsAddingChapter(true)}
            className="px-3 py-1.5 bg-[#F1EAD9] hover:bg-[#EAE4D6] border border-[rgba(34,30,24,0.12)] text-[#221E18] rounded-[6px] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer min-h-[36px]"
          >
            <Bookmark size={13} className="text-[#35505F]" />
            <span>Add Chapter</span>
          </button>

          <button
            onClick={onAddScene}
            className="px-3 py-1.5 bg-[#B54B32] hover:bg-[#9E3E27] text-[#FAF6EE] rounded-[6px] text-xs font-semibold flex items-center gap-1.5 shadow-warm-sm transition-colors cursor-pointer min-h-[36px]"
          >
            <Plus size={13} />
            <span>Add Scene</span>
          </button>
        </div>
      </div>

      {/* 2. STRUCTURE & MAPPING HEALTH BAR (Diagnostic Overview) */}
      <div className="mb-6 bg-[#F1EAD9] p-4 rounded-[6px] border border-[rgba(34,30,24,0.12)] space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Target size={15} className="text-[#B54B32]" />
            <span className="font-serif font-semibold text-sm text-[#221E18]">
              Story Architecture &amp; Mapping Integrity
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleAutoSyncActs}
              className="px-2.5 py-1 bg-[#FAF6EE] hover:bg-white border border-[rgba(34,30,24,0.12)] text-[#221E18] rounded-[4px] text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Ensure all scenes inherit their chapter's Act or narrative phase"
            >
              <RefreshCw size={12} className="text-[#35505F]" />
              <span>Auto-Sync Acts</span>
            </button>
            <button
              onClick={() => setShowBeatGuide(true)}
              className="px-2.5 py-1 bg-[#FAF6EE] hover:bg-white border border-[rgba(34,30,24,0.12)] text-[#221E18] rounded-[4px] text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <HelpCircle size={12} className="text-[#7A705F]" />
              <span>Beat Guide</span>
            </button>
          </div>
        </div>

        {/* Diagnostic Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="bg-[#FAF6EE] p-2.5 rounded-[4px] border border-[rgba(34,30,24,0.08)]">
            <div className="text-[10px] font-mono uppercase text-[#7A705F]">Chapters Registered</div>
            <div className="text-base font-serif font-bold text-[#221E18] mt-0.5">
              {effectiveChapters.length} Chapters
            </div>
            <div className="text-[10px] text-[#7A705F] truncate">
              Across {allActs.length} narrative acts
            </div>
          </div>

          <div className="bg-[#FAF6EE] p-2.5 rounded-[4px] border border-[rgba(34,30,24,0.08)]">
            <div className="text-[10px] font-mono uppercase text-[#7A705F]">Act Mapping</div>
            <div className="text-base font-serif font-bold text-[#221E18] mt-0.5 flex items-center gap-1.5">
              <span>{scenesWithActs}/{scenes.length}</span>
              {scenesWithActs === scenes.length ? (
                <CheckCircle2 size={13} className="text-emerald-600" />
              ) : (
                <AlertCircle size={13} className="text-amber-600" />
              )}
            </div>
            <div className="text-[10px] text-[#7A705F]">
              {scenesWithActs === scenes.length ? '100% scenes mapped to acts' : `${scenes.length - scenesWithActs} unmapped scenes`}
            </div>
          </div>

          <div className="bg-[#FAF6EE] p-2.5 rounded-[4px] border border-[rgba(34,30,24,0.08)]">
            <div className="text-[10px] font-mono uppercase text-[#7A705F]">Dramatic Beats</div>
            <div className="text-base font-serif font-bold text-[#221E18] mt-0.5 flex items-center gap-1.5">
              <span>{scenesWithBeats}/{scenes.length}</span>
              {scenesWithBeats === scenes.length ? (
                <CheckCircle2 size={13} className="text-emerald-600" />
              ) : (
                <Flag size={13} className="text-[#35505F]" />
              )}
            </div>
            <div className="text-[10px] text-[#7A705F]">
              {scenesWithBeats > 0 ? `${scenesWithBeats} scenes assigned to beats` : 'Draft your beats below'}
            </div>
          </div>

          <div className="bg-[#FAF6EE] p-2.5 rounded-[4px] border border-[rgba(34,30,24,0.08)]">
            <div className="text-[10px] font-mono uppercase text-[#7A705F]">Unassigned Scenes</div>
            <div className="text-base font-serif font-bold text-[#221E18] mt-0.5 flex items-center gap-1.5">
              <span>{unassignedScenes.length}</span>
              {unassignedScenes.length === 0 ? (
                <CheckCircle2 size={13} className="text-emerald-600" />
              ) : (
                <AlertCircle size={13} className="text-amber-600" />
              )}
            </div>
            <div className="text-[10px] text-[#7A705F]">
              {unassignedScenes.length === 0 ? 'All scenes in chapters' : 'Loose scratchpad scenes'}
            </div>
          </div>
        </div>

        {/* Pacing Word Count Ribbon */}
        <div className="pt-2 border-t border-[rgba(34,30,24,0.08)]">
          <div className="flex items-center justify-between text-[11px] text-[#7A705F] mb-1 font-mono">
            <span>Manuscript Distribution: {totalWords.toLocaleString()} Words</span>
            <span>Target: {(project.targetWordCount || 50000).toLocaleString()} Words ({Math.min(100, Math.round((totalWords / (project.targetWordCount || 50000)) * 100))}%)</span>
          </div>
          <div className="w-full bg-[#FAF6EE] h-2 rounded-full overflow-hidden border border-[rgba(34,30,24,0.1)]">
            <div
              className="bg-[#B54B32] h-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.round((totalWords / (project.targetWordCount || 50000)) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. ADD CHAPTER MODAL / INLINE FORM */}
      {isAddingChapter && (
        <form
          onSubmit={handleCreateChapterSubmit}
          className="mb-6 p-4 sm:p-5 bg-[#F1EAD9] border-2 border-[#B54B32]/40 rounded-[6px] space-y-3.5 shadow-warm-md animate-fade-in"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-semibold text-base text-[#221E18] flex items-center gap-2">
              <Bookmark size={15} className="text-[#B54B32]" />
              <span>Create New Chapter Structure</span>
            </h3>
            <span className="text-xs font-mono text-[#7A705F]">
              Next Chapter #{effectiveChapters.length > 0 ? Math.max(...effectiveChapters.map((c) => c.number)) + 1 : 1}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-mono font-semibold text-[#7A705F] uppercase mb-1">
                Chapter Title *
              </label>
              <input
                type="text"
                placeholder="e.g., The Salt Barges at Midnight"
                value={newChapterTitle}
                onChange={(e) => setNewChapterTitle(e.target.value)}
                className="w-full p-2 bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[6px] text-xs text-[#221E18] focus:outline-none focus:border-[#35505F]"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-semibold text-[#7A705F] uppercase mb-1">
                Act / Narrative Phase
              </label>
              <input
                type="text"
                list="act-suggestions"
                placeholder="e.g. Act I: Setup"
                value={newChapterPhase}
                onChange={(e) => setNewChapterPhase(e.target.value)}
                className="w-full p-2 bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[6px] text-xs text-[#221E18] focus:outline-none focus:border-[#35505F]"
              />
              <datalist id="act-suggestions">
                {actPresets.map((ap) => (
                  <option key={ap} value={ap} />
                ))}
              </datalist>
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
              Save Chapter
            </button>
          </div>
        </form>
      )}

      {/* 4. EDIT CHAPTER MODAL */}
      {editingChapter && (
        <form
          onSubmit={handleEditChapterSubmit}
          className="mb-6 p-4 sm:p-5 bg-[#F1EAD9] border-2 border-[#35505F]/40 rounded-[6px] space-y-3.5 shadow-warm-md animate-fade-in"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-semibold text-base text-[#221E18] flex items-center gap-2">
              <Edit3 size={15} className="text-[#35505F]" />
              <span>Edit Chapter {editingChapter.number}: {editingChapter.title}</span>
            </h3>
            <button
              type="button"
              onClick={() => handleDeleteChapterClick(editingChapter.id)}
              className="text-red-700 hover:text-red-900 text-xs flex items-center gap-1 font-mono"
            >
              <Trash2 size={13} />
              <span>Delete Chapter</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-mono font-semibold text-[#7A705F] uppercase mb-1">
                Chapter Title
              </label>
              <input
                type="text"
                value={editingChapter.title}
                onChange={(e) => setEditingChapter({ ...editingChapter, title: e.target.value })}
                className="w-full p-2 bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[6px] text-xs text-[#221E18] focus:outline-none focus:border-[#35505F]"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-semibold text-[#7A705F] uppercase mb-1">
                Act / Narrative Phase
              </label>
              <input
                type="text"
                list="act-suggestions-edit"
                value={editingChapter.actOrPhase || ''}
                onChange={(e) => setEditingChapter({ ...editingChapter, actOrPhase: e.target.value })}
                className="w-full p-2 bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[6px] text-xs text-[#221E18] focus:outline-none focus:border-[#35505F]"
              />
              <datalist id="act-suggestions-edit">
                {actPresets.map((ap) => (
                  <option key={ap} value={ap} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono font-semibold text-[#7A705F] uppercase mb-1">
              Chapter Synopsis / Goal
            </label>
            <textarea
              rows={2}
              value={editingChapter.description || ''}
              onChange={(e) => setEditingChapter({ ...editingChapter, description: e.target.value })}
              className="w-full p-2 bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[6px] text-xs text-[#221E18] focus:outline-none focus:border-[#35505F]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditingChapter(null)}
              className="px-3 py-1.5 text-xs text-[#7A705F] hover:text-[#221E18] cursor-pointer min-h-[36px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#221E18] hover:bg-black text-[#FAF6EE] rounded-[6px] text-xs font-semibold cursor-pointer min-h-[36px]"
            >
              Save Changes
            </button>
          </div>
        </form>
      )}

      {/* 5. CONTROLS: VIEW SWITCHER (4 VIEW MODES) & STATUS FILTERS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 w-full min-w-0">
        {/* 4 View Modes */}
        <div className="w-full md:w-auto flex items-center bg-[#F1EAD9] p-0.5 rounded-[6px] border border-[rgba(34,30,24,0.12)] overflow-x-auto no-scrollbar min-w-0 max-w-full">
          <button
            onClick={() => setViewMode('chapters')}
            className={`px-3 py-1.5 rounded-[5px] text-xs font-medium transition-colors duration-150 cursor-pointer flex items-center gap-1.5 min-h-[32px] whitespace-nowrap border ${
              viewMode === 'chapters'
                ? 'bg-[#FAF6EE] text-[#221E18] shadow-warm-sm border-[rgba(34,30,24,0.12)]'
                : 'text-[#7A705F] hover:text-[#221E18] border-transparent'
            }`}
          >
            <BookOpen size={12} />
            <span>By Chapter ({effectiveChapters.length})</span>
          </button>

          <button
            onClick={() => setViewMode('acts')}
            className={`px-3 py-1.5 rounded-[5px] text-xs font-medium transition-colors duration-150 cursor-pointer flex items-center gap-1.5 min-h-[32px] whitespace-nowrap border ${
              viewMode === 'acts'
                ? 'bg-[#FAF6EE] text-[#221E18] shadow-warm-sm border-[rgba(34,30,24,0.12)]'
                : 'text-[#7A705F] hover:text-[#221E18] border-transparent'
            }`}
          >
            <Compass size={12} />
            <span>By Act / Phase ({allActs.length})</span>
          </button>

          <button
            onClick={() => setViewMode('beats')}
            className={`px-3 py-1.5 rounded-[5px] text-xs font-medium transition-colors duration-150 cursor-pointer flex items-center gap-1.5 min-h-[32px] whitespace-nowrap border ${
              viewMode === 'beats'
                ? 'bg-[#FAF6EE] text-[#221E18] shadow-warm-sm border-[rgba(34,30,24,0.12)]'
                : 'text-[#7A705F] hover:text-[#221E18] border-transparent'
            }`}
          >
            <Target size={12} />
            <span>Dramatic Beats (12)</span>
          </button>

          <button
            onClick={() => setViewMode('flat')}
            className={`px-3 py-1.5 rounded-[5px] text-xs font-medium transition-colors duration-150 cursor-pointer flex items-center gap-1.5 min-h-[32px] whitespace-nowrap border ${
              viewMode === 'flat'
                ? 'bg-[#FAF6EE] text-[#221E18] shadow-warm-sm border-[rgba(34,30,24,0.12)]'
                : 'text-[#7A705F] hover:text-[#221E18] border-transparent'
            }`}
          >
            <Layers size={12} />
            <span>Flat Sequence ({scenes.length})</span>
          </button>
        </div>

        {/* Status Filter Chips */}
        <div className="w-full md:w-auto flex items-center gap-1 text-xs bg-[#F1EAD9] p-0.5 rounded-[6px] border border-[rgba(34,30,24,0.12)] overflow-x-auto no-scrollbar min-w-0 max-w-full">
          {['all', 'draft', 'revised', 'complete'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-[5px] capitalize font-medium transition-colors duration-150 cursor-pointer whitespace-nowrap min-h-[30px] border ${
                filterStatus === st
                  ? 'bg-[#FAF6EE] text-[#221E18] shadow-warm-sm border-[rgba(34,30,24,0.12)]'
                  : 'text-[#7A705F] hover:text-[#221E18] border-transparent'
              }`}
            >
              {st === 'draft' ? 'Drafting' : st === 'complete' ? 'Final' : st}
            </button>
          ))}
        </div>
      </div>

      {/* 6. CORKBOARD CONTENT PANELS */}
      <div className="space-y-6">
        {/* ========================================================================= */}
        {/* VIEW 1: BY CHAPTER                                                        */}
        {/* ========================================================================= */}
        {viewMode === 'chapters' && (
          <>
            {effectiveChapters.map((chap) => {
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
                  {/* Chapter Header Banner */}
                  <div className="p-3.5 sm:p-4 bg-[#F1EAD9] border-b border-[rgba(34,30,24,0.12)] flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        onClick={() => toggleChapter(chap.id)}
                        className="text-[#7A705F] hover:text-[#221E18] p-1 rounded transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                      >
                        {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
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
                        {chap.description && (
                          <p className="text-[11px] text-[#7A705F] line-clamp-1 italic mt-0.5">
                            {chap.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-mono text-[#7A705F] hidden sm:inline">
                        {chapWords.toLocaleString()} words · {chapScenes.length} scenes
                      </span>

                      <button
                        onClick={() => setEditingChapter(chap)}
                        className="p-1.5 text-[#7A705F] hover:text-[#221E18] hover:bg-[#FAF6EE] border border-transparent hover:border-[rgba(34,30,24,0.12)] rounded-[4px] cursor-pointer"
                        title="Edit chapter metadata"
                      >
                        <Sliders size={13} />
                      </button>

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

                  {/* Index Cards in this Chapter */}
                  {!isCollapsed && (
                    <div className="p-4 bg-[#FAF6EE]">
                      {chapScenes.length === 0 ? (
                        <div className="p-6 text-center text-xs text-[#7A705F] italic flex flex-col items-center gap-2">
                          <span>No scenes in this chapter yet.</span>
                          {onAddSceneToChapter && (
                            <button
                              onClick={() => onAddSceneToChapter(chap.id)}
                              className="px-3 py-1 bg-[#F1EAD9] hover:bg-[#EAE4D6] border border-[rgba(34,30,24,0.12)] rounded-[4px] text-xs font-semibold text-[#221E18]"
                            >
                              + Create First Scene in Ch. {chap.number}
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                          {chapScenes.map((scene) => (
                            <SceneIndexCard
                              key={scene.id}
                              scene={scene}
                              chapter={chap}
                              onNavigate={() => onNavigateToScene(scene.id)}
                              onOpenMapping={(e) => openMappingModal(scene, e)}
                              getStatusBadge={getStatusBadge}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* UNASSIGNED SCENES SECTION (Ensures zero missing pieces!) */}
            {unassignedScenes.length > 0 && (
              <div className="bg-[#FAF6EE] rounded-[6px] border-2 border-dashed border-amber-600/40 p-4 shadow-warm-sm">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} className="text-amber-600" />
                    <div>
                      <h3 className="font-serif font-semibold text-sm text-[#221E18]">
                        Unassigned Scenes &amp; Loose Drafts ({unassignedScenes.length})
                      </h3>
                      <p className="text-[11px] text-[#7A705F]">
                        These scenes are not currently mapped to any chapter. Click "Map" on any card to assign.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {unassignedScenes.map((scene) => (
                    <SceneIndexCard
                      key={scene.id}
                      scene={scene}
                      chapter={undefined}
                      onNavigate={() => onNavigateToScene(scene.id)}
                      onOpenMapping={(e) => openMappingModal(scene, e)}
                      getStatusBadge={getStatusBadge}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: BY ACT / NARRATIVE PHASE                                          */}
        {/* ========================================================================= */}
        {viewMode === 'acts' && (
          <div className="space-y-6">
            {allActs.map((actName, actIdx) => {
              const actScenes = getScenesForAct(scenes, actName, effectiveChapters).filter((s) => {
                if (filterStatus === 'all') return true;
                return s.status === filterStatus;
              });
              const actChapters = getChaptersForAct(effectiveChapters, actName);
              const actWords = actScenes.reduce((acc, s) => acc + (s.wordCount || 0), 0);
              const isCollapsed = !!collapsedActs[actName];

              return (
                <div
                  key={actName}
                  className="bg-[#F1EAD9] rounded-[6px] border border-[rgba(34,30,24,0.12)] shadow-warm-sm overflow-hidden"
                >
                  {/* Act Header Banner */}
                  <div className="p-4 bg-[#F1EAD9] border-b border-[rgba(34,30,24,0.12)] flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => toggleAct(actName)}
                        className="text-[#7A705F] hover:text-[#221E18] p-1 rounded cursor-pointer"
                      >
                        {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded-[4px] bg-[#B54B32] text-[#FAF6EE]">
                            Phase {actIdx + 1}
                          </span>
                          <span className="text-xs font-mono text-[#7A705F]">
                            {actChapters.length} Chapters · {actScenes.length} Scenes
                          </span>
                        </div>
                        <h2 className="font-serif font-bold text-lg text-[#221E18] mt-0.5">
                          {actName}
                        </h2>
                      </div>
                    </div>

                    <div className="text-xs font-mono text-[#7A705F]">
                      {actWords.toLocaleString()} words in this phase
                    </div>
                  </div>

                  {!isCollapsed && (
                    <div className="p-4 bg-[#FAF6EE] space-y-4">
                      {/* Chapters in this Act */}
                      {actChapters.length > 0 && (
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                          <span className="text-[10px] font-mono text-[#7A705F] uppercase tracking-wider shrink-0">
                            Chapters:
                          </span>
                          {actChapters.map((c) => (
                            <span
                              key={c.id}
                              className="px-2 py-1 bg-[#F1EAD9] border border-[rgba(34,30,24,0.1)] rounded-[4px] text-[11px] font-medium text-[#221E18] whitespace-nowrap"
                            >
                              Ch. {c.number}: {c.title}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Scene Cards in this Act */}
                      {actScenes.length === 0 ? (
                        <div className="p-6 text-center text-xs text-[#7A705F] italic">
                          No scenes mapped to {actName} matching current filter.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                          {actScenes.map((scene) => {
                            const parentChap = effectiveChapters.find(
                              (c) => c.id === scene.chapterId || c.number === scene.chapterNumber
                            );
                            return (
                              <SceneIndexCard
                                key={scene.id}
                                scene={scene}
                                chapter={parentChap}
                                onNavigate={() => onNavigateToScene(scene.id)}
                                onOpenMapping={(e) => openMappingModal(scene, e)}
                                getStatusBadge={getStatusBadge}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: BY DRAMATIC BEATS (BEAT SHEET MATRIX)                             */}
        {/* ========================================================================= */}
        {viewMode === 'beats' && (
          <div className="space-y-4">
            <div className="p-4 bg-[#F1EAD9] rounded-[6px] border border-[rgba(34,30,24,0.12)] flex items-center justify-between">
              <div>
                <h2 className="font-serif font-semibold text-base text-[#221E18]">
                  Canonical 12-Beat Story Matrix
                </h2>
                <p className="text-xs text-[#7A705F] mt-0.5">
                  Verify how each key dramatic turning point maps into your scenes and chapters.
                </p>
              </div>
              <button
                onClick={() => setShowBeatGuide(true)}
                className="px-3 py-1.5 bg-[#FAF6EE] hover:bg-white border border-[rgba(34,30,24,0.12)] rounded-[4px] text-xs font-semibold text-[#221E18] flex items-center gap-1.5"
              >
                <HelpCircle size={13} />
                <span>Framework Reference</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {STANDARD_DRAMATIC_BEATS.map((beat) => {
                // Find scenes mapped to this beat
                const beatSegment = beat.name.split('.')[1]?.trim().toLowerCase() || beat.name.toLowerCase();
                const mappedScenes = scenes.filter((s) => {
                  if (!s) return false;
                  const nBeat = (s.narrativeBeat || '').toLowerCase();
                  const sTitle = (s.title || '').toLowerCase();
                  return (
                    (beatSegment && nBeat.includes(beatSegment)) ||
                    nBeat === beat.name.toLowerCase() ||
                    (beatSegment && sTitle.includes(beatSegment))
                  );
                });

                const hasScene = mappedScenes.length > 0;

                return (
                  <div
                    key={beat.id}
                    className={`rounded-[6px] border p-4 transition-all ${
                      hasScene
                        ? 'bg-[#FAF6EE] border-[rgba(34,30,24,0.12)] shadow-warm-sm'
                        : 'bg-[#F1EAD9]/60 border-dashed border-[rgba(34,30,24,0.18)]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-[4px] bg-[#221E18] text-[#FAF6EE] uppercase">
                            {beat.act}
                          </span>
                          <span className="text-xs font-mono text-[#7A705F]">Beat #{beat.defaultOrder}</span>
                        </div>
                        <h3 className="font-serif font-bold text-base text-[#221E18] mt-1">
                          {beat.name}
                        </h3>
                        <p className="text-xs text-[#7A705F] mt-0.5 leading-relaxed max-w-3xl">
                          {beat.description}
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {hasScene ? (
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-[4px] text-[11px] font-mono font-semibold flex items-center gap-1">
                            <CheckCircle2 size={12} />
                            <span>{mappedScenes.length} Scene{mappedScenes.length > 1 ? 's' : ''} Mapped</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded-[4px] text-[11px] font-mono flex items-center gap-1">
                            <AlertCircle size={12} />
                            <span>Unmapped Beat</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Mapped Scenes Cards */}
                    {hasScene ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 border-t border-[rgba(34,30,24,0.08)]">
                        {mappedScenes.map((scene) => {
                          const parentChap = effectiveChapters.find(
                            (c) => c.id === scene.chapterId || c.number === scene.chapterNumber
                          );
                          return (
                            <SceneIndexCard
                              key={scene.id}
                              scene={scene}
                              chapter={parentChap}
                              onNavigate={() => onNavigateToScene(scene.id)}
                              onOpenMapping={(e) => openMappingModal(scene, e)}
                              getStatusBadge={getStatusBadge}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-[rgba(34,30,24,0.08)] flex items-center justify-between text-xs text-[#7A705F]">
                        <span className="italic">No scene drafted for this turning point yet.</span>
                        <button
                          onClick={onAddScene}
                          className="text-[#B54B32] hover:underline font-medium cursor-pointer"
                        >
                          + Draft Scene for Beat #{beat.defaultOrder}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: FLAT SEQUENCE MATRIX                                              */}
        {/* ========================================================================= */}
        {viewMode === 'flat' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {scenes.map((scene, idx) => {
              const parentChap = effectiveChapters.find(
                (c) => c.id === scene.chapterId || c.number === scene.chapterNumber
              );
              return (
                <div key={scene.id} className="relative group">
                  <SceneIndexCard
                    scene={scene}
                    chapter={parentChap}
                    onNavigate={() => onNavigateToScene(scene.id)}
                    onOpenMapping={(e) => openMappingModal(scene, e)}
                    getStatusBadge={getStatusBadge}
                  />

                  {/* Move Up / Down Buttons */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#FAF6EE] p-1 rounded border border-[rgba(34,30,24,0.12)] shadow-warm-sm">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSceneGlobal(idx, 'up');
                      }}
                      disabled={idx === 0}
                      className="p-1 hover:bg-[#F1EAD9] rounded disabled:opacity-30 cursor-pointer text-[#221E18]"
                      title="Move Scene Up"
                    >
                      <MoveUp size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSceneGlobal(idx, 'down');
                      }}
                      disabled={idx === scenes.length - 1}
                      className="p-1 hover:bg-[#F1EAD9] rounded disabled:opacity-30 cursor-pointer text-[#221E18]"
                      title="Move Scene Down"
                    >
                      <MoveDown size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 7. SCENE MAPPING & ARCHITECTURE MODAL                                      */}
      {/* ========================================================================= */}
      {mappingScene && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveSceneMapping}
            className="bg-[#FAF6EE] rounded-[8px] border border-[rgba(34,30,24,0.2)] shadow-warm-lg max-w-lg w-full p-5 space-y-4 animate-fade-in"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(34,30,24,0.12)]">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-[#B54B32]" />
                <h3 className="font-serif font-bold text-base text-[#221E18]">
                  Map Scene Architecture &amp; Beats
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMappingScene(null)}
                className="text-[#7A705F] hover:text-[#221E18] p-1 rounded cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-[#7A705F]">Active Scene</span>
              <div className="font-serif font-semibold text-sm text-[#221E18]">
                {mappingScene.title}
              </div>
            </div>

            {/* Chapter Selection */}
            <div>
              <label className="block text-[10px] font-mono font-semibold text-[#7A705F] uppercase mb-1">
                Assigned Chapter
              </label>
              <select
                value={mapChapterId}
                onChange={(e) => {
                  const newChapId = e.target.value;
                  setMapChapterId(newChapId);
                  const selectedChap = effectiveChapters.find((c) => c.id === newChapId);
                  if (selectedChap?.actOrPhase) {
                    setMapActOrPhase(selectedChap.actOrPhase);
                  }
                }}
                className="w-full p-2 bg-[#F1EAD9] border border-[rgba(34,30,24,0.12)] rounded-[6px] text-xs text-[#221E18] focus:outline-none focus:border-[#35505F]"
              >
                <option value="">-- No Chapter (Loose Draft Scratchpad) --</option>
                {effectiveChapters.map((c) => (
                  <option key={c.id} value={c.id}>
                    Ch. {c.number}: {c.title} ({c.actOrPhase || 'Act I'})
                  </option>
                ))}
              </select>
            </div>

            {/* Act / Narrative Phase Selection */}
            <div>
              <label className="block text-[10px] font-mono font-semibold text-[#7A705F] uppercase mb-1">
                Act / Narrative Phase
              </label>
              <input
                type="text"
                list="act-options-modal"
                value={mapActOrPhase}
                onChange={(e) => setMapActOrPhase(e.target.value)}
                placeholder="e.g. Act I: Setup, Act II: Confrontation"
                className="w-full p-2 bg-[#F1EAD9] border border-[rgba(34,30,24,0.12)] rounded-[6px] text-xs text-[#221E18] focus:outline-none focus:border-[#35505F]"
              />
              <datalist id="act-options-modal">
                {actPresets.map((a) => (
                  <option key={a} value={a} />
                ))}
              </datalist>
            </div>

            {/* Dramatic Beat Selection */}
            <div>
              <label className="block text-[10px] font-mono font-semibold text-[#7A705F] uppercase mb-1">
                Dramatic Narrative Beat
              </label>
              <select
                value={mapNarrativeBeat}
                onChange={(e) => setMapNarrativeBeat(e.target.value)}
                className="w-full p-2 bg-[#F1EAD9] border border-[rgba(34,30,24,0.12)] rounded-[6px] text-xs text-[#221E18] focus:outline-none focus:border-[#35505F]"
              >
                <option value="">-- Custom or Unassigned Beat --</option>
                {STANDARD_DRAMATIC_BEATS.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name} ({b.act})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-[#7A705F] mt-1 italic">
                {STANDARD_DRAMATIC_BEATS.find((b) => b.name === mapNarrativeBeat)?.description ||
                  'Assigning a dramatic beat balances your pacing across the manuscript.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[rgba(34,30,24,0.12)]">
              <button
                type="button"
                onClick={() => setMappingScene(null)}
                className="px-3 py-1.5 text-xs text-[#7A705F] hover:text-[#221E18] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#221E18] hover:bg-black text-[#FAF6EE] rounded-[6px] text-xs font-semibold cursor-pointer shadow-warm-sm"
              >
                Save Architecture Mapping
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. STORY FRAMEWORK & BEAT GUIDE MODAL                                      */}
      {/* ========================================================================= */}
      {showBeatGuide && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF6EE] rounded-[8px] border border-[rgba(34,30,24,0.2)] shadow-warm-lg max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col animate-fade-in">
            <div className="p-4 bg-[#F1EAD9] border-b border-[rgba(34,30,24,0.12)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass size={16} className="text-[#B54B32]" />
                <h3 className="font-serif font-bold text-base text-[#221E18]">
                  Story Architecture &amp; Beat Reference
                </h3>
              </div>
              <button
                onClick={() => setShowBeatGuide(false)}
                className="text-[#7A705F] hover:text-[#221E18] p-1 rounded cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs text-[#221E18]">
              <p className="text-[#7A705F] leading-relaxed">
                Threadline uses a universal 12-beat dramatic matrix compatible with Three-Act Structure, Save the Cat! (Blake Snyder), and The Hero’s Journey. Use this guide to ensure each turning point has adequate narrative weight.
              </p>

              <div className="space-y-3">
                {STANDARD_DRAMATIC_BEATS.map((beat) => (
                  <div
                    key={beat.id}
                    className="p-3 bg-[#F1EAD9] rounded-[6px] border border-[rgba(34,30,24,0.1)] space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-[#221E18]">
                        {beat.name}
                      </span>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#221E18] text-[#FAF6EE]">
                        {beat.act}
                      </span>
                    </div>
                    <p className="text-[#7A705F] leading-relaxed">
                      {beat.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-[#F1EAD9] border-t border-[rgba(34,30,24,0.12)] flex justify-end">
              <button
                onClick={() => setShowBeatGuide(false)}
                className="px-4 py-1.5 bg-[#221E18] text-[#FAF6EE] rounded-[6px] text-xs font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Extracted Sub-Component for Reusable Scene Index Card
interface SceneIndexCardProps {
  scene: Scene;
  chapter?: Chapter;
  onNavigate: () => void;
  onOpenMapping: (e: React.MouseEvent) => void;
  getStatusBadge: (status: Scene['status']) => { label: string; bg: string; text: string };
}

const SceneIndexCard: React.FC<SceneIndexCardProps> = ({
  scene,
  chapter,
  onNavigate,
  onOpenMapping,
  getStatusBadge
}) => {
  const statusInfo = getStatusBadge(scene.status || 'draft');
  const displayAct = String(scene.actOrPhase || chapter?.actOrPhase || 'Act I: Setup');
  const sceneTitle = scene.title || `Scene #${scene.order || 1}`;
  const povDisplay = typeof scene.pov === 'string' && scene.pov.trim() ? scene.pov.split(' ')[0] : 'POV';

  return (
    <div
      onClick={onNavigate}
      className="bg-[#F1EAD9] p-4 rounded-[6px] border border-[rgba(34,30,24,0.12)] shadow-warm-sm hover:border-[#B54B32] transition-all cursor-pointer min-h-[140px] flex flex-col justify-between group"
    >
      <div>
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-1.5 mb-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-[#7A705F]">
              Scene #{scene.order || 1}
            </span>
            <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-[4px] bg-[#221E18] text-[#FAF6EE]">
              {displayAct.split(':')[0] || 'Act'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span
              className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-[4px]"
              style={{ backgroundColor: statusInfo.bg, color: statusInfo.text }}
            >
              {statusInfo.label}
            </span>
            <button
              onClick={onOpenMapping}
              className="p-1 hover:bg-[#FAF6EE] text-[#7A705F] hover:text-[#B54B32] rounded transition-colors"
              title="Map Act and Dramatic Beat"
            >
              <Target size={12} />
            </button>
          </div>
        </div>

        {/* Narrative Beat Tag (If Assigned) */}
        {scene.narrativeBeat ? (
          <div className="inline-flex items-center gap-1 mb-1.5 px-1.5 py-0.5 bg-[#FAF6EE] border border-[rgba(34,30,24,0.1)] rounded-[4px] text-[10px] font-mono text-[#35505F] font-semibold max-w-full truncate">
            <Target size={10} className="text-[#B54B32] shrink-0" />
            <span className="truncate">{scene.narrativeBeat}</span>
          </div>
        ) : (
          <button
            onClick={onOpenMapping}
            className="inline-flex items-center gap-1 mb-1.5 px-1.5 py-0.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-[4px] text-[9px] font-mono text-amber-900 cursor-pointer"
          >
            <span>+ Assign Beat</span>
          </button>
        )}

        {/* Scene Title & Premise */}
        <h4 className="font-serif font-semibold text-sm text-[#221E18] line-clamp-1 group-hover:text-[#B54B32] transition-colors">
          {sceneTitle}
        </h4>
        <p className="text-xs text-[#7A705F] line-clamp-2 mt-1 leading-relaxed">
          {scene.premise || (scene.proseContent ? scene.proseContent.slice(0, 100) : 'No premise drafted yet.')}
        </p>
      </div>

      {/* Footer Details */}
      <div className="pt-2 mt-2 border-t border-[rgba(34,30,24,0.08)] flex items-center justify-between text-[11px] text-[#7A705F]">
        <span className="truncate max-w-[120px]">
          {chapter ? `Ch. ${chapter.number}` : 'Loose Draft'}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <span>{povDisplay}</span>
          <span className="font-mono font-medium">{scene.wordCount || 0} w</span>
        </div>
      </div>
    </div>
  );
};

export const DashboardScreen: React.FC<DashboardScreenProps> = (props) => {
  return (
    <DashboardErrorBoundary>
      <DashboardScreenInner {...props} />
    </DashboardErrorBoundary>
  );
};
