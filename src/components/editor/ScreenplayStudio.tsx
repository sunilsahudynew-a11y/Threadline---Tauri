import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Scene,
  ScreenplayElementType,
  ScreenplayRevisionColor,
  ProductionTag,
  ProductionTagCategory
} from '../../types';
import {
  Film,
  Clapperboard,
  Columns2,
  Lock,
  Unlock,
  Volume2,
  Play,
  Square,
  Pause,
  Tag,
  FileText,
  ChevronRight,
  ChevronDown,
  X,
  Plus,
  Trash2,
  Check,
  CheckCircle2,
  Shield,
  Users,
  SlidersHorizontal,
  Sliders,
  Sparkles,
  AlignLeft,
  MessageSquare,
  PanelLeft,
  Menu,
  MoreHorizontal,
  Search,
  PenTool,
  Edit3
} from 'lucide-react';
import {
  detectScreenplayElement,
  parseScreenplayText,
  calculateScreenplayMetrics,
  calculateCharacterDialogueStats,
  HOLLYWOOD_REVISION_COLORS,
  PRODUCTION_TAG_CATEGORIES
} from '../../utils/finalDraftUtils';

interface ScreenplayStudioProps {
  scene: Scene;
  allScenes?: Scene[];
  onUpdateScene: (updatedFields: Partial<Scene>) => void;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
  projectTitle?: string;
  authorName?: string;
  onNavigateToScene?: (sceneId: string) => void;
  onToggleProseMode?: () => void;
  studioTheme?: 'light' | 'dark';

  isSidebarOpen?: boolean;
  onToggleSidebarNav?: () => void;
  onOpenMobileDrawer?: () => void;
  onNavigate?: (screen: any) => void;
  onOpenSearch?: () => void;
  userRole?: 'author' | 'editor';
  onToggleRole?: () => void;
  lastSavedText?: string;
}

export type StudioPanelTab = 'format' | 'production' | 'performance';

export const ScreenplayStudio: React.FC<ScreenplayStudioProps> = ({
  scene,
  allScenes = [],
  onUpdateScene,
  textareaRef: externalTextareaRef,
  projectTitle = 'Untitled Screenplay',
  authorName = 'Screenwriter',
  onNavigateToScene,
  onToggleProseMode,
  studioTheme = 'light',
  isSidebarOpen,
  onToggleSidebarNav,
  onOpenMobileDrawer,
  onNavigate,
  onOpenSearch,
  userRole = 'author',
  onToggleRole,
  lastSavedText
}) => {
  const isLight = studioTheme === 'light';
  const internalTextareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = externalTextareaRef || internalTextareaRef;

  // Layout states
  const [splitPreview, setSplitPreview] = useState(false);
  const [isStudioPanelOpen, setIsStudioPanelOpen] = useState(true);
  const [studioPanelTab, setStudioPanelTab] = useState<StudioPanelTab>('format');
  const [showOverflow, setShowOverflow] = useState(false);

  // Resizable Studio Panel
  const DEFAULT_STUDIO_WIDTH = 360;
  const MIN_STUDIO_WIDTH = 260;
  const MAX_STUDIO_WIDTH = 600;

  const [studioPanelWidth, setStudioPanelWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('threadline_screenplay_panel_width');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= MIN_STUDIO_WIDTH && parsed <= MAX_STUDIO_WIDTH) {
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_STUDIO_WIDTH;
  });

  const [isResizingStudio, setIsResizingStudio] = useState(false);
  const startStudioXRef = useRef(0);
  const startStudioWidthRef = useRef(studioPanelWidth);
  const studioWidthRef = useRef(studioPanelWidth);
  studioWidthRef.current = studioPanelWidth;

  const handleStartStudioResize = (clientX: number) => {
    setIsResizingStudio(true);
    startStudioXRef.current = clientX;
    startStudioWidthRef.current = studioWidthRef.current;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleStudioResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleStartStudioResize(e.clientX);
  };

  const handleStudioResizeTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleStartStudioResize(e.touches[0].clientX);
    }
  };

  const handleResetStudioWidth = () => {
    setStudioPanelWidth(DEFAULT_STUDIO_WIDTH);
    try {
      localStorage.setItem('threadline_screenplay_panel_width', DEFAULT_STUDIO_WIDTH.toString());
    } catch {}
  };

  useEffect(() => {
    if (!isResizingStudio) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = startStudioXRef.current - e.clientX;
      const newWidth = Math.min(Math.max(startStudioWidthRef.current + delta, MIN_STUDIO_WIDTH), MAX_STUDIO_WIDTH);
      setStudioPanelWidth(newWidth);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const delta = startStudioXRef.current - e.touches[0].clientX;
        const newWidth = Math.min(Math.max(startStudioWidthRef.current + delta, MIN_STUDIO_WIDTH), MAX_STUDIO_WIDTH);
        setStudioPanelWidth(newWidth);
      }
    };

    const handleEndResize = () => {
      setIsResizingStudio(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      try {
        localStorage.setItem('threadline_screenplay_panel_width', studioWidthRef.current.toString());
      } catch {}
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEndResize);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleEndResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEndResize);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEndResize);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizingStudio]);

  // Element state & cursor tracking
  const [currentElement, setCurrentElement] = useState<ScreenplayElementType>('action');
  const [cursorLine, setCursorLine] = useState(0);

  // Script Locking & Revisions
  const [isLocked, setIsLocked] = useState<boolean>(scene.isLocked ?? false);
  const [revisionColor, setRevisionColor] = useState<ScreenplayRevisionColor>(
    scene.revisionColor || 'white'
  );
  const [revisionAsterisks, setRevisionAsterisks] = useState<number[]>(
    scene.revisionAsterisks || []
  );

  // Scene Numbering
  const [sceneNumber, setSceneNumber] = useState<string>(
    scene.sceneNumber || String(scene.order || 1)
  );

  // Production Breakdown Tagging
  const [productionTags, setProductionTags] = useState<ProductionTag[]>(
    scene.productionTags || []
  );
  const [newTagName, setNewTagName] = useState('');
  const [newTagCategory, setNewTagCategory] = useState<ProductionTagCategory>('prop');
  const [showTagModal, setShowTagModal] = useState(false);

  // Table Read TTS State
  const [isPlayingTableRead, setIsPlayingTableRead] = useState(false);
  const [isPausedTableRead, setIsPausedTableRead] = useState(false);
  const [readingLineIndex, setReadingLineIndex] = useState<number | null>(null);
  const [characterVoiceMap, setCharacterVoiceMap] = useState<Record<string, { pitch: number; rate: number }>>({});
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Metrics
  const metrics = useMemo(() => calculateScreenplayMetrics(scene.proseContent), [scene.proseContent]);
  const dialogueStats = useMemo(() => calculateCharacterDialogueStats(scene.proseContent), [scene.proseContent]);
  const parsedLines = useMemo(
    () => parseScreenplayText(scene.proseContent, { locked: isLocked, asterisks: revisionAsterisks }),
    [scene.proseContent, isLocked, revisionAsterisks]
  );

  const currentRevisionDef =
    HOLLYWOOD_REVISION_COLORS.find((c) => c.id === revisionColor) || HOLLYWOOD_REVISION_COLORS[0];

  const updateCursorContext = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const pos = textarea.selectionStart;
    const textBefore = textarea.value.slice(0, pos);
    const lines = textBefore.split('\n');
    const lineIdx = lines.length - 1;
    setCursorLine(lineIdx);

    const fullLines = textarea.value.split('\n');
    const currentLineText = fullLines[lineIdx] || '';
    setCurrentElement(detectScreenplayElement(currentLineText));
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // TAB: Cycle element
    if (e.key === 'Tab') {
      e.preventDefault();
      const pos = textarea.selectionStart;
      const text = textarea.value;
      const lines = text.split('\n');
      const textBefore = text.slice(0, pos);
      const lineIdx = textBefore.split('\n').length - 1;
      const lineText = lines[lineIdx] || '';

      const cycleOrder: ScreenplayElementType[] = [
        'scene_heading',
        'action',
        'character',
        'parenthetical',
        'dialogue',
        'transition',
        'shot'
      ];

      const currentType = detectScreenplayElement(lineText);
      const nextIdx = (cycleOrder.indexOf(currentType) + 1) % cycleOrder.length;
      const nextType = cycleOrder[nextIdx];
      applyElementTypeToLine(lineIdx, nextType);
      return;
    }

    // ENTER: Screenplay intelligent advance
    if (e.key === 'Enter') {
      const pos = textarea.selectionStart;
      const text = textarea.value;
      const textBefore = text.slice(0, pos);
      const lines = textBefore.split('\n');
      const currentLineIdx = lines.length - 1;
      const currentLineText = lines[currentLineIdx] || '';
      const currentType = detectScreenplayElement(currentLineText);

      // Record asterisk in locked mode
      if (isLocked && !revisionAsterisks.includes(currentLineIdx)) {
        const nextAsterisks = [...revisionAsterisks, currentLineIdx];
        setRevisionAsterisks(nextAsterisks);
        onUpdateScene({ revisionAsterisks: nextAsterisks });
      }

      if (currentType === 'scene_heading') {
        e.preventDefault();
        const before = text.slice(0, pos);
        const after = text.slice(pos);
        const insert = '\n\n';
        const newText = before + insert + after;
        const words = newText.trim() ? newText.trim().split(/\s+/).length : 0;
        onUpdateScene({ proseContent: newText, wordCount: words });
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = pos + insert.length;
          updateCursorContext();
        }, 0);
        return;
      }

      if (currentType === 'character' || currentType === 'parenthetical') {
        e.preventDefault();
        const before = text.slice(0, pos);
        const after = text.slice(pos);
        const insert = '\n\t\t';
        const newText = before + insert + after;
        const words = newText.trim() ? newText.trim().split(/\s+/).length : 0;
        onUpdateScene({ proseContent: newText, wordCount: words });
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = pos + insert.length;
          updateCursorContext();
        }, 0);
        return;
      }

      if (currentType === 'dialogue') {
        e.preventDefault();
        const before = text.slice(0, pos);
        const after = text.slice(pos);
        const insert = '\n\n';
        const newText = before + insert + after;
        const words = newText.trim() ? newText.trim().split(/\s+/).length : 0;
        onUpdateScene({ proseContent: newText, wordCount: words });
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = pos + insert.length;
          updateCursorContext();
        }, 0);
        return;
      }
    }
  };

  const applyElementTypeToLine = (lineIdx: number, type: ScreenplayElementType) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const lines = textarea.value.split('\n');
    let line = lines[lineIdx] || '';
    let clean = line.replace(/^[\t\s]+/, '');

    switch (type) {
      case 'scene_heading':
        if (!/^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)/i.test(clean)) {
          clean = 'INT. ' + (clean ? clean.toUpperCase() : 'LOCATION - DAY');
        } else {
          clean = clean.toUpperCase();
        }
        break;
      case 'character':
        clean = '\t\t\t\t' + clean.toUpperCase();
        break;
      case 'parenthetical':
        clean = clean.replace(/^\(?([^)]*)\)?$/, '($1)');
        clean = '\t\t\t' + clean;
        break;
      case 'dialogue':
        clean = '\t\t' + clean;
        break;
      case 'transition':
        clean = '\t\t\t\t\t\t' + clean.toUpperCase();
        if (!clean.endsWith(':')) clean += ':';
        break;
      case 'shot':
        clean = clean.toUpperCase();
        break;
      case 'action':
      default:
        break;
    }

    lines[lineIdx] = clean;
    const newText = lines.join('\n');
    const words = newText.trim() ? newText.trim().split(/\s+/).length : 0;

    let nextAsterisks = revisionAsterisks;
    if (isLocked && !revisionAsterisks.includes(lineIdx)) {
      nextAsterisks = [...revisionAsterisks, lineIdx];
      setRevisionAsterisks(nextAsterisks);
    }

    onUpdateScene({
      proseContent: newText,
      wordCount: words,
      revisionAsterisks: nextAsterisks
    });
    setCurrentElement(type);
  };

  // Insert Dual Dialogue helper
  const handleInsertDualDialogue = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const pos = textarea.selectionStart;
    const text = textarea.value;
    const before = text.slice(0, pos);
    const after = text.slice(pos);
    const dualSnippet = '\n\n\t\t\t\tCHARACTER A ^\n\t\t(overlapping)\n\t\tFirst character line.\n\n\t\t\t\tCHARACTER B\n\t\t(simultaneous)\n\t\tSecond character overlapping line.\n\n';
    const newText = before + dualSnippet + after;
    const words = newText.trim() ? newText.trim().split(/\s+/).length : 0;
    onUpdateScene({ proseContent: newText, wordCount: words });
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = pos + dualSnippet.length;
      updateCursorContext();
    }, 0);
  };

  // Production tag handlers
  const handleAddProductionTag = () => {
    if (!newTagName.trim()) return;
    const newTag: ProductionTag = {
      id: `tag-${Date.now()}`,
      category: newTagCategory,
      name: newTagName.trim(),
      sceneId: scene.id
    };
    const updated = [...productionTags, newTag];
    setProductionTags(updated);
    onUpdateScene({ productionTags: updated });
    setNewTagName('');
  };

  const handleDeleteProductionTag = (tagId: string) => {
    const updated = productionTags.filter((t) => t.id !== tagId);
    setProductionTags(updated);
    onUpdateScene({ productionTags: updated });
  };

  // TTS Engine
  const startTableRead = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech Synthesis API is not supported in this browser environment.');
      return;
    }
    window.speechSynthesis.cancel();
    setIsPlayingTableRead(true);
    setIsPausedTableRead(false);

    const linesToRead = parsedLines.filter((l) => l.text.length > 0);
    let currentIdx = 0;

    const speakNextLine = () => {
      if (currentIdx >= linesToRead.length) {
        setIsPlayingTableRead(false);
        setReadingLineIndex(null);
        return;
      }

      const item = linesToRead[currentIdx];
      setReadingLineIndex(currentIdx);
      const utterance = new SpeechSynthesisUtterance();

      if (item.type === 'dialogue' && item.characterName) {
        utterance.text = item.text;
        const config = characterVoiceMap[item.characterName] || { pitch: 1.0, rate: 1.0 };
        utterance.pitch = config.pitch;
        utterance.rate = config.rate;
      } else if (item.type === 'scene_heading') {
        utterance.text = item.text.replace('INT.', 'Interior.').replace('EXT.', 'Exterior.');
        utterance.pitch = 0.9;
        utterance.rate = 1.05;
      } else {
        utterance.text = item.text;
        utterance.pitch = 1.0;
        utterance.rate = 1.0;
      }

      utterance.onend = () => {
        currentIdx++;
        speakNextLine();
      };

      utterance.onerror = () => {
        setIsPlayingTableRead(false);
        setReadingLineIndex(null);
      };

      speechUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    };

    speakNextLine();
  };

  const pauseTableRead = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.pause();
      setIsPausedTableRead(true);
    }
  };

  const resumeTableRead = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.resume();
      setIsPausedTableRead(false);
    }
  };

  const stopTableRead = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingTableRead(false);
      setIsPausedTableRead(false);
      setReadingLineIndex(null);
    }
  };

  // Cleanup TTS on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-text bg-[#FAF6EE] text-[#221E18]">
      {/* 1. SINGLE-ROW CONSOLIDATED STUDIO TOOLBAR */}
      <div className="px-3 sm:px-4 py-2 border-b border-[rgba(34,30,24,0.1)] bg-[#FAF6EE] flex items-center justify-between gap-2.5 text-xs select-none shrink-0 z-20 h-12">
        {/* Left: Navigation / Sidebar toggle + Scene Identity */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Mobile drawer toggle */}
          {onOpenMobileDrawer && (
            <button
              onClick={onOpenMobileDrawer}
              className="md:hidden p-1.5 rounded hover:bg-[#F1EAD9] text-[#7A705F] cursor-pointer"
              title="Open Navigation"
            >
              <Menu size={16} />
            </button>
          )}

          {/* Desktop sidebar toggle */}
          {onToggleSidebarNav && (
            <button
              onClick={onToggleSidebarNav}
              className="hidden md:flex p-1.5 rounded hover:bg-[#F1EAD9] text-[#7A705F] cursor-pointer"
              title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <PanelLeft size={16} className={!isSidebarOpen ? "text-[#7A705F]" : "text-[#221E18]"} />
            </button>
          )}

          {/* Breadcrumb / Project navigation */}
          {onNavigate && (
            <button
              onClick={() => onNavigate('projects')}
              className="hidden lg:flex items-center gap-1 font-serif text-xs text-[#7A705F] hover:text-[#221E18] cursor-pointer transition-colors max-w-[140px] truncate"
              title={projectTitle}
            >
              <span className="truncate">{projectTitle}</span>
              <ChevronRight size={12} className="shrink-0 text-[#A8A29E]" />
            </button>
          )}

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-[#221E18] text-[#FAF6EE]">
              SCENE {sceneNumber}
            </span>
            <span className="font-serif font-bold text-sm text-[#221E18] truncate max-w-[150px] sm:max-w-xs">
              {scene.title}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-[#F1EAD9] text-[#7A705F] text-[11px] font-mono shrink-0 border border-[rgba(34,30,24,0.08)]">
            <span>Pg <strong>{metrics.pagesCount}</strong></span>
            <span>•</span>
            <span>~{metrics.estimatedMinutes}m</span>
            <span>•</span>
            <span>{metrics.dialogueWordCount} spoken words</span>
          </div>
        </div>

        {/* Right: Quick Element Indicator, Split Typeset Toggle & Studio Panel Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Save Status Icon */}
          <div className="hidden sm:flex items-center text-[#7A705F]" title={lastSavedText || 'Saved'}>
            <CheckCircle2 size={14} className="text-emerald-600" />
          </div>

          {/* Active Element Chip */}
          <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded bg-[#F1EAD9] border border-[rgba(34,30,24,0.1)] text-[11px] font-mono text-[#5C5242]">
            <span className="capitalize font-semibold text-[#221E18]">
              {currentElement.replace('_', ' ')}
            </span>
          </div>

          {/* Split Typeset Preview Toggle */}
          <button
            onClick={() => setSplitPreview(!splitPreview)}
            className={`px-2.5 py-1 rounded-[5px] text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
              splitPreview
                ? 'bg-[#B54B32] text-white border-[#B54B32]'
                : 'bg-[#F1EAD9] text-[#5C5242] border-[rgba(34,30,24,0.12)] hover:text-[#221E18]'
            }`}
            title="Toggle split typeset screenplay view"
          >
            <Columns2 size={13} />
            <span className="hidden sm:inline">Typeset</span>
          </button>

          {/* Studio Panel Toggle */}
          <button
            onClick={() => setIsStudioPanelOpen(!isStudioPanelOpen)}
            className={`px-2.5 sm:px-3 py-1 rounded-[5px] text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
              isStudioPanelOpen
                ? 'bg-[#221E18] text-[#FAF6EE] border-[#221E18]'
                : 'bg-[#F1EAD9] text-[#5C5242] border-[rgba(34,30,24,0.12)] hover:text-[#221E18]'
            }`}
            title="Toggle right-side Studio Panel (Format, Production, Performance)"
          >
            <SlidersHorizontal size={13} />
            <span className="hidden sm:inline">Studio Panel</span>
          </button>

          {/* Overflow Menu */}
          <div className="relative">
            <button
              onClick={() => setShowOverflow(!showOverflow)}
              className="p-1.5 rounded hover:bg-[#F1EAD9] text-[#7A705F] hover:text-[#221E18] cursor-pointer"
              title="More actions"
            >
              <MoreHorizontal size={16} />
            </button>

            {showOverflow && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-lg shadow-xl border border-[rgba(34,30,24,0.12)] p-1 z-50 text-xs font-sans">
                {onOpenSearch && (
                  <button
                    onClick={() => {
                      setShowOverflow(false);
                      onOpenSearch();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-[#FAF6EE] text-[#221E18] text-left cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Search size={14} className="text-[#7A705F]" />
                      <span>Search & Replace</span>
                    </span>
                    <kbd className="text-[10px] font-mono text-[#A8A29E] bg-[#F1EAD9] px-1 rounded">⌘K</kbd>
                  </button>
                )}

                {onToggleProseMode && (
                  <button
                    onClick={() => {
                      setShowOverflow(false);
                      onToggleProseMode();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-[#FAF6EE] text-[#221E18] text-left cursor-pointer"
                  >
                    <PenTool size={14} className="text-[#7A705F]" />
                    <span>Switch to Prose Novel</span>
                  </button>
                )}

                {onToggleRole && (
                  <button
                    onClick={() => {
                      setShowOverflow(false);
                      onToggleRole();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-[#FAF6EE] text-[#221E18] text-left cursor-pointer border-t border-[rgba(34,30,24,0.06)]"
                  >
                    <span className="flex items-center gap-2">
                      <Edit3 size={14} className="text-[#7A705F]" />
                      <span>Role: <strong className="capitalize">{userRole}</strong></span>
                    </span>
                    <span className="text-[10px] text-[#7A705F]">Switch</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN WORKING CANVAS + RIGHT-SIDE STUDIO PANEL */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* CENTER/LEFT: DRAFTING CANVAS (8.5" x 11" Courier Page) */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-8 items-center bg-[#EAE3D2]">
            {/* Authentic Hollywood Courier Page */}
            <div
              className="w-full max-w-[760px] min-h-[960px] rounded-[3px] p-10 sm:p-16 font-mono text-[13px] leading-[1.65] relative flex flex-col bg-white text-[#111111] shadow-xl border border-[#DDD5C5]"
              style={{ fontFamily: '"Courier Prime", "Courier New", Courier, monospace' }}
            >
              {/* Header line with revision color & page number */}
              <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono pb-4 mb-6 border-b border-stone-200 select-none">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-800">
                    {projectTitle.toUpperCase()}
                  </span>
                  {revisionColor !== 'white' && (
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-semibold border"
                      style={{
                        backgroundColor: currentRevisionDef.bgHex,
                        color: currentRevisionDef.textHex,
                        borderColor: currentRevisionDef.colorHex
                      }}
                    >
                      REV. ({currentRevisionDef.label.toUpperCase()})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span>SCENE {sceneNumber}</span>
                  <span>1.</span>
                </div>
              </div>

              {/* Slugline / Scene Heading Left & Right Margin Indicator */}
              <div className="flex items-center justify-between text-[12px] font-bold text-stone-900 mb-2 select-none">
                <span>{sceneNumber}</span>
                <span className="text-stone-400 font-normal text-[10px]">
                  (Courier 12pt Standard Margins: 1.5&quot; Left, 1.0&quot; Right)
                </span>
                <span>{sceneNumber}</span>
              </div>

              {/* Interactive Screenplay Textarea */}
              <textarea
                ref={textareaRef}
                value={scene.proseContent}
                onChange={(e) => {
                  const val = e.target.value;
                  const words = val.trim() ? val.trim().split(/\s+/).length : 0;
                  onUpdateScene({ proseContent: val, wordCount: words });
                  updateCursorContext();
                }}
                onKeyDown={handleKeyDown}
                onKeyUp={updateCursorContext}
                onClick={updateCursorContext}
                placeholder="INT. CLOCKTOWER WORKSHOP - DAWN&#10;&#10;The cold has set deep into the granite flags. Silence lingers over the brass gears.&#10;&#10;SILAS&#10;(whispering)&#10;The shop is closed till tierce.&#10;&#10;MARA&#10;The Guild master sent me."
                className="flex-1 w-full resize-none border-none outline-none bg-transparent font-mono text-[13px] leading-[1.65] text-[#111111] placeholder-stone-400"
                style={{ fontFamily: '"Courier Prime", "Courier New", Courier, monospace' }}
              />

              {/* Page Break Notice */}
              <div className="mt-8 pt-4 border-t border-stone-200 text-center text-[10px] text-stone-400 select-none">
                (CONTINUED) • PAGE 1 OF {metrics.pagesCount}
              </div>
            </div>
          </div>

          {/* Split Preview: Real-time Formatted Script View */}
          {splitPreview && (
            <div className="w-1/2 p-8 overflow-y-auto flex justify-center border-l border-[#DDD5C5] bg-[#FAF6EE]">
              <div
                className="w-full max-w-[620px] p-10 font-mono text-[12px] leading-[1.6] space-y-3 rounded bg-white text-[#111111] shadow-lg border border-[#DDD5C5]"
                style={{ fontFamily: '"Courier Prime", "Courier New", Courier, monospace' }}
              >
                <div className="flex items-center justify-between text-[10px] text-stone-400 select-none pb-2 border-b border-stone-200">
                  <span>{sceneNumber}. {projectTitle.toUpperCase()}</span>
                  <span>1.</span>
                </div>

                {parsedLines.map((line, i) => {
                  if (!line.text) return <div key={i} className="h-3" />;

                  if (line.type === 'scene_heading') {
                    return (
                      <div key={i} className="font-bold uppercase tracking-wider text-black pt-2 flex items-center justify-between">
                        <span>{line.text}</span>
                        <span className="text-stone-400 text-[10px]">{sceneNumber}</span>
                      </div>
                    );
                  }
                  if (line.type === 'character') {
                    return (
                      <div key={i} className="uppercase font-bold text-center pl-16 text-black pt-1">
                        {line.text}
                      </div>
                    );
                  }
                  if (line.type === 'parenthetical') {
                    return (
                      <div key={i} className="italic text-center pl-8 text-stone-700">
                        {line.text}
                      </div>
                    );
                  }
                  if (line.type === 'dialogue') {
                    return (
                      <div key={i} className="max-w-[75%] mx-auto text-black pl-4">
                        {line.text}
                      </div>
                    );
                  }
                  if (line.type === 'transition') {
                    return (
                      <div key={i} className="text-right font-bold uppercase text-black pt-2">
                        {line.text}
                      </div>
                    );
                  }
                  return (
                    <div key={i} className="text-stone-900">
                      {line.text}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: SINGLE STUDIO PANEL (Format / Production / Performance) */}
        {isStudioPanelOpen && (
          <div
            style={{ width: `${studioPanelWidth}px` }}
            className={`border-l border-[rgba(34,30,24,0.1)] bg-[#FAF6EE] flex flex-col shrink-0 overflow-hidden shadow-sm relative ${
              isResizingStudio ? '' : 'transition-[width] duration-150 ease-out'
            }`}
          >
            {/* Desktop Resize Drag Handle for Screenplay Studio Panel */}
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize screenplay studio panel"
              title="Drag to resize studio panel · Double-click to reset"
              onMouseDown={handleStudioResizeMouseDown}
              onTouchStart={handleStudioResizeTouchStart}
              onDoubleClick={handleResetStudioWidth}
              className={`absolute -left-1 top-0 bottom-0 w-2.5 cursor-col-resize z-40 group flex items-center justify-center ${
                isResizingStudio ? 'pointer-events-auto' : ''
              }`}
            >
              <div
                className={`w-[2px] h-full transition-colors ${
                  isResizingStudio ? 'bg-[#B54B32]' : 'bg-transparent group-hover:bg-[#B54B32]/60'
                }`}
              />
            </div>
            {/* Panel Tab Switcher */}
            <div className="p-2 border-b border-[rgba(34,30,24,0.1)] bg-[#FAF6EE] flex items-center justify-between gap-1">
              <div className="flex items-center p-0.5 rounded-md bg-[#F1EAD9] border border-[rgba(34,30,24,0.1)] flex-1 text-xs font-mono">
                <button
                  onClick={() => setStudioPanelTab('format')}
                  className={`flex-1 py-1.5 rounded-[4px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    studioPanelTab === 'format'
                      ? 'bg-[#221E18] text-[#FAF6EE] shadow-xs'
                      : 'text-[#7A705F] hover:text-[#221E18]'
                  }`}
                >
                  <AlignLeft size={12} />
                  <span>Format</span>
                </button>

                <button
                  onClick={() => setStudioPanelTab('production')}
                  className={`flex-1 py-1.5 rounded-[4px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    studioPanelTab === 'production'
                      ? 'bg-[#221E18] text-[#FAF6EE] shadow-xs'
                      : 'text-[#7A705F] hover:text-[#221E18]'
                  }`}
                >
                  <Clapperboard size={12} />
                  <span>Production</span>
                </button>

                <button
                  onClick={() => setStudioPanelTab('performance')}
                  className={`flex-1 py-1.5 rounded-[4px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    studioPanelTab === 'performance'
                      ? 'bg-[#221E18] text-[#FAF6EE] shadow-xs'
                      : 'text-[#7A705F] hover:text-[#221E18]'
                  }`}
                >
                  <Volume2 size={12} />
                  <span>Performance</span>
                </button>
              </div>

              <button
                onClick={() => setIsStudioPanelOpen(false)}
                className="p-1 rounded text-[#7A705F] hover:text-[#221E18] cursor-pointer"
                title="Collapse panel"
              >
                <X size={14} />
              </button>
            </div>

            {/* TAB 1: FORMAT */}
            {studioPanelTab === 'format' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs font-mono">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#7A705F] tracking-wider block mb-2">
                    Screenplay Element Selector
                  </span>
                  <div className="space-y-1">
                    {[
                      { id: 'scene_heading' as ScreenplayElementType, label: 'Scene Heading', desc: 'INT./EXT. LOCATION - DAY', key: 'Tab 1' },
                      { id: 'action' as ScreenplayElementType, label: 'Action', desc: 'Narrative description', key: 'Tab 2' },
                      { id: 'character' as ScreenplayElementType, label: 'Character', desc: 'Speaking name', key: 'Tab 3' },
                      { id: 'parenthetical' as ScreenplayElementType, label: 'Parenthetical', desc: '(tone / action note)', key: 'Tab 4' },
                      { id: 'dialogue' as ScreenplayElementType, label: 'Dialogue', desc: 'Spoken line', key: 'Tab 5' },
                      { id: 'transition' as ScreenplayElementType, label: 'Transition', desc: 'CUT TO: / FADE IN:', key: 'Tab 6' },
                      { id: 'shot' as ScreenplayElementType, label: 'Shot', desc: 'ANGLE ON / CLOSE UP', key: 'Tab 7' }
                    ].map((item) => {
                      const isCurrent = currentElement === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => applyElementTypeToLine(cursorLine, item.id)}
                          className={`w-full p-2 rounded flex items-center justify-between text-left transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-[#B54B32] text-white font-bold shadow-xs'
                              : 'bg-white hover:bg-[#F1EAD9] border border-[#EAE3D2] text-[#221E18]'
                          }`}
                        >
                          <div>
                            <div>{item.label}</div>
                            <div className={`text-[10px] ${isCurrent ? 'text-white/80' : 'text-[#7A705F]'}`}>
                              {item.desc}
                            </div>
                          </div>
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                            isCurrent ? 'bg-white/20 text-white' : 'bg-[#F1EAD9] text-[#7A705F]'
                          }`}>
                            {item.key}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Dual-Dialogue Inserter */}
                <div className="pt-3 border-t border-[rgba(34,30,24,0.1)]">
                  <span className="text-[10px] uppercase font-bold text-[#7A705F] tracking-wider block mb-2">
                    Dual Dialogue
                  </span>
                  <button
                    onClick={handleInsertDualDialogue}
                    className="w-full p-2.5 rounded bg-white hover:bg-[#F1EAD9] border border-[#DDD5C5] text-[#221E18] flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare size={14} className="text-[#B54B32]" />
                      <div className="text-left">
                        <div className="font-bold">Insert Dual Dialogue Block</div>
                        <div className="text-[10px] text-[#7A705F]">Simultaneous overlapping dialogue (^)</div>
                      </div>
                    </div>
                    <Plus size={14} className="text-[#B54B32]" />
                  </button>
                </div>

                {/* Keyboard Navigation Shortcuts */}
                <div className="pt-3 border-t border-[rgba(34,30,24,0.1)] p-3 rounded bg-[#F1EAD9]/60 text-[11px] text-[#5C5242] leading-relaxed">
                  <span className="font-bold text-[#221E18] block mb-1">Industry Smart Typing:</span>
                  • Press <kbd className="px-1 py-0.5 rounded bg-white border">Tab</kbd> to cycle between element types.<br />
                  • Press <kbd className="px-1 py-0.5 rounded bg-white border">Enter</kbd> on Character to auto-advance to Dialogue.<br />
                  • Press <kbd className="px-1 py-0.5 rounded bg-white border">Enter</kbd> on Dialogue to return to Action.
                </div>
              </div>
            )}

            {/* TAB 2: PRODUCTION */}
            {studioPanelTab === 'production' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs font-mono">
                {/* Scene Numbering */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#7A705F] tracking-wider block mb-1.5">
                    Scene Numbering
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={sceneNumber}
                      onChange={(e) => {
                        setSceneNumber(e.target.value);
                        onUpdateScene({ sceneNumber: e.target.value });
                      }}
                      className="flex-1 px-3 py-1.5 rounded bg-white border border-[#DDD5C5] text-[#221E18] font-bold"
                      placeholder="e.g. 12A"
                    />
                    <span className="text-[11px] text-[#7A705F]">Official Slug</span>
                  </div>
                </div>

                {/* Production Script Lock */}
                <div className="pt-3 border-t border-[rgba(34,30,24,0.1)]">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      {isLocked ? <Lock size={14} className="text-amber-600" /> : <Unlock size={14} className="text-[#7A705F]" />}
                      <span className="font-bold text-[#221E18]">Production Script Lock</span>
                    </div>
                    <button
                      onClick={() => {
                        const next = !isLocked;
                        setIsLocked(next);
                        onUpdateScene({ isLocked: next });
                      }}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                        isLocked
                          ? 'bg-amber-600 text-white'
                          : 'bg-white border border-[#DDD5C5] text-[#7A705F]'
                      }`}
                    >
                      {isLocked ? 'LOCKED' : 'UNLOCKED'}
                    </button>
                  </div>
                  <p className="text-[11px] text-[#7A705F] leading-snug">
                    Freezes scene numbering and tracks revisions with asterisks (*) in the right margin.
                  </p>
                </div>

                {/* Hollywood Rainbow Revision Picker */}
                <div className="pt-3 border-t border-[rgba(34,30,24,0.1)]">
                  <span className="text-[10px] uppercase font-bold text-[#7A705F] tracking-wider block mb-2">
                    Hollywood Rainbow Revision Color
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {HOLLYWOOD_REVISION_COLORS.map((rev) => (
                      <button
                        key={rev.id}
                        onClick={() => {
                          setRevisionColor(rev.id);
                          onUpdateScene({ revisionColor: rev.id });
                        }}
                        className={`p-2 rounded text-left border flex items-center gap-1.5 transition-all cursor-pointer ${
                          revisionColor === rev.id
                            ? 'bg-[#221E18] text-white border-[#221E18] font-bold'
                            : 'bg-white border-[#EAE3D2] text-[#221E18] hover:bg-[#F1EAD9]'
                        }`}
                      >
                        <div
                          className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: rev.colorHex }}
                        />
                        <span className="truncate text-[10px]">{rev.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Breakdown Asset Tagging */}
                <div className="pt-3 border-t border-[rgba(34,30,24,0.1)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold text-[#7A705F] tracking-wider">
                      Breakdown Asset Tags ({productionTags.length})
                    </span>
                    <button
                      onClick={() => setShowTagModal(true)}
                      className="text-[#B54B32] hover:underline flex items-center gap-0.5 text-[11px] font-bold cursor-pointer"
                    >
                      <Plus size={12} />
                      <span>Tag Element</span>
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {productionTags.length === 0 ? (
                      <div className="p-3 text-center rounded border border-dashed border-[#DDD5C5] text-[11px] text-[#7A705F]">
                        No props, cast, or wardrobe tagged yet.
                      </div>
                    ) : (
                      productionTags.map((tag) => (
                        <div
                          key={tag.id}
                          className="p-2 rounded bg-white border border-[#EAE3D2] flex items-center justify-between"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="text-xs">
                              {PRODUCTION_TAG_CATEGORIES.find((c) => c.id === tag.category)?.icon || '🏷️'}
                            </span>
                            <span className="font-bold text-[#221E18] truncate">{tag.name}</span>
                            <span className="text-[9px] text-[#7A705F] uppercase">({tag.category})</span>
                          </div>
                          <button
                            onClick={() => handleDeleteProductionTag(tag.id)}
                            className="text-stone-400 hover:text-rose-600 p-0.5"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PERFORMANCE (Table Read TTS + Dialogue Statistics) */}
            {studioPanelTab === 'performance' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs font-mono">
                {/* TTS Audio Engine */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold text-[#7A705F] tracking-wider">
                      Table Read Audio Rehearsal
                    </span>
                    <div className="flex items-center gap-1">
                      {!isPlayingTableRead ? (
                        <button
                          onClick={startTableRead}
                          className="px-2.5 py-1 rounded bg-[#B54B32] text-white font-bold flex items-center gap-1 cursor-pointer hover:bg-[#9E3E27]"
                        >
                          <Play size={11} />
                          <span>Play</span>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={isPausedTableRead ? resumeTableRead : pauseTableRead}
                            className="px-2 py-1 rounded bg-amber-600 text-white font-bold flex items-center gap-1 cursor-pointer"
                          >
                            {isPausedTableRead ? <Play size={11} /> : <Pause size={11} />}
                          </button>
                          <button
                            onClick={stopTableRead}
                            className="px-2 py-1 rounded bg-stone-700 text-white font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Square size={11} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-[#7A705F] leading-snug mb-3">
                    Synthesizes character speech and scene headings for acoustic rehearsal.
                  </p>

                  {/* Teleprompter readout line */}
                  {isPlayingTableRead && readingLineIndex !== null && (
                    <div className="p-2.5 rounded bg-emerald-50 border border-emerald-300 text-emerald-900 text-[11px] animate-pulse">
                      <strong>Reading line {readingLineIndex + 1}:</strong> &ldquo;{parsedLines[readingLineIndex]?.text}&rdquo;
                    </div>
                  )}
                </div>

                {/* Cast Voice Assignments */}
                <div className="pt-3 border-t border-[rgba(34,30,24,0.1)]">
                  <span className="text-[10px] uppercase font-bold text-[#7A705F] tracking-wider block mb-2">
                    Cast Voice Tuning ({dialogueStats.length} characters)
                  </span>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {dialogueStats.map((char) => {
                      const cfg = characterVoiceMap[char.name] || { pitch: 1.0, rate: 1.0 };
                      return (
                        <div key={char.name} className="p-2 rounded bg-white border border-[#EAE3D2]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-[#221E18]">{char.name}</span>
                            <span className="text-[10px] text-[#7A705F]">{char.linesCount} lines</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-[#7A705F]">
                            <span>Pitch: {cfg.pitch}x</span>
                            <input
                              type="range"
                              min="0.6"
                              max="1.4"
                              step="0.1"
                              value={cfg.pitch}
                              onChange={(e) =>
                                setCharacterVoiceMap({
                                  ...characterVoiceMap,
                                  [char.name]: { ...cfg, pitch: parseFloat(e.target.value) }
                                })
                              }
                              className="w-24 accent-[#B54B32]"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Dialogue Statistics Table */}
                <div className="pt-3 border-t border-[rgba(34,30,24,0.1)]">
                  <span className="text-[10px] uppercase font-bold text-[#7A705F] tracking-wider block mb-2">
                    Scene Dialogue Statistics
                  </span>
                  <div className="divide-y divide-[rgba(34,30,24,0.08)] bg-white rounded border border-[#EAE3D2] overflow-hidden">
                    {dialogueStats.map((char) => (
                      <div key={char.name} className="p-2.5 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-[#221E18]">{char.name}</div>
                          <div className="text-[10px] text-[#7A705F]">{char.wordCount} spoken words</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-[#B54B32]">{char.percentage}%</div>
                          <div className="text-[10px] text-[#7A705F]">{char.linesCount} cues</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal: Add Production Tag */}
      {showTagModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-2xs flex items-center justify-center z-50 p-4">
          <div className="rounded-lg max-w-md w-full p-5 shadow-2xl bg-[#FAF6EE] border border-[#DDD5C5] text-[#221E18] animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[rgba(34,30,24,0.1)]">
              <h3 className="font-serif font-bold text-base text-[#221E18]">
                Tag Production Asset
              </h3>
              <button
                onClick={() => setShowTagModal(false)}
                className="text-[#7A705F] hover:text-[#221E18]"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="block uppercase tracking-wider text-[10px] mb-1 text-[#5C5242]">
                  Category
                </label>
                <select
                  value={newTagCategory}
                  onChange={(e) => setNewTagCategory(e.target.value as ProductionTagCategory)}
                  className="w-full rounded px-3 py-1.5 border border-[#DDD5C5] bg-white text-[#221E18]"
                >
                  {PRODUCTION_TAG_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block uppercase tracking-wider text-[10px] mb-1 text-[#5C5242]">
                  Item / Asset Name
                </label>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="e.g. Silas's Brass Watch, Steam Carriage..."
                  className="w-full rounded px-3 py-1.5 border border-[#DDD5C5] bg-white text-[#221E18]"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[rgba(34,30,24,0.1)]">
                <button
                  onClick={() => setShowTagModal(false)}
                  className="px-3 py-1.5 rounded text-[#7A705F] hover:bg-[#EAE1D0]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleAddProductionTag();
                    setShowTagModal(false);
                  }}
                  disabled={!newTagName.trim()}
                  className="px-4 py-1.5 rounded bg-[#B54B32] hover:bg-[#9E3E27] text-white font-bold disabled:opacity-50 cursor-pointer"
                >
                  Add Tag
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
