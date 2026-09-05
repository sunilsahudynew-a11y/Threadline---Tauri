import React from 'react';
import { Sparkles } from 'lucide-react';

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
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1 p-1 bg-[#2D2A26] rounded-full shadow-2xl border border-white/10 z-20 select-none">
      <button
        onClick={onPrevScene}
        className="px-3 py-1.5 text-[10px] text-white font-bold uppercase tracking-wider rounded-full hover:bg-white/10 transition-all disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
        disabled={currentSceneIdx <= 0}
        title="Previous Scene"
      >
        Prev
      </button>
      <button
        onClick={onNextScene}
        className="px-3 py-1.5 text-[10px] text-white font-bold uppercase tracking-wider rounded-full hover:bg-white/10 transition-all disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
        disabled={currentSceneIdx >= totalScenes - 1}
        title="Next Scene"
      >
        Next
      </button>
      <button
        onClick={onToggleSearch}
        className={`px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer ${
          showSearch ? 'bg-white/20 text-[#D4A373]' : 'text-white hover:bg-white/10'
        }`}
      >
        Search
      </button>
      <button
        onClick={onToggleFocusMode}
        className="px-3.5 py-1.5 text-[10px] text-white font-bold uppercase tracking-wider rounded-full hover:bg-white/10 transition-all cursor-pointer"
      >
        {focusMode ? 'Exit' : 'Focus'}
      </button>
      <button
        onClick={onOpenAIPanel}
        className="px-4 py-1.5 text-[10px] text-[#D4A373] font-bold uppercase tracking-wider rounded-full hover:bg-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
      >
        <Sparkles size={11} /> AI Assistance
      </button>
    </div>
  );
};
