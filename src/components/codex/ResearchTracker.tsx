import React, { useState } from 'react';
import { ResearchEntry, Entity, Scene } from '../../types';
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Trash2,
  Sparkles,
  ArrowRight,
  FileText,
  Bookmark
} from 'lucide-react';

interface ResearchTrackerProps {
  entities: Entity[];
  scenes: Scene[];
  onUpdateEntity: (entity: Entity) => void;
  onNavigateToScene?: (sceneId: string) => void;
}

export const ResearchTracker: React.FC<ResearchTrackerProps> = ({
  entities = [],
  scenes = [],
  onUpdateEntity,
  onNavigateToScene
}) => {
  // Aggregate all research entries across entities
  const allResearchEntries: { entity: Entity; entry: ResearchEntry }[] = [];
  entities.forEach((ent) => {
    (ent.researchEntries || []).forEach((entry) => {
      allResearchEntries.push({ entity: ent, entry });
    });
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddingInquiry, setIsAddingInquiry] = useState(false);

  // New Inquiry form state
  const [targetEntityId, setTargetEntityId] = useState<string>(entities[0]?.id || '');
  const [newTopic, setNewTopic] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newSources, setNewSources] = useState('');
  const [newStatus, setNewStatus] = useState<ResearchEntry['status']>('in-progress');

  const handleCreateInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim() || !targetEntityId) return;

    const targetEnt = entities.find((e) => e.id === targetEntityId);
    if (!targetEnt) return;

    const newEntry: ResearchEntry = {
      id: 'res-' + Date.now(),
      topic: newTopic.trim(),
      status: newStatus,
      notes: newNotes.trim() || undefined,
      sources: newSources
        ? newSources
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined
    };

    const updated = {
      ...targetEnt,
      researchEntries: [...(targetEnt.researchEntries || []), newEntry]
    };

    onUpdateEntity(updated);

    setNewTopic('');
    setNewNotes('');
    setNewSources('');
    setIsAddingInquiry(false);
  };

  const handleUpdateEntryStatus = (
    entity: Entity,
    entryId: string,
    newSt: ResearchEntry['status']
  ) => {
    const updated = {
      ...entity,
      researchEntries: (entity.researchEntries || []).map((e) =>
        e.id === entryId ? { ...e, status: newSt } : e
      )
    };
    onUpdateEntity(updated);
  };

  const handleDeleteEntry = (entity: Entity, entryId: string) => {
    const updated = {
      ...entity,
      researchEntries: (entity.researchEntries || []).filter((e) => e.id !== entryId)
    };
    onUpdateEntity(updated);
  };

  const handlePromoteToCanonFact = (entity: Entity, entry: ResearchEntry) => {
    const factText = `${entry.topic}: ${entry.notes || 'Verified through field research.'}`;
    const currentFacts = entity.canonicalFacts || [];
    if (!currentFacts.includes(factText)) {
      const updated = {
        ...entity,
        canonicalFacts: [...currentFacts, factText],
        researchEntries: (entity.researchEntries || []).map((e) =>
          e.id === entry.id ? { ...e, status: 'verified' as const } : e
        )
      };
      onUpdateEntity(updated);
    }
  };

  const filtered = allResearchEntries.filter(({ entry, entity }) => {
    const matchesSearch =
      entry.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.notes && entry.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      entity.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 select-none text-[#221E18]">
      {/* Header & Quick Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F1EAD9] p-4 rounded-[8px] border border-[rgba(34,30,24,0.1)]">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-[#B54B32]" />
            <h3 className="font-serif font-bold text-base text-[#221E18]">
              Codex Research &amp; Canon Inquiries
            </h3>
            <span className="text-[11px] font-mono text-[#7A705F] bg-[#FAF6EE] px-2 py-0.5 rounded-[4px]">
              {allResearchEntries.length} Inquiries Logged
            </span>
          </div>
          <p className="text-xs text-[#7A705F] mt-0.5">
            Track historical veracity, mechanical clockwork principles, metallurgical assays, and promote verified inquiries directly to canonical lore facts.
          </p>
        </div>

        <button
          onClick={() => setIsAddingInquiry(!isAddingInquiry)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#B54B32] text-[#FAF6EE] text-xs font-semibold hover:bg-[#9E3E27] shadow-warm-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus size={14} />
          <span>{isAddingInquiry ? 'Cancel' : 'New Research Inquiry'}</span>
        </button>
      </div>

      {/* New Inquiry Form */}
      {isAddingInquiry && (
        <form onSubmit={handleCreateInquiry} className="bg-[#FAF6EE] p-4 rounded-[8px] border border-[#B54B32] shadow-warm-sm space-y-3">
          <h4 className="text-xs font-mono font-bold uppercase text-[#B54B32]">
            Add Research Topic / Field Question
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-[#7A705F] uppercase font-semibold block mb-1">
                Link to Lore Entity / Character
              </label>
              <select
                value={targetEntityId}
                onChange={(e) => setTargetEntityId(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded-[5px] border border-[rgba(34,30,24,0.15)] bg-white"
              >
                {entities.map((ent) => (
                  <option key={ent.id} value={ent.id}>
                    [{ent.type.toUpperCase()}] {ent.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#7A705F] uppercase font-semibold block mb-1">
                Verification Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as any)}
                className="w-full text-xs px-2.5 py-1.5 rounded-[5px] border border-[rgba(34,30,24,0.15)] bg-white"
              >
                <option value="in-progress">In Progress (Investigating)</option>
                <option value="verified">Verified Canon Fact</option>
                <option value="debunked">Debunked Myth / Rumor</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-[#7A705F] uppercase font-semibold block mb-1">
              Research Topic or Technical Inquiry
            </label>
            <input
              type="text"
              placeholder="e.g. Graham deadbeat vs recoil escapement recoil in 1890s tower clocks..."
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded-[5px] border border-[rgba(34,30,24,0.15)] bg-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-[#7A705F] uppercase font-semibold block mb-1">
              Historical / Scientific Field Notes
            </label>
            <textarea
              placeholder="The deadbeat escapement prevents the escape wheel from bouncing backwards..."
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              rows={2}
              className="w-full text-xs p-2 rounded-[5px] border border-[rgba(34,30,24,0.15)] bg-white resize-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-[#7A705F] uppercase font-semibold block mb-1">
              Source Citations &amp; References (Comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. 1892 Bohemian Guild Register, Prague Astronomical Observatory Annals"
              value={newSources}
              onChange={(e) => setNewSources(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded-[5px] border border-[rgba(34,30,24,0.15)] bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingInquiry(false)}
              className="px-3 py-1.5 text-xs text-[#7A705F] hover:text-[#221E18]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#B54B32] text-white text-xs font-semibold rounded-[5px] hover:bg-[#9E3E27]"
            >
              Save Research Inquiry
            </button>
          </div>
        </form>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF6EE] p-3 rounded-[8px] border border-[rgba(34,30,24,0.12)] text-xs">
        <div className="relative min-w-[220px]">
          <Search size={13} className="absolute left-2.5 top-2 text-[#7A705F]" />
          <input
            type="text"
            placeholder="Search inquiries, notes, or entities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-2.5 py-1.5 rounded-[5px] border border-[rgba(34,30,24,0.12)] bg-white focus:outline-none focus:border-[#B54B32]"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {[
            { id: 'all', label: 'All Inquiries' },
            { id: 'verified', label: 'Verified Canon' },
            { id: 'in-progress', label: 'In Progress' },
            { id: 'debunked', label: 'Debunked' }
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-2.5 py-1 rounded-[4px] text-[11px] font-medium transition-colors cursor-pointer border ${
                statusFilter === st.id
                  ? 'bg-[#221E18] text-[#FAF6EE] border-[#221E18] font-semibold'
                  : 'bg-[#F1EAD9] text-[#554D40] hover:text-[#221E18] border-[rgba(34,30,24,0.08)]'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inquiries List */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 px-4 border border-dashed border-[rgba(34,30,24,0.15)] rounded-[8px] bg-[#FAF6EE] text-[#7A705F] space-y-2">
          <BookOpen size={24} className="mx-auto opacity-50 text-[#B54B32]" />
          <p className="text-xs">No research inquiries matched your filter.</p>
          <button
            onClick={() => setIsAddingInquiry(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[5px] bg-[#FAF6EE] text-[#B54B32] border border-[#B54B32] font-semibold text-xs hover:bg-[#F1EAD9] cursor-pointer"
          >
            <Plus size={13} />
            <span>Create Research Inquiry</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(({ entity, entry }) => {
            const isVerified = entry.status === 'verified';
            const isInProgress = entry.status === 'in-progress';
            const isDebunked = entry.status === 'debunked';

            return (
              <div
                key={entry.id}
                className="bg-[#FAF6EE] rounded-[8px] border border-[rgba(34,30,24,0.12)] p-4 shadow-warm-sm flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F1EAD9] text-[#554D40] font-semibold">
                      Linked: {entity.name}
                    </span>

                    <div className="flex items-center gap-1">
                      {isVerified && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 size={11} />
                          <span>Verified Canon</span>
                        </span>
                      )}
                      {isInProgress && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          <Clock size={11} />
                          <span>In Progress</span>
                        </span>
                      )}
                      {isDebunked && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-red-800 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                          <XCircle size={11} />
                          <span>Debunked</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <h4 className="text-sm font-semibold text-[#221E18] leading-snug">
                    {entry.topic}
                  </h4>

                  {entry.notes && (
                    <p className="text-xs text-[#554D40] mt-1.5 leading-relaxed">
                      {entry.notes}
                    </p>
                  )}

                  {entry.sources && entry.sources.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-[rgba(34,30,24,0.06)] text-[11px] text-[#7A705F]">
                      <span className="font-mono font-semibold block mb-0.5">Sources / References:</span>
                      <ul className="list-disc pl-4 space-y-0.5">
                        {entry.sources.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-[rgba(34,30,24,0.08)] flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <select
                      value={entry.status}
                      onChange={(e) =>
                        handleUpdateEntryStatus(entity, entry.id, e.target.value as any)
                      }
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[rgba(34,30,24,0.1)] bg-white text-[#221E18]"
                    >
                      <option value="in-progress">In Progress</option>
                      <option value="verified">Verified</option>
                      <option value="debunked">Debunked</option>
                    </select>

                    <button
                      onClick={() => handleDeleteEntry(entity, entry.id)}
                      className="text-[#7A705F] hover:text-red-700 p-1"
                      title="Delete Entry"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {/* Promote to Canon Fact Button */}
                  <button
                    onClick={() => handlePromoteToCanonFact(entity, entry)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#B54B32] hover:text-[#9E3E27] cursor-pointer"
                    title="Add directly to this entity's canonical facts"
                  >
                    <Sparkles size={12} />
                    <span>Promote to Canon</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
