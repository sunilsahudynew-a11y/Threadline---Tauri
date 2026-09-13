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
import { sanitizePastedContent } from '../../utils/pasteSanitizer';
import { SlashCommandMenu, SlashCommand, SlashMenuPosition } from './SlashCommandMenu';
import { FloatingSelectionToolbar } from './FloatingSelectionToolbar';
import {
  getCaretClientY,
  getSlashCharacterRect,
  calculateSlashMenuPosition
} from '../../utils/typewriterHelper';
import {
  EditorLineSpacing,
  EditorWordSpacing,
  EditorTextAlign,
  AVAILABLE_LINE_SPACINGS,
  AVAILABLE_WORD_SPACINGS
} from '../../services/theme/themeConfig';

export interface RichEditorHandle {
  applyFormat: (prefix: string, suffix?: string) => void;
  applyHighlight: (colorKey?: string) => void;
  insertSceneBreak: () => void;
  focus: () => void;
  flush: () => string;
}

/**
 * Converts a markdown slice to its approximate plain text length
 * so DOM text node offsets match the change position accurately.
 */
function markdownToPlainTextLength(md: string): number {
  return md
    .replace(/^#+\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^\s*>\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/==(?:[a-zA-Z0-9_-]+:)?(.*?)==/g, '$1')
    .replace(/^\*\s*\*\s*\*$/gm, '')
    .replace(/\r\n/g, '\n')
    .length;
}

/**
 * Accurately positions the selection caret at a specific character offset in the DOM tree
 * without jumping to the end of the document or causing visual layout glitches.
 */
function setCaretAtTextOffset(root: HTMLElement, targetOffset: number) {
  const sel = window.getSelection();
  if (!sel) return;

  let currentOffset = 0;
  let targetNode: Node | null = null;
  let nodeOffset = 0;
  let lastTextNode: Text | null = null;

  function walk(node: Node): boolean {
    if (node.nodeType === Node.TEXT_NODE) {
      lastTextNode = node as Text;
      const text = node.textContent || '';
      const len = text.length;
      if (currentOffset + len >= targetOffset) {
        targetNode = node;
        nodeOffset = Math.max(0, targetOffset - currentOffset);
        return true;
      }
      currentOffset += len;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (el.tagName === 'BR') {
        currentOffset += 1;
        if (currentOffset >= targetOffset) {
          targetNode = el.parentNode;
          nodeOffset = Array.prototype.indexOf.call(el.parentNode?.childNodes || [], el);
          return true;
        }
      } else {
        const isBlock = /^(P|DIV|H1|H2|H3|BLOCKQUOTE|LI|HR)$/i.test(el.tagName);
        for (let i = 0; i < el.childNodes.length; i++) {
          if (walk(el.childNodes[i])) return true;
        }
        if (isBlock) {
          currentOffset += 1;
          if (currentOffset >= targetOffset && !targetNode) {
            targetNode = el;
            nodeOffset = el.childNodes.length;
            return true;
          }
        }
      }
    }
    return false;
  }

  walk(root);

  try {
    const range = document.createRange();
    if (targetNode) {
      if (targetNode.nodeType === Node.TEXT_NODE) {
        const maxLen = (targetNode as Text).length || 0;
        range.setStart(targetNode, Math.min(nodeOffset, maxLen));
        range.collapse(true);
      } else {
        range.setStart(targetNode, Math.min(nodeOffset, targetNode.childNodes.length));
        range.collapse(true);
      }
    } else if (lastTextNode) {
      // If target offset exceeded, place caret cleanly at end of last text node
      // NEVER select entire document contents!
      range.setStart(lastTextNode, lastTextNode.length);
      range.collapse(true);
    } else {
      // Empty editor fallback: place in first child
      const targetChild = root.firstChild || root;
      range.setStart(targetChild, 0);
      range.collapse(true);
    }
    sel.removeAllRanges();
    sel.addRange(range);
  } catch {
    // Graceful fallback
  }
}

interface RichLiveEditorProps {
  initialMarkdown: string;
  sceneId: string;
  fontFamily: 'serif' | 'sans' | 'mono';
  fontSize: 'compact' | 'normal' | 'large';
  lineSpacing?: EditorLineSpacing;
  wordSpacing?: EditorWordSpacing;
  textAlign?: EditorTextAlign;
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
      lineSpacing = 'normal',
      wordSpacing = 'normal',
      textAlign = 'left',
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
    const lastSavedMarkdownRef = useRef<string | null>(null);
    const currentSceneIdRef = useRef<string | null>(null);
    const isComposingRef = useRef<boolean>(false);

    // Slash command popup state
    const [slashMenuOpen, setSlashMenuOpen] = useState(false);
    const [slashQuery, setSlashQuery] = useState('');
    const [slashMenuPos, setSlashMenuPos] = useState<SlashMenuPosition>({ top: 0, left: 0, openUpward: false });
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Floating selection toolbar state
    const [selectionText, setSelectionText] = useState('');
    const [selectionPos, setSelectionPos] = useState<{ top: number; left: number } | undefined>(undefined);

    // Synchronize HTML into editor on mount, when sceneId changes, or when external changes occur (Undo/Redo/AI)
    useEffect(() => {
      if (!editorRef.current) return;

      const isMount = lastSavedMarkdownRef.current === null;
      const isSceneChange = currentSceneIdRef.current !== sceneId;
      const isExternalChange = !isMount && !isSceneChange && initialMarkdown !== lastSavedMarkdownRef.current;

      if (isMount || isSceneChange || isExternalChange) {
        // Save current scroll position prior to HTML update to prevent scroll jump or layout glitch
        const container = scrollContainerRef?.current;
        const prevScrollTop = container ? container.scrollTop : 0;
        const prevScrollLeft = container ? container.scrollLeft : 0;
        const prevMd = lastSavedMarkdownRef.current || '';
        const newMd = initialMarkdown;

        editorRef.current.innerHTML = markdownToHtml(initialMarkdown);
        lastSavedMarkdownRef.current = initialMarkdown;
        currentSceneIdRef.current = sceneId;

        // Reposition caret and maintain view stability on external change (Undo/Redo/Paste/AI)
        if (isExternalChange) {
          let commonPrefix = 0;
          while (
            commonPrefix < prevMd.length &&
            commonPrefix < newMd.length &&
            prevMd[commonPrefix] === newMd[commonPrefix]
          ) {
            commonPrefix++;
          }

          // Compute raw markdown index where caret belongs:
          // If text shrank (Undo removed word), place caret at commonPrefix
          // If text grew (Redo restored word), place caret at end of restored word
          const targetMdIndex =
            newMd.length < prevMd.length
              ? commonPrefix
              : commonPrefix + (newMd.length - prevMd.length);

          const targetPlainOffset = markdownToPlainTextLength(newMd.slice(0, targetMdIndex));

          setCaretAtTextOffset(editorRef.current, targetPlainOffset);

          // Lock scroll container position immediately to eliminate UI glitch
          if (container) {
            container.scrollTop = prevScrollTop;
            container.scrollLeft = prevScrollLeft;
          }

          // Ensure editor keeps focus without triggering native scroll jumps
          editorRef.current.focus({ preventScroll: true });

          // Re-affirm scroll position after focus
          if (container) {
            container.scrollTop = prevScrollTop;
            container.scrollLeft = prevScrollLeft;
          }

          // Lock position across subsequent paint frame
          requestAnimationFrame(() => {
            if (container && Math.abs(container.scrollTop - prevScrollTop) > 1) {
              container.scrollTop = prevScrollTop;
              container.scrollLeft = prevScrollLeft;
            }
          });

          // Dismiss selection popups
          setSelectionText('');
          setSelectionPos(undefined);
        }
      }
    }, [initialMarkdown, sceneId, scrollContainerRef]);

    // Convert HTML to markdown and trigger parent update with previous markdown for history grouping
    const syncToMarkdown = useCallback(() => {
      if (!editorRef.current) return;
      const html = editorRef.current.innerHTML;
      const md = htmlToMarkdown(html);
      if (md !== lastSavedMarkdownRef.current) {
        const prev = lastSavedMarkdownRef.current ?? '';
        lastSavedMarkdownRef.current = md;
        onChangeMarkdown(md, prev);
      }
    }, [onChangeMarkdown]);

    // Imperative handle for parent formatting controls and instant content flush
    useImperativeHandle(ref, () => ({
      focus: () => {
        editorRef.current?.focus({ preventScroll: true });
      },
      flush: () => {
        if (!editorRef.current) return lastSavedMarkdownRef.current || '';
        const html = editorRef.current.innerHTML;
        const md = htmlToMarkdown(html);
        return md || lastSavedMarkdownRef.current || '';
      },
      applyFormat: (prefix: string, suffix = prefix) => {
        if (pushSnapshot) {
          pushSnapshot(lastSavedMarkdownRef.current ?? '');
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

    // Ref to store slash range so clicking the menu never loses the insertion target
    const slashRangeRef = useRef<{
      textNode: Node;
      slashIdx: number;
      queryLen: number;
    } | null>(null);

    // Execute slash command deterministically on DOM and sync markdown
    const executeSlashCommand = (cmdId: string) => {
      if (pushSnapshot) {
        pushSnapshot(lastSavedMarkdownRef.current);
      }

      const editor = editorRef.current;
      if (!editor) return;

      editor.focus();

      // Retrieve the slash location from ref or active selection
      let textNode: Node | null = null;
      let slashIdx = -1;
      let queryLen = slashQuery.length;

      if (slashRangeRef.current && editor.contains(slashRangeRef.current.textNode)) {
        textNode = slashRangeRef.current.textNode;
        slashIdx = slashRangeRef.current.slashIdx;
        queryLen = slashRangeRef.current.queryLen;
      } else {
        const sel = window.getSelection();
        if (sel && sel.anchorNode && editor.contains(sel.anchorNode)) {
          textNode = sel.anchorNode;
          const text = textNode.textContent || '';
          slashIdx = text.lastIndexOf('/', sel.anchorOffset - 1);
        }
      }

      if (!textNode || slashIdx === -1) {
        setSlashMenuOpen(false);
        return;
      }

      // Find enclosing block inside editor
      let currentBlock: HTMLElement | null = null;
      let curr: Node | null = textNode;
      while (curr && curr !== editor) {
        if (curr.nodeType === Node.ELEMENT_NODE) {
          const tag = (curr as HTMLElement).tagName.toLowerCase();
          if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'li', 'div'].includes(tag)) {
            currentBlock = curr as HTMLElement;
            break;
          }
        }
        curr = curr.parentNode;
      }

      // Remove the slash and query from the text
      const fullText = textNode.textContent || '';
      const textBefore = fullText.slice(0, slashIdx);
      const textAfter = fullText.slice(slashIdx + 1 + queryLen);
      textNode.textContent = textBefore + textAfter;

      // Determine remaining text in current block
      const remainingBlockText = currentBlock
        ? (currentBlock.textContent || '').trim()
        : (textBefore + textAfter).trim();

      const setCaretAtEnd = (el: Node) => {
        try {
          const range = document.createRange();
          range.selectNodeContents(el);
          range.collapse(false);
          const sel = window.getSelection();
          if (sel) {
            sel.removeAllRanges();
            sel.addRange(range);
          }
        } catch {}
      };

      const selectNode = (el: Node) => {
        try {
          const range = document.createRange();
          range.selectNodeContents(el);
          const sel = window.getSelection();
          if (sel) {
            sel.removeAllRanges();
            sel.addRange(range);
          }
        } catch {}
      };

      if (cmdId === 'h1' || cmdId === 'h2' || cmdId === 'h3') {
        const newEl = document.createElement(cmdId);
        if (remainingBlockText) {
          newEl.textContent = remainingBlockText;
        } else {
          newEl.innerHTML = '<br>';
        }
        if (currentBlock && currentBlock !== editor) {
          currentBlock.replaceWith(newEl);
        } else {
          editor.appendChild(newEl);
        }
        setCaretAtEnd(newEl);
      } else if (cmdId === 'quote') {
        const bq = document.createElement('blockquote');
        const p = document.createElement('p');
        if (remainingBlockText) {
          p.textContent = remainingBlockText;
        } else {
          p.innerHTML = '<br>';
        }
        bq.appendChild(p);
        if (currentBlock && currentBlock !== editor) {
          currentBlock.replaceWith(bq);
        } else {
          editor.appendChild(bq);
        }
        setCaretAtEnd(p);
      } else if (cmdId === 'bullet') {
        const ul = document.createElement('ul');
        const li = document.createElement('li');
        if (remainingBlockText) {
          li.textContent = remainingBlockText;
        } else {
          li.innerHTML = '<br>';
        }
        ul.appendChild(li);
        if (currentBlock && currentBlock !== editor) {
          currentBlock.replaceWith(ul);
        } else {
          editor.appendChild(ul);
        }
        setCaretAtEnd(li);
      } else if (cmdId === 'number') {
        const ol = document.createElement('ol');
        const li = document.createElement('li');
        if (remainingBlockText) {
          li.textContent = remainingBlockText;
        } else {
          li.innerHTML = '<br>';
        }
        ol.appendChild(li);
        if (currentBlock && currentBlock !== editor) {
          currentBlock.replaceWith(ol);
        } else {
          editor.appendChild(ol);
        }
        setCaretAtEnd(li);
      } else if (cmdId === 'divider') {
        const hr = document.createElement('hr');
        const nextP = document.createElement('p');
        nextP.innerHTML = '<br>';
        if (currentBlock && currentBlock !== editor) {
          currentBlock.replaceWith(hr);
          hr.after(nextP);
        } else {
          editor.appendChild(hr);
          editor.appendChild(nextP);
        }
        setCaretAtEnd(nextP);
      } else if (cmdId === 'bold') {
        const strong = document.createElement('strong');
        strong.textContent = 'bold text';
        const range = document.createRange();
        range.setStart(textNode, Math.min(slashIdx, (textNode.textContent || '').length));
        range.collapse(true);
        range.insertNode(strong);
        selectNode(strong);
      } else if (cmdId === 'italic') {
        const em = document.createElement('em');
        em.textContent = 'italic text';
        const range = document.createRange();
        range.setStart(textNode, Math.min(slashIdx, (textNode.textContent || '').length));
        range.collapse(true);
        range.insertNode(em);
        selectNode(em);
      } else if (cmdId === 'highlight') {
        const mark = document.createElement('mark');
        mark.className = 'hl-yellow';
        mark.textContent = 'highlighted text';
        const range = document.createRange();
        range.setStart(textNode, Math.min(slashIdx, (textNode.textContent || '').length));
        range.collapse(true);
        range.insertNode(mark);
        selectNode(mark);
      }

      slashRangeRef.current = null;
      setSlashMenuOpen(false);

      // Immediately sync markdown so the editor and parent are in sync
      syncToMarkdown();
    };

    // Slash command definitions
    const slashCommands: SlashCommand[] = [
      {
        id: 'h1',
        label: 'Heading 1',
        description: 'Major chapter or scene title',
        icon: <Heading1 size={15} />,
        keywords: ['h1', 'heading', 'chapter', 'title', 'hea', 'head'],
        action: () => executeSlashCommand('h1')
      },
      {
        id: 'h2',
        label: 'Heading 2',
        description: 'Section break or narrative sequence',
        icon: <Heading2 size={15} />,
        keywords: ['h2', 'heading', 'section', 'subtitle', 'hea', 'head'],
        action: () => executeSlashCommand('h2')
      },
      {
        id: 'h3',
        label: 'Heading 3',
        description: 'Small subsection or scene beat',
        icon: <Heading3 size={15} />,
        keywords: ['h3', 'heading', 'subsection', 'beat', 'hea', 'head'],
        action: () => executeSlashCommand('h3')
      },
      {
        id: 'quote',
        label: 'Blockquote',
        description: 'Passage, dialogue, or excerpt',
        icon: <Quote size={15} />,
        keywords: ['quote', 'blockquote', 'letter'],
        action: () => executeSlashCommand('quote')
      },
      {
        id: 'bullet',
        label: 'Bulleted List',
        description: 'Unordered list of clues or items',
        icon: <List size={15} />,
        keywords: ['bullet', 'list', 'item'],
        action: () => executeSlashCommand('bullet')
      },
      {
        id: 'number',
        label: 'Numbered List',
        description: 'Sequentially ordered list',
        icon: <ListOrdered size={15} />,
        keywords: ['number', 'ordered', 'list'],
        action: () => executeSlashCommand('number')
      },
      {
        id: 'divider',
        label: 'Scene Break',
        description: 'Ornamental scene separator (* * *)',
        icon: <Sparkles size={15} />,
        keywords: ['break', 'divider', 'separator', 'scene'],
        action: () => executeSlashCommand('divider')
      },
      {
        id: 'highlight',
        label: 'Highlight Text',
        description: 'Warm amber highlighter mark',
        icon: <Highlighter size={15} />,
        keywords: ['highlight', 'mark', 'amber', 'yellow'],
        action: () => executeSlashCommand('highlight')
      },
      {
        id: 'bold',
        label: 'Bold Text',
        description: 'Heavy emphasis (**text**)',
        icon: <Bold size={15} />,
        keywords: ['bold', 'strong', 'emphasis'],
        action: () => executeSlashCommand('bold')
      },
      {
        id: 'italic',
        label: 'Italic Text',
        description: 'Subtle emphasis (*text*)',
        icon: <Italic size={15} />,
        keywords: ['italic', 'emphasis', 'voice'],
        action: () => executeSlashCommand('italic')
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

        // Find slash character rect and record range reference
        const slashIdx = beforeCursor.lastIndexOf('/');
        if (slashIdx !== -1) {
          slashRangeRef.current = {
            textNode,
            slashIdx,
            queryLen: query.length
          };
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
            filteredSlashCommands[selectedIndex].action();
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
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        syncToMarkdown();
        return;
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        document.execCommand('insertText', false, '    ');
        syncToMarkdown();
        return;
      }
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

    // Capture browser native undo/redo (e.g. from browser Edit menu or OS shortcuts) to route to unified undo stack
    const handleBeforeInput = (e: React.FormEvent<HTMLDivElement>) => {
      const inputEvent = e.nativeEvent as InputEvent;
      if (inputEvent && inputEvent.inputType === 'historyUndo') {
        e.preventDefault();
        if (onUndo) onUndo();
      } else if (inputEvent && inputEvent.inputType === 'historyRedo') {
        e.preventDefault();
        if (onRedo) onRedo();
      }
    };

    // Handle paste events: strip foreign fonts, font sizes, colors, and layout styles
    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
      e.preventDefault();

      if (pushSnapshot) {
        pushSnapshot(lastSavedMarkdownRef.current ?? '');
      }

      const clipboardData = e.clipboardData;
      if (!clipboardData) return;

      const rawHtml = clipboardData.getData('text/html');
      const rawText = clipboardData.getData('text/plain');

      const { cleanHtml, isInline } = sanitizePastedContent(rawHtml, rawText);

      editorRef.current?.focus();

      let inserted = false;
      if (cleanHtml) {
        try {
          inserted = document.execCommand('insertHTML', false, cleanHtml);
        } catch {
          inserted = false;
        }
      }

      // Fallback if insertHTML was unsupported in current context
      if (!inserted) {
        if (isInline && rawText) {
          try {
            inserted = document.execCommand('insertText', false, rawText);
          } catch {
            inserted = false;
          }
        }

        if (!inserted && cleanHtml) {
          const sel = window.getSelection();
          if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            range.deleteContents();
            const temp = document.createElement('div');
            temp.innerHTML = cleanHtml;
            const frag = document.createDocumentFragment();
            let child: ChildNode | null;
            let lastNode: ChildNode | null = null;
            while ((child = temp.firstChild)) {
              lastNode = frag.appendChild(child);
            }
            range.insertNode(frag);
            if (lastNode) {
              range.setStartAfter(lastNode);
              range.collapse(true);
              sel.removeAllRanges();
              sel.addRange(range);
            }
          }
        }
      }

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

    // Listen to window beforeunload and unmount to guarantee zero data loss
    useEffect(() => {
      const handleBeforeUnload = () => {
        if (editorRef.current) {
          const html = editorRef.current.innerHTML;
          const md = htmlToMarkdown(html);
          if (lastSavedMarkdownRef.current !== null && md !== lastSavedMarkdownRef.current) {
            onChangeMarkdown(md, lastSavedMarkdownRef.current);
          }
        }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        // Flush any unsaved changes on component unmount
        if (editorRef.current) {
          const html = editorRef.current.innerHTML;
          const md = htmlToMarkdown(html);
          if (lastSavedMarkdownRef.current !== null && md !== lastSavedMarkdownRef.current) {
            // Guard against accidental blank overwriting on detached node
            if (md === '' && (lastSavedMarkdownRef.current || '').trim().length > 0 && document.activeElement !== editorRef.current) {
              return;
            }
            onChangeMarkdown(md, lastSavedMarkdownRef.current);
          }
        }
      };
    }, [onChangeMarkdown]);

    return (
      <div className="relative w-full">
        {/* Smooth Notion Slash Command Menu */}
        {slashMenuOpen && (
          <SlashCommandMenu
            query={slashQuery}
            selectedIndex={selectedIndex}
            position={slashMenuPos}
            onSelectCommand={(cmd) => {
              cmd.action();
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
        {(() => {
          const lineConfig = AVAILABLE_LINE_SPACINGS.find((l) => l.id === lineSpacing) || AVAILABLE_LINE_SPACINGS[1];
          const wordConfig = AVAILABLE_WORD_SPACINGS.find((w) => w.id === wordSpacing) || AVAILABLE_WORD_SPACINGS[0];

          return (
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onBeforeInput={handleBeforeInput}
              onInput={handleInput}
              onPaste={handlePaste}
              onKeyDown={handleKeyDown}
              onBlur={syncToMarkdown}
              onCompositionStart={() => {
                isComposingRef.current = true;
              }}
              onCompositionEnd={() => {
                isComposingRef.current = false;
                syncToMarkdown();
              }}
              data-align={textAlign}
              style={{
                lineHeight: lineConfig.cssValue,
                wordSpacing: wordConfig.cssValue,
                textAlign: textAlign === 'justify' ? 'justify' : 'left'
              }}
              className={`editor-rich-surface w-full min-w-0 max-w-full overflow-hidden bg-transparent focus:outline-none text-[#33312D] ${fontClass} ${sizeClass} ${
                textAlign === 'justify' ? 'text-justify' : 'text-left'
              }`}
              role="textbox"
              aria-multiline="true"
              aria-label="Scene prose editor"
            />
          );
        })()}
      </div>
    );
  }
);

RichLiveEditor.displayName = 'RichLiveEditor';
