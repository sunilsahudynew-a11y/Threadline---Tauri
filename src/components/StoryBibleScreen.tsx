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
  AlertTriangle
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
  entities,
  threads,
  events,
  scenes,
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
  const [selectedEntityId, setSelectedEntityId] = useState<string>(entities[0]?.id || '');

  // Filtered Entities
  const filteredEntities = entities.filter((ent) => {
    const matchesSearch =
      ent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ent.canonicalFacts?.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'all' || ent.type === filterType;
    const matchesStatus = filterStatus === 'all' || ent.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const selectedEntity = entities.find((e) => e.id === selectedEntityId) || entities[0];

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-[#AAA69F] uppercase font-mono">
            World Canon & Mythology
          </span>
          <h2 className="text-2xl md:text-3xl font-serif text-[#1A1814] font-semibold mt-1">Story Bible</h2>
          <p className="text-[#8C887F] text-xs mt-1">
            Confirmed canonical facts, characters, places, and narrative threads across your manuscript.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Tab Switcher */}
          <div className="bg-[#F1F0EC] border border-[#EBE8E2] p-0.5 rounded-lg flex text-xs font-medium">
            <button
              onClick={() => setActiveTab('entities')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'entities'
                  ? 'bg-white shadow-xs text-[#1A1814] font-bold'
                  : 'text-[#6C6960] hover:text-[#1A1814]'
              }`}
            >
              Entities ({entities.length})
            </button>
            <button
              onClick={() => setActiveTab('threads')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'threads'
                  ? 'bg-white shadow-xs text-[#1A1814] font-bold'
                  : 'text-[#6C6960] hover:text-[#1A1814]'
              }`}
            >
              Threads ({threads.length})
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'events'
                  ? 'bg-white shadow-xs text-[#1A1814] font-bold'
                  : 'text-[#6C6960] hover:text-[#1A1814]'
              }`}
            >
              Events ({events.length})
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
                  description: 'Brief description...',
                  canonicalFacts: ['Initial confirmed fact'],
                  linkedSceneIds: []
                };
                onCreateEntity(newEnt);
                setSelectedEntityId(newEnt.id);
              } else if (activeTab === 'threads') {
                const newTh: Thread = {
                  id: 'th-' + Date.now(),
                  title: 'New Narrative Thread',
                  description: 'Central conflict or question across chapters...',
                  status: 'active',
                  color: 'border-blue-500 text-blue-900 bg-blue-50',
                  linkedSceneIds: []
                };
                onCreateThread(newTh);
              } else {
                const newEv: StoryEvent = {
                  id: 'ev-' + Date.now(),
                  title: 'New Story Event',
                  time: 'Day 1',
                  participants: ['Silas Vance'],
                  consequences: 'Consequences of this action...'
                };
                onCreateEvent(newEv);
              }
            }}
            className="px-3.5 py-2 bg-[#2D2A26] text-white rounded-lg text-xs font-semibold hover:bg-[#1A1814] flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus size={13} />
            <span>Add {activeTab === 'entities' ? 'Entity' : activeTab === 'threads' ? 'Thread' : 'Event'}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ENTITIES VIEW */}
      {activeTab === 'entities' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Entity Directory */}
          <div className="md:col-span-5 bg-white rounded-xl border border-[#EBE8E2] p-4 shadow-2xs">
            {/* Search & Filters */}
            <div className="space-y-2 mb-3">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-2.5 text-[#AAA69F]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search entities, facts, or places..."
                  className="w-full pl-8 pr-3 py-1.5 bg-[#FAF9F5] border border-[#EBE8E2] rounded-lg text-xs text-[#3C3933] focus:outline-none focus:bg-white"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="flex-1 p-1.5 bg-[#FAF9F5] border border-[#EBE8E2] rounded-lg text-xs text-[#3C3933] capitalize focus:outline-none"
                >
                  <option value="all">All Types</option>
                  <option value="character">Characters</option>
                  <option value="place">Places</option>
                  <option value="object">Objects</option>
                  <option value="organization">Organizations</option>
                  <option value="concept">Concepts</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="p-1.5 bg-[#FAF9F5] border border-[#EBE8E2] rounded-lg text-xs text-[#3C3933] capitalize focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="tentative">Tentative</option>
                  <option value="contradicted">Contradicted</option>
                  <option value="retired">Retired</option>
                </select>
              </div>
            </div>

            {/* List */}
            <div className="space-y-1.5 max-h-[560px] overflow-y-auto pr-1">
              {filteredEntities.length === 0 ? (
                <div className="text-center py-8 text-[#AAA69F] text-xs italic">
                  No entities matching search filters.
                </div>
              ) : (
                filteredEntities.map((ent) => {
                  const isSelected = selectedEntity?.id === ent.id;
                  return (
                    <div
                      key={ent.id}
                      onClick={() => setSelectedEntityId(ent.id)}
                      className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#D4A373] bg-[#FAF9F5] shadow-xs'
                          : 'border-[#EBE8E2] hover:bg-[#FAF9F5]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-xs text-[#1A1814] font-serif">{ent.name}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase ${
                            ent.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ent.status === 'contradicted'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ent.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#8C887F] capitalize leading-tight">
                        {ent.type} · {ent.linkedSceneIds?.length || 0} referenced chapters
                      </div>
                      {ent.canonicalFacts && ent.canonicalFacts.length > 0 && (
                        <div className="text-[10px] text-[#6C6960] italic line-clamp-1 mt-1 font-serif">
                          📌 {ent.canonicalFacts[0]}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Selected Entity Inspector & Canon Facts */}
          <div className="md:col-span-7 bg-white rounded-xl border border-[#EBE8E2] p-6 shadow-2xs">
            {selectedEntity ? (
              <div>
                {/* Header Edit Bar */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#EBE8E2] gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={selectedEntity.name}
                      onChange={(e) => onUpdateEntity({ ...selectedEntity, name: e.target.value })}
                      className="font-serif text-xl md:text-2xl font-bold text-[#1A1814] bg-transparent border-0 focus:outline-none w-full"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedEntity.type}
                      onChange={(e) => onUpdateEntity({ ...selectedEntity, type: e.target.value as EntityType })}
                      className="p-1.5 bg-[#FAF9F5] border border-[#EBE8E2] rounded text-xs capitalize text-[#3C3933] focus:outline-none"
                    >
                      <option value="character">Character</option>
                      <option value="place">Place</option>
                      <option value="object">Object</option>
                      <option value="organization">Organization</option>
                      <option value="concept">Concept</option>
                    </select>

                    <select
                      value={selectedEntity.status}
                      onChange={(e) => onUpdateEntity({ ...selectedEntity, status: e.target.value as EntityStatus })}
                      className="p-1.5 bg-[#FAF9F5] border border-[#EBE8E2] rounded text-xs uppercase font-mono text-[#3C3933] focus:outline-none"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="tentative">Tentative</option>
                      <option value="contradicted">Contradicted</option>
                      <option value="retired">Retired</option>
                    </select>

                    <button
                      onClick={() => {
                        const nextRemaining = entities.filter((e) => e.id !== selectedEntity.id);
                        onDeleteEntity(selectedEntity.id);
                        if (nextRemaining.length > 0) {
                          setSelectedEntityId(nextRemaining[0].id);
                        }
                      }}
                      className="p-1.5 text-[#AAA69F] hover:text-red-600 transition-colors cursor-pointer"
                      title="Delete entity"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-5">
                  <label className="block text-[10px] uppercase font-bold text-[#AAA69F] font-mono mb-1">
                    Description & Narrative Function
                  </label>
                  <textarea
                    value={selectedEntity.description}
                    onChange={(e) => onUpdateEntity({ ...selectedEntity, description: e.target.value })}
                    rows={3}
                    className="w-full p-2.5 bg-[#FAF9F5] border border-[#EBE8E2] rounded-lg text-xs text-[#3C3933] focus:bg-white focus:outline-none leading-relaxed"
                  />
                </div>

                {/* CANONICAL FACTS (Hard story truths) */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold text-[#AAA69F] font-mono flex items-center gap-1.5">
                      <Shield size={12} className="text-[#D4A373]" /> Canonical Story Facts (Fixed Canon)
                    </span>
                    <button
                      onClick={() => {
                        const newFact = prompt(`Add canonical story fact for ${selectedEntity.name}:`);
                        if (newFact && newFact.trim()) {
                          onUpdateEntity({
                            ...selectedEntity,
                            canonicalFacts: [...(selectedEntity.canonicalFacts || []), newFact.trim()]
                          });
                        }
                      }}
                      className="text-xs text-[#D4A373] hover:text-[#b88554] font-medium"
                    >
                      + Add Canon Fact
                    </button>
                  </div>

                  <div className="space-y-2">
                    {selectedEntity.canonicalFacts && selectedEntity.canonicalFacts.length > 0 ? (
                      selectedEntity.canonicalFacts.map((fact, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-[#FAF9F5] border border-[#EBE8E2] text-xs font-serif text-[#1A1814] flex items-start justify-between gap-2"
                        >
                          <span className="leading-snug">📌 {fact}</span>
                          <button
                            onClick={() => {
                              const updated = selectedEntity.canonicalFacts.filter((_, i) => i !== idx);
                              onUpdateEntity({ ...selectedEntity, canonicalFacts: updated });
                            }}
                            className="text-[#AAA69F] hover:text-red-500 p-0.5 shrink-0"
                            title="Remove fact"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#AAA69F] italic">No canonical facts set yet.</p>
                    )}
                  </div>
                </div>

                {/* Referenced In Scenes */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#AAA69F] font-mono mb-2">
                    Referenced in Manuscript Scenes
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {scenes.map((s) => {
                      const isLinked =
                        selectedEntity.linkedSceneIds?.includes(s.id) ||
                        s.characters?.includes(selectedEntity.name) ||
                        (s.location && s.location.includes(selectedEntity.name));

                      return (
                        <button
                          key={s.id}
                          onClick={() => onNavigateToScene(s.id)}
                          className={`text-xs px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors ${
                            isLinked
                              ? 'bg-[#2D2A26] text-white border-[#2D2A26] hover:bg-[#1A1814] shadow-2xs'
                              : 'bg-[#FAF9F5] text-[#8C887F] border-[#EBE8E2] hover:bg-[#F1F0EC]'
                          }`}
                        >
                          <span>{s.title}</span>
                          {isLinked && <ArrowRight size={11} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-[#AAA69F] text-xs">
                Select an entity from the directory or create a new one.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: NARRATIVE THREADS */}
      {activeTab === 'threads' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {threads.map((th) => (
            <div key={th.id} className="bg-white p-5 rounded-xl border border-[#EBE8E2] shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <input
                  type="text"
                  value={th.title}
                  onChange={(e) => onUpdateThread({ ...th, title: e.target.value })}
                  className="font-serif font-semibold text-[#1A1814] text-base bg-transparent border-0 focus:outline-none w-full"
                />
                <select
                  value={th.status}
                  onChange={(e) =>
                    onUpdateThread({ ...th, status: e.target.value as Thread['status'] })
                  }
                  className="text-[10px] px-2 py-0.5 rounded uppercase font-mono bg-[#FAF9F5] text-[#3C3933] border border-[#EBE8E2]"
                >
                  <option value="active">Active</option>
                  <option value="resolved">Resolved</option>
                  <option value="dormant">Dormant</option>
                </select>
              </div>

              <textarea
                value={th.description}
                onChange={(e) => onUpdateThread({ ...th, description: e.target.value })}
                rows={2}
                className="w-full p-2 bg-[#FAF9F5] border border-[#EBE8E2] rounded-lg text-xs text-[#3C3933] focus:bg-white focus:outline-none mb-3"
              />

              <div className="pt-2 border-t border-[#EBE8E2] flex items-center justify-between text-xs">
                <span className="text-[#8C887F] text-[11px]">
                  Runs across {th.linkedSceneIds.length} chapters
                </span>
                <button
                  onClick={() => onDeleteThread(th.id)}
                  className="text-[#AAA69F] hover:text-red-500 text-[11px]"
                >
                  Remove Thread
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: STORY EVENTS */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {events.map((ev) => (
            <div key={ev.id} className="bg-white p-5 rounded-xl border border-[#EBE8E2] shadow-2xs">
              <div className="flex items-center justify-between mb-2 gap-2">
                <input
                  type="text"
                  value={ev.title}
                  onChange={(e) => onUpdateEvent({ ...ev, title: e.target.value })}
                  className="font-serif font-semibold text-[#1A1814] text-base bg-transparent border-0 focus:outline-none w-full"
                />
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono text-[#AAA69F]">{ev.time}</span>
                  {onDeleteEvent && (
                    <button
                      onClick={() => onDeleteEvent(ev.id)}
                      className="text-[#AAA69F] hover:text-red-500 p-1 cursor-pointer transition-colors"
                      title="Delete event"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-[#6C6960] mb-2">
                Participants: <strong className="text-[#1A1814]">{ev.participants.join(', ')}</strong>
              </p>
              <p className="text-xs text-[#3C3933] bg-[#FAF9F5] p-2.5 rounded-lg border border-[#EBE8E2]">
                Consequence: {ev.consequences}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
