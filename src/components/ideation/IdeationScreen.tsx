import React, { useState } from 'react';
import {
  ALL_FRAMEWORKS,
  THREE_ACT_FRAMEWORK,
  HEROS_JOURNEY_FRAMEWORK,
  STORY_CIRCLE_FRAMEWORK,
  FrameworkModel
} from '../../data/ideationFrameworks';
import { FrameworkPointer, RoughIdea, Scene, Entity } from '../../types';
import { ThreeActGraph } from './ThreeActGraph';
import { HerosJourneyDial } from './HerosJourneyDial';
import { BeatInspectorDrawer } from './BeatInspectorDrawer';
import { RoughIdeasScratchpad } from './RoughIdeasScratchpad';
import {
  Lightbulb,
  Activity,
  Compass,
  Bookmark,
  Sparkles,
  Plus,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';

interface IdeationScreenProps {
  roughIdeas: RoughIdea[];
  frameworkPointers: FrameworkPointer[];
  scenes: Scene[];
  entities: Entity[];
  onAddRoughIdea: (idea: Omit<RoughIdea, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateRoughIdea: (idea: RoughIdea) => void;
  onDeleteRoughIdea: (id: string) => void;
  onAddFrameworkPointer: (pointer: Omit<FrameworkPointer, 'id' | 'createdAt'>) => void;
  onDeleteFrameworkPointer: (id: string) => void;
  onConvertToScene: (idea: RoughIdea) => void;
  onConvertToEntity: (idea: RoughIdea) => void;
  onNavigateToScene?: (sceneId: string) => void;
}

export const IdeationScreen: React.FC<IdeationScreenProps> = ({
  roughIdeas = [],
  frameworkPointers = [],
  scenes = [],
  entities = [],
  onAddRoughIdea,
  onUpdateRoughIdea,
  onDeleteRoughIdea,
  onAddFrameworkPointer,
  onDeleteFrameworkPointer,
  onConvertToScene,
  onConvertToEntity,
  onNavigateToScene
}) => {
  // Main screen mode: 'frameworks' | 'ideas'
  const [activeTab, setActiveTab] = useState<'frameworks' | 'ideas'>('frameworks');

  // Selected framework model: 'three-act' | 'heros-journey' | 'story-circle'
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string>('three-act');

  // Selected beat node in the active framework
  const [selectedBeatKey, setSelectedBeatKey] = useState<string | null>('act2-midpoint');

  // Find active framework
  const activeFramework: FrameworkModel =
    ALL_FRAMEWORKS.find((f) => f.id === selectedFrameworkId) || THREE_ACT_FRAMEWORK;

  // Find active beat definition
  const selectedBeat = activeFramework.beats.find((b) => b.key === selectedBeatKey) || activeFramework.beats[0];

  const handleSelectBeat = (beatKey: string) => {
    setSelectedBeatKey(beatKey);
  };

  const handleLinkRoughIdeaToBeat = (ideaId: string, beatKey: string) => {
    const idea = roughIdeas.find((i) => i.id === ideaId);
    if (!idea) return;
    onUpdateRoughIdea({
      ...idea,
      linkedBeatKey: beatKey
    });

    // Also auto-create a framework pointer from this idea
    onAddFrameworkPointer({
      framework: activeFramework.id === 'heros-journey' ? 'heros-journey' : 'three-act',
      beatKey,
      title: idea.title,
      notes: idea.description || undefined,
      color: '#B54B32'
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-24 md:pb-12 text-[#221E18]">
      {/* ========================================================================= */}
      {/* HEADER                                                                    */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <span className="section-label block mb-1">
            Story Architecture &amp; Ideation
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#221E18] font-semibold">
            Ideation &amp; Frameworks
          </h1>
          <p className="text-[#7A705F] text-xs sm:text-sm mt-1">
            Visually map narrative tension on classic story structures and capture rough creative sparks.
          </p>
        </div>

        {/* Studio Primary View Switcher */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="bg-[#F1EAD9] border border-[rgba(34,30,24,0.12)] p-0.5 rounded-[6px] flex text-xs font-medium w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab('frameworks')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-[5px] text-xs font-medium transition-colors cursor-pointer min-h-[36px] flex items-center justify-center gap-1.5 border whitespace-nowrap ${
                activeTab === 'frameworks'
                  ? 'bg-[#FAF6EE] text-[#221E18] shadow-warm-sm border-[rgba(34,30,24,0.12)] font-semibold'
                  : 'text-[#7A705F] hover:text-[#221E18] border-transparent'
              }`}
            >
              <Activity size={14} className="text-[#B54B32]" />
              <span>Visual Frameworks</span>
            </button>

            <button
              onClick={() => setActiveTab('ideas')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-[5px] text-xs font-medium transition-colors cursor-pointer min-h-[36px] flex items-center justify-center gap-1.5 border whitespace-nowrap ${
                activeTab === 'ideas'
                  ? 'bg-[#FAF6EE] text-[#221E18] shadow-warm-sm border-[rgba(34,30,24,0.12)] font-semibold'
                  : 'text-[#7A705F] hover:text-[#221E18] border-transparent'
              }`}
            >
              <Lightbulb size={14} className="text-[#D17B2F]" />
              <span>Rough Ideas ({roughIdeas.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. VISUAL FRAMEWORKS VIEW                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'frameworks' && (
        <div className="space-y-6">
          {/* Framework Model Selector Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F1EAD9] p-2.5 rounded-[8px] border border-[rgba(34,30,24,0.1)]">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <span className="text-xs font-mono text-[#7A705F] uppercase font-semibold mr-1 shrink-0">
                Model:
              </span>
              {ALL_FRAMEWORKS.map((fw) => (
                <button
                  key={fw.id}
                  onClick={() => {
                    setSelectedFrameworkId(fw.id);
                    setSelectedBeatKey(fw.beats[0]?.key || null);
                  }}
                  className={`px-3 py-1.5 rounded-[5px] text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 border shrink-0 whitespace-nowrap ${
                    selectedFrameworkId === fw.id
                      ? 'bg-[#221E18] text-[#FAF6EE] border-[#221E18] shadow-2xs font-semibold'
                      : 'bg-[#FAF6EE] text-[#554D40] hover:text-[#221E18] border-[rgba(34,30,24,0.08)]'
                  }`}
                >
                  {fw.visualType === 'curve' ? (
                    <Activity size={12} className={selectedFrameworkId === fw.id ? 'text-[#FAF6EE]' : 'text-[#B54B32]'} />
                  ) : (
                    <Compass size={12} className={selectedFrameworkId === fw.id ? 'text-[#FAF6EE]' : 'text-[#3A7D6E]'} />
                  )}
                  <span>{fw.name}</span>
                </button>
              ))}
            </div>

            {/* Pointer Count Summary */}
            <div className="text-xs font-mono text-[#7A705F] flex items-center gap-1.5 shrink-0">
              <Bookmark size={13} className="text-[#B54B32]" />
              <span>{frameworkPointers.length} Pointers Charted</span>
            </div>
          </div>

          {/* Mobile Beat Selection Carousel (Visible only on < lg screens for quick tapping) */}
          <div className="block lg:hidden bg-[#FAF6EE] p-3 rounded-[8px] border border-[rgba(34,30,24,0.1)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-[#7A705F]">
                Tap to Inspect Narrative Beat:
              </span>
              {selectedBeat && (
                <span className="text-[10px] font-mono text-[#B54B32] font-semibold">
                  Active: {selectedBeat.name}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {activeFramework.beats.map((b) => {
                const isSelected = selectedBeatKey === b.key;
                return (
                  <button
                    key={b.key}
                    onClick={() => {
                      handleSelectBeat(b.key);
                      // On mobile smooth-scroll to inspector
                      document.getElementById('mobile-beat-inspector')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`px-3 py-1.5 rounded-[5px] text-xs font-serif font-medium transition-all shrink-0 border whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#B54B32] text-[#FAF6EE] border-[#B54B32] shadow-xs'
                        : 'bg-[#F1EAD9] text-[#221E18] border-[rgba(34,30,24,0.1)] hover:bg-[#EAE3D2]'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: isSelected ? '#FAF6EE' : b.color }}
                    />
                    <span>{b.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Visual & Inspector Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT / CENTER: Animated Framework Visualizer */}
            <div className="lg:col-span-8 space-y-4">
              {activeFramework.visualType === 'curve' ? (
                <ThreeActGraph
                  framework={activeFramework}
                  pointers={frameworkPointers}
                  selectedBeatKey={selectedBeatKey}
                  onSelectBeat={handleSelectBeat}
                  onAddPointer={() => {}}
                />
              ) : (
                <HerosJourneyDial
                  framework={activeFramework}
                  pointers={frameworkPointers}
                  selectedBeatKey={selectedBeatKey}
                  onSelectBeat={handleSelectBeat}
                  onAddPointer={() => {}}
                />
              )}
            </div>

            {/* RIGHT: Beat Inspector Drawer */}
            <div id="mobile-beat-inspector" className="lg:col-span-4 min-h-[480px]">
              {selectedBeat ? (
                <BeatInspectorDrawer
                  beat={selectedBeat}
                  pointers={frameworkPointers}
                  roughIdeas={roughIdeas}
                  scenes={scenes}
                  onClose={() => setSelectedBeatKey(null)}
                  onAddPointer={onAddFrameworkPointer}
                  onDeletePointer={onDeleteFrameworkPointer}
                  onLinkRoughIdea={handleLinkRoughIdeaToBeat}
                  onNavigateToScene={onNavigateToScene}
                />
              ) : (
                <div className="bg-[#FAF6EE] rounded-[10px] border border-dashed border-[rgba(34,30,24,0.15)] p-8 text-center text-[#7A705F] space-y-3">
                  <Activity size={24} className="mx-auto text-[#B54B32] opacity-70" />
                  <h3 className="text-sm font-semibold text-[#221E18]">Select a Beat Node</h3>
                  <p className="text-xs">
                    Click any beat node along the dramatic curve or monomyth dial to inspect its craft purpose and anchor story pointers.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ROUGH IDEAS SCRATCHPAD VIEW (Feature 1)                                */}
      {/* ========================================================================= */}
      {activeTab === 'ideas' && (
        <RoughIdeasScratchpad
          ideas={roughIdeas}
          scenes={scenes}
          entities={entities}
          onAddIdea={onAddRoughIdea}
          onUpdateIdea={onUpdateRoughIdea}
          onDeleteIdea={onDeleteRoughIdea}
          onConvertToScene={onConvertToScene}
          onConvertToEntity={onConvertToEntity}
          onAttachToBeat={(ideaId, beatKey) => handleLinkRoughIdeaToBeat(ideaId, beatKey)}
        />
      )}
    </div>
  );
};
