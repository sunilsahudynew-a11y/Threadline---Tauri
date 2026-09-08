import React from 'react';
import {
  PanelLeft,
  Search,
  Download,
  Moon,
  Sun,
  Folder,
  ChevronRight,
  Menu,
  PenTool,
  Edit3
} from 'lucide-react';
import { ScreenType } from './Navigation';
import { Scene } from '../types';
import { VaultInfo } from '../services/storage/vaultTypes';
import { AutosaveIndicator } from './common/AutosaveIndicator';

export interface NotionTopBarProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  projectTitle: string;
  activeScene?: Scene;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenMobileDrawer: () => void;
  onOpenSearch?: () => void;
  vaultInfo?: VaultInfo | null;
  onOpenVaultManager?: () => void;
  theme?: 'paper' | 'lamplight';
  onToggleTheme?: () => void;
  lastSavedText?: string;
}

export const NotionTopBar: React.FC<NotionTopBarProps> = ({
  currentScreen,
  onNavigate,
  projectTitle,
  activeScene,
  isSidebarOpen,
  onToggleSidebar,
  onOpenMobileDrawer,
  onOpenSearch,
  vaultInfo,
  onOpenVaultManager,
  theme = 'paper',
  onToggleTheme,
  lastSavedText
}) => {
  // Screen display labels
  const screenLabels: Record<ScreenType, string> = {
    home: 'Overview',
    editor: 'Manuscript Draft',
    editorial: 'Editor Mode',
    dashboard: 'Corkboard',
    codex: 'Codex & Lore',
    bible: 'Codex & Lore',
    ideation: 'Ideation & Frameworks',
    continuity: 'Continuity Inbox',
    revisions: 'Snapshots & History',
    projects: 'All Manuscripts',
    export: 'Export Manuscript',
    settings: 'Settings',
    'new-project': 'New Project',
    landing: 'Landing'
  };

  const currentLabel = screenLabels[currentScreen] || 'Workspace';

  return (
    <header
      id="notion-topbar"
      className="h-11 border-b border-[rgba(34,30,24,0.1)] bg-[#FAF6EE] flex items-center justify-between px-3 md:px-4 shrink-0 select-none z-20"
    >
      {/* LEFT: Sidebar Toggle & Breadcrumbs */}
      <div className="flex items-center gap-1.5 md:gap-2 min-w-0 overflow-hidden">
        {/* Desktop Sidebar Toggle Button */}
        <button
          onClick={onToggleSidebar}
          className="hidden md:flex items-center justify-center p-1.5 rounded-[5px] text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9] transition-colors cursor-pointer shrink-0"
          title={isSidebarOpen ? 'Collapse sidebar (⌘\\)' : 'Expand sidebar (⌘\\)'}
          aria-label="Toggle sidebar"
        >
          <PanelLeft size={16} />
        </button>

        {/* Mobile Hamburger / Drawer Toggle Button */}
        <button
          onClick={onOpenMobileDrawer}
          className="md:hidden flex items-center justify-center p-1.5 rounded-[5px] text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9] transition-colors cursor-pointer shrink-0 min-h-[36px] min-w-[36px]"
          title="Open navigation menu"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>

        <div className="h-4 w-px bg-[rgba(34,30,24,0.12)] hidden sm:block shrink-0" />

        {/* Notion-style Breadcrumb Hierarchy */}
        <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs text-[#7A705F] truncate">
          {/* Project Title Crumb */}
          <button
            onClick={() => onNavigate('home')}
            className="hover:text-[#221E18] hover:underline truncate max-w-[130px] sm:max-w-[180px] cursor-pointer font-serif"
            title={`Go to ${projectTitle} overview`}
          >
            {projectTitle}
          </button>

          <ChevronRight size={12} className="text-[#9E9484] shrink-0" />

          {/* Current Screen Crumb */}
          <button
            onClick={() => onNavigate(currentScreen)}
            className={`hover:text-[#221E18] truncate cursor-pointer font-medium ${
              currentScreen !== 'editor' ? 'text-[#221E18]' : ''
            }`}
          >
            {currentLabel}
          </button>

          {/* If on editor and scene is active, display scene title */}
          {currentScreen === 'editor' && activeScene && (
            <>
              <ChevronRight size={12} className="text-[#9E9484] shrink-0" />
              <span className="text-[#221E18] font-serif truncate max-w-[150px] sm:max-w-[220px]">
                {activeScene.title}
              </span>
            </>
          )}
        </nav>
      </div>

      {/* RIGHT: Quick Search, Vault Status, Export, Theme Toggle */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Workspace Switcher Pill */}
        <div className="hidden sm:flex items-center bg-[#F1EAD9] rounded-[6px] border border-[rgba(34,30,24,0.12)] p-0.5 text-xs font-medium mr-1">
          <button
            onClick={() => onNavigate('editor')}
            className={`px-2 py-0.5 rounded-[4px] transition-colors cursor-pointer flex items-center gap-1 ${
              currentScreen !== 'editorial'
                ? 'bg-[#221E18] text-[#FAF6EE] font-semibold shadow-2xs'
                : 'text-[#7A705F] hover:text-[#221E18]'
            }`}
            title="Switch to Author Drafting Workspace"
          >
            <PenTool size={11} />
            <span>Author</span>
          </button>
          <button
            onClick={() => onNavigate('editorial')}
            className={`px-2 py-0.5 rounded-[4px] transition-colors cursor-pointer flex items-center gap-1 ${
              currentScreen === 'editorial'
                ? 'bg-[#221E18] text-[#FAF6EE] font-semibold shadow-2xs'
                : 'text-[#7A705F] hover:text-[#221E18]'
            }`}
            title="Switch to Editor Desk Workspace (Working Copy)"
          >
            <Edit3 size={11} className={currentScreen === 'editorial' ? 'text-[#DE6346]' : ''} />
            <span>Editor</span>
          </button>
        </div>

        {/* Animated Autosave Indicator */}
        {lastSavedText && (
          <div className="hidden sm:flex items-center px-2 py-0.5 rounded-[4px] bg-[#F1EAD9]/60 border border-[rgba(34,30,24,0.06)] mr-1">
            <AutosaveIndicator lastSavedText={lastSavedText} compact={false} />
          </div>
        )}

        {/* Search Trigger */}
        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-2 py-1 text-xs text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9] rounded-[5px] transition-colors cursor-pointer"
            title="Search manuscript (⌘K)"
          >
            <Search size={14} />
            <span className="hidden sm:inline text-[11px]">Search</span>
            <kbd className="hidden lg:inline text-[9px] font-mono px-1 py-0.2 rounded bg-[rgba(34,30,24,0.06)] text-[#7A705F]">
              ⌘K
            </kbd>
          </button>
        )}

        {/* Vault Status Chip */}
        {onOpenVaultManager && (
          <button
            onClick={onOpenVaultManager}
            className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-[5px] text-xs transition-colors cursor-pointer ${
              vaultInfo && vaultInfo.mode !== 'browser-cached'
                ? 'text-[#221E18] bg-[#F1EAD9] border border-[rgba(53,80,95,0.25)]'
                : 'text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9]'
            }`}
            title={
              vaultInfo && vaultInfo.mode !== 'browser-cached'
                ? `Connected to folder: ${vaultInfo.folderName}`
                : 'Local Vault Storage'
            }
          >
            <Folder size={13} className={vaultInfo && vaultInfo.mode !== 'browser-cached' ? 'text-[#35505F]' : 'text-[#7A705F]'} />
            <span className="hidden xl:inline text-[11px] truncate max-w-[90px]">
              {vaultInfo && vaultInfo.mode !== 'browser-cached' ? vaultInfo.folderName : 'Vault'}
            </span>
          </button>
        )}

        {/* Theme Toggle */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-[5px] text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9] transition-colors cursor-pointer"
            title={theme === 'lamplight' ? 'Switch to Paper Mode' : 'Switch to Lamplight Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'lamplight' ? <Sun size={14} className="text-[#B54B32]" /> : <Moon size={14} />}
          </button>
        )}

        {/* Quick Export Button */}
        <button
          onClick={() => onNavigate('export')}
          className={`p-1.5 rounded-[5px] transition-colors cursor-pointer ${
            currentScreen === 'export'
              ? 'bg-[#B54B32] text-[#FAF6EE]'
              : 'text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9]'
          }`}
          title="Export Manuscript"
          aria-label="Export Manuscript"
        >
          <Download size={14} />
        </button>
      </div>
    </header>
  );
};
