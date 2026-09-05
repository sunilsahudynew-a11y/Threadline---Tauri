import React, { useState, useMemo, useRef } from 'react';
import { Project, ProjectType, Scene } from '../types';
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
  Check,
  CheckCircle2,
  Upload,
  X,
  SlidersHorizontal,
  Compass,
  AlertTriangle,
  FolderGit2,
  FolderOpen
} from 'lucide-react';

interface ProjectWithStats extends Project {
  calculatedWords?: number;
  calculatedScenes?: number;
}

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
  const [showQuickNewModal, setShowQuickNewModal] = useState(false);

  // Quick Create Form state
  const [quickTitle, setQuickTitle] = useState('');
  const [quickType, setQuickType] = useState<ProjectType>('Novel');
  const [quickGenre, setQuickGenre] = useState('');
  const [quickProtagonist, setQuickProtagonist] = useState('');
  const [quickSituation, setQuickSituation] = useState('');
  const [quickTargetWords, setQuickTargetWords] = useState<number>(75000);

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
        const stats = projectStatsMap[proj.id] || { wordCount: 0, sceneCount: 0 };
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

  const handleQuickCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = quickTitle.trim() || 'Untitled Manuscript';
    const newId = 'proj-' + Date.now();
    const sceneId = 'scene-1';

    const newProj: Project = {
      id: newId,
      title: cleanTitle,
      type: quickType,
      protagonist: quickProtagonist.trim() || undefined,
      genre: quickGenre.trim() || undefined,
      situation: quickSituation.trim() || undefined,
      targetWordCount: quickTargetWords || 75000,
      status: 'drafting',
      lastActiveSceneId: sceneId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onEditProject(newProj);
    setShowQuickNewModal(false);
    setQuickTitle('');
    setQuickGenre('');
    setQuickProtagonist('');
    setQuickSituation('');
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
        return <Film size={14} className="text-[#8C887F]" />;
      case 'Short Story':
      case 'Novella':
        return <FileText size={14} className="text-[#8C887F]" />;
      case 'Worldbuilding Bible':
        return <Compass size={14} className="text-[#8C887F]" />;
      default:
        return <BookOpen size={14} className="text-[#8C887F]" />;
    }
  };

  return (
    <div className="flex-1 bg-[#FBFBF9] overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-10 md:py-14">
        {/* TOP ROOT BANNER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#EBE8E2]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold tracking-widest text-[#8C887F] uppercase font-mono">
                Threadline Root Workspace
              </span>
              <span className="text-[#D8D4CC]">·</span>
              <span className="text-[11px] text-[#6C6960] font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Multi-Project Local Storage
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif text-[#1A1814] font-semibold tracking-tight">
              Manuscripts & Projects
            </h1>
            <p className="text-[#757168] text-sm mt-1 max-w-xl leading-relaxed">
              Switch between your active novels, screenplays, and story bibles. Each work maintains its own scenes, characters, timeline threads, and revisions.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 shrink-0">
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
              className="px-3.5 py-2 text-xs font-medium text-[#4A4741] bg-white hover:bg-[#F6F5F2] rounded-lg transition-colors border border-[#EBE8E2] shadow-2xs flex items-center gap-2 cursor-pointer"
              title="Import a Threadline project archive (.json)"
            >
              <Upload size={13} /> Import Archive
            </button>

            {onOpenVaultManager && (
              <button
                onClick={onOpenVaultManager}
                className="px-3.5 py-2 text-xs font-medium text-[#4A4741] bg-[#FAF6EE] hover:bg-[#F1EAD9] rounded-lg transition-colors border border-[#E5DEC9] shadow-2xs flex items-center gap-2 cursor-pointer"
                title="Open or connect a dedicated local folder vault"
              >
                <FolderOpen size={13} className="text-[#8C6D3F]" /> Open Folder Vault
              </button>
            )}

            <button
              onClick={onCreateNewProject}
              className="px-4 py-2 text-xs font-medium text-white bg-[#2D2A26] hover:bg-[#1A1814] rounded-lg transition-colors shadow-2xs flex items-center gap-2 cursor-pointer"
            >
              <Plus size={14} /> New Project
            </button>
          </div>
        </div>

        {/* WORKSPACE METRICS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-8">
          <div className="bg-white p-4 rounded-xl border border-[#EBE8E2] shadow-2xs">
            <span className="text-[11px] font-medium text-[#8C887F] uppercase tracking-wider block font-mono">
              Total Works
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-serif font-bold text-[#1A1814]">
                {globalSummary.projectCount}
              </span>
              <span className="text-xs text-[#8C887F]">projects registered</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#EBE8E2] shadow-2xs">
            <span className="text-[11px] font-medium text-[#8C887F] uppercase tracking-wider block font-mono">
              Cumulative Words
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-serif font-bold text-[#1A1814]">
                {globalSummary.totalWords.toLocaleString()}
              </span>
              <span className="text-xs text-[#8C887F]">words across all works</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#EBE8E2] shadow-2xs col-span-2 sm:col-span-1">
            <span className="text-[11px] font-medium text-[#8C887F] uppercase tracking-wider block font-mono">
              Drafted Beats
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-serif font-bold text-[#1A1814]">
                {globalSummary.totalScenes}
              </span>
              <span className="text-xs text-[#8C887F]">scenes and sequences</span>
            </div>
          </div>
        </div>

        {/* CONTROLS BAR: SEARCH, FILTERS & SORT */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-3.5 rounded-xl border border-[#EBE8E2] shadow-2xs">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C887F]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, protagonist, genre, or logline..."
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-[#FBFBF9] border border-[#EBE8E2] rounded-lg focus:outline-none focus:border-[#8C887F] text-[#2D2A26] placeholder-[#AAA69F]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C887F] hover:text-[#2D2A26]"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Filters & Sort */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Medium Filter */}
            <div className="flex items-center gap-1.5 bg-[#FBFBF9] border border-[#EBE8E2] rounded-lg px-2.5 py-1">
              <span className="text-[#8C887F] text-[11px]">Type:</span>
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="bg-transparent text-xs font-medium text-[#2D2A26] focus:outline-none cursor-pointer"
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
            <div className="flex items-center gap-1.5 bg-[#FBFBF9] border border-[#EBE8E2] rounded-lg px-2.5 py-1">
              <span className="text-[#8C887F] text-[11px]">Status:</span>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-transparent text-xs font-medium text-[#2D2A26] focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="drafting">Drafting</option>
                <option value="in-progress">In Progress</option>
                <option value="revising">Revising</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div className="flex items-center gap-1.5 bg-[#FBFBF9] border border-[#EBE8E2] rounded-lg px-2.5 py-1">
              <span className="text-[#8C887F] text-[11px]">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-medium text-[#2D2A26] focus:outline-none cursor-pointer"
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
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#DCD8D0] p-8">
            <div className="w-12 h-12 rounded-full bg-[#F6F5F2] text-[#8C887F] flex items-center justify-center mx-auto mb-3">
              <Search size={20} />
            </div>
            <h3 className="text-base font-serif font-medium text-[#1A1814]">No manuscripts matched your filter</h3>
            <p className="text-xs text-[#8C887F] mt-1 max-w-sm mx-auto">
              Try adjusting your search terms or filter selections, or create a brand new project.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTypeFilter('all');
                  setSelectedStatusFilter('all');
                }}
                className="px-3 py-1.5 text-xs text-[#2D2A26] hover:bg-[#F6F5F2] rounded-lg border border-[#EBE8E2] transition-colors"
              >
                Clear Filters
              </button>
              <button
                onClick={onCreateNewProject}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#2D2A26] hover:bg-[#1A1814] rounded-lg transition-colors"
              >
                Create Project
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map((proj) => {
              const isActive = proj.id === activeProjectId;
              const stats = projectStatsMap[proj.id] || { wordCount: 0, sceneCount: 0 };
              const targetWords = proj.targetWordCount || (proj.type === 'Novel' ? 75000 : 25000);
              const progressPct = Math.min(100, Math.round((stats.wordCount / targetWords) * 100));

              return (
                <div
                  key={proj.id}
                  id={`project-card-${proj.id}`}
                  className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden relative group ${
                    isActive
                      ? 'border-[#2D2A26] ring-1 ring-[#2D2A26]/10 shadow-sm'
                      : 'border-[#EBE8E2] hover:border-[#D4CFC7] hover:shadow-2xs'
                  }`}
                >
                  {/* Top Color Accent / Active Tag */}
                  {isActive && (
                    <div className="bg-[#2D2A26] text-white px-4 py-1 text-[10px] font-mono font-medium flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span>CURRENT ACTIVE WORKSPACE</span>
                      </div>
                      <span className="text-[#D4C3A3] text-[10px]">Loaded</span>
                    </div>
                  )}

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Top Header inside card: Type & Status */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F6F5F2] text-[#4A4741] text-xs font-medium border border-[#EBE8E2]">
                            {getMediumIcon(proj.type)}
                            {proj.type}
                          </span>
                          {proj.framework && (
                            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
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
                            <span className="text-[11px] text-[#8C887F] italic truncate max-w-[150px]">
                              {proj.genre}
                            </span>
                          )}
                        </div>

                        {/* Status badge */}
                        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#F9F8F6] text-[#757168] border border-[#EBE8E2]">
                          {proj.status || 'in-progress'}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-xl font-serif font-bold text-[#1A1814] tracking-tight hover:text-[#3C3933] transition-colors leading-snug">
                        {proj.title}
                      </h2>

                      {/* Situation / Premise */}
                      {proj.situation ? (
                        <p className="text-[#757168] text-xs mt-2 line-clamp-2 leading-relaxed font-serif italic">
                          "{proj.situation}"
                        </p>
                      ) : (
                        <p className="text-[#AAA69F] text-xs mt-2 italic">
                          No premise or logline recorded yet.
                        </p>
                      )}

                      {/* Character / Protagonist pill */}
                      {proj.protagonist && (
                        <div className="mt-3 flex items-center gap-1.5 text-xs text-[#524E46]">
                          <span className="text-[#8C887F] text-[11px]">Protagonist:</span>
                          <span className="font-medium bg-[#F6F5F2] px-2 py-0.5 rounded text-[11px]">
                            {proj.protagonist}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar & Word Metrics */}
                    <div className="mt-6 pt-5 border-t border-[#F1EFEA]">
                      <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                        <span className="font-semibold text-[#1A1814]">
                          {stats.wordCount.toLocaleString()} words
                        </span>
                        <span className="text-[#8C887F] text-[11px]">
                          Goal: {targetWords.toLocaleString()} ({progressPct}%)
                        </span>
                      </div>

                      <div className="w-full h-1.5 bg-[#F1EFEA] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#2D2A26] rounded-full transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between mt-3 text-[11px] text-[#8C887F]">
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
                  <div className="px-6 py-3 bg-[#FAF9F6] border-t border-[#EBE8E2] flex items-center justify-between gap-2">
                    {/* Secondary Actions */}
                    <div className="flex items-center gap-1 text-[#757168]">
                      <button
                        onClick={() => setEditingProject(proj)}
                        className="p-1.5 hover:text-[#1A1814] hover:bg-[#ECE9E2] rounded transition-colors cursor-pointer"
                        title="Edit Project Details"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => onDuplicateProject(proj.id)}
                        className="p-1.5 hover:text-[#1A1814] hover:bg-[#ECE9E2] rounded transition-colors cursor-pointer"
                        title="Duplicate Entire Project & Story Bible"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        onClick={() => onExportProject(proj.id)}
                        className="p-1.5 hover:text-[#1A1814] hover:bg-[#ECE9E2] rounded transition-colors cursor-pointer"
                        title="Export Project Archive (.json)"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        onClick={() => setProjectToDelete(proj)}
                        disabled={projects.length <= 1}
                        className="p-1.5 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#757168] cursor-pointer disabled:cursor-not-allowed"
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
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#2D2A26] text-white hover:bg-[#1A1814]'
                          : 'bg-white text-[#2D2A26] hover:bg-[#F1EFEA] border border-[#D8D4CC]'
                      }`}
                    >
                      <span>{isActive ? 'Continue Writing' : 'Open Manuscript'}</span>
                      <ArrowRight size={12} />
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
          <div className="bg-white rounded-2xl border border-[#EBE8E2] shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#EBE8E2]">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#1A1814]">Edit Manuscript Settings</h3>
                <p className="text-xs text-[#8C887F]">Update high-level metadata and targets for this project.</p>
              </div>
              <button
                onClick={() => setEditingProject(null)}
                className="p-1 text-[#8C887F] hover:text-[#1A1814] rounded"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#4A4741] uppercase tracking-wider text-[10px] mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={editingProject.title}
                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FBFBF9] border border-[#EBE8E2] rounded-lg text-[#1A1814] focus:outline-none focus:border-[#2D2A26] text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#4A4741] uppercase tracking-wider text-[10px] mb-1">
                    Medium
                  </label>
                  <select
                    value={editingProject.type}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, type: e.target.value as ProjectType })
                    }
                    className="w-full px-3 py-2 bg-[#FBFBF9] border border-[#EBE8E2] rounded-lg text-[#1A1814] focus:outline-none focus:border-[#2D2A26]"
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
                  <label className="block font-semibold text-[#4A4741] uppercase tracking-wider text-[10px] mb-1">
                    Genre
                  </label>
                  <input
                    type="text"
                    value={editingProject.genre || ''}
                    placeholder="e.g. Historical Mystery, Sci-Fi"
                    onChange={(e) => setEditingProject({ ...editingProject, genre: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FBFBF9] border border-[#EBE8E2] rounded-lg text-[#1A1814] focus:outline-none focus:border-[#2D2A26]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#4A4741] uppercase tracking-wider text-[10px] mb-1">
                    Protagonist
                  </label>
                  <input
                    type="text"
                    value={editingProject.protagonist || ''}
                    placeholder="Lead character name"
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, protagonist: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#FBFBF9] border border-[#EBE8E2] rounded-lg text-[#1A1814] focus:outline-none focus:border-[#2D2A26]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#4A4741] uppercase tracking-wider text-[10px] mb-1">
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
                    className="w-full px-3 py-2 bg-[#FBFBF9] border border-[#EBE8E2] rounded-lg text-[#1A1814] focus:outline-none focus:border-[#2D2A26]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#4A4741] uppercase tracking-wider text-[10px] mb-1">
                  Logline / Central Dramatic Premise
                </label>
                <textarea
                  rows={3}
                  value={editingProject.situation || ''}
                  placeholder="One or two sentences describing the core conflict..."
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, situation: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#FBFBF9] border border-[#EBE8E2] rounded-lg text-[#1A1814] focus:outline-none focus:border-[#2D2A26]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#4A4741] uppercase tracking-wider text-[10px] mb-1">
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
                    className="w-full px-3 py-2 bg-[#FBFBF9] border border-[#EBE8E2] rounded-lg text-[#1A1814] focus:outline-none focus:border-[#2D2A26]"
                  >
                    <option value="drafting">Drafting</option>
                    <option value="in-progress">In Progress</option>
                    <option value="revising">Revising</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#4A4741] uppercase tracking-wider text-[10px] mb-1">
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
                    className="w-full px-3 py-2 bg-[#FBFBF9] border border-[#EBE8E2] rounded-lg text-[#1A1814] focus:outline-none focus:border-[#2D2A26]"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#EBE8E2]">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-3.5 py-2 text-xs font-medium text-[#757168] hover:bg-[#F6F5F2] rounded-lg border border-[#EBE8E2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-[#2D2A26] hover:bg-[#1A1814] rounded-lg transition-colors"
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
          <div className="bg-white rounded-2xl border border-[#EBE8E2] shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-[#1A1814]">Delete Manuscript?</h3>
                <span className="text-xs text-red-600 font-medium">This action cannot be undone</span>
              </div>
            </div>

            <p className="text-xs text-[#757168] leading-relaxed mb-4">
              Are you sure you want to permanently delete{' '}
              <strong className="text-[#1A1814]">"{projectToDelete.title}"</strong>?
              All scenes, character profiles, threads, and snapshot archives for this project will be removed from local storage.
            </p>

            <div className="p-3 bg-[#FAF9F6] rounded-lg border border-[#EBE8E2] mb-5 text-[11px] text-[#757168] flex items-center justify-between">
              <span>Consider downloading an archive backup first:</span>
              <button
                type="button"
                onClick={() => onExportProject(projectToDelete.id)}
                className="text-[#2D2A26] font-medium underline flex items-center gap-1 hover:text-black cursor-pointer"
              >
                <Download size={12} /> Export JSON
              </button>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="px-3.5 py-2 text-xs font-medium text-[#757168] hover:bg-[#F6F5F2] rounded-lg border border-[#EBE8E2]"
              >
                Keep Manuscript
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteProject(projectToDelete.id);
                  setProjectToDelete(null);
                }}
                className="px-4 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
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
