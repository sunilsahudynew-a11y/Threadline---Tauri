import { Project, Scene, Chapter } from '../../types';
import { ensureChapters, getScenesForChapter } from '../../utils/chapterUtils';

export type TrimSize = 'trade' | 'digest' | 'mass-market' | 'a5' | 'letter' | 'royal';
export type BookFontChoice = 'times' | 'helvetica' | 'courier';
export type ChapterStyle = 'classic-centered' | 'modern-clean' | 'ornamental-fleuron' | 'bold-editorial';
export type SceneBreakOrnament = 'asterism' | 'fleuron' | 'diamond' | 'line' | 'blank';
export type NumberingPlacement = 'bottom-center' | 'bottom-outer' | 'top-outer' | 'none';
export type RunningHeaderStyle = 'alternating' | 'author-title' | 'chapter-only' | 'none';
export type LineSpacingChoice = 'compact' | 'standard' | 'generous';
export type FontSizeChoice = 'compact' | 'standard' | 'large';
export type MarginChoice = 'compact' | 'standard' | 'generous';

export interface BookPdfOptions {
  pageSize: TrimSize;
  fontStyle: BookFontChoice;
  fontSize: FontSizeChoice;
  lineSpacing: LineSpacingChoice;
  textAlign: 'justified' | 'left';
  firstLineIndent: boolean;
  dropCaps: boolean;
  
  // Chapter & Scene styling
  chapterStyle: ChapterStyle;
  numeralStyle: 'words' | 'roman' | 'arabic';
  includeSceneTitles: boolean;
  sceneBreakOrnament: SceneBreakOrnament;
  
  // Headers & Footers
  runningHeaders: RunningHeaderStyle;
  headerDividerRule: boolean;
  pageNumberPlacement: NumberingPlacement;
  
  // Margins & Geometry
  marginSize: MarginChoice;
  bindingGutter: boolean;
  
  // Front Matter
  includeCoverPage: boolean;
  authorName?: string;
  imprintName?: string;
  publicationYear?: string;
  includeCopyright: boolean;
  copyrightText?: string;
  includeDedication: boolean;
  dedicationText?: string;
  includeTableOfContents: boolean;
  
  // Back Matter
  includeAcknowledgments: boolean;
  acknowledgmentsText?: string;
  
  // Polish
  smartQuotes: boolean;
  paperTint: 'cream' | 'white' | 'antique';
}

export const DEFAULT_BOOK_PDF_OPTIONS: BookPdfOptions = {
  pageSize: 'trade',
  fontStyle: 'times',
  fontSize: 'standard',
  lineSpacing: 'standard',
  textAlign: 'justified',
  firstLineIndent: true,
  dropCaps: true,
  chapterStyle: 'classic-centered',
  numeralStyle: 'words',
  includeSceneTitles: false,
  sceneBreakOrnament: 'asterism',
  runningHeaders: 'alternating',
  headerDividerRule: false,
  pageNumberPlacement: 'bottom-center',
  marginSize: 'standard',
  bindingGutter: true,
  includeCoverPage: true,
  authorName: '',
  imprintName: 'Threadline Press',
  publicationYear: new Date().getFullYear().toString(),
  includeCopyright: true,
  copyrightText: 'All rights reserved. No part of this publication may be reproduced, distributed, or transmitted in any form without prior written permission of the author.',
  includeDedication: true,
  dedicationText: 'For all who build worlds out of quiet rooms.',
  includeTableOfContents: true,
  includeAcknowledgments: false,
  acknowledgmentsText: 'Special gratitude to the early readers, editors, and fellow scribes who guided this manuscript to completion.',
  smartQuotes: true,
  paperTint: 'cream'
};

export interface TypesetBlock {
  type:
    | 'title-block'
    | 'copyright-block'
    | 'dedication-block'
    | 'toc-block'
    | 'chapter-heading'
    | 'scene-heading'
    | 'ornament'
    | 'paragraph'
    | 'acknowledgments-block';
  text?: string;
  lines?: string[];
  number?: number;
  numeralStr?: string;
  title?: string;
  actOrPhase?: string;
  ornament?: string;
  isFirstParagraph?: boolean;
  dropCap?: string;
  restOfFirstWord?: string;
  tocItems?: { number: number; title: string; page: number }[];
  author?: string;
  imprint?: string;
  year?: string;
}

export interface TypesetPage {
  pageNumber: number;
  isRecto: boolean; // odd page (right side)
  isVerso: boolean; // even page (left side)
  type: 'cover' | 'copyright' | 'dedication' | 'toc' | 'chapter-opener' | 'body' | 'acknowledgments';
  chapterNumber?: number;
  chapterTitle?: string;
  headerText?: string;
  showHeaderRule?: boolean;
  footerText?: string;
  blocks: TypesetBlock[];
}

export interface TypesetBookModel {
  pages: TypesetPage[];
  tocEntries: { number: number; title: string; page: number }[];
  stats: {
    totalPages: number;
    totalWords: number;
    totalChapters: number;
  };
  dimensions: {
    widthPt: number;
    heightPt: number;
    marginX: number;
    marginTop: number;
    marginBottom: number;
    contentWidth: number;
    contentHeight: number;
    gutterPt: number;
  };
  options: BookPdfOptions;
}

// Convert numbers to Roman numerals
export function toRomanNumeral(num: number): string {
  const lookup: { [key: string]: number } = {
    M: 1000,
    CM: 900,
    D: 500,
    CD: 400,
    C: 100,
    XC: 90,
    L: 50,
    XL: 40,
    X: 10,
    IX: 9,
    V: 5,
    IV: 4,
    I: 1
  };
  let roman = '';
  for (const i in lookup) {
    while (num >= lookup[i]) {
      roman += i;
      num -= lookup[i];
    }
  }
  return roman || 'I';
}

// Convert numbers to English words (1-50)
const WORDS_MAP = [
  '', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN',
  'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN',
  'EIGHTEEN', 'NINETEEN', 'TWENTY', 'TWENTY-ONE', 'TWENTY-TWO', 'TWENTY-THREE',
  'TWENTY-FOUR', 'TWENTY-FIVE', 'TWENTY-SIX', 'TWENTY-SEVEN', 'TWENTY-EIGHT',
  'TWENTY-NINE', 'THIRTY', 'THIRTY-ONE', 'THIRTY-TWO', 'THIRTY-THREE', 'THIRTY-FOUR',
  'THIRTY-FIVE', 'THIRTY-SIX', 'THIRTY-SEVEN', 'THIRTY-EIGHT', 'THIRTY-NINE', 'FORTY'
];

export function toWordNumeral(num: number): string {
  if (num > 0 && num < WORDS_MAP.length) {
    return WORDS_MAP[num];
  }
  return String(num);
}

// Typographic curly quotes and em-dashes
export function applySmartQuotes(text: string, enabled: boolean): string {
  if (!text || !enabled) return text;
  return text
    .replace(/---/g, '—')
    .replace(/--/g, '—')
    .replace(/(^|[-\u2014\s(\["])'/g, '$1‘')
    .replace(/'/g, '’')
    .replace(/(^|[-\u2014\s(\["])"/g, '$1“')
    .replace(/"/g, '”');
}

// Get Trim Dimensions in Points (72 points = 1 inch)
export function getTrimDimensions(trim: TrimSize): { widthPt: number; heightPt: number } {
  switch (trim) {
    case 'trade':
      return { widthPt: 432, heightPt: 648 }; // 6" x 9"
    case 'digest':
      return { widthPt: 396, heightPt: 612 }; // 5.5" x 8.5"
    case 'mass-market':
      return { widthPt: 306, heightPt: 495 }; // 4.25" x 6.87"
    case 'a5':
      return { widthPt: 420, heightPt: 595 }; // 148 x 210 mm
    case 'letter':
      return { widthPt: 612, heightPt: 792 }; // 8.5" x 11"
    case 'royal':
      return { widthPt: 442, heightPt: 663 }; // 6.14" x 9.21"
    default:
      return { widthPt: 432, heightPt: 648 };
  }
}

// Get Margin values in Points
export function getMarginValues(margin: MarginChoice): { marginX: number; marginTop: number; marginBottom: number } {
  switch (margin) {
    case 'compact':
      return { marginX: 36, marginTop: 42, marginBottom: 42 };
    case 'generous':
      return { marginX: 58, marginTop: 60, marginBottom: 60 };
    case 'standard':
    default:
      return { marginX: 46, marginTop: 50, marginBottom: 50 };
  }
}

// Ornament string helper
export function getOrnamentGlyph(ornament: SceneBreakOrnament): string {
  switch (ornament) {
    case 'asterism':
      return '*   *   *';
    case 'fleuron':
      return '❦';
    case 'diamond':
      return '✦   ✧   ✦';
    case 'line':
      return '— — —';
    case 'blank':
    default:
      return '';
  }
}

/**
 * Calculates a complete typeset book model with real pagination, front matter,
 * running headers, table of contents, and scene breaks.
 */
export function calculateBookLayout(
  project: Project,
  scenes: Scene[],
  chapters?: Chapter[],
  options: Partial<BookPdfOptions> = {}
): TypesetBookModel {
  const opts: BookPdfOptions = { ...DEFAULT_BOOK_PDF_OPTIONS, ...options };
  const effectiveChapters = ensureChapters(scenes, chapters);
  const { widthPt, heightPt } = getTrimDimensions(opts.pageSize);
  const { marginX, marginTop, marginBottom } = getMarginValues(opts.marginSize);
  const gutterPt = opts.bindingGutter ? 12 : 0;
  const contentWidth = widthPt - marginX * 2 - gutterPt;
  const contentHeight = heightPt - marginTop - marginBottom;

  const pages: TypesetPage[] = [];
  const tocEntries: { number: number; title: string; page: number }[] = [];

  let currentPageNumber = 1;

  const isRecto = (page: number) => page % 2 !== 0;

  // Approximate character-width and lines per page capacity
  // 10.5pt font averages ~70 characters per line in trade width (~340pt)
  const avgCharsPerLine = Math.max(35, Math.floor(contentWidth / 5.2));
  const ptLineHeight = opts.fontSize === 'compact' ? 13 : opts.fontSize === 'large' ? 17 : 15;
  const spacingMultiplier = opts.lineSpacing === 'compact' ? 1.25 : opts.lineSpacing === 'generous' ? 1.75 : 1.5;
  const effectiveLineHeight = ptLineHeight * (spacingMultiplier / 1.5);
  const maxLinesPerPage = Math.max(18, Math.floor(contentHeight / effectiveLineHeight));

  const authorName = opts.authorName || (project.protagonist ? `Author of ${project.title}` : 'Threadline Author');

  // 1. COVER / TITLE PAGE
  if (opts.includeCoverPage) {
    pages.push({
      pageNumber: currentPageNumber,
      isRecto: isRecto(currentPageNumber),
      isVerso: !isRecto(currentPageNumber),
      type: 'cover',
      blocks: [
        {
          type: 'title-block',
          title: project.title,
          text: project.type ? `A ${project.type}` : 'A Novel Manuscript',
          author: authorName,
          imprint: opts.imprintName || 'Threadline Press',
          year: opts.publicationYear || new Date().getFullYear().toString()
        }
      ]
    });
    currentPageNumber++;
  }

  // 2. COPYRIGHT PAGE (Verso, usually page 2 or facing Title)
  if (opts.includeCopyright) {
    pages.push({
      pageNumber: currentPageNumber,
      isRecto: isRecto(currentPageNumber),
      isVerso: !isRecto(currentPageNumber),
      type: 'copyright',
      blocks: [
        {
          type: 'copyright-block',
          title: project.title,
          author: authorName,
          imprint: opts.imprintName,
          year: opts.publicationYear,
          text: opts.copyrightText
        }
      ]
    });
    currentPageNumber++;
  }

  // 3. DEDICATION / EPIGRAPH PAGE
  if (opts.includeDedication && opts.dedicationText) {
    // Dedications in traditional publishing usually sit on a Recto (odd) page
    if (currentPageNumber % 2 === 0) {
      // Add blank verso page before dedication if strictly book-mirroring
    }
    pages.push({
      pageNumber: currentPageNumber,
      isRecto: isRecto(currentPageNumber),
      isVerso: !isRecto(currentPageNumber),
      type: 'dedication',
      blocks: [
        {
          type: 'dedication-block',
          text: applySmartQuotes(opts.dedicationText, opts.smartQuotes)
        }
      ]
    });
    currentPageNumber++;
  }

  // 4. TABLE OF CONTENTS PLACEHOLDER
  let tocPageIndex = -1;
  if (opts.includeTableOfContents) {
    tocPageIndex = pages.length; // Index in array
    pages.push({
      pageNumber: currentPageNumber,
      isRecto: isRecto(currentPageNumber),
      isVerso: !isRecto(currentPageNumber),
      type: 'toc',
      blocks: [] // Will populate after chapter page numbers are known
    });
    currentPageNumber++;
  }

  // 5. CHAPTERS & PROSE CONTENT
  effectiveChapters.forEach((chap) => {
    // In traditional fine book publishing, chapters open on a fresh page
    const chapterStartPage = currentPageNumber;

    // Numeral string
    let numStr = String(chap.number);
    if (opts.numeralStyle === 'roman') {
      numStr = toRomanNumeral(chap.number);
    } else if (opts.numeralStyle === 'words') {
      numStr = toWordNumeral(chap.number);
    }

    tocEntries.push({
      number: chap.number,
      title: chap.title,
      page: chapterStartPage
    });

    const chapScenes = getScenesForChapter(scenes, chap);

    // Collect all paragraphs and scene breaks for this chapter
    const rawItems: { type: 'paragraph' | 'scene-break' | 'scene-title'; text: string; isFirstInChapter?: boolean }[] = [];
    let isFirstChapPara = true;

    chapScenes.forEach((scene, sIdx) => {
      if (opts.includeSceneTitles) {
        rawItems.push({ type: 'scene-title', text: scene.title });
      } else if (sIdx > 0) {
        rawItems.push({ type: 'scene-break', text: getOrnamentGlyph(opts.sceneBreakOrnament) });
      }

      const text = applySmartQuotes(scene.proseContent || '', opts.smartQuotes);
      const paras = text
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      paras.forEach((p) => {
        // Check for markdown horizontal divider
        if (/^(\*|\-|_|\#)\s*(\*|\-|_|\#)\s*(\*|\-|_|\#)/.test(p)) {
          rawItems.push({ type: 'scene-break', text: getOrnamentGlyph(opts.sceneBreakOrnament) });
        } else {
          rawItems.push({
            type: 'paragraph',
            text: p,
            isFirstInChapter: isFirstChapPara
          });
          isFirstChapPara = false;
        }
      });
    });

    // CHAPTER OPENER PAGE
    // Chapter opening pages have no running header (Chicago Manual of Style)
    let currentLinesCount = 0;
    const openerHeadingLines = 8; // reserved space for Chapter numeral, title, and ornament
    currentLinesCount += openerHeadingLines;

    let activePageBlocks: TypesetBlock[] = [
      {
        type: 'chapter-heading',
        number: chap.number,
        numeralStr: numStr,
        title: chap.title,
        actOrPhase: chap.actOrPhase,
        ornament: getOrnamentGlyph(opts.sceneBreakOrnament)
      }
    ];

    rawItems.forEach((item) => {
      if (item.type === 'scene-break') {
        const breakHeight = 3; // lines
        if (currentLinesCount + breakHeight > maxLinesPerPage) {
          // Push current page
          pages.push({
            pageNumber: currentPageNumber,
            isRecto: isRecto(currentPageNumber),
            isVerso: !isRecto(currentPageNumber),
            type: activePageBlocks.some((b) => b.type === 'chapter-heading') ? 'chapter-opener' : 'body',
            chapterNumber: chap.number,
            chapterTitle: chap.title,
            headerText: getHeaderText(currentPageNumber, project.title, chap.title, authorName, opts.runningHeaders),
            showHeaderRule: opts.headerDividerRule,
            footerText: getFooterText(currentPageNumber, opts.pageNumberPlacement),
            blocks: activePageBlocks
          });
          currentPageNumber++;
          activePageBlocks = [];
          currentLinesCount = 0;
        } else {
          activePageBlocks.push({
            type: 'ornament',
            text: item.text
          });
          currentLinesCount += breakHeight;
        }
      } else if (item.type === 'scene-title') {
        const titleHeight = 3;
        if (currentLinesCount + titleHeight > maxLinesPerPage) {
          pages.push({
            pageNumber: currentPageNumber,
            isRecto: isRecto(currentPageNumber),
            isVerso: !isRecto(currentPageNumber),
            type: activePageBlocks.some((b) => b.type === 'chapter-heading') ? 'chapter-opener' : 'body',
            chapterNumber: chap.number,
            chapterTitle: chap.title,
            headerText: getHeaderText(currentPageNumber, project.title, chap.title, authorName, opts.runningHeaders),
            showHeaderRule: opts.headerDividerRule,
            footerText: getFooterText(currentPageNumber, opts.pageNumberPlacement),
            blocks: activePageBlocks
          });
          currentPageNumber++;
          activePageBlocks = [];
          currentLinesCount = 0;
        }
        activePageBlocks.push({
          type: 'scene-heading',
          title: item.text
        });
        currentLinesCount += titleHeight;
      } else if (item.type === 'paragraph') {
        // Break paragraph into lines
        const paraLines = wrapTextIntoLines(item.text, avgCharsPerLine);
        let dropCap: string | undefined;
        let restOfFirstWord: string | undefined;

        if (item.isFirstInChapter && opts.dropCaps && item.text.length > 0) {
          const firstChar = item.text[0];
          const words = item.text.split(/\s+/);
          dropCap = firstChar.toUpperCase();
          restOfFirstWord = words[0].slice(1);
        }

        let remainingLines = [...paraLines];

        while (remainingLines.length > 0) {
          const availableLines = maxLinesPerPage - currentLinesCount;

          if (availableLines <= 2 && remainingLines.length > 2) {
            // Avoid awkward 1-line orphan at bottom
            pages.push({
              pageNumber: currentPageNumber,
              isRecto: isRecto(currentPageNumber),
              isVerso: !isRecto(currentPageNumber),
              type: activePageBlocks.some((b) => b.type === 'chapter-heading') ? 'chapter-opener' : 'body',
              chapterNumber: chap.number,
              chapterTitle: chap.title,
              headerText: getHeaderText(currentPageNumber, project.title, chap.title, authorName, opts.runningHeaders),
              showHeaderRule: opts.headerDividerRule,
              footerText: getFooterText(currentPageNumber, opts.pageNumberPlacement),
              blocks: activePageBlocks
            });
            currentPageNumber++;
            activePageBlocks = [];
            currentLinesCount = 0;
            continue;
          }

          const takeCount = Math.min(availableLines, remainingLines.length);
          const chunkLines = remainingLines.slice(0, takeCount);
          remainingLines = remainingLines.slice(takeCount);

          activePageBlocks.push({
            type: 'paragraph',
            lines: chunkLines,
            text: chunkLines.join(' '),
            isFirstParagraph: item.isFirstInChapter && chunkLines === paraLines,
            dropCap: chunkLines === paraLines ? dropCap : undefined,
            restOfFirstWord: chunkLines === paraLines ? restOfFirstWord : undefined
          });

          currentLinesCount += chunkLines.length + 0.5; // slight spacing after paragraph

          if (remainingLines.length > 0) {
            pages.push({
              pageNumber: currentPageNumber,
              isRecto: isRecto(currentPageNumber),
              isVerso: !isRecto(currentPageNumber),
              type: activePageBlocks.some((b) => b.type === 'chapter-heading') ? 'chapter-opener' : 'body',
              chapterNumber: chap.number,
              chapterTitle: chap.title,
              headerText: getHeaderText(currentPageNumber, project.title, chap.title, authorName, opts.runningHeaders),
              showHeaderRule: opts.headerDividerRule,
              footerText: getFooterText(currentPageNumber, opts.pageNumberPlacement),
              blocks: activePageBlocks
            });
            currentPageNumber++;
            activePageBlocks = [];
            currentLinesCount = 0;
          }
        }
      }
    });

    if (activePageBlocks.length > 0) {
      pages.push({
        pageNumber: currentPageNumber,
        isRecto: isRecto(currentPageNumber),
        isVerso: !isRecto(currentPageNumber),
        type: activePageBlocks.some((b) => b.type === 'chapter-heading') ? 'chapter-opener' : 'body',
        chapterNumber: chap.number,
        chapterTitle: chap.title,
        headerText: getHeaderText(currentPageNumber, project.title, chap.title, authorName, opts.runningHeaders),
        showHeaderRule: opts.headerDividerRule,
        footerText: getFooterText(currentPageNumber, opts.pageNumberPlacement),
        blocks: activePageBlocks
      });
      currentPageNumber++;
    }
  });

  // 6. POPULATE TOC PAGE NOW THAT CHAPTER PAGE NUMBERS ARE EXACT
  if (opts.includeTableOfContents && tocPageIndex >= 0 && pages[tocPageIndex]) {
    pages[tocPageIndex].blocks = [
      {
        type: 'toc-block',
        title: 'CONTENTS',
        ornament: getOrnamentGlyph(opts.sceneBreakOrnament),
        tocItems: tocEntries
      }
    ];
  }

  // 7. BACK MATTER: ACKNOWLEDGMENTS
  if (opts.includeAcknowledgments && opts.acknowledgmentsText) {
    pages.push({
      pageNumber: currentPageNumber,
      isRecto: isRecto(currentPageNumber),
      isVerso: !isRecto(currentPageNumber),
      type: 'acknowledgments',
      headerText: 'ACKNOWLEDGMENTS',
      footerText: getFooterText(currentPageNumber, opts.pageNumberPlacement),
      blocks: [
        {
          type: 'acknowledgments-block',
          title: 'ACKNOWLEDGMENTS',
          text: applySmartQuotes(opts.acknowledgmentsText, opts.smartQuotes)
        }
      ]
    });
    currentPageNumber++;
  }

  const totalWords = scenes.reduce((sum, s) => sum + (s.wordCount || 0), 0);

  return {
    pages,
    tocEntries,
    stats: {
      totalPages: pages.length,
      totalWords,
      totalChapters: effectiveChapters.length
    },
    dimensions: {
      widthPt,
      heightPt,
      marginX,
      marginTop,
      marginBottom,
      contentWidth,
      contentHeight,
      gutterPt
    },
    options: opts
  };
}

// Helper: Wrap text into lines based on approximate character width
function wrapTextIntoLines(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  words.forEach((w) => {
    if (!currentLine) {
      currentLine = w;
    } else if (currentLine.length + 1 + w.length <= maxCharsPerLine) {
      currentLine += ' ' + w;
    } else {
      lines.push(currentLine);
      currentLine = w;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [''];
}

// Running Header text resolver
function getHeaderText(
  page: number,
  projectTitle: string,
  chapterTitle: string,
  authorName: string,
  style: RunningHeaderStyle
): string | undefined {
  if (style === 'none') return undefined;

  const isEven = page % 2 === 0;

  if (style === 'alternating') {
    // Verso (even) gets Project Title, Recto (odd) gets Chapter Title
    return isEven ? projectTitle.toUpperCase() : chapterTitle.toUpperCase();
  }

  if (style === 'author-title') {
    return isEven ? authorName.toUpperCase() : projectTitle.toUpperCase();
  }

  if (style === 'chapter-only') {
    return chapterTitle.toUpperCase();
  }

  return projectTitle.toUpperCase();
}

// Footer page number resolver
function getFooterText(page: number, placement: NumberingPlacement): string | undefined {
  if (placement === 'none' || placement === 'top-outer') return undefined;
  return `— ${page} —`;
}
