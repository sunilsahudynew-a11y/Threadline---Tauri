import React, { useState } from 'react';
import {
  Entity,
  Thread,
  StoryEvent,
  Scene,
  EntityType,
  EntityStatus
} from '../types';
import {
  Search,
  Plus,
  Compass,
  Shield,
  Trash2,
  X,
  GitBranch,
  Calendar,
  Layers,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Tag
} from 'lucide-react';

interface StoryBibleScreenProps {
  entities: Entity[];
  threads: Thread[];
  events: StoryEvent[];
  scenes: Scene[];
  onUpdateEntity: (entity: Entity) => void;
  onCreateEntity: (entity: Entity) => void;
  onDeleteEntity: (id: string) => void;
  onUpdateThread: (thread: Thread) => void;
  onCreateThread: (thread: Thread) => void;
  onDeleteThread: (id: string) => void;
  onUpdateEvent: (event: StoryEvent) => void;
  onCreateEvent: (event: StoryEvent) => void;
  onDeleteEvent?: (id: string) => void;
  onNavigateToScene: (sceneId: string) => void;
}

export const StoryBibleScreen: React.FC<StoryBibleScreenProps> = ({
  entities = [],
  threads = [],
  events = [],
  scenes = [],
  onUpdateEntity,
  onCreateEntity,
  onDeleteEntity,
  onUpdateThread,
  onCreateThread,
  onDeleteThread,
  onUpdateEvent,
  onCreateEvent,
  onDeleteEvent,
  onNavigateToScene
}) => {
  const [activeTab, setActiveTab] = useState<'entities' | 'threads' | 'events'>('entities');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const safeEntities = Array.isArray(entities) ? entities : [];
  const safeThreads = Array.isArray(threads) ? threads : [];
  const safeEvents = Array.isArray(events) ? events : [];
  const safeScenes = Array.isArray(scenes) ? scenes : [];

  const [selectedEntityId, setSelectedEntityId] = useState<string>(() => safeEntities[0]?.id || '');
  
  // Mobile / Tablet push-view state (Revamp Report §5.4)
  const [showMobileProfile, setShowMobileProfile] = useState<boolean>(false);

  // New fact input state
  const [newFactText, setNewFactText] = useState('');

  // Filtered Entities
  const filteredEntities = safeEntities.filter((ent) => {
    const matchesSearch =
      ent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ent.description && ent.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ent.canonicalFacts?.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'all' || ent.type === filterType;
    const matchesStatus = filterStatus === 'all' || ent.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const selectedEntity = safeEntities.find((e) => e.id === selectedEntityId) || safeEntities[0];

  const handleCreateDefaultEntity = (type: EntityType = 'character') => {
    const labels: Record<EntityType, string> = {
      character: 'New Character',
      place: 'New Location',
      object: 'New Artifact',
      organization: 'New Faction',
      concept: 'New Lore Concept'
    };
    const newEnt: Entity = {
      id: 'ent-' + Date.now(),
      name: labels[type] || 'New Entity',
      type,
      status: 'tentative',
      description: 'Canonical notes, history, or appearance...',
      canonicalFacts: ['Initial established fact'],
      linkedSceneIds: []
    };
    onCreateEntity(newEnt);
    setSelectedEntityId(newEnt.id);
    setShowMobileProfile(true);
  };

  const handleAddFact = () => {
    if (!selectedEntity || !newFactText.trim()) return;
    const updatedFacts = [...(selectedEntity.canonicalFacts || []), newFactText.trim()];
    onUpdateEntity({
      ...selectedEntity,
      canonicalFacts: updatedFacts
    });
    setNewFactText('');
  };

  const handleRemoveFact = (index: number) => {
    if (!selectedEntity) return;
    const updatedFacts = selectedEntity.canonicalFacts.filter((_, i) => i !== index);
    onUpdateEntity({
      ...selectedEntity,
      canonicalFacts: updatedFacts
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-24 md:pb-12 text-[#221E18]">
      {/* HEADER: Brand Lexicon "Codex & Lore Vault" */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <span className="section-label block mb-1">
            Canon &amp; World Archive
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#221E18] font-semibold">
            Codex &amp; Lore Vault
          </h1>
          <p className="text-[#7A705F] text-xs sm:text-sm mt-1">
            Canonical characters, locations, narrative threads, and world history tracked across your manuscript.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Tab Switcher */}
          <div className="bg-[#F1EAD9] border border-[rgba(34,30,24,0.12)] p-0.5 rounded-[6px] flex text-xs font-medium">
            <button
              onClick={() => {
                setActiveTab('entities');
                setShowMobileProfile(false);
              }}
              className={`px-3 py-1.5 rounded-[5px] text-xs font-medium transition-colors duration-150 cursor-pointer min-h-[36px] border ${
                activeTab === 'entities'
                  ? 'bg-[#FAF6EE] text-[#221E18] shadow-warm-sm border-[rgba(34,30,24,0.12)]'
                  : 'text-[#7A705F] hover:text-[#221E18] border-transparent'
              }`}
            >
              Entities ({safeEntities.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('threads');
                setShowMobileProfile(false);
              }}
              className={`px-3 py-1.5 rounded-[5px] text-xs font-medium transition-colors duration-150 cursor-pointer min-h-[36px] border ${
                activeTab === 'threads'
                  ? 'bg-[#FAF6EE] text-[#221E18] shadow-warm-sm border-[rgba(34,30,24,0.12)]'
                  : 'text-[#7A705F] hover:text-[#221E18] border-transparent'
              }`}
            >
              Threads ({safeThreads.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('events');
                setShowMobileProfile(false);
              }}
              className={`px-3 py-1.5 rounded-[5px] text-xs font-medium transition-colors duration-150 cursor-pointer min-h-[36px] border ${
                activeTab === 'events'
                  ? 'bg-[#FAF6EE] text-[#221E18] shadow-warm-sm border-[rgba(34,30,24,0.12)]'
                  : 'text-[#7A705F] hover:text-[#221E18] border-transparent'
              }`}
            >
              Timeline ({safeEvents.length})
            </button>
          </div>

          {/* Add Item Button */}
          <button
            onClick={() => {
              if (activeTab === 'entities') {
                const newEnt: Entity = {
                  id: 'ent-' + Date.now(),
                  name: 'New Entity',
                  type: 'character',
                  status: 'tentative',
                  description: 'Description of character or lore item...',
                  canonicalFacts: ['Initial confirmed fact'],
                  linkedSceneIds: []
                };
                onCreateEntity(newEnt);
                setSelectedEntityId(newEnt.id);
                setShowMobileProfile(true);
              } else if (activeTab === 'threads') {
                const newTh: Thread = {
                  id: 'th-' + Date.now(),
                  title: 'New Narrative Thread',
                  description: 'Central conflict or thematic question...',
                  status: 'active',
                  color: '#35505F',
                  linkedSceneIds: []
                };
                onCreateThread(newTh);
              } else if (activeTab === 'events') {
                const newEv: StoryEvent = {
                  id: 'ev-' + Date.now(),
                  title: 'New Timeline Event',
                  time: 'Day 1, Morning',
                  participants: [],
                  consequences: 'Key consequences of this turning point...'
                };
                onCreateEvent(newEv);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#B54B32] text-[#FAF6EE] text-xs font-semibold hover:bg-[#9E3E27] shadow-warm-sm transition-colors cursor-pointer min-h-[36px]"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Add Entry</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. ENTITIES VIEW (CHARACTERS, PLACES, LORE, OBJECTS)                      */}
      {/* ========================================================================= */}
      {activeTab === 'entities' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT LIST COLUMN (Filterable, scrollable) */}
          <div className={`lg:col-span-5 space-y-4 ${showMobileProfile ? 'hidden lg:block' : 'block'}`}>
            {/* Search and Filters */}
            <div className="space-y-2.5 bg-[#F1EAD9] p-3 rounded-[6px] border border-[rgba(34,30,24,0.12)]">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-[#7A705F]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search characters, places, facts..."
                  className="w-full bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[6px] pl-8 pr-3 py-1.5 text-xs text-[#221E18] focus:outline-none focus:border-[#35505F]"
                />
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'character', label: 'Characters' },
                  { id: 'place', label: 'Places' },
                  { id: 'object', label: 'Objects' },
                  { id: 'organization', label: 'Factions' },
                  { id: 'concept', label: 'Lore & Magic' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setFilterType(cat.id)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer min-h-[28px] ${
                      filterType === cat.id
                        ? 'bg-[#B54B32] text-[#FAF6EE]'
                        : 'bg-[#FAF6EE] text-[#7A705F] hover:text-[#221E18] border border-[rgba(34,30,24,0.12)]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Entities List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filteredEntities.length === 0 ? (
                <div className="p-6 text-center bg-[#F1EAD9]/60 rounded-[6px] border border-[rgba(34,30,24,0.12)] text-xs text-[#7A705F] space-y-3">
                  <div>
                    <p className="font-serif italic text-sm text-[#221E18] mb-1">Your Codex is ready for entries.</p>
                    <p>Pin characters, locations, factions, and world facts to anchor your canon.</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-center pt-1">
                    <button
                      onClick={() => handleCreateDefaultEntity('character')}
                      className="px-2.5 py-1 bg-[#FAF6EE] hover:bg-[#FAF6EE]/80 border border-[rgba(34,30,24,0.15)] rounded-[4px] text-[11px] font-medium text-[#221E18] cursor-pointer"
                    >
                      + Character
                    </button>
                    <button
                      onClick={() => handleCreateDefaultEntity('place')}
                      className="px-2.5 py-1 bg-[#FAF6EE] hover:bg-[#FAF6EE]/80 border border-[rgba(34,30,24,0.15)] rounded-[4px] text-[11px] font-medium text-[#221E18] cursor-pointer"
                    >
                      + Location
                    </button>
                    <button
                      onClick={() => handleCreateDefaultEntity('concept')}
                      className="px-2.5 py-1 bg-[#FAF6EE] hover:bg-[#FAF6EE]/80 border border-[rgba(34,30,24,0.15)] rounded-[4px] text-[11px] font-medium text-[#221E18] cursor-pointer"
                    >
                      + Lore / Magic
                    </button>
                  </div>
                </div>
              ) : (
                filteredEntities.map((entity) => {
                  const isSelected = entity.id === selectedEntity?.id;
                  return (
                    <div
                      key={entity.id}
                      onClick={() => {
                        setSelectedEntityId(entity.id);
                        setShowMobileProfile(true);
                      }}
                      className={`p-3.5 rounded-[6px] border transition-all cursor-pointer min-h-[44px] ${
                        isSelected
                          ? 'bg-[#F1EAD9] border-[#B54B32] shadow-warm-sm'
                          : 'bg-[#FAF6EE] border-[rgba(34,30,24,0.12)] hover:border-[rgba(34,30,24,0.25)]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-serif font-semibold text-sm text-[#221E18] truncate">
                          {entity.name}
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A705F] px-1.5 py-0.5 rounded-[4px] bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] shrink-0">
                          {entity.type}
                        </span>
                      </div>
                      <p className="text-xs text-[#7A705F] line-clamp-2 mt-1">
                        {entity.description || 'No description provided.'}
                      </p>
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#7A705F] mt-2 pt-2 border-t border-[rgba(34,30,24,0.08)]">
                        <span>{entity.canonicalFacts?.length || 0} confirmed facts</span>
                        <span>{entity.linkedSceneIds?.length || 0} scenes</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT PROFILE COLUMN (Deep dossier view) */}
          <div className={`lg:col-span-7 ${!showMobileProfile ? 'hidden lg:block' : 'block'}`}>
            {selectedEntity ? (
              <div className="bg-[#F1EAD9] rounded-[6px] border border-[rgba(34,30,24,0.12)] p-5 sm:p-6 space-y-6 shadow-warm-sm">
                {/* Back button on mobile to return to entity list */}
                <div className="lg:hidden pb-3 border-b border-[rgba(34,30,24,0.12)]">
                  <button
                    onClick={() => setShowMobileProfile(false)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B54B32] cursor-pointer min-h-[44px]"
                  >
                    <ArrowLeft size={15} />
                    <span>Back to Entities List</span>
                  </button>
                </div>

                {/* Profile Title & Meta Fields */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[rgba(34,30,24,0.12)]">
                  <div className="space-y-1 flex-1">
                    <input
                      type="text"
                      value={selectedEntity.name}
                      onChange={(e) => onUpdateEntity({ ...selectedEntity, name: e.target.value })}
                      className="font-serif font-semibold text-xl sm:text-2xl text-[#221E18] bg-transparent border-b border-transparent hover:border-[rgba(34,30,24,0.2)] focus:border-[#B54B32] focus:outline-none w-full"
                    />
                    <div className="flex items-center gap-2 text-xs">
                      <select
                        value={selectedEntity.type}
                        onChange={(e) => onUpdateEntity({ ...selectedEntity, type: e.target.value as EntityType })}
                        className="bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded px-2 py-1 text-xs text-[#221E18] focus:outline-none"
                      >
                        <option value="character">Character</option>
                        <option value="place">Place / Location</option>
                        <option value="object">Object / Item</option>
                        <option value="organization">Faction / Group</option>
                        <option value="concept">Lore / Magic / Tech</option>
                      </select>

                      <select
                        value={selectedEntity.status}
                        onChange={(e) => onUpdateEntity({ ...selectedEntity, status: e.target.value as EntityStatus })}
                        className="bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded px-2 py-1 text-xs text-[#221E18] focus:outline-none"
                      >
                        <option value="confirmed">Confirmed Canon</option>
                        <option value="tentative">Tentative / WIP</option>
                        <option value="contradicted">Contradicted</option>
                        <option value="retired">Retired</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Remove "${selectedEntity.name}" from the Codex?`)) {
                        onDeleteEntity(selectedEntity.id);
                        setShowMobileProfile(false);
                      }
                    }}
                    className="p-2 text-[#7A705F] hover:text-[#B54B32] transition-colors cursor-pointer self-start sm:self-center"
                    title="Delete entity"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-[#7A705F] font-semibold block">
                    Narrative Summary &amp; Traits
                  </label>
                  <textarea
                    value={selectedEntity.description}
                    onChange={(e) => onUpdateEntity({ ...selectedEntity, description: e.target.value })}
                    rows={3}
                    placeholder="Physical appearance, voice, motivations, or world significance..."
                    className="w-full bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[6px] p-3 text-xs text-[#221E18] leading-relaxed focus:outline-none focus:border-[#35505F]"
                  />
                </div>

                {/* Canonical Facts */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#7A705F] font-semibold">
                      Confirmed Canonical Facts ({selectedEntity.canonicalFacts?.length || 0})
                    </label>
                  </div>

                  <div className="space-y-1.5">
                    {selectedEntity.canonicalFacts?.map((fact, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 p-2 bg-[#FAF6EE] rounded-[6px] border border-[rgba(34,30,24,0.12)] text-xs text-[#221E18]"
                      >
                        <span className="flex-1">• {fact}</span>
                        <button
                          onClick={() => handleRemoveFact(idx)}
                          className="text-[#7A705F] hover:text-[#B54B32] cursor-pointer p-1"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={newFactText}
                        onChange={(e) => setNewFactText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddFact()}
                        placeholder="Add a new immutable canon fact..."
                        className="flex-1 bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[6px] px-3 py-1.5 text-xs text-[#221E18] focus:outline-none focus:border-[#35505F]"
                      />
                      <button
                        onClick={handleAddFact}
                        className="px-3 py-1.5 bg-[#35505F] text-[#FAF6EE] text-xs font-semibold rounded-[6px] hover:bg-[#2A404D] transition-colors cursor-pointer min-h-[36px]"
                      >
                        Add Fact
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bidirectional Scene Appearances */}
                <div className="space-y-2.5 pt-2 border-t border-[rgba(34,30,24,0.12)]">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-[#7A705F] font-semibold block">
                    Manuscript Appearances ({selectedEntity.linkedSceneIds?.length || 0})
                  </label>

                  {selectedEntity.linkedSceneIds?.length === 0 ? (
                    <p className="text-xs text-[#7A705F] italic">
                      This entity hasn't been mentioned in any scenes yet. Use @{selectedEntity.name} in the Editor to link it.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {selectedEntity.linkedSceneIds.map((sceneId) => {
                        const sc = scenes.find((s) => s.id === sceneId);
                        if (!sc) return null;
                        return (
                          <button
                            key={sceneId}
                            onClick={() => onNavigateToScene(sceneId)}
                            className="w-full flex items-center justify-between p-2.5 bg-[#FAF6EE] hover:bg-[#EAE4D6] rounded-[6px] border border-[rgba(34,30,24,0.12)] text-left text-xs transition-colors cursor-pointer min-h-[44px]"
                          >
                            <div className="flex items-center gap-2">
                              <BookOpen size={13} className="text-[#B54B32]" />
                              <span className="font-serif font-medium text-[#221E18]">{sc.title}</span>
                              {sc.pov && (
                                <span className="text-[10px] text-[#7A705F]">· POV: {sc.pov}</span>
                              )}
                            </div>
                            <ArrowRight size={13} className="text-[#7A705F]" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-[#F1EAD9]/50 rounded-[6px] border border-[rgba(34,30,24,0.12)] text-xs text-[#7A705F] space-y-3">
                <p className="font-serif italic text-base text-[#221E18]">Select an entity or create a new entry.</p>
                <p>Track canon, traits, confirmed facts, and bidirectional scene appearances in this dossier.</p>
                <button
                  onClick={() => handleCreateDefaultEntity('character')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#B54B32] text-[#FAF6EE] text-xs font-semibold hover:bg-[#9E3E27] cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Create First Entry</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. NARRATIVE THREADS & ARCS VIEW                                          */}
      {/* ========================================================================= */}
      {activeTab === 'threads' && (
        <div className="space-y-4">
          {safeThreads.length === 0 ? (
            <div className="p-12 text-center bg-[#F1EAD9]/50 rounded-[6px] border border-[rgba(34,30,24,0.12)] text-xs text-[#7A705F] space-y-3 max-w-lg mx-auto">
              <GitBranch className="w-8 h-8 text-[#35505F] mx-auto opacity-70" />
              <p className="font-serif italic text-base text-[#221E18]">No narrative threads established yet.</p>
              <p>Threads weave thematic conflicts, subplots, and mystery arcs across scenes in your manuscript.</p>
              <button
                onClick={() => {
                  const newTh: Thread = {
                    id: 'th-' + Date.now(),
                    title: 'Main Conflict Arc',
                    description: 'The core dramatic question driving the manuscript...',
                    status: 'active',
                    color: '#35505F',
                    linkedSceneIds: []
                  };
                  onCreateThread(newTh);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#35505F] text-[#FAF6EE] text-xs font-semibold hover:bg-[#2A404D] cursor-pointer"
              >
                <Plus size={14} />
                <span>Create Narrative Thread</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {safeThreads.map((thread) => (
                <div
                  key={thread.id}
                  className="bg-[#F1EAD9] p-4 rounded-[6px] border border-[rgba(34,30,24,0.12)] space-y-3 shadow-warm-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: thread.color || '#35505F' }}
                      />
                      <input
                        type="text"
                        value={thread.title}
                        onChange={(e) => onUpdateThread({ ...thread, title: e.target.value })}
                        className="font-serif font-semibold text-sm text-[#221E18] bg-transparent border-b border-transparent hover:border-[rgba(34,30,24,0.2)] focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={() => onDeleteThread(thread.id)}
                      className="text-[#7A705F] hover:text-[#B54B32] p-1 cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <textarea
                    value={thread.description}
                    onChange={(e) => onUpdateThread({ ...thread, description: e.target.value })}
                    rows={2}
                    className="w-full bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[6px] p-2 text-xs text-[#221E18] focus:outline-none"
                    placeholder="Thematic core or conflict trajectory..."
                  />

                  <div className="flex items-center justify-between text-[11px] text-[#7A705F] pt-2 border-t border-[rgba(34,30,24,0.08)]">
                    <select
                      value={thread.status}
                      onChange={(e) => onUpdateThread({ ...thread, status: e.target.value as any })}
                      className="bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded px-2 py-0.5 text-xs text-[#221E18]"
                    >
                      <option value="active">Active Arc</option>
                      <option value="resolved">Resolved</option>
                      <option value="dormant">Dormant</option>
                    </select>
                    <span>{thread.linkedSceneIds?.length || 0} scenes linked</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. STORY TIMELINE & CHRONOLOGY VIEW                                       */}
      {/* ========================================================================= */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {safeEvents.length === 0 ? (
            <div className="p-12 text-center bg-[#F1EAD9]/50 rounded-[6px] border border-[rgba(34,30,24,0.12)] text-xs text-[#7A705F] space-y-3 max-w-lg mx-auto">
              <Calendar className="w-8 h-8 text-[#35505F] mx-auto opacity-70" />
              <p className="font-serif italic text-base text-[#221E18]">Story chronology is empty.</p>
              <p>Record key timeline milestones, world events, and turning points in chronological order.</p>
              <button
                onClick={() => {
                  const newEv: StoryEvent = {
                    id: 'ev-' + Date.now(),
                    title: 'Opening Inciting Incident',
                    time: 'Day 1, Dawn',
                    participants: [],
                    consequences: 'The world changes irreversibly...'
                  };
                  onCreateEvent(newEv);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#35505F] text-[#FAF6EE] text-xs font-semibold hover:bg-[#2A404D] cursor-pointer"
              >
                <Plus size={14} />
                <span>Record Timeline Event</span>
              </button>
            </div>
          ) : (
            <div className="relative border-l-2 border-[#35505F]/30 ml-4 space-y-6 py-2">
              {safeEvents.map((ev) => (
                <div key={ev.id} className="relative pl-6">
                  {/* Node dot */}
                  <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-[#FAF6EE] border-2 border-[#35505F] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#35505F]" />
                  </div>

                  <div className="bg-[#F1EAD9] p-4 rounded-[6px] border border-[rgba(34,30,24,0.12)] space-y-2 shadow-warm-sm">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-[#35505F] font-semibold">{ev.time}</span>
                        <span>·</span>
                        <input
                          type="text"
                          value={ev.title}
                          onChange={(e) => onUpdateEvent({ ...ev, title: e.target.value })}
                          className="font-serif font-semibold text-sm text-[#221E18] bg-transparent border-b border-transparent hover:border-[rgba(34,30,24,0.2)] focus:outline-none"
                        />
                      </div>
                      {onDeleteEvent && (
                        <button
                          onClick={() => onDeleteEvent(ev.id)}
                          className="text-[#7A705F] hover:text-[#B54B32] p-1 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-[#7A705F]">{ev.consequences}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
