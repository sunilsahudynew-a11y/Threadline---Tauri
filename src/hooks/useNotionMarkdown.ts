import React, { useState, useCallback, useMemo } from 'react';
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
  Strikethrough,
  Type
} from 'lucide-react';
import { SlashCommand, SlashMenuPosition } from '../components/editor/SlashCommandMenu';
import { getCaretCoordinates } from '../utils/caretCoordinates';
import { calculateSlashMenuPosition } from '../utils/typewriterHelper';

interface UseNotionMarkdownOptions {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  proseContent: string;
  onUpdateProse: (newProse: string) => void;
  pushSnapshot: (prose: string) => void;
}

export function useNotionMarkdown({
  textareaRef,
  proseContent,
  onUpdateProse,
  pushSnapshot
}: UseNotionMarkdownOptions) {
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [slashIndex, setSlashIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [menuPosition, setMenuPosition] = useState<SlashMenuPosition>({ top: 40, left: 24, openUpward: false });

  // Helper to replace text at specific range and reposition cursor
  const replaceRange = useCallback(
    (start: number, end: number, replacement: string, cursorOffset?: number) => {
      pushSnapshot(proseContent);
      const nextProse = proseContent.slice(0, start) + replacement + proseContent.slice(end);
      onUpdateProse(nextProse);

      const targetPos = cursorOffset !== undefined ? start + cursorOffset : start + replacement.length;
      setTimeout(() => {
        const textarea = textareaRef.current;
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(targetPos, targetPos);
        }
      }, 0);
    },
    [proseContent, onUpdateProse, pushSnapshot, textareaRef]
  );

  // Available Notion-style commands
  const allCommands: SlashCommand[] = useMemo(
    () => [
      {
        id: 'h1',
        label: 'Heading 1',
        description: 'Major chapter or scene title',
        icon: React.createElement(Heading1, { size: 16 }),
        keywords: ['h1', 'heading', 'chapter', 'title', 'hea', 'head'],
        action: () => {
          if (slashIndex === null) return;
          const textarea = textareaRef.current;
          const end = textarea ? textarea.selectionEnd : slashIndex + 1 + slashQuery.length;
          const lineStart = proseContent.lastIndexOf('\n', slashIndex - 1) + 1;
          const before = proseContent.slice(lineStart, slashIndex);
          if (before.trim() === '') {
            replaceRange(lineStart, end, '# ', 2);
          } else {
            replaceRange(slashIndex, end, '\n# ', 3);
          }
          setSlashMenuOpen(false);
        }
      },
      {
        id: 'h2',
        label: 'Heading 2',
        description: 'Section break or narrative sequence',
        icon: React.createElement(Heading2, { size: 16 }),
        keywords: ['h2', 'heading', 'section', 'subtitle', 'hea', 'head'],
        action: () => {
          if (slashIndex === null) return;
          const textarea = textareaRef.current;
          const end = textarea ? textarea.selectionEnd : slashIndex + 1 + slashQuery.length;
          const lineStart = proseContent.lastIndexOf('\n', slashIndex - 1) + 1;
          const before = proseContent.slice(lineStart, slashIndex);
          if (before.trim() === '') {
            replaceRange(lineStart, end, '## ', 3);
          } else {
            replaceRange(slashIndex, end, '\n## ', 4);
          }
          setSlashMenuOpen(false);
        }
      },
      {
        id: 'h3',
        label: 'Heading 3',
        description: 'Small subsection or scene beat',
        icon: React.createElement(Heading3, { size: 16 }),
        keywords: ['h3', 'heading', 'subsection', 'beat', 'hea', 'head'],
        action: () => {
          if (slashIndex === null) return;
          const textarea = textareaRef.current;
          const end = textarea ? textarea.selectionEnd : slashIndex + 1 + slashQuery.length;
          const lineStart = proseContent.lastIndexOf('\n', slashIndex - 1) + 1;
          const before = proseContent.slice(lineStart, slashIndex);
          if (before.trim() === '') {
            replaceRange(lineStart, end, '### ', 4);
          } else {
            replaceRange(slashIndex, end, '\n### ', 5);
          }
          setSlashMenuOpen(false);
        }
      },
      {
        id: 'bullet',
        label: 'Bulleted List',
        description: 'Create an unnumbered list item',
        icon: React.createElement(List, { size: 16 }),
        keywords: ['bullet', 'list', 'item', 'unordered'],
        action: () => {
          if (slashIndex === null) return;
          const textarea = textareaRef.current;
          const end = textarea ? textarea.selectionEnd : slashIndex + 1 + slashQuery.length;
          const lineStart = proseContent.lastIndexOf('\n', slashIndex - 1) + 1;
          replaceRange(lineStart, end, '- ', 2);
          setSlashMenuOpen(false);
        }
      },
      {
        id: 'number',
        label: 'Numbered List',
        description: 'Create a sequentially numbered list',
        icon: React.createElement(ListOrdered, { size: 16 }),
        keywords: ['number', 'ordered', 'list', 'sequence'],
        action: () => {
          if (slashIndex === null) return;
          const textarea = textareaRef.current;
          const end = textarea ? textarea.selectionEnd : slashIndex + 1 + slashQuery.length;
          const lineStart = proseContent.lastIndexOf('\n', slashIndex - 1) + 1;
          replaceRange(lineStart, end, '1. ', 3);
          setSlashMenuOpen(false);
        }
      },
      {
        id: 'quote',
        label: 'Blockquote',
        description: 'Capture a letter, passage, or dialogue excerpt',
        icon: React.createElement(Quote, { size: 16 }),
        keywords: ['quote', 'blockquote', 'letter', 'citation'],
        action: () => {
          if (slashIndex === null) return;
          const textarea = textareaRef.current;
          const end = textarea ? textarea.selectionEnd : slashIndex + 1 + slashQuery.length;
          const lineStart = proseContent.lastIndexOf('\n', slashIndex - 1) + 1;
          replaceRange(lineStart, end, '> ', 2);
          setSlashMenuOpen(false);
        }
      },
      {
        id: 'divider',
        label: 'Scene Break / Divider',
        description: 'Insert an ornamental scene separator (* * *)',
        icon: React.createElement(Sparkles, { size: 16 }),
        keywords: ['break', 'divider', 'separator', 'scene', 'line', 'star'],
        action: () => {
          if (slashIndex === null) return;
          const textarea = textareaRef.current;
          const end = textarea ? textarea.selectionEnd : slashIndex + 1 + slashQuery.length;
          const lineStart = proseContent.lastIndexOf('\n', slashIndex - 1) + 1;
          replaceRange(lineStart, end, '\n* * *\n\n', 9);
          setSlashMenuOpen(false);
        }
      },
      {
        id: 'highlight',
        label: 'Highlight Text',
        description: 'Mark phrase with amber highlighter (==text==)',
        icon: React.createElement(Highlighter, { size: 16 }),
        keywords: ['highlight', 'mark', 'amber', 'yellow', 'color'],
        action: () => {
          if (slashIndex === null) return;
          const textarea = textareaRef.current;
          const end = textarea ? textarea.selectionEnd : slashIndex + 1 + slashQuery.length;
          replaceRange(slashIndex, end, '==highlighted phrase==', 2);
          setSlashMenuOpen(false);
        }
      },
      {
        id: 'bold',
        label: 'Bold Text',
        description: 'Add heavy emphasis (**text**)',
        icon: React.createElement(Bold, { size: 16 }),
        keywords: ['bold', 'strong', 'emphasis'],
        action: () => {
          if (slashIndex === null) return;
          const textarea = textareaRef.current;
          const end = textarea ? textarea.selectionEnd : slashIndex + 1 + slashQuery.length;
          replaceRange(slashIndex, end, '**bold text**', 2);
          setSlashMenuOpen(false);
        }
      },
      {
        id: 'italic',
        label: 'Italic Text',
        description: 'Add subtle emphasis or inner voice (*text*)',
        icon: React.createElement(Italic, { size: 16 }),
        keywords: ['italic', 'em', 'emphasis', 'voice'],
        action: () => {
          if (slashIndex === null) return;
          const textarea = textareaRef.current;
          const end = textarea ? textarea.selectionEnd : slashIndex + 1 + slashQuery.length;
          replaceRange(slashIndex, end, '*italic text*', 1);
          setSlashMenuOpen(false);
        }
      },
      {
        id: 'strikethrough',
        label: 'Strikethrough',
        description: 'Strike out deleted revision thoughts (~~text~~)',
        icon: React.createElement(Strikethrough, { size: 16 }),
        keywords: ['strike', 'strikethrough', 'delete', 'cross'],
        action: () => {
          if (slashIndex === null) return;
          const textarea = textareaRef.current;
          const end = textarea ? textarea.selectionEnd : slashIndex + 1 + slashQuery.length;
          replaceRange(slashIndex, end, '~~struck text~~', 2);
          setSlashMenuOpen(false);
        }
      },
      {
        id: 'dialogue',
        label: 'Dialogue Cue',
        description: 'Screenplay or novel spoken character cue',
        icon: React.createElement(Type, { size: 16 }),
        keywords: ['dialogue', 'character', 'speech', 'screenplay'],
        action: () => {
          if (slashIndex === null) return;
          const textarea = textareaRef.current;
          const end = textarea ? textarea.selectionEnd : slashIndex + 1 + slashQuery.length;
          const lineStart = proseContent.lastIndexOf('\n', slashIndex - 1) + 1;
          replaceRange(lineStart, end, 'CHARACTER NAME\n(whispering)\nDialogue line here.\n\n', 15);
          setSlashMenuOpen(false);
        }
      }
    ],
    [slashIndex, slashQuery, proseContent, replaceRange, textareaRef]
  );

  // Filter commands by active query
  const filteredCommands = useMemo(() => {
    if (!slashQuery) return allCommands;
    const q = slashQuery.toLowerCase().trim();
    return allCommands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(q) ||
        cmd.description.toLowerCase().includes(q) ||
        cmd.keywords.some((k) => k.includes(q))
    );
  }, [allCommands, slashQuery]);

  // Main keydown interceptor for Notion-style typing
  const handleNotionKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>): boolean => {
      const textarea = textareaRef.current;
      if (!textarea) return false;

      const { selectionStart: start, selectionEnd: end, value } = textarea;
      const isCollapsed = start === end;

      // -------------------------------------------------------------
      // 1. SLASH COMMAND POPUP HANDLING (If active)
      // -------------------------------------------------------------
      if (slashMenuOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
          return true;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
          return true;
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
          } else {
            setSlashMenuOpen(false);
          }
          return true;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          setSlashMenuOpen(false);
          return true;
        }
        if (e.key === 'Backspace') {
          if (slashIndex !== null && start <= slashIndex + 1) {
            setSlashMenuOpen(false);
          }
        }
      }

      // -------------------------------------------------------------
      // 2. AUTO-WRAP SELECTION WITH DELIMITERS (Notion feature)
      // -------------------------------------------------------------
      if (!isCollapsed) {
        const wrapPairs: Record<string, [string, string]> = {
          '*': ['*', '*'],
          '_': ['_', '_'],
          '~': ['~~', '~~'],
          '=': ['==', '=='],
          '"': ['"', '"'],
          "'": ["'", "'"],
          '(': ['(', ')'],
          '[': ['[', ']'],
          '{': ['{', '}'],
          '`': ['`', '`']
        };

        if (wrapPairs[e.key]) {
          e.preventDefault();
          const [left, right] = wrapPairs[e.key];
          const selected = value.substring(start, end);
          replaceRange(start, end, `${left}${selected}${right}`, left.length + selected.length);
          return true;
        }
      }

      // -------------------------------------------------------------
      // 3. ENTER KEY (Notion list continuation & exit)
      // -------------------------------------------------------------
      if (e.key === 'Enter' && isCollapsed && !e.shiftKey) {
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const lineText = value.substring(lineStart, start);

        // A. Bullet list (- or *)
        const bulletMatch = lineText.match(/^(\s*)([-*])\s(.*)$/);
        if (bulletMatch) {
          e.preventDefault();
          const [, indent, bullet, content] = bulletMatch;
          if (content.trim() === '') {
            replaceRange(lineStart, start, '', 0);
          } else {
            replaceRange(start, start, `\n${indent}${bullet} `, indent.length + 3);
          }
          return true;
        }

        // B. Numbered list (1. 2. 3.)
        const numMatch = lineText.match(/^(\s*)(\d+)\.\s(.*)$/);
        if (numMatch) {
          e.preventDefault();
          const [, indent, numStr, content] = numMatch;
          if (content.trim() === '') {
            replaceRange(lineStart, start, '', 0);
          } else {
            const nextNum = parseInt(numStr, 10) + 1;
            replaceRange(start, start, `\n${indent}${nextNum}. `, indent.length + `${nextNum}. `.length);
          }
          return true;
        }

        // C. Blockquote (>)
        const quoteMatch = lineText.match(/^(\s*)>\s(.*)$/);
        if (quoteMatch) {
          e.preventDefault();
          const [, indent, content] = quoteMatch;
          if (content.trim() === '') {
            replaceRange(lineStart, start, '', 0);
          } else {
            replaceRange(start, start, `\n${indent}> `, indent.length + 3);
          }
          return true;
        }
      }

      // -------------------------------------------------------------
      // 4. BACKSPACE AT START OF FORMATTED BLOCK
      // -------------------------------------------------------------
      if (e.key === 'Backspace' && isCollapsed) {
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const lineText = value.substring(lineStart, start);

        const prefixPatterns = [
          /^###\s$/,
          /^##\s$/,
          /^#\s$/,
          /^[-*]\s$/,
          /^>\s$/,
          /^\d+\.\s$/
        ];

        for (const pattern of prefixPatterns) {
          if (pattern.test(lineText)) {
            e.preventDefault();
            replaceRange(lineStart, start, '', 0);
            return true;
          }
        }
      }

      // -------------------------------------------------------------
      // 5. SPACE KEY (Notion on-the-go markdown transformations)
      // -------------------------------------------------------------
      if (e.key === ' ' && isCollapsed) {
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const lineText = value.substring(lineStart, start);

        if (lineText === '#') {
          e.preventDefault();
          replaceRange(lineStart, start, '# ', 2);
          return true;
        }
        if (lineText === '##') {
          e.preventDefault();
          replaceRange(lineStart, start, '## ', 3);
          return true;
        }
        if (lineText === '###') {
          e.preventDefault();
          replaceRange(lineStart, start, '### ', 4);
          return true;
        }
        if (lineText === '*' || lineText === '-') {
          e.preventDefault();
          replaceRange(lineStart, start, '- ', 2);
          return true;
        }
        if (lineText === '1.') {
          e.preventDefault();
          replaceRange(lineStart, start, '1. ', 3);
          return true;
        }
        if (lineText === '>') {
          e.preventDefault();
          replaceRange(lineStart, start, '> ', 2);
          return true;
        }
        if (lineText === '---' || lineText === '***') {
          e.preventDefault();
          replaceRange(lineStart, start, '* * *\n\n', 7);
          return true;
        }
      }

      // -------------------------------------------------------------
      // 6. SLASH KEY (Trigger Notion menu with exact caret alignment)
      // -------------------------------------------------------------
      if (e.key === '/') {
        const charBefore = start > 0 ? value[start - 1] : '\n';
        if (charBefore === '\n' || charBefore === ' ' || charBefore === '\t' || start === 0) {
          setSlashMenuOpen(true);
          setSlashQuery('');
          setSlashIndex(start);
          setSelectedIndex(0);

          // Calculate exact caret coordinates in viewport coordinates for fixed SlashCommandMenu
          const coords = getCaretCoordinates(textarea, start);
          const rect = textarea.getBoundingClientRect();
          const slashTop = rect.top + coords.top - textarea.scrollTop;
          const slashBottom = slashTop + (coords.height || 24);
          const pos = calculateSlashMenuPosition({
            top: slashTop,
            bottom: slashBottom,
            left: rect.left + coords.left - textarea.scrollLeft,
            height: coords.height || 24
          });
          setMenuPosition(pos);
        }
      }

      return false;
    },
    [textareaRef, slashMenuOpen, slashIndex, filteredCommands, selectedIndex, replaceRange]
  );

  // Track user typing to update slash query while menu is open
  const handleProseInput = useCallback(
    (nextProse: string) => {
      if (slashMenuOpen && slashIndex !== null) {
        const textarea = textareaRef.current;
        const currentCursor = textarea ? textarea.selectionStart : nextProse.length;
        if (currentCursor >= slashIndex + 1) {
          const typed = nextProse.substring(slashIndex + 1, currentCursor);
          if (typed.includes(' ') || typed.includes('\n')) {
            setSlashMenuOpen(false);
          } else {
            setSlashQuery(typed);
            setSelectedIndex(0);

            // Keep menu position synchronized as user types /hea
            if (textarea) {
              const coords = getCaretCoordinates(textarea, slashIndex);
              const rect = textarea.getBoundingClientRect();
              const slashTop = rect.top + coords.top - textarea.scrollTop;
              const slashBottom = slashTop + (coords.height || 24);
              const pos = calculateSlashMenuPosition({
                top: slashTop,
                bottom: slashBottom,
                left: rect.left + coords.left - textarea.scrollLeft,
                height: coords.height || 24
              });
              setMenuPosition(pos);
            }
          }
        } else {
          setSlashMenuOpen(false);
        }
      }
    },
    [slashMenuOpen, slashIndex, textareaRef]
  );

  return {
    slashMenuOpen,
    slashQuery,
    selectedIndex,
    menuPosition,
    filteredCommands,
    closeSlashMenu: () => setSlashMenuOpen(false),
    selectCommand: (cmd: SlashCommand) => cmd.action(),
    handleNotionKeyDown,
    handleProseInput
  };
}
