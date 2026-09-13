import { jsPDF } from 'jspdf';
import { ScreenplayElementType, ScreenplayRevisionColor, ProductionTag } from '../types';

export interface ScreenplayLine {
  text: string;
  type: ScreenplayElementType;
  rawText: string;
  characterName?: string;
  sceneNumber?: string;
  isDual?: boolean;
  hasAsterisk?: boolean;
}

export interface CharacterDialogueStat {
  name: string;
  linesCount: number;
  wordCount: number;
  percentage: number;
  estimatedMinutes: number;
}

export const HOLLYWOOD_REVISION_COLORS: {
  id: ScreenplayRevisionColor;
  label: string;
  colorHex: string;
  bgHex: string;
  textHex: string;
  order: number;
}[] = [
  { id: 'white', label: 'White (First Draft)', colorHex: '#FFFFFF', bgHex: '#F3F4F6', textHex: '#111827', order: 1 },
  { id: 'blue', label: 'Blue Revision', colorHex: '#93C5FD', bgHex: '#EFF6FF', textHex: '#1E40AF', order: 2 },
  { id: 'pink', label: 'Pink Revision', colorHex: '#F472B6', bgHex: '#FDF2F8', textHex: '#9D174D', order: 3 },
  { id: 'yellow', label: 'Yellow Revision', colorHex: '#FCD34D', bgHex: '#FEFCE8', textHex: '#854D0E', order: 4 },
  { id: 'green', label: 'Green Revision', colorHex: '#86EFAC', bgHex: '#F0FDF4', textHex: '#166534', order: 5 },
  { id: 'goldenrod', label: 'Goldenrod Revision', colorHex: '#FBBF24', bgHex: '#FFFBEB', textHex: '#92400E', order: 6 },
  { id: 'buff', label: 'Buff Revision', colorHex: '#D6D3D1', bgHex: '#FAFAF9', textHex: '#44403C', order: 7 },
  { id: 'salmon', label: 'Salmon Revision', colorHex: '#FDA4AF', bgHex: '#FFF1F2', textHex: '#9F1239', order: 8 },
  { id: 'cherry', label: 'Cherry Revision', colorHex: '#F87171', bgHex: '#FEF2F2', textHex: '#991B1B', order: 9 }
];

export const PRODUCTION_TAG_CATEGORIES: {
  id: ProductionTag['category'];
  label: string;
  icon: string;
  badgeColor: string;
}[] = [
  { id: 'cast', label: 'Cast / Speaking Role', icon: '🎭', badgeColor: 'bg-amber-100 text-amber-900 border-amber-300' },
  { id: 'prop', label: 'Key Prop', icon: '🗡️', badgeColor: 'bg-blue-100 text-blue-900 border-blue-300' },
  { id: 'wardrobe', label: 'Wardrobe / Costume', icon: '👗', badgeColor: 'bg-purple-100 text-purple-900 border-purple-300' },
  { id: 'vehicle', label: 'Vehicle / Transport', icon: '🚗', badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  { id: 'sfx', label: 'Special Effects / VFX', icon: '💥', badgeColor: 'bg-rose-100 text-rose-900 border-rose-300' },
  { id: 'stunt', label: 'Stunts / Combat', icon: '⚡', badgeColor: 'bg-orange-100 text-orange-900 border-orange-300' },
  { id: 'sound', label: 'Sound FX / Music Cue', icon: '🔊', badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
  { id: 'extras', label: 'Extras / Atmosphere', icon: '👥', badgeColor: 'bg-stone-100 text-stone-900 border-stone-300' }
];

/**
 * Detects the screenplay element type from line text
 */
export function detectScreenplayElement(lineText: string): ScreenplayElementType {
  const trimmed = lineText.trim();
  if (!trimmed) return 'action';

  // Scene Heading
  if (/^(INT\.|EXT\.|INT\/EXT\.|I\/E\.|EST\.)/i.test(trimmed)) {
    return 'scene_heading';
  }

  // Transitions (CUT TO:, FADE OUT., etc.)
  if (
    /^(FADE IN:|FADE OUT\.|CUT TO:|DISSOLVE TO:|SMASH CUT TO:|MATCH CUT TO:|JUMP CUT TO:)/i.test(trimmed) ||
    (lineText.startsWith('\t\t\t\t\t\t') && trimmed.endsWith(':'))
  ) {
    return 'transition';
  }

  // Parenthetical (in parentheses)
  if (/^\(.*\)$/.test(trimmed) || (lineText.startsWith('\t\t\t') && !lineText.startsWith('\t\t\t\t'))) {
    return 'parenthetical';
  }

  // Character (indented 4 tabs or UPPERCASE short line)
  if (
    lineText.startsWith('\t\t\t\t') ||
    (trimmed === trimmed.toUpperCase() &&
      trimmed.length < 35 &&
      !trimmed.endsWith('.') &&
      !trimmed.endsWith(':') &&
      !/^(INT\.|EXT\.)/i.test(trimmed) &&
      !/^[0-9]+$/.test(trimmed))
  ) {
    return 'character';
  }

  // Shot
  if (/^(CLOSE UP|WIDE SHOT|POV|INSERT|ANGLE ON|FLASHBACK)/i.test(trimmed)) {
    return 'shot';
  }

  // Dialogue (indented 2 tabs or comes after character/parenthetical)
  if (lineText.startsWith('\t\t')) {
    return 'dialogue';
  }

  return 'action';
}

/**
 * Parse full screenplay text into typed line structures
 */
export function parseScreenplayText(
  proseContent: string,
  options?: { locked?: boolean; asterisks?: number[] }
): ScreenplayLine[] {
  const rawLines = proseContent.split('\n');
  const result: ScreenplayLine[] = [];
  let lastCharacter = '';

  for (let idx = 0; idx < rawLines.length; idx++) {
    const raw = rawLines[idx];
    const trimmed = raw.trim();
    let type = detectScreenplayElement(raw);

    // If previous was character or parenthetical and this line has content not matching headings
    if (result.length > 0) {
      const prev = result[result.length - 1];
      if ((prev.type === 'character' || prev.type === 'parenthetical') && trimmed && type === 'action') {
        type = 'dialogue';
      }
    }

    let charName: string | undefined = undefined;
    if (type === 'character') {
      charName = trimmed.replace(/\s*\(.*\)$/, ''); // strip (V.O.) or (O.S.)
      lastCharacter = charName;
    } else if (type === 'dialogue') {
      charName = lastCharacter;
    } else if (type === 'scene_heading') {
      lastCharacter = '';
    }

    const hasAsterisk = options?.asterisks?.includes(idx) ?? false;

    result.push({
      text: trimmed,
      rawText: raw,
      type,
      characterName: charName,
      hasAsterisk
    });
  }

  return result;
}

/**
 * Calculate estimated pages and runtime from screenplay text
 * Standard industry metric: ~54 lines per page in Courier 12pt, 1 page = 1 minute
 */
export function calculateScreenplayMetrics(proseContent: string): {
  linesCount: number;
  pagesCount: number;
  estimatedMinutes: number;
  scenesCount: number;
  dialogueWordCount: number;
} {
  const lines = proseContent.split('\n');
  const nonEmptyLines = lines.filter((l) => l.trim().length > 0);
  // Account for typical vertical spacing between elements
  const effectiveLines = lines.length + Math.floor(lines.length * 0.25);
  const pagesCount = Math.max(1, Math.ceil(effectiveLines / 54));
  const estimatedMinutes = pagesCount;

  // Scene count
  const scenesCount = lines.filter((l) => /^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)/i.test(l.trim())).length || 1;

  // Dialogue words
  let dialogueWordCount = 0;
  const parsed = parseScreenplayText(proseContent);
  parsed.forEach((p) => {
    if (p.type === 'dialogue') {
      dialogueWordCount += p.text.split(/\s+/).filter(Boolean).length;
    }
  });

  return {
    linesCount: nonEmptyLines.length,
    pagesCount,
    estimatedMinutes,
    scenesCount,
    dialogueWordCount
  };
}

/**
 * Compute dialogue and speaking statistics for each character
 */
export function calculateCharacterDialogueStats(proseContent: string): CharacterDialogueStat[] {
  const parsed = parseScreenplayText(proseContent);
  const statsMap = new Map<string, { linesCount: number; wordCount: number }>();

  let totalWords = 0;

  for (const item of parsed) {
    if (item.type === 'dialogue' && item.characterName) {
      const words = item.text.split(/\s+/).filter(Boolean).length;
      totalWords += words;
      const current = statsMap.get(item.characterName) || { linesCount: 0, wordCount: 0 };
      statsMap.set(item.characterName, {
        linesCount: current.linesCount + 1,
        wordCount: current.wordCount + words
      });
    }
  }

  const result: CharacterDialogueStat[] = [];
  for (const [name, data] of statsMap.entries()) {
    const pct = totalWords > 0 ? Math.round((data.wordCount / totalWords) * 100) : 0;
    // ~130 words per minute average speech
    const mins = parseFloat((data.wordCount / 130).toFixed(1));
    result.push({
      name,
      linesCount: data.linesCount,
      wordCount: data.wordCount,
      percentage: pct,
      estimatedMinutes: mins
    });
  }

  return result.sort((a, b) => b.wordCount - a.wordCount);
}

/**
 * Generates an authentic Final Draft XML (.FDX) document string
 */
export function exportToFinalDraftFdx(
  title: string,
  author: string,
  proseContent: string,
  sceneNumber: string = '1'
): string {
  const parsed = parseScreenplayText(proseContent);

  const elementToFdxType: Record<ScreenplayElementType, string> = {
    scene_heading: 'Scene Heading',
    'scene-heading': 'Scene Heading',
    action: 'Action',
    character: 'Character',
    parenthetical: 'Parenthetical',
    dialogue: 'Dialogue',
    dual_dialogue: 'Dual Dialogue',
    transition: 'Transition',
    shot: 'Shot'
  };

  const paragraphsXml = parsed
    .map((item) => {
      const fdxType = elementToFdxType[item.type] || 'Action';
      const escapedText = item.text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

      if (item.type === 'scene_heading') {
        return `    <Paragraph Type="${fdxType}" Number="${sceneNumber}">\n      <Text>${escapedText}</Text>\n    </Paragraph>`;
      }
      return `    <Paragraph Type="${fdxType}">\n      <Text>${escapedText}</Text>\n    </Paragraph>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
<FinalDraft DocumentType="Script" Template="No" Version="1">
  <HeaderAndFooter HeaderFirstPage="No" StartingPageNumber="1">
    <Header>
      <Paragraph Alignment="Right">
        <Text>${sceneNumber}.</Text>
      </Paragraph>
    </Header>
  </HeaderAndFooter>
  <TitlePage>
    <Content>
      <Paragraph Alignment="Center">
        <Text AdornmentStyle="-1" Background="#FFFFFFFFFFFF" Color="#000000000000" Font="Courier Final Draft" RevisionID="0" Size="12" Style="Bold">${title.toUpperCase()}</Text>
      </Paragraph>
      <Paragraph Alignment="Center">
        <Text>written by</Text>
      </Paragraph>
      <Paragraph Alignment="Center">
        <Text>${author}</Text>
      </Paragraph>
    </Content>
  </TitlePage>
  <Content>
${paragraphsXml}
  </Content>
</FinalDraft>`;
}

/**
 * Triggers client-side download of the Final Draft (.FDX) file
 */
export function downloadFinalDraftFdxFile(
  title: string,
  author: string,
  proseContent: string,
  sceneNumber: string = '1'
) {
  const fdxContent = exportToFinalDraftFdx(title, author, proseContent, sceneNumber);
  const blob = new Blob([fdxContent], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '_') || 'screenplay';
  link.href = url;
  link.download = `${safeTitle}.fdx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates an Industry-Standard WGA Formatted PDF with Custom Watermarking
 */
export function exportToWgaScreenplayPdf(options: {
  title: string;
  author: string;
  proseContent: string;
  sceneNumber?: string;
  watermarkText?: string;
  revisionColor?: ScreenplayRevisionColor;
  revisionDate?: string;
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter' // 8.5 x 11 inches = 612 x 792 pt
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Margins in points:
  // 1.5 inches left = 108 pt
  // 1.0 inch right = 72 pt -> rightMarginPos = 612 - 72 = 540 pt
  // 1.0 inch top = 72 pt
  // 1.0 inch bottom = 72 pt
  const leftMargin = 108;
  const topMargin = 72;
  const bottomMargin = pageHeight - 72;
  const contentWidth = pageWidth - leftMargin - 72;

  doc.setFont('courier', 'normal');
  doc.setFontSize(12);

  const parsed = parseScreenplayText(options.proseContent);

  let currentY = topMargin;
  let pageNum = 1;

  const drawWatermark = (pNum: number) => {
    if (!options.watermarkText) return;
    doc.saveGraphicsState();
    doc.setTextColor(210, 210, 210); // Translucent light grey
    doc.setFontSize(26);
    doc.setFont('courier', 'bold');
    // Rotate 45 degrees across center
    const text = options.watermarkText.toUpperCase();
    doc.text(text, pageWidth / 2, pageHeight / 2, {
      align: 'center',
      angle: 45
    });
    doc.restoreGraphicsState();
  };

  const drawHeader = (pNum: number) => {
    drawWatermark(pNum);
    doc.setFont('courier', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);

    // Draft color badge
    if (options.revisionColor && options.revisionColor !== 'white') {
      const colorDef = HOLLYWOOD_REVISION_COLORS.find((c) => c.id === options.revisionColor);
      const revLabel = `REV. (${colorDef?.label.toUpperCase() || options.revisionColor.toUpperCase()}) ${options.revisionDate || new Date().toLocaleDateString()}`;
      doc.text(revLabel, leftMargin, 40);
    }

    // Top Right Page Number: "2."
    if (pNum > 1) {
      doc.text(`${pNum}.`, pageWidth - 72, 40, { align: 'right' });
    }
  };

  // Draw first page header
  drawHeader(pageNum);

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > bottomMargin) {
      doc.addPage();
      pageNum++;
      currentY = topMargin;
      drawHeader(pageNum);
    }
  };

  const lineHeight = 14;

  for (const item of parsed) {
    if (!item.text) {
      currentY += lineHeight;
      continue;
    }

    switch (item.type) {
      case 'scene_heading': {
        checkPageBreak(lineHeight * 3);
        doc.setFont('courier', 'bold');
        doc.setTextColor(0, 0, 0);

        const sceneNum = options.sceneNumber || '1';
        // Left margin scene number
        doc.text(sceneNum, leftMargin - 30, currentY);
        // Heading text
        doc.text(item.text.toUpperCase(), leftMargin, currentY);
        // Right margin scene number
        doc.text(sceneNum, leftMargin + contentWidth + 10, currentY);

        currentY += lineHeight * 1.8;
        break;
      }

      case 'character': {
        checkPageBreak(lineHeight * 3);
        doc.setFont('courier', 'normal');
        doc.setTextColor(0, 0, 0);
        // Character indented ~3.7 inches (266 pt)
        const charX = leftMargin + 140;
        doc.text(item.text.toUpperCase(), charX, currentY);
        currentY += lineHeight * 1.2;
        break;
      }

      case 'parenthetical': {
        checkPageBreak(lineHeight * 2);
        doc.setFont('courier', 'normal');
        doc.setTextColor(60, 60, 60);
        // Parenthetical indented ~3.1 inches (223 pt)
        const parenX = leftMargin + 105;
        doc.text(item.text, parenX, currentY);
        currentY += lineHeight * 1.1;
        break;
      }

      case 'dialogue': {
        checkPageBreak(lineHeight * 2);
        doc.setFont('courier', 'normal');
        doc.setTextColor(0, 0, 0);
        // Dialogue indented ~2.5 inches (180 pt), width ~35 chars (approx 240 pt)
        const dialX = leftMargin + 75;
        const dialWidth = 260;
        const splitLines = doc.splitTextToSize(item.text, dialWidth);
        for (const line of splitLines) {
          checkPageBreak(lineHeight);
          doc.text(line, dialX, currentY);
          currentY += lineHeight;
        }
        currentY += lineHeight * 0.6;
        break;
      }

      case 'transition': {
        checkPageBreak(lineHeight * 2);
        doc.setFont('courier', 'bold');
        doc.setTextColor(0, 0, 0);
        // Right-aligned transition
        doc.text(item.text.toUpperCase(), leftMargin + contentWidth, currentY, { align: 'right' });
        currentY += lineHeight * 1.6;
        break;
      }

      case 'action':
      default: {
        checkPageBreak(lineHeight * 1.5);
        doc.setFont('courier', 'normal');
        doc.setTextColor(0, 0, 0);
        const actionLines = doc.splitTextToSize(item.text, contentWidth);
        for (const line of actionLines) {
          checkPageBreak(lineHeight);
          doc.text(line, leftMargin, currentY);
          currentY += lineHeight;
        }
        currentY += lineHeight * 0.6;
        break;
      }
    }
  }

  const safeTitle = options.title.toLowerCase().replace(/[^a-z0-9]+/g, '_') || 'script';
  doc.save(`${safeTitle}_wga_script.pdf`);
}
