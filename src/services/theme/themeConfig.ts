export type ThemeFamily = 'threadline' | 'notion' | 'obsidian' | 'ubuntu';
export type ThemeMode = 'light' | 'dark';
export type AppFontSize = 'compact' | 'default' | 'comfortable' | 'spacious';
export type ColorBlindMode = 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia' | 'high-contrast';

// Manuscript Typography Types
export type EditorLineSpacing = 'tight' | 'normal' | 'relaxed' | 'double';
export type EditorWordSpacing = 'normal' | 'wide' | 'expanded';
export type EditorTextAlign = 'left' | 'justify';
export type EditorPageWidth = 'compact' | 'standard' | 'wide';

export interface ManuscriptTypographySettings {
  lineSpacing: EditorLineSpacing;
  wordSpacing: EditorWordSpacing;
  textAlign: EditorTextAlign;
  pageWidth: EditorPageWidth;
}

export interface LineSpacingMetadata {
  id: EditorLineSpacing;
  label: string;
  sublabel: string;
  multiplier: number;
  cssValue: string;
}

export const AVAILABLE_LINE_SPACINGS: LineSpacingMetadata[] = [
  {
    id: 'tight',
    label: 'Tight',
    sublabel: '1.50 · Compact, dense drafting',
    multiplier: 1.5,
    cssValue: '1.5'
  },
  {
    id: 'normal',
    label: 'Normal',
    sublabel: '1.75 · Balanced literary standard',
    multiplier: 1.75,
    cssValue: '1.75'
  },
  {
    id: 'relaxed',
    label: 'Relaxed',
    sublabel: '2.00 · Roomy manuscript proofing',
    multiplier: 2.0,
    cssValue: '2.0'
  },
  {
    id: 'double',
    label: 'Double',
    sublabel: '2.25 · Expansive reading layout',
    multiplier: 2.25,
    cssValue: '2.25'
  }
];

export interface WordSpacingMetadata {
  id: EditorWordSpacing;
  label: string;
  sublabel: string;
  cssValue: string;
}

export const AVAILABLE_WORD_SPACINGS: WordSpacingMetadata[] = [
  {
    id: 'normal',
    label: 'Normal',
    sublabel: 'Standard optical word spacing',
    cssValue: 'normal'
  },
  {
    id: 'wide',
    label: 'Wide',
    sublabel: '+0.06em subtle breathing space',
    cssValue: '0.06em'
  },
  {
    id: 'expanded',
    label: 'Expanded',
    sublabel: '+0.14em generous typesetting',
    cssValue: '0.14em'
  }
];

export interface TextAlignMetadata {
  id: EditorTextAlign;
  label: string;
  sublabel: string;
}

export const AVAILABLE_TEXT_ALIGNS: TextAlignMetadata[] = [
  {
    id: 'left',
    label: 'Left Aligned',
    sublabel: 'Natural ragged-right margin (default)'
  },
  {
    id: 'justify',
    label: 'Justified',
    sublabel: 'Book-style justified margins with hyphenation'
  }
];

export interface PageWidthMetadata {
  id: EditorPageWidth;
  label: string;
  sublabel: string;
  widthPx: number;
  cssValue: string;
}

export const AVAILABLE_PAGE_WIDTHS: PageWidthMetadata[] = [
  {
    id: 'compact',
    label: 'Compact',
    sublabel: '620px · Narrow focused reading column',
    widthPx: 620,
    cssValue: '620px'
  },
  {
    id: 'standard',
    label: 'Standard',
    sublabel: '720px · Fixed standard manuscript width (65-75 chars)',
    widthPx: 720,
    cssValue: '720px'
  },
  {
    id: 'wide',
    label: 'Wide',
    sublabel: '860px · Expanded drafting layout',
    widthPx: 860,
    cssValue: '860px'
  }
];

export interface FontSizeMetadata {
  id: AppFontSize;
  label: string;
  sublabel: string;
  pxValue: string;
}

export const AVAILABLE_FONT_SIZES: FontSizeMetadata[] = [
  {
    id: 'compact',
    label: 'Compact',
    sublabel: 'Dense layout for power-writers & compact screens',
    pxValue: '13.5px'
  },
  {
    id: 'default',
    label: 'Default',
    sublabel: 'Standard balanced studio typography',
    pxValue: '15px'
  },
  {
    id: 'comfortable',
    label: 'Comfortable',
    sublabel: 'Generous reading scale with relaxed line height',
    pxValue: '16.5px'
  },
  {
    id: 'spacious',
    label: 'Spacious',
    sublabel: 'Large high-contrast display scale for readability',
    pxValue: '18px'
  }
];

export interface ColorBlindMetadata {
  id: ColorBlindMode;
  name: string;
  shortLabel: string;
  description: string;
  badge: string;
  patternIndicator: string;
  palettePreview: string[];
}

export const AVAILABLE_COLORBLIND_MODES: ColorBlindMetadata[] = [
  {
    id: 'none',
    name: 'Standard Palette',
    shortLabel: 'Standard',
    description: 'Default literary editorial palette across line edits, badges, and statuses.',
    badge: 'Standard',
    patternIndicator: 'Full Spectrum',
    palettePreview: ['#D97706', '#059669', '#DC2626', '#2563EB', '#7C3AED']
  },
  {
    id: 'deuteranopia',
    name: 'Deuteranopia (Green-Weak Safe)',
    shortLabel: 'Deuteranopia',
    description: 'Replaces green with sky cyan and adds distinct patterned underlines and text badges.',
    badge: 'Deuteran Safe',
    patternIndicator: 'Okabe-Ito + Dotted Lines',
    palettePreview: ['#E69F00', '#56B4E9', '#D55E00', '#0072B2', '#CC79A7']
  },
  {
    id: 'protanopia',
    name: 'Protanopia (Red-Weak Safe)',
    shortLabel: 'Protanopia',
    description: 'Replaces red with high-luminance vermillion and gold, using double-underlines & tags.',
    badge: 'Protan Safe',
    patternIndicator: 'High Luminance + Double Underline',
    palettePreview: ['#F0E442', '#56B4E9', '#D55E00', '#0072B2', '#CC79A7']
  },
  {
    id: 'tritanopia',
    name: 'Tritanopia (Blue-Yellow Safe)',
    shortLabel: 'Tritanopia',
    description: 'Replaces blue/yellow with distinct magenta, mint teal, and coral pink.',
    badge: 'Tritan Safe',
    patternIndicator: 'Magenta & Teal Triad',
    palettePreview: ['#E05263', '#009E73', '#D55E00', '#CC79A7', '#0072B2']
  },
  {
    id: 'high-contrast',
    name: 'High-Contrast Monochrome',
    shortLabel: 'High Contrast',
    description: 'Maximum luminance contrast with patterned borders (dotted, dashed, double) and explicit symbolic tags.',
    badge: 'WCAG AAA',
    patternIndicator: 'Monochrome + Geometric Symbols',
    palettePreview: ['#FFFFFF', '#D1D5DB', '#9CA3AF', '#4B5563', '#111827']
  }
];

export interface ThemeConfig {
  family: ThemeFamily;
  mode: ThemeMode;
  fontSize?: AppFontSize;
  colorBlindMode?: ColorBlindMode;
}

export interface ThemeMetadata {
  id: ThemeFamily;
  name: string;
  description: string;
  lightBg: string;
  lightAccent: string;
  darkBg: string;
  darkAccent: string;
  fontBadge: string;
}

export const AVAILABLE_THEMES: ThemeMetadata[] = [
  {
    id: 'threadline',
    name: 'Threadline Standard',
    description: 'Aged manuscript paper, warm lamp glow, and literary editorial typography.',
    lightBg: '#FAF6EE',
    lightAccent: '#B54B32',
    darkBg: '#26231F',
    darkAccent: '#E6735A',
    fontBadge: 'Newsreader Serif'
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Ultra-clean, modern monochrome workspace with crisp slate & warm gray surfaces.',
    lightBg: '#FFFFFF',
    lightAccent: '#E03E3E',
    darkBg: '#282828',
    darkAccent: '#FF6E6E',
    fontBadge: 'Plus Jakarta Sans'
  },
  {
    id: 'obsidian',
    name: 'Obsidian',
    description: 'Knowledge-graph aesthetics with deep slate and vibrant violet accents.',
    lightBg: '#F8F9FA',
    lightAccent: '#7C3AED',
    darkBg: '#23242E',
    darkAccent: '#B794F6',
    fontBadge: 'Mono & Sans'
  },
  {
    id: 'ubuntu',
    name: 'Ubuntu',
    description: 'Canonical warm aubergine and vibrant terracotta orange with warm terminal feel.',
    lightBg: '#F7F7F7',
    lightAccent: '#E95420',
    darkBg: '#381932',
    darkAccent: '#FF753F',
    fontBadge: 'Ubuntu Warm'
  }
];

const STORAGE_KEY_FAMILY = 'threadline_theme_family';
const STORAGE_KEY_MODE = 'threadline_theme_mode';
const STORAGE_KEY_FONT_SIZE = 'threadline_app_font_size';
const STORAGE_KEY_COLORBLIND = 'threadline_colorblind_mode';

/**
 * Load initial font size from localStorage
 */
export function getSavedFontSize(): AppFontSize {
  if (typeof window === 'undefined') return 'default';
  const saved = localStorage.getItem(STORAGE_KEY_FONT_SIZE) as AppFontSize | null;
  if (saved && ['compact', 'default', 'comfortable', 'spacious'].includes(saved)) {
    return saved;
  }
  return 'default';
}

/**
 * Apply global font scale to document root
 */
export function applyFontSizeToDOM(fontSize: AppFontSize) {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-font-size', fontSize);
  localStorage.setItem(STORAGE_KEY_FONT_SIZE, fontSize);
}

/**
 * Load initial colorblind mode from localStorage
 */
export function getSavedColorBlindMode(): ColorBlindMode {
  if (typeof window === 'undefined') return 'none';
  const saved = localStorage.getItem(STORAGE_KEY_COLORBLIND) as ColorBlindMode | null;
  if (saved && ['none', 'deuteranopia', 'protanopia', 'tritanopia', 'high-contrast'].includes(saved)) {
    return saved;
  }
  return 'none';
}

/**
 * Apply colorblind mode to document root
 */
export function applyColorBlindModeToDOM(mode: ColorBlindMode) {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-colorblind', mode);

  // Remove previous colorblind classes
  AVAILABLE_COLORBLIND_MODES.forEach((m) => {
    root.classList.remove(`colorblind-${m.id}`);
  });

  if (mode !== 'none') {
    root.classList.add('colorblind-active');
    root.classList.add(`colorblind-${mode}`);
  } else {
    root.classList.remove('colorblind-active');
  }

  localStorage.setItem(STORAGE_KEY_COLORBLIND, mode);
}

/**
 * Load initial theme from localStorage with fallback for legacy paper/lamplight
 */
export function getSavedTheme(): ThemeConfig {
  if (typeof window === 'undefined') {
    return { family: 'threadline', mode: 'light', fontSize: 'default', colorBlindMode: 'none' };
  }

  const savedFamily = localStorage.getItem(STORAGE_KEY_FAMILY) as ThemeFamily | null;
  const savedMode = localStorage.getItem(STORAGE_KEY_MODE) as ThemeMode | null;
  const savedFontSize = getSavedFontSize();
  const savedColorBlindMode = getSavedColorBlindMode();

  if (savedFamily && ['threadline', 'notion', 'obsidian', 'ubuntu'].includes(savedFamily)) {
    return {
      family: savedFamily,
      mode: savedMode === 'dark' ? 'dark' : 'light',
      fontSize: savedFontSize,
      colorBlindMode: savedColorBlindMode
    };
  }

  // Check legacy 'threadline_theme' ('paper' -> light, 'lamplight' -> dark)
  const legacyTheme = localStorage.getItem('threadline_theme');
  if (legacyTheme === 'lamplight') {
    return { family: 'threadline', mode: 'dark', fontSize: savedFontSize, colorBlindMode: savedColorBlindMode };
  }

  return { family: 'threadline', mode: 'light', fontSize: savedFontSize, colorBlindMode: savedColorBlindMode };
}

/**
 * Apply theme to document root
 */
export function applyThemeToDOM(config: ThemeConfig) {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;
  const body = document.body;

  const themeClass = `theme-${config.family}-${config.mode}`;
  const themeData = `${config.family}-${config.mode}`;

  root.setAttribute('data-theme', themeData);
  root.setAttribute('data-theme-family', config.family);
  root.setAttribute('data-mode', config.mode);

  if (config.fontSize) {
    root.setAttribute('data-font-size', config.fontSize);
  }

  // Color Blind Mode
  const colorBlindMode = config.colorBlindMode || getSavedColorBlindMode();
  applyColorBlindModeToDOM(colorBlindMode);

  if (config.mode === 'dark') {
    root.classList.add('dark');
    root.classList.add('theme-dark');
    root.classList.remove('theme-light');
  } else {
    root.classList.remove('dark');
    root.classList.remove('theme-dark');
    root.classList.add('theme-light');
  }

  // Remove old theme classes
  AVAILABLE_THEMES.forEach((t) => {
    root.classList.remove(`theme-${t.id}-light`, `theme-${t.id}-dark`);
    body.classList.remove(`theme-${t.id}-light`, `theme-${t.id}-dark`);
  });

  root.classList.add(themeClass);
  body.classList.add(themeClass);

  localStorage.setItem(STORAGE_KEY_FAMILY, config.family);
  localStorage.setItem(STORAGE_KEY_MODE, config.mode);
  if (config.fontSize) {
    localStorage.setItem(STORAGE_KEY_FONT_SIZE, config.fontSize);
  }
  if (config.colorBlindMode) {
    localStorage.setItem(STORAGE_KEY_COLORBLIND, config.colorBlindMode);
  }
  localStorage.setItem('threadline_theme', config.mode === 'dark' ? 'lamplight' : 'paper');
}

const STORAGE_KEY_LINE_SPACING = 'threadline_editor_line_spacing';
const STORAGE_KEY_WORD_SPACING = 'threadline_editor_word_spacing';
const STORAGE_KEY_TEXT_ALIGN = 'threadline_editor_text_align';
const STORAGE_KEY_PAGE_WIDTH = 'threadline_editor_page_width';

/**
 * Load initial manuscript typography settings from localStorage
 */
export function getSavedTypographySettings(): ManuscriptTypographySettings {
  if (typeof window === 'undefined') {
    return { lineSpacing: 'normal', wordSpacing: 'normal', textAlign: 'left', pageWidth: 'standard' };
  }

  const savedLine = localStorage.getItem(STORAGE_KEY_LINE_SPACING) as EditorLineSpacing | null;
  const savedWord = localStorage.getItem(STORAGE_KEY_WORD_SPACING) as EditorWordSpacing | null;
  const savedAlign = localStorage.getItem(STORAGE_KEY_TEXT_ALIGN) as EditorTextAlign | null;
  const savedWidth = localStorage.getItem(STORAGE_KEY_PAGE_WIDTH) as EditorPageWidth | null;

  return {
    lineSpacing: savedLine && ['tight', 'normal', 'relaxed', 'double'].includes(savedLine) ? savedLine : 'normal',
    wordSpacing: savedWord && ['normal', 'wide', 'expanded'].includes(savedWord) ? savedWord : 'normal',
    textAlign: savedAlign && ['left', 'justify'].includes(savedAlign) ? savedAlign : 'left',
    pageWidth: savedWidth && ['compact', 'standard', 'wide'].includes(savedWidth) ? savedWidth : 'standard'
  };
}

/**
 * Apply manuscript typography settings to CSS variables and document root attributes
 */
export function applyTypographySettingsToDOM(settings: ManuscriptTypographySettings) {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;

  const lineObj = AVAILABLE_LINE_SPACINGS.find((l) => l.id === settings.lineSpacing) || AVAILABLE_LINE_SPACINGS[1];
  const wordObj = AVAILABLE_WORD_SPACINGS.find((w) => w.id === settings.wordSpacing) || AVAILABLE_WORD_SPACINGS[0];
  const widthObj = AVAILABLE_PAGE_WIDTHS.find((p) => p.id === settings.pageWidth) || AVAILABLE_PAGE_WIDTHS[1];

  root.style.setProperty('--editor-line-height', lineObj.cssValue);
  root.style.setProperty('--editor-word-spacing', wordObj.cssValue);
  root.style.setProperty('--editor-text-align', settings.textAlign === 'justify' ? 'justify' : 'left');
  root.style.setProperty('--editor-page-width', widthObj.cssValue);

  root.setAttribute('data-editor-line-spacing', settings.lineSpacing);
  root.setAttribute('data-editor-word-spacing', settings.wordSpacing);
  root.setAttribute('data-editor-text-align', settings.textAlign);
  root.setAttribute('data-editor-page-width', settings.pageWidth || 'standard');

  localStorage.setItem(STORAGE_KEY_LINE_SPACING, settings.lineSpacing);
  localStorage.setItem(STORAGE_KEY_WORD_SPACING, settings.wordSpacing);
  localStorage.setItem(STORAGE_KEY_TEXT_ALIGN, settings.textAlign);
  localStorage.setItem(STORAGE_KEY_PAGE_WIDTH, settings.pageWidth || 'standard');
}

