import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Scene,
  Chapter,
  Project,
  EditorialQuery,
  EditorialCategory,
  ManuscriptStyleSheet,
  EditorialPassDef
} from '../../types';
import {
  computeWordDiff,
  calculateDiffStats,
  DiffToken
} from '../../utils/editorialDiff';
import {
  Check,
  X,
  Edit3,
  FileText,
  Split,
  Eye,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  BookOpen,
  Sliders,
  RotateCcw,
  Plus,
  MessageSquare,
  Search,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  Filter,
  Layers,
  Flame,
  Info,
  Send,
  Trash2,
  ListFilter,
  Columns,
  ShieldCheck,
  Download,
  FileCheck,
  Printer,
  Bookmark,
  AlertTriangle,
  PanelLeft,
  Copy
} from 'lucide-react';
import { EditorialSceneNavigator } from './EditorialSceneNavigator';
import { EditorialLetterModal } from './EditorialLetterModal';
import { MergeManuscriptModal } from './MergeManuscriptModal';
import { EditorialExportModal } from './EditorialExportModal';
import { LineEditLensPanel } from '../editor/LineEditLensPanel';
import { LineEditColorCode } from '../../types';
import { extractLineEditsFromMarkdown } from '../../utils/lineEditConstants';

export type EditorialViewMode = 'markup' | 'clean' | 'draft' | 'split';

interface EditorialDeskScreenProps {
  project: Project;
  scenes: Scene[];
  chapters?: Chapter[];
  activeSceneId: string;
  onSelectScene: (sceneId: string) => void;
  onUpdateScene: (sceneId: string, updatedFields: Partial<Scene>) => void;
  onMergeSceneToManuscript?: (sceneId: string, finalProse: string) => void;
  styleSheet?: ManuscriptStyleSheet;
  onUpdateStyleSheet?: (updated: ManuscriptStyleSheet) => void;
  editorialPasses?: EditorialPassDef[];
  onUpdateEditorialPasses?: (passes: EditorialPassDef[]) => void;
  onSwitchToDrafting: () => void;
}

export const DEFAULT_STYLE_SHEET: ManuscriptStyleSheet = {
  oxfordComma: true,
  dialogueQuoteStyle: 'double',
  emDashSpacing: 'closed',
  numbersSpelledUnder: 100,
  customTerms: [
    { term: 'glasshouse', note: 'One word, lowercase in running text unless referencing the Historic Guild Glasshouse.' },
    { term: 'sea-salt', note: 'Hyphenate when modifying flora or atmosphere (sea-salt encrustation).' },
    { term: 'cloche', note: 'French glass bell jar; use lowercase without italics.' },
    { term: 'Gentiana hiberna', note: 'Linnaean binomen; genus capitalized, specific epithet lowercase, italicize.' }
  ],
  flaggedEchoes: ['suddenly', 'very', 'started to', 'seemed to', 'glanced', 'felt like', 'just', 'really']
};

export const DEFAULT_PASSES: EditorialPassDef[] = [
  {
    id: 'pass-dev',
    name: '1. Developmental & Arc Pass',
    stage: 'developmental',
    description: 'Macro story architecture: character motivation, dramatic stakes, and chapter-by-chapter pacing.',
    focus: 'Scene goal integrity, causality, emotional turn, POV consistency',
    completed: true,
    totalChecks: 6,
    completedChecks: 6
  },
  {
    id: 'pass-line',
    name: '2. Line Editing & Cadence Pass',
    stage: 'line',
    description: 'Micro line craft: rhythm, sentence length variety, sensory texture, and pruning conversational filler.',
    focus: 'Sensory imagery, trimming throat-clearing openers, active verbs, tightening fat',
    completed: false,
    totalChecks: 8,
    completedChecks: 5
  },
  {
    id: 'pass-copy',
    name: '3. Copyediting & Style Sheet Pass',
    stage: 'copy',
    description: 'Mechanical precision: enforcing publishing house style, dialogue punctuation, and botanical taxonomy.',
    focus: 'Linnaean italics, em-dashes, number spelling, Oxford commas, hyphenation',
    completed: false,
    totalChecks: 7,
    completedChecks: 3
  },
  {
    id: 'pass-proof',
    name: '4. Galley Proofreading Pass',
    stage: 'proof',
    description: 'Final Galley sweep: catching rogue typographic anomalies, hyphenation collisions, and formatting continuity.',
    focus: 'Typesetting, orphan lines, layout continuity, final export polish',
    completed: false,
    totalChecks: 5,
    completedChecks: 0
  }
];

export const EditorialDeskScreen: React.FC<EditorialDeskScreenProps> = ({
  project,
  scenes = [],
  chapters = [],
  activeSceneId,
  onSelectScene,
  onUpdateScene,
  onMergeSceneToManuscript,
  styleSheet: propStyleSheet,
  onUpdateStyleSheet,
  editorialPasses: propEditorialPasses,
  onUpdateEditorialPasses,
  onSwitchToDrafting
}) => {
  // Active scene resolution
  const activeScene = scenes.find((s) => s.id === activeSceneId) || scenes[0] || {
    id: 'empty',
    title: 'Untitled Scene',
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

  // Navigator drawer state
  const [isNavigatorOpen, setIsNavigatorOpen] = useState(true);

  // View state: 'markup' (redlines), 'clean' (final reading), 'draft' (baseline), 'split' (side-by-side)
  const [viewMode, setViewMode] = useState<EditorialViewMode>('markup');

  // Active right-side inspector tab: 'queries' | 'stylesheet' | 'passes' | 'line-edits'
  const [activeInspectorTab, setActiveInspectorTab] = useState<'queries' | 'stylesheet' | 'passes' | 'line-edits'>('line-edits');

  // Total line edits count in active scene
  const activeSceneLineEdits = useMemo(() => {
    return extractLineEditsFromMarkdown(activeScene.proseContent || '', activeScene.id, activeScene.title);
  }, [activeScene.proseContent, activeScene.id, activeScene.title]);

  const handleRemoveSceneHighlight = (targetText: string) => {
    const escaped = targetText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`==([a-z0-9_-]+):(${escaped})==|==(${escaped})==`, 'gi');
    const updated = (activeScene.proseContent || '').replace(regex, targetText);
    onUpdateScene(activeScene.id, { proseContent: updated });
  };

  const handleChangeSceneHighlightColor = (targetText: string, newColor: LineEditColorCode) => {
    const escaped = targetText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`==([a-z0-9_-]+):(${escaped})==|==(${escaped})==`, 'gi');
    const updated = (activeScene.proseContent || '').replace(regex, `==${newColor}:${targetText}==`);
    onUpdateScene(activeScene.id, { proseContent: updated });
  };

  // Queries filter state
  const [queryCategoryFilter, setQueryCategoryFilter] = useState<string>('all');
  const [showResolvedQueries, setShowResolvedQueries] = useState<boolean>(true);

  // New Query creation state
  const [isAddingQuery, setIsAddingQuery] = useState(false);
  const [newQueryText, setNewQueryText] = useState('');
  const [newQueryExcerpt, setNewQueryExcerpt] = useState('');
  const [newQueryCategory, setNewQueryCategory] = useState<EditorialCategory>('line-edit');

  // Style Sheet term creation state
  const [isAddingTerm, setIsAddingTerm] = useState(false);
  const [newTermWord, setNewTermWord] = useState('');
  const [newTermNote, setNewTermNote] = useState('');
  const [newCrutchWord, setNewCrutchWord] = useState('');

  // Crutch words highlight toggle in the editor
  const [highlightCrutchWords, setHighlightCrutchWords] = useState(false);

  // Modals state
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Local draft baseline and editorial prose tracking
  // Baseline = raw draft snapshot or existing editorial baseline
  // Editorial prose = actively edited working text (independent from proseContent!)
  const rawDraftBaseline = activeScene.editorialBaseline || activeScene.proseContent || '';
  const currentEditedProse =
    activeScene.editorialProseContent !== undefined
      ? activeScene.editorialProseContent
      : activeScene.proseContent;

  const [editableText, setEditableText] = useState(currentEditedProse);

  // Synchronize when activeScene changes
  useEffect(() => {
    setEditableText(
      activeScene.editorialProseContent !== undefined
        ? activeScene.editorialProseContent
        : activeScene.proseContent
    );
  }, [activeScene.id, activeScene.editorialProseContent, activeScene.proseContent]);

  // Compute live word diffs between baseline draft and editorial prose
  const diffTokens: DiffToken[] = useMemo(() => {
    return computeWordDiff(rawDraftBaseline, editableText);
  }, [rawDraftBaseline, editableText]);

  const diffStats = useMemo(() => {
    return calculateDiffStats(diffTokens);
  }, [diffTokens]);

  // Word counts & reading diagnostics
  const baselineWords = (rawDraftBaseline.match(/\b\w+\b/g) || []).length;
  const editedWords = (editableText.match(/\b\w+\b/g) || []).length;
  const wordCountDelta = editedWords - baselineWords;
  const percentChange = baselineWords > 0 ? ((wordCountDelta / baselineWords) * 100).toFixed(1) : '0';

  // Sentences & cadence
  const sentences = editableText.match(/[^.!?]+[.!?]+/g) || [];
  const avgSentenceLength = sentences.length > 0 ? (editedWords / sentences.length).toFixed(1) : '0';
  const readingTimeMin = Math.max(1, Math.ceil(editedWords / 225));

  // Style sheet & passes resolution
  const styleSheet = propStyleSheet || DEFAULT_STYLE_SHEET;
  const passes = propEditorialPasses || DEFAULT_PASSES;

  // Scene queries list
  const queries: EditorialQuery[] = activeScene.editorialQueries || [];

  const filteredQueries = useMemo(() => {
    return queries.filter((q) => {
      const matchCat = queryCategoryFilter === 'all' || q.category === queryCategoryFilter;
      const matchStatus = showResolvedQueries ? true : !q.resolved;
      return matchCat && matchStatus;
    });
  }, [queries, queryCategoryFilter, showResolvedQueries]);

  const openQueriesCount = queries.filter((q) => !q.resolved).length;

  // Echoes & Crutch words detector
  const foundEchoes = useMemo(() => {
    const results: { word: string; count: number }[] = [];
    const textLower = editableText.toLowerCase();

    styleSheet.flaggedEchoes.forEach((echo) => {
      const regex = new RegExp(`\\b${echo}\\b`, 'gi');
      const matches = textLower.match(regex);
      if (matches && matches.length > 0) {
        results.push({ word: echo, count: matches.length });
      }
    });

    return results.sort((a, b) => b.count - a.count);
  }, [editableText, styleSheet.flaggedEchoes]);

  // ---------------------------------------------------------------------------
  // HANDLERS FOR EDITORIAL PROSE (NON-DESTRUCTIVE - DOES NOT TOUCH proseContent)
  // ---------------------------------------------------------------------------

  const handleTextChange = (newVal: string) => {
    setEditableText(newVal);
    // Explicitly only updates editorial working copy fields!
    onUpdateScene(activeScene.id, {
      editorialProseContent: newVal,
      editorialBaseline: activeScene.editorialBaseline || rawDraftBaseline,
      editorialStatus: activeScene.editorialStatus || 'in-review'
    });
  };

  // Revert working copy back to author's original draft
  const handleRevertToOriginalDraft = () => {
    if (window.confirm('Reset this scene’s editorial working copy back to the author’s original draft?')) {
      const original = activeScene.proseContent || '';
      setEditableText(original);
      onUpdateScene(activeScene.id, {
        editorialProseContent: original,
        editorialBaseline: original,
        editorialStatus: 'unedited'
      });
    }
  };

  // Accept all line edits into the working baseline (stays within editorial workspace)
  const handleAcceptAllEdits = () => {
    onUpdateScene(activeScene.id, {
      editorialBaseline: editableText,
      editorialProseContent: editableText,
      editorialStatus: 'line-edited'
    });
  };

  // Reject current edits back to current baseline
  const handleRejectAllEdits = () => {
    setEditableText(rawDraftBaseline);
    onUpdateScene(activeScene.id, {
      editorialProseContent: rawDraftBaseline
    });
  };

  // Mark scene as approved clean for galleys (does NOT overwrite proseContent)
  const handleApproveScene = () => {
    onUpdateScene(activeScene.id, {
      editorialBaseline: editableText,
      editorialProseContent: editableText,
      editorialStatus: 'clean-approved'
    });
  };

  // Explicit Merge to Original Manuscript
  const handleConfirmMerge = (sceneId: string, finalProse: string) => {
    if (onMergeSceneToManuscript) {
      onMergeSceneToManuscript(sceneId, finalProse);
    } else {
      // Fallback: update proseContent directly
      const words = finalProse.trim() ? finalProse.trim().split(/\s+/).filter(Boolean).length : 0;
      onUpdateScene(sceneId, {
        proseContent: finalProse,
        editorialBaseline: finalProse,
        editorialProseContent: finalProse,
        wordCount: words,
        editorialStatus: 'clean-approved'
      });
    }
  };

  // ---------------------------------------------------------------------------
  // QUERIES HANDLERS
  // ---------------------------------------------------------------------------

  const handleOpenAddQuery = () => {
    // Check if user has text selected in window
    const selected = window.getSelection()?.toString().trim();
    if (selected) {
      setNewQueryExcerpt(selected.slice(0, 160));
    }
    setIsAddingQuery(true);
    setActiveInspectorTab('queries');
  };

  const handleSaveNewQuery = () => {
    if (!newQueryText.trim()) return;

    const newQuery: EditorialQuery = {
      id: `eq-${Date.now()}`,
      sceneId: activeScene.id,
      selectionExcerpt: newQueryExcerpt.trim() || 'General Passage',
      comment: newQueryText.trim(),
      category: newQueryCategory,
      severity: newQueryCategory === 'developmental' ? 'critical' : 'suggestion',
      resolved: false,
      author: 'Editorial Desk',
      createdAt: new Date().toISOString()
    };

    const updatedQueries = [...queries, newQuery];
    onUpdateScene(activeScene.id, {
      editorialQueries: updatedQueries
    });

    setNewQueryText('');
    setNewQueryExcerpt('');
    setIsAddingQuery(false);
  };

  const handleToggleQueryResolved = (queryId: string) => {
    const updated = queries.map((q) => (q.id === queryId ? { ...q, resolved: !q.resolved } : q));
    onUpdateScene(activeScene.id, {
      editorialQueries: updated
    });
  };

  const handleSaveAuthorReply = (queryId: string, replyText: string) => {
    const updated = queries.map((q) =>
      q.id === queryId ? { ...q, authorReply: replyText, resolved: true } : q
    );
    onUpdateScene(activeScene.id, {
      editorialQueries: updated
    });
  };

  const handleDeleteQuery = (queryId: string) => {
    const updated = queries.filter((q) => q.id !== queryId);
    onUpdateScene(activeScene.id, {
      editorialQueries: updated
    });
  };

  // ---------------------------------------------------------------------------
  // STYLE SHEET & PASSES HANDLERS
  // ---------------------------------------------------------------------------

  const handleAddCustomTerm = () => {
    if (!newTermWord.trim()) return;
    const updated = {
      ...styleSheet,
      customTerms: [
        ...styleSheet.customTerms,
        { term: newTermWord.trim(), note: newTermNote.trim() || 'Enforce exact spelling and capitalization.' }
      ]
    };
    if (onUpdateStyleSheet) onUpdateStyleSheet(updated);
    setNewTermWord('');
    setNewTermNote('');
    setIsAddingTerm(false);
  };

  const handleDeleteCustomTerm = (termToRemove: string) => {
    const updated = {
      ...styleSheet,
      customTerms: styleSheet.customTerms.filter((t) => t.term !== termToRemove)
    };
    if (onUpdateStyleSheet) onUpdateStyleSheet(updated);
  };

  const handleAddCrutchWord = () => {
    if (!newCrutchWord.trim()) return;
    const word = newCrutchWord.trim().toLowerCase();
    if (!styleSheet.flaggedEchoes.includes(word)) {
      const updated = {
        ...styleSheet,
        flaggedEchoes: [...styleSheet.flaggedEchoes, word]
      };
      if (onUpdateStyleSheet) onUpdateStyleSheet(updated);
    }
    setNewCrutchWord('');
  };

  const handleTogglePassCheck = (passId: string) => {
    if (!onUpdateEditorialPasses) return;
    const updated = passes.map((p) => {
      if (p.id === passId) {
        const nextCompleted = !p.completed;
        return {
          ...p,
          completed: nextCompleted,
          completedChecks: nextCompleted ? p.totalChecks : Math.max(0, p.completedChecks - 1)
        };
      }
      return p;
    });
    onUpdateEditorialPasses(updated);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#FAF6EE] text-[#221E18] overflow-hidden select-none">
      {/* ========================================================================= */}
      {/* 1. TOP DEDICATED EDITORIAL WORKSPACE BANNER                               */}
      {/* ========================================================================= */}
      <div className="border-b border-[rgba(34,30,24,0.12)] bg-[#ECE5D6] px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 shrink-0 z-10">
        {/* Left: Workspace Mode Switcher & Scene Selector */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Dedicated Workspace Switcher */}
          <div className="flex items-center bg-[#FAF6EE] rounded-[6px] border border-[rgba(34,30,24,0.14)] p-0.5 shadow-2xs">
            <button
              onClick={onSwitchToDrafting}
              className="px-2.5 py-1 text-xs font-medium text-[#7A705F] hover:text-[#221E18] rounded-[4px] transition-colors cursor-pointer flex items-center gap-1.5"
              title="Switch to Author Drafting Workspace"
            >
              <FileText size={13} />
              <span>Author Workspace</span>
            </button>
            <div className="px-2.5 py-1 text-xs font-semibold bg-[#221E18] text-[#FAF6EE] rounded-[4px] shadow-2xs flex items-center gap-1.5">
              <Edit3 size={13} className="text-[#DE6346]" />
              <span>Editor Workspace</span>
            </div>
          </div>

          <div className="h-4 w-px bg-[rgba(34,30,24,0.15)] hidden sm:block" />

          {/* Navigator Toggle Button */}
          <button
            onClick={() => setIsNavigatorOpen(!isNavigatorOpen)}
            className={`p-1.5 rounded-[5px] text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer ${
              isNavigatorOpen
                ? 'bg-[#EAE2D1] border-[rgba(34,30,24,0.18)] text-[#221E18]'
                : 'bg-[#FAF6EE] border-[rgba(34,30,24,0.12)] text-[#7A705F] hover:text-[#221E18]'
            }`}
            title="Toggle Manuscript Scene Navigator"
          >
            <Bookmark size={13} className="text-[#B54B32]" />
            <span className="hidden md:inline">Outline</span>
          </button>

          {/* Active Scene Indicator */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-serif font-bold text-[#221E18] truncate max-w-[150px] sm:max-w-[240px]">
              {activeScene.title}
            </span>
            <span
              className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                activeScene.editorialStatus === 'clean-approved'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : activeScene.editorialStatus === 'line-edited'
                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {activeScene.editorialStatus === 'clean-approved'
                ? 'Approved'
                : activeScene.editorialStatus === 'line-edited'
                ? 'Line Edited'
                : 'In Review'}
            </span>
          </div>
        </div>

        {/* Right: Editorial Tools & Actions */}
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          {/* View Modes */}
          <div className="bg-[#FAF6EE] border border-[rgba(34,30,24,0.14)] p-0.5 rounded-[6px] flex items-center text-xs font-medium shadow-2xs">
            <button
              onClick={() => setViewMode('markup')}
              className={`px-2 py-1 rounded-[4px] flex items-center gap-1 cursor-pointer transition-colors ${
                viewMode === 'markup'
                  ? 'bg-[#221E18] text-[#FAF6EE] font-semibold shadow-2xs'
                  : 'text-[#7A705F] hover:text-[#221E18]'
              }`}
              title="Track Changes / Redlines View"
            >
              <Edit3 size={12} className={viewMode === 'markup' ? 'text-[#DE6346]' : ''} />
              <span className="hidden sm:inline">Markup</span>
            </button>

            <button
              onClick={() => setViewMode('split')}
              className={`px-2 py-1 rounded-[4px] flex items-center gap-1 cursor-pointer transition-colors ${
                viewMode === 'split'
                  ? 'bg-[#221E18] text-[#FAF6EE] font-semibold shadow-2xs'
                  : 'text-[#7A705F] hover:text-[#221E18]'
              }`}
              title="Side-by-Side Comparison View"
            >
              <Split size={12} />
              <span className="hidden sm:inline">Split</span>
            </button>

            <button
              onClick={() => setViewMode('clean')}
              className={`px-2 py-1 rounded-[4px] flex items-center gap-1 cursor-pointer transition-colors ${
                viewMode === 'clean'
                  ? 'bg-[#221E18] text-[#FAF6EE] font-semibold shadow-2xs'
                  : 'text-[#7A705F] hover:text-[#221E18]'
              }`}
              title="Clean Edited Reading View"
            >
              <Eye size={12} />
              <span className="hidden sm:inline">Clean</span>
            </button>

            <button
              onClick={() => setViewMode('draft')}
              className={`px-2 py-1 rounded-[4px] flex items-center gap-1 cursor-pointer transition-colors ${
                viewMode === 'draft'
                  ? 'bg-[#221E18] text-[#FAF6EE] font-semibold shadow-2xs'
                  : 'text-[#7A705F] hover:text-[#221E18]'
              }`}
              title="Original Draft Baseline"
            >
              <FileText size={12} />
              <span className="hidden sm:inline">Draft</span>
            </button>
          </div>

          {/* Editorial Letter Report Button */}
          <button
            onClick={() => setIsLetterModalOpen(true)}
            className="px-2.5 py-1 bg-[#FAF6EE] hover:bg-[#F1EAD9] text-[#221E18] text-xs font-semibold rounded-[5px] border border-[rgba(34,30,24,0.14)] transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            title="Generate Editorial Letter & Review Memo"
          >
            <FileCheck size={13} className="text-[#DE6346]" />
            <span className="hidden lg:inline">Editorial Memo</span>
          </button>

          {/* Export Editorial Copy */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-2.5 py-1 bg-[#FAF6EE] hover:bg-[#F1EAD9] text-[#221E18] text-xs font-semibold rounded-[5px] border border-[rgba(34,30,24,0.14)] transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            title="Export Editorial Working Copy (Markdown/Annotated)"
          >
            <Download size={13} />
            <span className="hidden lg:inline">Export</span>
          </button>

          {/* Merge to Original Manuscript (Safe Explicit Promotion) */}
          <button
            onClick={() => setIsMergeModalOpen(true)}
            className="px-2.5 py-1 bg-[#FAF6EE] hover:bg-emerald-50 text-emerald-900 border border-emerald-300/80 text-xs font-semibold rounded-[5px] transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
            title="Merge this working copy into the author's original manuscript"
          >
            <ShieldCheck size={13} className="text-emerald-700" />
            <span className="hidden md:inline">Merge to Draft...</span>
          </button>

          {/* Approve Scene Button */}
          <button
            onClick={handleApproveScene}
            className="px-3 py-1 bg-[#B54B32] hover:bg-[#9E3E27] text-[#FAF6EE] text-xs font-semibold rounded-[5px] transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
            title="Mark scene as Clean & Approved (working copy remains distinct)"
          >
            <CheckCircle2 size={13} />
            <span className="hidden sm:inline">Approve Scene</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PROTECTED MANUSCRIPT REASSURANCE STRIP & STATS BAR                     */}
      {/* ========================================================================= */}
      <div className="bg-[#F8F5EE] border-b border-[rgba(34,30,24,0.08)] px-4 py-1.5 flex flex-wrap items-center justify-between text-xs text-[#7A705F] shrink-0 font-mono gap-2">
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          {/* Reassurance Tag */}
          <div className="flex items-center gap-1.5 text-xs text-[#5C5346] font-sans">
            <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
            <span className="font-semibold text-[#221E18]">Protected Draft:</span>
            <span className="text-[#7A705F] truncate max-w-[200px] sm:max-w-none">
              Original manuscript is preserved; changes live on this editorial branch.
            </span>
          </div>

          <div className="h-3 w-px bg-[rgba(34,30,24,0.12)] hidden md:block" />

          {/* Word counts & Delta */}
          <div className="flex items-center gap-2">
            <span>
              <strong className="text-[#221E18]">{editedWords.toLocaleString()}</strong>w
            </span>
            <span className="text-[10px] text-[#9E9484]">(base: {baselineWords.toLocaleString()}w)</span>

            <span
              className={`font-semibold ${
                wordCountDelta < 0
                  ? 'text-[#3A7D6E]'
                  : wordCountDelta > 0
                  ? 'text-[#B54B32]'
                  : 'text-[#7A705F]'
              }`}
            >
              {wordCountDelta > 0 ? `+${wordCountDelta}` : wordCountDelta}w ({percentChange}%)
            </span>
          </div>
        </div>

        {/* Right Stats & Quick Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRevertToOriginalDraft}
            className="text-[11px] font-sans text-[#7A705F] hover:text-red-700 flex items-center gap-1 cursor-pointer transition-colors"
            title="Reset editorial working copy back to draft"
          >
            <RotateCcw size={12} />
            <span className="hidden sm:inline">Reset to Draft</span>
          </button>

          <div className="flex items-center gap-1 text-[#7A705F]">
            <MessageSquare size={12} className={openQueriesCount > 0 ? 'text-[#B54B32]' : ''} />
            <span className="font-semibold text-[#221E18]">{openQueriesCount}</span> queries
          </div>

          <span className="text-[11px]">~{readingTimeMin} min read</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN WORKSPACE: NAVIGATOR + PROSE CANVAS + INSPECTOR                   */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* A. LEFT: EDITORIAL SCENE NAVIGATOR */}
        <EditorialSceneNavigator
          scenes={scenes}
          chapters={chapters}
          activeSceneId={activeScene.id}
          onSelectScene={onSelectScene}
          isOpen={isNavigatorOpen}
          onToggleOpen={() => setIsNavigatorOpen(!isNavigatorOpen)}
        />

        {/* B. CENTER: EDITORIAL PROSE CANVAS */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-[#FAF6EE] relative p-4 sm:p-6 lg:p-10">
          <div className="max-w-3xl w-full mx-auto space-y-5">
            {/* Scene Header */}
            <div className="border-b border-[rgba(34,30,24,0.1)] pb-3 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#221E18]">
                  {activeScene.title}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-[12px] font-sans font-medium text-[#7A705F]">
                    {activeScene.actOrPhase || 'Act I'} · {activeScene.narrativeBeat || 'Beat'}
                  </span>
                  {activeScene.premise && (
                    <>
                      <span className="text-[#7A705F]/40">·</span>
                      <p className="text-xs sm:text-sm text-[#7A705F] italic font-serif inline">
                        {activeScene.premise}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Leave Query Button */}
              <button
                onClick={handleOpenAddQuery}
                className="px-2.5 py-1.5 bg-[#FAF6EE] hover:bg-[#F1EAD9] border border-[rgba(34,30,24,0.14)] text-xs text-[#B54B32] font-semibold rounded-[5px] transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs"
                title="Add editorial query or marginalia"
              >
                <MessageSquare size={13} />
                <span>+ Query</span>
              </button>
            </div>

            {/* Crutch Words Warning Pill if detected and toggled */}
            {foundEchoes.length > 0 && (
              <div className="bg-amber-50/80 border border-amber-200/90 rounded-[6px] p-2 flex items-center justify-between text-xs text-amber-950 font-sans">
                <div className="flex items-center gap-1.5">
                  <AlertCircle size={14} className="text-amber-700 shrink-0" />
                  <span>
                    Detected <strong>{foundEchoes.length} crutch word patterns</strong> in this scene: {foundEchoes.slice(0, 3).map(e => `"${e.word}" (${e.count}x)`).join(', ')}
                  </span>
                </div>
                <button
                  onClick={() => setHighlightCrutchWords(!highlightCrutchWords)}
                  className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded cursor-pointer transition-colors ${
                    highlightCrutchWords
                      ? 'bg-amber-700 text-amber-50'
                      : 'bg-amber-200/80 hover:bg-amber-300 text-amber-950'
                  }`}
                >
                  {highlightCrutchWords ? 'Crutch Words Highlighted' : 'Highlight in Text'}
                </button>
              </div>
            )}

            {/* 1. MARKUP VIEW (REDLINES / TRACK CHANGES) */}
            {viewMode === 'markup' && (
              <div className="space-y-4">
                <div className="bg-[#F1EAD9] p-2.5 rounded-[6px] border border-[rgba(34,30,24,0.1)] text-xs text-[#7A705F] flex items-center justify-between">
                  <span className="font-medium flex items-center gap-1.5">
                    <Edit3 size={13} className="text-[#DE6346]" /> Redline Markup: Real-time track changes against the draft baseline.
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAcceptAllEdits}
                      className="text-[#3A7D6E] font-semibold hover:underline cursor-pointer"
                    >
                      Accept All Edits
                    </button>
                    <span className="text-[#9E9484]">·</span>
                    <button
                      onClick={handleRejectAllEdits}
                      className="text-red-700 font-semibold hover:underline cursor-pointer"
                    >
                      Reject Changes
                    </button>
                  </div>
                </div>

                {/* Interactive Redline Text Display */}
                <div className="bg-white/70 rounded-[8px] border border-[rgba(34,30,24,0.12)] p-6 sm:p-8 shadow-warm-sm font-serif text-base sm:text-lg leading-relaxed text-[#221E18] min-h-[380px] select-text">
                  {diffTokens.map((token, idx) => {
                    if (token.type === 'equal') {
                      if (highlightCrutchWords) {
                        // Render with crutch word highlights
                        const parts = token.value.split(new RegExp(`(\\b(?:${styleSheet.flaggedEchoes.join('|')})\\b)`, 'gi'));
                        return (
                          <span key={idx}>
                            {parts.map((part, pIdx) => {
                              const isCrutch = styleSheet.flaggedEchoes.some(
                                (e) => e.toLowerCase() === part.toLowerCase()
                              );
                              if (isCrutch) {
                                return (
                                  <mark
                                    key={pIdx}
                                    className="bg-amber-200 text-amber-950 font-medium px-0.5 rounded-xs"
                                    title={`Crutch word: "${part}"`}
                                  >
                                    {part}
                                  </mark>
                                );
                              }
                              return part;
                            })}
                          </span>
                        );
                      }
                      return <span key={idx}>{token.value}</span>;
                    }

                    if (token.type === 'insert') {
                      return (
                        <span
                          key={idx}
                          className="bg-emerald-100 text-emerald-950 underline decoration-emerald-600 decoration-2 px-0.5 rounded-xs"
                          title="Proposed insertion"
                        >
                          {token.value}
                        </span>
                      );
                    }

                    if (token.type === 'delete') {
                      return (
                        <span
                          key={idx}
                          className="bg-red-100 text-red-900 line-through decoration-red-700 decoration-2 opacity-75 px-0.5 rounded-xs"
                          title="Proposed deletion"
                        >
                          {token.value}
                        </span>
                      );
                    }

                    return null;
                  })}
                </div>

                {/* Direct Editing Working Prose Area */}
                <div className="space-y-1.5 pt-3 border-t border-[rgba(34,30,24,0.1)]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-[#7A705F] uppercase font-semibold block">
                      Active Editorial Working Copy (Safe Polish)
                    </label>
                    <span className="text-[11px] text-[#7A705F]">
                      Edits here do not modify the author’s original draft
                    </span>
                  </div>
                  <textarea
                    value={editableText}
                    onChange={(e) => handleTextChange(e.target.value)}
                    rows={12}
                    className="w-full p-4 rounded-[6px] border border-[rgba(34,30,24,0.14)] bg-[#FAF6EE] font-serif text-base text-[#221E18] leading-relaxed focus:outline-none focus:border-[#B54B32] shadow-warm-sm"
                    placeholder="Polish and refine this scene's prose..."
                  />
                </div>
              </div>
            )}

            {/* 2. SPLIT DIFF VIEW (SIDE-BY-SIDE) */}
            {viewMode === 'split' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-[#7A705F] bg-[#ECE5D6] p-2 rounded-[5px]">
                    <span className="font-bold text-[#221E18]">Original Manuscript Draft</span>
                    <span>{baselineWords}w · Pristine</span>
                  </div>
                  <div className="p-4 rounded-[6px] border border-[rgba(34,30,24,0.1)] bg-[#F5F0E4] font-serif text-sm leading-relaxed text-[#5C5346] min-h-[420px] whitespace-pre-wrap select-text">
                    {rawDraftBaseline}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-[#221E18] bg-[#ECE5D6] p-2 rounded-[5px]">
                    <span className="font-bold">Editorial Working Copy</span>
                    <span>{editedWords}w · Active</span>
                  </div>
                  <textarea
                    value={editableText}
                    onChange={(e) => handleTextChange(e.target.value)}
                    rows={18}
                    className="w-full p-4 rounded-[6px] border border-[rgba(34,30,24,0.14)] bg-white/80 font-serif text-sm leading-relaxed text-[#221E18] focus:outline-none focus:border-[#B54B32]"
                  />
                </div>
              </div>
            )}

            {/* 3. CLEAN EDITED VIEW */}
            {viewMode === 'clean' && (
              <div className="space-y-4">
                <div className="bg-[#F1EAD9] p-2.5 rounded-[6px] border border-[rgba(34,30,24,0.1)] text-xs text-[#7A705F] flex items-center justify-between">
                  <span>Reading clean, polished prose without markup distraction.</span>
                  <span className="font-mono">{editedWords} words</span>
                </div>

                <div className="bg-white/70 rounded-[8px] border border-[rgba(34,30,24,0.12)] p-6 sm:p-8 shadow-warm-sm font-serif text-base sm:text-lg leading-relaxed text-[#221E18] min-h-[420px] whitespace-pre-wrap select-text">
                  {editableText}
                </div>
              </div>
            )}

            {/* 4. ORIGINAL DRAFT BASELINE VIEW */}
            {viewMode === 'draft' && (
              <div className="space-y-4">
                <div className="bg-[#F1EAD9] p-2.5 rounded-[6px] border border-[rgba(34,30,24,0.1)] text-xs text-[#7A705F] flex items-center justify-between">
                  <span>Unmodified Original First-Draft Manuscript.</span>
                  <span className="font-mono">{baselineWords} words</span>
                </div>

                <div className="bg-white/60 rounded-[8px] border border-[rgba(34,30,24,0.12)] p-6 sm:p-8 shadow-warm-sm font-serif text-base sm:text-lg leading-relaxed text-[#7A705F] min-h-[420px] whitespace-pre-wrap select-text">
                  {rawDraftBaseline}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* C. RIGHT: EDITORIAL INSPECTOR (QUERIES, STYLE SHEET, PASSES) */}
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-[rgba(34,30,24,0.12)] bg-[#F1EAD9] flex flex-col shrink-0">
          {/* Tabs */}
          <div className="flex items-center border-b border-[rgba(34,30,24,0.1)] bg-[#FAF6EE] p-1 gap-1 text-xs overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveInspectorTab('line-edits')}
              className={`flex-1 py-1.5 px-2 rounded-[4px] font-medium transition-colors cursor-pointer flex items-center justify-center gap-1 shrink-0 ${
                activeInspectorTab === 'line-edits'
                  ? 'bg-[#221E18] text-[#FAF6EE] font-semibold shadow-2xs'
                  : 'text-[#7A705F] hover:text-[#221E18]'
              }`}
            >
              <Sparkles size={12} className={activeInspectorTab === 'line-edits' ? 'text-amber-300' : ''} />
              <span>Line Edits ({activeSceneLineEdits.length})</span>
            </button>

            <button
              onClick={() => setActiveInspectorTab('queries')}
              className={`flex-1 py-1.5 px-2 rounded-[4px] font-medium transition-colors cursor-pointer flex items-center justify-center gap-1 shrink-0 ${
                activeInspectorTab === 'queries'
                  ? 'bg-[#221E18] text-[#FAF6EE] font-semibold shadow-2xs'
                  : 'text-[#7A705F] hover:text-[#221E18]'
              }`}
            >
              <MessageSquare size={12} />
              <span>Queries ({openQueriesCount})</span>
            </button>

            <button
              onClick={() => setActiveInspectorTab('stylesheet')}
              className={`flex-1 py-1.5 px-2 rounded-[4px] font-medium transition-colors cursor-pointer flex items-center justify-center gap-1 shrink-0 ${
                activeInspectorTab === 'stylesheet'
                  ? 'bg-[#221E18] text-[#FAF6EE] font-semibold shadow-2xs'
                  : 'text-[#7A705F] hover:text-[#221E18]'
              }`}
            >
              <BookOpen size={12} />
              <span>Style</span>
            </button>

            <button
              onClick={() => setActiveInspectorTab('passes')}
              className={`flex-1 py-1.5 px-2 rounded-[4px] font-medium transition-colors cursor-pointer flex items-center justify-center gap-1 shrink-0 ${
                activeInspectorTab === 'passes'
                  ? 'bg-[#221E18] text-[#FAF6EE] font-semibold shadow-2xs'
                  : 'text-[#7A705F] hover:text-[#221E18]'
              }`}
            >
              <Sliders size={12} />
              <span>Passes</span>
            </button>
          </div>

          {/* TAB 0: LINE EDITING LENS & COLOR CODES */}
          {activeInspectorTab === 'line-edits' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <LineEditLensPanel
                markdown={activeScene.proseContent || ''}
                sceneId={activeScene.id}
                sceneTitle={activeScene.title}
                onRemoveHighlight={handleRemoveSceneHighlight}
                onChangeHighlightColor={handleChangeSceneHighlightColor}
                onAddCommentFromHighlight={(text, cat) => {
                  setNewQueryExcerpt(text);
                  setNewQueryCategory(cat.toLowerCase().includes('query') ? 'author-query' : 'line-edit');
                  setNewQueryText(`[${cat}]: `);
                  setIsAddingQuery(true);
                  setActiveInspectorTab('queries');
                }}
              />
            </div>
          )}

          {/* TAB 1: EDITORIAL QUERIES & MARGINALIA */}
          {activeInspectorTab === 'queries' && (
            <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-4 no-scrollbar">
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono font-bold uppercase text-[#221E18] tracking-wider">
                  Author Queries & Notes
                </div>
                <button
                  onClick={handleOpenAddQuery}
                  className="text-xs font-semibold text-[#B54B32] hover:text-[#9E3E27] flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={13} /> Add Query
                </button>
              </div>

              {/* Add Query Form */}
              {isAddingQuery && (
                <div className="p-3 bg-[#FAF6EE] rounded-[6px] border border-[rgba(34,30,24,0.12)] space-y-2.5 shadow-warm-sm animate-in fade-in duration-150">
                  <span className="text-[11px] font-mono font-semibold text-[#221E18] block">
                    New Editorial Query
                  </span>
                  <input
                    type="text"
                    value={newQueryExcerpt}
                    onChange={(e) => setNewQueryExcerpt(e.target.value)}
                    placeholder="Quoted word or passage (highlight in text or type)..."
                    className="w-full text-xs p-1.5 bg-[#F1EAD9] rounded border border-[rgba(34,30,24,0.1)] text-[#221E18]"
                  />
                  <textarea
                    value={newQueryText}
                    onChange={(e) => setNewQueryText(e.target.value)}
                    rows={3}
                    placeholder="Enter query, recommendation, or note for author..."
                    className="w-full text-xs p-2 bg-[#F1EAD9] rounded border border-[rgba(34,30,24,0.1)] text-[#221E18] focus:outline-none resize-none"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <select
                      value={newQueryCategory}
                      onChange={(e) => setNewQueryCategory(e.target.value as EditorialCategory)}
                      className="text-xs bg-[#F1EAD9] p-1 rounded border border-[rgba(34,30,24,0.1)] text-[#221E18]"
                    >
                      <option value="line-edit">Line Edit</option>
                      <option value="developmental">Developmental</option>
                      <option value="continuity">Continuity</option>
                      <option value="pacing">Pacing</option>
                      <option value="author-query">Author Query (AQ)</option>
                      <option value="grammar">Style / Grammar</option>
                    </select>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setIsAddingQuery(false)}
                        className="px-2 py-1 text-xs text-[#7A705F] hover:text-[#221E18] cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveNewQuery}
                        className="px-2.5 py-1 text-xs bg-[#B54B32] text-white font-semibold rounded cursor-pointer shadow-2xs"
                      >
                        Post Query
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Filters */}
              <div className="flex items-center justify-between text-[11px] gap-2">
                <select
                  value={queryCategoryFilter}
                  onChange={(e) => setQueryCategoryFilter(e.target.value)}
                  className="bg-[#FAF6EE] text-xs p-1 rounded border border-[rgba(34,30,24,0.1)] text-[#221E18] flex-1"
                >
                  <option value="all">All Categories</option>
                  <option value="line-edit">Line Edit</option>
                  <option value="developmental">Developmental</option>
                  <option value="continuity">Continuity</option>
                  <option value="pacing">Pacing</option>
                  <option value="author-query">Author Query (AQ)</option>
                  <option value="grammar">Style / Grammar</option>
                </select>

                <label className="flex items-center gap-1 text-[#7A705F] cursor-pointer text-[10px]">
                  <input
                    type="checkbox"
                    checked={showResolvedQueries}
                    onChange={(e) => setShowResolvedQueries(e.target.checked)}
                    className="accent-[#B54B32]"
                  />
                  <span>Show Done</span>
                </label>
              </div>

              {/* Query List */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {filteredQueries.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#7A705F] border border-dashed border-[rgba(34,30,24,0.15)] rounded-[6px]">
                    No queries in this filter.
                  </div>
                ) : (
                  filteredQueries.map((q) => (
                    <div
                      key={q.id}
                      className={`p-3 rounded-[6px] border text-xs space-y-2 transition-all ${
                        q.resolved
                          ? 'bg-[#FAF6EE]/50 border-[rgba(34,30,24,0.06)] opacity-70'
                          : 'bg-[#FAF6EE] border-[rgba(34,30,24,0.12)] shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold uppercase ${
                            q.category === 'developmental'
                              ? 'bg-amber-100 text-amber-900'
                              : q.category === 'author-query'
                              ? 'bg-rose-100 text-rose-900'
                              : q.category === 'continuity'
                              ? 'bg-purple-100 text-purple-900'
                              : 'bg-blue-100 text-blue-900'
                          }`}
                        >
                          {q.category}
                        </span>

                        <button
                          onClick={() => handleToggleQueryResolved(q.id)}
                          className={`flex items-center gap-1 text-[11px] font-medium cursor-pointer ${
                            q.resolved ? 'text-[#3A7D6E]' : 'text-[#7A705F] hover:text-[#221E18]'
                          }`}
                        >
                          <CheckCircle2 size={13} className={q.resolved ? 'text-[#3A7D6E]' : ''} />
                          <span>{q.resolved ? 'Resolved' : 'Mark Done'}</span>
                        </button>
                      </div>

                      {q.selectionExcerpt && (
                        <div className="text-[11px] font-serif italic text-[#7A705F] border-l-2 border-[#B54B32] pl-2 line-clamp-2">
                          "{q.selectionExcerpt}"
                        </div>
                      )}

                      <p className="text-[#221E18] text-xs leading-relaxed font-sans">{q.comment}</p>

                      {/* Author Reply */}
                      {q.authorReply ? (
                        <div className="bg-[#F1EAD9] p-2 rounded text-[11px] text-[#221E18] border border-[rgba(34,30,24,0.08)]">
                          <span className="font-semibold text-[#7A705F] block text-[10px] uppercase font-mono">
                            Author Decision:
                          </span>
                          {q.authorReply}
                        </div>
                      ) : (
                        <div className="pt-1">
                          <button
                            onClick={() => {
                              const reply = prompt('Author reply to this query:');
                              if (reply) handleSaveAuthorReply(q.id, reply);
                            }}
                            className="text-[10px] text-[#7A705F] hover:text-[#221E18] underline cursor-pointer"
                          >
                            + Reply to query as Author
                          </button>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-[#7A705F] pt-1 border-t border-[rgba(34,30,24,0.06)]">
                        <span>{q.author}</span>
                        <button
                          onClick={() => handleDeleteQuery(q.id)}
                          className="hover:text-red-700 cursor-pointer"
                          title="Delete note"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PUBLISHING STYLE SHEET */}
          {activeInspectorTab === 'stylesheet' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs text-[#221E18] no-scrollbar">
              <div className="border-b border-[rgba(34,30,24,0.1)] pb-2.5 flex items-center justify-between">
                <div>
                  <h4 className="font-mono font-bold uppercase tracking-wider text-xs">
                    Publishing Style Sheet
                  </h4>
                  <p className="text-[11px] text-[#7A705F] mt-0.5">
                    House rules, terminology, and echoes.
                  </p>
                </div>
              </div>

              {/* Conventions */}
              <div className="space-y-2 bg-[#FAF6EE] p-3 rounded-[6px] border border-[rgba(34,30,24,0.1)]">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Oxford Comma:</span>
                  <span className="font-mono text-[#3A7D6E] font-semibold">Enforced (Required)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Dialogue Quotes:</span>
                  <span className="font-mono text-[#221E18]">Double Quotes ("...")</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Em-Dash Spacing:</span>
                  <span className="font-mono text-[#221E18]">Closed (Word—Word)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Numbers Spelled:</span>
                  <span className="font-mono text-[#221E18]">Under 100</span>
                </div>
              </div>

              {/* Glossary / Custom Terms */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold uppercase tracking-wider text-[11px] text-[#7A705F]">
                    Terminology Glossary ({styleSheet.customTerms.length})
                  </span>
                  <button
                    onClick={() => setIsAddingTerm(!isAddingTerm)}
                    className="text-[11px] font-semibold text-[#B54B32] hover:text-[#9E3E27] flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus size={12} /> Add Term
                  </button>
                </div>

                {isAddingTerm && (
                  <div className="p-2.5 bg-[#FAF6EE] rounded-[6px] border border-[rgba(34,30,24,0.12)] space-y-2 animate-in fade-in duration-100">
                    <input
                      type="text"
                      value={newTermWord}
                      onChange={(e) => setNewTermWord(e.target.value)}
                      placeholder="Term or binomen (e.g. Papaver somniferum)..."
                      className="w-full text-xs p-1.5 bg-[#F1EAD9] rounded border border-[rgba(34,30,24,0.1)] text-[#221E18]"
                    />
                    <input
                      type="text"
                      value={newTermNote}
                      onChange={(e) => setNewTermNote(e.target.value)}
                      placeholder="Rule / note (e.g. italicize Latin name)..."
                      className="w-full text-xs p-1.5 bg-[#F1EAD9] rounded border border-[rgba(34,30,24,0.1)] text-[#221E18]"
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setIsAddingTerm(false)}
                        className="px-2 py-0.5 text-xs text-[#7A705F]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddCustomTerm}
                        className="px-2.5 py-0.5 text-xs bg-[#B54B32] text-white font-semibold rounded"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {styleSheet.customTerms.map((term, i) => (
                    <div key={i} className="p-2.5 bg-[#FAF6EE] rounded-[5px] border border-[rgba(34,30,24,0.08)] flex items-start justify-between gap-2">
                      <div>
                        <div className="font-mono font-bold text-[#B54B32]">{term.term}</div>
                        <div className="text-[11px] text-[#7A705F] mt-0.5 leading-snug">{term.note}</div>
                      </div>
                      <button
                        onClick={() => handleDeleteCustomTerm(term.term)}
                        className="text-[#7A705F] hover:text-red-700 p-0.5 cursor-pointer"
                        title="Remove term rule"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Echoes & Crutch Words */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold uppercase tracking-wider text-[11px] text-[#7A705F]">
                    Echoes & Crutch Words ({styleSheet.flaggedEchoes.length})
                  </span>
                  <button
                    onClick={() => setHighlightCrutchWords(!highlightCrutchWords)}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded cursor-pointer ${
                      highlightCrutchWords ? 'bg-amber-600 text-amber-50' : 'bg-[#FAF6EE] text-[#7A705F] border'
                    }`}
                  >
                    {highlightCrutchWords ? 'Highlighted' : 'Highlight in Editor'}
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {foundEchoes.map((e, idx) => (
                    <div
                      key={idx}
                      className="px-2 py-1 bg-amber-100/70 border border-amber-200 rounded text-[11px] flex items-center gap-1.5 font-mono text-amber-950"
                    >
                      <span className="font-bold">{e.word}</span>
                      <span className="bg-amber-200/80 px-1 rounded-full text-[10px]">{e.count}x</span>
                    </div>
                  ))}
                </div>

                {/* Add new crutch word */}
                <div className="flex gap-1.5 pt-1">
                  <input
                    type="text"
                    value={newCrutchWord}
                    onChange={(e) => setNewCrutchWord(e.target.value)}
                    placeholder="Add crutch word (e.g. suddenly)..."
                    className="flex-1 text-[11px] p-1.5 bg-[#FAF6EE] rounded border border-[rgba(34,30,24,0.1)] text-[#221E18]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddCrutchWord();
                    }}
                  />
                  <button
                    onClick={handleAddCrutchWord}
                    className="px-2.5 py-1 text-xs bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] hover:bg-[#F1EAD9] rounded cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PUBLISHING PASSES */}
          {activeInspectorTab === 'passes' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-[#221E18] no-scrollbar">
              <div className="border-b border-[rgba(34,30,24,0.1)] pb-2.5">
                <h4 className="font-mono font-bold uppercase tracking-wider text-xs">
                  Publishing Editorial Passes
                </h4>
                <p className="text-[11px] text-[#7A705F] mt-0.5">
                  Developmental macro, line craft, house copyediting, and galley proof.
                </p>
              </div>

              <div className="space-y-3">
                {passes.map((pass) => (
                  <div
                    key={pass.id}
                    className={`p-3 rounded-[6px] border space-y-2 transition-all ${
                      pass.completed
                        ? 'bg-[#FAF6EE] border-[#3A7D6E]/40 shadow-2xs'
                        : 'bg-[#FAF6EE] border-[rgba(34,30,24,0.1)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-xs text-[#221E18]">
                        {pass.name}
                      </span>
                      <button
                        onClick={() => handleTogglePassCheck(pass.id)}
                        className={`flex items-center gap-1 text-[11px] font-mono cursor-pointer ${
                          pass.completed ? 'text-[#3A7D6E] font-semibold' : 'text-[#7A705F]'
                        }`}
                      >
                        <CheckCircle2 size={13} className={pass.completed ? 'text-[#3A7D6E]' : ''} />
                        <span>{pass.completed ? 'Completed' : 'In Progress'}</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-[#7A705F] leading-snug">{pass.description}</p>

                    <div className="bg-[#F1EAD9] p-2 rounded text-[11px] space-y-1">
                      <span className="font-mono font-semibold text-[#7A705F] text-[10px] uppercase block">
                        Focus:
                      </span>
                      <p className="text-[#221E18] italic">{pass.focus}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MODALS (LETTER, MERGE, EXPORT)                                         */}
      {/* ========================================================================= */}
      <EditorialLetterModal
        isOpen={isLetterModalOpen}
        onClose={() => setIsLetterModalOpen(false)}
        project={project}
        scenes={scenes}
        chapters={chapters}
        styleSheet={styleSheet}
        editorialPasses={passes}
      />

      <MergeManuscriptModal
        isOpen={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
        project={project}
        scene={activeScene}
        editedText={editableText}
        baselineText={rawDraftBaseline}
        onConfirmMerge={handleConfirmMerge}
      />

      <EditorialExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        project={project}
        scenes={scenes}
        activeScene={activeScene}
      />
    </div>
  );
};
