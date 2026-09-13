import React, { useState } from 'react';
import { ProjectBundle, ProjectType, WritingFramework } from '../types';
import {
  FRAMEWORK_DEFINITIONS,
  generateFrameworkProjectBundle
} from '../data/frameworkTemplates';
import {
  Check,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Layers,
  Compass,
  BookOpen,
  Film,
  Clapperboard,
  ListTree,
  Target,
  User,
  Shield,
  Volume2,
  Lock,
  Tag,
  Download
} from 'lucide-react';

interface NewProjectWizardProps {
  onCancel: () => void;
  onCreateProject: (bundle: ProjectBundle) => void;
}

const NOVEL_GENRES = [
  'Literary Fiction',
  'Psychological Thriller',
  'Historical Fiction',
  'Speculative / Sci-Fi',
  'Epic Fantasy',
  'Mystery / Detective',
  'Contemporary Drama',
  'Gothic Mystery'
];

const SCREENPLAY_GENRES = [
  'Feature Film (Drama)',
  'Sci-Fi Thriller',
  'Action / Adventure',
  'TV Pilot (1-Hour Drama)',
  'TV Comedy (30-Min Single Cam)',
  'Psychological Horror',
  'Indie Mystery',
  'Historical Biopic'
];

export const NewProjectWizard: React.FC<NewProjectWizardProps> = ({
  onCancel,
  onCreateProject
}) => {
  const [workspaceMode, setWorkspaceMode] = useState<'novel' | 'screenplay'>('novel');
  const [selectedFramework, setSelectedFramework] = useState<WritingFramework>('three-act');
  const [type, setType] = useState<ProjectType>('Novel');
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [protagonist, setProtagonist] = useState('');
  const [situation, setSituation] = useState('');
  const [desiredSessionGoal, setDesiredSessionGoal] = useState('');
  const [showBeatPreview, setShowBeatPreview] = useState(false);

  const currentFrameworkDef =
    FRAMEWORK_DEFINITIONS.find((f) => f.id === selectedFramework) || FRAMEWORK_DEFINITIONS[0];

  const handleSelectWorkspace = (mode: 'novel' | 'screenplay') => {
    setWorkspaceMode(mode);
    if (mode === 'screenplay') {
      setType('Screenplay');
      if (selectedFramework === 'three-act' || selectedFramework === 'story-circle') {
        setSelectedFramework('save-the-cat'); // Industry favorite for screenwriting
      }
      if (!genre) setGenre('Feature Film (Drama)');
    } else {
      setType('Novel');
      if (selectedFramework === 'save-the-cat') {
        setSelectedFramework('three-act');
      }
      if (!genre) setGenre('Literary Fiction');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalType = workspaceMode === 'screenplay' ? 'Screenplay' : 'Novel';

    const bundle = generateFrameworkProjectBundle({
      title: title.trim() || (workspaceMode === 'screenplay' ? 'Untitled Screenplay' : 'Untitled Novel'),
      type: finalType,
      framework: selectedFramework,
      protagonist: protagonist.trim() || undefined,
      situation: situation.trim() || undefined,
      desiredSessionGoal: desiredSessionGoal.trim() || undefined,
      genre: genre.trim() || undefined
    });

    onCreateProject(bundle);
  };

  const frameworkIcons: Record<WritingFramework, React.ReactNode> = {
    'three-act': <Layers className="text-amber-800" size={20} />,
    'save-the-cat': <Sparkles className="text-orange-700" size={20} />,
    'heros-journey': <Compass className="text-indigo-800" size={20} />,
    'story-circle': <BookOpen className="text-emerald-800" size={20} />,
    'blank': <BookOpen className="text-stone-700" size={20} />
  };

  const genreOptions = workspaceMode === 'screenplay' ? SCREENPLAY_GENRES : NOVEL_GENRES;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onCancel}
          type="button"
          className="text-xs text-stone-500 hover:text-stone-900 flex items-center gap-1.5 mb-3 transition-colors font-mono cursor-pointer"
        >
          <ArrowLeft size={13} /> Back to Projects Hub
        </button>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-semibold tracking-wider text-amber-800 uppercase font-mono bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-sm">
            Story Setup & Workspace Architect
          </span>
          <span className="text-xs text-stone-400 font-mono">Industry Standards</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif text-stone-900 tracking-tight">
          Initialize Your Writing Workspace
        </h2>
        <p className="text-stone-600 text-sm mt-1 max-w-2xl">
          Choose between the Novel Prose Studio or the Screenplay Studio. The editor, toolbar,
          typesetting engine, and exports will adapt precisely to your chosen medium.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* STEP 1: WORKSPACE ARCHETYPE SELECTION */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-stone-100 gap-2">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-amber-800 font-semibold">
                Step 1 · Workspace Discipline
              </span>
              <h3 className="text-base font-serif font-semibold text-stone-900">
                Choose Your Medium & Editor Experience
              </h3>
            </div>
            <span className="text-xs text-stone-500 font-mono">
              Configures canvas, margins & production toolsets
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Novel Studio Card */}
            <div
              onClick={() => handleSelectWorkspace('novel')}
              className={`cursor-pointer rounded-xl p-5 border text-left transition-all relative flex flex-col justify-between ${
                workspaceMode === 'novel'
                  ? 'border-amber-700 bg-amber-50/50 ring-2 ring-amber-700/20 shadow-xs'
                  : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
                        workspaceMode === 'novel'
                          ? 'bg-amber-800 text-white border-amber-800'
                          : 'bg-stone-100 text-stone-600 border-stone-200'
                      }`}
                    >
                      <BookOpen size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border bg-amber-100 text-amber-900 border-amber-300">
                        Prose & Narrative
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                      workspaceMode === 'novel'
                        ? 'bg-amber-800 border-amber-800 text-white'
                        : 'border-stone-300 bg-white text-transparent'
                    }`}
                  >
                    <Check size={12} strokeWidth={3} />
                  </div>
                </div>

                <h4 className="font-serif font-bold text-stone-900 text-lg mb-1">
                  Novel & Fiction Studio
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed mb-4">
                  Crafted for long-form narrative writers. Focuses on deep POV, chapters, internal monologue,
                  sensory atmosphere, word count milestones, and Scrivenings multi-scene binding.
                </p>

                <div className="space-y-1.5 pt-3 border-t border-stone-200/70 text-[11px] font-mono text-stone-600">
                  <div className="flex items-center gap-1.5 text-stone-800">
                    <Check size={12} className="text-amber-800 shrink-0" />
                    <span>Rich Prose & Markdown Canvas with Line-Edit Lenses</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-800">
                    <Check size={12} className="text-amber-800 shrink-0" />
                    <span>Chapter Outlines & Scrivenings Multi-Scene Binder</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-800">
                    <Check size={12} className="text-amber-800 shrink-0" />
                    <span>Style Sheets, Character Codex & Sensory Notes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Screenplay Studio Card */}
            <div
              onClick={() => handleSelectWorkspace('screenplay')}
              className={`cursor-pointer rounded-xl p-5 border text-left transition-all relative flex flex-col justify-between ${
                workspaceMode === 'screenplay'
                  ? 'border-[#E05238] bg-[#E05238]/5 ring-2 ring-[#E05238]/20 shadow-xs'
                  : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
                        workspaceMode === 'screenplay'
                          ? 'bg-[#E05238] text-white border-[#E05238]'
                          : 'bg-stone-100 text-stone-600 border-stone-200'
                      }`}
                    >
                      <Clapperboard size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border bg-rose-100 text-rose-900 border-rose-300">
                        Industry Standard (.fdx)
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                      workspaceMode === 'screenplay'
                        ? 'bg-[#E05238] border-[#E05238] text-white'
                        : 'border-stone-300 bg-white text-transparent'
                    }`}
                  >
                    <Check size={12} strokeWidth={3} />
                  </div>
                </div>

                <h4 className="font-serif font-bold text-stone-900 text-lg mb-1">
                  Screenplay Studio
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed mb-4">
                  Built for screenwriters, showrunners, and playwrights. Complete Hollywood Courier 12pt
                  formatting, SmartTab auto-advance, rainbow revisions, script locking, and assistant director breakdown tagging.
                </p>

                <div className="space-y-1.5 pt-3 border-t border-stone-200/70 text-[11px] font-mono text-stone-600">
                  <div className="flex items-center gap-1.5 text-stone-800">
                    <Check size={12} className="text-[#E05238] shrink-0" />
                    <span>WGA 12pt Courier Canvas with 1.5&quot; Margins & SmartTab</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-800">
                    <Check size={12} className="text-[#E05238] shrink-0" />
                    <span>Hollywood Rainbow Revisions & Script Locking (🔒)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-800">
                    <Check size={12} className="text-[#E05238] shrink-0" />
                    <span>Production Breakdown Tagging (Props, Cast, Stunts, SFX)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-800">
                    <Check size={12} className="text-[#E05238] shrink-0" />
                    <span>Table Read Audio TTS Synthesizer & .FDX / WGA PDF Export</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 2: FRAMEWORK SELECTION */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-stone-100 gap-2">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-stone-400 font-semibold">
                Step 2 · Narrative Architecture
              </span>
              <h3 className="text-base font-serif font-semibold text-stone-900">
                Choose Your Narrative Framework
              </h3>
            </div>
            <span className="text-xs text-stone-500 font-mono">
              Scaffolds all scenes, beat cards & dramatic arcs
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FRAMEWORK_DEFINITIONS.map((fw) => {
              const isSelected = selectedFramework === fw.id;
              const isRecommended =
                workspaceMode === 'screenplay'
                  ? fw.id === 'save-the-cat' || fw.id === 'three-act'
                  : fw.id === 'three-act' || fw.id === 'heros-journey';

              return (
                <div
                  key={fw.id}
                  onClick={() => setSelectedFramework(fw.id)}
                  className={`cursor-pointer rounded-xl p-4 sm:p-5 border text-left transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? workspaceMode === 'screenplay'
                        ? 'border-[#E05238] bg-[#E05238]/5 ring-2 ring-[#E05238]/20 shadow-xs'
                        : 'border-amber-700 bg-amber-50/40 ring-2 ring-amber-700/20 shadow-xs'
                      : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                            isSelected
                              ? 'bg-amber-100/80 border-amber-200'
                              : 'bg-stone-100 border-stone-200'
                          }`}
                        >
                          {frameworkIcons[fw.id]}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${fw.badgeColor}`}
                          >
                            {fw.beatsCount} Beats · {fw.badge}
                          </span>
                          {isRecommended && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 bg-stone-900 text-white rounded">
                              Recommended
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                          isSelected
                            ? workspaceMode === 'screenplay'
                              ? 'bg-[#E05238] border-[#E05238] text-white'
                              : 'bg-amber-800 border-amber-800 text-white'
                            : 'border-stone-300 bg-white text-transparent'
                        }`}
                      >
                        <Check size={12} strokeWidth={3} />
                      </div>
                    </div>

                    <h4 className="font-serif font-semibold text-stone-900 text-base mb-0.5">
                      {fw.name}
                    </h4>
                    <p className="text-[11px] font-mono text-stone-400 mb-2">
                      Origin: {fw.origin}
                    </p>

                    <p className="text-xs text-stone-600 leading-relaxed mb-3">
                      {fw.tagline}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-200/60 mt-auto">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400 mb-1.5 font-semibold">
                      Progression
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {fw.keyPhases.map((phase, i) => (
                        <span
                          key={i}
                          className={`text-[11px] px-2 py-0.5 rounded border leading-tight ${
                            isSelected
                              ? 'bg-white border-amber-200 text-stone-800 font-medium'
                              : 'bg-stone-100/70 border-stone-200 text-stone-600'
                          }`}
                        >
                          {phase.name} <span className="text-stone-400 text-[10px]">({phase.beats})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Collapsible Blueprint Inspector */}
          <div className="mt-5 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setShowBeatPreview(!showBeatPreview)}
              className="w-full flex items-center justify-between text-xs text-stone-600 hover:text-stone-900 py-1 font-mono transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <ListTree size={14} className="text-amber-800" />
                Inspect Full Blueprint: {currentFrameworkDef.name} ({currentFrameworkDef.chaptersCount} Chapters, {currentFrameworkDef.beatsCount} Beats)
              </span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${showBeatPreview ? 'rotate-180' : ''}`}
              />
            </button>

            {showBeatPreview && (
              <div className="mt-4 p-4 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-700 space-y-3 font-mono animate-in fade-in duration-150">
                <p className="leading-relaxed text-stone-800">{currentFrameworkDef.summary}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {currentFrameworkDef.keyPhases.map((p, idx) => (
                    <div key={idx} className="bg-white p-3 rounded border border-stone-200">
                      <div className="font-bold text-stone-900 mb-1">{p.name}</div>
                      <div className="text-[10px] text-amber-800 font-semibold mb-1">
                        {p.chapters} · {p.beats}
                      </div>
                      <p className="text-[11px] text-stone-500">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* STEP 3: STORY SPECIFICATION & SEED DETAILS */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-6 space-y-5">
          <div className="pb-3 border-b border-stone-100">
            <span className="text-xs font-mono uppercase tracking-wider text-stone-400 font-semibold">
              Step 3 · Story Specification
            </span>
            <h3 className="text-base font-serif font-semibold text-stone-900">
              Title & Narrative Details
            </h3>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1 font-mono">
              {workspaceMode === 'screenplay' ? 'Script Title *' : 'Manuscript Title *'}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                workspaceMode === 'screenplay'
                  ? 'e.g., THE CLOCKMAKER OF PRAGUE, or HORIZON ZERO'
                  : 'e.g., The North River Foundry, or The Glass Clockmaker'
              }
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 focus:bg-white focus:outline-none focus:border-stone-400 font-serif"
            />
          </div>

          {/* Genre / Tone Quick Chips */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 font-mono">
              Genre & Medium Archetype
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {genreOptions.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGenre(genre === g ? '' : g)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                    genre === g
                      ? 'bg-stone-900 text-white border-stone-900 font-medium'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="Or enter custom genre / tone..."
              className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-800 focus:bg-white focus:outline-none focus:border-stone-400 font-mono"
            />
          </div>

          {/* Lead Character & Session Goal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1.5 font-mono">
                <User size={13} className="text-amber-800" />
                {workspaceMode === 'screenplay' ? 'Lead Character / Protagonist' : 'Protagonist / Central POV'}
              </label>
              <input
                type="text"
                value={protagonist}
                onChange={(e) => setProtagonist(e.target.value)}
                placeholder={workspaceMode === 'screenplay' ? 'e.g., SILAS VANCE' : 'e.g., Silas Vance, Master Horologist'}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-stone-400"
              />
              <p className="text-[10px] text-stone-400 mt-1">
                Will be populated across character tags, beat cards, and starting scene.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1.5 font-mono">
                <Target size={13} className="text-amber-800" />
                Drafting Target & Intention
              </label>
              <input
                type="text"
                value={desiredSessionGoal}
                onChange={(e) => setDesiredSessionGoal(e.target.value)}
                placeholder={
                  workspaceMode === 'screenplay'
                    ? 'e.g., Write the first 3 pages (slugline and character intro)'
                    : 'e.g., Write the first 500 words establishing sensory voice'
                }
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-stone-400"
              />
              <p className="text-[10px] text-stone-400 mt-1">
                {workspaceMode === 'screenplay'
                  ? 'Standard feature script target: ~110 Pages (110 mins screen time).'
                  : 'Standard novel target: ~75,000 words.'}
              </p>
            </div>
          </div>

          {/* Inciting Situation */}
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1.5 font-mono">
              <Shield size={13} className="text-amber-800" />
              Inciting Catalyst or Opening Disruption
            </label>
            <textarea
              rows={2}
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder={
                workspaceMode === 'screenplay'
                  ? 'e.g., An urgent knock at dawn. A courier slips an unlabelled copper sphere through the mail slot.'
                  : 'e.g., A brass letter-slot courier delivers an unlabelled copper sphere inscribed with a temporal countdown.'
              }
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-stone-400 resize-none"
            />
            <p className="text-[10px] text-stone-400 mt-1">
              Seeds your Scene 1 formatting, slugline, and initial beat conflict.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-stone-100 rounded-xl border border-stone-200">
          <div className="flex items-center gap-2 text-xs text-stone-600 font-mono">
            <span className="font-semibold text-stone-800">Workspace Mode:</span>
            <span
              className={`px-2 py-0.5 rounded font-bold text-white ${
                workspaceMode === 'screenplay' ? 'bg-[#E05238]' : 'bg-amber-800'
              }`}
            >
              {workspaceMode === 'screenplay' ? '🎬 Screenplay Studio' : '📖 Novel Prose'}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`w-full sm:w-auto px-5 py-2.5 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                workspaceMode === 'screenplay'
                  ? 'bg-[#E05238] hover:bg-[#C8432B]'
                  : 'bg-stone-900 hover:bg-stone-800'
              }`}
            >
              <span>Initialize Workspace & Open Scene 1</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
