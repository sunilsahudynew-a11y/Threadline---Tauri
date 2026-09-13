import { LineEditColorCode } from '../types';

export interface LineEditDefinition {
  code: LineEditColorCode;
  label: string;
  shortLabel: string;
  categoryName: string;
  description: string;
  craftTip: string;
  hexColor: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  highlightClass: string;
  markBg: string;
  markBorder: string;
  pillBg: string;
  symbol: string;
  patternName: string;
  okabeItoColor: string;
}

export const LINE_EDIT_CODES: Record<LineEditColorCode, LineEditDefinition> = {
  pacing: {
    code: 'pacing',
    label: 'Pacing & Narrative Flow',
    shortLabel: 'Pacing',
    categoryName: 'Pacing',
    description: 'Rhythm, dragged scenes, exposition dumps, or rushed dramatic turns.',
    craftTip: 'Identify where the clock lags or where dialogue requires beat pauses.',
    hexColor: '#D97706',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-900',
    badgeBorder: 'border-amber-300',
    highlightClass: 'hl-pacing',
    markBg: 'rgba(245, 158, 11, 0.28)',
    markBorder: 'rgba(217, 119, 6, 0.75)',
    pillBg: 'bg-amber-500',
    symbol: 'P',
    patternName: 'Dotted Underline',
    okabeItoColor: '#E69F00'
  },
  voice: {
    code: 'voice',
    label: 'Voice & Sensory Texture',
    shortLabel: 'Sensory',
    categoryName: 'Voice & Texture',
    description: 'Evocative sensory grounding (sound, scent, touch) and distinct character voice.',
    craftTip: 'Check if dialogue sounds uniquely like this character rather than the author.',
    hexColor: '#059669',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-900',
    badgeBorder: 'border-emerald-300',
    highlightClass: 'hl-voice',
    markBg: 'rgba(16, 185, 129, 0.25)',
    markBorder: 'rgba(5, 150, 105, 0.75)',
    pillBg: 'bg-emerald-600',
    symbol: 'V',
    patternName: 'Solid Underline',
    okabeItoColor: '#56B4E9'
  },
  tighten: {
    code: 'tighten',
    label: 'Tighten, Prune & Cut',
    shortLabel: 'Tighten',
    categoryName: 'Tighten & Cut',
    description: 'Excising conversational throat-clearing, redundant echoes, and filler words.',
    craftTip: 'Eliminate filtering verbs like "she felt", "he noticed", "she started to".',
    hexColor: '#DC2626',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-900',
    badgeBorder: 'border-rose-300',
    highlightClass: 'hl-tighten',
    markBg: 'rgba(244, 63, 94, 0.25)',
    markBorder: 'rgba(220, 38, 38, 0.75)',
    pillBg: 'bg-rose-600',
    symbol: 'X',
    patternName: 'Double Underline',
    okabeItoColor: '#D55E00'
  },
  continuity: {
    code: 'continuity',
    label: 'Continuity & Causal Logic',
    shortLabel: 'Continuity',
    categoryName: 'Continuity & Logic',
    description: 'Timeline order, character knowledge, physical positioning, and canon rules.',
    craftTip: 'Ensure items picked up earlier remain accounted for without teleporting.',
    hexColor: '#2563EB',
    badgeBg: 'bg-sky-100',
    badgeText: 'text-sky-900',
    badgeBorder: 'border-sky-300',
    highlightClass: 'hl-continuity',
    markBg: 'rgba(59, 130, 246, 0.25)',
    markBorder: 'rgba(37, 99, 235, 0.75)',
    pillBg: 'bg-sky-600',
    symbol: 'C',
    patternName: 'Dashed Underline',
    okabeItoColor: '#0072B2'
  },
  theme: {
    code: 'theme',
    label: 'Subtext, Motifs & Theme',
    shortLabel: 'Subtext',
    categoryName: 'Subtext & Theme',
    description: 'Double entendre, dramatic irony, recurring symbols, and emotional resonance.',
    craftTip: 'Strengthen unspoken tension between what characters say versus what they mean.',
    hexColor: '#7C3AED',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-900',
    badgeBorder: 'border-purple-300',
    highlightClass: 'hl-theme',
    markBg: 'rgba(168, 85, 247, 0.25)',
    markBorder: 'rgba(124, 58, 237, 0.75)',
    pillBg: 'bg-purple-600',
    symbol: 'T',
    patternName: 'Wavy Underline',
    okabeItoColor: '#CC79A7'
  },
  query: {
    code: 'query',
    label: 'Author Margin Query',
    shortLabel: 'Query',
    categoryName: 'Author Query',
    description: 'Direct questions or clarification notes left for the author to review.',
    craftTip: 'Ask targeted questions to confirm authorial intent before revising.',
    hexColor: '#EA580C',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-950',
    badgeBorder: 'border-orange-300',
    highlightClass: 'hl-query',
    markBg: 'rgba(234, 88, 12, 0.25)',
    markBorder: 'rgba(234, 88, 12, 0.75)',
    pillBg: 'bg-orange-600',
    symbol: '?',
    patternName: 'Boxed Outline',
    okabeItoColor: '#F0E442'
  }
};

export const LINE_EDIT_LIST = Object.values(LINE_EDIT_CODES);

/**
 * Extracts line-edit highlights from markdown text for density metrics and inspector navigation
 */
export function extractLineEditsFromMarkdown(markdown: string, sceneId?: string, sceneTitle?: string) {
  const items: {
    id: string;
    code: LineEditColorCode;
    text: string;
    note?: string;
    sceneId?: string;
    sceneTitle?: string;
    index: number;
  }[] = [];

  if (!markdown) return items;

  // Regex to match ==code:text== or ==text== (defaulting to pacing/amber)
  const regex = /==([a-z0-9_-]+):(.*?)==|==(.*?)==/gi;
  let match;
  let count = 0;

  while ((match = regex.exec(markdown)) !== null) {
    count++;
    let code: LineEditColorCode = 'pacing';
    let text = '';

    if (match[1] && match[2] !== undefined) {
      const rawCode = match[1].toLowerCase();
      if (rawCode === 'pacing' || rawCode === 'yellow' || rawCode === 'amber') code = 'pacing';
      else if (rawCode === 'voice' || rawCode === 'mint' || rawCode === 'green') code = 'voice';
      else if (rawCode === 'tighten' || rawCode === 'rose' || rawCode === 'red') code = 'tighten';
      else if (rawCode === 'continuity' || rawCode === 'blue' || rawCode === 'sky') code = 'continuity';
      else if (rawCode === 'theme' || rawCode === 'purple' || rawCode === 'lavender') code = 'theme';
      else if (rawCode === 'query' || rawCode === 'orange') code = 'query';
      text = match[2];
    } else if (match[3] !== undefined) {
      text = match[3];
      code = 'pacing';
    }

    items.push({
      id: `line-edit-${sceneId || 'active'}-${count}`,
      code,
      text: text.trim(),
      sceneId,
      sceneTitle,
      index: match.index
    });
  }

  return items;
}
