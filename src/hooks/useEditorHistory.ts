import { useState, useRef, useCallback, useEffect } from 'react';

interface HistoryState {
  undoStack: string[];
  redoStack: string[];
}

interface TypingSession {
  type: 'insert' | 'delete';
  baseline: string;
  startTime: number;
}

const MAX_HISTORY = 150;
const STORAGE_PREFIX = 'threadline_editor_history_';

function isWordDelimiter(char: string): boolean {
  return /[\s.,!?;:—–\-"'()[\]{}*~_/\\`<>#@&$+=|]/.test(char);
}

export function countWords(str: string): number {
  const trimmed = str.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

/**
 * Strips the trailing word from a string to support clean word-by-word undo.
 */
export function removeTrailingWord(text: string): string {
  if (!text) return '';
  if (/^[\s\n\r]+$/.test(text)) return '';

  // If text ends with newlines, strip trailing newlines
  if (/[\n\r]+$/.test(text)) {
    return text.replace(/[\n\r]+$/, '');
  }

  // Match: (everything before trailing word) + (trailing word with optional trailing whitespace)
  const match = text.match(/^([\s\S]*?)([^\s\n\r]+[\s\n\r]*)$/);
  if (match) {
    return match[1];
  }
  return '';
}

/**
 * Advances by one word from currentText towards targetFullText to support clean word-by-word redo.
 */
export function advanceOneWord(currentText: string, targetFullText: string): string {
  if (!targetFullText) return currentText;
  if (!targetFullText.startsWith(currentText)) {
    return targetFullText;
  }
  const remainder = targetFullText.slice(currentText.length);
  if (!remainder) return currentText;

  const nextWordMatch = remainder.match(/^([\s\n\r]*[^\s\n\r]+[\s\n\r]*)/);
  if (nextWordMatch && nextWordMatch[1]) {
    return currentText + nextWordMatch[1];
  }
  return targetFullText;
}

function loadPersistedHistory(sceneId: string): HistoryState {
  if (typeof window === 'undefined') return { undoStack: [], redoStack: [] };
  try {
    const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${sceneId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.undoStack) && Array.isArray(parsed.redoStack)) {
        return {
          undoStack: parsed.undoStack.slice(-MAX_HISTORY),
          redoStack: parsed.redoStack.slice(-MAX_HISTORY)
        };
      }
    }
  } catch (e) {
    // ignore sessionStorage errors
  }
  return { undoStack: [], redoStack: [] };
}

function persistHistory(sceneId: string, history: HistoryState) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(
      `${STORAGE_PREFIX}${sceneId}`,
      JSON.stringify({
        undoStack: history.undoStack.slice(-MAX_HISTORY),
        redoStack: history.redoStack.slice(-MAX_HISTORY)
      })
    );
  } catch (e) {
    // ignore storage quota or private mode issues
  }
}

export function useEditorHistory(sceneId: string, _currentContent: string) {
  // Store histories per scene ID so switching scenes doesn't clobber history
  const historiesRef = useRef<Record<string, HistoryState>>({});

  // Active continuous typing/deleting session
  const sessionRef = useRef<TypingSession | null>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger re-render when undo/redo availability or count changes
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);
  const [undoCount, setUndoCount] = useState<number>(0);
  const [redoCount, setRedoCount] = useState<number>(0);

  const updateAvailability = useCallback((history: HistoryState) => {
    const hasActiveSession = sessionRef.current !== null;
    setCanUndo(history.undoStack.length > 0 || hasActiveSession);
    setCanRedo(history.redoStack.length > 0);
    setUndoCount(history.undoStack.length + (hasActiveSession ? 1 : 0));
    setRedoCount(history.redoStack.length);
    persistHistory(sceneId, history);
  }, [sceneId]);

  // Initialize or restore state when sceneId changes
  useEffect(() => {
    if (!historiesRef.current[sceneId]) {
      historiesRef.current[sceneId] = loadPersistedHistory(sceneId);
    }
    const history = historiesRef.current[sceneId];
    sessionRef.current = null;

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    updateAvailability(history);
  }, [sceneId, updateAvailability]);

  /**
   * Explicitly push current content before a discrete action (formatting, deletion, cutting room, AI replace)
   */
  const pushSnapshot = useCallback((contentToSnapshot: string) => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    sessionRef.current = null;

    if (!historiesRef.current[sceneId]) {
      historiesRef.current[sceneId] = loadPersistedHistory(sceneId);
    }
    const history = historiesRef.current[sceneId];

    // Don't push duplicate if identical to top of stack
    const last = history.undoStack[history.undoStack.length - 1];
    if (last !== contentToSnapshot) {
      history.undoStack.push(contentToSnapshot);
      if (history.undoStack.length > MAX_HISTORY) {
        history.undoStack.shift();
      }
    }
    // Any new user action invalidates the redo branch
    history.redoStack = [];
    updateAvailability(history);
  }, [sceneId, updateAvailability]);

  /**
   * Handle natural typing changes with word-level granularity.
   * Every word boundary (space, punctuation, newline) or natural typing pause commits
   * a discrete undo step. Undo removes text word-by-word and Redo restores text word-by-word.
   */
  const recordTypingChange = useCallback((newContent: string, prevContent: string) => {
    if (newContent === prevContent) return;

    if (!historiesRef.current[sceneId]) {
      historiesRef.current[sceneId] = loadPersistedHistory(sceneId);
    }
    const history = historiesRef.current[sceneId];
    const now = Date.now();

    const isDelete = newContent.length < prevContent.length;
    const currentType: 'insert' | 'delete' = isDelete ? 'delete' : 'insert';
    const activeSession = sessionRef.current;

    // Helper to safely push a snapshot to undo stack without immediate duplicate
    const commitToUndoStack = (content: string) => {
      const last = history.undoStack[history.undoStack.length - 1];
      if (last !== content) {
        history.undoStack.push(content);
        if (history.undoStack.length > MAX_HISTORY) {
          history.undoStack.shift();
        }
      }
    };

    // If typing direction changed (e.g. typing -> backspacing, or backspacing -> typing),
    // finalize previous session
    if (activeSession !== null && activeSession.type !== currentType) {
      commitToUndoStack(prevContent);
      history.redoStack = [];
      sessionRef.current = null;
    }

    if (currentType === 'insert') {
      const lastChar = newContent.charAt(newContent.length - 1);
      const endsWithDelimiter = isWordDelimiter(lastChar);
      const isMultiChar = newContent.length - prevContent.length > 1;
      const isNewline = newContent.endsWith('\n') || (newContent.includes('\n') && !prevContent.includes('\n'));

      // If this is the start of a new word session, establish baseline
      if (!sessionRef.current) {
        commitToUndoStack(prevContent);
        history.redoStack = [];
        sessionRef.current = {
          type: 'insert',
          baseline: prevContent,
          startTime: now
        };
        updateAvailability(history);
      }

      // If a word delimiter (space/punct), newline, or multi-character insertion occurred:
      // the word is completed! Commit to undo stack immediately.
      if (endsWithDelimiter || isNewline || isMultiChar) {
        commitToUndoStack(newContent);
        history.redoStack = [];
        sessionRef.current = null;
        updateAvailability(history);

        if (typingTimerRef.current) {
          clearTimeout(typingTimerRef.current);
          typingTimerRef.current = null;
        }
        return;
      }
    } else {
      // Deleting / Backspacing
      const isMultiCharDelete = prevContent.length - newContent.length > 1;

      if (!sessionRef.current) {
        commitToUndoStack(prevContent);
        history.redoStack = [];
        sessionRef.current = {
          type: 'delete',
          baseline: prevContent,
          startTime: now
        };
        updateAvailability(history);
      }

      if (isMultiCharDelete) {
        commitToUndoStack(newContent);
        history.redoStack = [];
        sessionRef.current = null;
        updateAvailability(history);

        if (typingTimerRef.current) {
          clearTimeout(typingTimerRef.current);
          typingTimerRef.current = null;
        }
        return;
      }
    }

    // Reset debounce timer: if user pauses typing for 400ms without explicit delimiter,
    // commit current word state as an undo milestone so subsequent words are distinct
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    typingTimerRef.current = setTimeout(() => {
      if (sessionRef.current) {
        commitToUndoStack(newContent);
        sessionRef.current = null;
        updateAvailability(history);
      }
    }, 400);
  }, [sceneId, updateAvailability]);

  /**
   * Undo to previous snapshot (rolling back exactly one word or discrete typing chunk)
   */
  const undo = useCallback((currentText: string): string | null => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }

    if (!historiesRef.current[sceneId]) {
      historiesRef.current[sceneId] = loadPersistedHistory(sceneId);
    }
    const history = historiesRef.current[sceneId];

    // Case 1: In the middle of an active unfinished word
    if (sessionRef.current) {
      const activeBaseline = sessionRef.current.baseline;
      sessionRef.current = null;
      if (activeBaseline !== currentText) {
        const lastRedo = history.redoStack[history.redoStack.length - 1];
        if (lastRedo !== currentText) {
          history.redoStack.push(currentText);
        }
        updateAvailability(history);
        return activeBaseline;
      }
    }

    if (!history) return null;

    // Pop previous state, skipping identical entries
    let previousState: string | undefined = history.undoStack.pop();
    while (previousState === currentText && history.undoStack.length > 0) {
      previousState = history.undoStack.pop();
    }

    // If previousState exists and differs from currentText
    if (previousState !== undefined && previousState !== currentText) {
      // Ensure Undo strictly steps back by one word if the previous snapshot spanned multiple words
      if (countWords(currentText) - countWords(previousState) > 1) {
        const oneWordBack = removeTrailingWord(currentText);
        if (oneWordBack && oneWordBack !== currentText && oneWordBack.length > previousState.length) {
          // Keep previousState on undoStack for subsequent undo operations
          history.undoStack.push(previousState);
          const lastRedo = history.redoStack[history.redoStack.length - 1];
          if (lastRedo !== currentText) {
            history.redoStack.push(currentText);
          }
          updateAvailability(history);
          return oneWordBack;
        }
      }

      const lastRedo = history.redoStack[history.redoStack.length - 1];
      if (lastRedo !== currentText) {
        history.redoStack.push(currentText);
      }
      updateAvailability(history);
      return previousState;
    }

    // Fallback: If stack was empty or exhausted, step back word-by-word from current text
    if (currentText.trim().length > 0) {
      const oneWordBack = removeTrailingWord(currentText);
      if (oneWordBack !== currentText) {
        const lastRedo = history.redoStack[history.redoStack.length - 1];
        if (lastRedo !== currentText) {
          history.redoStack.push(currentText);
        }
        updateAvailability(history);
        return oneWordBack;
      }
    }

    updateAvailability(history);
    return null;
  }, [sceneId, updateAvailability]);

  /**
   * Redo to next snapshot (re-applying exactly one word or discrete typing chunk)
   */
  const redo = useCallback((currentText: string): string | null => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    sessionRef.current = null;

    if (!historiesRef.current[sceneId]) {
      historiesRef.current[sceneId] = loadPersistedHistory(sceneId);
    }
    const history = historiesRef.current[sceneId];
    if (!history || history.redoStack.length === 0) {
      return null;
    }

    let nextState: string | undefined = history.redoStack.pop();
    while (nextState === currentText && history.redoStack.length > 0) {
      nextState = history.redoStack.pop();
    }

    if (nextState === undefined || nextState === currentText) {
      updateAvailability(history);
      return null;
    }

    // If nextState has multiple words forward from currentText, advance word-by-word
    if (nextState.startsWith(currentText) && countWords(nextState) - countWords(currentText) > 1) {
      const oneWordForward = advanceOneWord(currentText, nextState);
      if (oneWordForward !== nextState && oneWordForward !== currentText) {
        // Keep nextState on redo stack for subsequent redo steps
        history.redoStack.push(nextState);
        const lastUndo = history.undoStack[history.undoStack.length - 1];
        if (lastUndo !== currentText) {
          history.undoStack.push(currentText);
        }
        updateAvailability(history);
        return oneWordForward;
      }
    }

    const lastUndo = history.undoStack[history.undoStack.length - 1];
    if (lastUndo !== currentText) {
      history.undoStack.push(currentText);
    }
    updateAvailability(history);
    return nextState;
  }, [sceneId, updateAvailability]);

  const clearHistory = useCallback(() => {
    historiesRef.current[sceneId] = { undoStack: [], redoStack: [] };
    sessionRef.current = null;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(`${STORAGE_PREFIX}${sceneId}`);
    }
    updateAvailability(historiesRef.current[sceneId]);
  }, [sceneId, updateAvailability]);

  return {
    undo,
    redo,
    pushSnapshot,
    recordTypingChange,
    canUndo,
    canRedo,
    undoCount,
    redoCount,
    clearHistory
  };
}
