import { marked } from 'marked';
import TurndownService from 'turndown';

// Configure marked to never interpret manuscript indents or code blocks as monospace Courier blocks
marked.use({
  tokenizer: {
    code() {
      // Returning undefined tells marked not to match indented code blocks, falling back to standard paragraphs
      return undefined as unknown as false;
    }
  },
  renderer: {
    code(token) {
      const text = typeof token === 'object' && token && 'text' in token ? (token as { text: string }).text : String(token);
      return `<p>${text}</p>`;
    },
    codespan(token) {
      const text = typeof token === 'object' && token && 'text' in token ? (token as { text: string }).text : String(token);
      return `<span>${text}</span>`;
    }
  }
});

// Configure Turndown service for clean Markdown output
const turndownService = new TurndownService({
  headingStyle: 'atx',
  hr: '* * *',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '*'
});

// Unconditionally unwrap code/monospace elements so manuscript prose is never saved as fenced code blocks
turndownService.addRule('unwrapCode', {
  filter: (node) => ['code', 'kbd', 'samp', 'tt', 'var'].includes(node.nodeName.toLowerCase()),
  replacement: (content) => content
});

// Convert <pre> into clean paragraphs
turndownService.addRule('convertPreToParagraphs', {
  filter: ['pre'],
  replacement: (content) => `\n\n${content.trim()}\n\n`
});

// Custom rule for highlights: <mark class="...">text</mark> -> ==color:text== or ==text==
turndownService.addRule('highlight', {
  filter: ['mark'],
  replacement: (content, node) => {
    const el = node as HTMLElement;
    const className = el.className || '';
    if (className.includes('hl-voice') || className.includes('hl-mint')) {
      return `==voice:${content}==`;
    }
    if (className.includes('hl-tighten') || className.includes('hl-rose')) {
      return `==tighten:${content}==`;
    }
    if (className.includes('hl-continuity') || className.includes('hl-blue')) {
      return `==continuity:${content}==`;
    }
    if (className.includes('hl-theme') || className.includes('hl-purple')) {
      return `==theme:${content}==`;
    }
    if (className.includes('hl-query') || className.includes('hl-orange')) {
      return `==query:${content}==`;
    }
    if (className.includes('hl-pacing') || className.includes('hl-yellow')) {
      return `==pacing:${content}==`;
    }
    return `==${content}==`;
  }
});

// Custom rule for scene break HR
turndownService.addRule('sceneBreak', {
  filter: ['hr'],
  replacement: () => '\n\n* * *\n\n'
});

/**
 * Converts Markdown to styled HTML for the live editor canvas.
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return '<p><br></p>';

  let processed = markdown;

  // Transform color highlights: ==color:text== -> <mark class="hl-color">text</mark>
  processed = processed.replace(/==pacing:(.*?)==/gi, '<mark class="hl-pacing" data-category="pacing" title="Line Edit: Pacing & Rhythm">$1</mark>');
  processed = processed.replace(/==yellow:(.*?)==/gi, '<mark class="hl-pacing" data-category="pacing" title="Line Edit: Pacing & Rhythm">$1</mark>');
  processed = processed.replace(/==amber:(.*?)==/gi, '<mark class="hl-pacing" data-category="pacing" title="Line Edit: Pacing & Rhythm">$1</mark>');

  processed = processed.replace(/==voice:(.*?)==/gi, '<mark class="hl-voice" data-category="voice" title="Line Edit: Voice & Sensory Detail">$1</mark>');
  processed = processed.replace(/==mint:(.*?)==/gi, '<mark class="hl-voice" data-category="voice" title="Line Edit: Voice & Sensory Detail">$1</mark>');
  processed = processed.replace(/==green:(.*?)==/gi, '<mark class="hl-voice" data-category="voice" title="Line Edit: Voice & Sensory Detail">$1</mark>');

  processed = processed.replace(/==tighten:(.*?)==/gi, '<mark class="hl-tighten" data-category="tighten" title="Line Edit: Tighten & Cut">$1</mark>');
  processed = processed.replace(/==rose:(.*?)==/gi, '<mark class="hl-tighten" data-category="tighten" title="Line Edit: Tighten & Cut">$1</mark>');
  processed = processed.replace(/==red:(.*?)==/gi, '<mark class="hl-tighten" data-category="tighten" title="Line Edit: Tighten & Cut">$1</mark>');

  processed = processed.replace(/==continuity:(.*?)==/gi, '<mark class="hl-continuity" data-category="continuity" title="Line Edit: Continuity & Logic">$1</mark>');
  processed = processed.replace(/==blue:(.*?)==/gi, '<mark class="hl-continuity" data-category="continuity" title="Line Edit: Continuity & Logic">$1</mark>');
  processed = processed.replace(/==sky:(.*?)==/gi, '<mark class="hl-continuity" data-category="continuity" title="Line Edit: Continuity & Logic">$1</mark>');

  processed = processed.replace(/==theme:(.*?)==/gi, '<mark class="hl-theme" data-category="theme" title="Line Edit: Subtext & Theme">$1</mark>');
  processed = processed.replace(/==purple:(.*?)==/gi, '<mark class="hl-theme" data-category="theme" title="Line Edit: Subtext & Theme">$1</mark>');

  processed = processed.replace(/==query:(.*?)==/gi, '<mark class="hl-query" data-category="query" title="Line Edit: Author Margin Query">$1</mark>');
  processed = processed.replace(/==orange:(.*?)==/gi, '<mark class="hl-query" data-category="query" title="Line Edit: Author Margin Query">$1</mark>');

  // Standard highlight: ==text== -> <mark class="hl-pacing">text</mark>
  processed = processed.replace(/==(.*?)==/g, '<mark class="hl-pacing" data-category="pacing">$1</mark>');

  // Strip code fences that may have been created from pasting Courier/monospace text
  processed = processed.replace(/^```[a-zA-Z0-9_-]*\r?\n([\s\S]*?)\r?\n```$/gm, '$1');

  try {
    const html = marked.parse(processed, { async: false, breaks: true, gfm: true }) as string;
    return html.trim() || '<p><br></p>';
  } catch (err) {
    console.error('Error parsing markdown to HTML:', err);
    return `<p>${processed}</p>`;
  }
}

/**
 * Converts HTML from the live editor canvas back to clean Markdown for storage.
 */
export function htmlToMarkdown(html: string): string {
  if (!html || html === '<p><br></p>' || html === '<br>') return '';

  try {
    const md = turndownService.turndown(html);
    // Strip leading/trailing newlines only, preserving trailing spaces on active words
    return md.replace(/^\n+|\n+$/g, '');
  } catch (err) {
    console.error('Error converting HTML to markdown:', err);
    return html;
  }
}
