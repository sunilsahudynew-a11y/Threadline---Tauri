import React, { useState } from 'react';
import { ProjectType, WritingFramework, ProjectBundle } from '../types';
import {
  FRAMEWORK_DEFINITIONS,
  generateFrameworkProjectBundle,
  FrameworkDefinition
} from '../data/frameworkTemplates';
import {
  ArrowLeft,
  BookOpen,
  Film,
  Sparkles,
  Compass,
  Layers,
  ChevronRight,
  CheckCircle2,
  Check,
  ListTree,
  Shield,
  Target,
  User,
  HelpCircle
} from 'lucide-react';

interface NewProjectWizardProps {
  onCancel: () => void;
  onCreateProject: (bundle: ProjectBundle) => void;
}

const GENRE_SUGGESTIONS = [
  'Literary Fiction',
  'Psychological Thriller',
  'Historical Fiction',
  'Speculative / Sci-Fi',
  'Epic Fantasy',
  'Mystery / Detective',
  'Contemporary Drama',
  'Gothic Mystery'
];

export const NewProjectWizard: React.FC<NewProjectWizardProps> = ({
  onCancel,
  onCreateProject
}) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const bundle = generateFrameworkProjectBundle({
      title: title.trim() || 'Untitled Story',
      type,
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onCancel}
          type="button"
          className="text-xs text-stone-500 hover:text-stone-900 flex items-center gap-1.5 mb-3 transition-colors font-mono"
        >
          <ArrowLeft size={13} /> Back to Projects Hub
        </button>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-semibold tracking-wider text-amber-800 uppercase font-mono bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-sm">
            Manuscript Blueprint Wizard
          </span>
          <span className="text-xs text-stone-400 font-mono">Industry Standards</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif text-stone-900 tracking-tight">
          Create a New Story
        </h2>
        <p className="text-stone-600 text-sm mt-1 max-w-2xl">
          Select an industry standard narrative architecture. Threadline will automatically generate
          your chapter beat cards, Story Bible entities, narrative threads, and structural revision passes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Framework Selection (Core Focus) */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-stone-100 gap-2">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-stone-400 font-semibold">
                Step 1 · Narrative Structure
              </span>
              <h3 className="text-base font-serif font-semibold text-stone-900">
                Choose Your Writing Framework
              </h3>
            </div>
            <span className="text-xs text-stone-500">
              Scaffolds all scenes, timeline arcs, & canon items
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FRAMEWORK_DEFINITIONS.map((fw) => {
              const isSelected = selectedFramework === fw.id;
              return (
                <div
                  key={fw.id}
                  onClick={() => setSelectedFramework(fw.id)}
                  className={`cursor-pointer rounded-xl p-4 sm:p-5 border text-left transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-amber-700 bg-amber-50/40 ring-2 ring-amber-700/20 shadow-xs'
                      : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50'
                  }`}
                >
                  {/* Top Row: Icon + Badge + Check */}
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
                        <div>
                          <span
                            className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${fw.badgeColor}`}
                          >
                            {fw.beatsCount} Beats · {fw.badge}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                          isSelected
                            ? 'bg-amber-800 border-amber-800 text-white'
                            : 'border-stone-300 bg-white text-transparent'
                        }`}
                      >
                        <Check size={12} strokeWidth={3} />
                      </div>
                    </div>

                    {/* Title & Origin */}
                    <h4 className="font-serif font-semibold text-stone-900 text-base mb-0.5">
                      {fw.name}
                    </h4>
                    <p className="text-[11px] font-mono text-stone-400 mb-2">
                      Origin: {fw.origin}
                    </p>

                    {/* Tagline */}
                    <p className="text-xs text-stone-600 leading-relaxed mb-3">
                      {fw.tagline}
                    </p>
                  </div>

                  {/* Phases Preview Pills */}
                  <div className="pt-3 border-t border-stone-200/60 mt-auto">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400 mb-1.5 font-semibold">
                      Structural Progression
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
                    <p className="text-[11px] text-stone-500 italic mt-2.5">
                      Ideal for: {fw.recommendedFor}
                    </p>
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
              className="w-full flex items-center justify-between text-xs text-stone-600 hover:text-stone-900 py-1 font-mono transition-colors"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <ListTree size={14} className="text-amber-800" />
                {showBeatPreview ? 'Hide' : 'Inspect'} Boilerplate Beats for{' '}
                <span className="text-stone-900 font-semibold">{currentFrameworkDef.name}</span> (
                {currentFrameworkDef.beatsCount} Scenes)
              </span>
              <span className="text-[11px] text-amber-800 underline flex items-center gap-1">
                {showBeatPreview ? 'Collapse Details' : 'View All Beats & Story Bible Items'}
                <ChevronRight
                  size={12}
                  className={`transform transition-transform ${showBeatPreview ? 'rotate-90' : ''}`}
                />
              </span>
            </button>

            {showBeatPreview && (
              <div className="mt-3 bg-stone-50 rounded-lg p-4 border border-stone-200 text-xs space-y-3 animate-in fade-in duration-150">
                <p className="text-stone-600 leading-relaxed">
                  {currentFrameworkDef.summary}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-stone-200">
                  {currentFrameworkDef.keyPhases.map((phase, idx) => (
                    <div key={idx} className="bg-white p-3 rounded border border-stone-200/80">
                      <div className="font-semibold text-stone-900 font-serif text-xs">
                        {phase.name}
                      </div>
                      <div className="text-[10px] font-mono text-amber-800 mb-1">
                        {phase.beats}
                      </div>
                      <p className="text-[11px] text-stone-500 leading-snug">
                        {phase.description}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="bg-amber-50/70 p-2.5 rounded border border-amber-200 text-[11px] text-amber-900 flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-amber-700 shrink-0" />
                  <span>
                    When created, you will land directly in{' '}
                    <strong>Scene 1 (Opening Beat)</strong> with sensory starter prose, pre-linked A/B/C narrative threads, and an audit checklist ready in Revisions.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Story Medium & Identity */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-6 space-y-5">
          <div className="pb-3 border-b border-stone-100">
            <span className="text-xs font-mono uppercase tracking-wider text-stone-400 font-semibold">
              Step 2 · Story Specification
            </span>
            <h3 className="text-base font-serif font-semibold text-stone-900">
              Title & Medium
            </h3>
          </div>

          {/* Medium Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2 font-mono">
              Story Medium
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('Novel')}
                className={`p-3.5 rounded-lg border text-left transition-all flex items-start gap-3 ${
                  type === 'Novel'
                    ? 'border-amber-700 bg-amber-50/40 ring-1 ring-amber-700/20'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                }`}
              >
                <BookOpen
                  size={18}
                  className={type === 'Novel' ? 'text-amber-800' : 'text-stone-400'}
                />
                <div>
                  <div className="font-serif font-semibold text-sm text-stone-900">
                    Novel / Long-Form Prose
                  </div>
                  <p className="text-[11px] text-stone-500 leading-normal mt-0.5">
                    Chapters, internal monologue, sensory prose, and character psychology.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setType('Screenplay Experiment')}
                className={`p-3.5 rounded-lg border text-left transition-all flex items-start gap-3 ${
                  type === 'Screenplay Experiment'
                    ? 'border-amber-700 bg-amber-50/40 ring-1 ring-amber-700/20'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                }`}
              >
                <Film
                  size={18}
                  className={
                    type === 'Screenplay Experiment' ? 'text-amber-800' : 'text-stone-400'
                  }
                />
                <div>
                  <div className="font-serif font-semibold text-sm text-stone-900">
                    Screenplay / Dramatic Beats
                  </div>
                  <p className="text-[11px] text-stone-500 leading-normal mt-0.5">
                    Sluglines, dialogue cadence, visual beats, and cinematic action blocks.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1 font-mono">
              Story Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., The North River Foundry, or The Glass Clockmaker"
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 focus:bg-white focus:outline-none focus:border-stone-400 font-serif"
            />
          </div>

          {/* Genre / Tone Quick Chips */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 font-mono">
              Genre & Atmosphere (Optional)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {GENRE_SUGGESTIONS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGenre(genre === g ? '' : g)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                    genre === g
                      ? 'bg-amber-800 text-white border-amber-800 font-medium'
                      : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
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
              placeholder="Or write custom genre (e.g. Victorian Solarpunk Mystery)"
              className="w-full p-2 bg-stone-50/70 border border-stone-200 rounded-lg text-xs text-stone-900 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Step 3: Character & Immediate Premise Seeds */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-stone-400 font-semibold">
                Step 3 · Narrative Seeds
              </span>
              <h3 className="text-base font-serif font-semibold text-stone-900">
                Protagonist & Inciting Premise
              </h3>
            </div>
            <span className="text-xs text-stone-400 font-mono italic">Optional · Skip anytime</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1.5">
                <User size={13} className="text-amber-800" />
                Central Protagonist Name
              </label>
              <input
                type="text"
                value={protagonist}
                onChange={(e) => setProtagonist(e.target.value)}
                placeholder="e.g., Silas Vance, Master Horologist"
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-stone-400"
              />
              <p className="text-[10px] text-stone-400 mt-1">
                Will be populated across all scene beat cards and Story Bible character sheets.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1.5">
                <Target size={13} className="text-amber-800" />
                Desired Drafting Win for Today
              </label>
              <input
                type="text"
                value={desiredSessionGoal}
                onChange={(e) => setDesiredSessionGoal(e.target.value)}
                placeholder="e.g., Write the first 500 words establishing sensory voice"
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-stone-400"
              />
              <p className="text-[10px] text-stone-400 mt-1">
                Pinboards your daily intention to the Session Timer and Editor header.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1.5">
              <Shield size={13} className="text-amber-800" />
              Immediate Inciting Situation or Rupture
            </label>
            <textarea
              rows={2}
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="e.g., A brass letter-slot courier delivers an unlabelled copper sphere inscribed with a temporal countdown."
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-stone-400 resize-none"
            />
            <p className="text-[10px] text-stone-400 mt-1">
              Seeds your Scene 1 prose content and outlines your Inciting Incident beat.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-stone-100 rounded-xl border border-stone-200">
          <div className="flex items-center gap-2 text-xs text-stone-600">
            <span className="font-semibold text-stone-800 font-mono">Framework Selected:</span>
            <span className="px-2 py-0.5 rounded bg-white border border-stone-200 font-serif font-medium text-stone-900">
              {currentFrameworkDef.name} ({currentFrameworkDef.beatsCount} beats)
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 bg-stone-900 text-stone-50 hover:bg-stone-800 rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              Generate Boilerplate & Open Scene 1
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
