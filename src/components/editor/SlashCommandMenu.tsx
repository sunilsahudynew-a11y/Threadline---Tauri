import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface SlashCommand {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  keywords: string[];
  category?: 'blocks' | 'format';
  action: () => void;
}

export interface SlashMenuPosition {
  top?: number;
  bottom?: number;
  left: number;
  maxHeight?: number;
  openUpward?: boolean;
}

interface SlashCommandMenuProps {
  query: string;
  selectedIndex: number;
  position: SlashMenuPosition;
  onSelectCommand: (cmd: SlashCommand) => void;
  onClose: () => void;
  commands: SlashCommand[];
}

export const SlashCommandMenu: React.FC<SlashCommandMenuProps> = ({
  query,
  selectedIndex,
  position,
  onSelectCommand,
  onClose,
  commands
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Auto-scroll selected item into view
  useEffect(() => {
    if (!menuRef.current) return;
    const selectedEl = menuRef.current.querySelector('[data-selected="true"]');
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  // Click outside listener
  useEffect(() => {
    const handleDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleDown);
    return () => document.removeEventListener('mousedown', handleDown);
  }, [onClose]);

  // Constrain horizontal position
  const left = Math.max(12, Math.min(position.left, typeof window !== 'undefined' ? window.innerWidth - 324 : 600));

  // Determine vertical anchoring:
  // If openUpward: anchor to bottom so menu grows UPWARDS from above the slash line
  // If downward: anchor to top so menu grows DOWNWARDS from below the slash line
  const containerStyle: React.CSSProperties = {
    left: `${left}px`,
    maxHeight: position.maxHeight ? `${position.maxHeight}px` : '320px',
    ...(position.openUpward && position.bottom !== undefined
      ? { bottom: `${position.bottom}px` }
      : { top: `${position.top !== undefined ? Math.max(8, position.top) : 8}px` })
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.97, y: position.openUpward ? 6 : -6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: position.openUpward ? 4 : -4 }}
        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
        style={containerStyle}
        className={`fixed w-76 overflow-y-auto no-scrollbar bg-[#FAF6EE] rounded-xl border border-[#E5DEC9] shadow-warm-modal p-1.5 z-50 select-none ${
          position.openUpward ? 'origin-bottom-left' : 'origin-top-left'
        }`}
      >
        {/* Header with live search indicator & shortcut hints */}
        <div className="px-2.5 py-1.5 border-b border-[#E5DEC9] mb-1 flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A705F] font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B54B32] animate-pulse" />
            {query ? (
              <span>
                Filter: <strong className="text-[#B54B32]">/{query}</strong> ({commands.length})
              </span>
            ) : (
              'Insert Block'
            )}
          </span>
          <span className="text-[10px] font-mono text-[#7A705F]/70">
            ↑↓ ↵ select · esc
          </span>
        </div>

        {commands.length === 0 ? (
          <div className="py-6 px-3 text-center">
            <p className="text-xs text-[#7A705F] font-serif italic mb-1">
              No matching blocks for "/{query}"
            </p>
            <span className="text-[10px] font-mono text-[#7A705F]/70">
              Try "heading", "quote", "list", or "bold"
            </span>
          </div>
        ) : (
          <div className="space-y-0.5">
            {commands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  type="button"
                  data-selected={isSelected}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onSelectCommand(cmd);
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-all duration-100 cursor-pointer ${
                    isSelected
                      ? 'bg-[#F1EAD9] text-[#221E18] shadow-warm-sm'
                      : 'text-[#221E18] hover:bg-[#F1EAD9]/60'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? 'bg-[#FAF6EE] shadow-xs text-[#B54B32]'
                        : 'bg-[#F1EAD9] text-[#7A705F]'
                    }`}
                  >
                    {cmd.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium leading-snug truncate flex items-center justify-between">
                      <span>{cmd.label}</span>
                      {cmd.id === 'h1' && <span className="text-[10px] font-mono text-[#7A705F]/70">#</span>}
                      {cmd.id === 'h2' && <span className="text-[10px] font-mono text-[#7A705F]/70">##</span>}
                      {cmd.id === 'h3' && <span className="text-[10px] font-mono text-[#7A705F]/70">###</span>}
                      {cmd.id === 'quote' && <span className="text-[10px] font-mono text-[#7A705F]/70">&gt;</span>}
                      {cmd.id === 'bullet' && <span className="text-[10px] font-mono text-[#7A705F]/70">-</span>}
                      {cmd.id === 'number' && <span className="text-[10px] font-mono text-[#7A705F]/70">1.</span>}
                      {cmd.id === 'divider' && <span className="text-[10px] font-mono text-[#7A705F]/70">***</span>}
                      {cmd.id === 'bold' && <span className="text-[10px] font-mono text-[#7A705F]/70">**</span>}
                      {cmd.id === 'italic' && <span className="text-[10px] font-mono text-[#7A705F]/70">*</span>}
                      {cmd.id === 'highlight' && <span className="text-[10px] font-mono text-[#7A705F]/70">==</span>}
                    </div>
                    <div className="text-[10.5px] text-[#7A705F] truncate">
                      {cmd.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
