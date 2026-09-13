import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  Settings,
  ChevronDown,
  Check,
  Plus,
  FolderKanban,
  BookOpen,
  FileText,
  Compass,
  Layers,
  Sparkles,
  Sliders,
  Search,
  Folder,
  Moon,
  Sun,
  MoreHorizontal,
  X,
  Smartphone,
  CheckCircle2,
  HardDrive,
  Lightbulb,
  Film
} from 'lucide-react';
import { Project } from '../types';
import { VaultInfo } from '../services/storage/vaultTypes';
import { ThreadlineBadge } from './common/ThreadlineLogo';

export { NotionSidebar } from './NotionSidebar';
export type { NotionSidebarProps } from './NotionSidebar';
export { NotionTopBar } from './NotionTopBar';
export type { NotionTopBarProps } from './NotionTopBar';

export type ScreenType =
  | 'projects'
  | 'home'
  | 'editor'
  | 'screenplay'
  | 'plan-lore'
  | 'editorial'
  | 'editor-review'
  | 'version-history'
  | 'diagnostics'
  | 'ideation'
  | 'bible'
  | 'codex'
  | 'dashboard'
  | 'continuity'
  | 'revisions'
  | 'research-vault'
  | 'export'
  | 'settings'
  | 'new-project'
  | 'landing';

interface NavigationProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  openContinuityCount: number;
  projectTitle: string;
  allProjects?: Project[];
  activeProjectId?: string;
  onSelectProject?: (id: string) => void;
  onStartNewProject?: () => void;
  onOpenSearch?: () => void;
  vaultInfo?: VaultInfo | null;
  onOpenVaultManager?: () => void;
  theme?: 'paper' | 'lamplight';
  onToggleTheme?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentScreen,
  onNavigate,
  openContinuityCount,
  projectTitle,
  allProjects = [],
  activeProjectId,
  onSelectProject,
  onStartNewProject,
  onOpenSearch,
  vaultInfo,
  onOpenVaultManager,
  theme = 'paper',
  onToggleTheme
}) => {
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showMobileMoreSheet, setShowMobileMoreSheet] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Normalize current screen for active tab check
  const normalizedScreen = currentScreen === 'bible' ? 'codex' : currentScreen;

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowProjectMenu(false);
      }
    };
    if (showProjectMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProjectMenu]);

  // Brand Lexicon navigation tabs (Brand v1.0 & Revamp Report §10)
  const navItems: { screen: ScreenType; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; count?: number }[] = [
    { screen: 'projects', label: 'Manuscripts', icon: FolderKanban },
    { screen: 'home', label: 'Overview', icon: BookOpen },
    { screen: 'editor', label: 'Prose', icon: FileText },
    { screen: 'screenplay', label: 'Screenplay', icon: Film },
    { screen: 'ideation', label: 'Ideation', icon: Lightbulb },
    { screen: 'dashboard', label: 'Corkboard', icon: Layers },
    { screen: 'codex', label: 'Codex & Lore', icon: Compass },
    { screen: 'continuity', label: 'Continuity', icon: Sparkles, count: openContinuityCount },
    { screen: 'revisions', label: 'Snapshots', icon: Sliders }
  ];

  // Mobile Bottom Tab Bar items (Revamp Report §4 - 5 items max, thumb-reachable)
  const mobileTabItems = [
    { screen: 'editor' as ScreenType, label: 'Write', icon: FileText },
    { screen: 'dashboard' as ScreenType, label: 'Card', icon: Layers },
    { screen: 'codex' as ScreenType, label: 'Codex', icon: Compass },
    { screen: 'continuity' as ScreenType, label: 'Continuity', icon: Sparkles, count: openContinuityCount },
  ];

  // Vault label and status helper
  const vaultLabel = vaultInfo && vaultInfo.mode !== 'browser-cached'
    ? vaultInfo.folderName
    : 'Local Vault';

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. TOP GLOBAL HEADER (48px Desktop, 44px Mobile)                          */}
      {/* ========================================================================= */}
      <header
        id="threadline-global-header"
        className="h-11 sm:h-12 border-b border-[rgba(34,30,24,0.12)] bg-[#FAF6EE] flex items-center justify-between px-3 md:px-5 shrink-0 sticky top-0 z-30 select-none transition-colors"
      >
        <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
          {/* Brand Logo & Name */}
          <button
            id="nav-brand-button"
            onClick={() => onNavigate('projects')}
            className="flex items-center gap-2 text-[#221E18] hover:opacity-90 transition-opacity cursor-pointer shrink-0 min-h-[44px] min-w-[44px] focus:outline-none"
            title="Threadline Manuscripts Hub"
          >
            <ThreadlineBadge size={26} />
            <div className="flex flex-col text-left leading-none">
              <span className="font-serif font-semibold text-sm tracking-tight text-[#221E18]">
                Threadline
              </span>
              <span className="hidden sm:inline text-[8px] font-sans font-medium tracking-[0.16em] uppercase text-[#7A705F]">
                Studio
              </span>
            </div>
          </button>

          <div className="h-4 w-px bg-[rgba(34,30,24,0.12)] hidden md:block shrink-0" />

          {/* Desktop Navigation Tabs (Hidden on small screens, served via Bottom Tab Bar) */}
          <nav className="hidden md:flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
            {navItems.map((item) => {
              const isActive = normalizedScreen === item.screen;
              const Icon = item.icon;
              return (
                <button
                  id={`nav-tab-${item.screen}`}
                  key={item.screen}
                  onClick={() => onNavigate(item.screen)}
                  className={`h-8 flex items-center gap-1.5 px-2.5 rounded-[6px] text-xs font-medium border shrink-0 cursor-pointer min-h-[32px] transition-colors duration-150 ${
                    isActive
                      ? 'bg-[#F1EAD9] text-[#221E18] font-medium border-[rgba(34,30,24,0.12)] shadow-warm-sm'
                      : 'text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9]/60 border-transparent'
                  }`}
                >
                  <Icon size={13} className={isActive ? 'text-[#B54B32]' : 'text-[#7A705F]'} />
                  <span>{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-[#B54B32] text-[#FAF6EE] text-[10px] font-mono font-medium">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* RIGHT CONTROLS: Touch Search, Manuscript Switcher, Lamplight Toggle, Export */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Touch-Friendly Search / Command Palette Button (Always accessible) */}
          {onOpenSearch && (
            <button
              id="nav-search-button"
              onClick={onOpenSearch}
              className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs text-[#7A705F] hover:text-[#221E18] bg-[#F1EAD9]/70 hover:bg-[#F1EAD9] border border-[rgba(34,30,24,0.12)] rounded-[6px] transition-colors cursor-pointer min-h-[36px] min-w-[36px]"
              title="Search manuscript, scenes, lore & commands (⌘K)"
              aria-label="Search manuscript"
            >
              <Search size={14} />
              <span className="hidden lg:inline text-[11px] font-medium">Search</span>
              <kbd className="hidden lg:inline text-[10px] font-mono text-[#7A705F] ml-0.5">⌘K</kbd>
            </button>
          )}

          {/* PROJECT SWITCHER DROPDOWN */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="nav-project-switcher-button"
              onClick={() => setShowProjectMenu(!showProjectMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-[#221E18] hover:bg-[#F1EAD9] bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[6px] transition-colors cursor-pointer max-w-[125px] sm:max-w-[190px] min-h-[36px]"
              title="Switch Manuscript"
            >
              <span className="font-serif italic font-medium truncate">{projectTitle}</span>
              <ChevronDown size={12} className="shrink-0 text-[#7A705F]" />
            </button>

            {showProjectMenu && (
              <div className="absolute right-0 mt-1.5 w-64 bg-[#FAF6EE] rounded-[6px] border border-[rgba(34,30,24,0.12)] shadow-warm-modal py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1 text-[10px] font-mono font-bold text-[#7A705F] uppercase tracking-wider">
                  Switch Manuscript
                </div>

                <div className="max-h-56 overflow-y-auto py-1">
                  {allProjects.map((p) => {
                    const isCurrent = p.id === activeProjectId;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          if (onSelectProject) onSelectProject(p.id);
                          setShowProjectMenu(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-[#F1EAD9] transition-colors cursor-pointer min-h-[44px] ${
                          isCurrent ? 'bg-[#F1EAD9] font-semibold text-[#221E18]' : 'text-[#7A705F] hover:text-[#221E18]'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="truncate font-serif">{p.title}</div>
                          <div className="text-[10px] text-[#7A705F] font-sans flex items-center gap-1.5">
                            <span>{p.type}</span>
                            {p.genre && (
                              <>
                                <span>·</span>
                                <span className="truncate">{p.genre}</span>
                              </>
                            )}
                          </div>
                        </div>
                        {isCurrent && <Check size={14} className="text-[#B54B32] shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-1.5 border-t border-[rgba(34,30,24,0.12)] px-2 space-y-0.5">
                  {onStartNewProject && (
                    <button
                      onClick={() => {
                        onStartNewProject();
                        setShowProjectMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-[6px] text-left text-xs text-[#221E18] hover:bg-[#F1EAD9] font-medium cursor-pointer min-h-[40px]"
                    >
                      <Plus size={13} className="text-[#B54B32]" />
                      <span>Create New Manuscript</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onNavigate('projects');
                      setShowProjectMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-[6px] text-left text-xs text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9] cursor-pointer min-h-[40px]"
                  >
                    <FolderKanban size={13} className="text-[#7A705F]" />
                    <span>Manage All Manuscripts</span>
                  </button>
                  {onOpenVaultManager && (
                    <button
                      onClick={() => {
                        onOpenVaultManager();
                        setShowProjectMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-[6px] text-left text-xs text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9] cursor-pointer min-h-[40px]"
                    >
                      <Folder size={13} className="text-[#7A705F]" />
                      <span>Folder Vault Storage...</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onNavigate('landing');
                      setShowProjectMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-[6px] text-left text-xs text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9] cursor-pointer min-h-[40px]"
                  >
                    <BookOpen size={13} className="text-[#7A705F]" />
                    <span>Landing Page</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Local Folder Vault Trigger (Honest status badge per Revamp Report §9) */}
          {onOpenVaultManager && (
            <button
              id="nav-vault-button"
              onClick={onOpenVaultManager}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] text-xs transition-colors cursor-pointer min-h-[36px] ${
                vaultInfo && vaultInfo.mode !== 'browser-cached'
                  ? 'text-[#221E18] bg-[#F1EAD9] border border-[#35505F]/40'
                  : 'text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9]'
              }`}
              title={
                vaultInfo && vaultInfo.mode !== 'browser-cached'
                  ? `Vault connected: ${vaultInfo.folderName}`
                  : 'Open Folder Vault Manager'
              }
            >
              <Folder size={13} className={vaultInfo && vaultInfo.mode !== 'browser-cached' ? 'text-[#35505F]' : 'text-[#7A705F]'} />
              <span className="hidden xl:inline text-[11px] font-medium max-w-[90px] truncate">
                {vaultLabel}
              </span>
            </button>
          )}

          {/* Lamplight Low-Light Theme Toggle (§7.2) */}
          {onToggleTheme && (
            <button
              id="nav-theme-toggle"
              onClick={onToggleTheme}
              className="p-2 rounded-[6px] text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9] transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
              title={theme === 'lamplight' ? 'Switch to Paper Mode (Day)' : 'Switch to Lamplight Mode (Night)'}
              aria-label="Toggle visual theme"
            >
              {theme === 'lamplight' ? <Sun size={15} className="text-[#B54B32]" /> : <Moon size={15} />}
            </button>
          )}

          {/* Quick Export Link */}
          <button
            id="nav-export-button"
            onClick={() => onNavigate('export')}
            className={`p-2 rounded-[6px] transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center ${
              normalizedScreen === 'export'
                ? 'text-[#FAF6EE] bg-[#B54B32]'
                : 'text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9]'
            }`}
            title="Export Manuscript"
            aria-label="Export Manuscript"
          >
            <Download size={15} />
          </button>

          {/* Settings Link */}
          <button
            id="nav-settings-button"
            onClick={() => onNavigate('settings')}
            className={`p-2 rounded-[6px] transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center ${
              normalizedScreen === 'settings'
                ? 'text-[#221E18] bg-[#F1EAD9]'
                : 'text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9]'
            }`}
            title="Settings & Preferences"
            aria-label="Settings"
          >
            <Settings size={15} />
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MOBILE BOTTOM TAB BAR (<768px, Thumb-Reachable in bottom 2/3)          */}
      {/* ========================================================================= */}
      <nav
        id="mobile-bottom-tab-bar"
        className="md:hidden fixed bottom-3 inset-x-3 z-40 h-14 bg-[#FAF6EE]/95 backdrop-blur-md border border-[rgba(34,30,24,0.16)] rounded-[14px] flex items-center justify-around px-2 select-none shadow-warm-lg"
      >
        {mobileTabItems.map((item) => {
          const isActive = normalizedScreen === item.screen;
          const Icon = item.icon;
          return (
            <button
              id={`mobile-tab-${item.screen}`}
              key={item.screen}
              onClick={() => onNavigate(item.screen)}
              className={`flex-1 flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors duration-150 ${
                isActive ? 'text-[#B54B32]' : 'text-[#7A705F] hover:text-[#221E18]'
              }`}
            >
              <div className="relative">
                <Icon size={18} />
                {item.count !== undefined && item.count > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full bg-[#B54B32] text-[#FAF6EE] text-[9px] font-mono font-medium">
                    {item.count}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 font-sans font-medium">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Overflow "More" Button */}
        <button
          id="mobile-tab-more"
          onClick={() => setShowMobileMoreSheet(true)}
          className={`flex-1 flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors ${
            showMobileMoreSheet ? 'text-[#B54B32]' : 'text-[#7A705F] hover:text-[#221E18]'
          }`}
        >
          <MoreHorizontal size={18} />
          <span className="text-[10px] mt-1 font-sans font-medium">More</span>
        </button>
      </nav>

      {/* ========================================================================= */}
      {/* 3. MOBILE "MORE" DRAWER BOTTOM SHEET (<768px)                             */}
      {/* ========================================================================= */}
      {showMobileMoreSheet && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-150">
          <div
            className="bg-[#FAF6EE] border-t border-[rgba(34,30,24,0.12)] rounded-t-2xl p-5 space-y-4 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom-6 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(34,30,24,0.12)]">
              <div className="flex items-center gap-2">
                <ThreadlineBadge size={22} />
                <span className="font-serif font-semibold text-sm text-[#221E18]">Workspace Navigation</span>
              </div>
              <button
                onClick={() => setShowMobileMoreSheet(false)}
                className="p-1.5 text-[#7A705F] hover:text-[#221E18] cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  onNavigate('home');
                  setShowMobileMoreSheet(false);
                }}
                className="flex items-center gap-3 p-3 bg-[#F1EAD9] rounded-[6px] text-left text-xs font-medium text-[#221E18] min-h-[44px]"
              >
                <BookOpen size={16} className="text-[#35505F]" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => {
                  onNavigate('ideation');
                  setShowMobileMoreSheet(false);
                }}
                className="flex items-center gap-3 p-3 bg-[#F1EAD9] rounded-[6px] text-left text-xs font-medium text-[#221E18] min-h-[44px]"
              >
                <Lightbulb size={16} className="text-[#B54B32]" />
                <span>Ideation</span>
              </button>

              <button
                onClick={() => {
                  onNavigate('projects');
                  setShowMobileMoreSheet(false);
                }}
                className="flex items-center gap-3 p-3 bg-[#F1EAD9] rounded-[6px] text-left text-xs font-medium text-[#221E18] min-h-[44px]"
              >
                <FolderKanban size={16} className="text-[#35505F]" />
                <span>Manuscripts</span>
              </button>

              <button
                onClick={() => {
                  onNavigate('revisions');
                  setShowMobileMoreSheet(false);
                }}
                className="flex items-center gap-3 p-3 bg-[#F1EAD9] rounded-[6px] text-left text-xs font-medium text-[#221E18] min-h-[44px]"
              >
                <Sliders size={16} className="text-[#B54B32]" />
                <span>Snapshots &amp; Cuts</span>
              </button>

              <button
                onClick={() => {
                  onNavigate('export');
                  setShowMobileMoreSheet(false);
                }}
                className="flex items-center gap-3 p-3 bg-[#F1EAD9] rounded-[6px] text-left text-xs font-medium text-[#221E18] min-h-[44px]"
              >
                <Download size={16} className="text-[#35505F]" />
                <span>Compile &amp; Export</span>
              </button>

              <button
                onClick={() => {
                  onNavigate('settings');
                  setShowMobileMoreSheet(false);
                }}
                className="flex items-center gap-3 p-3 bg-[#F1EAD9] rounded-[6px] text-left text-xs font-medium text-[#221E18] min-h-[44px]"
              >
                <Settings size={16} className="text-[#7A705F]" />
                <span>Settings</span>
              </button>

              {onOpenVaultManager && (
                <button
                  onClick={() => {
                    onOpenVaultManager();
                    setShowMobileMoreSheet(false);
                  }}
                  className="flex items-center gap-3 p-3 bg-[#F1EAD9] rounded-[6px] text-left text-xs font-medium text-[#221E18] min-h-[44px]"
                >
                  <Folder size={16} className="text-[#35505F]" />
                  <span>Vault Storage</span>
                </button>
              )}
            </div>

            {onToggleTheme && (
              <div className="pt-3 border-t border-[rgba(34,30,24,0.12)]">
                <button
                  onClick={() => {
                    onToggleTheme();
                    setShowMobileMoreSheet(false);
                  }}
                  className="w-full flex items-center justify-between p-3 bg-[#F1EAD9] rounded-[6px] text-xs font-medium text-[#221E18] min-h-[44px]"
                >
                  <span className="flex items-center gap-2.5">
                    {theme === 'lamplight' ? <Sun size={16} className="text-[#B54B32]" /> : <Moon size={16} />}
                    <span>{theme === 'lamplight' ? 'Day Paper Mode' : 'Lamplight Night Mode'}</span>
                  </span>
                  <span className="text-[11px] font-mono text-[#7A705F]">
                    {theme === 'lamplight' ? 'Active' : 'Dim'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
