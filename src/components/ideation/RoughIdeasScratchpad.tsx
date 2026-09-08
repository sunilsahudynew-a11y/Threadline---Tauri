import React, { useState } from 'react';
import { RoughIdea, IdeaCategory, IdeaStatus, IdeaPriority, Entity, Scene } from '../../types';
import {
  Lightbulb,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Tag,
  CheckCircle2,
  Clock,
  Sparkles,
  FileText,
  Compass,
  Trash2,
  ChevronDown,
  ChevronRight,
  Bookmark,
  Layers,
  Flame,
  ArrowRight,
  Kanban
} from 'lucide-react';

interface RoughIdeasScratchpadProps {
  ideas: RoughIdea[];
  scenes?: Scene[];
  entities?: Entity[];
  onAddIdea: (idea: Omit<RoughIdea, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateIdea: (idea: RoughIdea) => void;
  onDeleteIdea: (id: string) => void;
  onConvertToScene: (idea: RoughIdea) => void;
  onConvertToEntity: (idea: RoughIdea) => void;
  onAttachToBeat?: (ideaId: string, beatKey: string) => void;
}

export const RoughIdeasScratchpad: React.FC<RoughIdeasScratchpadProps> = ({
  ideas = [],
  scenes = [],
  entities = [],
  onAddIdea,
  onUpdateIdea,
  onDeleteIdea,
  onConvertToScene,
  onConvertToEntity,
  onAttachToBeat
}) => {
  // Capture input state
  const [quickTitle, setQuickTitle] = useState('');
  const [quickCategory, setQuickCategory] = useState<IdeaCategory>('plot');
  const [quickPriority, setQuickPriority] = useState<IdeaPriority>('medium');
  const [quickTags, setQuickTags] = useState('');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority' | 'status' | 'alpha'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('grid');

  // Expanded card editing state
  const [expandedIdeaId, setExpandedIdeaId] = useState<string | null>(null);

  // Category config styling
  const categoryLabels: Record<IdeaCategory, { label: string; color: string }> = {
    plot: { label: 'Plot Twist & Beat', color: 'bg-[#B54B32] text-[#FAF6EE]' },
    character: { label: 'Character Arc', color: 'bg-[#4B6B94] text-[#FAF6EE]' },
    world: { label: 'World & Lore', color: 'bg-[#3A7D6E] text-[#FAF6EE]' },
    dialogue: { label: 'Dialogue Scrap', color: 'bg-[#8E4A49] text-[#FAF6EE]' },
    theme: { label: 'Thematic Motif', color: 'bg-[#2F3E46] text-[#FAF6EE]' },
    twist: { label: 'Story Twist', color: 'bg-[#C44900] text-[#FAF6EE]' },
    research: { label: 'Research Query', color: 'bg-[#7A705F] text-[#FAF6EE]' }
  };

  const priorityBadges: Record<IdeaPriority, { label: string; dotColor: string }> = {
    high: { label: 'High Priority', dotColor: 'bg-[#B54B32]' },
    medium: { label: 'Medium', dotColor: 'bg-[#D17B2F]' },
    low: { label: 'Low', dotColor: 'bg-[#7A705F]' }
  };

  const statusLabels: Record<IdeaStatus, { label: string; color: string }> = {
    spark: { label: 'Raw Spark', color: 'text-amber-700 bg-amber-50 border-amber-200' },
    'in-progress': { label: 'In Development', color: 'text-blue-700 bg-blue-50 border-blue-200' },
    'fleshed-out': { label: 'Fleshed Out', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    incorporated: { label: 'Incorporated in Draft', color: 'text-stone-600 bg-stone-100 border-stone-200' }
  };

  // Quick Add submit
  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    const tagsArray = quickTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onAddIdea({
      title: quickTitle.trim(),
      description: '',
      category: quickCategory,
      status: 'spark',
      priority: quickPriority,
      tags: tagsArray
    });

    setQuickTitle('');
    setQuickTags('');
  };

  // Filter & Sort logic
  const filteredIdeas = ideas.filter((idea) => {
    const matchesSearch =
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || idea.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || idea.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || idea.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  const sortedIdeas = [...filteredIdeas].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sortBy === 'priority') {
      const order = { high: 3, medium: 2, low: 1 };
      return order[b.priority] - order[a.priority];
    }
    if (sortBy === 'status') {
      const order = { spark: 1, 'in-progress': 2, 'fleshed-out': 3, incorporated: 4 };
      return order[a.status] - order[b.status];
    }
    if (sortBy === 'alpha') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  // Kanban status columns
  const kanbanColumns: { id: IdeaStatus; title: string; subtitle: string }[] = [
    { id: 'spark', title: 'Raw Sparks', subtitle: 'Sudden thoughts & unrefined ideas' },
    { id: 'in-progress', title: 'In Development', subtitle: 'Actively fleshing out notes' },
    { id: 'fleshed-out', title: 'Fleshed Out', subtitle: 'Ready for manuscript insertion' },
    { id: 'incorporated', title: 'Incorporated', subtitle: 'Written into scenes or codex' }
  ];

  return (
    <div className="space-y-6 select-none text-[#221E18]">
      {/* ========================================================================= */}
      {/* 1. FRICTIONLESS QUICK CAPTURE BAR                                         */}
      {/* ========================================================================= */}
      <div className="bg-[#FAF6EE] rounded-[10px] border border-[rgba(34,30,24,0.12)] p-4 sm:p-5 shadow-warm-sm">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb size={18} className="text-[#B54B32]" />
          <h3 className="text-sm sm:text-base font-serif font-bold text-[#221E18]">
            Quick Idea Scratchpad
          </h3>
          <span className="text-[11px] font-mono text-[#7A705F] bg-[#F1EAD9] px-2 py-0.5 rounded-[4px]">
            Instant Capture
          </span>
        </div>

        <form onSubmit={handleQuickAdd} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Dump a rough idea, sudden plot twist, dialogue scrap, or what-if... (Press Enter)"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 rounded-[6px] border border-[rgba(34,30,24,0.15)] bg-white focus:outline-none focus:border-[#B54B32] shadow-2xs"
            />

            <button
              type="submit"
              disabled={!quickTitle.trim()}
              className="px-4 py-2.5 bg-[#B54B32] text-[#FAF6EE] rounded-[6px] text-xs font-semibold hover:bg-[#9E3E27] disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-warm-sm shrink-0"
            >
              <Plus size={14} />
              <span>Log Idea</span>
            </button>
          </div>

          {/* Inline Selectors: Category, Priority, Tags */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-[#7A705F]">
                <span className="text-[11px] font-mono">Category:</span>
                <select
                  value={quickCategory}
                  onChange={(e) => setQuickCategory(e.target.value as IdeaCategory)}
                  className="text-xs px-2 py-1 rounded-[4px] border border-[rgba(34,30,24,0.12)] bg-[#F1EAD9] text-[#221E18]"
                >
                  <option value="plot">Plot Twist &amp; Beat</option>
                  <option value="character">Character Arc</option>
                  <option value="world">World &amp; Lore</option>
                  <option value="dialogue">Dialogue Scrap</option>
                  <option value="theme">Thematic Motif</option>
                  <option value="twist">Story Twist</option>
                  <option value="research">Research Query</option>
                </select>
              </div>

              <div className="flex items-center gap-1 text-[#7A705F]">
                <span className="text-[11px] font-mono">Priority:</span>
                <select
                  value={quickPriority}
                  onChange={(e) => setQuickPriority(e.target.value as IdeaPriority)}
                  className="text-xs px-2 py-1 rounded-[4px] border border-[rgba(34,30,24,0.12)] bg-[#F1EAD9] text-[#221E18]"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[#7A705F] flex-1 min-w-0">
              <Tag size={12} className="shrink-0" />
              <input
                type="text"
                placeholder="Tags: Silas, Fog, Gear"
                value={quickTags}
                onChange={(e) => setQuickTags(e.target.value)}
                className="w-full text-xs px-2 py-1 rounded-[4px] border border-[rgba(34,30,24,0.12)] bg-[#F1EAD9] text-[#221E18]"
              />
            </div>
          </div>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* 2. SORTING & FILTERING TOOLBAR                                            */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#F1EAD9] p-2.5 sm:p-3 rounded-[8px] border border-[rgba(34,30,24,0.1)] text-xs">
        {/* Search & Status Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search Bar */}
          <div className="relative w-full sm:w-56">
            <Search size={13} className="absolute left-2.5 top-2 text-[#7A705F]" />
            <input
              type="text"
              placeholder="Search ideas or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-2.5 py-1.5 rounded-[5px] border border-[rgba(34,30,24,0.12)] bg-[#FAF6EE] focus:outline-none focus:border-[#B54B32]"
            />
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-1 bg-[#FAF6EE] p-0.5 rounded-[5px] border border-[rgba(34,30,24,0.1)] overflow-x-auto max-w-full scrollbar-none">
            {[
              { id: 'all', label: `All (${ideas.length})` },
              { id: 'spark', label: 'Sparks' },
              { id: 'in-progress', label: 'Developing' },
              { id: 'fleshed-out', label: 'Fleshed Out' },
              { id: 'incorporated', label: 'Incorporated' }
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-2.5 py-1 rounded-[4px] text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  statusFilter === st.id
                    ? 'bg-[#221E18] text-[#FAF6EE] font-semibold'
                    : 'text-[#7A705F] hover:text-[#221E18]'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sorting & View Switcher */}
        <div className="flex items-center gap-2.5 self-end md:self-auto">
          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-[5px] border border-[rgba(34,30,24,0.12)] bg-[#FAF6EE] text-[#221E18]"
          >
            <option value="all">All Categories</option>
            <option value="plot">Plot Twists</option>
            <option value="character">Character</option>
            <option value="world">Worldbuilding</option>
            <option value="dialogue">Dialogue</option>
            <option value="theme">Theme</option>
            <option value="twist">Twists</option>
            <option value="research">Research</option>
          </select>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1 text-[#7A705F]">
            <ArrowUpDown size={13} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs px-2.5 py-1.5 rounded-[5px] border border-[rgba(34,30,24,0.12)] bg-[#FAF6EE] text-[#221E18]"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="priority">Sort: Priority</option>
              <option value="status">Sort: Progression</option>
              <option value="alpha">Sort: A-Z</option>
            </select>
          </div>

          {/* Grid vs Kanban View Toggle */}
          <div className="flex items-center bg-[#FAF6EE] p-0.5 rounded-[5px] border border-[rgba(34,30,24,0.1)]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-[4px] transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-[#221E18] text-[#FAF6EE]' : 'text-[#7A705F] hover:text-[#221E18]'
              }`}
              title="Card Grid View"
            >
              <Layers size={13} />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-[4px] transition-colors cursor-pointer ${
                viewMode === 'kanban' ? 'bg-[#221E18] text-[#FAF6EE]' : 'text-[#7A705F] hover:text-[#221E18]'
              }`}
              title="Kanban Board View"
            >
              <Kanban size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CARD GRID VIEW                                                         */}
      {/* ========================================================================= */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedIdeas.map((idea) => {
            const isExpanded = expandedIdeaId === idea.id;
            const cat = categoryLabels[idea.category] || categoryLabels.plot;
            const prio = priorityBadges[idea.priority];
            const stat = statusLabels[idea.status];

            return (
              <div
                key={idea.id}
                className={`bg-[#FAF6EE] rounded-[8px] border transition-all shadow-warm-sm p-4 flex flex-col justify-between ${
                  idea.status === 'incorporated'
                    ? 'border-[rgba(34,30,24,0.08)] opacity-75'
                    : 'border-[rgba(34,30,24,0.12)] hover:border-[#B54B32]'
                }`}
              >
                <div>
                  {/* Card Header: Category Chip & Priority */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] ${cat.color}`}>
                      {cat.label}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${prio.dotColor}`} />
                      <span className="text-[10px] font-mono text-[#7A705F]">{prio.label}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="text-sm font-semibold text-[#221E18] mb-1.5 leading-snug">
                    {idea.title}
                  </h4>

                  {/* Description / Content */}
                  {idea.description ? (
                    <p className="text-xs text-[#554D40] leading-relaxed line-clamp-3 mb-2.5">
                      {idea.description}
                    </p>
                  ) : (
                    <p className="text-xs text-[#7A705F] italic mb-2.5">
                      No extended notes added yet.
                    </p>
                  )}

                  {/* Tags */}
                  {idea.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {idea.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F1EAD9] text-[#554D40]"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Status Progression Pill */}
                  <div className="mb-3">
                    <span
                      className={`inline-block text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${stat.color}`}
                    >
                      ● {stat.label}
                    </span>
                  </div>

                  {/* Expanded Editing Panel */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-[rgba(34,30,24,0.08)] space-y-2 mb-3 bg-[#F1EAD9] p-2.5 rounded-[6px]">
                      <span className="text-[11px] font-mono font-semibold text-[#221E18] block">
                        Edit Idea Details:
                      </span>
                      <textarea
                        value={idea.description}
                        onChange={(e) => onUpdateIdea({ ...idea, description: e.target.value })}
                        placeholder="Elaborate thoughts, scene dynamics, character reactions..."
                        rows={3}
                        className="w-full text-xs p-2 rounded border border-[rgba(34,30,24,0.12)] bg-white resize-none"
                      />

                      <div className="flex items-center justify-between gap-2 text-xs">
                        <select
                          value={idea.status}
                          onChange={(e) => onUpdateIdea({ ...idea, status: e.target.value as IdeaStatus })}
                          className="text-xs px-2 py-1 rounded border border-[rgba(34,30,24,0.12)] bg-white"
                        >
                          <option value="spark">Status: Raw Spark</option>
                          <option value="in-progress">Status: In Progress</option>
                          <option value="fleshed-out">Status: Fleshed Out</option>
                          <option value="incorporated">Status: Incorporated</option>
                        </select>

                        <button
                          onClick={() => setExpandedIdeaId(null)}
                          className="px-2.5 py-1 text-xs font-medium text-[#221E18] hover:bg-[#E8DFC9] rounded"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-[rgba(34,30,24,0.08)] flex items-center justify-between gap-1 text-xs">
                  <button
                    onClick={() => setExpandedIdeaId(isExpanded ? null : idea.id)}
                    className="text-[#7A705F] hover:text-[#221E18] font-medium text-[11px] cursor-pointer"
                  >
                    {isExpanded ? 'Hide Details' : 'Work on Idea →'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* Convert to Scene */}
                    <button
                      onClick={() => onConvertToScene(idea)}
                      className="p-1 rounded text-[#7A705F] hover:text-[#B54B32] hover:bg-[#F1EAD9] transition-colors cursor-pointer"
                      title="Convert into Manuscript Scene"
                    >
                      <FileText size={13} />
                    </button>

                    {/* Convert to Codex Entity */}
                    <button
                      onClick={() => onConvertToEntity(idea)}
                      className="p-1 rounded text-[#7A705F] hover:text-[#3A7D6E] hover:bg-[#F1EAD9] transition-colors cursor-pointer"
                      title="Promote to Codex & Lore Entity"
                    >
                      <Compass size={13} />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => onDeleteIdea(idea.id)}
                      className="p-1 rounded text-[#7A705F] hover:text-red-700 hover:bg-[#F1EAD9] transition-colors cursor-pointer"
                      title="Delete Idea"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. KANBAN BOARD VIEW                                                      */}
      {/* ========================================================================= */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
          {kanbanColumns.map((col) => {
            const colIdeas = sortedIdeas.filter((i) => i.status === col.id);

            return (
              <div
                key={col.id}
                className="bg-[#F1EAD9] rounded-[8px] p-3 border border-[rgba(34,30,24,0.1)] flex flex-col min-h-[420px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-mono font-bold text-[#221E18] uppercase tracking-wider">
                    {col.title}
                  </h4>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#E0D5BE] text-[#221E18] font-bold">
                    {colIdeas.length}
                  </span>
                </div>
                <p className="text-[11px] text-[#7A705F] mb-3">{col.subtitle}</p>

                {/* Column Idea Cards */}
                <div className="flex-1 space-y-2.5 overflow-y-auto pr-0.5">
                  {colIdeas.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#7A705F] border border-dashed border-[rgba(34,30,24,0.15)] rounded-[6px]">
                      No ideas in this column
                    </div>
                  ) : (
                    colIdeas.map((idea) => {
                      const cat = categoryLabels[idea.category] || categoryLabels.plot;

                      return (
                        <div
                          key={idea.id}
                          className="bg-[#FAF6EE] p-3 rounded-[6px] border border-[rgba(34,30,24,0.12)] shadow-2xs space-y-2 hover:border-[#B54B32] transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${cat.color}`}>
                              {cat.label}
                            </span>
                            <span className="text-[10px] font-mono text-[#7A705F]">
                              {idea.priority}
                            </span>
                          </div>

                          <h5 className="text-xs font-semibold text-[#221E18] leading-tight">
                            {idea.title}
                          </h5>

                          {idea.description && (
                            <p className="text-[11px] text-[#554D40] line-clamp-2">
                              {idea.description}
                            </p>
                          )}

                          {/* Quick Column Status Advance */}
                          <div className="pt-2 border-t border-[rgba(34,30,24,0.06)] flex items-center justify-between text-[11px]">
                            <select
                              value={idea.status}
                              onChange={(e) => onUpdateIdea({ ...idea, status: e.target.value as IdeaStatus })}
                              className="text-[10px] font-mono px-1 py-0.5 rounded border border-[rgba(34,30,24,0.1)] bg-white"
                            >
                              <option value="spark">Raw Spark</option>
                              <option value="in-progress">In Progress</option>
                              <option value="fleshed-out">Fleshed Out</option>
                              <option value="incorporated">Incorporated</option>
                            </select>

                            <button
                              onClick={() => onConvertToScene(idea)}
                              className="text-[#B54B32] hover:underline flex items-center gap-0.5 text-[10px] font-semibold cursor-pointer"
                              title="Convert to Scene"
                            >
                              <span>Scene</span>
                              <ArrowRight size={10} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
