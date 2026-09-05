import { getCaretCoordinates } from './caretCoordinates';

/**
 * Typewriter Mode & Caret Geometry Utilities
 * Provides sub-pixel caret detection in ContentEditable & Textarea surfaces,
 * adaptive Notion popup positioning where '/' is never obstructed,
 * and typewriter scroll shifting that keeps the cursor stationary on screen upon new line.
 */

export const TYPEWRITER_HORIZON_RATIO = 0.42;

/**
 * Returns the exact screen Y coordinate of the caret inside a textarea.
 */
export function getTextareaCaretScreenY(
  textarea: HTMLTextAreaElement | null
): number | null {
  if (!textarea || typeof window === 'undefined') return null;
  const cursorIndex = textarea.selectionStart;
  const coords = getCaretCoordinates(textarea, cursorIndex);
  const textareaRect = textarea.getBoundingClientRect();
  return textareaRect.top + coords.top + (coords.height / 2);
}

/**
 * Shifts the scroll container when entering a new line in typewriter mode,
 * keeping the cursor at the exact same vertical position on screen.
 */
export function handleTypewriterNewLineShift(
  container: HTMLElement | null,
  prevScreenY: number | null,
  newScreenY: number | null
): void {
  if (!container || prevScreenY === null || newScreenY === null) return;
  const deltaY = newScreenY - prevScreenY;
  if (Math.abs(deltaY) > 0.5) {
    container.scrollTop += deltaY;
  }
}

/**
 * Returns the exact vertical center (Y coordinate in viewport pixels) of the caret
 * inside a ContentEditable container, handling collapsed ranges, empty blocks, and WebKit quirks.
 */
export function getCaretClientY(): number | null {
  if (typeof window === 'undefined') return null;
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;

  const range = sel.getRangeAt(0);

  // 1. Primary check: getBoundingClientRect on range
  const r = range.getBoundingClientRect();
  if (r && r.top > 0 && (r.height > 0 || r.width > 0)) {
    return r.top + (r.height > 0 ? r.height / 2 : 14);
  }

  // 2. Secondary check: getClientRects (collapsed ranges in Chrome)
  const clientRects = range.getClientRects();
  if (clientRects.length > 0 && clientRects[0].top > 0) {
    const cr = clientRects[0];
    return cr.top + (cr.height > 0 ? cr.height / 2 : 14);
  }

  // 3. TextNode check: measure adjacent character around caret
  if (range.startContainer.nodeType === Node.TEXT_NODE) {
    const node = range.startContainer;
    const offset = range.startOffset;

    if (offset > 0) {
      try {
        const tr = document.createRange();
        tr.setStart(node, offset - 1);
        tr.setEnd(node, offset);
        const cr = tr.getBoundingClientRect();
        if (cr && cr.top > 0 && cr.height > 0) {
          return cr.top + cr.height / 2;
        }
      } catch {}
    }

    if (node.textContent && offset < node.textContent.length) {
      try {
        const tr = document.createRange();
        tr.setStart(node, offset);
        tr.setEnd(node, offset + 1);
        const cr = tr.getBoundingClientRect();
        if (cr && cr.top > 0 && cr.height > 0) {
          return cr.top + cr.height / 2;
        }
      } catch {}
    }
  }

  // 4. Temporary probe insertion: measures exact position inside newly created empty lines or <br>
  try {
    const probe = document.createElement('span');
    probe.textContent = '\uFEFF';
    probe.style.cssText = 'display:inline;line-height:inherit;font-size:inherit;padding:0;margin:0;border:0;';
    const clone = range.cloneRange();
    clone.collapse(true);
    clone.insertNode(probe);
    const cr = probe.getBoundingClientRect();
    probe.parentNode?.removeChild(probe);
    if (cr && cr.top > 0) {
      return cr.top + (cr.height > 0 ? cr.height / 2 : 14);
    }
  } catch {}

  // 5. Parent block fallback: if in empty block (<p>, <div>, etc.)
  const blockEl = range.startContainer instanceof Element ? range.startContainer : range.startContainer.parentElement;
  if (blockEl) {
    const bRect = blockEl.getBoundingClientRect();
    if (bRect && bRect.top > 0) {
      return bRect.top + Math.min(bRect.height / 2, 14);
    }
  }

  return null;
}

/**
 * Returns the exact bounding rect of the slash character ('/') preceding the caret.
 */
export function getSlashCharacterRect(): DOMRect | null {
  if (typeof window === 'undefined') return null;
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;

  const range = sel.getRangeAt(0);

  // Check if cursor is in a text node containing '/'
  if (range.startContainer.nodeType === Node.TEXT_NODE) {
    const textNode = range.startContainer;
    const offset = range.startOffset;
    const text = textNode.textContent || '';
    const slashIdx = text.lastIndexOf('/', offset - 1);

    if (slashIdx !== -1) {
      try {
        const charRange = document.createRange();
        charRange.setStart(textNode, slashIdx);
        charRange.setEnd(textNode, slashIdx + 1);
        const cr = charRange.getBoundingClientRect();
        if (cr && cr.top > 0 && (cr.width > 0 || cr.height > 0)) {
          return cr;
        }
      } catch {}
    }
  }

  // Fallback to range client rect
  const r = range.getBoundingClientRect();
  if (r && r.top > 0) return r;

  return null;
}

export interface SlashPositionResult {
  top?: number;
  bottom?: number;
  left: number;
  maxHeight?: number;
  openUpward: boolean;
  slashTop: number;
  slashBottom: number;
}

/**
 * Calculates adaptive screen coordinates for the Notion slash popup so it never
 * covers the '/' character and neatly flips upward if near the bottom of the screen.
 * When opening upward: bottom is anchored above slashTop.
 * When opening downward: top is anchored below slashBottom.
 */
export function calculateSlashMenuPosition(slashRect: DOMRect | { top: number; bottom: number; left: number; height?: number }): SlashPositionResult {
  const menuWidth = 310;
  const preferredHeight = 320;
  const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;

  const spaceBelow = windowHeight - slashRect.bottom;
  const spaceAbove = slashRect.top;

  // Open upward if there isn't enough space below (< 260px) and more space above
  const openUpward = spaceBelow < 260 && spaceAbove > spaceBelow;

  let left = slashRect.left;
  if (left + menuWidth > windowWidth - 16) {
    left = Math.max(16, windowWidth - menuWidth - 16);
  }
  if (left < 16) left = 16;

  if (openUpward) {
    // Menu sits strictly ABOVE the slash character with 8px clearance
    const bottom = windowHeight - slashRect.top + 8;
    const maxHeight = Math.min(preferredHeight, Math.max(120, spaceAbove - 24));
    return {
      bottom,
      left,
      maxHeight,
      openUpward: true,
      slashTop: slashRect.top,
      slashBottom: slashRect.bottom
    };
  } else {
    // Menu sits strictly BELOW the slash character with 8px clearance
    const top = slashRect.bottom + 8;
    const maxHeight = Math.min(preferredHeight, Math.max(120, spaceBelow - 24));
    return {
      top,
      left,
      maxHeight,
      openUpward: false,
      slashTop: slashRect.top,
      slashBottom: slashRect.bottom
    };
  }
}

/**
 * Aligns the scrollContainer so the caret sits squarely at the optical horizon line.
 */
export function alignTypewriterScroll(
  container: HTMLElement | null,
  knownCaretY?: number,
  ratio = TYPEWRITER_HORIZON_RATIO
): void {
  if (!container) return;

  const caretY = knownCaretY ?? getCaretClientY();
  if (caretY === null) return;

  const containerRect = container.getBoundingClientRect();
  const targetY = containerRect.top + container.clientHeight * ratio;
  const delta = caretY - targetY;

  if (Math.abs(delta) > 1) {
    container.scrollTop += delta;
  }
}
