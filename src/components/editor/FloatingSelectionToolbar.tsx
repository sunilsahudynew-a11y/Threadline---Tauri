import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bold,
  Italic,
  Strikethrough,
  Highlighter,
  Compass,
  Scissors,
  MessageSquare,
  Sparkles,
  X
} from 'lucide-react';

interface FloatingSelectionToolbarProps {
  selectedText: string;
  position?: { top: number; left: number };
  onApplyFormat?: (prefix: string, suffix?: string) => void;
  onApplyHighlight?: (colorKey?: string) => void;
  onAddToStoryBible: () => void;
  onCutToCuttingRoom: () => void;
  onOpenComment: () => void;
  onConsultAI: () => void;
  onDismiss?: () => void;
}

export const FloatingSelectionToolbar: React.FC<FloatingSelectionToolbarProps> = ({
  selectedText,
  position,
  onApplyFormat,
  onApplyHighlight,
  onAddToStoryBible,
  onCutToCuttingRoom,
  onOpenComment,
  onConsultAI,
  onDismiss
}) => {
  if (!selectedText) return null;

  const maxTop = typeof window !== 'undefined' ? Math.max(10, window.innerHeight - 70) : 600;
  const maxLeft = typeof window !== 'undefined' ? Math.max(10, window.innerWidth - 380) : 600;
  const top = position ? Math.max(8, Math.min(position.top, maxTop)) : undefined;
  const left = position ? Math.max(8, Math.min(position.left, maxLeft)) : undefined;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.95 }}
        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
        style={position ? { top: `${top}px`, left: `${left}px` } : undefined}
        className={`${
          position ? 'fixed' : 'sticky top-3'
        } z-40 p-1.5 bg-[#1F1E1B]/95 backdrop-blur-md text-stone-100 rounded-xl shadow-xl shadow-black/20 flex items-center gap-1 text-xs border border-white/10 select-none`}
      >
        {/* Quick Format Actions */}
        {onApplyFormat && (
          <div className="flex items-center gap-0.5 pr-1 border-r border-white/15">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onApplyFormat('**', '**');
              }}
              className="p-1 hover:text-amber-300 hover:bg-white/10 rounded transition-colors cursor-pointer"
              title="Bold"
            >
              <Bold size={13} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onApplyFormat('*', '*');
              }}
              className="p-1 hover:text-amber-300 hover:bg-white/10 rounded transition-colors cursor-pointer"
              title="Italic"
            >
              <Italic size={13} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onApplyFormat('~~', '~~');
              }}
              className="p-1 hover:text-amber-300 hover:bg-white/10 rounded transition-colors cursor-pointer"
              title="Strikethrough"
            >
              <Strikethrough size={13} />
            </button>
            {onApplyHighlight && (
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onApplyHighlight('yellow');
                }}
                className="p-1 text-amber-300 hover:text-amber-200 hover:bg-white/10 rounded transition-colors cursor-pointer"
                title="Highlight"
              >
                <Highlighter size={13} />
              </button>
            )}
          </div>
        )}

        {/* Story Intelligence Actions */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onAddToStoryBible();
          }}
          className="hover:text-amber-200 text-stone-200 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/10 font-medium transition-colors cursor-pointer"
          title="Anchor character, place, or concept to Story Bible"
        >
          <Compass size={12} className="text-[#D4A373]" /> Bible
        </button>

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onCutToCuttingRoom();
          }}
          className="hover:text-rose-300 text-stone-200 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/10 font-medium transition-colors cursor-pointer"
          title="Remove text and preserve in Cutting Room"
        >
          <Scissors size={12} className="text-rose-400" /> Cut
        </button>

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onOpenComment();
          }}
          className="hover:text-white text-stone-300 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/10 font-medium transition-colors cursor-pointer"
          title="Add manuscript comment"
        >
          <MessageSquare size={12} /> Note
        </button>

        <div className="h-3.5 w-px bg-white/20 mx-0.5" />

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onConsultAI();
          }}
          className="hover:text-amber-200 text-[#D4A373] flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/10 font-medium transition-colors cursor-pointer"
          title="Consult scoped Sounding Board"
        >
          <Sparkles size={12} /> AI
        </button>

        {onDismiss && (
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              onDismiss();
            }}
            className="text-stone-400 hover:text-stone-100 p-1 rounded hover:bg-white/10 transition-colors ml-0.5 cursor-pointer"
            title="Dismiss toolbar"
          >
            <X size={12} />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
