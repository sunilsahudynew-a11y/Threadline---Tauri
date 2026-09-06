import React from 'react';
import { Sparkles, ChevronLeft, ChevronRight, Search, Eye, EyeOff } from 'lucide-react';

interface EditorFloatingDockProps {
  currentSceneIdx: number;
  totalScenes: number;
  focusMode: boolean;
  showSearch: boolean;
  onPrevScene: () => void;
  onNextScene: () => void;
  onToggleSearch: () => void;
  onToggleFocusMode: () => void;
  onOpenAIPanel: () => void;
}

export const EditorFloatingDock: React.FC<EditorFloatingDockProps> = ({
  currentSceneIdx,
  totalScenes,
  focusMode,
  showSearch,
  onPrevScene,
  onNextScene,
  onToggleSearch,
  onToggleFocusMode,
  onOpenAIPanel
}) => {
  return (
    <div className="absolute bottom-16 md:bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-[#221E18] rounded-full shadow-warm-modal border border-[rgba(250,246,238,0.15)] z-20 select-none max-w-[92vw] overflow-x-auto no-scrollbar">
      <button
        onClick={onPrevScene}
        className="px-2.5 sm:px-3 py-1.5 text-[10px] text-[#FAF6EE] font-bold uppercase tracking-wider rounded-full hover:bg-white/10 transition-all disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed min-h-[32px] sm:min-h-[28px] flex items-center gap-0.5"
        disabled={currentSceneIdx <= 0}
        title="Previous Scene"
      >
        <ChevronLeft size={13} />
        <span className="hidden sm:inline">Prev</span>
      </button>
      <button
        onClick={onNextScene}
        className="px-2.5 sm:px-3 py-1.5 text-[10px] text-[#FAF6EE] font-bold uppercase tracking-wider rounded-full hover:bg-white/10 transition-all disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed min-h-[32px] sm:min-h-[28px] flex items-center gap-0.5"
        disabled={currentSceneIdx >= totalScenes - 1}
        title="Next Scene"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight size={13} />
      </button>
      <button
        onClick={onToggleSearch}
        className={`px-2.5 sm:px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer min-h-[32px] sm:min-h-[28px] flex items-center gap-1 ${
          showSearch ? 'bg-white/20 text-[#FAF6EE]' : 'text-[#FAF6EE] hover:bg-white/10'
        }`}
        title="Find in scene"
      >
        <Search size={12} />
        <span className="hidden sm:inline">Search</span>
      </button>
      <button
        onClick={onToggleFocusMode}
        className="px-2.5 sm:px-3.5 py-1.5 text-[10px] text-[#FAF6EE] font-bold uppercase tracking-wider rounded-full hover:bg-white/10 transition-all cursor-pointer min-h-[32px] sm:min-h-[28px] flex items-center gap-1"
        title="Toggle distraction-free focus"
      >
        {focusMode ? <EyeOff size={12} /> : <Eye size={12} />}
        <span>{focusMode ? 'Exit' : 'Focus'}</span>
      </button>
      <button
        onClick={onOpenAIPanel}
        className="px-3 sm:px-4 py-1.5 text-[10px] text-[#FAF6EE] bg-[#B54B32] font-bold uppercase tracking-wider rounded-full hover:bg-[#9E3E28] transition-all flex items-center gap-1.5 cursor-pointer min-h-[32px] sm:min-h-[28px] shrink-0"
        title="Open Sounding Board (AI Canon & Continuity Advisor)"
      >
        <Sparkles size={12} />
        <span className="hidden xs:inline">Sounding Board</span>
        <span className="xs:hidden">Advisor</span>
      </button>
    </div>
  );
};

