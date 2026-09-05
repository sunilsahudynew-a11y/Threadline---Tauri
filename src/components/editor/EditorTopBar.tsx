import React, { useState, useRef, useEffect } from 'react';
import { Scene } from '../../types';
import {
  SplitSquareVertical,
  ChevronLeft,
  ChevronRight,
  Check,
  Search,
  Eye,
  EyeOff,
  Compass,
  MoreHorizontal,
  Copy,
  Trash2,
  Files,
  Tag
} from 'lucide-react';
import { useToast } from '../Toast';

interface EditorTopBarProps {
  scene: Scene;
  allScenes: Scene[];
  currentSceneIdx: number;
  lastSavedText: string;
  focusMode: boolean;
  leftNavOpen: boolean;
  sidebarOpen: boolean;
  showSearch: boolean;
  onToggleFocusMode: () => void;
  onToggleLeftNav: () => void;
  onToggleSidebar: () => void;
  onToggleSearch: () => void;
  onNavigateToScene: (sceneId: string) => void;
  onUpdateScene?: (fields: Partial<Scene>) => void;
  onDuplicateScene?: (sceneId: string) => void;
  onDeleteScene?: (sceneId: string) => void;
}

export const EditorTopBar: React.FC<EditorTopBarProps> = ({
  scene,
  allScenes,
  currentSceneIdx,
  lastSavedText,
  focusMode,
  leftNavOpen,
  sidebarOpen,
  showSearch,
  onToggleFocusMode,
  onToggleLeftNav,
  onToggleSidebar,
  onToggleSearch,
  onNavigateToScene,
  onUpdateScene,
  onDuplicateScene,
  onDeleteScene
}) => {
  const { showToast } = useToast();
  const [showSceneActions, setShowSceneActions] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  const readingTimeMin = Math.max(1, Math.ceil(scene.wordCount / 225));

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setShowSceneActions(false);
      }
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setShowStatusMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(`# ${scene.title}\n\n${scene.proseContent}`);
    showToast('Scene copied to clipboard as Markdown');
    setShowSceneActions(false);
  };

  if (focusMode) {
    return (
      <div className="flex items-center justify-between px-6 py-2.5 bg-white/90 backdrop-blur-xs border-b border-[#EBE8E2] select-none z-20">
        <div className="flex items-center gap-3">
          <span className="font-serif text-sm font-semibold text-[#1A1814] truncate max-w-sm">
            {scene.chapterNumber ? `Ch. ${scene.chapterNumber} · ` : ''}{scene.title}
          </span>
          <span className="text-[#EBE8E2]">·</span>
          <span className="text-xs font-mono text-[#8C887F]">
            {scene.wordCount} words ({readingTimeMin}m read)
          </span>
          <span className="text-[#EBE8E2]">·</span>
          <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 uppercase tracking-wider font-mono">
            Focus Mode Active
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleFocusMode}
            className="text-xs font-medium text-[#2D2A26] hover:text-black px-3 py-1.5 rounded-lg border border-[#EBE8E2] bg-[#FAF9F5] shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <EyeOff size={13} /> Exit Focus (Esc)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-10 border-b border-[#EBE8E2] bg-white px-4 md:px-6 flex items-center justify-between text-xs select-none shrink-0 z-10">
      {/* LEFT: Outline toggle, scene navigation, scene status, word count */}
      <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
        {/* Left Nav toggle */}
        <button
          onClick={onToggleLeftNav}
          className={`p-1.5 rounded-md transition-colors cursor-pointer shrink-0 ${
            leftNavOpen ? 'text-[#2D2A26] bg-[#F1F0EC]' : 'text-[#8C887F] hover:text-[#2D2A26]'
          }`}
          title="Toggle Scene Outline Drawer"
        >
          <SplitSquareVertical size={14} />
        </button>

        {/* Scene Navigation Prev / Next */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            disabled={currentSceneIdx <= 0}
            onClick={() => onNavigateToScene(allScenes[currentSceneIdx - 1].id)}
            className="p-1 rounded text-[#8C887F] hover:text-[#2D2A26] disabled:opacity-30 disabled:hover:text-[#8C887F] cursor-pointer disabled:cursor-not-allowed"
            title="Previous Scene"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-[11px] text-[#4A4741] font-mono tracking-tight font-medium px-1 truncate max-w-[160px] sm:max-w-[200px]">
            {scene.order}. {scene.title}
          </span>
          <button
            disabled={currentSceneIdx >= allScenes.length - 1}
            onClick={() => onNavigateToScene(allScenes[currentSceneIdx + 1].id)}
            className="p-1 rounded text-[#8C887F] hover:text-[#2D2A26] disabled:opacity-30 disabled:hover:text-[#8C887F] cursor-pointer disabled:cursor-not-allowed"
            title="Next Scene"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Chapter Context Pill */}
        {scene.chapterNumber && (
          <div
            className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#FAF9F5] border border-[#EBE8E2] text-[10px] font-mono text-[#736F66] shrink-0"
            title={scene.chapterTitle ? `Chapter ${scene.chapterNumber}: ${scene.chapterTitle}` : `Chapter ${scene.chapterNumber}`}
          >
            <span className="font-semibold text-[#3C3933]">Ch. {scene.chapterNumber}</span>
            {scene.chapterTitle && (
              <span className="truncate max-w-[120px] text-[#8C887F] font-sans">
                {scene.chapterTitle}
              </span>
            )}
          </div>
        )}

        {/* Scene Status Dropdown Tag */}
        {onUpdateScene && (
          <div className="relative shrink-0" ref={statusRef}>
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer border ${
                scene.status === 'complete'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : scene.status === 'revised'
                  ? 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100'
                  : 'bg-[#F2EFE9] text-[#736F66] border-[#E5E1D8] hover:bg-[#EBE8E2]'
              }`}
              title="Change Scene Status"
            >
              {scene.status}
            </button>

            {showStatusMenu && (
              <div className="absolute top-full left-0 mt-1 w-32 bg-white rounded-lg border border-[#EBE8E2] shadow-lg py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                {(['draft', 'revised', 'complete'] as Scene['status'][]).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      onUpdateScene({ status: st });
                      setShowStatusMenu(false);
                      showToast(`Scene marked as ${st}`);
                    }}
                    className={`w-full px-3 py-1.5 text-left text-xs capitalize flex items-center justify-between hover:bg-[#FAF9F5] ${
                      scene.status === st ? 'font-bold text-[#1A1814]' : 'text-[#736F66]'
                    }`}
                  >
                    <span>{st}</span>
                    {scene.status === st && <Check size={12} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Chapter context badge */}
        {(scene.chapterTitle || scene.chapterNumber) && (
          <div className="hidden lg:flex items-center gap-1.5 shrink-0">
            <span
              className="text-[11px] font-mono text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200/80 truncate max-w-[170px]"
              title={`Chapter ${scene.chapterNumber || ''}: ${scene.chapterTitle || ''}`}
            >
              Ch. {scene.chapterNumber || ''} {scene.chapterTitle ? `· ${scene.chapterTitle}` : ''}
            </span>
            {scene.actOrPhase && (
              <span className="hidden xl:inline-block text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200/70 truncate max-w-[120px]">
                {scene.actOrPhase}
              </span>
            )}
          </div>
        )}

        <div className="h-3 w-px bg-[#EBE8E2] hidden sm:block shrink-0" />

        {/* Word count & Reading time */}
        <span className="text-[#8C887F] font-mono text-[11px] hidden sm:inline shrink-0">
          {scene.wordCount} words <span className="text-[#AAA69F]">·</span> {readingTimeMin}m read
        </span>

        <div className="h-3 w-px bg-[#EBE8E2] hidden md:block shrink-0" />

        <span className="text-emerald-700 hidden md:flex items-center gap-1 font-medium text-[11px] shrink-0">
          <Check size={12} /> {lastSavedText}
        </span>
      </div>

      {/* RIGHT: Scene Actions menu, Search Toggle, Focus Mode, and Facts Drawer Toggle */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Search Toggle in Scene */}
        <button
          onClick={onToggleSearch}
          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
            showSearch ? 'bg-[#F1F0EC] text-[#2D2A26]' : 'text-[#8C887F] hover:text-[#2D2A26] hover:bg-[#FAF9F5]'
          }`}
          title="Search in current scene"
        >
          <Search size={13} />
        </button>

        {/* Scene Actions (Duplicate, Copy, Delete) */}
        <div className="relative" ref={actionsRef}>
          <button
            onClick={() => setShowSceneActions(!showSceneActions)}
            className="p-1.5 rounded-md text-[#8C887F] hover:text-[#2D2A26] hover:bg-[#FAF9F5] transition-colors cursor-pointer"
            title="Scene Actions"
          >
            <MoreHorizontal size={14} />
          </button>

          {showSceneActions && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-[#EBE8E2] shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={handleCopyMarkdown}
                className="w-full px-3 py-1.5 text-left text-xs text-[#2D2A26] hover:bg-[#FAF9F5] flex items-center gap-2 cursor-pointer"
              >
                <Copy size={13} className="text-[#8C887F]" />
                <span>Copy as Markdown</span>
              </button>
              {onDuplicateScene && (
                <button
                  onClick={() => {
                    onDuplicateScene(scene.id);
                    setShowSceneActions(false);
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs text-[#2D2A26] hover:bg-[#FAF9F5] flex items-center gap-2 cursor-pointer"
                >
                  <Files size={13} className="text-[#8C887F]" />
                  <span>Duplicate Scene</span>
                </button>
              )}
              {onDeleteScene && allScenes.length > 1 && (
                <div className="border-t border-[#EBE8E2] my-1 pt-1">
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete scene "${scene.title}"?`)) {
                        onDeleteScene(scene.id);
                      }
                      setShowSceneActions(false);
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Delete Scene</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="h-3 w-px bg-[#EBE8E2] mx-0.5" />

        {/* Focus Mode button */}
        <button
          onClick={onToggleFocusMode}
          className="text-[#B37B47] hover:text-[#8F5A29] text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 px-2 py-1 rounded-md transition-colors cursor-pointer"
          title="Distraction-free Focus Mode"
        >
          <Eye size={13} />
          <span className="hidden sm:inline">Focus</span>
        </button>

        {/* Sidebar facts toggle */}
        <button
          onClick={onToggleSidebar}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-medium text-xs transition-colors cursor-pointer ${
            sidebarOpen
              ? 'bg-[#F1F0EC] text-[#2D2A26] font-semibold'
              : 'text-[#8C887F] hover:text-[#2D2A26] hover:bg-[#FAF9F5]'
          }`}
          title="Toggle Story Bible Facts Drawer"
        >
          <Compass size={13} />
          <span className="hidden md:inline">Scene Facts</span>
        </button>
      </div>
    </div>
  );
};
