import { jsPDF } from 'jspdf';
import { Project, Scene, Chapter } from '../../types';
import {
  calculateBookLayout,
  BookPdfOptions,
  DEFAULT_BOOK_PDF_OPTIONS,
  TypesetBookModel
} from './bookTypesetter';

export { DEFAULT_BOOK_PDF_OPTIONS } from './bookTypesetter';
export type {
  BookPdfOptions,
  TrimSize,
  BookFontChoice,
  ChapterStyle,
  SceneBreakOrnament,
  NumberingPlacement,
  RunningHeaderStyle,
  LineSpacingChoice,
  FontSizeChoice,
  MarginChoice,
  TypesetBookModel,
  TypesetPage,
  TypesetBlock
} from './bookTypesetter';

export async function generateBookPdf(
  project: Project,
  scenes: Scene[],
  chapters?: Chapter[],
  options: Partial<BookPdfOptions> = {}
): Promise<jsPDF> {
  const book = calculateBookLayout(project, scenes, chapters, options);
  const { widthPt, heightPt, marginX, marginTop, marginBottom, contentWidth, gutterPt } = book.dimensions;
  const opts = book.options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: [widthPt, heightPt]
  });

  const font = opts.fontStyle;
  const primaryInk = '#1A1815';
  const mutedInk = '#5C5549';
  const accentInk = '#9C3A24';
  const lineInk = '#D4CEBF';

  // Helper to draw ornament
  const drawOrnament = (text: string, y: number, x = widthPt / 2) => {
    if (!text) return;
    doc.setFont(font, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(accentInk);
    doc.text(text, x, y, { align: 'center' });
  };

  book.pages.forEach((page, pageIdx) => {
    if (pageIdx > 0) {
      doc.addPage([widthPt, heightPt], 'portrait');
    }

    const isRecto = page.isRecto;
    // Binding gutter shifts: odd (recto) shifts right, even (verso) shifts left
    const leftMargin = marginX + (isRecto ? gutterPt : 0);
    const rightMargin = widthPt - marginX - (!isRecto ? gutterPt : 0);
    const printableWidth = rightMargin - leftMargin;

    // RUNNING HEADER (Chicago Manual: suppress on Cover, Copyright, Dedication, TOC, Chapter Openers)
    if (page.type === 'body' && page.headerText && opts.runningHeaders !== 'none') {
      doc.setFont(font, 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(mutedInk);
      doc.text(page.headerText, widthPt / 2, marginTop - 16, { align: 'center' });

      if (opts.headerDividerRule) {
        doc.setDrawColor(210, 204, 192);
        doc.setLineWidth(0.5);
        doc.line(leftMargin, marginTop - 10, rightMargin, marginTop - 10);
      }
    }

    // RUNNING FOOTER / PAGE NUMBER
    if (
      opts.pageNumberPlacement !== 'none' &&
      page.type !== 'cover' &&
      page.type !== 'copyright'
    ) {
      doc.setFont(font, 'normal');
      doc.setFontSize(9);
      doc.setTextColor(primaryInk);

      const numStr = `— ${page.pageNumber} —`;
      if (opts.pageNumberPlacement === 'bottom-center') {
        doc.text(numStr, widthPt / 2, heightPt - marginBottom + 24, { align: 'center' });
      } else if (opts.pageNumberPlacement === 'bottom-outer') {
        const posX = isRecto ? rightMargin : leftMargin;
        const align = isRecto ? 'right' : 'left';
        doc.text(String(page.pageNumber), posX, heightPt - marginBottom + 24, { align });
      } else if (opts.pageNumberPlacement === 'top-outer' && page.type === 'body') {
        const posX = isRecto ? rightMargin : leftMargin;
        const align = isRecto ? 'right' : 'left';
        doc.text(String(page.pageNumber), posX, marginTop - 16, { align });
      }
    }

    // RENDER PAGE BLOCKS
    let cursorY = marginTop + 10;

    page.blocks.forEach((block) => {
      switch (block.type) {
        case 'title-block': {
          cursorY = heightPt * 0.32;
          doc.setTextColor(primaryInk);
          doc.setFont(font, 'bold');
          doc.setFontSize(24);
          const titleLines = doc.splitTextToSize(project.title.toUpperCase(), printableWidth);
          doc.text(titleLines, widthPt / 2, cursorY, { align: 'center' });
          cursorY += titleLines.length * 28;

          // Decorative accent line
          doc.setDrawColor(156, 58, 36);
          doc.setLineWidth(1.2);
          doc.line(widthPt / 2 - 35, cursorY + 4, widthPt / 2 + 35, cursorY + 4);
          cursorY += 24;

          // Subtitle
          doc.setFont(font, 'italic');
          doc.setFontSize(11);
          doc.setTextColor(mutedInk);
          doc.text(block.text || 'A Novel', widthPt / 2, cursorY, { align: 'center' });
          cursorY += 40;

          // Author
          if (block.author) {
            doc.setFont(font, 'normal');
            doc.setFontSize(13);
            doc.setTextColor(primaryInk);
            doc.text(`BY ${block.author.toUpperCase()}`, widthPt / 2, cursorY, { align: 'center' });
          }

          // Imprint / Publisher at foot
          if (block.imprint) {
            doc.setFont(font, 'normal');
            doc.setFontSize(9);
            doc.setTextColor(mutedInk);
            doc.text(block.imprint.toUpperCase(), widthPt / 2, heightPt - marginBottom - 30, { align: 'center' });
          }
          if (block.year) {
            doc.setFont(font, 'normal');
            doc.setFontSize(8);
            doc.setTextColor('#8A8070');
            doc.text(block.year, widthPt / 2, heightPt - marginBottom - 16, { align: 'center' });
          }
          break;
        }

        case 'copyright-block': {
          cursorY = heightPt * 0.65;
          doc.setTextColor(mutedInk);
          doc.setFont(font, 'normal');
          doc.setFontSize(8.5);

          const copyrightLines = [
            `Published by ${block.imprint || 'Threadline Press'}`,
            `First Edition: ${block.year || new Date().getFullYear()}`,
            `Copyright © ${block.year || new Date().getFullYear()} by ${block.author}`,
            '',
            block.text || 'All rights reserved.',
            '',
            'This book is a work of fiction. Names, characters, places, and incidents are products of the author’s imagination or are used fictitiously.',
            '',
            'Composed and typeset in Threadline Manuscript Studio.'
          ];

          copyrightLines.forEach((line) => {
            const split = doc.splitTextToSize(line, printableWidth);
            doc.text(split, leftMargin, cursorY);
            cursorY += split.length * 12;
          });
          break;
        }

        case 'dedication-block': {
          cursorY = heightPt * 0.38;
          doc.setTextColor(primaryInk);
          doc.setFont(font, 'italic');
          doc.setFontSize(12);

          const split = doc.splitTextToSize(block.text || '', printableWidth * 0.85);
          doc.text(split, widthPt / 2, cursorY, { align: 'center' });
          break;
        }

        case 'toc-block': {
          cursorY = marginTop + 25;
          doc.setTextColor(primaryInk);
          doc.setFont(font, 'bold');
          doc.setFontSize(15);
          doc.text('CONTENTS', widthPt / 2, cursorY, { align: 'center' });
          cursorY += 18;

          drawOrnament('✦', cursorY);
          cursorY += 30;

          doc.setFont(font, 'normal');
          doc.setFontSize(10);

          (block.tocItems || []).forEach((item) => {
            if (cursorY > heightPt - marginBottom - 25) return;

            const label = `Chapter ${item.number}: ${item.title}`;
            const pageStr = `${item.page}`;

            doc.setTextColor(primaryInk);
            doc.text(label, leftMargin, cursorY);

            const labelW = doc.getTextWidth(label);
            const pageNumW = doc.getTextWidth(pageStr);
            const dotStart = leftMargin + labelW + 8;
            const dotEnd = rightMargin - pageNumW - 8;

            if (dotEnd > dotStart) {
              doc.setTextColor(lineInk);
              let dx = dotStart;
              while (dx < dotEnd) {
                doc.text('.', dx, cursorY);
                dx += 5;
              }
            }

            doc.setTextColor(accentInk);
            doc.text(pageStr, rightMargin, cursorY, { align: 'right' });
            cursorY += 19;
          });
          break;
        }

        case 'chapter-heading': {
          cursorY = marginTop + 40;

          // Chapter Numeral
          doc.setTextColor(accentInk);
          doc.setFont(font, 'normal');
          doc.setFontSize(11);
          doc.text(`C H A P T E R   ${block.numeralStr}`, widthPt / 2, cursorY, { align: 'center' });
          cursorY += 22;

          // Chapter Title
          doc.setTextColor(primaryInk);
          doc.setFont(font, 'bold');
          doc.setFontSize(17);
          const chapTitleLines = doc.splitTextToSize(block.title || '', printableWidth);
          doc.text(chapTitleLines, widthPt / 2, cursorY, { align: 'center' });
          cursorY += chapTitleLines.length * 20 + 8;

          // Subtitle / Act
          if (block.actOrPhase) {
            doc.setTextColor(mutedInk);
            doc.setFont(font, 'italic');
            doc.setFontSize(9.5);
            doc.text(block.actOrPhase, widthPt / 2, cursorY, { align: 'center' });
            cursorY += 16;
          }

          // Ornamental flourish
          drawOrnament(block.ornament || '✦', cursorY);
          cursorY += 32;
          break;
        }

        case 'scene-heading': {
          cursorY += 8;
          doc.setTextColor(primaryInk);
          doc.setFont(font, 'bold');
          doc.setFontSize(11);
          doc.text(block.title || '', leftMargin, cursorY);
          cursorY += 16;
          break;
        }

        case 'ornament': {
          cursorY += 8;
          drawOrnament(block.text || '*   *   *', cursorY);
          cursorY += 20;
          break;
        }

        case 'paragraph': {
          const bodySize = opts.fontSize === 'compact' ? 9.5 : opts.fontSize === 'large' ? 11.5 : 10.5;
          const bodyLineHeight = opts.fontSize === 'compact' ? 13 : opts.fontSize === 'large' ? 17 : 15;
          const spacingFactor = opts.lineSpacing === 'compact' ? 1.25 : opts.lineSpacing === 'generous' ? 1.75 : 1.5;
          const stepLine = bodyLineHeight * (spacingFactor / 1.5);

          const lines = block.lines || [];
          if (lines.length === 0) break;

          // Drop Cap handling for first paragraph in chapter
          if (block.dropCap && opts.dropCaps) {
            const dropChar = block.dropCap;
            const restWord = (block.restOfFirstWord || '').toUpperCase();

            // Draw large drop cap letter
            doc.setFont(font, 'bold');
            doc.setFontSize(bodySize * 2.8);
            doc.setTextColor(accentInk);
            doc.text(dropChar, leftMargin, cursorY + stepLine * 0.85);

            const dropCapWidth = doc.getTextWidth(dropChar) + 5;

            // Draw rest of first word in small caps
            doc.setFont(font, 'bold');
            doc.setFontSize(bodySize * 0.85);
            doc.setTextColor(primaryInk);

            // Draw first line adjacent to drop cap
            const firstLineWords = lines[0].split(/\s+/);
            const remainderOfFirstLine = firstLineWords.slice(1).join(' ');

            doc.text(restWord, leftMargin + dropCapWidth, cursorY);
            const restWordWidth = doc.getTextWidth(restWord) + 4;

            doc.setFont(font, 'normal');
            doc.setFontSize(bodySize);
            doc.text(remainderOfFirstLine, leftMargin + dropCapWidth + restWordWidth, cursorY);
            cursorY += stepLine;

            // Second line (if exists) indented by drop cap width
            if (lines.length > 1) {
              doc.text(lines[1], leftMargin + dropCapWidth, cursorY);
              cursorY += stepLine;
            }

            // Remaining lines flush left
            for (let i = 2; i < lines.length; i++) {
              doc.text(lines[i], leftMargin, cursorY);
              cursorY += stepLine;
            }
          } else {
            // Standard paragraph
            doc.setFont(font, 'normal');
            doc.setFontSize(bodySize);
            doc.setTextColor(primaryInk);

            lines.forEach((line, lIdx) => {
              // First line indent on subsequent paragraphs if enabled
              const isIndent = lIdx === 0 && !block.isFirstParagraph && opts.firstLineIndent;
              const posX = isIndent ? leftMargin + 16 : leftMargin;
              doc.text(line, posX, cursorY);
              cursorY += stepLine;
            });
          }

          cursorY += 4; // subtle paragraph separation
          break;
        }

        case 'acknowledgments-block': {
          cursorY = marginTop + 40;
          doc.setTextColor(primaryInk);
          doc.setFont(font, 'bold');
          doc.setFontSize(14);
          doc.text('ACKNOWLEDGMENTS', widthPt / 2, cursorY, { align: 'center' });
          cursorY += 24;

          drawOrnament('✦', cursorY);
          cursorY += 30;

          doc.setFont(font, 'normal');
          doc.setFontSize(10.5);
          doc.setTextColor(primaryInk);

          const split = doc.splitTextToSize(block.text || '', printableWidth);
          doc.text(split, leftMargin, cursorY);
          break;
        }
      }
    });
  });

  return doc;
}
