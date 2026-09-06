import React, { useState, useMemo, useRef } from 'react';
import { Project, ProjectType } from '../types';
import {
  BookOpen,
  Film,
  FileText,
  Plus,
  Search,
  Clock,
  ArrowRight,
  Edit3,
  Copy,
  Download,
  Trash2,
  Upload,
  X,
  Compass,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';

interface ProjectsRootScreenProps {
  projects: Project[];
  activeProjectId: string;
  projectStatsMap: Record<string, { wordCount: number; sceneCount: number; lastSceneTitle?: string }>;
  onSelectProject: (projectId: string, targetScreen?: 'home' | 'editor') => void;
  onCreateNewProject: () => void;
  onEditProject: (updated: Project) => void;
  onDuplicateProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onImportProject: (bundleData: any) => void;
  onExportProject: (projectId: string) => void;
  onOpenVaultManager?: () => void;
}

export const ProjectsRootScreen: React.FC<ProjectsRootScreenProps> = ({
  projects,
  activeProjectId,
  projectStatsMap,
  onSelectProject,
  onCreateNewProject,
  onEditProject,
  onDuplicateProject,
  onDeleteProject,
  onImportProject,
  onExportProject,
  onOpenVaultManager
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'words' | 'title'>('recent');

  // Modal states
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate global summary stats across all projects
  const globalSummary = useMemo(() => {
    let totalWords = 0;
    let totalScenes = 0;
    Object.values(projectStatsMap).forEach((stat: { wordCount: number; sceneCount: number; lastSceneTitle?: string }) => {
      totalWords += stat.wordCount || 0;
      totalScenes += stat.sceneCount || 0;
    });
    return {
      projectCount: projects.length,
      totalWords,
      totalScenes
    };
  }, [projects, projectStatsMap]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter((proj) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !query ||
          proj.title.toLowerCase().includes(query) ||
          (proj.protagonist && proj.protagonist.toLowerCase().includes(query)) ||
          (proj.situation && proj.situation.toLowerCase().includes(query)) ||
          (proj.genre && proj.genre.toLowerCase().includes(query));

        const matchesType = selectedTypeFilter === 'all' || proj.type === selectedTypeFilter;
        const matchesStatus =
          selectedStatusFilter === 'all' ||
          (proj.status || 'in-progress') === selectedStatusFilter;

        return matchesQuery && matchesType && matchesStatus;
      })
      .sort((a, b) => {
        const statsA = projectStatsMap[a.id] || { wordCount: 0 };
        const statsB = projectStatsMap[b.id] || { wordCount: 0 };

        if (sortBy === 'recent') {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        } else if (sortBy === 'words') {
          return (statsB.wordCount || 0) - (statsA.wordCount || 0);
        } else {
          return a.title.localeCompare(b.title);
        }
      });
  }, [projects, searchQuery, selectedTypeFilter, selectedStatusFilter, sortBy, projectStatsMap]);

  // Handle Import JSON file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        onImportProject(json);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err) {
        alert('Could not parse the selected file. Please ensure it is a valid Threadline JSON project archive.');
      }
    };
    reader.readAsText(file);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    onEditProject({
      ...editingProject,
      updatedAt: new Date().toISOString()
    });
    setEditingProject(null);
  };

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return 'Recently';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays}d ago`;
    return new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getMediumIcon = (type: ProjectType) => {
    switch (type) {
      case 'Screenplay':
      case 'Screenplay Experiment':
        return <Film size={14} className="text-[#7A705F]" />;
      case 'Short Story':
      case 'Novella':
        return <FileText size={14} className="text-[#7A705F]" />;
      case 'Worldbuilding Bible':
        return <Compass size={14} className="text-[#7A705F]" />;
      default:
        return <BookOpen size={14} className="text-[#7A705F]" />;
    }
  };

  return (
    <div className="flex-1 bg-[#FAF6EE] overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* TOP ROOT BANNER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[rgba(34,30,24,0.12)]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-mono font-semibold tracking-[0.14em] text-[#7A705F] uppercase">
                Threadline Root Workspace
              </span>
              <span className="text-[#7A705F]/40">·</span>
              <span className="text-[11px] text-[#7A705F] font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#35505F]"></span>
                Multi-Project Local Storage
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif text-[#221E18] font-semibold tracking-tight">
              Manuscripts &amp; Projects
            </h1>
            <p className="text-[#7A705F] text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
              Switch between your active novels, screenplays, and story bibles. Each work maintains its own scenes, characters, timeline threads, and revisions.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {/* Hidden file input for project import */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 text-xs font-medium text-[#221E18] bg-[#F1EAD9] hover:bg-[#FAF6EE] rounded-[6px] transition-colors border border-[rgba(34,30,24,0.12)] shadow-warm-sm flex items-center gap-2 cursor-pointer min-h-[38px]"
              title="Import a Threadline project archive (.json)"
            >
              <Upload size={13} className="text-[#7A705F]" /> Import Archive
            </button>

            {onOpenVaultManager && (
              <button
                onClick={onOpenVaultManager}
                className="px-3 py-2 text-xs font-medium text-[#221E18] bg-[#F1EAD9] hover:bg-[#FAF6EE] rounded-[6px] transition-colors border border-[rgba(34,30,24,0.12)] shadow-warm-sm flex items-center gap-2 cursor-pointer min-h-[38px]"
                title="Open or connect a dedicated local folder vault"
              >
                <FolderOpen size={13} className="text-[#B54B32]" /> Open Folder Vault
              </button>
            )}

            <button
              onClick={onCreateNewProject}
              className="px-4 py-2 text-xs font-semibold text-[#FAF6EE] bg-[#221E18] hover:bg-black rounded-[6px] transition-colors shadow-warm-sm flex items-center gap-2 cursor-pointer min-h-[38px]"
            >
              <Plus size={14} className="text-[#B54B32]" /> New Project
            </button>
          </div>
        </div>

        {/* WORKSPACE METRICS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 my-6">
          <div className="bg-[#F1EAD9] p-4 rounded-[8px] border border-[rgba(34,30,24,0.12)] shadow-warm-sm">
            <span className="text-[10px] font-mono font-semibold text-[#7A705F] uppercase tracking-wider block">
              Total Works
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-serif font-bold text-[#221E18]">
                {globalSummary.projectCount}
              </span>
              <span className="text-xs text-[#7A705F]">projects</span>
            </div>
          </div>

          <div className="bg-[#F1EAD9] p-4 rounded-[8px] border border-[rgba(34,30,24,0.12)] shadow-warm-sm">
            <span className="text-[10px] font-mono font-semibold text-[#7A705F] uppercase tracking-wider block">
              Cumulative Words
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-serif font-bold text-[#221E18]">
                {globalSummary.totalWords.toLocaleString()}
              </span>
              <span className="text-xs text-[#7A705F]">across all works</span>
            </div>
          </div>

          <div className="bg-[#F1EAD9] p-4 rounded-[8px] border border-[rgba(34,30,24,0.12)] shadow-warm-sm col-span-2 sm:col-span-1">
            <span className="text-[10px] font-mono font-semibold text-[#7A705F] uppercase tracking-wider block">
              Drafted Beats
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-serif font-bold text-[#221E18]">
                {globalSummary.totalScenes}
              </span>
              <span className="text-xs text-[#7A705F]">scenes and beats</span>
            </div>
          </div>
        </div>

        {/* CONTROLS BAR: SEARCH, FILTERS & SORT */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 bg-[#F1EAD9] p-3 rounded-[8px] border border-[rgba(34,30,24,0.12)] shadow-warm-sm">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A705F]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, protagonist, genre, or logline..."
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[6px] focus:outline-none text-[#221E18] placeholder-[#7A705F]/60 min-h-[36px]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7A705F] hover:text-[#221E18] cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Filters & Sort */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Medium Filter */}
            <div className="flex items-center gap-1.5 bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[6px] px-2.5 py-1 min-h-[36px]">
              <span className="text-[#7A705F] text-[11px] font-mono">Type:</span>
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="bg-transparent text-xs font-medium text-[#221E18] focus:outline-none cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="Novel">Novels</option>
                <option value="Screenplay">Screenplays</option>
                <option value="Screenplay Experiment">Screenplay Experiments</option>
                <option value="Novella">Novellas</option>
                <option value="Short Story">Short Stories</option>
                <option value="Worldbuilding Bible">Bibles</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[6px] px-2.5 py-1 min-h-[36px]">
              <span className="text-[#7A705F] text-[11px] font-mono">Status:</span>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-transparent text-xs font-medium text-[#221E18] focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="drafting">Drafting</option>
                <option value="in-progress">In Progress</option>
                <option value="revising">Revising</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div className="flex items-center gap-1.5 bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[6px] px-2.5 py-1 min-h-[36px]">
              <span className="text-[#7A705F] text-[11px] font-mono">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-medium text-[#221E18] focus:outline-none cursor-pointer"
              >
                <option value="recent">Recently Edited</option>
                <option value="words">Word Count</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* PROJECT GRID */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16 bg-[#F1EAD9] rounded-[8px] border border-[rgba(34,30,24,0.12)] p-8">
            <div className="w-12 h-12 rounded-full bg-[#FAF6EE] text-[#7A705F] flex items-center justify-center mx-auto mb-3">
              <Search size={20} />
            </div>
            <h3 className="text-base font-serif font-semibold text-[#221E18]">No manuscripts matched your filter</h3>
            <p className="text-xs text-[#7A705F] mt-1 max-w-sm mx-auto">
              Try adjusting your search terms or filter selections, or create a brand new project.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTypeFilter('all');
                  setSelectedStatusFilter('all');
                }}
                className="px-3 py-1.5 text-xs text-[#221E18] hover:bg-[#FAF6EE] rounded-[6px] border border-[rgba(34,30,24,0.12)] transition-colors cursor-pointer min-h-[36px]"
              >
                Clear Filters
              </button>
              <button
                onClick={onCreateNewProject}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#FAF6EE] bg-[#221E18] hover:bg-black rounded-[6px] transition-colors cursor-pointer min-h-[36px]"
              >
                Create Project
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {filteredProjects.map((proj) => {
              const isActive = proj.id === activeProjectId;
              const stats = projectStatsMap[proj.id] || { wordCount: 0, sceneCount: 0 };
              const targetWords = proj.targetWordCount || (proj.type === 'Novel' ? 75000 : 25000);
              const progressPct = Math.min(100, Math.round((stats.wordCount / targetWords) * 100));

              return (
                <div
                  key={proj.id}
                  id={`project-card-${proj.id}`}
                  className={`bg-[#F1EAD9] rounded-[8px] border transition-all duration-200 flex flex-col justify-between overflow-hidden relative shadow-warm-sm ${
                    isActive
                      ? 'border-[#221E18] ring-1 ring-[#221E18]/20'
                      : 'border-[rgba(34,30,24,0.12)] hover:border-[rgba(34,30,24,0.25)]'
                  }`}
                >
                  {/* Top Color Accent / Active Tag */}
                  {isActive && (
                    <div className="bg-[#221E18] text-[#FAF6EE] px-4 py-1 text-[10px] font-mono font-medium flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B54B32]"></span>
                        <span>CURRENT ACTIVE WORKSPACE</span>
                      </div>
                      <span className="text-[#F1EAD9] text-[10px]">Loaded</span>
                    </div>
                  )}

                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Top Header inside card: Type & Status */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] bg-[#FAF6EE] text-[#221E18] text-xs font-medium border border-[rgba(34,30,24,0.12)]">
                            {getMediumIcon(proj.type)}
                            {proj.type}
                          </span>
                          {proj.framework && (
                            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-[4px] bg-[#FAF6EE] text-[#7A705F] border border-[rgba(34,30,24,0.12)]">
                              {proj.framework === 'three-act'
                                ? '3-Act'
                                : proj.framework === 'save-the-cat'
                                ? 'Save the Cat!'
                                : proj.framework === 'heros-journey'
                                ? "Hero's Journey"
                                : proj.framework === 'story-circle'
                                ? 'Story Circle'
                                : 'Custom'}
                            </span>
                          )}
                          {proj.genre && (
                            <span className="text-[11px] text-[#7A705F] italic truncate max-w-[150px]">
                              {proj.genre}
                            </span>
                          )}
                        </div>

                        {/* Status badge */}
                        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-[4px] bg-[#FAF6EE] text-[#7A705F] border border-[rgba(34,30,24,0.12)]">
                          {proj.status || 'drafting'}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-xl font-serif font-bold text-[#221E18] tracking-tight leading-snug">
                        {proj.title}
                      </h2>

                      {/* Situation / Premise */}
                      {proj.situation ? (
                        <p className="text-[#7A705F] text-xs mt-2 line-clamp-2 leading-relaxed font-mono italic">
                          "{proj.situation}"
                        </p>
                      ) : (
                        <p className="text-[#7A705F]/60 text-xs mt-2 italic">
                          No premise or logline recorded yet.
                        </p>
                      )}

                      {/* Character / Protagonist pill */}
                      {proj.protagonist && (
                        <div className="mt-3 flex items-center gap-1.5 text-xs text-[#221E18]">
                          <span className="text-[#7A705F] text-[11px] font-mono">Protagonist:</span>
                          <span className="font-medium bg-[#FAF6EE] px-2 py-0.5 rounded-[4px] text-[11px] border border-[rgba(34,30,24,0.08)]">
                            {proj.protagonist}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar & Word Metrics */}
                    <div className="mt-5 pt-4 border-t border-[rgba(34,30,24,0.12)]">
                      <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                        <span className="font-semibold text-[#221E18]">
                          {stats.wordCount.toLocaleString()} words
                        </span>
                        <span className="text-[#7A705F] text-[11px]">
                          Goal: {targetWords.toLocaleString()} ({progressPct}%)
                        </span>
                      </div>

                      <div className="w-full h-1.5 bg-[#FAF6EE] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#B54B32] rounded-full transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between mt-2.5 text-[11px] text-[#7A705F] font-mono">
                        <span>
                          {stats.sceneCount} {stats.sceneCount === 1 ? 'scene beat' : 'scene beats'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} /> {formatRelativeTime(proj.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM ACTION TOOLBAR */}
                  <div className="px-5 sm:px-6 py-3 bg-[#FAF6EE] border-t border-[rgba(34,30,24,0.12)] flex items-center justify-between gap-2">
                    {/* Secondary Actions */}
                    <div className="flex items-center gap-1 text-[#7A705F]">
                      <button
                        onClick={() => setEditingProject(proj)}
                        className="p-1.5 hover:text-[#221E18] hover:bg-[#F1EAD9] rounded-[4px] transition-colors cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                        title="Edit Project Details"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => onDuplicateProject(proj.id)}
                        className="p-1.5 hover:text-[#221E18] hover:bg-[#F1EAD9] rounded-[4px] transition-colors cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                        title="Duplicate Entire Project & Story Bible"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        onClick={() => onExportProject(proj.id)}
                        className="p-1.5 hover:text-[#221E18] hover:bg-[#F1EAD9] rounded-[4px] transition-colors cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                        title="Export Project Archive (.json)"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        onClick={() => setProjectToDelete(proj)}
                        disabled={projects.length <= 1}
                        className="p-1.5 hover:text-[#B54B32] hover:bg-[#B54B32]/10 rounded-[4px] transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#7A705F] cursor-pointer disabled:cursor-not-allowed min-h-[32px] min-w-[32px] flex items-center justify-center"
                        title={
                          projects.length <= 1
                            ? 'Cannot delete the only remaining project'
                            : 'Delete Project'
                        }
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Primary Open/Resume Button */}
                    <button
                      onClick={() => onSelectProject(proj.id, 'editor')}
                      className={`px-3.5 py-1.5 rounded-[6px] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer min-h-[36px] ${
                        isActive
                          ? 'bg-[#221E18] text-[#FAF6EE] hover:bg-black'
                          : 'bg-[#F1EAD9] text-[#221E18] hover:bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)]'
                      }`}
                    >
                      <span>{isActive ? 'Continue Writing' : 'Open Manuscript'}</span>
                      <ArrowRight size={12} className={isActive ? 'text-[#B54B32]' : ''} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: EDIT PROJECT METADATA */}
      {editingProject && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#F1EAD9] rounded-[8px] border border-[rgba(34,30,24,0.12)] shadow-warm-modal max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[rgba(34,30,24,0.12)]">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#221E18]">Edit Manuscript Settings</h3>
                <p className="text-xs text-[#7A705F]">Update high-level metadata and targets for this project.</p>
              </div>
              <button
                onClick={() => setEditingProject(null)}
                className="p-1 text-[#7A705F] hover:text-[#221E18] rounded cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-mono font-semibold text-[#7A705F] uppercase tracking-wider text-[10px] mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={editingProject.title}
                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[6px] text-[#221E18] focus:outline-none text-sm min-h-[36px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono font-semibold text-[#7A705F] uppercase tracking-wider text-[10px] mb-1">
                    Medium
                  </label>
                  <select
                    value={editingProject.type}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, type: e.target.value as ProjectType })
                    }
                    className="w-full px-3 py-2 bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[6px] text-[#221E18] focus:outline-none min-h-[36px]"
                  >
                    <option value="Novel">Novel</option>
                    <option value="Screenplay">Screenplay</option>
                    <option value="Screenplay Experiment">Screenplay Experiment</option>
                    <option value="Novella">Novella</option>
                    <option value="Short Story">Short Story</option>
                    <option value="Worldbuilding Bible">Worldbuilding Bible</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono font-semibold text-[#7A705F] uppercase tracking-wider text-[10px] mb-1">
                    Genre
                  </label>
                  <input
                    type="text"
                    value={editingProject.genre || ''}
                    placeholder="e.g. Historical Mystery, Sci-Fi"
                    onChange={(e) => setEditingProject({ ...editingProject, genre: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[6px] text-[#221E18] focus:outline-none min-h-[36px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono font-semibold text-[#7A705F] uppercase tracking-wider text-[10px] mb-1">
                    Protagonist
                  </label>
                  <input
                    type="text"
                    value={editingProject.protagonist || ''}
                    placeholder="Lead character name"
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, protagonist: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[6px] text-[#221E18] focus:outline-none min-h-[36px]"
                  />
                </div>

                <div>
                  <label className="block font-mono font-semibold text-[#7A705F] uppercase tracking-wider text-[10px] mb-1">
                    Target Word Count
                  </label>
                  <input
                    type="number"
                    value={editingProject.targetWordCount || 75000}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        targetWordCount: parseInt(e.target.value) || 0
                      })
                    }
                    className="w-full px-3 py-2 bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[6px] text-[#221E18] focus:outline-none min-h-[36px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono font-semibold text-[#7A705F] uppercase tracking-wider text-[10px] mb-1">
                  Logline / Central Dramatic Premise
                </label>
                <textarea
                  rows={3}
                  value={editingProject.situation || ''}
                  placeholder="One or two sentences describing the core conflict..."
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, situation: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[6px] text-[#221E18] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono font-semibold text-[#7A705F] uppercase tracking-wider text-[10px] mb-1">
                    Status
                  </label>
                  <select
                    value={editingProject.status || 'in-progress'}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        status: e.target.value as any
                      })
                    }
                    className="w-full px-3 py-2 bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[6px] text-[#221E18] focus:outline-none min-h-[36px]"
                  >
                    <option value="drafting">Drafting</option>
                    <option value="in-progress">In Progress</option>
                    <option value="revising">Revising</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono font-semibold text-[#7A705F] uppercase tracking-wider text-[10px] mb-1">
                    Current Writing Goal
                  </label>
                  <input
                    type="text"
                    value={editingProject.desiredSessionGoal || ''}
                    placeholder="e.g. Finish Chapter 4"
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        desiredSessionGoal: e.target.value
                      })
                    }
                    className="w-full px-3 py-2 bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[6px] text-[#221E18] focus:outline-none min-h-[36px]"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[rgba(34,30,24,0.12)]">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-3.5 py-2 text-xs font-medium text-[#7A705F] hover:text-[#221E18] rounded-[6px] border border-[rgba(34,30,24,0.12)] cursor-pointer min-h-[36px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-[#FAF6EE] bg-[#221E18] hover:bg-black rounded-[6px] transition-colors cursor-pointer min-h-[36px]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {projectToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#F1EAD9] rounded-[8px] border border-[rgba(34,30,24,0.12)] shadow-warm-modal max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-3 text-[#B54B32]">
              <div className="w-10 h-10 rounded-full bg-[#B54B32]/10 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-[#B54B32]" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-[#221E18]">Delete Manuscript?</h3>
                <span className="text-xs text-[#B54B32] font-medium">This action cannot be undone</span>
              </div>
            </div>

            <p className="text-xs text-[#7A705F] leading-relaxed mb-4">
              Are you sure you want to permanently delete{' '}
              <strong className="text-[#221E18]">"{projectToDelete.title}"</strong>?
              All scenes, character profiles, threads, and snapshot archives for this project will be removed from local storage.
            </p>

            <div className="p-3 bg-[#FAF6EE] rounded-[6px] border border-[rgba(34,30,24,0.12)] mb-5 text-[11px] text-[#7A705F] flex items-center justify-between">
              <span>Consider downloading an archive backup first:</span>
              <button
                type="button"
                onClick={() => onExportProject(projectToDelete.id)}
                className="text-[#221E18] font-medium underline flex items-center gap-1 hover:text-black cursor-pointer"
              >
                <Download size={12} className="text-[#B54B32]" /> Export JSON
              </button>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="px-3.5 py-2 text-xs font-medium text-[#7A705F] hover:text-[#221E18] rounded-[6px] border border-[rgba(34,30,24,0.12)] cursor-pointer min-h-[36px]"
              >
                Keep Manuscript
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteProject(projectToDelete.id);
                  setProjectToDelete(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-[#FAF6EE] bg-[#B54B32] hover:bg-[#9E3E27] rounded-[6px] transition-colors cursor-pointer min-h-[36px]"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
