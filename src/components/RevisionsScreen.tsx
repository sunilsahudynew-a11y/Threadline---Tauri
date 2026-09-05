import React, { useState } from 'react';
import {
  RevisionPass,
  Snapshot,
  CuttingRoomItem,
  Scene,
  NoteItem
} from '../types';
import {
  RotateCcw,
  Scissors,
  Camera,
  CheckCircle2,
  Plus,
  Trash2,
  ArrowRight,
  Clock,
  FileText,
  Search,
  RefreshCw,
  GitCompare,
  ArrowLeftRight,
  Download
} from 'lucide-react';

interface RevisionsScreenProps {
  revisionPasses: RevisionPass[];
  snapshots: Snapshot[];
  cuttingRoom: CuttingRoomItem[];
  scenes: Scene[];
  onUpdatePasses: (passes: RevisionPass[]) => void;
  onTakeSnapshot: (name: string) => void;
  onRestoreSnapshot: (snapshot: Snapshot) => void;
  onRestoreCuttingRoomItem: (item: CuttingRoomItem) => void;
  onDeleteCuttingRoomItem: (id: string) => void;
  onConvertCutToNote: (item: CuttingRoomItem) => void;
  onNavigateToScene: (sceneId: string) => void;
}

export const RevisionsScreen: React.FC<RevisionsScreenProps> = ({
  revisionPasses,
  snapshots,
  cuttingRoom,
  scenes,
  onUpdatePasses,
  onTakeSnapshot,
  onRestoreSnapshot,
  onRestoreCuttingRoomItem,
  onDeleteCuttingRoomItem,
  onConvertCutToNote,
  onNavigateToScene
}) => {
  const [activeTab, setActiveTab] = useState<'passes' | 'snapshots' | 'cutting-room'>('passes');
  const [cuttingRoomSearch, setCuttingRoomSearch] = useState('');

  // Snapshot Diff Comparison State
  const [selectedSnapshotAId, setSelectedSnapshotAId] = useState<string>(snapshots[0]?.id || '');
  const [compareWithLive, setCompareWithLive] = useState(true);

  // New Pass creation modal
  const [newPassName, setNewPassName] = useState('');
  const [newPassDesc, setNewPassDesc] = useState('');
  const [showAddPass, setShowAddPass] = useState(false);

  // Snapshot creation modal
  const [newSnapshotName, setNewSnapshotName] = useState('');
  const [showAddSnapshot, setShowAddSnapshot] = useState(false);

  // Toggle checklist item
  const toggleCheckItem = (passId: string, itemId: string) => {
    const updated = revisionPasses.map((p) => {
      if (p.id !== passId) return p;
      return {
        ...p,
        checklist: p.checklist.map((c) => (c.id === itemId ? { ...c, done: !c.done } : c))
      };
    });
    onUpdatePasses(updated);
  };

  // Add checklist item to a pass
  const addCheckItem = (passId: string) => {
    const text = prompt('New revision task for this pass:');
    if (!text || !text.trim()) return;
    const updated = revisionPasses.map((p) => {
      if (p.id !== passId) return p;
      return {
        ...p,
        checklist: [
          ...p.checklist,
          { id: 'chk-' + Date.now(), label: text.trim(), done: false }
        ]
      };
    });
    onUpdatePasses(updated);
  };

  const handleCreatePass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassName.trim()) return;
    const newPass: RevisionPass = {
      id: 'rp-' + Date.now(),
      name: newPassName.trim(),
      description: newPassDesc.trim() || 'Custom manuscript revision pass',
      checklist: [
        { id: 'chk-1', label: 'Review rhythm and cadence', done: false }
      ]
    };
    onUpdatePasses([...revisionPasses, newPass]);
    setNewPassName('');
    setNewPassDesc('');
    setShowAddPass(false);
  };

  const handleCreateSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSnapshotName.trim()) return;
    onTakeSnapshot(newSnapshotName.trim());
    setNewSnapshotName('');
    setShowAddSnapshot(false);
  };

  // Filtered cutting room items
  const filteredCuts = cuttingRoom.filter(
    (c) =>
      c.text.toLowerCase().includes(cuttingRoomSearch.toLowerCase()) ||
      c.originalSceneTitle.toLowerCase().includes(cuttingRoomSearch.toLowerCase()) ||
      c.contextNote?.toLowerCase().includes(cuttingRoomSearch.toLowerCase())
  );

  const selectedSnapshotA = snapshots.find((s) => s.id === selectedSnapshotAId) || snapshots[0];

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-[#AAA69F] uppercase font-mono">
            Craft & Polish
          </span>
          <h2 className="text-2xl md:text-3xl font-serif text-[#1A1814] font-semibold mt-1">
            Revision Workspace
          </h2>
          <p className="text-[#8C887F] text-xs mt-1">
            Systematic editorial passes, immutable snapshot diffs, and a peaceful cutting room where no sentence is permanently lost.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="bg-[#F1F0EC] p-0.5 rounded-lg flex text-xs font-medium border border-[#EBE8E2]">
          <button
            onClick={() => setActiveTab('passes')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'passes'
                ? 'bg-white shadow-xs text-[#1A1814] font-bold'
                : 'text-[#6C6960] hover:text-[#1A1814]'
            }`}
          >
            Named Passes ({revisionPasses.length})
          </button>
          <button
            onClick={() => setActiveTab('snapshots')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'snapshots'
                ? 'bg-white shadow-xs text-[#1A1814] font-bold'
                : 'text-[#6C6960] hover:text-[#1A1814]'
            }`}
          >
            Snapshots & Diffs ({snapshots.length})
          </button>
          <button
            onClick={() => setActiveTab('cutting-room')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'cutting-room'
                ? 'bg-white shadow-xs text-[#1A1814] font-bold'
                : 'text-[#6C6960] hover:text-[#1A1814]'
            }`}
          >
            Cutting Room ({cuttingRoom.length})
          </button>
        </div>
      </div>

      {/* TAB 1: NAMED REVISION PASSES */}
      {activeTab === 'passes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-serif font-semibold text-[#1A1814]">
              Editorial Lenses & Checklists
            </h3>
            <button
              onClick={() => setShowAddPass(true)}
              className="px-3.5 py-1.5 bg-[#2D2A26] text-white rounded-lg text-xs font-semibold hover:bg-[#1A1814] flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Plus size={13} /> New Revision Pass
            </button>
          </div>

          {showAddPass && (
            <form
              onSubmit={handleCreatePass}
              className="p-5 bg-white rounded-xl border border-[#EBE8E2] shadow-sm space-y-3 animate-in fade-in duration-150"
            >
              <h4 className="font-serif font-bold text-[#1A1814] text-sm">Create Named Pass</h4>
              <div>
                <input
                  type="text"
                  required
                  value={newPassName}
                  onChange={(e) => setNewPassName(e.target.value)}
                  placeholder="e.g., Dialogue Rhythm Pass, Sensory Texture Pass, Foreshadowing Pass"
                  className="w-full p-2 bg-[#FAF9F5] border border-[#EBE8E2] rounded-lg text-xs text-[#1A1814] focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <textarea
                  value={newPassDesc}
                  onChange={(e) => setNewPassDesc(e.target.value)}
                  placeholder="Editorial objective and guidelines for this pass..."
                  rows={2}
                  className="w-full p-2 bg-[#FAF9F5] border border-[#EBE8E2] rounded-lg text-xs text-[#1A1814] focus:bg-white focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowAddPass(false)}
                  className="px-3 py-1.5 text-[#8C887F] hover:text-[#1A1814]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#2D2A26] text-white rounded-lg font-semibold hover:bg-[#1A1814]"
                >
                  Create Pass
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {revisionPasses.map((pass) => {
              const completed = pass.checklist.filter((c) => c.done).length;
              return (
                <div
                  key={pass.id}
                  className="bg-white rounded-xl border border-[#EBE8E2] p-5 shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-serif font-bold text-[#1A1814] text-base">{pass.name}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F1F0EC] text-[#6C6960]">
                        {completed}/{pass.checklist.length} Complete
                      </span>
                    </div>

                    <p className="text-xs text-[#8C887F] mb-4 leading-relaxed">{pass.description}</p>

                    {/* Checklist */}
                    <div className="space-y-2.5">
                      {pass.checklist.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start gap-2.5 text-xs text-[#1A1814] group"
                        >
                          <button
                            onClick={() => toggleCheckItem(pass.id, item.id)}
                            className="mt-0.5 text-[#AAA69F] hover:text-emerald-700 transition-colors"
                          >
                            {item.done ? (
                              <CheckCircle2 size={15} className="text-emerald-600" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border border-[#AAA69F]" />
                            )}
                          </button>
                          <span
                            className={`leading-tight flex-1 ${
                              item.done ? 'line-through text-[#AAA69F]' : ''
                            }`}
                          >
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#EBE8E2] flex items-center justify-between text-xs">
                    <button
                      onClick={() => addCheckItem(pass.id)}
                      className="text-[#6C6960] hover:text-[#D4A373] font-medium flex items-center gap-1"
                    >
                      <Plus size={12} /> Add Scene Task
                    </button>
                    <span className="text-[#AAA69F] text-[10px] font-mono">Scene-level tracking</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: SNAPSHOTS & SIDE-BY-SIDE DIFFS */}
      {activeTab === 'snapshots' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-serif font-semibold text-[#1A1814]">
                Point-in-Time Manuscript Snapshots
              </h3>
              <p className="text-xs text-[#8C887F]">
                Capture snapshots before major developmental rewrites. Safely diff or restore anytime.
              </p>
            </div>
            <button
              onClick={() => setShowAddSnapshot(true)}
              className="px-3.5 py-1.5 bg-[#2D2A26] text-white rounded-lg text-xs font-semibold hover:bg-[#1A1814] flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Camera size={13} /> Capture Snapshot
            </button>
          </div>

          {showAddSnapshot && (
            <form
              onSubmit={handleCreateSnapshot}
              className="p-4 bg-white rounded-xl border border-[#EBE8E2] shadow-sm flex items-center gap-3 animate-in fade-in duration-150"
            >
              <input
                type="text"
                required
                autoFocus
                value={newSnapshotName}
                onChange={(e) => setNewSnapshotName(e.target.value)}
                placeholder="Snapshot label (e.g., Before Act 1 Pacing Overhaul)"
                className="flex-1 p-2 bg-[#FAF9F5] border border-[#EBE8E2] rounded-lg text-xs text-[#1A1814] focus:bg-white focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#2D2A26] text-white rounded-lg text-xs font-semibold hover:bg-[#1A1814]"
              >
                Save Snapshot
              </button>
              <button
                type="button"
                onClick={() => setShowAddSnapshot(false)}
                className="text-xs text-[#AAA69F] hover:text-[#1A1814]"
              >
                Cancel
              </button>
            </form>
          )}

          {/* Side-by-Side Snapshot Comparison / Diff */}
          {selectedSnapshotA && (
            <div className="bg-white rounded-xl border border-[#EBE8E2] p-6 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EBE8E2]">
                <div className="flex items-center gap-2">
                  <GitCompare size={16} className="text-[#D4A373]" />
                  <span className="font-serif font-bold text-[#1A1814] text-sm">
                    Side-by-Side Manuscript Comparison
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <select
                    value={selectedSnapshotAId}
                    onChange={(e) => setSelectedSnapshotAId(e.target.value)}
                    className="p-1.5 bg-[#FAF9F5] border border-[#EBE8E2] rounded text-[#1A1814] text-xs focus:outline-none"
                  >
                    {snapshots.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.timestamp})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `Restore manuscript to "${selectedSnapshotA.name}"? An automated backup snapshot of your current draft will be taken first.`
                        )
                      ) {
                        onRestoreSnapshot(selectedSnapshotA);
                      }
                    }}
                    className="px-3 py-1.5 bg-[#FAF9F5] border border-[#EBE8E2] text-[#3C3933] hover:bg-[#F1F0EC] rounded text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw size={12} /> Restore This Snapshot
                  </button>
                </div>
              </div>

              {/* Side-by-Side scene text comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: Snapshot Version */}
                <div className="p-4 bg-[#FAF9F5] rounded-xl border border-[#EBE8E2]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase font-mono text-[#AAA69F]">
                      Snapshot: {selectedSnapshotA.name}
                    </span>
                    <span className="text-[10px] text-[#AAA69F] font-mono">
                      {selectedSnapshotA.timestamp}
                    </span>
                  </div>
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {selectedSnapshotA.scenesSummary.map((sc) => (
                      <div key={sc.id} className="text-xs">
                        <h5 className="font-serif font-semibold text-[#1A1814] mb-1">{sc.title}</h5>
                        <p className="font-manuscript text-[#3C3933] leading-relaxed whitespace-pre-wrap text-[11px]">
                          {sc.proseContent.slice(0, 400)}...
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Current Live Draft */}
                <div className="p-4 bg-amber-50/20 rounded-xl border border-amber-200/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase font-mono text-[#D4A373]">
                      Current Live Draft
                    </span>
                    <span className="text-[10px] text-emerald-700 font-mono font-medium">
                      Active Editor State
                    </span>
                  </div>
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {scenes.map((sc) => (
                      <div key={sc.id} className="text-xs">
                        <h5 className="font-serif font-semibold text-[#1A1814] mb-1">{sc.title}</h5>
                        <p className="font-manuscript text-[#1A1814] leading-relaxed whitespace-pre-wrap text-[11px]">
                          {sc.proseContent.slice(0, 400)}...
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: THE CUTTING ROOM */}
      {activeTab === 'cutting-room' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-serif font-semibold text-[#1A1814] flex items-center gap-2">
                <Scissors size={16} className="text-rose-600" /> The Cutting Room
              </h3>
              <p className="text-xs text-[#8C887F]">
                Deleted prose scraps preserved automatically. Search, restore to draft, or convert into research notes.
              </p>
            </div>

            <div className="relative w-72">
              <Search size={14} className="absolute left-2.5 top-2.5 text-[#AAA69F]" />
              <input
                type="text"
                value={cuttingRoomSearch}
                onChange={(e) => setCuttingRoomSearch(e.target.value)}
                placeholder="Search deleted scraps..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#EBE8E2] rounded-lg text-xs text-[#1A1814] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredCuts.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#EBE8E2] p-12 text-center text-xs text-[#AAA69F] italic">
                No clipped passages matching search. Highlight text in the editor and click "Cutting Room" to preserve deleted prose.
              </div>
            ) : (
              filteredCuts.map((cut) => (
                <div
                  key={cut.id}
                  className="bg-white rounded-xl border border-[#EBE8E2] p-5 shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-[#EBE8E2]">
                    <div className="flex items-center gap-2 font-serif">
                      <span className="font-semibold text-[#1A1814]">From: {cut.originalSceneTitle}</span>
                      <span className="text-[#AAA69F]">·</span>
                      <span className="text-[#8C887F] text-[11px] font-sans font-mono">{cut.deletedAt}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onRestoreCuttingRoomItem(cut)}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded font-medium border border-amber-200 text-xs transition-colors flex items-center gap-1"
                      >
                        <RotateCcw size={11} /> Restore to Scene
                      </button>
                      <button
                        onClick={() => onConvertCutToNote(cut)}
                        className="px-2.5 py-1 bg-[#FAF9F5] hover:bg-[#F1F0EC] text-[#3C3933] rounded font-medium border border-[#EBE8E2] text-xs transition-colors"
                      >
                        Convert to Note
                      </button>
                      <button
                        onClick={() => onDeleteCuttingRoomItem(cut.id)}
                        className="p-1 text-[#AAA69F] hover:text-rose-600 transition-colors"
                        title="Delete permanently"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <p className="font-manuscript text-xs text-[#1A1814] leading-loose italic bg-[#FAF9F5] p-3 rounded-lg border border-[#EBE8E2]">
                    "{cut.text}"
                  </p>

                  {cut.contextNote && (
                    <div className="text-[11px] text-[#8C887F] font-sans">
                      <span className="font-semibold text-[#3C3933] font-mono text-[10px] uppercase">
                        Writer Reason:{' '}
                      </span>
                      {cut.contextNote}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
