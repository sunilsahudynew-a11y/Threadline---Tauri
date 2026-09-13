import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, AlertTriangle, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { ContinuityIssue } from '../../types';

interface InsightsBadgeProps {
  issues?: ContinuityIssue[];
  issueCount?: number;
  onOpenFullInsights?: () => void;
  onClick?: () => void;
  onNavigateToScene?: (sceneId: string) => void;
}

export const InsightsBadge: React.FC<InsightsBadgeProps> = ({
  issues = [],
  issueCount,
  onOpenFullInsights,
  onClick,
  onNavigateToScene
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const openIssues = issues.filter((i) => i.status === 'open');
  const count = issueCount !== undefined ? issueCount : openIssues.length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Chip */}
      <button
        onClick={() => {
          if (onClick) {
            onClick();
          } else {
            setIsOpen(!isOpen);
          }
        }}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-[5px] text-xs transition-colors cursor-pointer ${
          count > 0
            ? 'bg-[#B54B32]/10 text-[#B54B32] hover:bg-[#B54B32]/15 border border-[#B54B32]/20 font-medium'
            : 'text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9]'
        }`}
        title={`${count} open continuity observations (Click to preview)`}
      >
        <Sparkles size={13} className={count > 0 ? 'text-[#B54B32]' : 'text-[#7A705F]'} />
        <span className="text-[11px] font-mono font-semibold">
          {count} {count === 1 ? 'flag' : 'flags'}
        </span>
      </button>

      {/* Inline Preview Flyout Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-80 sm:w-96 rounded-lg bg-[#FAF6EE] border border-[#DDD5C5] shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[rgba(34,30,24,0.1)]">
            <div className="flex items-center gap-1.5">
              <Sparkles size={13} className="text-[#B54B32]" />
              <span className="font-serif font-bold text-[#221E18]">
                Diagnostic Insights ({count} active)
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#7A705F] hover:text-[#221E18] p-0.5 rounded cursor-pointer"
            >
              <X size={13} />
            </button>
          </div>

          {openIssues.length === 0 ? (
            <div className="py-4 text-center text-[#7A705F]">
              <CheckCircle2 size={18} className="mx-auto mb-1 text-emerald-600" />
              <p className="font-semibold text-[#221E18]">All clear!</p>
              <p className="text-[11px] mt-0.5">No conflicting canon statements detected.</p>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {openIssues.slice(0, 4).map((issue) => (
                <div
                  key={issue.id}
                  onClick={() => {
                    setIsOpen(false);
                    onOpenFullInsights();
                  }}
                  className="p-2 rounded bg-white border border-[#EAE2D2] hover:border-[#B54B32] transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-medium text-[#221E18] line-clamp-1">
                      {issue.title}
                    </span>
                    <span className="text-[9px] font-mono uppercase px-1 rounded bg-rose-100 text-rose-800 font-bold">
                      {issue.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#7A705F] line-clamp-2">
                    {issue.question}
                  </p>
                </div>
              ))}
              {openIssues.length > 4 && (
                <p className="text-center text-[10px] text-[#7A705F] pt-1">
                  +{openIssues.length - 4} more observations
                </p>
              )}
            </div>
          )}

          <div className="mt-3 pt-2 border-t border-[rgba(34,30,24,0.1)] flex items-center justify-between">
            <span className="text-[10px] text-[#7A705F]">
              Continuous background audit
            </span>
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenFullInsights();
              }}
              className="px-2.5 py-1 rounded bg-[#221E18] text-white text-[11px] font-medium hover:bg-stone-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Full Dashboard</span>
              <ChevronRight size={11} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
