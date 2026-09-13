import React, { useLayoutEffect, useRef, useCallback, useState } from 'react';
import { Scene } from '../../types';
import { X, Sparkles, Code2, PenLine } from 'lucide-react';
import { MarkdownPreview } from './MarkdownPreview';
import { EditorViewMode, EditorFontFamily, EditorFontSize } from './EditorFormatBar';
import { SlashCommandMenu } from './SlashCommandMenu';
import { RichLiveEditor, RichEditorHandle } from './RichLiveEditor';
import { useNotionMarkdown } from '../../hooks/useNotionMarkdown';
import { getTextareaCaretScreenY } from '../../utils/typewriterHelper';
import {
  EditorLineSpacing,
  EditorWordSpacing,
  EditorTextAlign,
  EditorPageWidth,
  AVAILABLE_LINE_SPACINGS,
  AVAILABLE_WORD_SPACINGS
} from '../../services/theme/themeConfig';

export interface ManuscriptCanvasProps {
  scene: Scene;
  focusMode: boolean;
  viewMode: EditorViewMode;
  fontFamily: EditorFontFamily;
  fontSize: EditorFontSize;
  lineSpacing?: EditorLineSpacing;
  wordSpacing?: EditorWordSpacing;
  textAlign?: EditorTextAlign;
  pageWidth?: EditorPageWidth;
  typewriterMode?: boolean;
  editorSurface?: 'rich' | 'raw';
  onChangeEditorSurface?: (surface: 'rich' | 'raw') => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  richEditorRef?: React.RefObject<RichEditorHandle | null>;
  showCommentInput: boolean;
  newCommentText: string;
  pushSnapshot?: (prose: string) => void;
  recordTypingChange?: (newContent: string, prevContent: string) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onUpdateScene: (updatedFields: Partial<Scene>) => void;
  onProseChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSelect: (e: React.SyntheticEvent<HTMLTextAreaElement>) => void;
  onCloseComment: () => void;
  onChangeNewComment: (text: string) => void;
  onSaveComment: () => void;
  onResolveComment: (commentId: string) => void;
  onAddToStoryBible?: () => void;
  onCutToCuttingRoom?: () => void;
  onConsultAI?: () => void;
}

export const ManuscriptCanvas: React.FC<ManuscriptCanvasProps> = ({
  scene,
  focusMode,
  viewMode,
  fontFamily,
  fontSize,
  lineSpacing = 'normal',
  wordSpacing = 'normal',
  textAlign = 'left',
  pageWidth = 'standard',
  typewriterMode = false,
  editorSurface: externalEditorSurface,
  onChangeEditorSurface: externalOnChangeEditorSurface,
  textareaRef,
  richEditorRef,
  showCommentInput,
  newCommentText,
  pushSnapshot,
  recordTypingChange,
  onUndo,
  onRedo,
  onUpdateScene,
  onProseChange,
  onKeyDown,
  onSelect,
  onCloseComment,
  onChangeNewComment,
  onSaveComment,
  onResolveComment,
  onAddToStoryBible,
  onCutToCuttingRoom,
  onConsultAI
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Surface mode: 'rich' renders live Markdown formatting directly in the editor!
  // 'raw' renders the raw markdown syntax in a plain textarea.
  const [internalEditorSurface, setInternalEditorSurface] = useState<'rich' | 'raw'>('rich');
  const editorSurface = externalEditorSurface ?? internalEditorSurface;
  const setEditorSurface = externalOnChangeEditorSurface ?? setInternalEditorSurface;

  // Notion-style on-the-go markdown engine for raw mode
  const {
    slashMenuOpen: rawSlashOpen,
    slashQuery: rawSlashQuery,
    selectedIndex: rawSelectedIndex,
    menuPosition: rawMenuPosition,
    filteredCommands: rawFilteredCommands,
    closeSlashMenu: closeRawSlashMenu,
    selectCommand: selectRawCommand,
    handleNotionKeyDown: handleRawNotionKeyDown,
    handleProseInput: handleRawProseInput
  } = useNotionMarkdown({
    textareaRef,
    proseContent: scene.proseContent,
    onUpdateProse: (newProse) => onUpdateScene({ proseContent: newProse }),
    pushSnapshot: pushSnapshot || (() => {})
  });

  // Auto-resize raw textarea to fit content
  useLayoutEffect(() => {
    if (editorSurface === 'raw') {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = 'auto';
        const nextHeight = Math.max(520, textarea.scrollHeight);
        textarea.style.height = `${nextHeight}px`;
      }
    }
  }, [scene.proseContent, fontSize, fontFamily, viewMode, textareaRef, editorSurface]);

  // Raw mode caret position tracking for typewriter newline shift
  const rawCaretBeforeEnterRef = useRef<number | null>(null);

  const applyTypewriterShift = useCallback(() => {
    if (!typewriterMode || rawCaretBeforeEnterRef.current === null) return;
    const prevY = rawCaretBeforeEnterRef.current;
    rawCaretBeforeEnterRef.current = null;
    requestAnimationFrame(() => {
      const newY = getTextareaCaretScreenY(textareaRef.current);
      const container = scrollContainerRef.current;
      if (container && newY !== null) {
        const delta = newY - prevY;
        if (Math.abs(delta) > 0.5) {
          container.scrollTop += delta;
        }
      }
    });
  }, [typewriterMode, textareaRef]);

  // Typography font class
  const fontClass =
    fontFamily === 'sans'
      ? 'font-sans'
      : fontFamily === 'mono'
      ? 'font-mono'
      : 'font-serif';

  // Typography size class
  const sizeClass =
    fontSize === 'large'
      ? 'text-xl leading-[1.95]'
      : fontSize === 'compact'
      ? 'text-base leading-[1.75]'
      : 'text-lg leading-[1.85]';

  const lineConfig = AVAILABLE_LINE_SPACINGS.find((l) => l.id === lineSpacing) || AVAILABLE_LINE_SPACINGS[1];
  const wordConfig = AVAILABLE_WORD_SPACINGS.find((w) => w.id === wordSpacing) || AVAILABLE_WORD_SPACINGS[0];

  return (
    <div className={`flex-1 min-h-0 min-w-0 h-full max-h-full flex ${viewMode === 'split' ? 'flex-col md:flex-row' : ''} overflow-hidden bg-[#FAF6EE] relative`}>
      {/* TYPEWRITER MODE BADGE (No horizontal line - smooth document shift on newline) */}
      {typewriterMode && viewMode !== 'preview' && (
        <div className="absolute top-3 right-4 sm:right-6 z-20 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 bg-[#F1EAD9] rounded-[4px] border border-[rgba(34,30,24,0.10)] text-[11px] font-mono text-[#221E18] select-none animate-in fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B54B32] animate-pulse" />
          <span>Typewriter Mode</span>
        </div>
      )}

      {/* FULL PREVIEW SURFACE (When in 'preview' mode) */}
      {viewMode === 'preview' && (
        <div className="flex-1 min-h-0 min-w-0 h-full flex flex-col bg-[#FAF6EE] animate-in fade-in duration-150 overflow-x-hidden">
          <MarkdownPreview
            title={scene.title}
            content={scene.proseContent}
            fontSize={fontSize}
            fontFamily={fontFamily}
            lineSpacing={lineSpacing}
            wordSpacing={wordSpacing}
            textAlign={textAlign}
            sceneOrder={scene.order}
            wordCount={scene.wordCount}
            isFullPreview={true}
          />
        </div>
      )}

      {/* WRITING SURFACE (Visible in 'write' and 'split' modes, kept mounted but hidden in 'preview' to preserve editor state/DOM) */}
      <div
        ref={scrollContainerRef}
        className={`${
          viewMode === 'preview' ? 'hidden' : 'flex-1'
        } min-h-0 min-w-0 h-full overflow-y-auto overflow-x-hidden overscroll-contain scrollbar-subtle px-3.5 sm:px-6 md:px-12 flex justify-center selection:bg-[#F1EAD9] selection:text-[#221E18] relative ${
          typewriterMode ? 'pt-6 sm:pt-8 pb-[70vh]' : 'pt-6 sm:pt-8 pb-36 sm:pb-48'
        } ${viewMode === 'split' ? 'border-b md:border-b-0 md:border-r border-[rgba(34,30,24,0.10)]' : ''}`}
      >
        <div
          style={{
            width: '100%',
            maxWidth: viewMode === 'split' ? '600px' : 'var(--editor-page-width, 720px)'
          }}
          className="manuscript-page-sheet min-w-0 mx-auto"
        >
          {/* Quick Comment Input Modal */}
          {showCommentInput && (
            <div className="mb-4 p-3 bg-[#FAF6EE] rounded-[6px] border border-[rgba(34,30,24,0.10)] shadow-warm-modal flex items-center gap-2 animate-in fade-in">
              <input
                type="text"
                autoFocus
                value={newCommentText}
                onChange={(e) => onChangeNewComment(e.target.value)}
                placeholder="Enter private manuscript comment..."
                className="input-standard flex-1"
                onKeyDown={(e) => e.key === 'Enter' && onSaveComment()}
              />
              <button
                type="button"
                onClick={onSaveComment}
                className="btn-primary min-h-[40px] px-4"
              >
                Save
              </button>
              <button
                type="button"
                onClick={onCloseComment}
                className="text-[#7A705F] hover:text-[#221E18] p-2 cursor-pointer transition-colors"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>
          )}

          {/* SCENE TITLE HEADER */}
          <div className="pt-8 sm:pt-12 mb-8 text-center">
            <input
              type="text"
              value={scene.title}
              onChange={(e) => onUpdateScene({ title: e.target.value })}
              className="w-full text-center font-serif font-semibold text-[28px] sm:text-[32px] md:text-[36px] leading-[1.15] tracking-[-0.01em] text-[#221E18] bg-transparent border-0 focus:outline-none placeholder-[#7A705F]/50"
              placeholder="Scene Title..."
            />
          </div>

          {/* WRITING SURFACE */}
          {editorSurface === 'rich' ? (
            /* RICH LIVE MARKDOWN EDITOR */
            <RichLiveEditor
              ref={richEditorRef}
              sceneId={scene.id}
              initialMarkdown={scene.proseContent}
              fontFamily={fontFamily}
              fontSize={fontSize}
              lineSpacing={lineSpacing}
              wordSpacing={wordSpacing}
              textAlign={textAlign}
              typewriterMode={typewriterMode}
              scrollContainerRef={scrollContainerRef}
              onChangeMarkdown={(md, prevMd) => {
                if (recordTypingChange) {
                  recordTypingChange(md, prevMd || scene.proseContent);
                }
                const words = md.trim() ? md.trim().split(/\s+/).length : 0;
                onUpdateScene({ proseContent: md, wordCount: words });
              }}
              pushSnapshot={pushSnapshot}
              onUndo={onUndo}
              onRedo={onRedo}
              onAddToStoryBible={onAddToStoryBible}
              onCutToCuttingRoom={onCutToCuttingRoom}
              onOpenComment={() => showCommentInput || onChangeNewComment('')}
              onConsultAI={onConsultAI}
            />
          ) : (
            /* RAW SYNTAX TEXTAREA */
            <div className="relative">
              {rawSlashOpen && (
                <SlashCommandMenu
                  query={rawSlashQuery}
                  selectedIndex={rawSelectedIndex}
                  position={rawMenuPosition}
                  onSelectCommand={selectRawCommand}
                  onClose={closeRawSlashMenu}
                  commands={rawFilteredCommands}
                />
              )}

              <textarea
                ref={textareaRef}
                value={scene.proseContent}
                onChange={(e) => {
                  handleRawProseInput(e.target.value);
                  onProseChange(e);
                  applyTypewriterShift();
                }}
                onPaste={(e) => {
                  const clipboardData = e.clipboardData;
                  if (!clipboardData) return;
                  const pasted = clipboardData.getData('text/plain');
                  if (pasted && (pasted.includes('    ') || pasted.includes('\t') || pasted.includes('```'))) {
                    e.preventDefault();
                    // Strip leading 4 spaces or tabs from each line and strip code fences from Courier manuscripts
                    const cleaned = pasted
                      .replace(/^```[a-zA-Z0-9_-]*\r?\n([\s\S]*?)\r?\n```$/gm, '$1')
                      .split('\n')
                      .map((line) => line.replace(/^[ \t]{1,8}/, ''))
                      .join('\n');

                    const target = e.currentTarget;
                    const start = target.selectionStart;
                    const end = target.selectionEnd;
                    const val = target.value;
                    const newVal = val.substring(0, start) + cleaned + val.substring(end);
                    pushSnapshot(val);
                    handleRawProseInput(newVal);
                    onUpdateScene({ proseContent: newVal, wordCount: newVal.trim() ? newVal.trim().split(/\s+/).length : 0 });
                    setTimeout(() => {
                      if (textareaRef.current) {
                        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + cleaned.length;
                      }
                    }, 0);
                  }
                }}
                onKeyDown={(e) => {
                  // Catch Undo / Redo inside raw textarea to prevent browser's 1-character native undo
                  if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
                    e.preventDefault();
                    e.stopPropagation();
                    if (onUndo) onUndo();
                    return;
                  }
                  if (
                    ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'z') ||
                    ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y')
                  ) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (onRedo) onRedo();
                    return;
                  }

                  if (typewriterMode && e.key === 'Enter') {
                    rawCaretBeforeEnterRef.current = getTextareaCaretScreenY(textareaRef.current);
                  }
                  const handled = handleRawNotionKeyDown(e);
                  if (handled) {
                    applyTypewriterShift();
                    return;
                  }
                  if (onKeyDown) onKeyDown(e);
                }}
                onKeyUp={(e) => {
                  if (e.key === 'Enter') {
                    applyTypewriterShift();
                  }
                }}
                onSelect={(e) => {
                  onSelect(e);
                }}
                placeholder="Draft your scene here. Type '/' for Notion commands, '# ' for headings, '> ' for quotes, or '- ' for lists..."
                style={{
                  lineHeight: lineConfig.cssValue,
                  wordSpacing: wordConfig.cssValue,
                  textAlign: textAlign === 'justify' ? 'justify' : 'left'
                }}
                className={`w-full min-w-0 max-w-full bg-transparent border-0 focus:outline-none resize-none overflow-hidden text-[#221E18] placeholder-[#7A705F]/50 transition-all duration-100 ${fontClass} ${sizeClass} ${
                  textAlign === 'justify' ? 'text-justify' : 'text-left'
                }`}
              />
            </div>
          )}

          {/* NOTION HINT BADGE (Subtle, distraction-free) */}
          {!focusMode && (
            <div className="mt-8 flex items-center justify-between text-[11px] font-mono text-[#7A705F] select-none pt-2 border-t border-[rgba(34,30,24,0.10)]">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#B54B32]" />
                Type <code className="text-[#221E18] bg-[#F1EAD9] px-1 py-0.5 rounded-[4px] font-mono border border-[rgba(34,30,24,0.10)]">/</code> for command palette, <code className="text-[#221E18] bg-[#F1EAD9] px-1 py-0.5 rounded-[4px] font-mono border border-[rgba(34,30,24,0.10)]">#</code> for headings, <code className="text-[#221E18] bg-[#F1EAD9] px-1 py-0.5 rounded-[4px] font-mono border border-[rgba(34,30,24,0.10)]">&gt;</code> for quotes
              </span>
              <span>
                {scene.wordCount} words
              </span>
            </div>
          )}

          {/* SCENE COMMENTS LIST (Anchored in document) */}
          {scene.comments && scene.comments.length > 0 && (
            <div className="mt-10 pt-6 border-t border-[rgba(34,30,24,0.10)]">
              <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.16em] text-[#7A705F] mb-3 block select-none">
                Manuscript Notes &amp; Comments ({scene.comments.length})
              </span>
              <div className="space-y-2">
                {scene.comments.map((cmt) => (
                  <div
                    key={cmt.id}
                    className="p-3 bg-[#FAF6EE] rounded-[6px] border border-[rgba(34,30,24,0.10)] text-xs"
                  >
                    <div className="flex items-center justify-between mb-1 text-[11px]">
                      <span className="font-serif italic text-[#221E18] font-medium">
                        "{cmt.selection}"
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[#7A705F] text-[10px] font-mono">{cmt.timestamp}</span>
                        <button
                          type="button"
                          onClick={() => onResolveComment(cmt.id)}
                          className="text-[#7A705F] hover:text-[#B54B32] cursor-pointer"
                          title="Resolve comment"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                    <p className="text-[#221E18]">{cmt.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* LIVE MARKDOWN PREVIEW COLUMN (Visible in 'split' mode) */}
      {viewMode === 'split' && (
        <div className="flex-1 min-h-0 h-full flex flex-col bg-[#FAF9F5] border-t md:border-t-0 md:border-l border-[#E5DEC9] animate-in fade-in duration-200 min-h-[250px]">
          <MarkdownPreview
            title={scene.title}
            content={scene.proseContent}
            fontSize={fontSize}
            fontFamily={fontFamily}
            lineSpacing={lineSpacing}
            wordSpacing={wordSpacing}
            textAlign={textAlign}
            sceneOrder={scene.order}
            wordCount={scene.wordCount}
            isFullPreview={false}
          />
        </div>
      )}
    </div>
  );
};
