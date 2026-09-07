import { jsPDF } from 'jspdf';
import { Project, Scene, Chapter } from '../../types';
import { ensureChapters, getScenesForChapter } from '../../utils/chapterUtils';

export interface BookPdfOptions {
  pageSize: 'trade' | 'a5' | 'letter';
  fontStyle: 'times' | 'helvetica' | 'courier';
  includeTableOfContents: boolean;
  includeSceneTitles: boolean;
  includeCoverPage: boolean;
  authorName?: string;
}

export const DEFAULT_BOOK_PDF_OPTIONS: BookPdfOptions = {
  pageSize: 'trade',
  fontStyle: 'times',
  includeTableOfContents: true,
  includeSceneTitles: false, // Novels typically use scene breaks rather than scene subheadings
  includeCoverPage: true,
  authorName: ''
};

export async function generateBookPdf(
  project: Project,
  scenes: Scene[],
  chapters?: Chapter[],
  options: Partial<BookPdfOptions> = {}
): Promise<jsPDF> {
  const opts: BookPdfOptions = { ...DEFAULT_BOOK_PDF_OPTIONS, ...options };
  const effectiveChapters = ensureChapters(scenes, chapters);

  // Determine dimensions in points (72 points = 1 inch)
  // Trade 6"x9" = 432 x 648 pt
  let format: [number, number] | string = [432, 648];
  if (opts.pageSize === 'a5') {
    format = 'a5';
  } else if (opts.pageSize === 'letter') {
    format = 'letter';
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Margins
  const marginX = 46;
  const marginTop = 50;
  const marginBottom = 50;
  const contentWidth = pageWidth - marginX * 2;
  const contentHeight = pageHeight - marginTop - marginBottom;

  const font = opts.fontStyle;
  const primaryInk = '#1A1815';
  const mutedInk = '#635D52';
  const accentInk = '#9C3A24';

  const chapterStartPages: number[] = [];
  const tocEntries: { title: string; number: number; page: number }[] = [];

  let currentPageNumber = 1;

  // Helper: Draw decorative threadline knot/arc
  const drawOrnament = (y: number, text = '•   ✦   •') => {
    doc.setFont(font, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(accentInk);
    doc.text(text, pageWidth / 2, y, { align: 'center' });
  };

  // 1. COVER / TITLE PAGE
  if (opts.includeCoverPage) {
    doc.setTextColor(primaryInk);
    
    // Top spacing
    const titleY = pageHeight * 0.35;
    
    // Project Title
    doc.setFont(font, 'bold');
    doc.setFontSize(26);
    const titleLines = doc.splitTextToSize(project.title.toUpperCase(), contentWidth);
    doc.text(titleLines, pageWidth / 2, titleY, { align: 'center' });

    // Decorative line
    const titleHeight = titleLines.length * 30;
    doc.setDrawColor(180, 75, 50);
    doc.setLineWidth(1.2);
    doc.line(pageWidth / 2 - 40, titleY + titleHeight + 10, pageWidth / 2 + 40, titleY + titleHeight + 10);

    // Subtitle / Project Type
    doc.setFont(font, 'italic');
    doc.setFontSize(12);
    doc.setTextColor(mutedInk);
    const subtitle = project.type ? `A ${project.type}` : 'A Novel Manuscript';
    doc.text(subtitle, pageWidth / 2, titleY + titleHeight + 32, { align: 'center' });

    // Author
    if (opts.authorName) {
      doc.setFont(font, 'normal');
      doc.setFontSize(13);
      doc.setTextColor(primaryInk);
      doc.text(`BY ${opts.authorName.toUpperCase()}`, pageWidth / 2, titleY + titleHeight + 64, { align: 'center' });
    }

    // Genre / Premise metadata (bottom)
    if (project.genre) {
      doc.setFont(font, 'normal');
      doc.setFontSize(9);
      doc.setTextColor(mutedInk);
      doc.text(project.genre.toUpperCase(), pageWidth / 2, pageHeight - 90, { align: 'center' });
    }

    doc.setFont(font, 'normal');
    doc.setFontSize(8);
    doc.setTextColor('#8A8070');
    doc.text('COMPOSED IN THREADLINE MANUSCRIPT STUDIO', pageWidth / 2, pageHeight - 65, { align: 'center' });

    doc.addPage();
    currentPageNumber++;
  }

  // 2. TABLE OF CONTENTS PLACEHOLDER (if selected, we'll record page index)
  let tocPageIndex = -1;
  if (opts.includeTableOfContents) {
    tocPageIndex = doc.getNumberOfPages();
    chapterStartPages.push(tocPageIndex);
    // Leave blank for now, populate at the end after all page numbers are known!
    doc.addPage();
    currentPageNumber++;
  }

  // 3. CHAPTERS & PROSE CONTENT
  effectiveChapters.forEach((chap, chapIdx) => {
    // Each chapter opens on a clean fresh page
    if (doc.getNumberOfPages() > 0 && !(chapIdx === 0 && !opts.includeCoverPage && !opts.includeTableOfContents)) {
      // If we are not at start of doc
    }

    const currentDocPage = doc.getNumberOfPages();
    chapterStartPages.push(currentDocPage);
    tocEntries.push({
      number: chap.number,
      title: chap.title,
      page: currentDocPage
    });

    let cursorY = marginTop + 40;

    // Chapter Header (Classic book layout: Chapter numeral, then title)
    doc.setFont(font, 'normal');
    doc.setFontSize(11);
    doc.setTextColor(accentInk);
    doc.text(`C H A P T E R   ${chap.number}`, pageWidth / 2, cursorY, { align: 'center' });
    cursorY += 22;

    doc.setFont(font, 'bold');
    doc.setFontSize(18);
    doc.setTextColor(primaryInk);
    const chapTitleLines = doc.splitTextToSize(chap.title, contentWidth);
    doc.text(chapTitleLines, pageWidth / 2, cursorY, { align: 'center' });
    cursorY += chapTitleLines.length * 20 + 8;

    if (chap.actOrPhase) {
      doc.setFont(font, 'italic');
      doc.setFontSize(10);
      doc.setTextColor(mutedInk);
      doc.text(chap.actOrPhase, pageWidth / 2, cursorY, { align: 'center' });
      cursorY += 16;
    }

    // Small ornament below chapter heading
    drawOrnament(cursorY, '✦');
    cursorY += 32;

    // Get scenes for this chapter
    const chapScenes = getScenesForChapter(scenes, chap);

    chapScenes.forEach((s, sIdx) => {
      // Optional Scene Title
      if (opts.includeSceneTitles) {
        if (cursorY > pageHeight - marginBottom - 60) {
          doc.addPage();
          cursorY = marginTop + 20;
        }
        doc.setFont(font, 'bold');
        doc.setFontSize(12);
        doc.setTextColor(primaryInk);
        doc.text(s.title, marginX, cursorY);
        cursorY += 18;
      } else if (sIdx > 0) {
        // Scene break ornament between scenes
        if (cursorY > pageHeight - marginBottom - 50) {
          doc.addPage();
          cursorY = marginTop + 20;
        } else {
          cursorY += 10;
          drawOrnament(cursorY, '*   *   *');
          cursorY += 24;
        }
      }

      // Prose paragraphs
      const rawText = s.proseContent || '';
      const paragraphs = rawText
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      paragraphs.forEach((paragraph, pIdx) => {
        // Check if paragraph is an explicit markdown divider (e.g. * * * or ---)
        if (/^(\*|\-|_|\#)\s*(\*|\-|_|\#)\s*(\*|\-|_|\#)/.test(paragraph)) {
          if (cursorY > pageHeight - marginBottom - 40) {
            doc.addPage();
            cursorY = marginTop + 20;
          } else {
            drawOrnament(cursorY, '*   *   *');
            cursorY += 24;
          }
          return;
        }

        doc.setFont(font, 'normal');
        doc.setFontSize(10.5);
        doc.setTextColor(primaryInk);

        const lineHeight = 15;
        const lines = doc.splitTextToSize(paragraph, contentWidth);
        const paragraphHeight = lines.length * lineHeight;

        // Check if paragraph fits on current page
        if (cursorY + paragraphHeight > pageHeight - marginBottom) {
          // If paragraph is long, we can print lines that fit, then pagebreak
          for (let lIdx = 0; lIdx < lines.length; lIdx++) {
            if (cursorY + lineHeight > pageHeight - marginBottom) {
              doc.addPage();
              cursorY = marginTop + 15;
            }
            // Paragraph indent for first line of subsequent paragraphs (classic book format)
            const isFirstLine = lIdx === 0 && pIdx > 0 && !opts.includeSceneTitles;
            const lineX = isFirstLine ? marginX + 16 : marginX;
            doc.text(lines[lIdx], lineX, cursorY);
            cursorY += lineHeight;
          }
          cursorY += 6; // paragraph spacing
        } else {
          // Fits on page
          lines.forEach((line: string, lIdx: number) => {
            const isFirstLine = lIdx === 0 && pIdx > 0 && !opts.includeSceneTitles;
            const lineX = isFirstLine ? marginX + 16 : marginX;
            doc.text(line, lineX, cursorY);
            cursorY += lineHeight;
          });
          cursorY += 6;
        }
      });
    });

    // Add page break for the next chapter (unless this is the last chapter)
    if (chapIdx < effectiveChapters.length - 1) {
      doc.addPage();
    }
  });

  // 4. POPULATE TABLE OF CONTENTS (if enabled)
  if (opts.includeTableOfContents && tocPageIndex > 0) {
    doc.setPage(tocPageIndex);
    let tocY = marginTop + 30;

    doc.setFont(font, 'bold');
    doc.setFontSize(16);
    doc.setTextColor(primaryInk);
    doc.text('CONTENTS', pageWidth / 2, tocY, { align: 'center' });
    tocY += 20;

    drawOrnament(tocY, '✦');
    tocY += 30;

    doc.setFont(font, 'normal');
    doc.setFontSize(10.5);

    tocEntries.forEach((entry) => {
      if (tocY > pageHeight - marginBottom - 30) {
        return; // truncate if exceeds 1 page for now
      }

      const chapterLabel = `Chapter ${entry.number}: ${entry.title}`;
      const pageStr = `${entry.page}`;

      doc.setTextColor(primaryInk);
      doc.text(chapterLabel, marginX, tocY);

      // Dot leader
      const labelWidth = doc.getTextWidth(chapterLabel);
      const pageNumWidth = doc.getTextWidth(pageStr);
      const dotStartX = marginX + labelWidth + 8;
      const dotEndX = pageWidth - marginX - pageNumWidth - 8;

      if (dotEndX > dotStartX) {
        doc.setTextColor('#B8B0A2');
        let dotX = dotStartX;
        while (dotX < dotEndX) {
          doc.text('.', dotX, tocY);
          dotX += 5;
        }
      }

      doc.setTextColor(accentInk);
      doc.text(pageStr, pageWidth - marginX, tocY, { align: 'right' });
      tocY += 20;
    });
  }

  // 5. RUNNING HEADERS & FOOTERS (Page numbers)
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    // Skip headers & footers on Cover page, TOC page, and chapter opening pages
    if (opts.includeCoverPage && p === 1) continue;
    if (chapterStartPages.includes(p)) continue;

    doc.setPage(p);

    // Running Header (alternate project title / chapter title)
    doc.setFont(font, 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(mutedInk);

    const isEven = p % 2 === 0;
    if (isEven) {
      doc.text(project.title.toUpperCase(), pageWidth / 2, marginTop - 18, { align: 'center' });
    } else {
      // Find active chapter title for this page
      const activeEntry = [...tocEntries].reverse().find((e) => e.page <= p);
      const headerTitle = activeEntry ? `CHAPTER ${activeEntry.number}: ${activeEntry.title.toUpperCase()}` : project.title.toUpperCase();
      doc.text(headerTitle, pageWidth / 2, marginTop - 18, { align: 'center' });
    }

    // Running Footer (Centered Page Number)
    doc.setFont(font, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(primaryInk);
    doc.text(`— ${p} —`, pageWidth / 2, pageHeight - marginBottom + 24, { align: 'center' });
  }

  return doc;
}
