import React, { useState } from 'react';
import {
  Sparkles,
  Filter,
  CheckCircle2,
  X,
  MessageSquarePlus,
  HelpCircle,
  Eye,
  Trash2,
  BookOpen
} from 'lucide-react';
import { LineEditColorCode } from '../../types';
import { LINE_EDIT_CODES, LINE_EDIT_LIST, extractLineEditsFromMarkdown } from '../../utils/lineEditConstants';

interface LineEditLensPanelProps {
  markdown: string;
  sceneId?: string;
  sceneTitle?: string;
  onJumpToText?: (text: string) => void;
  onRemoveHighlight?: (text: string) => void;
  onChangeHighlightColor?: (text: string, newColor: LineEditColorCode) => void;
  onAddCommentFromHighlight?: (text: string, category: string) => void;
  onClose?: () => void;
  className?: string;
}

export const LineEditLensPanel: React.FC<LineEditLensPanelProps> = ({
  markdown,
  sceneId,
  sceneTitle,
  onJumpToText,
  onRemoveHighlight,
  onChangeHighlightColor,
  onAddCommentFromHighlight,
  onClose,
  className = ''
}) => {
  const [selectedFilter, setSelectedFilter] = useState<LineEditColorCode | 'all'>('all');
  const [showCraftLegend, setShowCraftLegend] = useState(false);

  const lineEdits = extractLineEditsFromMarkdown(markdown, sceneId, sceneTitle);

  // Group counts by color code
  const counts = LINE_EDIT_LIST.reduce((acc, item) => {
    acc[item.code] = lineEdits.filter((e) => e.code === item.code).length;
    return acc;
  }, {} as Record<LineEditColorCode, number>);

  const totalCount = lineEdits.length;

  const filteredEdits =
    selectedFilter === 'all'
      ? lineEdits
      : lineEdits.filter((e) => e.code === selectedFilter);

  return (
    <div
      className={`bg-[#FAF6EE] border-l border-[#E5DEC9] flex flex-col h-full overflow-hidden select-none ${className}`}
    >
      {/* Header */}
      <div className="p-3.5 border-b border-[#E5DEC9] bg-[#F1EAD9] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-700">
            <Sparkles size={13} />
          </div>
          <div>
            <h3 className="font-serif font-bold text-xs text-[#221E18]">
              Line Editing Lens
            </h3>
            <span className="text-[10px] text-[#7A705F]">
              {totalCount} editorial passage{totalCount === 1 ? '' : 's'} marked
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowCraftLegend(!showCraftLegend)}
            className="p-1 text-[#7A705F] hover:text-[#221E18] hover:bg-[#E5DEC9] rounded transition-colors"
            title="Editorial Color Code Taxonomy"
          >
            <HelpCircle size={14} />
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-[#7A705F] hover:text-[#221E18] hover:bg-[#E5DEC9] rounded transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Craft Legend Drawer (Toggled) */}
      {showCraftLegend && (
        <div className="p-3 bg-[#F6F1E6] border-b border-[#E5DEC9] space-y-2 text-[11px] animate-in slide-in-from-top duration-200">
          <div className="font-semibold text-[#221E18] flex items-center justify-between">
            <span>Color Code Editorial Taxonomy</span>
            <span className="text-[10px] font-mono text-[#7A705F]">Chicago &amp; Publishing Standard</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {LINE_EDIT_LIST.map((item) => (
              <div
                key={item.code}
                className="p-1.5 rounded bg-white border border-[#E5DEC9] space-y-0.5"
              >
                <div className="flex items-center gap-1.5 font-medium" style={{ color: item.hexColor }}>
                  <span className={`w-2 h-2 rounded-full ${item.pillBg}`} />
                  <span>{item.categoryName}</span>
                </div>
                <p className="text-[10px] text-[#7A705F] line-clamp-2 leading-snug">
                  {item.craftTip}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Density & Proportion Visual Bar */}
      {totalCount > 0 && (
        <div className="px-3.5 py-2.5 border-b border-[#E5DEC9] bg-[#FAF6EE] space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-[#7A705F]">
            <span>Editorial Balance</span>
            <span className="font-mono">{totalCount} total markers</span>
          </div>

          <div className="h-2 w-full rounded-full bg-[#E5DEC9] overflow-hidden flex">
            {LINE_EDIT_LIST.map((item) => {
              const count = counts[item.code] || 0;
              if (count === 0) return null;
              const pct = (count / totalCount) * 100;
              return (
                <div
                  key={item.code}
                  className={`h-full ${item.pillBg} transition-all duration-300`}
                  style={{ width: `${pct}%` }}
                  title={`${item.label}: ${count} (${Math.round(pct)}%)`}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Color Code Filter Badges */}
      <div className="p-2 border-b border-[#E5DEC9] bg-[#FAF6EE] flex items-center gap-1 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setSelectedFilter('all')}
          className={`px-2 py-1 rounded text-[10px] font-medium transition-all shrink-0 cursor-pointer ${
            selectedFilter === 'all'
              ? 'bg-[#221E18] text-[#FAF6EE]'
              : 'bg-[#F1EAD9] text-[#7A705F] hover:text-[#221E18]'
          }`}
        >
          All ({totalCount})
        </button>

        {LINE_EDIT_LIST.map((item) => {
          const count = counts[item.code] || 0;
          const isSelected = selectedFilter === item.code;
          return (
            <button
              key={item.code}
              type="button"
              onClick={() => setSelectedFilter(item.code)}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1 border ${
                isSelected
                  ? `${item.badgeBg} ${item.badgeText} ${item.badgeBorder} ring-1 ring-current font-bold`
                  : `${item.badgeBg} ${item.badgeText} ${item.badgeBorder} opacity-80 hover:opacity-100`
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${item.pillBg}`} />
              <span>{item.shortLabel}</span>
              <span className="font-mono opacity-80 font-normal">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Marked Excerpts List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredEdits.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-4 space-y-2 text-[#7A705F]">
            <BookOpen size={24} className="opacity-40" />
            <p className="text-xs font-serif italic">
              {totalCount === 0
                ? 'No line edits marked in this scene yet.'
                : `No passages marked for "${LINE_EDIT_CODES[selectedFilter as LineEditColorCode]?.shortLabel}".`}
            </p>
            <p className="text-[10px] max-w-[200px] leading-relaxed">
              Select any prose in the manuscript and use the floating line edit toolbar to mark passages with color codes.
            </p>
          </div>
        ) : (
          filteredEdits.map((item, idx) => {
            const def = LINE_EDIT_CODES[item.code] || LINE_EDIT_CODES.pacing;
            return (
              <div
                key={item.id}
                className="bg-white rounded-lg border border-[#E5DEC9] p-3 space-y-2 shadow-sm hover:border-[#B54B32]/40 transition-colors group"
              >
                {/* Header: Category Badge + Actions */}
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border flex items-center gap-1 ${def.badgeBg} ${def.badgeText} ${def.badgeBorder}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${def.pillBg}`} />
                    {def.categoryName}
                  </span>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onJumpToText && (
                      <button
                        type="button"
                        onClick={() => onJumpToText(item.text)}
                        className="p-1 text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9] rounded transition-colors"
                        title="Jump to passage in editor"
                      >
                        <Eye size={12} />
                      </button>
                    )}
                    {onAddCommentFromHighlight && (
                      <button
                        type="button"
                        onClick={() => onAddCommentFromHighlight(item.text, def.categoryName)}
                        className="p-1 text-[#7A705F] hover:text-[#B54B32] hover:bg-rose-50 rounded transition-colors"
                        title="Add editorial margin comment"
                      >
                        <MessageSquarePlus size={12} />
                      </button>
                    )}
                    {onRemoveHighlight && (
                      <button
                        type="button"
                        onClick={() => onRemoveHighlight(item.text)}
                        className="p-1 text-[#7A705F] hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Remove highlight markup"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {/* The marked excerpt */}
                <p
                  onClick={() => onJumpToText?.(item.text)}
                  className="font-serif text-xs text-[#221E18] leading-relaxed italic cursor-pointer hover:text-[#B54B32] transition-colors border-l-2 pl-2"
                  style={{ borderColor: def.hexColor }}
                >
                  &ldquo;{item.text}&rdquo;
                </p>

                {/* Quick Color Reassignment Bar */}
                {onChangeHighlightColor && (
                  <div className="pt-1.5 border-t border-[rgba(34,30,24,0.06)] flex items-center justify-between text-[10px] text-[#7A705F]">
                    <span>Reassign code:</span>
                    <div className="flex items-center gap-1">
                      {LINE_EDIT_LIST.map((target) => (
                        <button
                          key={target.code}
                          type="button"
                          onClick={() => onChangeHighlightColor(item.text, target.code)}
                          className={`w-3.5 h-3.5 rounded-full border transition-transform cursor-pointer ${
                            target.code === item.code
                              ? 'scale-125 ring-1 ring-black/40'
                              : 'hover:scale-110 opacity-70 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: target.hexColor }}
                          title={`Switch to ${target.label}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
