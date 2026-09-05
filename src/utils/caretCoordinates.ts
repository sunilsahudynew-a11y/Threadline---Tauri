/**
 * Calculates the exact pixel coordinates (top, left, height) of the caret inside an HTMLTextAreaElement.
 * Based on the textarea-caret-position technique used by Notion, CodeMirror, and Quill.
 */

const PROPERTIES = [
  'direction',
  'boxSizing',
  'width',
  'overflowX',
  'overflowY',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderStyle',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'fontStyle',
  'fontVariant',
  'fontWeight',
  'fontStretch',
  'fontSize',
  'fontSizeAdjust',
  'lineHeight',
  'fontFamily',
  'textAlign',
  'textTransform',
  'textIndent',
  'textDecoration',
  'letterSpacing',
  'wordSpacing',
  'tabSize',
  'MozTabSize',
  'whiteSpace',
  'wordBreak',
  'overflowWrap'
] as const;

export interface CaretCoordinates {
  top: number;
  left: number;
  height: number;
}

let mirrorDiv: HTMLDivElement | null = null;

export function getCaretCoordinates(
  element: HTMLTextAreaElement,
  position: number
): CaretCoordinates {
  if (typeof window === 'undefined') {
    return { top: 0, left: 0, height: 24 };
  }

  // Create or reuse mirror div
  if (!mirrorDiv) {
    mirrorDiv = document.createElement('div');
    mirrorDiv.id = '__textarea_caret_mirror__';
    document.body.appendChild(mirrorDiv);
  }

  const style = mirrorDiv.style;
  const computed = window.getComputedStyle(element);

  // Position the mirror div off-screen
  style.whiteSpace = 'pre-wrap';
  style.wordWrap = 'break-word';
  style.position = 'absolute';
  style.visibility = 'hidden';
  style.top = '-9999px';
  style.left = '-9999px';
  style.pointerEvents = 'none';

  // Copy geometry and typography styles
  for (const prop of PROPERTIES) {
    // @ts-ignore
    style[prop] = computed[prop];
  }

  // Ensure exact pixel width
  style.width = `${element.clientWidth}px`;

  // Text up to the caret position
  mirrorDiv.textContent = element.value.substring(0, position);

  // Caret marker element
  const span = document.createElement('span');
  span.textContent = element.value.substring(position) || '.';
  mirrorDiv.appendChild(span);

  const coordinates: CaretCoordinates = {
    top: span.offsetTop + parseInt(computed.borderTopWidth, 10),
    left: span.offsetLeft + parseInt(computed.borderLeftWidth, 10),
    height: parseInt(computed.lineHeight, 10) || span.offsetHeight || 24
  };

  return coordinates;
}
