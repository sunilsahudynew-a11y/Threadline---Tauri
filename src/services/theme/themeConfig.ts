export type ThemeFamily = 'threadline' | 'notion' | 'obsidian' | 'ubuntu';
export type ThemeMode = 'light' | 'dark';

export interface ThemeConfig {
  family: ThemeFamily;
  mode: ThemeMode;
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
    darkBg: '#151311',
    darkAccent: '#DE6346',
    fontBadge: 'Fraunces Serif'
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Ultra-clean, modern monochrome workspace with crisp slate & warm gray surfaces.',
    lightBg: '#FFFFFF',
    lightAccent: '#E03E3E',
    darkBg: '#191919',
    darkAccent: '#FF5C5C',
    fontBadge: 'Inter Sans'
  },
  {
    id: 'obsidian',
    name: 'Obsidian',
    description: 'Knowledge-graph aesthetics with deep void blacks and vibrant violet accents.',
    lightBg: '#F8F9FA',
    lightAccent: '#7C3AED',
    darkBg: '#0F0F14',
    darkAccent: '#A78BFA',
    fontBadge: 'Mono & Sans'
  },
  {
    id: 'ubuntu',
    name: 'Ubuntu',
    description: 'Canonical warm aubergine and vibrant terracotta orange with warm terminal feel.',
    lightBg: '#F7F7F7',
    lightAccent: '#E95420',
    darkBg: '#240018',
    darkAccent: '#E95420',
    fontBadge: 'Ubuntu Warm'
  }
];

const STORAGE_KEY_FAMILY = 'threadline_theme_family';
const STORAGE_KEY_MODE = 'threadline_theme_mode';

/**
 * Load initial theme from localStorage with fallback for legacy paper/lamplight
 */
export function getSavedTheme(): ThemeConfig {
  if (typeof window === 'undefined') {
    return { family: 'threadline', mode: 'light' };
  }

  const savedFamily = localStorage.getItem(STORAGE_KEY_FAMILY) as ThemeFamily | null;
  const savedMode = localStorage.getItem(STORAGE_KEY_MODE) as ThemeMode | null;

  if (savedFamily && ['threadline', 'notion', 'obsidian', 'ubuntu'].includes(savedFamily)) {
    return {
      family: savedFamily,
      mode: savedMode === 'dark' ? 'dark' : 'light'
    };
  }

  // Check legacy 'threadline_theme' ('paper' -> light, 'lamplight' -> dark)
  const legacyTheme = localStorage.getItem('threadline_theme');
  if (legacyTheme === 'lamplight') {
    return { family: 'threadline', mode: 'dark' };
  }

  return { family: 'threadline', mode: 'light' };
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
  localStorage.setItem('threadline_theme', config.mode === 'dark' ? 'lamplight' : 'paper');
}
