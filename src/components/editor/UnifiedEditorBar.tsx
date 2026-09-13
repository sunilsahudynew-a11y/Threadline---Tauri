import React, { useState, useRef, useEffect } from 'react';
import { Scene, ScriveningsMode } from '../../types';
import {
  PanelLeft,
  Menu,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Type,
  Quote,
  List,
  ListOrdered,
  Highlighter,
  Minus,
  Undo2,
  Redo2,
  SlidersHorizontal,
  Eye,
  EyeOff,
  Compass,
  Search,
  MoreHorizontal,
  Download,
  Copy,
  Files,
  Trash2,
  BarChart3,
  PenLine,
  SplitSquareVertical,
  Sun,
  Moon,
  PenTool,
  Edit3,
  X,
  FileText,
  Clock,
  Sparkles,
  ArrowLeft,
  Folder,
  Sliders
} from 'lucide-react';
import { useToast } from '../Toast';
import { VaultInfo } from '../../services/storage/vaultTypes';
import {
  EditorLineSpacing,
  EditorWordSpacing,
  EditorTextAlign,
  EditorPageWidth,
  ColorBlindMode,
  AVAILABLE_LINE_SPACINGS,
  AVAILABLE_WORD_SPACINGS,
  AVAILABLE_TEXT_ALIGNS,
  AVAILABLE_PAGE_WIDTHS
} from '../../services/theme/themeConfig';

export type EditorViewMode = 'write' | 'split' | 'preview';
export type EditorFontFamily = 'serif' | 'sans' | 'mono';
export type EditorFontSize = 'compact' | 'normal' | 'large';

export interface UnifiedEditorBarProps {
  // Scene Context & Navigation
  scene: Scene;
  allScenes: Scene[];
  currentSceneIdx: number;
  lastSavedText: string;
  focusMode: boolean;
  leftNavOpen: boolean;
  sidebarOpen: boolean;
  showSearch: boolean;
  scriveningsMode?: ScriveningsMode;
  onChangeScriveningsMode?: (mode: ScriveningsMode) => void;
  onOpenLinguisticStats?: () => void;
  onOpenCompileModal?: () => void;
  onToggleFocusMode: () => void;
  onToggleLeftNav: () => void;
  onToggleSidebar: () => void;
  onToggleHistory?: () => void;
  onToggleBookmarks?: () => void;
  activeMetadataTab?: 'facts' | 'history' | 'bookmarks';
  onToggleSearch: () => void;
  onNavigateToScene: (sceneId: string) => void;
  onUpdateScene?: (fields: Partial<Scene>) => void;
  onDuplicateScene?: (sceneId: string) => void;
  onDeleteScene?: (sceneId: string) => void;
  onNavigateToScreenplay?: () => void;

  // Formatting & Typesetting
  viewMode: EditorViewMode;
  onChangeViewMode: (mode: EditorViewMode) => void;
  editorSurface?: 'rich' | 'raw';
  onChangeEditorSurface?: (surface: 'rich' | 'raw') => void;
  fontFamily: EditorFontFamily;
  onChangeFontFamily: (family: EditorFontFamily) => void;
  fontSize: EditorFontSize;
  onChangeFontSize: (size: EditorFontSize) => void;
  lineSpacing?: EditorLineSpacing;
  onChangeLineSpacing?: (spacing: EditorLineSpacing) => void;
  wordSpacing?: EditorWordSpacing;
  onChangeWordSpacing?: (spacing: EditorWordSpacing) => void;
  textAlign?: EditorTextAlign;
  onChangeTextAlign?: (align: EditorTextAlign) => void;
  pageWidth?: EditorPageWidth;
  onChangePageWidth?: (width: EditorPageWidth) => void;

  // History & Actions
  canUndo: boolean;
  canRedo: boolean;
  undoCount?: number;
  redoCount?: number;
  onUndo: () => void;
  onRedo: () => void;
  onApplyFormat: (prefix: string, suffix?: string) => void;
  onApplyHighlight: (colorKey?: string) => void;
  onInsertSceneBreak: () => void;

  // Tools & Modes
  typewriterMode: boolean;
  onToggleTypewriterMode: () => void;
  currentWordCount: number;
  isLineEditLensOpen?: boolean;
  onToggleLineEditLens?: () => void;
  lineEditCount?: number;

  // Global Workspace & TopBar Integration (Replaces 2nd bar)
  projectTitle?: string;
  isSidebarOpen?: boolean;
  onToggleSidebarNav?: () => void;
  onOpenMobileDrawer?: () => void;
  onNavigate?: (screen: any) => void;
  onOpenSearch?: () => void;
  userRole?: 'author' | 'editor';
  onToggleRole?: () => void;
  openContinuityCount?: number;
  theme?: 'paper' | 'lamplight';
  onToggleTheme?: () => void;
  colorBlindMode?: ColorBlindMode;
  onToggleColorBlind?: () => void;
  vaultInfo?: VaultInfo | null;
  onOpenVaultManager?: () => void;
}

export const UnifiedEditorBar: React.FC<UnifiedEditorBarProps> = ({
  scene,
  allScenes,
  currentSceneIdx,
  lastSavedText,
  focusMode,
  leftNavOpen,
  sidebarOpen,
  showSearch,
  scriveningsMode = 'single',
  onChangeScriveningsMode,
  onOpenLinguisticStats,
  onOpenCompileModal,
  onToggleFocusMode,
  onToggleLeftNav,
  onToggleSidebar,
  onToggleSearch,
  onNavigateToScene,
  onUpdateScene,
  onDuplicateScene,
  onDeleteScene,
  onNavigateToScreenplay,

  editorSurface = 'rich',
  onChangeEditorSurface,
  fontFamily,
  onChangeFontFamily,
  fontSize,
  onChangeFontSize,
  lineSpacing = 'normal',
  onChangeLineSpacing,
  wordSpacing = 'normal',
  onChangeWordSpacing,
  textAlign = 'left',
  onChangeTextAlign,
  pageWidth = 'standard',
  onChangePageWidth,

  canUndo,
  canRedo,
  undoCount = 0,
  redoCount = 0,
  onUndo,
  onRedo,
  onApplyFormat,
  onApplyHighlight,
  onInsertSceneBreak,

  typewriterMode,
  onToggleTypewriterMode,
  currentWordCount,
  isLineEditLensOpen,
  onToggleLineEditLens,
  lineEditCount = 0,

  projectTitle = 'Manuscript',
  isSidebarOpen,
  onToggleSidebarNav,
  onOpenMobileDrawer,
  onNavigate,
  onOpenSearch,
  userRole = 'author',
  onToggleRole,
  openContinuityCount = 0,
  theme = 'paper',
  onToggleTheme,
  colorBlindMode = 'none',
  onToggleColorBlind,
  vaultInfo,
  onOpenVaultManager
}) => {
  const { showToast } = useToast();

  // Modal / Sheet visibility states
  const [showTitleSheet, setShowTitleSheet] = useState(false);
  const [showOverflowSheet, setShowOverflowSheet] = useState(false);
  const [showWordCountModal, setShowWordCountModal] = useState(false);
  const [showSavePopover, setShowSavePopover] = useState(false);
  const [showTypesettingModal, setShowTypesettingModal] = useState(false);
  const [showHeadingsMenu, setShowHeadingsMenu] = useState(false);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);

  // Bottom format dock visibility on mobile (defaults to visible for typing ergonomics)
  const [showMobileFormatDock, setShowMobileFormatDock] = useState(true);

  // Refs for click outside
  const titleButtonRef = useRef<HTMLDivElement>(null);
  const headingsRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const saveGlyphRef = useRef<HTMLDivElement>(null);
  const wordCountRef = useRef<HTMLDivElement>(null);
  const overflowRef = useRef<HTMLDivElement>(null);

  const readingTimeMin = Math.max(1, Math.ceil(currentWordCount / 225));
  const prevScene = allScenes[currentSceneIdx - 1];
  const nextScene = allScenes[currentSceneIdx + 1];

  // Close menus on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (headingsRef.current && !headingsRef.current.contains(target)) setShowHeadingsMenu(false);
      if (highlightRef.current && !highlightRef.current.contains(target)) setShowHighlightMenu(false);
      if (saveGlyphRef.current && !saveGlyphRef.current.contains(target)) setShowSavePopover(false);
      if (wordCountRef.current && !wordCountRef.current.contains(target)) setShowWordCountModal(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowTitleSheet(false);
        setShowOverflowSheet(false);
        setShowWordCountModal(false);
        setShowSavePopover(false);
        setShowTypesettingModal(false);
        setShowHeadingsMenu(false);
        setShowHighlightMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(`# ${scene.title}\n\n${scene.proseContent}`);
    showToast('Scene copied to clipboard as Markdown');
    setShowOverflowSheet(false);
  };

  // Status definitions
  const statusOptions = [
    { value: 'Draft', label: 'Draft', color: '#B54B32' },
    { value: 'In Progress', label: 'In Progress', color: '#3B82F6' },
    { value: 'Revised', label: 'Revised', color: '#D97706' },
    { value: 'Final', label: 'Final', color: '#059669' }
  ];

  const currentStatusObj = statusOptions.find((s) => s.value === scene.status) || statusOptions[0];

  // Save / Sync State Analysis
  const isSaving = lastSavedText.toLowerCase().includes('saving');
  const hasConflict = lastSavedText.toLowerCase().includes('conflict') || lastSavedText.toLowerCase().includes('error');

  // 1. MINIMAL COLLAPSED BAR IN ZEN FOCUS MODE (Section 6)
  if (focusMode) {
    return (
      <div
        id="zen-focus-header"
        className="group fixed top-0 left-0 right-0 h-10 px-4 sm:px-6 flex items-center justify-between bg-[#FAF6EE]/80 hover:bg-[#FAF6EE] backdrop-blur-md border-b border-[rgba(34,30,24,0.08)] select-none z-50 transition-all duration-200 opacity-20 hover:opacity-100"
      >
        <div className="flex items-center gap-3">
          <span className="font-serif text-xs sm:text-sm font-semibold text-[#221E18] truncate max-w-sm">
            {scene.chapterNumber ? `Ch. ${scene.chapterNumber} · ` : ''}{scene.title}
          </span>
          <span className="text-[#7A705F]/40">·</span>
          <span className="text-xs font-mono text-[#7A705F]">
            {currentWordCount}w ({readingTimeMin}m)
          </span>
        </div>
        <button
          onClick={onToggleFocusMode}
          className="text-xs font-medium text-[#221E18] hover:text-[#B54B32] px-2.5 py-1 rounded-[5px] border border-[rgba(34,30,24,0.12)] bg-[#F1EAD9] shadow-warm-xs transition-colors flex items-center gap-1.5 cursor-pointer min-h-[30px]"
          title="Exit Zen Focus Mode (Esc or F11)"
        >
          <EyeOff size={13} /> <span>Exit Focus (Esc)</span>
        </button>
      </div>
    );
  }

  return (
    <>
      {/* =========================================================================
          SINGLE CONSOLIDATED ADAPTIVE HEADER (≤48px Mobile, ~52px Desktop)
          Replaces the two stacked toolbars (44px + 40px = 84px) with one clean row
          ========================================================================= */}
      <header
        id="threadline-adaptive-header"
        className="h-12 sm:h-[52px] border-b border-[rgba(34,30,24,0.1)] bg-[#FAF6EE] px-2.5 sm:px-4 lg:px-5 flex items-center justify-between text-xs select-none shrink-0 relative z-30 gap-1.5 sm:gap-3 transition-colors"
      >
        {/* =====================================================================
            LEFT ZONE: Back / Drawer / Sidebar Toggle + Title Dropdown + Sync Glyph
            ===================================================================== */}
        <div className="flex items-center gap-1 sm:gap-2 min-w-0 shrink">
          {/* Mobile Menu / Drawer Toggle (44x44 target on touch) */}
          <button
            onClick={onOpenMobileDrawer || onToggleSidebarNav}
            className="md:hidden flex items-center justify-center p-2 rounded-[6px] text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9] transition-colors cursor-pointer shrink-0 min-h-[44px] min-w-[44px]"
            title="Open navigation menu"
            aria-label="Open navigation menu"
          >
            <Menu size={18} />
          </button>

          {/* Desktop Sidebar Toggle Button */}
          {onToggleSidebarNav && (
            <button
              onClick={onToggleSidebarNav}
              className="hidden md:flex items-center justify-center p-1.5 rounded-[5px] text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9] transition-colors cursor-pointer shrink-0 min-h-[32px] min-w-[32px]"
              title={isSidebarOpen ? 'Collapse sidebar (⌘\\)' : 'Expand sidebar (⌘\\)'}
              aria-label="Toggle sidebar"
            >
              <PanelLeft size={16} />
            </button>
          )}

          {/* Desktop Scene Outline Toggle (SplitSquareVertical) */}
          <button
            onClick={onToggleLeftNav}
            className={`hidden lg:flex items-center justify-center p-1.5 rounded-[5px] transition-colors cursor-pointer shrink-0 min-h-[32px] min-w-[32px] ${
              leftNavOpen
                ? 'bg-[#F1EAD9] text-[#B54B32] shadow-warm-xs'
                : 'text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9]'
            }`}
            title={leftNavOpen ? 'Hide Scene Outline' : 'Show Scene Outline'}
            aria-label="Toggle Scene Outline"
          >
            <SplitSquareVertical size={15} />
          </button>

          {/* Hairline Divider (Desktop) */}
          <div className="hidden sm:block h-4 w-px bg-[rgba(34,30,24,0.12)] shrink-0" />

          {/* Scene Title Button with Chevron (Opens Breadcrumb & Scene Navigation Sheet) */}
          <div className="relative min-w-0" ref={titleButtonRef}>
            <button
              onClick={() => setShowTitleSheet(!showTitleSheet)}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-[6px] hover:bg-[#F1EAD9] text-left transition-colors cursor-pointer min-w-0 group"
              title="Click to view breadcrumb, change status, or jump scenes"
              aria-haspopup="dialog"
              aria-expanded={showTitleSheet}
            >
              <span className="font-serif font-bold text-xs sm:text-sm text-[#221E18] group-hover:text-[#B54B32] truncate max-w-[130px] xs:max-w-[170px] sm:max-w-[220px] md:max-w-[280px] lg:max-w-xs transition-colors">
                {scene.chapterNumber ? `Ch. ${scene.chapterNumber} · ` : ''}{scene.title}
              </span>
              <ChevronDown
                size={12}
                className={`text-[#7A705F] group-hover:text-[#221E18] transition-transform shrink-0 ${
                  showTitleSheet ? 'rotate-180 text-[#B54B32]' : ''
                }`}
              />
            </button>

            {/* Desktop Popover / Mobile Dialog for Scene Title & Navigation (Section 4.1) */}
            {showTitleSheet && (
              <>
                {/* Mobile Backdrop */}
                <div
                  className="sm:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-50 animate-in fade-in duration-150"
                  onClick={() => setShowTitleSheet(false)}
                />

                <div
                  className={`z-50 bg-[#FAF6EE] border border-[rgba(34,30,24,0.14)] shadow-warm-modal animate-in duration-150
                    fixed bottom-0 left-0 right-0 rounded-t-2xl p-4 sm:p-3.5 sm:absolute sm:bottom-auto sm:left-0 sm:right-auto sm:top-full sm:mt-1.5 sm:w-84 sm:rounded-xl
                  `}
                >
                  {/* Mobile drag handle */}
                  <div className="sm:hidden w-10 h-1 bg-[rgba(34,30,24,0.2)] rounded-full mx-auto mb-3" />

                  {/* Header / Breadcrumb Trail */}
                  <div className="mb-3 pb-2.5 border-b border-[rgba(34,30,24,0.08)]">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A705F] block mb-1">
                      Hierarchy
                    </span>
                    <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs text-[#7A705F] flex-wrap">
                      <button
                        onClick={() => {
                          setShowTitleSheet(false);
                          onNavigate?.('home');
                        }}
                        className="font-serif hover:text-[#221E18] hover:underline cursor-pointer"
                      >
                        {projectTitle}
                      </button>
                      <ChevronRight size={10} className="text-[#9E9484]" />
                      <button
                        onClick={() => {
                          setShowTitleSheet(false);
                          onNavigate?.('editor');
                        }}
                        className="hover:text-[#221E18] hover:underline cursor-pointer"
                      >
                        Manuscript Draft
                      </button>
                      <ChevronRight size={10} className="text-[#9E9484]" />
                      <span className="font-serif font-bold text-[#221E18] truncate max-w-[140px]">
                        {scene.title}
                      </span>
                    </nav>
                  </div>

                  {/* Scene Stepper Buttons (Section 4.1) */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button
                      onClick={() => {
                        if (prevScene) {
                          onNavigateToScene(prevScene.id);
                          setShowTitleSheet(false);
                        }
                      }}
                      disabled={!prevScene}
                      className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-[6px] border border-[rgba(34,30,24,0.12)] bg-[#F1EAD9]/60 hover:bg-[#F1EAD9] disabled:opacity-30 disabled:hover:bg-[#F1EAD9]/60 text-xs font-medium text-[#221E18] transition-colors cursor-pointer"
                    >
                      <ChevronLeft size={13} />
                      <span className="truncate">Previous Scene</span>
                    </button>
                    <button
                      onClick={() => {
                        if (nextScene) {
                          onNavigateToScene(nextScene.id);
                          setShowTitleSheet(false);
                        }
                      }}
                      disabled={!nextScene}
                      className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-[6px] border border-[rgba(34,30,24,0.12)] bg-[#F1EAD9]/60 hover:bg-[#F1EAD9] disabled:opacity-30 disabled:hover:bg-[#F1EAD9]/60 text-xs font-medium text-[#221E18] transition-colors cursor-pointer"
                    >
                      <span className="truncate">Next Scene</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>

                  {/* Scene Status Tag Picker (Section 4.1) */}
                  <div className="mb-3">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[#7A705F] block mb-1.5">
                      Drafting Status
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 bg-[#F1EAD9]/70 p-1 rounded-[6px]">
                      {statusOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            if (onUpdateScene) onUpdateScene({ status: opt.value as any });
                            setShowTitleSheet(false);
                          }}
                          className={`flex items-center justify-between px-2 py-1 rounded-[4px] text-xs transition-colors cursor-pointer ${
                            scene.status === opt.value
                              ? 'bg-[#FAF6EE] text-[#221E18] font-semibold shadow-xs'
                              : 'text-[#7A705F] hover:text-[#221E18]'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: opt.color }} />
                            <span>{opt.label}</span>
                          </div>
                          {scene.status === opt.value && <Check size={12} className="text-[#B54B32]" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Scene Jumper List */}
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[#7A705F] block mb-1.5">
                      Jump to Scene ({allScenes.length})
                    </label>
                    <div className="max-h-36 overflow-y-auto space-y-0.5 pr-1">
                      {allScenes.map((s, idx) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            onNavigateToScene(s.id);
                            setShowTitleSheet(false);
                          }}
                          className={`w-full text-left px-2 py-1 rounded-[4px] text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            s.id === scene.id
                              ? 'bg-[#F1EAD9] text-[#B54B32] font-semibold'
                              : 'text-[#221E18] hover:bg-[#F1EAD9]/60'
                          }`}
                        >
                          <span className="truncate max-w-[190px]">
                            {idx + 1}. {s.title}
                          </span>
                          <span className="text-[10px] font-mono text-[#7A705F]">
                            {s.wordCount}w
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sync / Save Status Glyph (Section 4.1: Single small glyph instead of phrase) */}
          <div className="relative shrink-0" ref={saveGlyphRef}>
            <button
              onClick={() => setShowSavePopover(!showSavePopover)}
              className="p-1.5 rounded-[5px] hover:bg-[#F1EAD9] transition-colors cursor-pointer flex items-center justify-center min-h-[32px] min-w-[32px]"
              title={`Save status: ${lastSavedText || 'Saved'} (tap for details)`}
              aria-label="Autosave status"
            >
              {isSaving ? (
                <RefreshCw size={12} className="animate-spin text-[#B54B32]" />
              ) : hasConflict ? (
                <AlertCircle size={13} className="text-amber-600" />
              ) : (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                </span>
              )}
            </button>

            {/* Tap/Hover Detail Popover for Sync Status */}
            {showSavePopover && (
              <div className="absolute left-0 top-full mt-1 w-56 bg-[#FAF6EE] border border-[rgba(34,30,24,0.14)] rounded-[8px] shadow-warm-modal p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center gap-2 mb-1.5">
                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                  <span className="text-xs font-semibold text-[#221E18]">
                    {hasConflict ? 'Sync Issue' : isSaving ? 'Saving Changes...' : 'All Changes Saved'}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-[#7A705F] mb-1.5">
                  {lastSavedText || 'Saved locally in IndexedDB storage'}
                </p>
                {vaultInfo && (
                  <div className="text-[10px] text-[#7A705F] border-t border-[rgba(34,30,24,0.08)] pt-1.5 flex items-center gap-1">
                    <Folder size={11} className="text-[#35505F]" />
                    <span className="truncate">Vault: {vaultInfo.folderName}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* =====================================================================
            CENTER-RIGHT ZONE: Inline Frequent Formatting (B, I, Undo) + Word Count
            ===================================================================== */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* History Group: Undo & Redo (Section 4.1 Frequency Hierarchy) */}
          <div className="flex items-center bg-[#F1EAD9]/70 rounded-[6px] border border-[rgba(34,30,24,0.08)] p-0.5 shrink-0">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="p-1.5 sm:p-1 rounded-[4px] text-[#221E18] hover:bg-[#FAF6EE] disabled:opacity-25 disabled:hover:bg-transparent transition-colors cursor-pointer min-h-[32px] min-w-[32px] sm:min-h-[26px] sm:min-w-[26px] flex items-center justify-center"
              title={`Undo (⌘Z)${undoCount > 0 ? ` · ${undoCount} steps` : ''}`}
              aria-label="Undo"
            >
              <Undo2 size={13} />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="p-1.5 sm:p-1 rounded-[4px] text-[#221E18] hover:bg-[#FAF6EE] disabled:opacity-25 disabled:hover:bg-transparent transition-colors cursor-pointer min-h-[32px] min-w-[32px] sm:min-h-[26px] sm:min-w-[26px] flex items-center justify-center"
              title={`Redo (⌘Y / ⌘⇧Z)${redoCount > 0 ? ` · ${redoCount} steps` : ''}`}
              aria-label="Redo"
            >
              <Redo2 size={13} />
            </button>
          </div>

          {/* Hairline Divider */}
          <div className="w-px h-3.5 bg-[rgba(34,30,24,0.12)] shrink-0 mx-0.5 hidden xs:block" />

          {/* Primary Inline Formatting: Bold & Italic (Always Visible) */}
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={() => onApplyFormat('**', '**')}
              className="p-1.5 sm:p-1 rounded-[5px] text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9] transition-colors cursor-pointer min-h-[32px] min-w-[32px] sm:min-h-[26px] sm:min-w-[26px] flex items-center justify-center font-bold"
              title="Bold (⌘B)"
              aria-label="Bold format"
            >
              <Bold size={13} />
            </button>
            <button
              onClick={() => onApplyFormat('*', '*')}
              className="p-1.5 sm:p-1 rounded-[5px] text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9] transition-colors cursor-pointer min-h-[32px] min-w-[32px] sm:min-h-[26px] sm:min-w-[26px] flex items-center justify-center italic"
              title="Italic (⌘I)"
              aria-label="Italic format"
            >
              <Italic size={13} />
            </button>

            {/* Strikethrough (Tablet & Desktop: 481px+) */}
            <button
              onClick={() => onApplyFormat('~~', '~~')}
              className="hidden sm:flex p-1 rounded-[5px] text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9] transition-colors cursor-pointer min-h-[26px] min-w-[26px] items-center justify-center"
              title="Strikethrough"
              aria-label="Strikethrough format"
            >
              <Strikethrough size={13} />
            </button>
          </div>

          {/* Headings Dropdown (Desktop: 1025px+) */}
          <div className="relative shrink-0 hidden md:block" ref={headingsRef}>
            <button
              onClick={() => setShowHeadingsMenu(!showHeadingsMenu)}
              className={`flex items-center gap-0.5 px-1.5 py-1 rounded-[5px] transition-colors cursor-pointer min-h-[26px] ${
                showHeadingsMenu ? 'bg-[#F1EAD9] text-[#221E18]' : 'text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9]'
              }`}
              title="Headings"
            >
              <Type size={13} />
              <ChevronDown size={10} />
            </button>

            {showHeadingsMenu && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-[#FAF6EE] border border-[rgba(34,30,24,0.14)] rounded-[6px] shadow-warm-modal py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    onApplyFormat('# ');
                    setShowHeadingsMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-[#F1EAD9] flex items-center gap-2 text-[#221E18] font-bold"
                >
                  <Heading1 size={13} /> Heading 1
                </button>
                <button
                  onClick={() => {
                    onApplyFormat('## ');
                    setShowHeadingsMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-[#F1EAD9] flex items-center gap-2 text-[#221E18] font-semibold"
                >
                  <Heading2 size={13} /> Heading 2
                </button>
                <button
                  onClick={() => {
                    onApplyFormat('### ');
                    setShowHeadingsMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-[#F1EAD9] flex items-center gap-2 text-[#221E18]"
                >
                  <Heading3 size={13} /> Heading 3
                </button>
              </div>
            )}
          </div>

          {/* Highlighter Palette (Desktop: 1025px+) */}
          <div className="relative shrink-0 hidden lg:block" ref={highlightRef}>
            <button
              onClick={() => setShowHighlightMenu(!showHighlightMenu)}
              className="p-1 rounded-[5px] text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9] transition-colors cursor-pointer min-h-[26px] min-w-[26px] flex items-center justify-center"
              title="Highlight Text"
            >
              <Highlighter size={13} />
            </button>

            {showHighlightMenu && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-[#FAF6EE] border border-[rgba(34,30,24,0.14)] rounded-[6px] shadow-warm-modal p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[10px] font-mono text-[#7A705F] px-1 pb-1 mb-1 border-b border-[rgba(34,30,24,0.08)]">
                  Highlighter
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {[
                    { key: 'yellow', bg: '#FEF08A' },
                    { key: 'green', bg: '#BBF7D0' },
                    { key: 'blue', bg: '#BFDBFE' },
                    { key: 'pink', bg: '#FBCFE8' },
                    { key: 'amber', bg: '#FED7AA' }
                  ].map((c) => (
                    <button
                      key={c.key}
                      onClick={() => {
                        onApplyHighlight(c.key);
                        setShowHighlightMenu(false);
                      }}
                      className="w-5 h-5 rounded-[4px] border border-black/10 hover:scale-110 transition-transform cursor-pointer"
                      style={{ backgroundColor: c.bg }}
                      title={c.key}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Scene Break Button (Desktop: 1200px+) */}
          <button
            onClick={onInsertSceneBreak}
            className="hidden xl:flex p-1 rounded-[5px] text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9] transition-colors cursor-pointer min-h-[26px] min-w-[26px] items-center justify-center shrink-0"
            title="Insert Scene Break ( * * * )"
          >
            <Minus size={14} />
          </button>

          {/* Word Count Badge (Section 4.5: Tap/Click to expand detailed stats) */}
          <div className="relative shrink-0" ref={wordCountRef}>
            <button
              onClick={() => setShowWordCountModal(!showWordCountModal)}
              className="flex items-center gap-1 px-2 py-1 rounded-[5px] bg-[#F1EAD9]/70 hover:bg-[#F1EAD9] text-[#221E18] text-[11px] font-mono transition-colors cursor-pointer min-h-[30px]"
              title="Word count & reading time (tap for stats)"
              aria-label="Word count"
            >
              <span className="font-semibold">{currentWordCount}w</span>
              <span className="hidden md:inline text-[#7A705F]">· {readingTimeMin}m</span>
            </button>

            {/* Word Count Expand Card (Section 4.5) */}
            {showWordCountModal && (
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-[#FAF6EE] border border-[rgba(34,30,24,0.14)] rounded-[10px] shadow-warm-modal p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A705F]">
                    Scene Metrics
                  </span>
                  <button
                    onClick={() => setShowWordCountModal(false)}
                    className="text-[#7A705F] hover:text-[#221E18] p-0.5 rounded"
                  >
                    <X size={12} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3 bg-[#F1EAD9]/60 p-2 rounded-[6px]">
                  <div>
                    <span className="text-[10px] text-[#7A705F] block">Word Count</span>
                    <span className="text-base font-bold font-mono text-[#221E18]">
                      {currentWordCount.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#7A705F] block">Reading Time</span>
                    <span className="text-base font-bold font-mono text-[#221E18]">
                      ~{readingTimeMin} min
                    </span>
                  </div>
                </div>

                {scene.targetWordCount && scene.targetWordCount > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-[11px] font-mono text-[#7A705F] mb-1">
                      <span>Goal: {scene.targetWordCount} words</span>
                      <span>{Math.min(100, Math.round((currentWordCount / scene.targetWordCount) * 100))}%</span>
                    </div>
                    <div className="w-full bg-[#F1EAD9] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#B54B32] h-full transition-all duration-300 rounded-full"
                        style={{ width: `${Math.min(100, (currentWordCount / scene.targetWordCount) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {onOpenLinguisticStats && (
                  <button
                    onClick={() => {
                      onOpenLinguisticStats();
                      setShowWordCountModal(false);
                    }}
                    className="w-full py-1.5 px-2.5 rounded-[5px] bg-[#221E18] text-[#FAF6EE] text-xs font-medium hover:bg-black transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <BarChart3 size={13} /> Open Linguistic Stats
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Quick Scene Facts & Story Bible Drawer Button (Desktop) */}
          <button
            onClick={onToggleSidebar}
            className={`hidden sm:flex p-1.5 rounded-[5px] transition-colors cursor-pointer min-h-[30px] min-w-[30px] items-center justify-center ${
              sidebarOpen && !isLineEditLensOpen
                ? 'bg-[#F1EAD9] text-[#B54B32] shadow-warm-xs'
                : 'text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9]'
            }`}
            title={sidebarOpen ? 'Close Scene Facts & Story Bible' : 'Open Scene Facts & Story Bible'}
          >
            <Compass size={14} />
          </button>

          {/* ===================================================================
              FAR RIGHT: Single Overflow Control (⋯) (Section 4.3)
              Hosts View Mode, Extended Format, Inspectors, Export & Settings
              =================================================================== */}
          <div className="relative shrink-0" ref={overflowRef}>
            <button
              onClick={() => setShowOverflowSheet(!showOverflowSheet)}
              className={`p-2 sm:p-1.5 rounded-[6px] transition-colors cursor-pointer min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-[32px] flex items-center justify-center ${
                showOverflowSheet
                  ? 'bg-[#221E18] text-[#FAF6EE]'
                  : 'text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9]'
              }`}
              title="More studio tools, views, and settings (⋯)"
              aria-label="More options"
              aria-haspopup="dialog"
              aria-expanded={showOverflowSheet}
            >
              <MoreHorizontal size={18} />
            </button>

            {/* Comprehensive Overflow Sheet (Section 4.3) */}
            {showOverflowSheet && (
              <>
                {/* Mobile Backdrop */}
                <div
                  className="sm:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-50 animate-in fade-in duration-150"
                  onClick={() => setShowOverflowSheet(false)}
                />

                <div
                  className={`z-50 bg-[#FAF6EE] border border-[rgba(34,30,24,0.14)] shadow-warm-modal animate-in duration-150
                    fixed bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl p-4 sm:p-3 sm:absolute sm:bottom-auto sm:right-0 sm:left-auto sm:top-full sm:mt-1.5 sm:w-76 sm:rounded-xl
                  `}
                >
                  {/* Mobile Drag Handle */}
                  <div className="sm:hidden w-10 h-1 bg-[rgba(34,30,24,0.2)] rounded-full mx-auto mb-3" />

                  {/* 1. VIEW MODE (Radio group, not separate buttons) */}
                  <div className="mb-3">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[#7A705F] block mb-1.5">
                      Surface &amp; View Mode
                    </label>

                    {/* Live vs Raw Markdown */}
                    {onChangeEditorSurface && (
                      <div className="grid grid-cols-2 gap-1 bg-[#F1EAD9] p-0.5 rounded-[6px] mb-2">
                        <button
                          onClick={() => {
                            onChangeEditorSurface('rich');
                            setShowOverflowSheet(false);
                          }}
                          className={`py-1 text-xs font-mono rounded-[4px] transition-all cursor-pointer ${
                            editorSurface === 'rich'
                              ? 'bg-[#FAF6EE] text-[#221E18] font-bold shadow-xs'
                              : 'text-[#7A705F] hover:text-[#221E18]'
                          }`}
                        >
                          Live WYSIWYG
                        </button>
                        <button
                          onClick={() => {
                            onChangeEditorSurface('raw');
                            setShowOverflowSheet(false);
                          }}
                          className={`py-1 text-xs font-mono rounded-[4px] transition-all cursor-pointer ${
                            editorSurface === 'raw'
                              ? 'bg-[#FAF6EE] text-[#221E18] font-bold shadow-xs'
                              : 'text-[#7A705F] hover:text-[#221E18]'
                          }`}
                        >
                          Raw Markdown
                        </button>
                      </div>
                    )}

                    {/* Scrivenings Mode */}
                    {onChangeScriveningsMode && (
                      <div className="grid grid-cols-3 gap-1 bg-[#F1EAD9] p-0.5 rounded-[6px] mb-2">
                        {(['single', 'chapter', 'manuscript'] as ScriveningsMode[]).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => {
                              onChangeScriveningsMode(mode);
                              setShowOverflowSheet(false);
                            }}
                            className={`py-1 text-[11px] font-mono capitalize rounded-[4px] transition-colors cursor-pointer ${
                              scriveningsMode === mode
                                ? 'bg-[#FAF6EE] text-[#221E18] font-bold shadow-xs'
                                : 'text-[#7A705F] hover:text-[#221E18]'
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Focus & Typewriter toggles */}
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => {
                          onToggleFocusMode();
                          setShowOverflowSheet(false);
                        }}
                        className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-[5px] border border-[rgba(34,30,24,0.12)] bg-[#F1EAD9]/60 hover:bg-[#F1EAD9] text-xs text-[#221E18] cursor-pointer"
                      >
                        <Eye size={13} />
                        <span>Zen Focus</span>
                      </button>
                      <button
                        onClick={() => {
                          onToggleTypewriterMode();
                          setShowOverflowSheet(false);
                        }}
                        className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-[5px] border border-[rgba(34,30,24,0.12)] text-xs cursor-pointer ${
                          typewriterMode ? 'bg-[#F1EAD9] text-[#B54B32] font-semibold' : 'bg-[#F1EAD9]/60 text-[#221E18]'
                        }`}
                      >
                        <Sliders size={13} />
                        <span>Typewriter</span>
                      </button>
                    </div>
                  </div>

                  {/* 2. EXTENDED FORMATTING & TYPESETTING */}
                  <div className="mb-3 pt-2.5 border-t border-[rgba(34,30,24,0.08)]">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[#7A705F] block mb-1.5">
                      Typography &amp; Layout
                    </label>

                    <div className="grid grid-cols-2 gap-1.5 mb-2">
                      <button
                        onClick={() => {
                          setShowTypesettingModal(true);
                          setShowOverflowSheet(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-[5px] bg-[#F1EAD9]/60 hover:bg-[#F1EAD9] text-[#221E18] cursor-pointer"
                      >
                        <SlidersHorizontal size={13} className="text-[#7A705F]" /> Layout Settings
                      </button>
                      <button
                        onClick={() => {
                          onInsertSceneBreak();
                          setShowOverflowSheet(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-[5px] bg-[#F1EAD9]/60 hover:bg-[#F1EAD9] text-[#221E18] cursor-pointer"
                      >
                        <Minus size={13} className="text-[#7A705F]" /> Scene Break
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-1">
                      <button
                        onClick={() => {
                          onApplyFormat('> ');
                          setShowOverflowSheet(false);
                        }}
                        className="flex items-center justify-center gap-1 py-1 rounded-[4px] bg-[#F1EAD9]/50 hover:bg-[#F1EAD9] text-xs text-[#221E18] cursor-pointer"
                      >
                        <Quote size={12} /> Quote
                      </button>
                      <button
                        onClick={() => {
                          onApplyFormat('- ');
                          setShowOverflowSheet(false);
                        }}
                        className="flex items-center justify-center gap-1 py-1 rounded-[4px] bg-[#F1EAD9]/50 hover:bg-[#F1EAD9] text-xs text-[#221E18] cursor-pointer"
                      >
                        <List size={12} /> Bullets
                      </button>
                      <button
                        onClick={() => {
                          onApplyFormat('1. ');
                          setShowOverflowSheet(false);
                        }}
                        className="flex items-center justify-center gap-1 py-1 rounded-[4px] bg-[#F1EAD9]/50 hover:bg-[#F1EAD9] text-xs text-[#221E18] cursor-pointer"
                      >
                        <ListOrdered size={12} /> Numbers
                      </button>
                    </div>
                  </div>

                  {/* 3. INSPECTORS & DRAWERS */}
                  <div className="mb-3 pt-2.5 border-t border-[rgba(34,30,24,0.08)]">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[#7A705F] block mb-1.5">
                      Inspectors &amp; Lenses
                    </label>

                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          onToggleSidebar();
                          setShowOverflowSheet(false);
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-[5px] hover:bg-[#F1EAD9] text-[#221E18] cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Compass size={13} className="text-[#7A705F]" />
                          <span>Scene Facts &amp; Story Bible</span>
                        </div>
                        {sidebarOpen && <Check size={12} className="text-[#B54B32]" />}
                      </button>

                      {onToggleLineEditLens && (
                        <button
                          onClick={() => {
                            onToggleLineEditLens();
                            setShowOverflowSheet(false);
                          }}
                          className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-[5px] hover:bg-[#F1EAD9] text-[#221E18] cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <PenLine size={13} className="text-[#7A705F]" />
                            <span>Line Edit Lens</span>
                          </div>
                          {isLineEditLensOpen && <Check size={12} className="text-[#B54B32]" />}
                        </button>
                      )}

                      <button
                        onClick={() => {
                          onToggleSearch();
                          setShowOverflowSheet(false);
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-[5px] hover:bg-[#F1EAD9] text-[#221E18] cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Search size={13} className="text-[#7A705F]" />
                          <span>Find &amp; Replace (⌘F)</span>
                        </div>
                        {showSearch && <Check size={12} className="text-[#B54B32]" />}
                      </button>
                    </div>
                  </div>

                  {/* 4. DOCUMENT & EXPORT ACTIONS */}
                  <div className="mb-3 pt-2.5 border-t border-[rgba(34,30,24,0.08)]">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[#7A705F] block mb-1.5">
                      Document
                    </label>

                    <div className="space-y-1">
                      {onOpenCompileModal && (
                        <button
                          onClick={() => {
                            onOpenCompileModal();
                            setShowOverflowSheet(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-[#F1EAD9] rounded-[5px] flex items-center gap-2 text-[#221E18] cursor-pointer"
                        >
                          <Download size={13} className="text-[#7A705F]" /> Compile &amp; Export
                        </button>
                      )}

                      <button
                        onClick={handleCopyMarkdown}
                        className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-[#F1EAD9] rounded-[5px] flex items-center gap-2 text-[#221E18] cursor-pointer"
                      >
                        <Copy size={13} className="text-[#7A705F]" /> Copy as Markdown
                      </button>

                      {onDuplicateScene && (
                        <button
                          onClick={() => {
                            onDuplicateScene(scene.id);
                            setShowOverflowSheet(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-[#F1EAD9] rounded-[5px] flex items-center gap-2 text-[#221E18] cursor-pointer"
                        >
                          <Files size={13} className="text-[#7A705F]" /> Duplicate Scene
                        </button>
                      )}

                      {onDeleteScene && allScenes.length > 1 && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete "${scene.title}"?`)) {
                              onDeleteScene(scene.id);
                            }
                            setShowOverflowSheet(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-rose-50 rounded-[5px] flex items-center gap-2 text-[#B54B32] cursor-pointer"
                        >
                          <Trash2 size={13} /> Delete Scene
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 5. WORKSPACE & ACCESSIBILITY (Rehomed from TopBar) */}
                  <div className="pt-2.5 border-t border-[rgba(34,30,24,0.08)]">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[#7A705F] block mb-1.5">
                      Workspace
                    </label>

                    <div className="space-y-1">
                      {/* Role switcher */}
                      {onToggleRole && (
                        <button
                          onClick={() => {
                            onToggleRole();
                            setShowOverflowSheet(false);
                          }}
                          className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-[5px] hover:bg-[#F1EAD9] text-[#221E18] cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            {userRole === 'author' ? <PenTool size={13} /> : <Edit3 size={13} />}
                            <span>Role: <strong className="capitalize">{userRole}</strong></span>
                          </div>
                          <span className="text-[10px] font-mono text-[#7A705F]">Switch</span>
                        </button>
                      )}

                      {/* Theme toggle */}
                      {onToggleTheme && (
                        <button
                          onClick={() => {
                            onToggleTheme();
                            setShowOverflowSheet(false);
                          }}
                          className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-[5px] hover:bg-[#F1EAD9] text-[#221E18] cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            {theme === 'lamplight' ? <Sun size={13} /> : <Moon size={13} />}
                            <span>Theme: <strong className="capitalize">{theme}</strong></span>
                          </div>
                          <span className="text-[10px] font-mono text-[#7A705F]">Toggle</span>
                        </button>
                      )}

                      {/* Colorblind mode */}
                      {onToggleColorBlind && (
                        <button
                          onClick={() => {
                            onToggleColorBlind();
                            setShowOverflowSheet(false);
                          }}
                          className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-[5px] hover:bg-[#F1EAD9] text-[#221E18] cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Eye size={13} />
                            <span>Accessibility Vision</span>
                          </div>
                          <span className="text-[10px] font-mono text-[#7A705F] capitalize">
                            {colorBlindMode}
                          </span>
                        </button>
                      )}

                      {/* Global Search / Command Palette */}
                      {onOpenSearch && (
                        <button
                          onClick={() => {
                            onOpenSearch();
                            setShowOverflowSheet(false);
                          }}
                          className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-[5px] hover:bg-[#F1EAD9] text-[#221E18] cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Search size={13} />
                            <span>Command Palette</span>
                          </div>
                          <kbd className="text-[9px] font-mono px-1 py-0.5 rounded bg-[rgba(34,30,24,0.06)] text-[#7A705F]">
                            ⌘K
                          </kbd>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* =========================================================================
          SECTION 4.4: MOBILE KEYBOARD-ANCHORED FORMATTING DOCK (<=640px)
          Provides quick-access formatting tools anchored at bottom near thumb
          ========================================================================= */}
      <div
        id="mobile-keyboard-formatting-dock"
        className="fixed bottom-3 left-3 right-3 max-w-sm mx-auto z-40 sm:hidden flex items-center justify-between px-3 py-1.5 rounded-full bg-[#FAF6EE]/95 backdrop-blur-md border border-[rgba(34,30,24,0.15)] shadow-warm-lg transition-transform"
      >
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 text-[#221E18] disabled:opacity-20 transition-colors cursor-pointer"
          title="Undo"
        >
          <Undo2 size={16} />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1.5 text-[#221E18] disabled:opacity-20 transition-colors cursor-pointer"
          title="Redo"
        >
          <Redo2 size={16} />
        </button>
        <div className="w-px h-4 bg-[rgba(34,30,24,0.15)]" />
        <button
          onClick={() => onApplyFormat('**', '**')}
          className="p-1.5 text-[#221E18] font-bold transition-colors cursor-pointer"
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => onApplyFormat('*', '*')}
          className="p-1.5 text-[#221E18] italic transition-colors cursor-pointer"
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          onClick={() => onApplyFormat('# ')}
          className="p-1.5 text-[#221E18] transition-colors cursor-pointer"
          title="Heading"
        >
          <Heading1 size={16} />
        </button>
        <button
          onClick={() => onApplyFormat('> ')}
          className="p-1.5 text-[#221E18] transition-colors cursor-pointer"
          title="Blockquote"
        >
          <Quote size={16} />
        </button>
        <button
          onClick={() => onApplyFormat('- ')}
          className="p-1.5 text-[#221E18] transition-colors cursor-pointer"
          title="Bullet list"
        >
          <List size={16} />
        </button>
        <div className="w-px h-4 bg-[rgba(34,30,24,0.15)]" />
        <button
          onClick={() => setShowOverflowSheet(true)}
          className="p-1.5 text-[#7A705F] hover:text-[#221E18] transition-colors cursor-pointer"
          title="More actions"
        >
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* =========================================================================
          TYPESETTING & LAYOUT MODAL (Triggered from overflow or layout button)
          ========================================================================= */}
      {showTypesettingModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#FAF6EE] border border-[rgba(34,30,24,0.14)] rounded-[12px] shadow-warm-modal p-4 space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[rgba(34,30,24,0.08)]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-[#B54B32]" />
                <h3 className="font-serif font-bold text-sm text-[#221E18]">
                  Manuscript Typesetting
                </h3>
              </div>
              <button
                onClick={() => setShowTypesettingModal(false)}
                className="text-[#7A705F] hover:text-[#221E18] p-1 rounded cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Font Family */}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#7A705F] block mb-1">
                Typeface
              </label>
              <div className="grid grid-cols-3 gap-1 bg-[#F1EAD9] p-0.5 rounded-[6px]">
                {(['serif', 'sans', 'mono'] as EditorFontFamily[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => onChangeFontFamily(f)}
                    className={`py-1.5 rounded-[4px] text-xs capitalize transition-colors cursor-pointer ${
                      fontFamily === f
                        ? 'bg-[#FAF6EE] text-[#221E18] font-bold shadow-xs'
                        : 'text-[#7A705F] hover:text-[#221E18]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size & Line Spacing */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-[#7A705F] block mb-1">
                  Text Size
                </label>
                <div className="grid grid-cols-3 gap-0.5 bg-[#F1EAD9] p-0.5 rounded-[5px]">
                  {(['compact', 'normal', 'large'] as EditorFontSize[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => onChangeFontSize(s)}
                      className={`py-1 text-[11px] uppercase transition-colors cursor-pointer ${
                        fontSize === s
                          ? 'bg-[#FAF6EE] text-[#221E18] font-bold shadow-xs rounded-[3px]'
                          : 'text-[#7A705F] hover:text-[#221E18]'
                      }`}
                      title={s}
                    >
                      {s.charAt(0)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-[#7A705F] block mb-1">
                  Line Height
                </label>
                <div className="grid grid-cols-4 gap-0.5 bg-[#F1EAD9] p-0.5 rounded-[5px]">
                  {AVAILABLE_LINE_SPACINGS.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => onChangeLineSpacing && onChangeLineSpacing(l.id)}
                      className={`py-1 text-[10px] font-mono transition-colors cursor-pointer ${
                        lineSpacing === l.id
                          ? 'bg-[#FAF6EE] text-[#221E18] font-bold shadow-xs rounded-[3px]'
                          : 'text-[#7A705F] hover:text-[#221E18]'
                      }`}
                      title={l.label}
                    >
                      {l.multiplier}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Page Width & Alignment */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-[#7A705F] block mb-1">
                  Canvas Width
                </label>
                <div className="grid grid-cols-3 gap-0.5 bg-[#F1EAD9] p-0.5 rounded-[5px]">
                  {AVAILABLE_PAGE_WIDTHS.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => onChangePageWidth && onChangePageWidth(w.id)}
                      className={`py-1 text-[10px] font-mono transition-colors cursor-pointer ${
                        pageWidth === w.id
                          ? 'bg-[#FAF6EE] text-[#221E18] font-bold shadow-xs rounded-[3px]'
                          : 'text-[#7A705F] hover:text-[#221E18]'
                      }`}
                      title={`${w.label} (${w.cssValue})`}
                    >
                      {w.label.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-[#7A705F] block mb-1">
                  Alignment
                </label>
                <div className="grid grid-cols-2 gap-0.5 bg-[#F1EAD9] p-0.5 rounded-[5px]">
                  <button
                    onClick={() => onChangeTextAlign && onChangeTextAlign('left')}
                    className={`py-1 text-xs transition-colors cursor-pointer text-center ${
                      textAlign === 'left'
                        ? 'bg-[#FAF6EE] text-[#221E18] font-bold shadow-xs rounded-[3px]'
                        : 'text-[#7A705F] hover:text-[#221E18]'
                    }`}
                  >
                    Left
                  </button>
                  <button
                    onClick={() => onChangeTextAlign && onChangeTextAlign('justify')}
                    className={`py-1 text-xs transition-colors cursor-pointer text-center ${
                      textAlign === 'justify'
                        ? 'bg-[#FAF6EE] text-[#221E18] font-bold shadow-xs rounded-[3px]'
                        : 'text-[#7A705F] hover:text-[#221E18]'
                    }`}
                  >
                    Justified
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowTypesettingModal(false)}
              className="w-full py-2 bg-[#221E18] text-[#FAF6EE] rounded-[6px] text-xs font-semibold hover:bg-black transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};
