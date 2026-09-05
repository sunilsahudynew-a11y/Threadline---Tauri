import { marked } from 'marked';
import TurndownService from 'turndown';

// Configure Turndown service for clean Markdown output
const turndownService = new TurndownService({
  headingStyle: 'atx',
  hr: '* * *',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '*'
});

// Custom rule for highlights: <mark class="...">text</mark> -> ==color:text== or ==text==
turndownService.addRule('highlight', {
  filter: ['mark'],
  replacement: (content, node) => {
    const el = node as HTMLElement;
    const className = el.className || '';
    if (className.includes('hl-mint')) {
      return `==mint:${content}==`;
    }
    if (className.includes('hl-rose')) {
      return `==rose:${content}==`;
    }
    if (className.includes('hl-blue')) {
      return `==blue:${content}==`;
    }
    if (className.includes('hl-purple')) {
      return `==purple:${content}==`;
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
  processed = processed.replace(/==yellow:(.*?)==/gi, '<mark class="hl-yellow">$1</mark>');
  processed = processed.replace(/==mint:(.*?)==/gi, '<mark class="hl-mint">$1</mark>');
  processed = processed.replace(/==rose:(.*?)==/gi, '<mark class="hl-rose">$1</mark>');
  processed = processed.replace(/==blue:(.*?)==/gi, '<mark class="hl-blue">$1</mark>');
  processed = processed.replace(/==purple:(.*?)==/gi, '<mark class="hl-purple">$1</mark>');
  // Standard highlight: ==text== -> <mark class="hl-yellow">text</mark>
  processed = processed.replace(/==(.*?)==/g, '<mark class="hl-yellow">$1</mark>');

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
    return md.trim();
  } catch (err) {
    console.error('Error converting HTML to markdown:', err);
    return html;
  }
}
