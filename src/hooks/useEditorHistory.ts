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

const MAX_HISTORY = 100;
const STORAGE_PREFIX = 'threadline_editor_history_';

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
    setCanUndo(history.undoStack.length > 0);
    setCanRedo(history.redoStack.length > 0);
    setUndoCount(history.undoStack.length);
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
   * Handle natural typing changes with milestone grouping.
   * Instead of saving every single character keystroke, continuous typing of words and
   * sentences is grouped into a single undo step until a pause, paragraph break, or mode shift occurs.
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

    // Determine if we need to start a new undo milestone:
    // 1. No active session (first keystroke after idle or action)
    // 2. Switched between typing (inserting) and backspacing (deleting)
    // 3. User pressed Enter (paragraph break)
    // 4. Typing continuously for more than 8 seconds without a pause
    const typeChanged = activeSession !== null && activeSession.type !== currentType;
    const isParagraphBreak = currentType === 'insert' && (newContent.endsWith('\n') || (newContent.includes('\n') && !prevContent.includes('\n')));
    const sessionTimedOut = activeSession !== null && (now - activeSession.startTime > 8000);

    if (!activeSession || typeChanged || isParagraphBreak || sessionTimedOut) {
      // Commit the previous text state as the baseline undo point
      const last = history.undoStack[history.undoStack.length - 1];
      if (last !== prevContent) {
        history.undoStack.push(prevContent);
        if (history.undoStack.length > MAX_HISTORY) {
          history.undoStack.shift();
        }
      }
      history.redoStack = [];
      sessionRef.current = {
        type: currentType,
        baseline: prevContent,
        startTime: now
      };
      updateAvailability(history);
    }

    // Reset debounce timer to close the typing session after the user pauses
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    // Natural milestone markers: sentence ending punctuation followed by space (". ", "? ", "! ")
    const hasSentenceBoundary = /[.?!]\s+$/.test(newContent);
    const idleDelay = hasSentenceBoundary ? 500 : 1200;

    typingTimerRef.current = setTimeout(() => {
      // User paused typing; close the session so the next keystroke starts a new undo milestone
      sessionRef.current = null;
    }, idleDelay);
  }, [sceneId, updateAvailability]);

  /**
   * Undo to previous snapshot (rolling back a full word/sentence/typing chunk or discrete action)
   */
  const undo = useCallback((currentText: string): string | null => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    sessionRef.current = null;

    if (!historiesRef.current[sceneId]) {
      historiesRef.current[sceneId] = loadPersistedHistory(sceneId);
    }
    const history = historiesRef.current[sceneId];
    if (!history || history.undoStack.length === 0) {
      return null;
    }

    // Pop the previous state; skip identical duplicates if any exist
    let previousState = history.undoStack.pop()!;
    while (previousState === currentText && history.undoStack.length > 0) {
      previousState = history.undoStack.pop()!;
    }
    if (previousState === currentText) {
      updateAvailability(history);
      return null;
    }

    history.redoStack.push(currentText);
    updateAvailability(history);

    return previousState;
  }, [sceneId, updateAvailability]);

  /**
   * Redo to next snapshot (re-applying a full word/sentence/typing chunk or discrete action)
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

    let nextState = history.redoStack.pop()!;
    while (nextState === currentText && history.redoStack.length > 0) {
      nextState = history.redoStack.pop()!;
    }
    if (nextState === currentText) {
      updateAvailability(history);
      return null;
    }

    history.undoStack.push(currentText);
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
