import React, { useState, useRef, useEffect } from 'react';
import {
  FolderKanban,
  BookOpen,
  FileText,
  Compass,
  Layers,
  Sparkles,
  Sliders,
  Search,
  Plus,
  ChevronDown,
  ChevronRight,
  Check,
  PanelLeftClose,
  Download,
  Settings,
  Folder,
  Moon,
  Sun,
  X,
  Bookmark,
  FilePlus,
  FolderPlus
} from 'lucide-react';
import { ScreenType } from './Navigation';
import { Project, Chapter, Scene } from '../types';
import { VaultInfo } from '../services/storage/vaultTypes';
import { ThreadlineBadge, ThreadlineLogo } from './common/ThreadlineLogo';

export interface NotionSidebarProps {
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
  chapters?: Chapter[];
  scenes?: Scene[];
  activeSceneId?: string;
  onSelectScene?: (sceneId: string) => void;
  onAddScene?: () => void;
  onAddChapter?: () => void;
  isOpen: boolean;
  onClose: () => void;
  isMobile?: boolean;
}

export const NotionSidebar: React.FC<NotionSidebarProps> = ({
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
  onToggleTheme,
  chapters = [],
  scenes = [],
  activeSceneId,
  onSelectScene,
  onAddScene,
  onAddChapter,
  isOpen,
  onClose,
  isMobile = false
}) => {
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>(() => {
    // Expand active chapter by default
    const initial: Record<string, boolean> = {};
    chapters.forEach((chap, index) => {
      // expand first two chapters or the active one
      initial[chap.id] = index < 2 || chap.sceneIds.includes(activeSceneId || '');
    });
    return initial;
  });

  const workspaceMenuRef = useRef<HTMLDivElement>(null);

  // Close workspace switcher when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (workspaceMenuRef.current && !workspaceMenuRef.current.contains(e.target as Node)) {
        setShowWorkspaceMenu(false);
      }
    };
    if (showWorkspaceMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showWorkspaceMenu]);

  // Keep active scene's chapter expanded
  useEffect(() => {
    if (activeSceneId && chapters.length > 0) {
      const activeChap = chapters.find((c) => c.sceneIds.includes(activeSceneId));
      if (activeChap && !expandedChapters[activeChap.id]) {
        setExpandedChapters((prev) => ({ ...prev, [activeChap.id]: true }));
      }
    }
  }, [activeSceneId, chapters]);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  const handleItemClick = (screen: ScreenType) => {
    onNavigate(screen);
    if (isMobile) {
      onClose();
    }
  };

  const handleSceneClick = (sceneId: string) => {
    if (onSelectScene) {
      onSelectScene(sceneId);
    } else {
      onNavigate('editor');
    }
    if (isMobile) {
      onClose();
    }
  };

  // Primary workspace links (Notion top section)
  const primaryNavItems: {
    screen: ScreenType;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    count?: number;
  }[] = [
    { screen: 'home', label: 'Overview', icon: BookOpen },
    { screen: 'editor', label: 'Manuscript', icon: FileText },
    { screen: 'dashboard', label: 'Corkboard', icon: Layers },
    { screen: 'codex', label: 'Codex & Lore', icon: Compass },
    { screen: 'continuity', label: 'Continuity Inbox', icon: Sparkles, count: openContinuityCount },
    { screen: 'revisions', label: 'Snapshots & History', icon: Sliders }
  ];

  // Normalized active screen
  const normalizedScreen = currentScreen === 'bible' ? 'codex' : currentScreen;

  return (
    <aside
      id="notion-sidebar"
      className={`h-full flex flex-col bg-[#F6F2EA] border-r border-[rgba(34,30,24,0.1)] select-none text-[#221E18] transition-all duration-200 ease-in-out ${
        isMobile
          ? 'w-72 max-w-[85vw] shadow-warm-2xl z-50 fixed inset-y-0 left-0'
          : 'w-[252px] shrink-0 relative'
      }`}
    >
      {/* 1. WORKSPACE / PROJECT SWITCHER HEADER */}
      <div className="p-2 border-b border-[rgba(34,30,24,0.08)] relative" ref={workspaceMenuRef}>
        <div className="flex items-center justify-between gap-1">
          <button
            onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
            className="flex-1 flex items-center gap-2 p-1.5 rounded-[6px] hover:bg-[#ECE5D6] transition-colors text-left cursor-pointer min-w-0"
            title="Switch Workspace / Manuscript"
          >
            {/* Workspace Monogram Icon */}
            <div className="w-6 h-6 rounded-[5px] bg-[#EAE2D1] border border-[rgba(34,30,24,0.12)] flex items-center justify-center shrink-0 text-[#B54B32] shadow-xs">
              <ThreadlineBadge size={14} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-serif font-semibold text-xs text-[#221E18] truncate leading-tight">
                {projectTitle}
              </div>
              <div className="text-[10px] text-[#7A705F] font-sans truncate leading-none mt-0.5">
                Manuscript Workspace
              </div>
            </div>

            <ChevronDown size={13} className="text-[#7A705F] shrink-0" />
          </button>

          {/* On mobile only, provide close button */}
          {isMobile && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-[5px] text-[#7A705F] hover:text-[#221E18] hover:bg-[#ECE5D6] transition-colors cursor-pointer shrink-0"
              title="Close drawer"
              aria-label="Close drawer"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* WORKSPACE DROPDOWN POPOVER */}
        {showWorkspaceMenu && (
          <div className="absolute left-2 right-2 top-full mt-1 bg-[#FAF6EE] rounded-[8px] border border-[rgba(34,30,24,0.12)] shadow-warm-modal p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-2 py-1 text-[10px] font-mono font-bold text-[#7A705F] uppercase tracking-wider">
              Manuscripts
            </div>

            <div className="max-h-52 overflow-y-auto py-0.5 space-y-0.5">
              {allProjects.map((p) => {
                const isCurrent = p.id === activeProjectId;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      if (onSelectProject) onSelectProject(p.id);
                      setShowWorkspaceMenu(false);
                      if (isMobile) onClose();
                    }}
                    className={`w-full px-2.5 py-1.5 text-left text-xs flex items-center justify-between rounded-[5px] hover:bg-[#F1EAD9] transition-colors cursor-pointer ${
                      isCurrent ? 'bg-[#F1EAD9] font-medium text-[#221E18]' : 'text-[#7A705F] hover:text-[#221E18]'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="truncate font-serif">{p.title}</div>
                      <div className="text-[10px] text-[#7A705F] font-sans">
                        {p.type} {p.genre ? `· ${p.genre}` : ''}
                      </div>
                    </div>
                    {isCurrent && <Check size={13} className="text-[#B54B32] shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-1.5 mt-1 border-t border-[rgba(34,30,24,0.08)] space-y-0.5">
              {onStartNewProject && (
                <button
                  onClick={() => {
                    onStartNewProject();
                    setShowWorkspaceMenu(false);
                    if (isMobile) onClose();
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-[5px] text-left text-xs text-[#221E18] hover:bg-[#F1EAD9] cursor-pointer"
                >
                  <Plus size={13} className="text-[#B54B32]" />
                  <span>New Manuscript</span>
                </button>
              )}

              <button
                onClick={() => {
                  onNavigate('projects');
                  setShowWorkspaceMenu(false);
                  if (isMobile) onClose();
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-[5px] text-left text-xs text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9] cursor-pointer"
              >
                <FolderKanban size={13} />
                <span>All Manuscripts</span>
              </button>

              {onOpenVaultManager && (
                <button
                  onClick={() => {
                    onOpenVaultManager();
                    setShowWorkspaceMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-[5px] text-left text-xs text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9] cursor-pointer"
                >
                  <Folder size={13} />
                  <span>Local Vault Storage...</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. NOTION QUICK ACTIONS (SEARCH & NEW SCENE) */}
      <div className="p-2 space-y-0.5">
        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-[5px] text-xs text-[#7A705F] hover:text-[#221E18] hover:bg-[#ECE5D6] transition-colors cursor-pointer group"
            title="Search manuscript, scenes, codex (⌘K)"
          >
            <div className="flex items-center gap-2">
              <Search size={14} className="text-[#7A705F] group-hover:text-[#221E18]" />
              <span>Search</span>
            </div>
            <kbd className="text-[10px] font-mono px-1 py-0.2 rounded bg-[rgba(34,30,24,0.06)] text-[#7A705F]">
              ⌘K
            </kbd>
          </button>
        )}

        {onAddScene && (
          <button
            onClick={() => {
              onAddScene();
              if (isMobile) onClose();
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-[5px] text-xs text-[#7A705F] hover:text-[#221E18] hover:bg-[#ECE5D6] transition-colors cursor-pointer group"
            title="Quick add new scene"
          >
            <div className="flex items-center gap-2">
              <Plus size={14} className="text-[#B54B32]" />
              <span>New Scene</span>
            </div>
            <FilePlus size={12} className="text-[#7A705F] opacity-60 group-hover:opacity-100" />
          </button>
        )}
      </div>

      {/* 3. SCROLLABLE SIDEBAR NAVIGATION BODY */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-4 no-scrollbar">
        {/* SECTION: WORKSPACE VIEWS */}
        <div>
          <div className="px-2 pb-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#9E9484]">
            Workspace
          </div>
          <div className="space-y-0.5">
            {primaryNavItems.map((item) => {
              const isActive = normalizedScreen === item.screen;
              const Icon = item.icon;
              return (
                <button
                  key={item.screen}
                  onClick={() => handleItemClick(item.screen)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[5px] text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#EAE2D1] text-[#221E18] shadow-warm-xs'
                      : 'text-[#5C5346] hover:text-[#221E18] hover:bg-[#ECE5D6]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon size={14} className={isActive ? 'text-[#B54B32]' : 'text-[#7A705F]'} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-[#B54B32] text-[#FAF6EE] text-[10px] font-mono font-semibold">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION: MANUSCRIPT OUTLINE (EXPANDABLE NOTION PAGE TREE) */}
        {chapters.length > 0 && (
          <div>
            <div className="flex items-center justify-between px-2 pb-1">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#9E9484]">
                Outline
              </span>
              {onAddChapter && (
                <button
                  onClick={onAddChapter}
                  className="text-[#7A705F] hover:text-[#221E18] p-0.5 rounded hover:bg-[#ECE5D6] cursor-pointer"
                  title="Add Chapter"
                >
                  <FolderPlus size={12} />
                </button>
              )}
            </div>

            <div className="space-y-1">
              {chapters.map((chapter) => {
                const isExpanded = !!expandedChapters[chapter.id];
                const chapterScenes = scenes.filter(
                  (s) =>
                    s.chapterId === chapter.id ||
                    chapter.sceneIds.includes(s.id) ||
                    s.chapterNumber === chapter.number
                );

                return (
                  <div key={chapter.id} className="space-y-0.5">
                    {/* Chapter Header Item */}
                    <div className="flex items-center group rounded-[5px] hover:bg-[#ECE5D6] transition-colors pr-1">
                      <button
                        onClick={() => toggleChapter(chapter.id)}
                        className="p-1 text-[#7A705F] hover:text-[#221E18] rounded cursor-pointer"
                        title={isExpanded ? 'Collapse chapter' : 'Expand chapter'}
                      >
                        {isExpanded ? (
                          <ChevronDown size={12} className="transition-transform duration-100" />
                        ) : (
                          <ChevronRight size={12} className="transition-transform duration-100" />
                        )}
                      </button>

                      <button
                        onClick={() => {
                          if (chapterScenes[0]) {
                            handleSceneClick(chapterScenes[0].id);
                          } else {
                            handleItemClick('editor');
                          }
                        }}
                        className="flex-1 flex items-center gap-1.5 py-1 text-xs text-[#5C5346] hover:text-[#221E18] text-left truncate cursor-pointer font-serif"
                      >
                        <Bookmark size={11} className="text-[#B54B32] shrink-0 opacity-80" />
                        <span className="truncate">{chapter.title}</span>
                      </button>

                      <span className="text-[10px] font-mono text-[#9E9484] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        {chapterScenes.length}
                      </span>
                    </div>

                    {/* Indented Scenes List */}
                    {isExpanded && (
                      <div className="pl-4 space-y-0.5 border-l border-[rgba(34,30,24,0.08)] ml-2.5">
                        {chapterScenes.map((sc) => {
                          const isSceneActive =
                            normalizedScreen === 'editor' && activeSceneId === sc.id;
                          return (
                            <button
                              key={sc.id}
                              onClick={() => handleSceneClick(sc.id)}
                              className={`w-full flex items-center justify-between px-2 py-1 rounded-[4px] text-[11px] text-left transition-colors cursor-pointer ${
                                isSceneActive
                                  ? 'bg-[#EAE2D1] text-[#221E18] font-medium'
                                  : 'text-[#6B6152] hover:text-[#221E18] hover:bg-[#ECE5D6]'
                              }`}
                              title={sc.title}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                    sc.status === 'complete'
                                      ? 'bg-emerald-500'
                                      : sc.status === 'revised'
                                      ? 'bg-[#35505F]'
                                      : 'bg-amber-400'
                                  }`}
                                />
                                <span className="truncate">{sc.title}</span>
                              </div>

                              {sc.wordCount !== undefined && sc.wordCount > 0 && (
                                <span className="text-[9px] font-mono text-[#9E9484] shrink-0 ml-1">
                                  {sc.wordCount}w
                                </span>
                              )}
                            </button>
                          );
                        })}

                        {chapterScenes.length === 0 && (
                          <div className="px-2 py-0.5 text-[10px] italic text-[#9E9484]">
                            No scenes yet
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION: UTILITIES & SECONDARY */}
        <div>
          <div className="px-2 pb-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#9E9484]">
            Utilities
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => handleItemClick('projects')}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[5px] text-xs transition-colors cursor-pointer ${
                normalizedScreen === 'projects'
                  ? 'bg-[#EAE2D1] text-[#221E18] font-medium'
                  : 'text-[#5C5346] hover:text-[#221E18] hover:bg-[#ECE5D6]'
              }`}
            >
              <FolderKanban size={13} className="text-[#7A705F]" />
              <span>All Manuscripts</span>
            </button>

            {onOpenVaultManager && (
              <button
                onClick={() => {
                  onOpenVaultManager();
                  if (isMobile) onClose();
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-[5px] text-xs text-[#5C5346] hover:text-[#221E18] hover:bg-[#ECE5D6] transition-colors cursor-pointer"
                title="Folder Vault Storage"
              >
                <div className="flex items-center gap-2 truncate">
                  <Folder size={13} className="text-[#35505F]" />
                  <span className="truncate">
                    {vaultInfo && vaultInfo.mode !== 'browser-cached'
                      ? vaultInfo.folderName
                      : 'Local Vault'}
                  </span>
                </div>
                {vaultInfo && vaultInfo.mode !== 'browser-cached' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                )}
              </button>
            )}

            <button
              onClick={() => handleItemClick('export')}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[5px] text-xs transition-colors cursor-pointer ${
                normalizedScreen === 'export'
                  ? 'bg-[#EAE2D1] text-[#221E18] font-medium'
                  : 'text-[#5C5346] hover:text-[#221E18] hover:bg-[#ECE5D6]'
              }`}
            >
              <Download size={13} className="text-[#7A705F]" />
              <span>Export Manuscript</span>
            </button>

            <button
              onClick={() => handleItemClick('settings')}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[5px] text-xs transition-colors cursor-pointer ${
                normalizedScreen === 'settings'
                  ? 'bg-[#EAE2D1] text-[#221E18] font-medium'
                  : 'text-[#5C5346] hover:text-[#221E18] hover:bg-[#ECE5D6]'
              }`}
            >
              <Settings size={13} className="text-[#7A705F]" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. FOOTER: THREADLINE BRANDING & LOGO */}
      <div className="p-3 border-t border-[rgba(34,30,24,0.08)] bg-[#F1EAD9]/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ThreadlineBadge size={22} />
          <div className="flex flex-col leading-none">
            <span className="font-serif font-semibold text-xs text-[#221E18] tracking-tight">
              Threadline
            </span>
            <span className="text-[9px] font-sans font-medium uppercase tracking-[0.14em] text-[#7A705F] mt-0.5">
              Studio
            </span>
          </div>
        </div>

        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-[5px] text-[#7A705F] hover:text-[#221E18] hover:bg-[#ECE5D6] transition-colors cursor-pointer"
            title={theme === 'lamplight' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'lamplight' ? (
              <Sun size={14} className="text-[#B54B32]" />
            ) : (
              <Moon size={14} />
            )}
          </button>
        )}
      </div>
    </aside>
  );
};
