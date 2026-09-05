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
  HardDrive
} from 'lucide-react';
import { Project } from '../types';
import { VaultInfo } from '../services/storage/vaultTypes';
import { ThreadlineBadge } from './common/ThreadlineLogo';

export type ScreenType =
  | 'projects'
  | 'home'
  | 'editor'
  | 'bible'
  | 'dashboard'
  | 'continuity'
  | 'revisions'
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
  onOpenVaultManager
}) => {
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Brand Lexicon (Page 05: Manuscript, Corkboard, Codex & Lore Vault, Snapshots)
  const navItems: { screen: ScreenType; label: string; icon: any; count?: number }[] = [
    { screen: 'projects', label: 'Manuscripts', icon: FolderKanban },
    { screen: 'home', label: 'Overview', icon: BookOpen },
    { screen: 'editor', label: 'Manuscript', icon: FileText },
    { screen: 'dashboard', label: 'Corkboard', icon: Layers },
    { screen: 'bible', label: 'Codex & Lore', icon: Compass },
    { screen: 'continuity', label: 'Continuity', icon: Sparkles, count: openContinuityCount },
    { screen: 'revisions', label: 'Snapshots', icon: Sliders }
  ];

  return (
    <header className="h-12 border-b border-[#E5DEC9] bg-[#FAF6EE] flex items-center justify-between px-3 md:px-5 shrink-0 sticky top-0 z-30 select-none">
      <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
        {/* Brand / Logo link to Manuscripts Root */}
        <button
          onClick={() => onNavigate('projects')}
          className="flex items-center gap-2.5 text-[#221E18] hover:opacity-90 transition-opacity cursor-pointer shrink-0 group"
          title="Threadline Studio Hub"
        >
          <ThreadlineBadge size={26} />
          <div className="hidden sm:flex flex-col text-left leading-none">
            <span className="font-serif font-semibold text-sm tracking-tight text-[#221E18]">
              Threadline
            </span>
            <span className="text-[8px] font-sans font-medium tracking-[0.16em] uppercase text-[#7A705F]">
              Studio
            </span>
          </div>
        </button>

        <div className="h-4 w-px bg-[#E5DEC9] hidden sm:block shrink-0" />

        {/* Navigation Tabs (Smooth horizontally scrollable on mobile) */}
        <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-1">
          {navItems.map((item) => {
            const isActive = currentScreen === item.screen;
            const Icon = item.icon;
            return (
              <button
                key={item.screen}
                onClick={() => onNavigate(item.screen)}
                className={`h-8 flex items-center gap-1.5 px-2.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#F1EAD9] text-[#221E18] font-semibold border border-[#E5DEC9] shadow-warm-sm'
                    : 'text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9]/60'
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

      {/* RIGHT: Search shortcut, project dropdown & settings */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Quick Command Palette Button */}
        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-2 py-1 text-xs text-[#7A705F] hover:text-[#221E18] bg-[#F1EAD9]/70 hover:bg-[#F1EAD9] border border-[#E5DEC9] rounded-lg transition-colors cursor-pointer"
            title="Search manuscript and commands (Cmd+K)"
          >
            <Search size={13} />
            <kbd className="hidden lg:inline text-[10px] font-mono text-[#7A705F]">⌘K</kbd>
          </button>
        )}

        {/* INTERACTIVE PROJECT SWITCHER DROPDOWN */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowProjectMenu(!showProjectMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#221E18] hover:bg-[#F1EAD9] bg-[#FAF6EE] border border-[#E5DEC9] rounded-lg transition-colors cursor-pointer max-w-[150px] md:max-w-[210px]"
            title="Switch Manuscript"
          >
            <span className="font-serif italic font-medium truncate">{projectTitle}</span>
            <ChevronDown size={12} className="shrink-0 text-[#7A705F]" />
          </button>

          {showProjectMenu && (
            <div className="absolute right-0 mt-1.5 w-64 bg-[#FAF6EE] rounded-xl border border-[#E5DEC9] shadow-warm-modal py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
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
                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-[#F1EAD9] transition-colors cursor-pointer ${
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

              <div className="pt-1.5 border-t border-[#E5DEC9] px-2 space-y-0.5">
                {onStartNewProject && (
                  <button
                    onClick={() => {
                      onStartNewProject();
                      setShowProjectMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs text-[#221E18] hover:bg-[#F1EAD9] font-medium cursor-pointer"
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
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9] cursor-pointer"
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
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9] cursor-pointer"
                  >
                    <Folder size={13} className="text-[#8C6D3F]" />
                    <span>Folder Vault Storage...</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    onNavigate('landing');
                    setShowProjectMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9] cursor-pointer"
                >
                  <BookOpen size={13} className="text-[#7A705F]" />
                  <span>Landing Page (/landing)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Local Folder Vault Trigger */}
        {onOpenVaultManager && (
          <button
            onClick={onOpenVaultManager}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
              vaultInfo && vaultInfo.mode !== 'browser-cached'
                ? 'text-[#221E18] bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200'
                : 'text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9]'
            }`}
            title={
              vaultInfo && vaultInfo.mode !== 'browser-cached'
                ? `Vault folder connected: ${vaultInfo.folderName}`
                : 'Connect local project folder (Obsidian-style vault)'
            }
          >
            <Folder size={13} className={vaultInfo && vaultInfo.mode !== 'browser-cached' ? 'text-emerald-700' : 'text-[#7A705F]'} />
            <span className="hidden xl:inline text-[11px] font-medium max-w-[90px] truncate">
              {vaultInfo && vaultInfo.mode !== 'browser-cached' ? vaultInfo.folderName : 'Vault'}
            </span>
          </button>
        )}

        {/* Quick Export & Settings Links */}
        <button
          onClick={() => onNavigate('export')}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            currentScreen === 'export'
              ? 'text-[#FAF6EE] bg-[#B54B32]'
              : 'text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9]'
          }`}
          title="Export Manuscript"
        >
          <Download size={14} />
        </button>

        <button
          onClick={() => onNavigate('settings')}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            currentScreen === 'settings'
              ? 'text-[#221E18] bg-[#F1EAD9]'
              : 'text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9]'
          }`}
          title="Settings &amp; Workspace"
        >
          <Settings size={14} />
        </button>
      </div>
    </header>
  );
};

