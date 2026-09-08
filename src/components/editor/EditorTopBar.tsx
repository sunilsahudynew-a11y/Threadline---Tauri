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
  History
} from 'lucide-react';
import { useToast } from '../Toast';
import { AutosaveIndicator } from '../common/AutosaveIndicator';

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
  onToggleHistory?: () => void;
  activeMetadataTab?: 'facts' | 'history';
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
  onToggleHistory,
  activeMetadataTab = 'facts',
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
      <div className="flex items-center justify-between px-4 sm:px-6 py-2 bg-[#FAF6EE]/95 backdrop-blur-xs border-b border-[rgba(34,30,24,0.12)] select-none z-20">
        <div className="flex items-center gap-3">
          <span className="font-serif text-sm font-semibold text-[#221E18] truncate max-w-sm">
            {scene.chapterNumber ? `Ch. ${scene.chapterNumber} · ` : ''}{scene.title}
          </span>
          <span className="text-[#7A705F]/40">·</span>
          <span className="text-xs font-mono text-[#7A705F]">
            {scene.wordCount} words ({readingTimeMin}m read)
          </span>
          <span className="text-[#7A705F]/40">·</span>
          <span className="text-[10px] text-[#B54B32] bg-[#B54B32]/10 px-2 py-0.5 rounded-full border border-[#B54B32]/30 uppercase tracking-wider font-mono">
            Focus Mode Active
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleFocusMode}
            className="text-xs font-medium text-[#221E18] hover:text-black px-3 py-1.5 rounded-[6px] border border-[rgba(34,30,24,0.12)] bg-[#F1EAD9] shadow-warm-sm transition-colors flex items-center gap-1.5 cursor-pointer min-h-[36px]"
          >
            <EyeOff size={13} /> Exit Focus (Esc)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-10 border-b border-[rgba(34,30,24,0.12)] bg-[#FAF6EE] px-3 sm:px-5 flex items-center justify-between text-xs select-none shrink-0 relative z-30">
      {/* LEFT: Outline toggle, scene navigation, scene status, word count */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
        {/* Left Nav toggle */}
        <button
          onClick={onToggleLeftNav}
          className={`p-1.5 rounded-[5px] transition-colors cursor-pointer shrink-0 min-h-[32px] min-w-[32px] flex items-center justify-center ${
            leftNavOpen ? 'text-[#221E18] bg-[#F1EAD9]' : 'text-[#7A705F] hover:text-[#221E18]'
          }`}
          title="Toggle Binder Outline"
        >
          <SplitSquareVertical size={14} />
        </button>

        {/* Scene Navigation Prev / Next */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            disabled={currentSceneIdx <= 0}
            onClick={() => onNavigateToScene(allScenes[currentSceneIdx - 1].id)}
            className="p-1 rounded text-[#7A705F] hover:text-[#221E18] disabled:opacity-30 disabled:hover:text-[#7A705F] cursor-pointer disabled:cursor-not-allowed min-h-[32px] min-w-[28px] flex items-center justify-center"
            title="Previous Scene"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-[11px] text-[#221E18] font-mono tracking-tight font-medium px-1 truncate max-w-[140px] sm:max-w-[220px]">
            {scene.order}. {scene.title}
          </span>
          <button
            disabled={currentSceneIdx >= allScenes.length - 1}
            onClick={() => onNavigateToScene(allScenes[currentSceneIdx + 1].id)}
            className="p-1 rounded text-[#7A705F] hover:text-[#221E18] disabled:opacity-30 disabled:hover:text-[#7A705F] cursor-pointer disabled:cursor-not-allowed min-h-[32px] min-w-[28px] flex items-center justify-center"
            title="Next Scene"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Chapter Context Pill */}
        {scene.chapterNumber && (
          <div
            className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[#F1EAD9] border border-[rgba(34,30,24,0.12)] text-[10px] font-mono text-[#7A705F] shrink-0"
            title={scene.chapterTitle ? `Chapter ${scene.chapterNumber}: ${scene.chapterTitle}` : `Chapter ${scene.chapterNumber}`}
          >
            <span className="font-semibold text-[#221E18]">Ch. {scene.chapterNumber}</span>
            {scene.chapterTitle && (
              <span className="truncate max-w-[120px] text-[#7A705F] font-sans">
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
                  ? 'bg-[#221E18] text-[#FAF6EE] border-[#221E18]'
                  : scene.status === 'revised'
                  ? 'bg-[#B54B32] text-[#FAF6EE] border-[#B54B32]'
                  : 'bg-[#35505F] text-[#FAF6EE] border-[#35505F]'
              }`}
              title="Change Scene Status"
            >
              {scene.status === 'complete' ? 'Final' : scene.status === 'revised' ? 'Revised' : 'Drafting'}
            </button>

            {showStatusMenu && (
              <div className="absolute top-full left-0 mt-1.5 w-36 bg-[#FAF6EE] rounded-[6px] border border-[rgba(34,30,24,0.15)] shadow-warm-modal py-1 z-50 animate-in fade-in duration-100">
                {[
                  { key: 'draft', label: 'Drafting' },
                  { key: 'revised', label: 'Revised' },
                  { key: 'complete', label: 'Final' }
                ].map((st) => (
                  <button
                    key={st.key}
                    onClick={() => {
                      onUpdateScene({ status: st.key as Scene['status'] });
                      setShowStatusMenu(false);
                      showToast(`Scene marked as ${st.label}`);
                    }}
                    className={`w-full px-3 py-1.5 text-left text-xs capitalize flex items-center justify-between hover:bg-[#F1EAD9] cursor-pointer min-h-[32px] ${
                      scene.status === st.key ? 'font-bold text-[#221E18]' : 'text-[#7A705F]'
                    }`}
                  >
                    <span>{st.label}</span>
                    {scene.status === st.key && <Check size={12} className="text-[#B54B32]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="h-3 w-px bg-[rgba(34,30,24,0.12)] hidden sm:block shrink-0" />

        {/* Word count & Reading time */}
        <span className="text-[#7A705F] font-mono text-[11px] hidden sm:inline shrink-0">
          {scene.wordCount} words <span className="opacity-40">·</span> {readingTimeMin}m read
        </span>

        <div className="h-3 w-px bg-[rgba(34,30,24,0.12)] hidden md:block shrink-0" />

        <div className="hidden md:flex items-center shrink-0">
          <AutosaveIndicator lastSavedText={lastSavedText} />
        </div>
      </div>

      {/* RIGHT: Scene Actions, Search, Focus Mode, Scene Facts Drawer */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={onToggleSearch}
          className={`p-1.5 rounded-[5px] transition-colors cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center ${
            showSearch ? 'bg-[#F1EAD9] text-[#221E18]' : 'text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9]'
          }`}
          title="Search in current scene"
        >
          <Search size={13} />
        </button>

        {/* Scene Actions (Duplicate, Copy, Delete) */}
        <div className="relative" ref={actionsRef}>
          <button
            onClick={() => setShowSceneActions(!showSceneActions)}
            className={`p-1.5 rounded-[5px] transition-colors cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center ${
              showSceneActions
                ? 'bg-[#F1EAD9] text-[#221E18] shadow-2xs'
                : 'text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9]'
            }`}
            title="Scene Actions"
            aria-expanded={showSceneActions}
          >
            <MoreHorizontal size={14} />
          </button>

          {showSceneActions && (
            <div className="absolute right-0 top-full mt-1.5 w-48 bg-[#FAF6EE] rounded-[6px] border border-[rgba(34,30,24,0.15)] shadow-warm-modal py-1 z-50 animate-in fade-in duration-100">
              <button
                onClick={handleCopyMarkdown}
                className="w-full px-3 py-1.5 text-left text-xs text-[#221E18] hover:bg-[#F1EAD9] flex items-center gap-2 cursor-pointer min-h-[32px]"
              >
                <Copy size={13} className="text-[#7A705F]" />
                <span>Copy as Markdown</span>
              </button>
              {onDuplicateScene && (
                <button
                  onClick={() => {
                    onDuplicateScene(scene.id);
                    setShowSceneActions(false);
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs text-[#221E18] hover:bg-[#F1EAD9] flex items-center gap-2 cursor-pointer min-h-[32px]"
                >
                  <Files size={13} className="text-[#7A705F]" />
                  <span>Duplicate Scene</span>
                </button>
              )}
              {onDeleteScene && allScenes.length > 1 && (
                <div className="border-t border-[rgba(34,30,24,0.12)] my-1 pt-1">
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete scene "${scene.title}"?`)) {
                        onDeleteScene(scene.id);
                      }
                      setShowSceneActions(false);
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs text-[#B54B32] hover:bg-[#F1EAD9] flex items-center gap-2 cursor-pointer min-h-[32px]"
                  >
                    <Trash2 size={13} />
                    <span>Delete Scene</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="h-3 w-px bg-[rgba(34,30,24,0.12)] mx-0.5" />

        {/* Focus Mode button */}
        <button
          onClick={onToggleFocusMode}
          className="text-[#B54B32] hover:text-[#9E3E27] text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 px-2 py-1 rounded-[5px] transition-colors cursor-pointer min-h-[32px]"
          title="Distraction-free Focus Mode"
        >
          <Eye size={13} />
          <span className="hidden sm:inline">Focus</span>
        </button>

        {/* Sidebar facts toggle */}
        <button
          onClick={onToggleSidebar}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[5px] font-medium text-xs transition-colors cursor-pointer min-h-[32px] ${
            sidebarOpen && activeMetadataTab === 'facts'
              ? 'bg-[#F1EAD9] text-[#221E18] font-semibold border border-[rgba(34,30,24,0.12)]'
              : 'text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9]'
          }`}
          title="Toggle Codex Facts Drawer"
        >
          <Compass size={13} />
          <span className="hidden md:inline">Scene Facts</span>
        </button>

        {/* History direct toggle button */}
        {onToggleHistory && (
          <button
            onClick={onToggleHistory}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] font-medium text-xs transition-colors cursor-pointer min-h-[32px] ${
              sidebarOpen && activeMetadataTab === 'history'
                ? 'bg-[#F1EAD9] text-[#221E18] font-semibold border border-[rgba(34,30,24,0.12)]'
                : 'text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9]'
            }`}
            title="Inspect Scene Version History"
          >
            <History size={13} className={sidebarOpen && activeMetadataTab === 'history' ? 'text-[#B54B32]' : 'text-[#7A705F]'} />
            <span className="hidden md:inline">History</span>
            {(scene.versions || []).length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#B54B32] text-[#FAF6EE] text-[9px] font-mono font-bold">
                {(scene.versions || []).length}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
