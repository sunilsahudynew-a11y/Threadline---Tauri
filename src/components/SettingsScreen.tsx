import React, { useState } from 'react';
import { AIAuditLog } from '../types';
import { VaultInfo } from '../services/storage/vaultTypes';
import {
  ThemeConfig,
  ThemeFamily,
  ThemeMode,
  AVAILABLE_THEMES,
  getSavedTheme,
  applyThemeToDOM,
  AppFontSize,
  AVAILABLE_FONT_SIZES,
  getSavedFontSize,
  applyFontSizeToDOM,
  ColorBlindMode,
  AVAILABLE_COLORBLIND_MODES,
  getSavedColorBlindMode,
  applyColorBlindModeToDOM,
  EditorLineSpacing,
  EditorWordSpacing,
  EditorTextAlign,
  EditorPageWidth,
  ManuscriptTypographySettings,
  AVAILABLE_LINE_SPACINGS,
  AVAILABLE_WORD_SPACINGS,
  AVAILABLE_TEXT_ALIGNS,
  AVAILABLE_PAGE_WIDTHS,
  getSavedTypographySettings,
  applyTypographySettingsToDOM
} from '../services/theme/themeConfig';
import {
  ShieldCheck,
  Database,
  Trash2,
  RotateCcw,
  Sparkles,
  Check,
  Download,
  Folder,
  FolderOpen,
  HardDrive,
  CheckCircle2,
  Palette,
  Sun,
  Moon,
  Type,
  AlignLeft,
  AlignJustify,
  SlidersHorizontal,
  Eye,
  CheckCheck
} from 'lucide-react';

export type SettingsTabId = 'appearance' | 'typography' | 'vault' | 'ai-audit' | 'data';

interface SettingsTabItem {
  id: SettingsTabId;
  label: string;
  shortDesc: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const SETTINGS_TABS: SettingsTabItem[] = [
  {
    id: 'appearance',
    label: 'Appearance & Themes',
    shortDesc: 'Palettes, dark mode, contrast',
    icon: Palette
  },
  {
    id: 'typography',
    label: 'Typography & Layout',
    shortDesc: 'Font scale, line spacing, margins',
    icon: Type
  },
  {
    id: 'vault',
    label: 'Vault & Sovereignty',
    shortDesc: 'Obsidian disk folder, zero AI training',
    icon: HardDrive
  },
  {
    id: 'ai-audit',
    label: 'AI Audit & Logs',
    shortDesc: 'Query history, acceptance log',
    icon: Sparkles
  },
  {
    id: 'data',
    label: 'Data & Studio Tour',
    shortDesc: 'JSON export, demo reset, tour',
    icon: Database
  }
];

interface SettingsScreenProps {
  aiAuditLogs: AIAuditLog[];
  onResetToDemo: () => void;
  onClearAllData: () => void;
  onExportFullArchive: () => void;
  vaultInfo?: VaultInfo | null;
  onOpenVaultManager?: () => void;
  onOpenTour?: () => void;
  themeConfig?: ThemeConfig;
  onSelectThemeFamily?: (family: ThemeFamily) => void;
  onSelectThemeMode?: (mode: ThemeMode) => void;
  onToggleTheme?: () => void;
  fontSize?: AppFontSize;
  onSelectFontSize?: (size: AppFontSize) => void;
  colorBlindMode?: ColorBlindMode;
  onSelectColorBlindMode?: (mode: ColorBlindMode) => void;
  typographySettings?: ManuscriptTypographySettings;
  onSelectLineSpacing?: (spacing: EditorLineSpacing) => void;
  onSelectWordSpacing?: (spacing: EditorWordSpacing) => void;
  onSelectTextAlign?: (align: EditorTextAlign) => void;
  onSelectPageWidth?: (width: EditorPageWidth) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  aiAuditLogs,
  onResetToDemo,
  onClearAllData,
  onExportFullArchive,
  vaultInfo,
  onOpenVaultManager,
  onOpenTour,
  themeConfig: propThemeConfig,
  onSelectThemeFamily,
  onSelectThemeMode,
  onToggleTheme,
  fontSize: propFontSize,
  onSelectFontSize,
  colorBlindMode: propColorBlindMode,
  onSelectColorBlindMode,
  typographySettings: propTypographySettings,
  onSelectLineSpacing,
  onSelectWordSpacing,
  onSelectTextAlign,
  onSelectPageWidth
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTabId>('appearance');

  // Local fallback if not provided via props
  const [localThemeConfig, setLocalThemeConfig] = useState<ThemeConfig>(() => getSavedTheme());
  const activeConfig = propThemeConfig || localThemeConfig;

  // Local font size fallback
  const [localFontSize, setLocalFontSize] = useState<AppFontSize>(() => getSavedFontSize());
  const activeFontSize = propFontSize || localFontSize;

  // Local colorblind mode fallback
  const [localColorBlindMode, setLocalColorBlindMode] = useState<ColorBlindMode>(() => getSavedColorBlindMode());
  const activeColorBlindMode = propColorBlindMode || activeConfig.colorBlindMode || localColorBlindMode;

  // Local typography settings fallback
  const [localTypography, setLocalTypography] = useState<ManuscriptTypographySettings>(() => getSavedTypographySettings());
  const activeTypography = propTypographySettings || localTypography;

  const handleChooseLineSpacing = (spacing: EditorLineSpacing) => {
    if (onSelectLineSpacing) {
      onSelectLineSpacing(spacing);
    } else {
      const next = { ...activeTypography, lineSpacing: spacing };
      setLocalTypography(next);
      applyTypographySettingsToDOM(next);
    }
  };

  const handleChooseWordSpacing = (spacing: EditorWordSpacing) => {
    if (onSelectWordSpacing) {
      onSelectWordSpacing(spacing);
    } else {
      const next = { ...activeTypography, wordSpacing: spacing };
      setLocalTypography(next);
      applyTypographySettingsToDOM(next);
    }
  };

  const handleChooseTextAlign = (align: EditorTextAlign) => {
    if (onSelectTextAlign) {
      onSelectTextAlign(align);
    } else {
      const next = { ...activeTypography, textAlign: align };
      setLocalTypography(next);
      applyTypographySettingsToDOM(next);
    }
  };

  const handleChoosePageWidth = (width: EditorPageWidth) => {
    if (onSelectPageWidth) {
      onSelectPageWidth(width);
    } else {
      const next = { ...activeTypography, pageWidth: width };
      setLocalTypography(next);
      applyTypographySettingsToDOM(next);
    }
  };

  const handleChooseFamily = (family: ThemeFamily) => {
    if (onSelectThemeFamily) {
      onSelectThemeFamily(family);
    } else {
      const next = { ...localThemeConfig, family };
      setLocalThemeConfig(next);
      applyThemeToDOM(next);
    }
  };

  const handleChooseMode = (mode: ThemeMode) => {
    if (onSelectThemeMode) {
      onSelectThemeMode(mode);
    } else if (onToggleTheme) {
      onToggleTheme();
    } else {
      const next = { ...localThemeConfig, mode };
      setLocalThemeConfig(next);
      applyThemeToDOM(next);
    }
  };

  const handleChooseFontSize = (size: AppFontSize) => {
    if (onSelectFontSize) {
      onSelectFontSize(size);
    } else {
      setLocalFontSize(size);
      applyFontSizeToDOM(size);
    }
  };

  const handleChooseColorBlindMode = (mode: ColorBlindMode) => {
    if (onSelectColorBlindMode) {
      onSelectColorBlindMode(mode);
    } else {
      const next = { ...localThemeConfig, colorBlindMode: mode };
      setLocalThemeConfig(next);
      applyThemeToDOM(next);
    }
  };

  const isVaultConnected = vaultInfo && vaultInfo.mode !== 'browser-cached';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 text-[#221E18]">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-serif text-[#221E18] font-semibold">
          Studio Settings
        </h2>
        <p className="text-[#7A705F] text-xs sm:text-sm mt-1.5">
          Preferences &amp; sovereignty: customize workspace aesthetic palettes, manuscript typography, and local vault storage.
        </p>
      </div>

      {/* Main Layout: Left Vertical Tabs + Right Active Tab Content */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Left Vertical Tabs Navigation */}
        <nav
          className="w-full md:w-64 lg:w-72 shrink-0 bg-[#FAF6EE] rounded-[8px] border border-[rgba(34,30,24,0.12)] p-2 shadow-warm-sm flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible no-scrollbar"
          aria-label="Settings categories"
        >
          {SETTINGS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`text-left p-2.5 sm:p-3 rounded-[6px] transition-all flex items-center md:items-start gap-2.5 sm:gap-3 cursor-pointer shrink-0 md:shrink md:w-full ${
                  isActive
                    ? 'bg-[#F1EAD9] text-[#221E18] shadow-warm-xs border border-[rgba(34,30,24,0.12)] ring-1 ring-[#B54B32]/25'
                    : 'text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9]/40 border border-transparent'
                }`}
              >
                <div
                  className={`p-1.5 rounded-[5px] shrink-0 ${
                    isActive ? 'bg-[#FAF6EE] text-[#B54B32] shadow-xs' : 'bg-[#F1EAD9]/70 text-[#7A705F]'
                  }`}
                >
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-xs font-serif font-bold truncate ${
                        isActive ? 'text-[#221E18]' : 'text-[#5A5143]'
                      }`}
                    >
                      {tab.label}
                    </span>
                    {isActive && <Check size={12} className="text-[#B54B32] shrink-0 hidden md:inline" />}
                  </div>
                  <p className="text-[11px] text-[#7A705F] truncate mt-0.5 hidden md:block">
                    {tab.shortDesc}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Right Content Panel */}
        <div className="flex-1 min-w-0 w-full space-y-6">
          {/* TAB 1: APPEARANCE & THEMES */}
          {activeTab === 'appearance' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Workspace Theme & Appearance Card */}
              <div className="bg-[#FAF6EE] rounded-[6px] border border-[rgba(34,30,24,0.12)] p-5 sm:p-6 shadow-warm-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[rgba(34,30,24,0.1)] pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-[5px] bg-[#F1EAD9] text-[#B54B32] border border-[rgba(34,30,24,0.1)]">
                      <Palette size={18} />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-[#221E18] text-base">
                        Workspace Themes &amp; Lighting
                      </h3>
                      <p className="text-xs text-[#7A705F] mt-0.5">
                        Select your preferred aesthetic design language and dark or light contrast.
                      </p>
                    </div>
                  </div>

                  {/* Dark / Light Toggle Switch */}
                  <div className="flex items-center gap-1 p-1 bg-[#F1EAD9] rounded-[6px] border border-[rgba(34,30,24,0.12)] self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleChooseMode('light')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-medium transition-all cursor-pointer ${
                        activeConfig.mode === 'light'
                          ? 'bg-[#FAF6EE] text-[#221E18] shadow-xs'
                          : 'text-[#7A705F] hover:text-[#221E18]'
                      }`}
                    >
                      <Sun size={13} className={activeConfig.mode === 'light' ? 'text-amber-600' : ''} />
                      <span>Light</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChooseMode('dark')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-medium transition-all cursor-pointer ${
                        activeConfig.mode === 'dark'
                          ? 'bg-[#221E18] text-[#FAF6EE] shadow-xs'
                          : 'text-[#7A705F] hover:text-[#221E18]'
                      }`}
                    >
                      <Moon size={13} className={activeConfig.mode === 'dark' ? 'text-indigo-300' : ''} />
                      <span>Dark</span>
                    </button>
                  </div>
                </div>

                {/* Theme Family Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  {AVAILABLE_THEMES.map((theme) => {
                    const isSelected = activeConfig.family === theme.id;
                    const previewBg = activeConfig.mode === 'dark' ? theme.darkBg : theme.lightBg;
                    const previewAccent = activeConfig.mode === 'dark' ? theme.darkAccent : theme.lightAccent;

                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => handleChooseFamily(theme.id)}
                        className={`p-4 rounded-[6px] border text-left transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                          isSelected
                            ? 'border-[#B54B32] bg-[#F1EAD9]/60 shadow-warm-sm ring-2 ring-[#B54B32]/30'
                            : 'border-[rgba(34,30,24,0.12)] bg-[#FAF6EE] hover:bg-[#F1EAD9]/40'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="font-serif font-bold text-sm text-[#221E18]">
                              {theme.name}
                            </span>
                            {isSelected && (
                              <span className="flex items-center gap-1 text-[10px] font-mono font-semibold text-[#B54B32] bg-[#B54B32]/10 px-2 py-0.5 rounded">
                                <Check size={11} /> Active
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#7A705F] leading-relaxed mb-3">
                            {theme.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[rgba(34,30,24,0.08)]">
                          <span className="text-[10px] font-mono text-[#7A705F]">
                            {theme.fontBadge}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-4 h-4 rounded-full border border-black/15 shadow-xs"
                              style={{ backgroundColor: previewBg }}
                              title="Canvas surface color"
                            />
                            <div
                              className="w-4 h-4 rounded-full border border-black/15 shadow-xs"
                              style={{ backgroundColor: previewAccent }}
                              title="Accent color"
                            />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Colorblind Accessibility Mode Card */}
              <div className="bg-[#FAF6EE] rounded-[6px] border border-[rgba(34,30,24,0.12)] p-5 sm:p-6 shadow-warm-sm space-y-5">
                <div className="flex items-center justify-between border-b border-[rgba(34,30,24,0.1)] pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-[5px] bg-[#F1EAD9] text-[#B54B32] border border-[rgba(34,30,24,0.1)]">
                      <Eye size={18} />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-[#221E18] text-base">
                        Colorblind Accessibility Palettes
                      </h3>
                      <p className="text-xs text-[#7A705F] mt-0.5">
                        High-contrast, deuteranopia, protanopia, and tritanopia color adaptations.
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-[#B54B32] bg-[#B54B32]/10 px-2.5 py-1 rounded-[4px]">
                    {AVAILABLE_COLORBLIND_MODES.find((m) => m.id === activeColorBlindMode)?.name || 'Standard'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {AVAILABLE_COLORBLIND_MODES.map((modeOption) => {
                    const isSelected = activeColorBlindMode === modeOption.id;
                    return (
                      <button
                        key={modeOption.id}
                        type="button"
                        onClick={() => handleChooseColorBlindMode(modeOption.id)}
                        className={`p-3.5 rounded-[6px] border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#B54B32] bg-[#F1EAD9]/80 shadow-warm-sm ring-2 ring-[#B54B32]/30'
                            : 'border-[rgba(34,30,24,0.12)] bg-[#FAF6EE] hover:bg-[#F1EAD9]/40'
                        }`}
                      >
                        <div className="mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-serif font-bold text-sm text-[#221E18]">
                              {modeOption.name}
                            </span>
                            {isSelected && <Check size={13} className="text-[#B54B32]" />}
                          </div>
                          <p className="text-xs text-[#7A705F] leading-normal">
                            {modeOption.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TYPOGRAPHY & TYPESETTING */}
          {activeTab === 'typography' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Global App Typography & Scale Card */}
              <div className="bg-[#FAF6EE] rounded-[6px] border border-[rgba(34,30,24,0.12)] p-5 sm:p-6 shadow-warm-sm space-y-5">
                <div className="flex items-center justify-between border-b border-[rgba(34,30,24,0.1)] pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-[5px] bg-[#F1EAD9] text-[#B54B32] border border-[rgba(34,30,24,0.1)]">
                      <Type size={18} />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-[#221E18] text-base">
                        Global Workspace Typography &amp; Scale
                      </h3>
                      <p className="text-xs text-[#7A705F] mt-0.5">
                        Adjust the root type scale across all editor workspaces, story bibles, and sidebars.
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-[#B54B32] bg-[#B54B32]/10 px-2.5 py-1 rounded-[4px]">
                    {AVAILABLE_FONT_SIZES.find((s) => s.id === activeFontSize)?.label || 'Default'}
                  </span>
                </div>

                {/* Font Size Option Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {AVAILABLE_FONT_SIZES.map((sizeOption) => {
                    const isSelected = activeFontSize === sizeOption.id;

                    return (
                      <button
                        key={sizeOption.id}
                        type="button"
                        onClick={() => handleChooseFontSize(sizeOption.id)}
                        className={`p-3.5 rounded-[6px] border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#B54B32] bg-[#F1EAD9]/80 shadow-warm-sm ring-2 ring-[#B54B32]/30'
                            : 'border-[rgba(34,30,24,0.12)] bg-[#FAF6EE] hover:bg-[#F1EAD9]/40'
                        }`}
                      >
                        <div className="mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-serif font-bold text-sm text-[#221E18]">
                              {sizeOption.label}
                            </span>
                            {isSelected && <Check size={13} className="text-[#B54B32]" />}
                          </div>
                          <p className="text-[11px] text-[#7A705F] leading-tight">
                            {sizeOption.sublabel}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-[rgba(34,30,24,0.08)] flex items-center justify-between">
                          <span className="text-[10px] font-mono font-semibold text-[#7A705F]">
                            Scale: {sizeOption.pxValue}
                          </span>
                          <span className="font-serif text-[#221E18] font-medium text-sm">
                            Aa
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Manuscript Typesetting & Print Spacing Card */}
              <div className="bg-[#FAF6EE] rounded-[6px] border border-[rgba(34,30,24,0.12)] p-5 sm:p-6 shadow-warm-sm space-y-6">
                <div className="flex items-center justify-between border-b border-[rgba(34,30,24,0.1)] pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-[5px] bg-[#F1EAD9] text-[#B54B32] border border-[rgba(34,30,24,0.1)]">
                      <SlidersHorizontal size={18} />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-[#221E18] text-base">
                        Manuscript Typesetting &amp; Print Spacing
                      </h3>
                      <p className="text-xs text-[#7A705F] mt-0.5">
                        Customize leading (line spacing), word tracking, margin alignment, and canvas widths.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sub-section 1: Line Spacing */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif font-bold text-[#221E18] uppercase tracking-[0.08em] flex items-center gap-1.5">
                      <Type size={13} className="text-[#B54B32]" />
                      1. Line Spacing (Leading)
                    </span>
                    <span className="text-[11px] font-mono text-[#7A705F]">
                      Active: {AVAILABLE_LINE_SPACINGS.find((l) => l.id === activeTypography.lineSpacing)?.cssValue}x
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {AVAILABLE_LINE_SPACINGS.map((lineOption) => {
                      const isSelected = activeTypography.lineSpacing === lineOption.id;
                      return (
                        <button
                          key={lineOption.id}
                          type="button"
                          onClick={() => handleChooseLineSpacing(lineOption.id)}
                          className={`p-3.5 rounded-[6px] border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-[#B54B32] bg-[#F1EAD9]/80 shadow-warm-sm ring-2 ring-[#B54B32]/30'
                              : 'border-[rgba(34,30,24,0.12)] bg-[#FAF6EE] hover:bg-[#F1EAD9]/40'
                          }`}
                        >
                          <div className="mb-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-serif font-bold text-sm text-[#221E18]">
                                {lineOption.label}
                              </span>
                              {isSelected && <Check size={13} className="text-[#B54B32]" />}
                            </div>
                            <p className="text-[11px] text-[#7A705F] leading-tight">
                              {lineOption.sublabel}
                            </p>
                          </div>
                          <div className="pt-2 border-t border-[rgba(34,30,24,0.08)] flex items-center justify-between">
                            <span className="text-[10px] font-mono font-semibold text-[#7A705F]">
                              Leading: {lineOption.cssValue}
                            </span>
                            <div className="flex flex-col gap-0.5 opacity-60">
                              <div className="w-5 h-0.5 bg-[#221E18] rounded-full" />
                              <div
                                className="w-4 h-0.5 bg-[#221E18] rounded-full"
                                style={{ marginTop: `${(lineOption.multiplier - 1) * 3}px` }}
                              />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sub-section 2: Word Spacing */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif font-bold text-[#221E18] uppercase tracking-[0.08em] flex items-center gap-1.5">
                      <Type size={13} className="text-[#B54B32]" />
                      2. Word Spacing (Tracking)
                    </span>
                    <span className="text-[11px] font-mono text-[#7A705F]">
                      Active: {AVAILABLE_WORD_SPACINGS.find((w) => w.id === activeTypography.wordSpacing)?.cssValue}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {AVAILABLE_WORD_SPACINGS.map((wordOption) => {
                      const isSelected = activeTypography.wordSpacing === wordOption.id;
                      return (
                        <button
                          key={wordOption.id}
                          type="button"
                          onClick={() => handleChooseWordSpacing(wordOption.id)}
                          className={`p-3.5 rounded-[6px] border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-[#B54B32] bg-[#F1EAD9]/80 shadow-warm-sm ring-2 ring-[#B54B32]/30'
                              : 'border-[rgba(34,30,24,0.12)] bg-[#FAF6EE] hover:bg-[#F1EAD9]/40'
                          }`}
                        >
                          <div className="mb-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-serif font-bold text-sm text-[#221E18]">
                                {wordOption.label}
                              </span>
                              {isSelected && <Check size={13} className="text-[#B54B32]" />}
                            </div>
                            <p className="text-[11px] text-[#7A705F] leading-tight">
                              {wordOption.sublabel}
                            </p>
                          </div>
                          <div className="pt-2 border-t border-[rgba(34,30,24,0.08)] flex items-center justify-between">
                            <span className="text-[10px] font-mono font-semibold text-[#7A705F]">
                              Offset: {wordOption.cssValue}
                            </span>
                            <span
                              className="font-serif text-xs text-[#221E18]"
                              style={{ wordSpacing: wordOption.cssValue }}
                            >
                              one two three
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sub-section 3: Text Alignment */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif font-bold text-[#221E18] uppercase tracking-[0.08em] flex items-center gap-1.5">
                      <AlignLeft size={13} className="text-[#B54B32]" />
                      3. Text Alignment &amp; Margins
                    </span>
                    <span className="text-[11px] font-mono text-[#7A705F]">
                      Active: {activeTypography.textAlign === 'justify' ? 'Justified' : 'Left Aligned'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {AVAILABLE_TEXT_ALIGNS.map((alignOption) => {
                      const isSelected = activeTypography.textAlign === alignOption.id;
                      return (
                        <button
                          key={alignOption.id}
                          type="button"
                          onClick={() => handleChooseTextAlign(alignOption.id)}
                          className={`p-3.5 rounded-[6px] border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-[#B54B32] bg-[#F1EAD9]/80 shadow-warm-sm ring-2 ring-[#B54B32]/30'
                              : 'border-[rgba(34,30,24,0.12)] bg-[#FAF6EE] hover:bg-[#F1EAD9]/40'
                          }`}
                        >
                          <div className="mb-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-serif font-bold text-sm text-[#221E18]">
                                {alignOption.label}
                              </span>
                              {isSelected && <Check size={13} className="text-[#B54B32]" />}
                            </div>
                            <p className="text-[11px] text-[#7A705F] leading-tight">
                              {alignOption.sublabel}
                            </p>
                          </div>
                          <div className="pt-2 border-t border-[rgba(34,30,24,0.08)] flex items-center justify-between">
                            <span className="text-[10px] font-mono font-semibold text-[#7A705F]">
                              Mode: {alignOption.id}
                            </span>
                            <div className="flex items-center gap-1">
                              {alignOption.id === 'justify' ? (
                                <AlignJustify size={14} className="text-[#221E18]" />
                              ) : (
                                <AlignLeft size={14} className="text-[#221E18]" />
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sub-section 4: Page Width */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif font-bold text-[#221E18] uppercase tracking-[0.08em] flex items-center gap-1.5">
                      <SlidersHorizontal size={13} className="text-[#B54B32]" />
                      4. Canvas Page Width
                    </span>
                    <span className="text-[11px] font-mono text-[#7A705F]">
                      Active: {AVAILABLE_PAGE_WIDTHS.find((w) => w.id === activeTypography.pageWidth)?.label || 'Standard'} (
                      {AVAILABLE_PAGE_WIDTHS.find((w) => w.id === activeTypography.pageWidth)?.cssValue})
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {AVAILABLE_PAGE_WIDTHS.map((widthOption) => {
                      const isSelected = (activeTypography.pageWidth || 'standard') === widthOption.id;
                      return (
                        <button
                          key={widthOption.id}
                          type="button"
                          onClick={() => handleChoosePageWidth(widthOption.id)}
                          className={`p-3.5 rounded-[6px] border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-[#B54B32] bg-[#F1EAD9]/80 shadow-warm-sm ring-2 ring-[#B54B32]/30'
                              : 'border-[rgba(34,30,24,0.12)] bg-[#FAF6EE] hover:bg-[#F1EAD9]/40'
                          }`}
                        >
                          <div className="mb-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-serif font-bold text-sm text-[#221E18]">
                                {widthOption.label}
                              </span>
                              {isSelected && <Check size={13} className="text-[#B54B32]" />}
                            </div>
                            <p className="text-[11px] text-[#7A705F] leading-tight">
                              {widthOption.sublabel}
                            </p>
                          </div>
                          <div className="pt-2 border-t border-[rgba(34,30,24,0.08)] flex items-center justify-between">
                            <span className="text-[10px] font-mono font-semibold text-[#7A705F]">
                              Max: {widthOption.cssValue}
                            </span>
                            <span className="text-[10px] font-mono text-[#B54B32] font-semibold">
                              {widthOption.widthPx}px
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Interactive Paragraph Typesetting Live Preview */}
                <div className="p-4 bg-[#F1EAD9]/50 rounded-[6px] border border-[rgba(34,30,24,0.1)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#7A705F]">
                      Typesetting Live Preview
                    </span>
                    <span className="text-[10px] font-mono text-[#B54B32]">
                      Leading: {AVAILABLE_LINE_SPACINGS.find((l) => l.id === activeTypography.lineSpacing)?.cssValue}x ·{' '}
                      {activeTypography.textAlign === 'justify' ? 'Justified' : 'Left Align'} ·{' '}
                      {AVAILABLE_PAGE_WIDTHS.find((w) => w.id === activeTypography.pageWidth)?.cssValue}
                    </span>
                  </div>
                  <div
                    className="mx-auto transition-all duration-200"
                    style={{
                      maxWidth: AVAILABLE_PAGE_WIDTHS.find((w) => w.id === activeTypography.pageWidth)?.cssValue || '720px'
                    }}
                  >
                    <p
                      className="font-serif text-[#221E18] text-sm md:text-base leading-relaxed p-4 bg-[#FAF6EE] rounded border border-[rgba(34,30,24,0.08)] shadow-xs"
                      style={{
                        lineHeight: AVAILABLE_LINE_SPACINGS.find((l) => l.id === activeTypography.lineSpacing)?.cssValue || '1.85',
                        wordSpacing: AVAILABLE_WORD_SPACINGS.find((w) => w.id === activeTypography.wordSpacing)?.cssValue || 'normal',
                        textAlign: activeTypography.textAlign === 'justify' ? 'justify' : 'left',
                        textJustify: 'inter-word',
                        hyphens: 'auto'
                      }}
                    >
                      The bell atop the cathedral tower tolled four times before the fog began to part along the canal wall. Caleb set his lamp upon the worn granite parapet, watching the ripples catch the copper light of dawn. Every sentence an author crafts demands room to breathe—a deliberate rhythm between the ink and the margin, preserved exactly across drafts and imported notes without unruly horizontal crowding or erratic typography.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VAULT & LOCAL STORAGE */}
          {activeTab === 'vault' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Dedicated Folder Storage / Vault (Obsidian Model) Card */}
              <div className="bg-[#FAF6EE] rounded-[6px] border border-[rgba(34,30,24,0.12)] p-5 sm:p-6 shadow-warm-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-[5px] bg-[#F1EAD9] text-[#7A705F] border border-[rgba(34,30,24,0.12)]">
                      <Folder size={18} />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-[#221E18] text-base">
                        Local Folder Vault Storage
                      </h3>
                      <p className="text-xs text-[#7A705F]">
                        Store your manuscript directly in a dedicated directory on your computer, arranged in clean folders and plain markdown files.
                      </p>
                    </div>
                  </div>
                  {isVaultConnected ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F1EAD9] text-[#221E18] border border-[rgba(34,30,24,0.16)] shrink-0 self-start sm:self-auto">
                      <CheckCircle2 size={12} className="text-[#35505F]" /> Connected: {vaultInfo?.folderName}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F1EAD9] text-[#7A705F] border border-[rgba(34,30,24,0.12)] shrink-0 self-start sm:self-auto">
                      <HardDrive size={12} /> Browser Local Only
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#5A5143] leading-relaxed">
                  By connecting a dedicated folder, Threadline will save all chapters as readable <code className="text-[#221E18] font-mono bg-[#F1EAD9] px-1 py-0.5 rounded">.md</code> files inside a <code className="text-[#221E18] font-mono bg-[#F1EAD9] px-1 py-0.5 rounded">Manuscript/</code> subfolder, accompanied by a <code className="text-[#221E18] font-mono bg-[#F1EAD9] px-1 py-0.5 rounded">project.json</code> and <code className="text-[#221E18] font-mono bg-[#F1EAD9] px-1 py-0.5 rounded">StoryBible/</code>. You can back it up with Git or iCloud, or edit chapters concurrently in any text editor.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={onOpenVaultManager}
                    className="px-4 py-2 bg-[#221E18] hover:bg-black text-[#FAF6EE] rounded-[6px] text-xs font-semibold flex items-center gap-1.5 shadow-warm-sm transition-colors cursor-pointer min-h-[38px]"
                  >
                    <FolderOpen size={13} /> {isVaultConnected ? 'Manage Folder Vault' : 'Choose Local Project Folder'}
                  </button>
                  {isVaultConnected && vaultInfo?.folderPath && (
                    <span className="text-[11px] font-mono text-[#7A705F] bg-[#F1EAD9] px-2.5 py-1.5 rounded-[5px] border border-[rgba(34,30,24,0.12)] truncate max-w-sm">
                      {vaultInfo.folderPath}
                    </span>
                  )}
                </div>
              </div>

              {/* Local-First & Zero Training Guarantee Card */}
              <div className="bg-[#F1EAD9] border border-[rgba(34,30,24,0.16)] rounded-[6px] p-5 sm:p-6 shadow-warm-sm">
                <div className="flex items-start gap-3.5">
                  <div className="p-2 rounded-[5px] bg-[#FAF6EE] text-[#35505F] border border-[rgba(34,30,24,0.12)] shrink-0">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-[#221E18] text-base">
                      Local-First &amp; Zero Training Guarantee
                    </h3>
                    <p className="text-xs text-[#5A5143] mt-1 leading-relaxed">
                      Threadline stores your entire project, Story Bible, and revisions locally on your device in browser storage or your chosen disk folder. Your manuscript is never transmitted to third-party ad networks, never sold, and <strong className="text-[#221E18]">strictly never used to train foundation AI models</strong>.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-[#35505F] font-mono">
                      <span className="flex items-center gap-1">
                        <Check size={13} className="text-[#35505F]" /> Local Storage Active
                      </span>
                      <span className="flex items-center gap-1">
                        <Check size={13} className="text-[#35505F]" /> Zero Silent AI Merges
                      </span>
                      <span className="flex items-center gap-1">
                        <Check size={13} className="text-[#35505F]" /> Complete Export Portability
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AI AUDIT LOGS */}
          {activeTab === 'ai-audit' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-[#FAF6EE] rounded-[6px] border border-[rgba(34,30,24,0.12)] p-5 sm:p-6 shadow-warm-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-[#B54B32]" />
                    <h3 className="font-serif font-bold text-[#221E18] text-base">
                      Transparent AI Execution Audit Log
                    </h3>
                  </div>
                  <span className="text-xs text-[#7A705F] font-mono">
                    {aiAuditLogs.length} logged actions
                  </span>
                </div>
                <p className="text-xs text-[#7A705F] mb-4">
                  Every query sent to the Sounding Board assistant is logged here with the exact source scope and whether you accepted or discarded the proposed output.
                </p>

                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                  {aiAuditLogs.length === 0 ? (
                    <p className="text-xs text-[#7A705F] italic py-8 text-center bg-[#F1EAD9]/30 rounded-[5px]">
                      No AI sounding board actions recorded yet. All drafting remains 100% human authored.
                    </p>
                  ) : (
                    aiAuditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3 bg-[#F1EAD9]/40 rounded-[5px] border border-[rgba(34,30,24,0.08)] text-xs"
                      >
                        <div className="flex items-center justify-between mb-1 text-[11px]">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-[#221E18] uppercase text-[10px]">
                              [{log.action}]
                            </span>
                            <span className="text-[#7A705F] font-mono">{log.timestamp}</span>
                          </div>
                          <span
                            className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-mono uppercase ${
                              log.status === 'accepted'
                                ? 'bg-[#FAF6EE] text-[#35505F] border border-[rgba(34,30,24,0.12)] font-semibold'
                                : 'bg-[#F1EAD9] text-[#7A705F]'
                            }`}
                          >
                            {log.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#7A705F] font-serif italic truncate mb-1">
                          Scope: "{log.scopeSnippet}"
                        </div>
                        <div className="text-[10px] text-[#221E18] font-mono line-clamp-2 bg-[#FAF6EE] p-2 rounded-[4px] border border-[rgba(34,30,24,0.08)]">
                          {log.output}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DATA MANAGEMENT & STUDIO TOUR */}
          {activeTab === 'data' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Studio Tour & Onboarding Card */}
              <div className="bg-[#FAF6EE] rounded-[6px] border border-[rgba(34,30,24,0.12)] p-5 sm:p-6 shadow-warm-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-serif font-bold text-[#221E18] text-base">
                      Onboarding &amp; Studio Tour
                    </h3>
                    <p className="text-xs text-[#7A705F] mt-0.5">
                      Re-take the interactive orientation walkthrough to explore features like the Notion sidebar, mobile navigation bar, Corkboard beats, and local Vault storage.
                    </p>
                  </div>
                  {onOpenTour && (
                    <button
                      onClick={onOpenTour}
                      className="px-4 py-2 bg-[#B54B32] hover:bg-[#9E3E27] text-[#FAF6EE] rounded-[6px] text-xs font-semibold flex items-center justify-center gap-1.5 shadow-warm-xs transition-colors cursor-pointer shrink-0 min-h-[38px]"
                    >
                      <Sparkles size={14} /> Start Studio Tour
                    </button>
                  )}
                </div>
              </div>

              {/* Data Management & Project Reset Card */}
              <div className="bg-[#FAF6EE] rounded-[6px] border border-[rgba(34,30,24,0.12)] p-5 sm:p-6 shadow-warm-sm space-y-4">
                <h3 className="font-serif font-bold text-[#221E18] text-base">
                  Data Sovereignty &amp; Local Storage
                </h3>
                <p className="text-xs text-[#7A705F]">
                  Export a full machine-readable JSON archive of your project, or restore the initial demonstration project "The Glass Clockmaker of Prague."
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={onExportFullArchive}
                    className="px-4 py-2 bg-[#221E18] hover:bg-black text-[#FAF6EE] rounded-[6px] text-xs font-semibold flex items-center gap-1.5 shadow-warm-sm transition-colors cursor-pointer min-h-[38px]"
                  >
                    <Download size={13} /> Export Full JSON Archive
                  </button>

                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          'Reset all scenes and Story Bible back to the default "The Glass Clockmaker of Prague" demo?'
                        )
                      ) {
                        onResetToDemo();
                      }
                    }}
                    className="px-4 py-2 bg-[#F1EAD9] hover:bg-[#EAE4D6] text-[#221E18] border border-[rgba(34,30,24,0.12)] rounded-[6px] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer min-h-[38px]"
                  >
                    <RotateCcw size={13} /> Reset to Demo Project
                  </button>

                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          'Permanently delete all locally stored projects and scenes? This cannot be undone.'
                        )
                      ) {
                        onClearAllData();
                      }
                    }}
                    className="px-4 py-2 bg-[#FAF6EE] hover:bg-rose-50 text-[#B54B32] border border-[#B54B32]/30 rounded-[6px] text-xs font-medium flex items-center gap-1.5 transition-colors sm:ml-auto cursor-pointer min-h-[38px]"
                  >
                    <Trash2 size={13} /> Clear All Local Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
