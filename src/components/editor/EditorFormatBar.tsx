import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Highlighter,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Type,
  Undo2,
  Redo2,
  Columns2,
  PenLine,
  BookOpen,
  ChevronDown,
  AlignVerticalJustifyCenter,
  Sparkles,
  Code2
} from 'lucide-react';
import { SessionTimer } from './SessionTimer';

export type EditorViewMode = 'write' | 'split' | 'preview';
export type EditorFontFamily = 'serif' | 'sans' | 'mono';
export type EditorFontSize = 'compact' | 'normal' | 'large';

interface EditorFormatBarProps {
  viewMode: EditorViewMode;
  onChangeViewMode: (mode: EditorViewMode) => void;
  editorSurface?: 'rich' | 'raw';
  onChangeEditorSurface?: (surface: 'rich' | 'raw') => void;
  fontFamily: EditorFontFamily;
  onChangeFontFamily: (family: EditorFontFamily) => void;
  fontSize: EditorFontSize;
  onChangeFontSize: (size: EditorFontSize) => void;
  canUndo: boolean;
  canRedo: boolean;
  undoCount?: number;
  redoCount?: number;
  onUndo: () => void;
  onRedo: () => void;
  onApplyFormat: (prefix: string, suffix?: string) => void;
  onApplyHighlight: (colorKey?: string) => void;
  onInsertSceneBreak: () => void;
  focusMode: boolean;
  typewriterMode: boolean;
  onToggleTypewriterMode: () => void;
  currentWordCount: number;
}

export const EditorFormatBar: React.FC<EditorFormatBarProps> = ({
  viewMode,
  onChangeViewMode,
  editorSurface = 'rich',
  onChangeEditorSurface,
  fontFamily,
  onChangeFontFamily,
  fontSize,
  onChangeFontSize,
  canUndo,
  canRedo,
  undoCount = 0,
  redoCount = 0,
  onUndo,
  onRedo,
  onApplyFormat,
  onApplyHighlight,
  onInsertSceneBreak,
  focusMode,
  typewriterMode,
  onToggleTypewriterMode,
  currentWordCount
}) => {
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);

  const headingRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (headingRef.current && !headingRef.current.contains(e.target as Node)) {
        setShowHeadingMenu(false);
      }
      if (highlightRef.current && !highlightRef.current.contains(e.target as Node)) {
        setShowHighlightMenu(false);
      }
      if (typeRef.current && !typeRef.current.contains(e.target as Node)) {
        setShowTypeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const highlightColors = [
    { key: 'yellow', label: 'Amber Yellow', bg: 'bg-amber-200', text: 'text-amber-900', border: 'border-amber-300' },
    { key: 'mint', label: 'Mint Green', bg: 'bg-emerald-200', text: 'text-emerald-900', border: 'border-emerald-300' },
    { key: 'rose', label: 'Warm Rose', bg: 'bg-rose-200', text: 'text-rose-900', border: 'border-rose-300' },
    { key: 'blue', label: 'Sky Blue', bg: 'bg-sky-200', text: 'text-sky-900', border: 'border-sky-300' },
    { key: 'purple', label: 'Lavender', bg: 'bg-purple-200', text: 'text-purple-900', border: 'border-purple-300' }
  ];

  return (
    <div
      className={`border-b border-[#E5DEC9] bg-[#FAF6EE]/95 backdrop-blur-xs px-4 md:px-8 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs select-none transition-all z-20 ${
        focusMode ? 'opacity-0 hover:opacity-100 duration-200 fixed top-0 left-0 right-0 shadow-warm-modal' : ''
      }`}
    >
      {/* LEFT: Core Formatting Controls */}
      <div className="flex items-center gap-1 flex-wrap">
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 pr-1 border-r border-[#E5DEC9]">
          <button
            type="button"
            disabled={!canUndo}
            onClick={onUndo}
            className="p-1.5 text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9] rounded transition-colors disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-[#7A705F] cursor-pointer disabled:cursor-not-allowed relative group"
            title={canUndo ? `Undo (Ctrl+Z) · ${undoCount} action${undoCount === 1 ? '' : 's'} available` : 'Undo (Ctrl+Z)'}
          >
            <Undo2 size={14} />
          </button>
          <button
            type="button"
            disabled={!canRedo}
            onClick={onRedo}
            className="p-1.5 text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9] rounded transition-colors disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-[#7A705F] cursor-pointer disabled:cursor-not-allowed relative group"
            title={canRedo ? `Redo (Ctrl+Shift+Z / Ctrl+Y) · ${redoCount} action${redoCount === 1 ? '' : 's'} available` : 'Redo (Ctrl+Shift+Z / Ctrl+Y)'}
          >
            <Redo2 size={14} />
          </button>
        </div>

        {/* Headings Dropdown */}
        <div className="relative" ref={headingRef}>
          <button
            type="button"
            onClick={() => setShowHeadingMenu(!showHeadingMenu)}
            className="p-1.5 text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9] rounded transition-colors flex items-center gap-1 cursor-pointer"
            title="Headings & Scene structure"
          >
            <span className="font-serif font-semibold text-xs text-[#221E18]">H</span>
            <ChevronDown size={11} className="text-[#7A705F]" />
          </button>

          {showHeadingMenu && (
            <div className="absolute top-full left-0 mt-1.5 w-48 bg-[#FAF6EE] rounded-lg border border-[#E5DEC9] shadow-warm-modal p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <button
                type="button"
                onClick={() => {
                  onApplyFormat('# ', '');
                  setShowHeadingMenu(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[#F1EAD9] text-left text-xs text-[#221E18] cursor-pointer"
              >
                <Heading1 size={14} className="text-[#B54B32]" />
                <div className="flex-1">
                  <div className="font-serif font-bold text-xs">Chapter / H1</div>
                  <div className="text-[10px] text-[#7A705F] font-mono"># Heading</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  onApplyFormat('## ', '');
                  setShowHeadingMenu(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[#F1EAD9] text-left text-xs text-[#221E18] cursor-pointer"
              >
                <Heading2 size={14} className="text-[#35505F]" />
                <div className="flex-1">
                  <div className="font-serif font-semibold text-xs">Section / H2</div>
                  <div className="text-[10px] text-[#7A705F] font-mono">## Subheading</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  onApplyFormat('### ', '');
                  setShowHeadingMenu(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[#F1EAD9] text-left text-xs text-[#221E18] cursor-pointer"
              >
                <Heading3 size={14} className="text-[#7A705F]" />
                <div className="flex-1">
                  <div className="font-serif text-xs">Beat / H3</div>
                  <div className="text-[10px] text-[#7A705F] font-mono">### Subsection</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Inline Formatting: Bold, Italic, Strikethrough */}
        <div className="flex items-center gap-0.5 px-1 border-r border-[#E5DEC9]">
          <button
            type="button"
            onClick={() => onApplyFormat('**', '**')}
            className="p-1.5 text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9] rounded transition-colors cursor-pointer font-bold"
            title="Bold (**text**) - Ctrl+B"
          >
            <Bold size={14} />
          </button>
          <button
            type="button"
            onClick={() => onApplyFormat('*', '*')}
            className="p-1.5 text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9] rounded transition-colors cursor-pointer italic"
            title="Italic (*text*) - Ctrl+I"
          >
            <Italic size={14} />
          </button>
          <button
            type="button"
            onClick={() => onApplyFormat('~~', '~~')}
            className="p-1.5 text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9] rounded transition-colors cursor-pointer"
            title="Strikethrough (~~text~~)"
          >
            <Strikethrough size={14} />
          </button>
        </div>

        {/* Highlighter Tool */}
        <div className="relative" ref={highlightRef}>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => onApplyHighlight('yellow')}
              className="p-1.5 text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9] rounded-l transition-colors cursor-pointer"
              title="Highlight selection (Ctrl+H)"
            >
              <Highlighter size={14} />
            </button>
            <button
              type="button"
              onClick={() => setShowHighlightMenu(!showHighlightMenu)}
              className="p-1 text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9] rounded-r border-l border-[#E5DEC9] transition-colors cursor-pointer"
              title="Choose highlight hue"
            >
              <ChevronDown size={10} />
            </button>
          </div>

          {showHighlightMenu && (
            <div className="absolute top-full left-0 mt-1.5 w-44 bg-[#FAF6EE] rounded-lg border border-[#E5DEC9] shadow-warm-modal p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <span className="text-[10px] font-sans font-semibold text-[#7A705F] uppercase tracking-[0.14em] block px-1 mb-1">
                Highlighter Hue
              </span>
              <div className="space-y-0.5">
                {highlightColors.map((color) => (
                  <button
                    key={color.key}
                    type="button"
                    onClick={() => {
                      onApplyHighlight(color.key);
                      setShowHighlightMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#F1EAD9] text-left text-xs cursor-pointer text-[#221E18]"
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${color.bg} border ${color.border} shrink-0`} />
                    <span className="text-[#221E18] text-xs">{color.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Blockquote & Lists */}
        <div className="flex items-center gap-0.5 px-1 border-r border-[#E5DEC9]">
          <button
            type="button"
            onClick={() => onApplyFormat('> ', '')}
            className="p-1.5 text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9] rounded transition-colors cursor-pointer"
            title="Blockquote (> quote)"
          >
            <Quote size={14} />
          </button>
          <button
            type="button"
            onClick={() => onApplyFormat('- ', '')}
            className="p-1.5 text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9] rounded transition-colors cursor-pointer"
            title="Bullet List (- item)"
          >
            <List size={14} />
          </button>
          <button
            type="button"
            onClick={() => onApplyFormat('1. ', '')}
            className="p-1.5 text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9] rounded transition-colors cursor-pointer"
            title="Numbered List (1. item)"
          >
            <ListOrdered size={14} />
          </button>
          <button
            type="button"
            onClick={onInsertSceneBreak}
            className="px-2 py-1 text-[11px] font-serif text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9] rounded tracking-widest cursor-pointer"
            title="Insert Scene Break (* * *)"
          >
            * * *
          </button>
        </div>

        {/* Typography & Readability settings */}
        <div className="relative px-1" ref={typeRef}>
          <button
            type="button"
            onClick={() => setShowTypeMenu(!showTypeMenu)}
            className="p-1.5 text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9] rounded transition-colors flex items-center gap-1 cursor-pointer"
            title="Typography & Text size options"
          >
            <Type size={14} />
            <span className="text-[11px] font-mono capitalize hidden sm:inline text-[#221E18]">{fontSize}</span>
          </button>

          {showTypeMenu && (
            <div className="absolute top-full left-0 mt-1.5 w-52 bg-[#FAF6EE] rounded-lg border border-[#E5DEC9] shadow-warm-modal p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <span className="text-[10px] font-sans font-semibold text-[#7A705F] uppercase tracking-[0.14em] block mb-1.5">
                Typeface
              </span>
              <div className="space-y-1 mb-3">
                <button
                  type="button"
                  onClick={() => onChangeFontFamily('serif')}
                  className={`w-full py-1.5 px-2 text-xs rounded text-left flex items-center justify-between font-serif ${
                    fontFamily === 'serif' ? 'bg-[#221E18] text-[#FAF6EE]' : 'bg-[#F1EAD9] text-[#221E18] hover:bg-[#EAE4D6]'
                  }`}
                >
                  <span>Fraunces (Editorial)</span>
                  <span className="text-[10px] opacity-70">Serif</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChangeFontFamily('sans')}
                  className={`w-full py-1.5 px-2 text-xs rounded text-left flex items-center justify-between font-sans ${
                    fontFamily === 'sans' ? 'bg-[#221E18] text-[#FAF6EE]' : 'bg-[#F1EAD9] text-[#221E18] hover:bg-[#EAE4D6]'
                  }`}
                >
                  <span>Inter (Clean UI)</span>
                  <span className="text-[10px] opacity-70">Sans</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChangeFontFamily('mono')}
                  className={`w-full py-1.5 px-2 text-xs rounded text-left flex items-center justify-between font-mono ${
                    fontFamily === 'mono' ? 'bg-[#221E18] text-[#FAF6EE]' : 'bg-[#F1EAD9] text-[#221E18] hover:bg-[#EAE4D6]'
                  }`}
                >
                  <span>Courier Prime</span>
                  <span className="text-[10px] opacity-70">Mono</span>
                </button>
              </div>

              <span className="text-[10px] font-sans font-semibold text-[#7A705F] uppercase tracking-[0.14em] block mb-1.5">
                Text Scale
              </span>
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => onChangeFontSize('compact')}
                  className={`py-1 text-xs rounded font-mono ${
                    fontSize === 'compact' ? 'bg-[#221E18] text-[#FAF6EE]' : 'bg-[#F1EAD9] text-[#221E18] hover:bg-[#EAE4D6]'
                  }`}
                >
                  Small
                </button>
                <button
                  type="button"
                  onClick={() => onChangeFontSize('normal')}
                  className={`py-1 text-xs rounded font-mono ${
                    fontSize === 'normal' ? 'bg-[#221E18] text-[#FAF6EE]' : 'bg-[#F1EAD9] text-[#221E18] hover:bg-[#EAE4D6]'
                  }`}
                >
                  Normal
                </button>
                <button
                  type="button"
                  onClick={() => onChangeFontSize('large')}
                  className={`py-1 text-xs rounded font-mono ${
                    fontSize === 'large' ? 'bg-[#221E18] text-[#FAF6EE]' : 'bg-[#F1EAD9] text-[#221E18] hover:bg-[#EAE4D6]'
                  }`}
                >
                  Large
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Surface Switcher (Live vs Syntax), Typewriter Mode, Session Timer, and Segmented View Switcher */}
      <div className="flex items-center gap-2">
        {/* LIVE PREVIEW VS SYNTAX SWITCHER */}
        {onChangeEditorSurface && viewMode !== 'preview' && (
          <div className="flex items-center bg-[#F1EAD9] p-0.5 rounded-lg border border-[#E5DEC9]">
            <button
              type="button"
              onClick={() => onChangeEditorSurface('rich')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                editorSurface === 'rich'
                  ? 'bg-[#FAF6EE] text-[#221E18] shadow-warm-sm font-semibold'
                  : 'text-[#7A705F] hover:text-[#221E18]'
              }`}
              title="Live Preview: Interactive inline markdown formatting"
            >
              <Sparkles size={12} className={editorSurface === 'rich' ? 'text-[#B54B32]' : ''} />
              <span className="hidden sm:inline">Live Preview</span>
              <span className="sm:hidden">Live</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeEditorSurface('raw')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                editorSurface === 'raw'
                  ? 'bg-[#FAF6EE] text-[#221E18] shadow-warm-sm font-semibold'
                  : 'text-[#7A705F] hover:text-[#221E18]'
              }`}
              title="Syntax: Raw Markdown text format"
            >
              <Code2 size={12} className={editorSurface === 'raw' ? 'text-[#35505F]' : ''} />
              <span className="hidden sm:inline">Syntax</span>
              <span className="sm:hidden">Syntax</span>
            </button>
          </div>
        )}

        {/* TYPEWRITER SCROLL MODE TOGGLE */}
        <button
          type="button"
          onClick={onToggleTypewriterMode}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-colors cursor-pointer border ${
            typewriterMode
              ? 'bg-[#221E18] text-[#FAF6EE] border-[#221E18] shadow-warm-sm'
              : 'bg-[#F1EAD9] text-[#7A705F] border-[#E5DEC9] hover:text-[#221E18] hover:bg-[#EAE4D6]'
          }`}
          title="Typewriter Scroll: Keep active editing line centered in viewport (Ctrl+Alt+T)"
        >
          <AlignVerticalJustifyCenter size={13} className={typewriterMode ? 'text-[#B54B32]' : ''} />
          <span className="hidden sm:inline">Typewriter</span>
        </button>

        {/* SESSION TIMER & SPRINT */}
        <SessionTimer currentWordCount={currentWordCount} />

        {/* SEGMENTED VIEW SWITCHER [ Write | Split | Preview ] */}
        <div className="flex items-center bg-[#F1EAD9] p-0.5 rounded-lg border border-[#E5DEC9]">
          <button
            type="button"
            onClick={() => onChangeViewMode('write')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
              viewMode === 'write'
                ? 'bg-[#FAF6EE] text-[#221E18] shadow-warm-sm font-semibold'
                : 'text-[#7A705F] hover:text-[#221E18]'
            }`}
            title="Manuscript editor mode"
          >
            <PenLine size={13} />
            <span>Write</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeViewMode('split')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
              viewMode === 'split'
                ? 'bg-[#FAF6EE] text-[#221E18] shadow-warm-sm font-semibold'
                : 'text-[#7A705F] hover:text-[#221E18]'
            }`}
            title="Side-by-side live editor and rendered markdown preview"
          >
            <Columns2 size={13} />
            <span>Split</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeViewMode('preview')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
              viewMode === 'preview'
                ? 'bg-[#FAF6EE] text-[#221E18] shadow-warm-sm font-semibold'
                : 'text-[#7A705F] hover:text-[#221E18]'
            }`}
            title="Live rendered markdown preview"
          >
            <BookOpen size={13} />
            <span>Preview</span>
          </button>
        </div>
      </div>
    </div>
  );
};
