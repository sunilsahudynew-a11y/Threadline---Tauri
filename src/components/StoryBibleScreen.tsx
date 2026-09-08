import React, { useState } from 'react';
import {
  Entity,
  Thread,
  StoryEvent,
  Scene,
  EntityType,
  EntityStatus
} from '../types';
import { VisualDetailsEditor } from './codex/VisualDetailsEditor';
import { CharacterPlanningDossier } from './codex/CharacterPlanningDossier';
import { WorldPlanningDossier } from './codex/WorldPlanningDossier';
import { ResearchTracker } from './codex/ResearchTracker';
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
  Tag,
  User,
  Globe,
  FileText,
  Sparkles,
  Palette
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

export type CodexTab = 'characters' | 'world' | 'research' | 'threads' | 'events';

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
  const [activeTab, setActiveTab] = useState<CodexTab>('characters');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const safeEntities = Array.isArray(entities) ? entities : [];
  const safeThreads = Array.isArray(threads) ? threads : [];
  const safeEvents = Array.isArray(events) ? events : [];
  const safeScenes = Array.isArray(scenes) ? scenes : [];

  // Split entities into Characters vs World elements
  const characterEntities = safeEntities.filter((e) => e.type === 'character');
  const worldEntities = safeEntities.filter((e) => e.type !== 'character');

  // Active selection
  const [selectedEntityId, setSelectedEntityId] = useState<string>(() => {
    return safeEntities[0]?.id || '';
  });

  // Mobile / Tablet push-view state
  const [showMobileProfile, setShowMobileProfile] = useState<boolean>(false);

  // Track failed avatar image URLs so they gracefully fallback to initials
  const [failedAvatars, setFailedAvatars] = useState<Record<string, boolean>>({});

  // New fact input state
  const [newFactText, setNewFactText] = useState('');

  // Determine current active list based on active tab
  const currentList = activeTab === 'characters' ? characterEntities : worldEntities;

  const filteredEntities = currentList.filter((ent) => {
    const matchesSearch =
      ent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ent.description && ent.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ent.canonicalFacts?.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'all' || ent.type === filterType;
    const matchesStatus = filterStatus === 'all' || ent.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const selectedEntity =
    safeEntities.find((e) => e.id === selectedEntityId) ||
    filteredEntities[0] ||
    safeEntities[0];

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
      linkedSceneIds: [],
      visualDetails: {
        colorPalette: ['#3A3026', '#B54B32'],
        moodKeywords: []
      },
      characterPlanning: type === 'character' ? { role: 'protagonist' } : undefined,
      worldPlanning: type !== 'character' ? { category: 'geography' } : undefined
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
      {/* ========================================================================= */}
      {/* HEADER: Codex & Lore Vault with Dedicated Tabs                            */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <span className="section-label block mb-1">
            Canon &amp; World Archive
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#221E18] font-semibold">
            Codex &amp; Lore Vault
          </h1>
          <p className="text-[#7A705F] text-xs sm:text-sm mt-1">
            Organized character planning, world building, research inquiries, narrative threads, and timeline chronology.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Primary Dedicated Tab Switcher */}
          <div className="bg-[#F1EAD9] border border-[rgba(34,30,24,0.12)] p-0.5 rounded-[6px] flex flex-wrap text-xs font-medium">
            <button
              onClick={() => {
                setActiveTab('characters');
                setShowMobileProfile(false);
                const firstChar = characterEntities[0];
                if (firstChar) setSelectedEntityId(firstChar.id);
              }}
              className={`px-3 py-1.5 rounded-[5px] text-xs font-medium transition-colors duration-150 cursor-pointer min-h-[36px] flex items-center gap-1.5 border ${
                activeTab === 'characters'
                  ? 'bg-[#FAF6EE] text-[#221E18] shadow-warm-sm border-[rgba(34,30,24,0.12)] font-semibold'
                  : 'text-[#7A705F] hover:text-[#221E18] border-transparent'
              }`}
            >
              <User size={13} className="text-[#B54B32]" />
              <span>Characters ({characterEntities.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('world');
                setShowMobileProfile(false);
                const firstWorld = worldEntities[0];
                if (firstWorld) setSelectedEntityId(firstWorld.id);
              }}
              className={`px-3 py-1.5 rounded-[5px] text-xs font-medium transition-colors duration-150 cursor-pointer min-h-[36px] flex items-center gap-1.5 border ${
                activeTab === 'world'
                  ? 'bg-[#FAF6EE] text-[#221E18] shadow-warm-sm border-[rgba(34,30,24,0.12)] font-semibold'
                  : 'text-[#7A705F] hover:text-[#221E18] border-transparent'
              }`}
            >
              <Globe size={13} className="text-[#3A7D6E]" />
              <span>World Building ({worldEntities.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('research');
                setShowMobileProfile(false);
              }}
              className={`px-3 py-1.5 rounded-[5px] text-xs font-medium transition-colors duration-150 cursor-pointer min-h-[36px] flex items-center gap-1.5 border ${
                activeTab === 'research'
                  ? 'bg-[#FAF6EE] text-[#221E18] shadow-warm-sm border-[rgba(34,30,24,0.12)] font-semibold'
                  : 'text-[#7A705F] hover:text-[#221E18] border-transparent'
              }`}
            >
              <BookOpen size={13} className="text-[#C44900]" />
              <span>Research</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('threads');
                setShowMobileProfile(false);
              }}
              className={`px-3 py-1.5 rounded-[5px] text-xs font-medium transition-colors duration-150 cursor-pointer min-h-[36px] flex items-center gap-1.5 border ${
                activeTab === 'threads'
                  ? 'bg-[#FAF6EE] text-[#221E18] shadow-warm-sm border-[rgba(34,30,24,0.12)] font-semibold'
                  : 'text-[#7A705F] hover:text-[#221E18] border-transparent'
              }`}
            >
              <GitBranch size={13} className="text-[#4B6B94]" />
              <span>Threads ({safeThreads.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('events');
                setShowMobileProfile(false);
              }}
              className={`px-3 py-1.5 rounded-[5px] text-xs font-medium transition-colors duration-150 cursor-pointer min-h-[36px] flex items-center gap-1.5 border ${
                activeTab === 'events'
                  ? 'bg-[#FAF6EE] text-[#221E18] shadow-warm-sm border-[rgba(34,30,24,0.12)] font-semibold'
                  : 'text-[#7A705F] hover:text-[#221E18] border-transparent'
              }`}
            >
              <Calendar size={13} className="text-[#7A705F]" />
              <span>Timeline ({safeEvents.length})</span>
            </button>
          </div>

          {/* Quick Add Button */}
          <button
            onClick={() => {
              if (activeTab === 'characters') {
                handleCreateDefaultEntity('character');
              } else if (activeTab === 'world') {
                handleCreateDefaultEntity('place');
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#B54B32] text-[#FAF6EE] text-xs font-semibold hover:bg-[#9E3E27] shadow-warm-sm transition-colors cursor-pointer min-h-[36px] shrink-0"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">
              {activeTab === 'characters'
                ? 'Add Character'
                : activeTab === 'world'
                ? 'Add World Element'
                : 'Add Entry'}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. CHARACTER PLANNING TAB & 2. WORLD BUILDING TAB                         */}
      {/* ========================================================================= */}
      {(activeTab === 'characters' || activeTab === 'world') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT LIST COLUMN (Filterable, scrollable) */}
          <div className={`lg:col-span-4 space-y-4 ${showMobileProfile ? 'hidden lg:block' : 'block'}`}>
            {/* Search and Filters */}
            <div className="space-y-2.5 bg-[#F1EAD9] p-3 rounded-[6px] border border-[rgba(34,30,24,0.12)]">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-[#7A705F]" />
                <input
                  type="text"
                  placeholder={
                    activeTab === 'characters'
                      ? 'Search characters, traits, facts...'
                      : 'Search locations, relics, factions...'
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[6px] pl-9 pr-3 py-1.5 text-xs text-[#221E18] focus:outline-none focus:border-[#B54B32]"
                />
              </div>

              {/* World specific domain sub-filter */}
              {activeTab === 'world' && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'place', label: 'Locations' },
                    { id: 'organization', label: 'Factions' },
                    { id: 'object', label: 'Relics' },
                    { id: 'concept', label: 'Arcana' }
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => setFilterType(btn.id)}
                      className={`px-2 py-1 rounded-[4px] text-[10px] font-mono transition-colors cursor-pointer border ${
                        filterType === btn.id
                          ? 'bg-[#3A7D6E] text-[#FAF6EE] border-[#3A7D6E] font-semibold'
                          : 'bg-[#FAF6EE] text-[#554D40] hover:text-[#221E18] border-[rgba(34,30,24,0.08)]'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Entity Cards List */}
            <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
              {filteredEntities.length === 0 ? (
                <div className="p-8 text-center bg-[#F1EAD9]/50 rounded-[6px] border border-dashed border-[rgba(34,30,24,0.12)] text-xs text-[#7A705F] space-y-2">
                  <p>No entries found matching criteria.</p>
                  <button
                    onClick={() => handleCreateDefaultEntity(activeTab === 'characters' ? 'character' : 'place')}
                    className="text-[#B54B32] font-semibold hover:underline"
                  >
                    + Create new {activeTab === 'characters' ? 'Character' : 'World Element'}
                  </button>
                </div>
              ) : (
                filteredEntities.map((ent) => {
                  const isSelected = selectedEntity?.id === ent.id;
                  const charRole = ent.characterPlanning?.role;
                  const avatarUrl = ent.visualDetails?.imageUrl;
                  const palette = ent.visualDetails?.colorPalette || [];

                  return (
                    <div
                      key={ent.id}
                      onClick={() => {
                        setSelectedEntityId(ent.id);
                        setShowMobileProfile(true);
                      }}
                      className={`p-3 rounded-[6px] border transition-all cursor-pointer flex items-center gap-3 ${
                        isSelected
                          ? 'bg-[#FAF6EE] border-[#B54B32] shadow-warm-sm'
                          : 'bg-[#F1EAD9] border-[rgba(34,30,24,0.08)] hover:border-[rgba(34,30,24,0.18)]'
                      }`}
                    >
                      {/* Avatar Image or Initial Box */}
                      <div className="w-11 h-11 rounded-[6px] overflow-hidden bg-white border border-[rgba(34,30,24,0.12)] shrink-0 flex items-center justify-center relative">
                        {avatarUrl && !failedAvatars[ent.id] ? (
                          <img
                            src={avatarUrl}
                            alt={ent.name || 'Entity'}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={() => setFailedAvatars((prev) => ({ ...prev, [ent.id]: true }))}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-[#FAF6EE] text-[#B54B32] font-serif font-bold text-xs select-none">
                            {((ent.name || 'EN').trim().slice(0, 2) || 'EN').toUpperCase()}
                          </div>
                        )}

                        {/* Status dot in corner */}
                        <span
                          className={`absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full border border-white ${
                            ent.status === 'confirmed'
                              ? 'bg-emerald-600'
                              : ent.status === 'tentative'
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                        />
                      </div>

                      {/* Info & Badges */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-serif font-semibold text-xs sm:text-sm text-[#221E18] truncate">
                            {ent.name}
                          </h4>
                          {charRole && (
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#FAF6EE] border border-[rgba(34,30,24,0.1)] text-[#B54B32] font-bold shrink-0">
                              {charRole}
                            </span>
                          )}
                          {!charRole && (
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#FAF6EE] text-[#7A705F] shrink-0">
                              {ent.type}
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-[#7A705F] truncate mt-0.5">
                          {ent.characterPlanning?.want
                            ? `Want: ${ent.characterPlanning.want}`
                            : ent.description || 'No description yet.'}
                        </p>

                        {/* Color palette preview dots */}
                        {palette.length > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            {palette.slice(0, 4).map((c, i) => (
                              <span
                                key={i}
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: c }}
                              />
                            ))}
                            <span className="text-[9px] font-mono text-[#7A705F] ml-1">
                              {ent.canonicalFacts?.length || 0} facts
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT DOSSIER / PROFILE COLUMN */}
          <div
            className={`lg:col-span-8 bg-[#FAF6EE] rounded-[8px] border border-[rgba(34,30,24,0.12)] p-4 sm:p-6 shadow-warm-md space-y-6 ${
              showMobileProfile ? 'block' : 'hidden lg:block'
            }`}
          >
            {selectedEntity ? (
              <div className="space-y-6">
                {/* Mobile Back Button */}
                <div className="lg:hidden flex items-center justify-between pb-2 border-b border-[rgba(34,30,24,0.08)]">
                  <button
                    onClick={() => setShowMobileProfile(false)}
                    className="flex items-center gap-1.5 text-xs text-[#B54B32] font-semibold cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    <span>Back to {activeTab === 'characters' ? 'Characters' : 'World'}</span>
                  </button>
                  <span className="text-[10px] font-mono text-[#7A705F] uppercase">
                    Editing: {selectedEntity.name}
                  </span>
                </div>

                {/* Profile Header: Name, Status & Delete */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[rgba(34,30,24,0.08)] pb-4">
                  <div className="flex-1 min-w-0 flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-[6px] overflow-hidden bg-white border border-[rgba(34,30,24,0.12)] shrink-0 flex items-center justify-center">
                      {selectedEntity.visualDetails?.imageUrl && !failedAvatars[selectedEntity.id] ? (
                        <img
                          src={selectedEntity.visualDetails.imageUrl}
                          alt={selectedEntity.name || 'Entity'}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={() => setFailedAvatars((prev) => ({ ...prev, [selectedEntity.id]: true }))}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-[#FAF6EE] text-[#B54B32] font-serif font-bold text-xs select-none">
                          {((selectedEntity.name || 'EN').trim().slice(0, 2) || 'EN').toUpperCase()}
                        </div>
                      )}
                    </div>
                    <input
                      type="text"
                      value={selectedEntity.name}
                      onChange={(e) =>
                        onUpdateEntity({ ...selectedEntity, name: e.target.value })
                      }
                      className="font-serif font-bold text-xl sm:text-2xl text-[#221E18] bg-transparent border-b border-transparent hover:border-[rgba(34,30,24,0.2)] focus:border-[#B54B32] focus:outline-none w-full"
                      placeholder="Entity Name..."
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedEntity.status}
                      onChange={(e) =>
                        onUpdateEntity({
                          ...selectedEntity,
                          status: e.target.value as EntityStatus
                        })
                      }
                      className="text-xs px-2.5 py-1.5 rounded-[5px] border border-[rgba(34,30,24,0.12)] bg-[#F1EAD9] text-[#221E18] font-mono"
                    >
                      <option value="confirmed">Confirmed Canon</option>
                      <option value="tentative">Tentative / WIP</option>
                      <option value="contradicted">Contradicted</option>
                    </select>

                    <button
                      onClick={() => onDeleteEntity(selectedEntity.id)}
                      className="p-1.5 text-[#7A705F] hover:text-red-700 hover:bg-[#F1EAD9] rounded-[5px] transition-colors cursor-pointer"
                      title="Delete Entry"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* General Summary / Notes */}
                <div>
                  <label className="text-[11px] font-mono text-[#7A705F] uppercase font-semibold block mb-1">
                    Canonical Overview &amp; Lore Summary
                  </label>
                  <textarea
                    value={selectedEntity.description || ''}
                    onChange={(e) =>
                      onUpdateEntity({ ...selectedEntity, description: e.target.value })
                    }
                    rows={2}
                    className="w-full text-xs p-2.5 rounded-[6px] border border-[rgba(34,30,24,0.12)] bg-[#FAF6EE] focus:outline-none focus:border-[#B54B32] text-[#221E18] leading-relaxed resize-none"
                    placeholder="Brief background, canonical origins, or significance..."
                  />
                </div>

                {/* ========================================================================= */}
                {/* 3. VISUAL DETAILS SECTION (Feature 3)                                    */}
                {/* ========================================================================= */}
                <VisualDetailsEditor
                  entityType={activeTab === 'characters' ? 'character' : 'world'}
                  visualDetails={selectedEntity.visualDetails}
                  onChange={(updated) =>
                    onUpdateEntity({
                      ...selectedEntity,
                      visualDetails: updated
                    })
                  }
                />

                {/* ========================================================================= */}
                {/* 2. DEDICATED PLANNING SECTION (Character Planning / World Systems)       */}
                {/* ========================================================================= */}
                {activeTab === 'characters' ? (
                  <CharacterPlanningDossier
                    planning={selectedEntity.characterPlanning}
                    onChange={(updated) =>
                      onUpdateEntity({
                        ...selectedEntity,
                        characterPlanning: updated
                      })
                    }
                  />
                ) : (
                  <WorldPlanningDossier
                    planning={selectedEntity.worldPlanning}
                    onChange={(updated) =>
                      onUpdateEntity({
                        ...selectedEntity,
                        worldPlanning: updated
                      })
                    }
                  />
                )}

                {/* Canonical Facts List */}
                <div className="space-y-3 pt-2 border-t border-[rgba(34,30,24,0.08)]">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[#7A705F] font-semibold flex items-center gap-1.5">
                      <Shield size={13} className="text-[#3A7D6E]" />
                      <span>Established Canonical Facts ({selectedEntity.canonicalFacts?.length || 0})</span>
                    </h4>
                  </div>

                  <div className="space-y-2">
                    {(selectedEntity.canonicalFacts || []).map((fact, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between gap-2 p-2.5 rounded-[5px] bg-[#F1EAD9] border border-[rgba(34,30,24,0.08)] text-xs text-[#221E18] group"
                      >
                        <span className="leading-relaxed">{fact}</span>
                        <button
                          onClick={() => handleRemoveFact(idx)}
                          className="text-[#7A705F] hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 cursor-pointer shrink-0"
                          title="Remove fact"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}

                    {/* Add Fact Input */}
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Add new confirmed canonical fact..."
                        value={newFactText}
                        onChange={(e) => setNewFactText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddFact()}
                        className="flex-1 text-xs px-2.5 py-1.5 rounded-[5px] border border-[rgba(34,30,24,0.12)] bg-[#FAF6EE] focus:outline-none focus:border-[#B54B32]"
                      />
                      <button
                        onClick={handleAddFact}
                        disabled={!newFactText.trim()}
                        className="px-3 py-1.5 bg-[#FAF6EE] border border-[rgba(34,30,24,0.15)] text-[#221E18] text-xs font-semibold rounded-[5px] hover:bg-white disabled:opacity-50 cursor-pointer"
                      >
                        Add Fact
                      </button>
                    </div>
                  </div>
                </div>

                {/* Linked Manuscript Scenes */}
                <div className="space-y-2 pt-2 border-t border-[rgba(34,30,24,0.08)]">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#7A705F] font-semibold flex items-center gap-1.5">
                    <FileText size={13} className="text-[#B54B32]" />
                    <span>Appears in Manuscript Scenes ({selectedEntity.linkedSceneIds?.length || 0})</span>
                  </h4>

                  <div className="flex flex-wrap gap-2">
                    {(selectedEntity.linkedSceneIds || []).map((sceneId) => {
                      const scene = safeScenes.find((s) => s.id === sceneId);
                      return (
                        <button
                          key={sceneId}
                          onClick={() => onNavigateToScene(sceneId)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] bg-[#F1EAD9] border border-[rgba(34,30,24,0.1)] text-xs text-[#221E18] hover:border-[#B54B32] transition-colors cursor-pointer group"
                        >
                          <FileText size={11} className="text-[#B54B32]" />
                          <span>{scene ? scene.title : `Scene: ${sceneId}`}</span>
                          <ArrowRight size={10} className="text-[#7A705F] group-hover:text-[#B54B32]" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-[#7A705F] space-y-2">
                <p>Select an entry to inspect and edit its dossier.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. RESEARCH & FIELD INQUIRIES TAB (Feature 2)                             */}
      {/* ========================================================================= */}
      {activeTab === 'research' && (
        <ResearchTracker
          entities={safeEntities}
          scenes={safeScenes}
          onUpdateEntity={onUpdateEntity}
          onNavigateToScene={onNavigateToScene}
        />
      )}

      {/* ========================================================================= */}
      {/* 4. NARRATIVE THREADS & SUBPLOTS TAB                                       */}
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
                    className="w-full bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[6px] p-2 text-xs text-[#221E18] focus:outline-none resize-none"
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
      {/* 5. STORY TIMELINE & CHRONOLOGY TAB                                        */}
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
