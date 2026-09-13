import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Scene,
  Entity,
  Thread,
  CuttingRoomItem,
  AIAuditLog,
  EntityType,
  EntityStatus,
  Chapter,
  ResearchVaultItem,
  ScriveningsMode,
  Project,
  LineEditColorCode
} from '../types';
import { Search, X } from 'lucide-react';
import { QuickEntityModal } from './QuickEntityModal';
import { AIPanel } from './AIPanel';
import { UnifiedEditorBar, EditorViewMode, EditorFontFamily, EditorFontSize } from './editor/UnifiedEditorBar';
import { SceneOutlineDrawer } from './editor/SceneOutlineDrawer';
import { SceneMetadataPanel } from './editor/SceneMetadataPanel';
import { LineEditLensPanel } from './editor/LineEditLensPanel';
import { extractLineEditsFromMarkdown } from '../utils/lineEditConstants';
import { ManuscriptCanvas } from './editor/ManuscriptCanvas';
import { ScriveningsCanvas } from './editor/ScriveningsCanvas';
import { LinguisticStatsModal } from './statistics/LinguisticStatsModal';
import { CompileModal } from './compile/CompileModal';
import { RichEditorHandle } from './editor/RichLiveEditor';
import { EditorFloatingDock } from './editor/EditorFloatingDock';
import { useEditorHistory } from '../hooks/useEditorHistory';
import { getScenesForChapter } from '../utils/chapterUtils';
import { ScreenType } from './Navigation';
import { VaultInfo } from '../services/storage/vaultTypes';
import {
  EditorLineSpacing,
  EditorWordSpacing,
  EditorTextAlign,
  EditorPageWidth,
  ColorBlindMode,
  ManuscriptTypographySettings,
  getSavedTypographySettings,
  applyTypographySettingsToDOM
} from '../services/theme/themeConfig';

interface EditorScreenProps {
  scene: Scene;
  allScenes: Scene[];
  chapters?: Chapter[];
  entities: Entity[];
  threads: Thread[];
  lastSavedText: string;
  onUpdateScene: (updatedFields: Partial<Scene>) => void;
  onNavigateToScene: (sceneId: string) => void;
  onSendToCuttingRoom: (item: CuttingRoomItem) => void;
  onAddEntity: (entity: Entity) => void;
  onLogAiAction: (log: AIAuditLog) => void;
  onOpenStoryBible: () => void;
  onDuplicateScene?: (sceneId: string) => void;
  onDeleteScene?: (sceneId: string) => void;
  onAddChapter?: (title?: string, actOrPhase?: string) => void;
  onUpdateChapter?: (chapterId: string, fields: Partial<Chapter>) => void;
  onDeleteChapter?: (chapterId: string) => void;
  onAddSceneToChapter?: (chapterId: string) => void;
  researchVault?: ResearchVaultItem[];
  onUpdateSceneById?: (sceneId: string, updatedFields: Partial<Scene>) => void;
  onOpenResearchItem?: (itemId: string) => void;
  onOpenCodexEntity?: (entityId: string) => void;
  onNavigateToScreenplay?: () => void;
  project?: Project;
  projectTitle?: string;
  authorName?: string;
  lineSpacing?: EditorLineSpacing;
  wordSpacing?: EditorWordSpacing;
  textAlign?: EditorTextAlign;
  pageWidth?: EditorPageWidth;
  onChangeLineSpacing?: (spacing: EditorLineSpacing) => void;
  onChangeWordSpacing?: (spacing: EditorWordSpacing) => void;
  onChangeTextAlign?: (align: EditorTextAlign) => void;
  onChangePageWidth?: (width: EditorPageWidth) => void;

  // Single adaptive header integration props
  isSidebarOpen?: boolean;
  onToggleSidebarNav?: () => void;
  onOpenMobileDrawer?: () => void;
  onNavigate?: (screen: ScreenType) => void;
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

export const EditorScreen: React.FC<EditorScreenProps> = ({
  scene,
  allScenes,
  chapters,
  entities,
  threads,
  lastSavedText,
  onUpdateScene,
  onNavigateToScene,
  onSendToCuttingRoom,
  onAddEntity,
  onLogAiAction,
  onOpenStoryBible,
  onDuplicateScene,
  onDeleteScene,
  onAddChapter,
  onUpdateChapter,
  onDeleteChapter,
  onAddSceneToChapter,
  researchVault = [],
  onUpdateSceneById,
  onOpenResearchItem,
  onOpenCodexEntity,
  onNavigateToScreenplay,
  project,
  projectTitle,
  authorName,
  lineSpacing: propLineSpacing,
  wordSpacing: propWordSpacing,
  textAlign: propTextAlign,
  pageWidth: propPageWidth,
  onChangeLineSpacing,
  onChangeWordSpacing,
  onChangeTextAlign,
  onChangePageWidth,

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
  // Focus Mode & Sidebar states (default closed on mobile/tablet to ensure spacious canvas)
  const [isSmallScreen, setIsSmallScreen] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024);
  const [focusMode, setFocusMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024);
  const [leftNavOpen, setLeftNavOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024);
  const [metadataTab, setMetadataTab] = useState<'facts' | 'history' | 'bookmarks'>('facts');

  // Scrivenings & Advanced Mode Modals
  const [scriveningsMode, setScriveningsMode] = useState<ScriveningsMode>('single');
  const [showLinguisticStats, setShowLinguisticStats] = useState(false);
  const [showCompileModal, setShowCompileModal] = useState(false);

  const handleToggleFacts = () => {
    if (sidebarOpen && metadataTab === 'facts') {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
      setMetadataTab('facts');
    }
  };

  const handleToggleHistory = () => {
    if (sidebarOpen && metadataTab === 'history') {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
      setMetadataTab('history');
    }
  };

  // Resize listener for responsive layout adjustments
  useEffect(() => {
    const handleResize = () => {
      const small = window.innerWidth < 1024;
      setIsSmallScreen(small);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // View Mode: 'write' | 'split' | 'preview'
  const [viewMode, setViewMode] = useState<EditorViewMode>('write');

  // Editor Surface: 'rich' (Live Preview) vs 'raw' (Syntax)
  const [editorSurface, setEditorSurface] = useState<'rich' | 'raw'>('rich');

  // Typography Options
  const [fontFamily, setFontFamily] = useState<EditorFontFamily>('serif');
  const [fontSize, setFontSize] = useState<EditorFontSize>('normal');

  // Manuscript Typography (Line, Word, Alignment, Page Width) Fallback & State
  const [localTypography, setLocalTypography] = useState<ManuscriptTypographySettings>(() => getSavedTypographySettings());
  const activeLineSpacing = propLineSpacing || localTypography.lineSpacing;
  const activeWordSpacing = propWordSpacing || localTypography.wordSpacing;
  const activeTextAlign = propTextAlign || localTypography.textAlign;
  const activePageWidth = propPageWidth || localTypography.pageWidth || 'standard';

  const handleUpdateLineSpacing = (spacing: EditorLineSpacing) => {
    if (onChangeLineSpacing) {
      onChangeLineSpacing(spacing);
    } else {
      const next = { ...localTypography, lineSpacing: spacing };
      setLocalTypography(next);
      applyTypographySettingsToDOM(next);
    }
  };

  const handleUpdateWordSpacing = (spacing: EditorWordSpacing) => {
    if (onChangeWordSpacing) {
      onChangeWordSpacing(spacing);
    } else {
      const next = { ...localTypography, wordSpacing: spacing };
      setLocalTypography(next);
      applyTypographySettingsToDOM(next);
    }
  };

  const handleUpdateTextAlign = (align: EditorTextAlign) => {
    if (onChangeTextAlign) {
      onChangeTextAlign(align);
    } else {
      const next = { ...localTypography, textAlign: align };
      setLocalTypography(next);
      applyTypographySettingsToDOM(next);
    }
  };

  const handleUpdatePageWidth = (width: EditorPageWidth) => {
    if (onChangePageWidth) {
      onChangePageWidth(width);
    } else {
      const next = { ...localTypography, pageWidth: width };
      setLocalTypography(next);
      applyTypographySettingsToDOM(next);
    }
  };

  // Typewriter Scroll Mode
  const [typewriterMode, setTypewriterMode] = useState(false);

  // Resizable Editor Left Sidebar (Binder Outline)
  const DEFAULT_EDITOR_LEFT_WIDTH = 288;
  const MIN_EDITOR_LEFT_WIDTH = 200;
  const MAX_EDITOR_LEFT_WIDTH = 520;

  const [editorLeftWidth, setEditorLeftWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('threadline_editor_left_sidebar_width');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= MIN_EDITOR_LEFT_WIDTH && parsed <= MAX_EDITOR_LEFT_WIDTH) {
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_EDITOR_LEFT_WIDTH;
  });

  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const startLeftXRef = useRef(0);
  const startLeftWidthRef = useRef(editorLeftWidth);
  const leftWidthRef = useRef(editorLeftWidth);
  leftWidthRef.current = editorLeftWidth;

  const handleStartLeftResize = (clientX: number) => {
    setIsResizingLeft(true);
    startLeftXRef.current = clientX;
    startLeftWidthRef.current = leftWidthRef.current;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleLeftResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleStartLeftResize(e.clientX);
  };

  const handleLeftResizeTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleStartLeftResize(e.touches[0].clientX);
    }
  };

  const handleResetLeftWidth = () => {
    setEditorLeftWidth(DEFAULT_EDITOR_LEFT_WIDTH);
    try {
      localStorage.setItem('threadline_editor_left_sidebar_width', DEFAULT_EDITOR_LEFT_WIDTH.toString());
    } catch {}
  };

  useEffect(() => {
    if (!isResizingLeft) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startLeftXRef.current;
      const newWidth = Math.min(Math.max(startLeftWidthRef.current + delta, MIN_EDITOR_LEFT_WIDTH), MAX_EDITOR_LEFT_WIDTH);
      setEditorLeftWidth(newWidth);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const delta = e.touches[0].clientX - startLeftXRef.current;
        const newWidth = Math.min(Math.max(startLeftWidthRef.current + delta, MIN_EDITOR_LEFT_WIDTH), MAX_EDITOR_LEFT_WIDTH);
        setEditorLeftWidth(newWidth);
      }
    };

    const handleEndResize = () => {
      setIsResizingLeft(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      try {
        localStorage.setItem('threadline_editor_left_sidebar_width', leftWidthRef.current.toString());
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
  }, [isResizingLeft]);

  // Resizable Editor Right Sidebar (Metadata / Inspector / Line Edit)
  const DEFAULT_EDITOR_RIGHT_WIDTH = 320;
  const MIN_EDITOR_RIGHT_WIDTH = 260;
  const MAX_EDITOR_RIGHT_WIDTH = 600;

  const [editorRightWidth, setEditorRightWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('threadline_editor_right_sidebar_width');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= MIN_EDITOR_RIGHT_WIDTH && parsed <= MAX_EDITOR_RIGHT_WIDTH) {
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_EDITOR_RIGHT_WIDTH;
  });

  const [isResizingRight, setIsResizingRight] = useState(false);
  const startRightXRef = useRef(0);
  const startRightWidthRef = useRef(editorRightWidth);
  const rightWidthRef = useRef(editorRightWidth);
  rightWidthRef.current = editorRightWidth;

  const handleStartRightResize = (clientX: number) => {
    setIsResizingRight(true);
    startRightXRef.current = clientX;
    startRightWidthRef.current = rightWidthRef.current;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleRightResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleStartRightResize(e.clientX);
  };

  const handleRightResizeTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleStartRightResize(e.touches[0].clientX);
    }
  };

  const handleResetRightWidth = () => {
    setEditorRightWidth(DEFAULT_EDITOR_RIGHT_WIDTH);
    try {
      localStorage.setItem('threadline_editor_right_sidebar_width', DEFAULT_EDITOR_RIGHT_WIDTH.toString());
    } catch {}
  };

  useEffect(() => {
    if (!isResizingRight) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Right sidebar expands when dragging leftwards
      const delta = startRightXRef.current - e.clientX;
      const newWidth = Math.min(Math.max(startRightWidthRef.current + delta, MIN_EDITOR_RIGHT_WIDTH), MAX_EDITOR_RIGHT_WIDTH);
      setEditorRightWidth(newWidth);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const delta = startRightXRef.current - e.touches[0].clientX;
        const newWidth = Math.min(Math.max(startRightWidthRef.current + delta, MIN_EDITOR_RIGHT_WIDTH), MAX_EDITOR_RIGHT_WIDTH);
        setEditorRightWidth(newWidth);
      }
    };

    const handleEndResize = () => {
      setIsResizingRight(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      try {
        localStorage.setItem('threadline_editor_right_sidebar_width', rightWidthRef.current.toString());
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
  }, [isResizingRight]);

  // Editor formatting & selection
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const richEditorRef = useRef<RichEditorHandle>(null);
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);

  // Quick modals
  const [showQuickEntity, setShowQuickEntity] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);

  // In-document Search
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [matchCount, setMatchCount] = useState(0);

  // New comment popup state
  const [newCommentText, setNewCommentText] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);

  // Line Editing Lens State & Markers
  const [isLineEditLensOpen, setIsLineEditLensOpen] = useState(false);
  const lineEdits = useMemo(() => {
    return extractLineEditsFromMarkdown(scene.proseContent, scene.id, scene.title);
  }, [scene.proseContent, scene.id, scene.title]);

  const handleRemoveHighlight = (targetText: string) => {
    const escaped = targetText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`==([a-z0-9_-]+):(${escaped})==|==(${escaped})==`, 'gi');
    const updated = scene.proseContent.replace(regex, targetText);
    const words = updated.trim() ? updated.trim().split(/\s+/).length : 0;
    pushSnapshot(scene.proseContent);
    onUpdateScene({ proseContent: updated, wordCount: words });
  };

  const handleChangeHighlightColor = (targetText: string, newColor: LineEditColorCode) => {
    const escaped = targetText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`==([a-z0-9_-]+):(${escaped})==|==(${escaped})==`, 'gi');
    const updated = scene.proseContent.replace(regex, `==${newColor}:${targetText}==`);
    pushSnapshot(scene.proseContent);
    onUpdateScene({ proseContent: updated });
  };

  const handleJumpToText = (text: string) => {
    setSearchQuery(text.slice(0, 30));
    setShowSearch(true);
  };

  const handleAddCommentFromHighlight = (text: string, category: string) => {
    setSelectedText(text);
    setNewCommentText(`[${category} Line Edit]: `);
    setShowCommentInput(true);
  };

  // Dedicated Undo/Redo history tracking per scene
  const {
    undo,
    redo,
    pushSnapshot,
    recordTypingChange,
    canUndo,
    canRedo,
    undoCount,
    redoCount
  } = useEditorHistory(scene.id, scene.proseContent);

  const handleUndo = useCallback(() => {
    let current = scene.proseContent;
    if (editorSurface === 'rich' && richEditorRef.current?.flush) {
      current = richEditorRef.current.flush();
    }
    const prev = undo(current);
    if (prev !== null) {
      const words = prev.trim() ? prev.trim().split(/\s+/).length : 0;
      onUpdateScene({ proseContent: prev, wordCount: words });
      if (editorSurface === 'raw' && textareaRef.current) {
        const textarea = textareaRef.current;
        let i = 0;
        while (i < current.length && i < prev.length && current[i] === prev[i]) {
          i++;
        }
        setTimeout(() => {
          if (textarea) {
            textarea.focus({ preventScroll: true });
            textarea.setSelectionRange(i, i);
          }
        }, 0);
      }
    }
  }, [undo, scene.proseContent, onUpdateScene, editorSurface]);

  const handleRedo = useCallback(() => {
    let current = scene.proseContent;
    if (editorSurface === 'rich' && richEditorRef.current?.flush) {
      current = richEditorRef.current.flush();
    }
    const next = redo(current);
    if (next !== null) {
      const words = next.trim() ? next.trim().split(/\s+/).length : 0;
      onUpdateScene({ proseContent: next, wordCount: words });
      if (editorSurface === 'raw' && textareaRef.current) {
        const textarea = textareaRef.current;
        let i = 0;
        while (i < current.length && i < next.length && current[i] === next[i]) {
          i++;
        }
        const targetPos = i + (next.length - current.length);
        setTimeout(() => {
          if (textarea) {
            textarea.focus({ preventScroll: true });
            textarea.setSelectionRange(targetPos, targetPos);
          }
        }, 0);
      }
    }
  }, [redo, scene.proseContent, onUpdateScene, editorSurface]);

  // Handle typing inside textarea
  const handleProseChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextVal = e.target.value;
    recordTypingChange(nextVal, scene.proseContent);
    const words = nextVal.trim() ? nextVal.trim().split(/\s+/).length : 0;
    onUpdateScene({ proseContent: nextVal, wordCount: words });
  };

  // Safe surface switcher between Live Preview (rich) and Syntax (raw)
  const handleSwitchEditorSurface = useCallback(
    (surface: 'rich' | 'raw') => {
      if (editorSurface === 'rich' && richEditorRef.current?.flush) {
        const latest = richEditorRef.current.flush();
        if (latest !== scene.proseContent) {
          const words = latest.trim() ? latest.trim().split(/\s+/).length : 0;
          onUpdateScene({ proseContent: latest, wordCount: words });
        }
      }
      setEditorSurface(surface);
    },
    [editorSurface, scene.proseContent, onUpdateScene]
  );

  // Global keyboard listener for Undo/Redo across editor
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      // If focused inside another input, textarea, or rich editor, let their local handlers manage events
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement).isContentEditable)
      ) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (
        ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'z') ||
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y')
      ) {
        e.preventDefault();
        handleRedo();
      } else if ((e.metaKey || e.ctrlKey) && e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        setTypewriterMode((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleUndo, handleRedo]);

  // Handle selection detection
  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    if (start !== end) {
      const text = target.value.substring(start, end).trim();
      setSelectedText(text);
      setSelectionRange({ start, end });
    } else {
      setSelectedText('');
      setSelectionRange(null);
    }
  };

  const handleDismissSelection = () => {
    setSelectedText('');
    setSelectionRange(null);
  };

  // Safe scene navigation that flushes any pending editor keystrokes first
  const handleSafeNavigateToScene = useCallback(
    (targetSceneId: string) => {
      if (richEditorRef.current?.flush) {
        const latest = richEditorRef.current.flush();
        if (latest !== scene.proseContent) {
          onUpdateScene({ proseContent: latest });
        }
      }
      onNavigateToScene(targetSceneId);
    },
    [onNavigateToScene, scene.proseContent, onUpdateScene]
  );

  // Search occurrence counter
  useEffect(() => {
    if (!searchQuery.trim() || !scene.proseContent) {
      setMatchCount(0);
      return;
    }
    const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'gi');
    const matches = scene.proseContent.match(regex);
    setMatchCount(matches ? matches.length : 0);
  }, [searchQuery, scene.proseContent]);

  // Text formatting helpers (applies Markdown syntax into prose with instant snapshot)
  const applyFormat = (prefix: string, suffix: string = prefix) => {
    // If rich editor is mounted and active, format directly
    if (editorSurface === 'rich' && richEditorRef.current) {
      richEditorRef.current.applyFormat(prefix, suffix);
      return;
    }

    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const current = scene.proseContent;
      const selected = current.substring(start, end);

      pushSnapshot(current);

      let replacement = '';
      if (selected) {
        replacement = `${prefix}${selected}${suffix}`;
      } else {
        replacement = `${prefix}text${suffix}`;
      }

      const nextProse = current.slice(0, start) + replacement + current.slice(end);
      const words = nextProse.trim() ? nextProse.trim().split(/\s+/).length : 0;
      onUpdateScene({ proseContent: nextProse, wordCount: words });

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + prefix.length, end + prefix.length);
      }, 10);
    }
  };

  const insertSceneBreak = () => {
    if (editorSurface === 'rich' && richEditorRef.current) {
      richEditorRef.current.insertSceneBreak();
      return;
    }

    const textarea = textareaRef.current;
    if (textarea) {
      const current = scene.proseContent;
      const breakString = '\n\n* * *\n\n';

      pushSnapshot(current);
      const start = textarea.selectionStart;
      const nextProse = current.slice(0, start) + breakString + current.slice(start);
      const words = nextProse.trim() ? nextProse.trim().split(/\s+/).length : 0;
      onUpdateScene({ proseContent: nextProse, wordCount: words });

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + breakString.length, start + breakString.length);
      }, 10);
    }
  };

  // Highlight helper (applies ==selection== or custom color ==color:selection==)
  const handleApplyHighlight = (colorKey: string = 'pacing') => {
    if (editorSurface === 'rich' && richEditorRef.current) {
      richEditorRef.current.applyHighlight(colorKey);
      return;
    }

    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const current = scene.proseContent;
      const selected = current.substring(start, end);

      pushSnapshot(current);

      const prefix = `==${colorKey}:`;
      const suffix = '==';

      let replacement = '';
      if (selected) {
        // Toggle off if already highlighted
        if (selected.startsWith('==') && selected.endsWith('==')) {
          replacement = selected.replace(/^==[a-zA-Z]*:?/, '').replace(/==$/, '');
        } else {
          replacement = `${prefix}${selected}${suffix}`;
        }
      } else {
        replacement = `${prefix}highlighted phrase${suffix}`;
      }

      const nextProse = current.slice(0, start) + replacement + current.slice(end);
      const words = nextProse.trim() ? nextProse.trim().split(/\s+/).length : 0;
      onUpdateScene({ proseContent: nextProse, wordCount: words });

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + prefix.length, start + replacement.length - suffix.length);
      }, 10);
    }
  };

  // Keyboard shortcut handler for textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 1. Undo
    if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      handleUndo();
      return;
    }

    // 2. Redo
    if (
      ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'z') ||
      ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y')
    ) {
      e.preventDefault();
      handleRedo();
      return;
    }

    // 3. Bold
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      applyFormat('**');
      return;
    }

    // 4. Italic
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      applyFormat('*');
      return;
    }

    // 5. Highlight (Ctrl+H or Cmd+H)
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'h') {
      e.preventDefault();
      handleApplyHighlight('pacing');
      return;
    }

    // 6. Quick Save
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      onUpdateScene({});
      return;
    }

    // 7. Tab indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const current = scene.proseContent;

      pushSnapshot(current);

      if (start === end) {
        const indent = '    ';
        const nextProse = current.slice(0, start) + indent + current.slice(end);
        onUpdateScene({ proseContent: nextProse });
        setTimeout(() => {
          textarea.setSelectionRange(start + indent.length, start + indent.length);
        }, 0);
      } else {
        const before = current.substring(0, start);
        const selected = current.substring(start, end);
        const after = current.substring(end);

        if (e.shiftKey) {
          const lines = selected.split('\n').map((l) => l.replace(/^ {1,4}/, ''));
          const newSelected = lines.join('\n');
          onUpdateScene({ proseContent: before + newSelected + after });
          setTimeout(() => {
            textarea.setSelectionRange(start, start + newSelected.length);
          }, 0);
        } else {
          const lines = selected.split('\n').map((l) => '    ' + l);
          const newSelected = lines.join('\n');
          onUpdateScene({ proseContent: before + newSelected + after });
          setTimeout(() => {
            textarea.setSelectionRange(start, start + newSelected.length);
          }, 0);
        }
      }
      return;
    }

    // 8. Escape key
    if (e.key === 'Escape') {
      handleDismissSelection();
      setShowCommentInput(false);
      if (showSearch) setShowSearch(false);
      return;
    }
  };

  const handleToggleFontSize = () => {
    if (fontSize === 'normal') setFontSize('large');
    else if (fontSize === 'large') setFontSize('compact');
    else setFontSize('normal');
  };

  // Add Comment on selected text
  const handleAddComment = () => {
    if (!newCommentText.trim() || !selectedText) return;
    const newComment = {
      id: 'c-' + Date.now(),
      selection: selectedText,
      note: newCommentText.trim(),
      author: 'Writer',
      timestamp: 'Just now'
    };
    onUpdateScene({ comments: [...(scene.comments || []), newComment] });
    setNewCommentText('');
    setShowCommentInput(false);
  };

  // Send to Cutting Room
  const handleCutToCuttingRoom = () => {
    if (!selectedText.trim()) return;
    const cutItem: CuttingRoomItem = {
      id: 'cut-' + Date.now(),
      text: selectedText,
      originalSceneTitle: scene.title,
      deletedAt: 'Just now',
      contextNote: 'Clipped from draft via selection'
    };
    onSendToCuttingRoom(cutItem);

    if (selectionRange) {
      pushSnapshot(scene.proseContent);
      const { start, end } = selectionRange;
      const nextProse = scene.proseContent.slice(0, start) + scene.proseContent.slice(end);
      onUpdateScene({ proseContent: nextProse });
    }
    setSelectedText('');
    setSelectionRange(null);
  };

  // AI Output Handler
  const handleAcceptAiOutput = (
    output: string,
    actionType: string,
    destination: 'append' | 'replace' | 'note'
  ) => {
    pushSnapshot(scene.proseContent);
    if (destination === 'replace' && selectionRange) {
      const { start, end } = selectionRange;
      const nextProse = scene.proseContent.slice(0, start) + output + scene.proseContent.slice(end);
      onUpdateScene({ proseContent: nextProse });
    } else if (destination === 'note') {
      const updatedNotes = scene.notes
        ? `${scene.notes}\n\n[AI ${actionType.toUpperCase()}]:\n${output}`
        : `[AI ${actionType.toUpperCase()}]:\n${output}`;
      onUpdateScene({ notes: updatedNotes });
    } else {
      onUpdateScene({ proseContent: scene.proseContent + '\n\n' + output });
    }
  };

  // Linked Entities for this scene
  const sceneEntities = entities.filter(
    (e) =>
      e.linkedSceneIds.includes(scene.id) ||
      scene.characters.some((c) => c.toLowerCase() === e.name.toLowerCase()) ||
      (scene.location && scene.location.toLowerCase().includes(e.name.toLowerCase()))
  );

  // Scrivenings scenes calculation with accurate single-chapter ownership
  const scriveningsScenes = useMemo(() => {
    if (scriveningsMode === 'chapter') {
      const activeChap = (chapters || []).find(
        (c) =>
          (scene.chapterId && c.id === scene.chapterId) ||
          (c.sceneIds && c.sceneIds.includes(scene.id)) ||
          (scene.chapterNumber !== undefined && c.number === scene.chapterNumber)
      );
      if (activeChap) {
        const chapScenes = getScenesForChapter(allScenes, activeChap);
        if (chapScenes.length > 0) return chapScenes;
      }
      const match = allScenes.filter((s) => s.chapterId && s.chapterId === scene.chapterId);
      return match.length > 0 ? match : [scene];
    }
    if (scriveningsMode === 'all' || scriveningsMode === 'manuscript') {
      return [...allScenes].sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    return [scene];
  }, [scriveningsMode, allScenes, scene, chapters]);

  const scriveningsScopeTitle = useMemo(() => {
    if (scriveningsMode === 'chapter') {
      const activeChap = (chapters || []).find(
        (c) =>
          (scene.chapterId && c.id === scene.chapterId) ||
          (c.sceneIds && c.sceneIds.includes(scene.id)) ||
          (scene.chapterNumber !== undefined && c.number === scene.chapterNumber)
      );
      if (activeChap) {
        return `Chapter ${activeChap.number}: ${activeChap.title}`;
      }
      return scene.chapterTitle
        ? `Chapter ${scene.chapterNumber || 1}: ${scene.chapterTitle}`
        : `Chapter ${scene.chapterNumber || 1}`;
    }
    return 'Full Manuscript';
  }, [scriveningsMode, chapters, scene]);

  // Current Scene Index in sequence
  const currentSceneIdx = allScenes.findIndex((s) => s.id === scene.id);

  return (
    <div
      className={`flex-1 min-h-0 flex flex-col bg-[#F9F8F6] text-[#3C3933] overflow-hidden ${
        focusMode ? 'fixed inset-0 z-50 h-screen' : 'h-full max-h-full'
      }`}
    >
      {/* UNIFIED SINGLE EDITOR BAR (SLIMMED DOWN TO MAX 2 BARS ON SCREEN) */}
      <UnifiedEditorBar
        scene={scene}
        allScenes={allScenes}
        currentSceneIdx={currentSceneIdx}
        lastSavedText={lastSavedText}
        focusMode={focusMode}
        leftNavOpen={leftNavOpen}
        sidebarOpen={sidebarOpen}
        showSearch={showSearch}
        scriveningsMode={scriveningsMode}
        onChangeScriveningsMode={setScriveningsMode}
        onOpenLinguisticStats={() => setShowLinguisticStats(true)}
        onOpenCompileModal={() => setShowCompileModal(true)}
        onToggleFocusMode={() => setFocusMode(!focusMode)}
        onToggleLeftNav={() => setLeftNavOpen(!leftNavOpen)}
        onToggleSidebar={handleToggleFacts}
        onToggleHistory={handleToggleHistory}
        onToggleBookmarks={() => {
          setSidebarOpen(true);
          setMetadataTab('bookmarks');
        }}
        activeMetadataTab={metadataTab}
        onToggleSearch={() => setShowSearch(!showSearch)}
        onNavigateToScene={handleSafeNavigateToScene}
        onUpdateScene={onUpdateScene}
        onDuplicateScene={onDuplicateScene}
        onDeleteScene={onDeleteScene}
        onNavigateToScreenplay={onNavigateToScreenplay}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        editorSurface={editorSurface}
        onChangeEditorSurface={handleSwitchEditorSurface}
        fontFamily={fontFamily}
        onChangeFontFamily={setFontFamily}
        fontSize={fontSize}
        onChangeFontSize={setFontSize}
        lineSpacing={activeLineSpacing}
        onChangeLineSpacing={handleUpdateLineSpacing}
        wordSpacing={activeWordSpacing}
        onChangeWordSpacing={handleUpdateWordSpacing}
        textAlign={activeTextAlign}
        onChangeTextAlign={handleUpdateTextAlign}
        pageWidth={activePageWidth}
        onChangePageWidth={handleUpdatePageWidth}
        canUndo={canUndo}
        canRedo={canRedo}
        undoCount={undoCount}
        redoCount={redoCount}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onApplyFormat={applyFormat}
        onApplyHighlight={handleApplyHighlight}
        onInsertSceneBreak={insertSceneBreak}
        typewriterMode={typewriterMode}
        onToggleTypewriterMode={() => setTypewriterMode(!typewriterMode)}
        currentWordCount={scene.wordCount}
        isLineEditLensOpen={isLineEditLensOpen}
        onToggleLineEditLens={() => setIsLineEditLensOpen((prev) => !prev)}
        lineEditCount={lineEdits.length}
        projectTitle={projectTitle || project?.title}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebarNav={onToggleSidebarNav}
        onOpenMobileDrawer={onOpenMobileDrawer}
        onNavigate={onNavigate}
        onOpenSearch={onOpenSearch}
        userRole={userRole}
        onToggleRole={onToggleRole}
        openContinuityCount={openContinuityCount}
        theme={theme}
        onToggleTheme={onToggleTheme}
        colorBlindMode={colorBlindMode}
        onToggleColorBlind={onToggleColorBlind}
        vaultInfo={vaultInfo}
        onOpenVaultManager={onOpenVaultManager}
      />

      {/* SEARCH BAR SUB-HEADER */}
      {showSearch && !focusMode && (
        <div className="bg-[#FAF9F5] border-b border-[#EBE8E2] px-6 py-2 flex items-center gap-3 text-xs animate-in slide-in-from-top-1 duration-150">
          <Search size={14} className="text-[#8C887F]" />
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Find in this scene..."
            className="bg-white border border-[#EBE8E2] rounded px-2.5 py-1 text-xs text-[#1A1814] focus:outline-none w-64"
          />
          {searchQuery && (
            <span className="text-[#8C887F] text-[11px] font-mono">
              {matchCount} {matchCount === 1 ? 'match' : 'matches'}
            </span>
          )}
          <button
            onClick={() => {
              setShowSearch(false);
              setSearchQuery('');
            }}
            className="text-[#8C887F] hover:text-[#1A1814] ml-auto cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* MAIN CANVAS BODY: 3-PANE MODULAR LAYOUT */}
      <div className="flex-1 min-h-0 flex overflow-hidden relative">
        {/* LEFT OUTLINE DRAWER (Static column on desktop, slide-over overlay sheet on mobile/tablet) */}
        {isSmallScreen ? (
          leftNavOpen && !focusMode && (
            <div className="fixed inset-0 z-50 flex animate-in fade-in duration-150">
              <div
                className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
                onClick={() => setLeftNavOpen(false)}
              />
              <div className="relative z-10 w-80 max-w-[85vw] h-full bg-[#FAF6EE] shadow-warm-modal flex flex-col animate-in slide-in-from-left duration-200 border-r border-[rgba(34,30,24,0.12)]">
                <div className="p-2.5 border-b border-[rgba(34,30,24,0.12)] flex items-center justify-between bg-[#F1EAD9]">
                  <span className="text-xs font-mono font-semibold uppercase text-[#7A705F] px-2">Binder Outline</span>
                  <button
                    onClick={() => setLeftNavOpen(false)}
                    className="p-1 rounded-[5px] text-[#7A705F] hover:text-[#221E18] min-h-[32px] min-w-[32px] flex items-center justify-center cursor-pointer"
                    title="Close outline"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <SceneOutlineDrawer
                    scene={scene}
                    allScenes={allScenes}
                    chapters={chapters}
                    threads={threads}
                    onNavigateToScene={(id) => {
                      handleSafeNavigateToScene(id);
                      setLeftNavOpen(false);
                    }}
                    onAddScene={onAddSceneToChapter ? () => {
                      onAddSceneToChapter(scene.chapterId || '');
                      setLeftNavOpen(false);
                    } : undefined}
                  />
                </div>
              </div>
            </div>
          )
        ) : (
          leftNavOpen && !focusMode && (
            <div
              style={{ width: `${editorLeftWidth}px` }}
              className={`h-full max-h-full min-h-0 flex shrink-0 relative ${
                isResizingLeft ? '' : 'transition-[width] duration-150 ease-out'
              }`}
            >
              <div className="flex-1 h-full min-w-0 overflow-hidden">
                <SceneOutlineDrawer
                  scene={scene}
                  allScenes={allScenes}
                  chapters={chapters}
                  threads={threads}
                  onNavigateToScene={handleSafeNavigateToScene}
                  onAddScene={onAddSceneToChapter ? () => onAddSceneToChapter(scene.chapterId || '') : undefined}
                />
              </div>
              {/* Desktop Resize Drag Handle for Left Outline */}
              <div
                role="separator"
                aria-orientation="vertical"
                aria-label="Resize outline sidebar"
                title="Drag to resize binder outline · Double-click to reset"
                onMouseDown={handleLeftResizeMouseDown}
                onTouchStart={handleLeftResizeTouchStart}
                onDoubleClick={handleResetLeftWidth}
                className={`absolute -right-1 top-0 bottom-0 w-2.5 cursor-col-resize z-40 group flex items-center justify-center ${
                  isResizingLeft ? 'pointer-events-auto' : ''
                }`}
              >
                <div
                  className={`w-[2px] h-full transition-colors ${
                    isResizingLeft ? 'bg-[#B54B32]' : 'bg-transparent group-hover:bg-[#B54B32]/60'
                  }`}
                />
              </div>
            </div>
          )
        )}

        {/* DESKTOP BALANCING SPACER: Balances left outline drawer when right panel is open */}
        {!isSmallScreen && !leftNavOpen && (sidebarOpen || isLineEditLensOpen) && !focusMode && (
          <div
            style={{ width: `${editorRightWidth}px` }}
            className="hidden xl:block shrink-0 pointer-events-none opacity-0 select-none"
            aria-hidden="true"
          />
        )}

        {/* CENTER WRITING CANVAS: Scrivenings vs Screenplay vs Standard Manuscript */}
        {scriveningsMode !== 'single' ? (
          <ScriveningsCanvas
            activeSceneId={scene.id}
            scenes={scriveningsScenes}
            fontFamily={fontFamily}
            fontSize={fontSize}
            scriveningsMode={scriveningsMode}
            onChangeScriveningsMode={setScriveningsMode}
            onUpdateScene={(targetSceneId, fields) => {
              if (targetSceneId === scene.id) {
                onUpdateScene(fields);
              } else if (onUpdateSceneById) {
                onUpdateSceneById(targetSceneId, fields);
              }
            }}
            onFocusSingleScene={(targetSceneId) => {
              handleSafeNavigateToScene(targetSceneId);
              setScriveningsMode('single');
            }}
            onExitScrivenings={() => setScriveningsMode('single')}
            scopeTitle={scriveningsScopeTitle}
            onAddScene={
              onAddSceneToChapter
                ? () => onAddSceneToChapter(scene.chapterId || '')
                : undefined
            }
          />
        ) : (
          <ManuscriptCanvas
            scene={scene}
            focusMode={focusMode}
            viewMode={viewMode}
            editorSurface={editorSurface}
            onChangeEditorSurface={handleSwitchEditorSurface}
            fontFamily={fontFamily}
            fontSize={fontSize}
            lineSpacing={activeLineSpacing}
            wordSpacing={activeWordSpacing}
            textAlign={activeTextAlign}
            pageWidth={activePageWidth}
            typewriterMode={typewriterMode}
            textareaRef={textareaRef}
            richEditorRef={richEditorRef}
            showCommentInput={showCommentInput}
            newCommentText={newCommentText}
            pushSnapshot={pushSnapshot}
            recordTypingChange={recordTypingChange}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onUpdateScene={onUpdateScene}
            onProseChange={handleProseChange}
            onKeyDown={handleKeyDown}
            onSelect={handleSelect}
            onCloseComment={() => setShowCommentInput(false)}
            onChangeNewComment={setNewCommentText}
            onSaveComment={handleAddComment}
            onResolveComment={(commentId) => {
              onUpdateScene({
                comments: scene.comments.filter((c) => c.id !== commentId)
              });
            }}
            onAddToStoryBible={() => setShowQuickEntity(true)}
            onCutToCuttingRoom={handleCutToCuttingRoom}
            onConsultAI={() => setShowAIPanel(true)}
          />
        )}

        {/* DESKTOP BALANCING SPACER: Balances right inspector when left binder outline is open */}
        {!isSmallScreen && leftNavOpen && !sidebarOpen && !isLineEditLensOpen && !focusMode && (
          <div className="hidden xl:block w-72 shrink-0 pointer-events-none opacity-0 select-none" aria-hidden="true" />
        )}

        {/* FLOATING PILL DOCK */}
        <EditorFloatingDock
          currentSceneIdx={currentSceneIdx}
          totalScenes={allScenes.length}
          focusMode={focusMode}
          showSearch={showSearch}
          onPrevScene={() => handleSafeNavigateToScene(allScenes[Math.max(0, currentSceneIdx - 1)].id)}
          onNextScene={() => handleSafeNavigateToScene(allScenes[Math.min(allScenes.length - 1, currentSceneIdx + 1)].id)}
          onToggleSearch={() => setShowSearch(!showSearch)}
          onToggleFocusMode={() => setFocusMode(!focusMode)}
          onOpenAIPanel={() => setShowAIPanel(true)}
        />

        {/* RIGHT METADATA & STORY BIBLE PANEL OR LINE EDIT LENS PANEL */}
        {isLineEditLensOpen && !focusMode ? (
          <div
            style={{ width: isSmallScreen ? undefined : `${editorRightWidth}px` }}
            className={`border-l border-[#E5DEC9] bg-[#FAF6EE] flex flex-col z-20 shrink-0 relative ${
              isSmallScreen ? 'w-80' : ''
            } ${isResizingRight ? '' : 'transition-[width] duration-150 ease-out'}`}
          >
            {!isSmallScreen && (
              <div
                role="separator"
                aria-orientation="vertical"
                aria-label="Resize right inspector panel"
                title="Drag to resize inspector panel · Double-click to reset"
                onMouseDown={handleRightResizeMouseDown}
                onTouchStart={handleRightResizeTouchStart}
                onDoubleClick={handleResetRightWidth}
                className={`absolute -left-1 top-0 bottom-0 w-2.5 cursor-col-resize z-40 group flex items-center justify-center ${
                  isResizingRight ? 'pointer-events-auto' : ''
                }`}
              >
                <div
                  className={`w-[2px] h-full transition-colors ${
                    isResizingRight ? 'bg-[#B54B32]' : 'bg-transparent group-hover:bg-[#B54B32]/60'
                  }`}
                />
              </div>
            )}
            <LineEditLensPanel
              markdown={scene.proseContent}
              sceneId={scene.id}
              sceneTitle={scene.title}
              onJumpToText={handleJumpToText}
              onRemoveHighlight={handleRemoveHighlight}
              onChangeHighlightColor={handleChangeHighlightColor}
              onAddCommentFromHighlight={handleAddCommentFromHighlight}
              onClose={() => setIsLineEditLensOpen(false)}
            />
          </div>
        ) : isSmallScreen ? (
          sidebarOpen && !focusMode && (
            <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-150">
              <div
                className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
                onClick={() => setSidebarOpen(false)}
              />
              <div className="relative z-10 w-80 max-w-[85vw] h-full bg-[#FAF6EE] shadow-warm-modal flex flex-col animate-in slide-in-from-right duration-200 border-l border-[rgba(34,30,24,0.12)]">
                <div className="p-2.5 border-b border-[rgba(34,30,24,0.12)] flex items-center justify-between bg-[#F1EAD9]">
                  <span className="text-xs font-mono font-semibold uppercase text-[#7A705F] px-2">Scene Facts &amp; Structure</span>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1 rounded-[5px] text-[#7A705F] hover:text-[#221E18] min-h-[32px] min-w-[32px] flex items-center justify-center cursor-pointer"
                    title="Close scene facts"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <SceneMetadataPanel
                    scene={scene}
                    sceneEntities={sceneEntities}
                    chapters={chapters}
                    allScenes={allScenes}
                    researchVault={researchVault}
                    onUpdateScene={onUpdateScene}
                    onCreateChapter={onAddChapter ? (c) => onAddChapter(c.title, c.actOrPhase) : undefined}
                    onNavigateToScene={handleSafeNavigateToScene}
                    onOpenResearchItem={onOpenResearchItem}
                    onOpenCodexEntity={onOpenCodexEntity}
                    activeTab={metadataTab}
                    onTabChange={setMetadataTab}
                  />
                </div>
              </div>
            </div>
          )
        ) : (
          sidebarOpen && !focusMode && (
            <div
              style={{ width: `${editorRightWidth}px` }}
              className={`h-full max-h-full min-h-0 flex flex-col shrink-0 relative border-l border-[rgba(34,30,24,0.12)] bg-[#FAF6EE] z-20 ${
                isResizingRight ? '' : 'transition-[width] duration-150 ease-out'
              }`}
            >
              {/* Desktop Resize Drag Handle for Right Panel */}
              <div
                role="separator"
                aria-orientation="vertical"
                aria-label="Resize right metadata sidebar"
                title="Drag to resize inspector panel · Double-click to reset"
                onMouseDown={handleRightResizeMouseDown}
                onTouchStart={handleRightResizeTouchStart}
                onDoubleClick={handleResetRightWidth}
                className={`absolute -left-1 top-0 bottom-0 w-2.5 cursor-col-resize z-40 group flex items-center justify-center ${
                  isResizingRight ? 'pointer-events-auto' : ''
                }`}
              >
                <div
                  className={`w-[2px] h-full transition-colors ${
                    isResizingRight ? 'bg-[#B54B32]' : 'bg-transparent group-hover:bg-[#B54B32]/60'
                  }`}
                />
              </div>
              <div className="flex-1 h-full min-w-0 overflow-hidden">
                <SceneMetadataPanel
                  scene={scene}
                  sceneEntities={sceneEntities}
                  chapters={chapters}
                  allScenes={allScenes}
                  researchVault={researchVault}
                  onUpdateScene={onUpdateScene}
                  onCreateChapter={onAddChapter ? (c) => onAddChapter(c.title, c.actOrPhase) : undefined}
                  onNavigateToScene={handleSafeNavigateToScene}
                  onOpenResearchItem={onOpenResearchItem}
                  onOpenCodexEntity={onOpenCodexEntity}
                  activeTab={metadataTab}
                  onTabChange={setMetadataTab}
                />
              </div>
            </div>
          )
        )}
      </div>

      {/* QUICK ADD ENTITY MODAL */}
      {showQuickEntity && (
        <QuickEntityModal
          candidateName={selectedText}
          onClose={() => setShowQuickEntity(false)}
          onSave={(type: EntityType, status: EntityStatus, description: string, canonicalFact: string) => {
            const newEntity: Entity = {
              id: 'ent-' + Date.now(),
              name: selectedText,
              type,
              status,
              description,
              canonicalFacts: [canonicalFact],
              linkedSceneIds: [scene.id]
            };
            onAddEntity(newEntity);
            if (type === 'character' && !scene.characters.includes(selectedText)) {
              onUpdateScene({ characters: [...scene.characters, selectedText] });
            }
            setShowQuickEntity(false);
          }}
        />
      )}

      {/* SOUNDING BOARD AI MODAL */}
      {showAIPanel && (
        <AIPanel
          scene={scene}
          chapters={chapters}
          allScenes={allScenes}
          sceneEntities={sceneEntities}
          selectedText={selectedText}
          onClose={() => setShowAIPanel(false)}
          onAcceptOutput={handleAcceptAiOutput}
          onDiscardOutput={() => {}}
          onLogAction={onLogAiAction}
        />
      )}

      {/* DEEP LINGUISTIC & TEXT STATISTICS MODAL */}
      <LinguisticStatsModal
        isOpen={showLinguisticStats}
        activeScene={scene}
        allScenes={allScenes}
        onClose={() => setShowLinguisticStats(false)}
      />

      {/* THE COMPILE ENGINE (MULTI-FORMAT TYPESETTING) MODAL */}
      <CompileModal
        isOpen={showCompileModal}
        scenes={allScenes}
        chapters={chapters || []}
        project={
          project || {
            id: 'proj-current',
            title: projectTitle || 'The Escapement in the Mist',
            type: 'Novel',
            protagonist: authorName || 'Silas Vance',
            genre: 'Fiction',
            situation: '',
            targetWordCount: 75000,
            status: 'in-progress',
            lastActiveSceneId: scene.id,
            updatedAt: new Date().toISOString()
          }
        }
        onClose={() => setShowCompileModal(false)}
      />
    </div>
  );
};

