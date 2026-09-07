import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Scene,
  Entity,
  Thread,
  CuttingRoomItem,
  AIAuditLog,
  EntityType,
  EntityStatus,
  Chapter
} from '../types';
import { Search, X } from 'lucide-react';
import { QuickEntityModal } from './QuickEntityModal';
import { AIPanel } from './AIPanel';
import { EditorTopBar } from './editor/EditorTopBar';
import { EditorFormatBar, EditorViewMode, EditorFontFamily, EditorFontSize } from './editor/EditorFormatBar';
import { SceneOutlineDrawer } from './editor/SceneOutlineDrawer';
import { SceneMetadataPanel } from './editor/SceneMetadataPanel';
import { ManuscriptCanvas } from './editor/ManuscriptCanvas';
import { RichEditorHandle } from './editor/RichLiveEditor';
import { EditorFloatingDock } from './editor/EditorFloatingDock';
import { useEditorHistory } from '../hooks/useEditorHistory';

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
  onAddSceneToChapter
}) => {
  // Focus Mode & Sidebar states (default closed on mobile/tablet to ensure spacious canvas)
  const [isSmallScreen, setIsSmallScreen] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024);
  const [focusMode, setFocusMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024);
  const [leftNavOpen, setLeftNavOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024);
  const [metadataTab, setMetadataTab] = useState<'facts' | 'history'>('facts');

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

  // Typewriter Scroll Mode
  const [typewriterMode, setTypewriterMode] = useState(false);

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
    const prev = undo(scene.proseContent);
    if (prev !== null) {
      const words = prev.trim() ? prev.trim().split(/\s+/).length : 0;
      onUpdateScene({ proseContent: prev, wordCount: words });
      if (textareaRef.current && document.activeElement === textareaRef.current) {
        const textarea = textareaRef.current;
        let i = 0;
        while (i < scene.proseContent.length && i < prev.length && scene.proseContent[i] === prev[i]) {
          i++;
        }
        setTimeout(() => {
          if (textarea) {
            textarea.focus();
            textarea.setSelectionRange(i, i);
          }
        }, 0);
      }
    }
  }, [undo, scene.proseContent, onUpdateScene]);

  const handleRedo = useCallback(() => {
    const next = redo(scene.proseContent);
    if (next !== null) {
      const words = next.trim() ? next.trim().split(/\s+/).length : 0;
      onUpdateScene({ proseContent: next, wordCount: words });
      if (textareaRef.current && document.activeElement === textareaRef.current) {
        const textarea = textareaRef.current;
        let i = 0;
        while (i < scene.proseContent.length && i < next.length && scene.proseContent[i] === next[i]) {
          i++;
        }
        setTimeout(() => {
          if (textarea) {
            textarea.focus();
            textarea.setSelectionRange(i, i);
          }
        }, 0);
      }
    }
  }, [redo, scene.proseContent, onUpdateScene]);

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
  const handleApplyHighlight = (colorKey: string = 'yellow') => {
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

      const prefix = colorKey === 'yellow' ? '==' : `==${colorKey}:`;
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
      handleApplyHighlight('yellow');
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

  // Current Scene Index in sequence
  const currentSceneIdx = allScenes.findIndex((s) => s.id === scene.id);

  return (
    <div
      className={`flex-1 min-h-0 flex flex-col bg-[#F9F8F6] text-[#3C3933] overflow-hidden ${
        focusMode ? 'fixed inset-0 z-50 h-screen' : 'h-full max-h-full'
      }`}
    >
      {/* TOPBAR */}
      <EditorTopBar
        scene={scene}
        allScenes={allScenes}
        currentSceneIdx={currentSceneIdx}
        lastSavedText={lastSavedText}
        focusMode={focusMode}
        leftNavOpen={leftNavOpen}
        sidebarOpen={sidebarOpen}
        showSearch={showSearch}
        onToggleFocusMode={() => setFocusMode(!focusMode)}
        onToggleLeftNav={() => setLeftNavOpen(!leftNavOpen)}
        onToggleSidebar={handleToggleFacts}
        onToggleHistory={handleToggleHistory}
        activeMetadataTab={metadataTab}
        onToggleSearch={() => setShowSearch(!showSearch)}
        onNavigateToScene={handleSafeNavigateToScene}
        onUpdateScene={onUpdateScene}
        onDuplicateScene={onDuplicateScene}
        onDeleteScene={onDeleteScene}
      />

      {/* SLEEK FORMATTING & VIEW TOOLBAR */}
      <EditorFormatBar
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        editorSurface={editorSurface}
        onChangeEditorSurface={handleSwitchEditorSurface}
        fontFamily={fontFamily}
        onChangeFontFamily={setFontFamily}
        fontSize={fontSize}
        onChangeFontSize={setFontSize}
        canUndo={canUndo}
        canRedo={canRedo}
        undoCount={undoCount}
        redoCount={redoCount}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onApplyFormat={applyFormat}
        onApplyHighlight={handleApplyHighlight}
        onInsertSceneBreak={insertSceneBreak}
        focusMode={focusMode}
        typewriterMode={typewriterMode}
        onToggleTypewriterMode={() => setTypewriterMode(!typewriterMode)}
        currentWordCount={scene.wordCount}
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
            <SceneOutlineDrawer
              scene={scene}
              allScenes={allScenes}
              chapters={chapters}
              threads={threads}
              onNavigateToScene={handleSafeNavigateToScene}
              onAddScene={onAddSceneToChapter ? () => onAddSceneToChapter(scene.chapterId || '') : undefined}
            />
          )
        )}

        {/* CENTER WRITING CANVAS & LIVE PREVIEW */}
        <ManuscriptCanvas
          scene={scene}
          focusMode={focusMode}
          viewMode={viewMode}
          editorSurface={editorSurface}
          onChangeEditorSurface={handleSwitchEditorSurface}
          fontFamily={fontFamily}
          fontSize={fontSize}
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

        {/* RIGHT METADATA & STORY BIBLE PANEL (Static column on desktop, slide-over overlay sheet on mobile/tablet) */}
        {isSmallScreen ? (
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
                    onUpdateScene={onUpdateScene}
                    onCreateChapter={onAddChapter ? (c) => onAddChapter(c.title, c.actOrPhase) : undefined}
                    activeTab={metadataTab}
                    onTabChange={setMetadataTab}
                  />
                </div>
              </div>
            </div>
          )
        ) : (
          sidebarOpen && !focusMode && (
            <SceneMetadataPanel
              scene={scene}
              sceneEntities={sceneEntities}
              chapters={chapters}
              onUpdateScene={onUpdateScene}
              onCreateChapter={onAddChapter ? (c) => onAddChapter(c.title, c.actOrPhase) : undefined}
              activeTab={metadataTab}
              onTabChange={setMetadataTab}
            />
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
          selectedText={selectedText}
          onClose={() => setShowAIPanel(false)}
          onAcceptOutput={handleAcceptAiOutput}
          onDiscardOutput={() => {}}
          onLogAction={onLogAiAction}
        />
      )}
    </div>
  );
};

