import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Bookmark,
  FileText,
  Sparkles,
  Layers,
  Sliders,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { Scene, Chapter } from '../../types';

interface EditorialSceneNavigatorProps {
  scenes: Scene[];
  chapters?: Chapter[];
  activeSceneId: string;
  onSelectScene: (sceneId: string) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const EditorialSceneNavigator: React.FC<EditorialSceneNavigatorProps> = ({
  scenes = [],
  chapters = [],
  activeSceneId,
  onSelectScene,
  isOpen,
  onToggleOpen
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'needs-review' | 'has-queries' | 'approved'>('all');
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    chapters.forEach((c) => {
      init[c.id] = true;
    });
    return init;
  });

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  // Filter scenes
  const filteredScenes = useMemo(() => {
    return scenes.filter((s) => {
      // Search
      const matchSearch =
        !searchQuery.trim() ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.premise && s.premise.toLowerCase().includes(searchQuery.toLowerCase()));

      // Status
      let matchStatus = true;
      const qCount = (s.editorialQueries || []).filter((q) => !q.resolved).length;

      if (statusFilter === 'needs-review') {
        matchStatus = s.editorialStatus !== 'clean-approved';
      } else if (statusFilter === 'has-queries') {
        matchStatus = qCount > 0;
      } else if (statusFilter === 'approved') {
        matchStatus = s.editorialStatus === 'clean-approved';
      }

      return matchSearch && matchStatus;
    });
  }, [scenes, searchQuery, statusFilter]);

  // Overall manuscript stats
  const stats = useMemo(() => {
    let cleanCount = 0;
    let queriesCount = 0;
    let netDelta = 0;

    scenes.forEach((s) => {
      if (s.editorialStatus === 'clean-approved') cleanCount++;
      const q = (s.editorialQueries || []).filter((item) => !item.resolved).length;
      queriesCount += q;

      const bWords = ((s.editorialBaseline || s.proseContent || '').match(/\b\w+\b/g) || []).length;
      const eWords = ((s.editorialProseContent !== undefined ? s.editorialProseContent : s.proseContent || '').match(/\b\w+\b/g) || []).length;
      netDelta += (eWords - bWords);
    });

    const percent = scenes.length > 0 ? Math.round((cleanCount / scenes.length) * 100) : 0;

    return { cleanCount, queriesCount, netDelta, percent };
  }, [scenes]);

  if (!isOpen) {
    return (
      <div className="border-r border-[rgba(34,30,24,0.12)] bg-[#F5F0E4] p-2 flex flex-col items-center shrink-0">
        <button
          onClick={onToggleOpen}
          className="p-1.5 rounded-[5px] text-[#7A705F] hover:text-[#221E18] hover:bg-[#EAE2D1] transition-colors cursor-pointer"
          title="Open Editorial Scene Navigator"
        >
          <PanelLeftOpen size={16} />
        </button>
      </div>
    );
  }

  return (
    <aside className="w-64 sm:w-72 border-r border-[rgba(34,30,24,0.12)] bg-[#F5F0E4] flex flex-col shrink-0 select-none overflow-hidden h-full">
      {/* Header */}
      <div className="p-3 border-b border-[rgba(34,30,24,0.1)] bg-[#ECE5D6] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Bookmark size={14} className="text-[#B54B32]" />
          <span className="font-serif font-bold text-xs text-[#221E18]">
            Editorial Navigator
          </span>
        </div>
        <button
          onClick={onToggleOpen}
          className="p-1 text-[#7A705F] hover:text-[#221E18] hover:bg-[#E2D9C7] rounded-[4px] cursor-pointer"
          title="Collapse Scene Navigator"
        >
          <PanelLeftClose size={14} />
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-2 space-y-1.5 border-b border-[rgba(34,30,24,0.08)] bg-[#F8F5EE]/70">
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#7A705F]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter scenes..."
            className="w-full text-[11px] font-sans bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[5px] pl-7 pr-2 py-1 text-[#221E18] focus:outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2 py-0.5 rounded-[4px] text-[10px] font-mono transition-colors cursor-pointer shrink-0 ${
              statusFilter === 'all'
                ? 'bg-[#221E18] text-[#FAF6EE] font-semibold'
                : 'bg-[#ECE5D6] text-[#7A705F] hover:text-[#221E18]'
            }`}
          >
            All ({scenes.length})
          </button>
          <button
            onClick={() => setStatusFilter('needs-review')}
            className={`px-2 py-0.5 rounded-[4px] text-[10px] font-mono transition-colors cursor-pointer shrink-0 ${
              statusFilter === 'needs-review'
                ? 'bg-[#221E18] text-[#FAF6EE] font-semibold'
                : 'bg-[#ECE5D6] text-[#7A705F] hover:text-[#221E18]'
            }`}
          >
            In Review
          </button>
          <button
            onClick={() => setStatusFilter('has-queries')}
            className={`px-2 py-0.5 rounded-[4px] text-[10px] font-mono transition-colors cursor-pointer shrink-0 ${
              statusFilter === 'has-queries'
                ? 'bg-[#221E18] text-[#FAF6EE] font-semibold'
                : 'bg-[#ECE5D6] text-[#7A705F] hover:text-[#221E18]'
            }`}
          >
            Queries
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-2 py-0.5 rounded-[4px] text-[10px] font-mono transition-colors cursor-pointer shrink-0 ${
              statusFilter === 'approved'
                ? 'bg-[#221E18] text-[#FAF6EE] font-semibold'
                : 'bg-[#ECE5D6] text-[#7A705F] hover:text-[#221E18]'
            }`}
          >
            Approved
          </button>
        </div>
      </div>

      {/* Scene Tree List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 no-scrollbar">
        {chapters.length > 0 ? (
          chapters.map((chap) => {
            const chapScenes = filteredScenes.filter(
              (s) =>
                s.chapterId === chap.id ||
                chap.sceneIds.includes(s.id) ||
                s.chapterNumber === chap.number
            );

            if (chapScenes.length === 0 && searchQuery) return null;

            const isExpanded = !!expandedChapters[chap.id];

            return (
              <div key={chap.id} className="space-y-0.5">
                {/* Chapter Header */}
                <button
                  onClick={() => toggleChapter(chap.id)}
                  className="w-full flex items-center justify-between px-1.5 py-1 text-left rounded-[4px] hover:bg-[#ECE5D6] text-[#7A705F] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    <span className="font-serif font-semibold text-[11px] text-[#221E18] truncate">
                      {chap.title}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-[#9E9484]">
                    {chapScenes.length} beats
                  </span>
                </button>

                {/* Scenes */}
                {isExpanded && (
                  <div className="pl-3.5 space-y-1 border-l border-[rgba(34,30,24,0.08)] ml-2">
                    {chapScenes.map((sc) => {
                      const isActive = sc.id === activeSceneId;
                      const openQueries = (sc.editorialQueries || []).filter((q) => !q.resolved).length;

                      const bWords = ((sc.editorialBaseline || sc.proseContent || '').match(/\b\w+\b/g) || []).length;
                      const eWords = ((sc.editorialProseContent !== undefined ? sc.editorialProseContent : sc.proseContent || '').match(/\b\w+\b/g) || []).length;
                      const delta = eWords - bWords;

                      return (
                        <button
                          key={sc.id}
                          onClick={() => onSelectScene(sc.id)}
                          className={`w-full text-left p-2 rounded-[5px] transition-colors cursor-pointer border ${
                            isActive
                              ? 'bg-[#EAE2D1] border-[rgba(34,30,24,0.18)] shadow-2xs'
                              : 'bg-[#FAF6EE]/80 border-transparent hover:bg-[#FAF6EE] hover:border-[rgba(34,30,24,0.1)]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-serif font-medium text-xs text-[#221E18] truncate">
                              {sc.title}
                            </span>
                            {/* Status Chip */}
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.2 rounded border shrink-0 ${
                                sc.editorialStatus === 'clean-approved'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : sc.editorialStatus === 'line-edited'
                                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              {sc.editorialStatus === 'clean-approved'
                                ? 'Approved'
                                : sc.editorialStatus === 'line-edited'
                                ? 'Line Edited'
                                : 'In Review'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] font-mono text-[#7A705F]">
                            <span>{eWords}w</span>
                            <div className="flex items-center gap-2">
                              {delta !== 0 && (
                                <span className={delta > 0 ? 'text-[#B54B32]' : 'text-[#3A7D6E]'}>
                                  {delta > 0 ? `+${delta}` : delta}w
                                </span>
                              )}
                              {openQueries > 0 && (
                                <span className="px-1 rounded bg-[#DE6346]/15 text-[#B54B32] font-semibold">
                                  {openQueries} q
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="space-y-1">
            {filteredScenes.map((sc) => {
              const isActive = sc.id === activeSceneId;
              const openQueries = (sc.editorialQueries || []).filter((q) => !q.resolved).length;
              return (
                <button
                  key={sc.id}
                  onClick={() => onSelectScene(sc.id)}
                  className={`w-full text-left p-2 rounded-[5px] transition-colors cursor-pointer border ${
                    isActive
                      ? 'bg-[#EAE2D1] border-[rgba(34,30,24,0.18)]'
                      : 'bg-[#FAF6EE]/80 border-transparent hover:bg-[#FAF6EE]'
                  }`}
                >
                  <div className="font-serif font-medium text-xs text-[#221E18] truncate">
                    {sc.title}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Navigator Footer Stats */}
      <div className="p-2.5 border-t border-[rgba(34,30,24,0.1)] bg-[#ECE5D6] text-[11px] font-mono text-[#7A705F] space-y-1.5">
        <div className="flex items-center justify-between">
          <span>Editorial Polish</span>
          <span className="font-bold text-[#221E18]">{stats.percent}% Approved</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-[#DED6C4] overflow-hidden">
          <div
            className="h-full bg-[#B54B32] transition-all duration-300 rounded-full"
            style={{ width: `${stats.percent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] pt-0.5">
          <span>Total Net Delta:</span>
          <span className={`font-semibold ${stats.netDelta <= 0 ? 'text-[#3A7D6E]' : 'text-[#B54B32]'}`}>
            {stats.netDelta > 0 ? `+${stats.netDelta}` : stats.netDelta} words
          </span>
        </div>
      </div>
    </aside>
  );
};
