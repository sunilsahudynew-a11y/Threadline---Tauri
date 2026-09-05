import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef
} from 'react';
import {
  Heading1,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Sparkles,
  Highlighter,
  Bold,
  Italic,
  Strikethrough
} from 'lucide-react';
import { markdownToHtml, htmlToMarkdown } from '../../utils/markdownConverter';
import { SlashCommandMenu, SlashCommand, SlashMenuPosition } from './SlashCommandMenu';
import { FloatingSelectionToolbar } from './FloatingSelectionToolbar';
import {
  getCaretClientY,
  getSlashCharacterRect,
  calculateSlashMenuPosition
} from '../../utils/typewriterHelper';

export interface RichEditorHandle {
  applyFormat: (prefix: string, suffix?: string) => void;
  applyHighlight: (colorKey?: string) => void;
  insertSceneBreak: () => void;
  focus: () => void;
}

interface RichLiveEditorProps {
  initialMarkdown: string;
  sceneId: string;
  fontFamily: 'serif' | 'sans' | 'mono';
  fontSize: 'compact' | 'normal' | 'large';
  typewriterMode?: boolean;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  onChangeMarkdown: (markdown: string, prevMarkdown?: string) => void;
  pushSnapshot?: (markdown: string) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onAddToStoryBible?: () => void;
  onCutToCuttingRoom?: () => void;
  onOpenComment?: () => void;
  onConsultAI?: () => void;
}

export const RichLiveEditor = forwardRef<RichEditorHandle, RichLiveEditorProps>(
  (
    {
      initialMarkdown,
      sceneId,
      fontFamily,
      fontSize,
      typewriterMode = false,
      scrollContainerRef,
      onChangeMarkdown,
      pushSnapshot,
      onUndo,
      onRedo,
      onAddToStoryBible,
      onCutToCuttingRoom,
      onOpenComment,
      onConsultAI
    },
    ref
  ) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const lastSavedMarkdownRef = useRef<string>(initialMarkdown);
    const isComposingRef = useRef<boolean>(false);

    // Slash command popup state
    const [slashMenuOpen, setSlashMenuOpen] = useState(false);
    const [slashQuery, setSlashQuery] = useState('');
    const [slashMenuPos, setSlashMenuPos] = useState<SlashMenuPosition>({ top: 0, left: 0, openUpward: false });
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Floating selection toolbar state
    const [selectionText, setSelectionText] = useState('');
    const [selectionPos, setSelectionPos] = useState<{ top: number; left: number } | undefined>(undefined);

    // Synchronize HTML into editor when sceneId changes or external changes occur (Undo/Redo)
    useEffect(() => {
      if (editorRef.current && initialMarkdown !== lastSavedMarkdownRef.current) {
        const isFocused = document.activeElement === editorRef.current;
        editorRef.current.innerHTML = markdownToHtml(initialMarkdown);
        lastSavedMarkdownRef.current = initialMarkdown;

        // If editor was focused during undo/redo, preserve focus and position caret cleanly at the end
        if (isFocused) {
          editorRef.current.focus();
          try {
            const range = document.createRange();
            range.selectNodeContents(editorRef.current);
            range.collapse(false);
            const sel = window.getSelection();
            if (sel) {
              sel.removeAllRanges();
              sel.addRange(range);
            }
          } catch (e) {}
        }
      }
    }, [initialMarkdown, sceneId]);

    // Convert HTML to markdown and trigger parent update with previous markdown for history grouping
    const syncToMarkdown = useCallback(() => {
      if (!editorRef.current) return;
      const html = editorRef.current.innerHTML;
      const md = htmlToMarkdown(html);
      if (md !== lastSavedMarkdownRef.current) {
        const prev = lastSavedMarkdownRef.current;
        lastSavedMarkdownRef.current = md;
        onChangeMarkdown(md, prev);
      }
    }, [onChangeMarkdown]);

    // Imperative handle for parent formatting controls
    useImperativeHandle(ref, () => ({
      focus: () => {
        editorRef.current?.focus();
      },
      applyFormat: (prefix: string, suffix = prefix) => {
        if (pushSnapshot) {
          pushSnapshot(lastSavedMarkdownRef.current);
        }
        editorRef.current?.focus();
        if (prefix === '**') {
          document.execCommand('bold', false);
        } else if (prefix === '*') {
          document.execCommand('italic', false);
        } else if (prefix === '~~') {
          document.execCommand('strikeThrough', false);
        } else if (prefix === '# ') {
          document.execCommand('formatBlock', false, '<h1>');
        } else if (prefix === '## ') {
          document.execCommand('formatBlock', false, '<h2>');
        } else if (prefix === '### ') {
          document.execCommand('formatBlock', false, '<h3>');
        } else if (prefix === '> ') {
          document.execCommand('formatBlock', false, '<blockquote>');
        } else if (prefix === '- ') {
          document.execCommand('insertUnorderedList', false);
        } else if (prefix === '1. ') {
          document.execCommand('insertOrderedList', false);
        }
        syncToMarkdown();
      },
      applyHighlight: (colorKey = 'yellow') => {
        if (pushSnapshot) {
          pushSnapshot(lastSavedMarkdownRef.current);
        }
        editorRef.current?.focus();
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

        const range = sel.getRangeAt(0);
        // Check if inside existing mark
        const parentMark = sel.anchorNode?.parentElement?.closest('mark');
        if (parentMark) {
          // Remove mark
          const text = parentMark.textContent || '';
          const textNode = document.createTextNode(text);
          parentMark.parentNode?.replaceChild(textNode, parentMark);
        } else {
          const mark = document.createElement('mark');
          mark.className = `hl-${colorKey}`;
          try {
            range.surroundContents(mark);
          } catch {
            const contents = range.extractContents();
            mark.appendChild(contents);
            range.insertNode(mark);
          }
        }
        syncToMarkdown();
      },
      insertSceneBreak: () => {
        if (pushSnapshot) {
          pushSnapshot(lastSavedMarkdownRef.current);
        }
        editorRef.current?.focus();
        document.execCommand('insertHorizontalRule', false);
        syncToMarkdown();
      }
    }));

    // Slash command definitions
    const slashCommands: SlashCommand[] = [
      {
        id: 'h1',
        label: 'Heading 1',
        description: 'Major chapter or scene title',
        icon: <Heading1 size={15} />,
        keywords: ['h1', 'heading', 'chapter', 'title', 'hea', 'head'],
        action: () => {
          document.execCommand('formatBlock', false, '<h1>');
          setSlashMenuOpen(false);
          syncToMarkdown();
        }
      },
      {
        id: 'h2',
        label: 'Heading 2',
        description: 'Section break or narrative sequence',
        icon: <Heading2 size={15} />,
        keywords: ['h2', 'heading', 'section', 'subtitle', 'hea', 'head'],
        action: () => {
          document.execCommand('formatBlock', false, '<h2>');
          setSlashMenuOpen(false);
          syncToMarkdown();
        }
      },
      {
        id: 'h3',
        label: 'Heading 3',
        description: 'Small subsection or scene beat',
        icon: <Heading3 size={15} />,
        keywords: ['h3', 'heading', 'subsection', 'beat', 'hea', 'head'],
        action: () => {
          document.execCommand('formatBlock', false, '<h3>');
          setSlashMenuOpen(false);
          syncToMarkdown();
        }
      },
      {
        id: 'quote',
        label: 'Blockquote',
        description: 'Passage, dialogue, or excerpt',
        icon: <Quote size={15} />,
        keywords: ['quote', 'blockquote', 'letter'],
        action: () => {
          document.execCommand('formatBlock', false, '<blockquote>');
          setSlashMenuOpen(false);
          syncToMarkdown();
        }
      },
      {
        id: 'bullet',
        label: 'Bulleted List',
        description: 'Unordered list of clues or items',
        icon: <List size={15} />,
        keywords: ['bullet', 'list', 'item'],
        action: () => {
          document.execCommand('insertUnorderedList', false);
          setSlashMenuOpen(false);
          syncToMarkdown();
        }
      },
      {
        id: 'number',
        label: 'Numbered List',
        description: 'Sequentially ordered list',
        icon: <ListOrdered size={15} />,
        keywords: ['number', 'ordered', 'list'],
        action: () => {
          document.execCommand('insertOrderedList', false);
          setSlashMenuOpen(false);
          syncToMarkdown();
        }
      },
      {
        id: 'divider',
        label: 'Scene Break',
        description: 'Ornamental scene separator (* * *)',
        icon: <Sparkles size={15} />,
        keywords: ['break', 'divider', 'separator', 'scene'],
        action: () => {
          document.execCommand('insertHorizontalRule', false);
          setSlashMenuOpen(false);
          syncToMarkdown();
        }
      },
      {
        id: 'highlight',
        label: 'Highlight Text',
        description: 'Warm amber highlighter mark',
        icon: <Highlighter size={15} />,
        keywords: ['highlight', 'mark', 'amber', 'yellow'],
        action: () => {
          const sel = window.getSelection();
          if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            const mark = document.createElement('mark');
            mark.className = 'hl-yellow';
            try {
              range.surroundContents(mark);
            } catch {
              const contents = range.extractContents();
              mark.appendChild(contents);
              range.insertNode(mark);
            }
          }
          setSlashMenuOpen(false);
          syncToMarkdown();
        }
      },
      {
        id: 'bold',
        label: 'Bold Text',
        description: 'Heavy emphasis (**text**)',
        icon: <Bold size={15} />,
        keywords: ['bold', 'strong', 'emphasis'],
        action: () => {
          document.execCommand('bold', false);
          setSlashMenuOpen(false);
          syncToMarkdown();
        }
      },
      {
        id: 'italic',
        label: 'Italic Text',
        description: 'Subtle emphasis (*text*)',
        icon: <Italic size={15} />,
        keywords: ['italic', 'emphasis', 'voice'],
        action: () => {
          document.execCommand('italic', false);
          setSlashMenuOpen(false);
          syncToMarkdown();
        }
      }
    ];

    // Filter slash commands
    const filteredSlashCommands = slashCommands.filter((cmd) => {
      if (!slashQuery) return true;
      const q = slashQuery.toLowerCase();
      return (
        cmd.label.toLowerCase().includes(q) ||
        cmd.description.toLowerCase().includes(q) ||
        cmd.keywords.some((k) => k.includes(q))
      );
    });

    // Remove the slash and search query from document before executing command
    const deleteSlashQuery = () => {
      const sel = window.getSelection();
      if (!sel || !sel.anchorNode) return;
      const textNode = sel.anchorNode;
      const text = textNode.textContent || '';
      const offset = sel.anchorOffset;
      const slashIdx = text.lastIndexOf('/', offset - 1);
      if (slashIdx !== -1) {
        const queryLen = slashQuery.length;
        textNode.textContent = text.slice(0, slashIdx) + text.slice(slashIdx + 1 + queryLen);
        try {
          const range = document.createRange();
          range.setStart(textNode, Math.min(slashIdx, (textNode.textContent || '').length));
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        } catch {}
      }
    };

    // Check if cursor is at /query and update the Notion slash menu position & filter query
    const updateSlashState = useCallback(() => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || !editorRef.current?.contains(sel.anchorNode)) {
        setSlashMenuOpen(false);
        return;
      }

      const textNode = sel.anchorNode;
      if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
        setSlashMenuOpen(false);
        return;
      }

      const text = textNode.textContent || '';
      const offset = sel.anchorOffset;
      const beforeCursor = text.slice(0, offset);

      // Match a slash followed by letters/numbers/underscores/dashes right before cursor
      const match = beforeCursor.match(/(?:^|\s)\/([a-zA-Z0-9_-]*)$/);
      if (match) {
        const query = match[1];
        setSlashQuery(query);

        // Find slash character rect
        const slashIdx = beforeCursor.lastIndexOf('/');
        if (slashIdx !== -1) {
          try {
            const charRange = document.createRange();
            charRange.setStart(textNode, slashIdx);
            charRange.setEnd(textNode, slashIdx + 1);
            const rect = charRange.getBoundingClientRect();
            if (rect && rect.top > 0 && (rect.width > 0 || rect.height > 0)) {
              const pos = calculateSlashMenuPosition(rect);
              setSlashMenuPos(pos);
              setSlashMenuOpen(true);
              return;
            }
          } catch {}
        }

        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect && rect.top > 0) {
          const pos = calculateSlashMenuPosition(rect);
          setSlashMenuPos(pos);
          setSlashMenuOpen(true);
          return;
        }
      } else {
        setSlashMenuOpen(false);
      }
    }, []);

    // Handle typing shortcuts and slash commands
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      // 0. Undo / Redo shortcuts inside rich editor
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        e.stopPropagation();
        if (onUndo) {
          onUndo();
        }
        return;
      }

      if (
        ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'z') ||
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y')
      ) {
        e.preventDefault();
        e.stopPropagation();
        if (onRedo) {
          onRedo();
        }
        return;
      }

      // 1. Slash command menu keyboard navigation
      if (slashMenuOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredSlashCommands.length));
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filteredSlashCommands.length) % Math.max(1, filteredSlashCommands.length));
          return;
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          if (filteredSlashCommands[selectedIndex]) {
            if (pushSnapshot) {
              pushSnapshot(lastSavedMarkdownRef.current);
            }
            // Delete the typed /query before applying command
            deleteSlashQuery();
            filteredSlashCommands[selectedIndex].action();
            setSlashMenuOpen(false);
            syncToMarkdown();
          }
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          setSlashMenuOpen(false);
          return;
        }
      }

      // 2. Keyboard shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        if (pushSnapshot) {
          pushSnapshot(lastSavedMarkdownRef.current);
        }
        document.execCommand('bold', false);
        syncToMarkdown();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        if (pushSnapshot) {
          pushSnapshot(lastSavedMarkdownRef.current);
        }
        document.execCommand('italic', false);
        syncToMarkdown();
        return;
      }

      // 3. Backspace key: check slash trigger update
      if (e.key === 'Backspace') {
        setTimeout(() => {
          updateSlashState();
        }, 10);
      }

      // 4. Enter key: Shift document on newline so caret stays stationary on screen
      if (e.key === 'Enter') {
        const prevCaretY = typewriterMode ? getCaretClientY() : null;
        setTimeout(() => {
          syncToMarkdown();
          if (typewriterMode && prevCaretY !== null) {
            const newCaretY = getCaretClientY();
            const container = scrollContainerRef.current;
            if (container && newCaretY !== null) {
              const deltaY = newCaretY - prevCaretY;
              if (Math.abs(deltaY) > 0.5) {
                container.scrollTop += deltaY;
              }
            }
          }
        }, 0);
        return;
      }

      // 5. Space key: check for instant markdown prefixes on the current line
      if (e.key === ' ') {
        const sel = window.getSelection();
        if (sel && sel.anchorNode) {
          const textNode = sel.anchorNode;
          const text = textNode.textContent || '';
          const offset = sel.anchorOffset;
          const currentPrefix = text.slice(0, offset).trim();

          if (currentPrefix === '#') {
            e.preventDefault();
            if (pushSnapshot) pushSnapshot(lastSavedMarkdownRef.current);
            textNode.textContent = text.slice(offset);
            document.execCommand('formatBlock', false, '<h1>');
            syncToMarkdown();
            return;
          }
          if (currentPrefix === '##') {
            e.preventDefault();
            if (pushSnapshot) pushSnapshot(lastSavedMarkdownRef.current);
            textNode.textContent = text.slice(offset);
            document.execCommand('formatBlock', false, '<h2>');
            syncToMarkdown();
            return;
          }
          if (currentPrefix === '###') {
            e.preventDefault();
            if (pushSnapshot) pushSnapshot(lastSavedMarkdownRef.current);
            textNode.textContent = text.slice(offset);
            document.execCommand('formatBlock', false, '<h3>');
            syncToMarkdown();
            return;
          }
          if (currentPrefix === '>') {
            e.preventDefault();
            if (pushSnapshot) pushSnapshot(lastSavedMarkdownRef.current);
            textNode.textContent = text.slice(offset);
            document.execCommand('formatBlock', false, '<blockquote>');
            syncToMarkdown();
            return;
          }
          if (currentPrefix === '-' || currentPrefix === '*') {
            e.preventDefault();
            if (pushSnapshot) pushSnapshot(lastSavedMarkdownRef.current);
            textNode.textContent = text.slice(offset);
            document.execCommand('insertUnorderedList', false);
            syncToMarkdown();
            return;
          }
          if (currentPrefix === '1.') {
            e.preventDefault();
            if (pushSnapshot) pushSnapshot(lastSavedMarkdownRef.current);
            textNode.textContent = text.slice(offset);
            document.execCommand('insertOrderedList', false);
            syncToMarkdown();
            return;
          }
        }
      }
    };

    // Recompute slash menu position on container scroll or window resize so it stays anchored to '/'
    useEffect(() => {
      if (!slashMenuOpen) return;
      const container = scrollContainerRef.current;
      if (!container) return;

      const handleScrollOrResize = () => {
        updateSlashState();
      };
      container.addEventListener('scroll', handleScrollOrResize, { passive: true });
      window.addEventListener('resize', handleScrollOrResize);
      return () => {
        container.removeEventListener('scroll', handleScrollOrResize);
        window.removeEventListener('resize', handleScrollOrResize);
      };
    }, [slashMenuOpen, scrollContainerRef, updateSlashState]);

    // Handle input event
    const handleInput = () => {
      if (isComposingRef.current) return;
      syncToMarkdown();
      updateSlashState();
    };

    // Handle text selection for floating toolbar
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !editorRef.current?.contains(sel.anchorNode)) {
        setSelectionText('');
        setSelectionPos(undefined);
        return;
      }

      const text = sel.toString().trim();
      if (!text) {
        setSelectionText('');
        setSelectionPos(undefined);
        return;
      }

      setSelectionText(text);

      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (rect && rect.top > 0) {
        const top = Math.max(10, rect.top - 46);
        const left = Math.max(16, Math.min(rect.left + rect.width / 2 - 180, window.innerWidth - 380));
        setSelectionPos({ top, left });
      }
    };

    // Listen to document selection changes
    useEffect(() => {
      document.addEventListener('selectionchange', handleSelectionChange);
      return () => document.removeEventListener('selectionchange', handleSelectionChange);
    }, []);

    // Font styling classes
    const fontClass =
      fontFamily === 'sans'
        ? 'font-sans'
        : fontFamily === 'mono'
        ? 'font-mono'
        : 'font-serif';

    const sizeClass =
      fontSize === 'large'
        ? 'text-xl leading-[1.95]'
        : fontSize === 'compact'
        ? 'text-base leading-[1.75]'
        : 'text-lg leading-[1.85]';

    return (
      <div className="relative w-full">
        {/* Smooth Notion Slash Command Menu */}
        {slashMenuOpen && (
          <SlashCommandMenu
            query={slashQuery}
            selectedIndex={selectedIndex}
            position={slashMenuPos}
            onSelectCommand={(cmd) => {
              if (pushSnapshot) {
                pushSnapshot(lastSavedMarkdownRef.current);
              }
              deleteSlashQuery();
              cmd.action();
              setSlashMenuOpen(false);
              syncToMarkdown();
            }}
            onClose={() => setSlashMenuOpen(false)}
            commands={filteredSlashCommands}
          />
        )}

        {/* Floating Selection Toolbar for inline formatting & story actions */}
        {selectionText && selectionPos && (
          <FloatingSelectionToolbar
            selectedText={selectionText}
            position={selectionPos}
            onApplyFormat={(prefix, suffix) => {
              if (pushSnapshot) {
                pushSnapshot(lastSavedMarkdownRef.current);
              }
              if (prefix === '**') document.execCommand('bold', false);
              else if (prefix === '*') document.execCommand('italic', false);
              else if (prefix === '~~') document.execCommand('strikeThrough', false);
              syncToMarkdown();
            }}
            onApplyHighlight={(colorKey = 'yellow') => {
              if (pushSnapshot) {
                pushSnapshot(lastSavedMarkdownRef.current);
              }
              const sel = window.getSelection();
              if (sel && sel.rangeCount > 0) {
                const range = sel.getRangeAt(0);
                const mark = document.createElement('mark');
                mark.className = `hl-${colorKey}`;
                try {
                  range.surroundContents(mark);
                } catch {
                  const contents = range.extractContents();
                  mark.appendChild(contents);
                  range.insertNode(mark);
                }
                syncToMarkdown();
              }
            }}
            onAddToStoryBible={() => onAddToStoryBible && onAddToStoryBible()}
            onCutToCuttingRoom={() => {
              if (pushSnapshot) {
                pushSnapshot(lastSavedMarkdownRef.current);
              }
              onCutToCuttingRoom && onCutToCuttingRoom();
            }}
            onOpenComment={() => onOpenComment && onOpenComment()}
            onConsultAI={() => onConsultAI && onConsultAI()}
            onDismiss={() => {
              setSelectionText('');
              setSelectionPos(undefined);
            }}
          />
        )}

        {/* The Live Formatted Markdown ContentEditable Surface */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          className={`editor-rich-surface w-full bg-transparent focus:outline-none text-[#33312D] ${fontClass} ${sizeClass}`}
          role="textbox"
          aria-multiline="true"
          aria-label="Scene prose editor"
        />
      </div>
    );
  }
);

RichLiveEditor.displayName = 'RichLiveEditor';
