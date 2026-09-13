/**
 * Utility to sanitize pasted clipboard content from external sources (Word, Google Docs, websites, etc.).
 * Strips all inline font families, font sizes, colors, background styles, and foreign wrapper tags,
 * ensuring pasted text strictly adopts the editor's typography and manuscript styling.
 */

export interface SanitizedPasteResult {
  cleanHtml: string;
  isInline: boolean;
  plainText: string;
}

/**
 * Strips all font, size, color, and external layout styling from HTML while preserving
 * basic semantic structure (bold, italics, links, headings, paragraphs, lists).
 */
export function sanitizePastedContent(rawHtml: string, rawText: string): SanitizedPasteResult {
  // Normalize non-breaking spaces (\u00A0) to standard spaces to prevent line breaking failure and horizontal overflow
  const plainText = (rawText || '').replace(/\u00A0/g, ' ');
  const trimmedText = plainText.trim();
  const isSingleLine = !trimmedText.includes('\n');

  if (!rawHtml || !rawHtml.trim()) {
    // Only plain text available
    if (isSingleLine) {
      return {
        cleanHtml: escapeHtml(plainText),
        isInline: true,
        plainText
      };
    }

    // Convert multi-line plain text into clean paragraphs, stripping leading indents (4 spaces / tabs) so markdown doesn't parse them as Courier code blocks
    const paragraphs = plainText
      .split(/\n{2,}/)
      .map((para) => para.replace(/^[ \t]{1,8}/, '').trim())
      .filter(Boolean);

    if (paragraphs.length <= 1 && isSingleLine) {
      return {
        cleanHtml: escapeHtml(plainText.replace(/^[ \t]{1,8}/, '')),
        isInline: true,
        plainText: plainText.replace(/^[ \t]{1,8}/, '')
      };
    }

    const cleanHtml = paragraphs
      .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
      .join('');

    return {
      cleanHtml,
      isInline: false,
      plainText
    };
  }

  // Parse HTML
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, 'text/html');

    // 1. Remove non-content / dangerous / metadata tags
    const blockedTags = [
      'script',
      'style',
      'meta',
      'link',
      'xml',
      'title',
      'svg',
      'object',
      'embed',
      'iframe',
      'applet',
      'head'
    ];
    doc.body.querySelectorAll(blockedTags.join(',')).forEach((el) => el.remove());

    // 2. Unwrap Google Docs wrapper <b style="font-weight:normal" id="docs-internal-guid-..."> so it does not make the whole document bold
    doc.body.querySelectorAll('b, strong').forEach((bEl) => {
      const style = bEl.getAttribute('style') || '';
      const id = bEl.getAttribute('id') || '';
      if (
        style.includes('font-weight:normal') ||
        style.includes('font-weight: 400') ||
        id.startsWith('docs-internal-guid')
      ) {
        while (bEl.firstChild) {
          bEl.parentNode?.insertBefore(bEl.firstChild, bEl);
        }
        bEl.remove();
      }
    });

    // 3. Convert <pre> elements (often created when copying Courier/monospaced text) into standard narrative <p> paragraphs
    doc.body.querySelectorAll('pre').forEach((preEl) => {
      const text = preEl.textContent || '';
      const lines = text
        .split(/\n+/)
        .map((l) => l.replace(/^[ \t]{1,8}/, '').trim())
        .filter(Boolean);
      const frag = doc.createDocumentFragment();
      if (lines.length === 0) {
        const p = doc.createElement('p');
        p.innerHTML = '<br>';
        frag.appendChild(p);
      } else {
        lines.forEach((line) => {
          const p = doc.createElement('p');
          p.textContent = line;
          frag.appendChild(p);
        });
      }
      preEl.replaceWith(frag);
    });

    // 4. Unwrap any code/monospace tags (code, tt, samp, kbd, var) to clean text so they adopt the editor's Serif typography
    doc.body.querySelectorAll('code, tt, samp, kbd, var').forEach((el) => {
      while (el.firstChild) {
        el.parentNode?.insertBefore(el.firstChild, el);
      }
      el.remove();
    });

    // 5. Remove HTML comments
    const removeComments = (node: Node) => {
      let child = node.firstChild;
      while (child) {
        const next = child.nextSibling;
        if (child.nodeType === Node.COMMENT_NODE) {
          node.removeChild(child);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          removeComments(child);
        }
        child = next;
      }
    };
    removeComments(doc.body);

    // 6. Unwrap <font> tags (including <font face="Courier">) to their child nodes
    doc.body.querySelectorAll('font').forEach((fontEl) => {
      while (fontEl.firstChild) {
        fontEl.parentNode?.insertBefore(fontEl.firstChild, fontEl);
      }
      fontEl.remove();
    });

    // 7. Normalize all non-breaking spaces (\u00A0) in text nodes to standard spaces
    const normalizeNodeSpaces = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent && node.textContent.includes('\u00A0')) {
          node.textContent = node.textContent.replace(/\u00A0/g, ' ');
        }
      } else {
        node.childNodes.forEach(normalizeNodeSpaces);
      }
    };
    normalizeNodeSpaces(doc.body);

    // 8. Convert block <div> containers to <p> paragraphs so narrative formatting is clean
    doc.body.querySelectorAll('div').forEach((divEl) => {
      const p = doc.createElement('p');
      while (divEl.firstChild) {
        p.appendChild(divEl.firstChild);
      }
      divEl.replaceWith(p);
    });

    // 9. Strip presentational, font, line-spacing, and layout attributes from all elements
    const elements = doc.body.querySelectorAll('*');
    elements.forEach((el) => {
      // Strip style attributes completely (kills foreign font-family, font-size, line-height, etc.)
      el.removeAttribute('style');

      // Strip presentational attributes
      el.removeAttribute('face');
      el.removeAttribute('size');
      el.removeAttribute('color');
      el.removeAttribute('bgcolor');
      el.removeAttribute('align');
      el.removeAttribute('valign');
      el.removeAttribute('width');
      el.removeAttribute('height');
      el.removeAttribute('nowrap');
      el.removeAttribute('border');
      el.removeAttribute('cellspacing');
      el.removeAttribute('cellpadding');
      el.removeAttribute('id');
      el.removeAttribute('lang');
      el.removeAttribute('dir');

      // Class handling: keep only Threadline's hl-* mark classes if internal text was copied
      if (el.tagName.toLowerCase() === 'mark') {
        const cls = el.getAttribute('class') || '';
        const allowed = cls
          .split(' ')
          .filter((c) => c.startsWith('hl-'))
          .join(' ');
        if (allowed) {
          el.setAttribute('class', allowed);
        } else {
          el.removeAttribute('class');
        }
      } else {
        el.removeAttribute('class');
      }

      // Convert or unwrap non-semantic <span>
      if (el.tagName.toLowerCase() === 'span' && el.attributes.length === 0) {
        while (el.firstChild) {
          el.parentNode?.insertBefore(el.firstChild, el);
        }
        el.remove();
      }
    });

    // 10. Strip leading tabs/indents from paragraph starts so markdown doesn't interpret them as code blocks
    doc.body.querySelectorAll('p').forEach((pEl) => {
      if (pEl.firstChild && pEl.firstChild.nodeType === Node.TEXT_NODE) {
        pEl.firstChild.textContent = (pEl.firstChild.textContent || '').replace(/^[ \t]{1,8}/, '');
      }
    });

    // 5. Determine if the content is purely inline (single line, no block elements)
    const blockTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'ul', 'ol', 'li', 'hr', 'table', 'pre', 'div'];
    const hasBlockElements = Array.from(doc.body.querySelectorAll(blockTags.join(','))).length > 0;

    // If single line or only a single paragraph with no other blocks
    if (isSingleLine || (!hasBlockElements && !trimmedText.includes('\n'))) {
      // If wrapped in a single <p> or <div>, unwrap it for seamless inline insertion
      const directChildren = Array.from(doc.body.childNodes).filter(
        (n) => n.nodeType === Node.ELEMENT_NODE || (n.nodeType === Node.TEXT_NODE && (n.textContent || '').trim().length > 0)
      );

      if (directChildren.length === 1 && directChildren[0].nodeType === Node.ELEMENT_NODE) {
        const singleEl = directChildren[0] as HTMLElement;
        const tag = singleEl.tagName.toLowerCase();
        if (tag === 'p' || tag === 'div') {
          return {
            cleanHtml: singleEl.innerHTML.trim(),
            isInline: true,
            plainText
          };
        }
      }

      return {
        cleanHtml: doc.body.innerHTML.trim() || escapeHtml(plainText),
        isInline: true,
        plainText
      };
    }

    // Multiline / block content:
    // If doc.body contains bare text nodes directly alongside blocks, wrap them cleanly
    const cleanHtml = doc.body.innerHTML.trim();

    return {
      cleanHtml: cleanHtml || escapeHtml(plainText),
      isInline: false,
      plainText
    };
  } catch (err) {
    console.error('Error sanitizing pasted HTML:', err);
    // Safe fallback to escaped plain text
    return {
      cleanHtml: escapeHtml(plainText),
      isInline: isSingleLine,
      plainText
    };
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
