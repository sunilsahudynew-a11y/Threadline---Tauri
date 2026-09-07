import React, { useState } from 'react';
import {
  RevisionPass,
  Snapshot,
  CuttingRoomItem,
  Scene,
  SceneVersion
} from '../types';
import {
  RotateCcw,
  Scissors,
  Camera,
  CheckCircle2,
  Plus,
  Trash2,
  GitCompare,
  Search,
  History,
  Clock,
  FileText,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Layers
} from 'lucide-react';
import { useToast } from './Toast';

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
  onUpdateScene?: (sceneId: string, fields: Partial<Scene>) => void;
  initialTab?: 'passes' | 'history' | 'snapshots' | 'cutting-room';
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
  onNavigateToScene,
  onUpdateScene,
  initialTab = 'passes'
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'passes' | 'history' | 'snapshots' | 'cutting-room'>(initialTab);
  const [cuttingRoomSearch, setCuttingRoomSearch] = useState('');

  // Version History Tab States
  const [selectedSceneId, setSelectedSceneId] = useState<string>(() => scenes[0]?.id || '');
  const [historySearch, setHistorySearch] = useState('');
  const [expandedVersionId, setExpandedVersionId] = useState<string | null>(null);
  const [diffMode, setDiffMode] = useState<'preview' | 'side-by-side'>('preview');
  const [newVersionLabel, setNewVersionLabel] = useState('');
  const [showAddVersion, setShowAddVersion] = useState(false);
  const [confirmRestoreId, setConfirmRestoreId] = useState<string | null>(null);

  // Snapshot Diff Comparison State
  const [selectedSnapshotAId, setSelectedSnapshotAId] = useState<string>(snapshots[0]?.id || '');

  // New Pass creation modal
  const [newPassName, setNewPassName] = useState('');
  const [newPassDesc, setNewPassDesc] = useState('');
  const [showAddPass, setShowAddPass] = useState(false);

  // Snapshot creation modal
  const [newSnapshotName, setNewSnapshotName] = useState('');
  const [showAddSnapshot, setShowAddSnapshot] = useState(false);

  const selectedScene = scenes.find((s) => s.id === selectedSceneId) || scenes[0];
  const sceneVersions: SceneVersion[] = selectedScene?.versions || [];
  const totalVersionsCount = scenes.reduce((acc, s) => acc + (s.versions?.length || 0), 0);

  // Filtered scenes for History Tab
  const filteredScenes = scenes.filter((s) =>
    s.title.toLowerCase().includes(historySearch.toLowerCase()) ||
    (s.chapterTitle && s.chapterTitle.toLowerCase().includes(historySearch.toLowerCase()))
  );

  // Take a new version snapshot for active scene
  const handleCreateSceneVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScene || !onUpdateScene) return;

    const newVersion: SceneVersion = {
      id: 'ver-' + Date.now(),
      timestamp: new Date().toISOString(),
      title: selectedScene.title,
      proseContent: selectedScene.proseContent,
      wordCount: selectedScene.wordCount,
      label: newVersionLabel.trim() || 'Manual revision snapshot'
    };

    const updated = [newVersion, ...(selectedScene.versions || [])];
    onUpdateScene(selectedScene.id, { versions: updated });
    setNewVersionLabel('');
    setShowAddVersion(false);
    setExpandedVersionId(newVersion.id);
    showToast(`Saved version snapshot for "${selectedScene.title}"`);
  };

  // Restore scene version with automated rollback safety backup
  const handleRestoreSceneVersion = (version: SceneVersion) => {
    if (!selectedScene || !onUpdateScene) return;

    const backupVersion: SceneVersion = {
      id: 'ver-backup-' + Date.now(),
      timestamp: new Date().toISOString(),
      title: selectedScene.title,
      proseContent: selectedScene.proseContent,
      wordCount: selectedScene.wordCount,
      label: `Pre-restore safety backup (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
    };

    const updatedVersions = [
      backupVersion,
      ...(selectedScene.versions || []).filter((v) => v.id !== version.id),
      version
    ];

    onUpdateScene(selectedScene.id, {
      proseContent: version.proseContent,
      wordCount: version.wordCount,
      versions: updatedVersions
    });

    setConfirmRestoreId(null);
    showToast(`Restored version from ${new Date(version.timestamp).toLocaleTimeString()}`);
  };

  // Delete a single version
  const handleDeleteSceneVersion = (versionId: string) => {
    if (!selectedScene || !onUpdateScene) return;
    const updated = (selectedScene.versions || []).filter((v) => v.id !== versionId);
    onUpdateScene(selectedScene.id, { versions: updated });
    if (expandedVersionId === versionId) {
      setExpandedVersionId(null);
    }
    showToast('Version snapshot deleted');
  };

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] font-mono font-semibold tracking-[0.14em] text-[#7A705F] uppercase">
            Craft &amp; Polish
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#221E18] font-semibold mt-1">
            Revision Workspace
          </h1>
          <p className="text-[#7A705F] text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Systematic editorial passes, immutable point-in-time snapshot diffs, and a peaceful cutting room where no excised sentence is ever lost.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="bg-[#F1EAD9] p-0.5 rounded-[6px] flex text-xs font-medium border border-[rgba(34,30,24,0.12)] self-start overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('passes')}
            className={`px-3 py-1.5 rounded-[5px] text-xs font-medium transition-colors duration-150 cursor-pointer min-h-[36px] whitespace-nowrap border ${
              activeTab === 'passes'
                ? 'bg-[#FAF6EE] shadow-warm-sm text-[#221E18] border-[rgba(34,30,24,0.12)]'
                : 'text-[#7A705F] hover:text-[#221E18] border-transparent'
            }`}
          >
            Named Passes ({revisionPasses.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-[5px] text-xs font-medium transition-colors duration-150 cursor-pointer min-h-[36px] whitespace-nowrap border flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-[#FAF6EE] shadow-warm-sm text-[#221E18] border-[rgba(34,30,24,0.12)]'
                : 'text-[#7A705F] hover:text-[#221E18] border-transparent'
            }`}
          >
            <History size={13} className={activeTab === 'history' ? 'text-[#B54B32]' : 'text-[#7A705F]'} />
            <span>Version History</span>
            {totalVersionsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#B54B32] text-[#FAF6EE] text-[9px] font-mono font-bold">
                {totalVersionsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('snapshots')}
            className={`px-3 py-1.5 rounded-[5px] text-xs font-medium transition-colors duration-150 cursor-pointer min-h-[36px] whitespace-nowrap border ${
              activeTab === 'snapshots'
                ? 'bg-[#FAF6EE] shadow-warm-sm text-[#221E18] border-[rgba(34,30,24,0.12)]'
                : 'text-[#7A705F] hover:text-[#221E18] border-transparent'
            }`}
          >
            Snapshots &amp; Diffs ({snapshots.length})
          </button>
          <button
            onClick={() => setActiveTab('cutting-room')}
            className={`px-3 py-1.5 rounded-[5px] text-xs font-medium transition-colors duration-150 cursor-pointer min-h-[36px] whitespace-nowrap border ${
              activeTab === 'cutting-room'
                ? 'bg-[#FAF6EE] shadow-warm-sm text-[#221E18] border-[rgba(34,30,24,0.12)]'
                : 'text-[#7A705F] hover:text-[#221E18] border-transparent'
            }`}
          >
            Cutting Room ({cuttingRoom.length})
          </button>
        </div>
      </div>

      {/* TAB: VERSION HISTORY (DEDICATED TAB) */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[rgba(34,30,24,0.1)]">
            <div>
              <h3 className="text-lg font-serif font-semibold text-[#221E18] flex items-center gap-2">
                <History size={18} className="text-[#B54B32]" />
                Scene Version History &amp; Point-in-Time Restores
              </h3>
              <p className="text-xs text-[#7A705F] mt-0.5">
                Inspect every point-in-time snapshot of your scenes, compare revisions against current drafts, and restore previous drafts with automated safety backups.
              </p>
            </div>
            {selectedScene && onUpdateScene && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddVersion(true)}
                  className="px-3 py-1.5 bg-[#221E18] text-[#FAF6EE] rounded-[6px] text-xs font-medium hover:bg-black flex items-center gap-1.5 transition-colors cursor-pointer shadow-warm-xs min-h-[34px]"
                >
                  <Plus size={13} className="text-[#B54B32]" />
                  <span>Snapshot Active Scene</span>
                </button>
                <button
                  onClick={() => onNavigateToScene(selectedScene.id)}
                  className="px-3 py-1.5 bg-[#F1EAD9] hover:bg-[#EAE2D1] text-[#221E18] rounded-[6px] text-xs font-medium border border-[rgba(34,30,24,0.12)] flex items-center gap-1.5 transition-colors cursor-pointer min-h-[34px]"
                  title="Open in Manuscript Editor"
                >
                  <ExternalLink size={12} className="text-[#7A705F]" />
                  <span>Open in Editor</span>
                </button>
              </div>
            )}
          </div>

          {/* New Version Snapshot Modal */}
          {showAddVersion && selectedScene && (
            <form
              onSubmit={handleCreateSceneVersion}
              className="p-4 bg-[#F1EAD9] rounded-[8px] border border-[rgba(34,30,24,0.14)] shadow-warm-sm space-y-3 animate-in fade-in duration-150"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-semibold text-[#221E18] text-xs">
                  Record Version Snapshot for &ldquo;{selectedScene.title}&rdquo;
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAddVersion(false)}
                  className="text-[#7A705F] hover:text-[#221E18] text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
              <input
                type="text"
                autoFocus
                value={newVersionLabel}
                onChange={(e) => setNewVersionLabel(e.target.value)}
                placeholder="e.g., Pre-dialogue revision, Chapter climax draft, Sensory pass checkpoint"
                className="w-full p-2 bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[6px] text-xs text-[#221E18] focus:outline-none"
              />
              <div className="flex justify-between items-center text-[11px] text-[#7A705F]">
                <span>Current word count: <strong className="text-[#221E18] font-mono">{selectedScene.wordCount}</strong></span>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#B54B32] text-[#FAF6EE] rounded-[5px] font-semibold text-xs hover:bg-[#9E3E27] transition-colors cursor-pointer"
                >
                  Save Snapshot
                </button>
              </div>
            </form>
          )}

          {/* Two-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Scene Explorer */}
            <div className="lg:col-span-4 bg-[#F1EAD9]/60 rounded-[8px] border border-[rgba(34,30,24,0.12)] p-3 space-y-3">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#7A705F]" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Filter scenes..."
                  className="w-full pl-7 pr-2 py-1.5 bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[5px] text-xs text-[#221E18] focus:outline-none"
                />
              </div>

              <div className="space-y-1 max-h-[520px] overflow-y-auto pr-1">
                {filteredScenes.map((sc) => {
                  const isSelected = sc.id === selectedSceneId;
                  const vCount = (sc.versions || []).length;
                  return (
                    <button
                      key={sc.id}
                      onClick={() => {
                        setSelectedSceneId(sc.id);
                        setExpandedVersionId(null);
                      }}
                      className={`w-full text-left p-2.5 rounded-[6px] transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#FAF6EE] shadow-warm-sm border-[#B54B32]/40 text-[#221E18]'
                          : 'bg-[#FAF6EE]/40 border-transparent hover:bg-[#FAF6EE] text-[#5C5346] hover:text-[#221E18]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-serif font-semibold text-xs truncate">
                          {sc.title}
                        </span>
                        {vCount > 0 ? (
                          <span className="px-1.5 py-0.2 rounded-full bg-[#B54B32]/10 text-[#B54B32] border border-[#B54B32]/20 text-[10px] font-mono font-bold shrink-0">
                            {vCount} {vCount === 1 ? 'ver' : 'vers'}
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-[#7A705F]/60 shrink-0">
                            0 vers
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-[#7A705F]">
                        {sc.chapterTitle && <span className="truncate">{sc.chapterTitle}</span>}
                        <span>·</span>
                        <span className="font-mono">{sc.wordCount}w</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Selected Scene Version History Inspector */}
            <div className="lg:col-span-8 space-y-4">
              {selectedScene ? (
                <>
                  {/* Active Scene Header Card */}
                  <div className="p-4 bg-[#FAF6EE] rounded-[8px] border border-[rgba(34,30,24,0.12)] shadow-warm-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[#7A705F]">
                        {selectedScene.chapterTitle ? `Chapter: ${selectedScene.chapterTitle}` : 'Manuscript Scene'}
                      </div>
                      <h4 className="text-base font-serif font-bold text-[#221E18] mt-0.5">
                        {selectedScene.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-[#7A705F]">
                        <span>Current Draft: <strong className="text-[#221E18] font-mono">{selectedScene.wordCount} words</strong></span>
                        <span>·</span>
                        <span className="capitalize text-emerald-700 font-medium">Status: {selectedScene.status}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowAddVersion(true)}
                        className="px-3 py-1.5 bg-[#FAF6EE] hover:bg-[#F1EAD9] text-[#221E18] rounded-[5px] text-xs font-semibold border border-[rgba(34,30,24,0.14)] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Plus size={12} className="text-[#B54B32]" />
                        <span>Take Snapshot</span>
                      </button>
                    </div>
                  </div>

                  {/* Versions List */}
                  {sceneVersions.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#7A705F]">
                          Recorded Snapshots ({sceneVersions.length})
                        </span>
                        <span className="text-[11px] text-[#7A705F]">
                          Click any version to inspect prose or compare with current draft
                        </span>
                      </div>

                      <div className="space-y-2">
                        {sceneVersions.map((ver, idx) => {
                          const isExpanded = expandedVersionId === ver.id;
                          const wordDiff = (ver.wordCount || 0) - selectedScene.wordCount;
                          const formattedDate = new Date(ver.timestamp).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          });
                          const formattedTime = new Date(ver.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          });

                          return (
                            <div
                              key={ver.id}
                              className={`bg-[#FAF6EE] rounded-[8px] border transition-all ${
                                isExpanded
                                  ? 'border-[#B54B32] shadow-warm-sm'
                                  : 'border-[rgba(34,30,24,0.12)] hover:border-[rgba(34,30,24,0.2)]'
                              }`}
                            >
                              {/* Version Row Header */}
                              <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div
                                  className="flex items-start gap-2.5 cursor-pointer flex-1 min-w-0"
                                  onClick={() => setExpandedVersionId(isExpanded ? null : ver.id)}
                                >
                                  <div className="p-1 rounded bg-[#F1EAD9] text-[#B54B32] mt-0.5 shrink-0">
                                    <Clock size={14} />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-xs text-[#221E18] truncate">
                                        {ver.label || `Snapshot ${sceneVersions.length - idx}`}
                                      </span>
                                      {idx === 0 && (
                                        <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-mono font-bold uppercase">
                                          Latest
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#7A705F]">
                                      <span>{formattedDate} at {formattedTime}</span>
                                      <span>·</span>
                                      <span className="font-mono">{ver.wordCount} words</span>
                                      {wordDiff !== 0 && (
                                        <span
                                          className={`font-mono font-bold text-[10px] ${
                                            wordDiff > 0 ? 'text-emerald-700' : 'text-[#B54B32]'
                                          }`}
                                        >
                                          ({wordDiff > 0 ? `+${wordDiff}` : wordDiff} vs current)
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    onClick={() => setExpandedVersionId(isExpanded ? null : ver.id)}
                                    className="px-2.5 py-1 bg-[#F1EAD9] hover:bg-[#EAE2D1] text-[#221E18] rounded-[5px] text-xs font-medium transition-colors cursor-pointer min-h-[30px] flex items-center gap-1"
                                  >
                                    <span>{isExpanded ? 'Hide' : 'Inspect'}</span>
                                    {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                  </button>

                                  {confirmRestoreId === ver.id ? (
                                    <div className="flex items-center gap-1 bg-amber-50 p-1 rounded-[5px] border border-amber-200">
                                      <span className="text-[10px] text-amber-800 font-medium px-1">Restore this?</span>
                                      <button
                                        onClick={() => handleRestoreSceneVersion(ver)}
                                        className="px-2 py-0.5 bg-[#B54B32] text-[#FAF6EE] rounded text-[10px] font-bold cursor-pointer"
                                      >
                                        Yes
                                      </button>
                                      <button
                                        onClick={() => setConfirmRestoreId(null)}
                                        className="px-1.5 py-0.5 text-[#7A705F] text-[10px] cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setConfirmRestoreId(ver.id)}
                                      className="px-2.5 py-1 bg-[#FAF6EE] hover:bg-[#F1EAD9] text-[#221E18] rounded-[5px] text-xs font-medium border border-[rgba(34,30,24,0.12)] flex items-center gap-1 cursor-pointer min-h-[30px]"
                                      title="Restore this version to the scene draft (with automated backup)"
                                    >
                                      <RotateCcw size={11} className="text-[#B54B32]" />
                                      <span>Restore</span>
                                    </button>
                                  )}

                                  <button
                                    onClick={() => handleDeleteSceneVersion(ver.id)}
                                    className="p-1 text-[#7A705F] hover:text-[#B54B32] transition-colors cursor-pointer min-h-[30px] min-w-[30px] flex items-center justify-center"
                                    title="Delete snapshot"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>

                              {/* Expanded Inspector Panel */}
                              {isExpanded && (
                                <div className="p-4 border-t border-[rgba(34,30,24,0.1)] bg-[#FDFBF7] space-y-3">
                                  <div className="flex items-center justify-between pb-2 border-b border-[rgba(34,30,24,0.08)]">
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        onClick={() => setDiffMode('preview')}
                                        className={`px-2.5 py-1 rounded-[4px] text-xs font-medium cursor-pointer transition-colors ${
                                          diffMode === 'preview'
                                            ? 'bg-[#221E18] text-[#FAF6EE]'
                                            : 'bg-[#F1EAD9] text-[#5C5346] hover:text-[#221E18]'
                                        }`}
                                      >
                                        Snapshot Prose
                                      </button>
                                      <button
                                        onClick={() => setDiffMode('side-by-side')}
                                        className={`px-2.5 py-1 rounded-[4px] text-xs font-medium cursor-pointer transition-colors ${
                                          diffMode === 'side-by-side'
                                            ? 'bg-[#221E18] text-[#FAF6EE]'
                                            : 'bg-[#F1EAD9] text-[#5C5346] hover:text-[#221E18]'
                                        }`}
                                      >
                                        Compare Side-by-Side
                                      </button>
                                    </div>
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(ver.proseContent);
                                        showToast('Prose copied to clipboard');
                                      }}
                                      className="text-xs text-[#7A705F] hover:text-[#221E18] flex items-center gap-1 cursor-pointer"
                                    >
                                      Copy Text
                                    </button>
                                  </div>

                                  {diffMode === 'preview' ? (
                                    <div className="max-h-96 overflow-y-auto p-4 bg-[#FAF6EE] rounded-[6px] border border-[rgba(34,30,24,0.1)] font-serif text-sm text-[#221E18] leading-relaxed whitespace-pre-wrap selection:bg-[#B54B32]/20">
                                      {ver.proseContent || <span className="italic text-[#7A705F]">No prose written in this snapshot.</span>}
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#7A705F] mb-1.5">
                                          Snapshot Version ({ver.wordCount} words)
                                        </div>
                                        <div className="max-h-96 overflow-y-auto p-3 bg-[#FAF6EE] rounded-[6px] border border-[rgba(34,30,24,0.1)] font-serif text-xs text-[#221E18] leading-relaxed whitespace-pre-wrap">
                                          {ver.proseContent || <span className="italic text-[#7A705F]">Empty prose.</span>}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-800 mb-1.5">
                                          Current Live Draft ({selectedScene.wordCount} words)
                                        </div>
                                        <div className="max-h-96 overflow-y-auto p-3 bg-[#FAF6EE] rounded-[6px] border border-emerald-300 font-serif text-xs text-[#221E18] leading-relaxed whitespace-pre-wrap">
                                          {selectedScene.proseContent || <span className="italic text-[#7A705F]">Empty draft.</span>}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-[#FAF6EE] rounded-[8px] border border-dashed border-[rgba(34,30,24,0.16)] space-y-3">
                      <div className="w-10 h-10 rounded-full bg-[#F1EAD9] text-[#B54B32] flex items-center justify-center mx-auto">
                        <History size={20} />
                      </div>
                      <h4 className="font-serif font-bold text-sm text-[#221E18]">
                        No saved version snapshots for &ldquo;{selectedScene.title}&rdquo;
                      </h4>
                      <p className="text-xs text-[#7A705F] max-w-md mx-auto leading-relaxed">
                        Point-in-time snapshots let you capture drafts before structural changes, try risky prose revisions, and compare diffs at any time.
                      </p>
                      {onUpdateScene && (
                        <button
                          onClick={() => {
                            const newVersion: SceneVersion = {
                              id: 'ver-' + Date.now(),
                              timestamp: new Date().toISOString(),
                              title: selectedScene.title,
                              proseContent: selectedScene.proseContent,
                              wordCount: selectedScene.wordCount,
                              label: 'Initial Baseline Snapshot (v1.0)'
                            };
                            onUpdateScene(selectedScene.id, { versions: [newVersion] });
                            setExpandedVersionId(newVersion.id);
                            showToast('Baseline version snapshot created!');
                          }}
                          className="px-4 py-2 bg-[#B54B32] text-[#FAF6EE] rounded-[6px] text-xs font-semibold hover:bg-[#9E3E27] transition-colors cursor-pointer shadow-warm-xs inline-flex items-center gap-1.5"
                        >
                          <Plus size={14} />
                          <span>Snapshot Current Draft as Version 1.0</span>
                        </button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="p-8 text-center text-xs text-[#7A705F]">
                  Select a scene to inspect its version history.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: NAMED REVISION PASSES */}
      {activeTab === 'passes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-serif font-semibold text-[#221E18]">
              Editorial Lenses &amp; Checklists
            </h3>
            <button
              onClick={() => setShowAddPass(true)}
              className="px-3.5 py-1.5 bg-[#221E18] text-[#FAF6EE] rounded-[6px] text-xs font-semibold hover:bg-black flex items-center gap-1.5 shadow-warm-sm transition-colors cursor-pointer min-h-[36px]"
            >
              <Plus size={14} className="text-[#B54B32]" /> New Revision Pass
            </button>
          </div>

          {showAddPass && (
            <form
              onSubmit={handleCreatePass}
              className="p-5 bg-[#F1EAD9] rounded-[8px] border border-[rgba(34,30,24,0.12)] shadow-warm-sm space-y-3 animate-in fade-in duration-150"
            >
              <h4 className="font-serif font-bold text-[#221E18] text-sm">Create Named Pass</h4>
              <div>
                <input
                  type="text"
                  required
                  value={newPassName}
                  onChange={(e) => setNewPassName(e.target.value)}
                  placeholder="e.g., Dialogue Rhythm Pass, Sensory Texture Pass, Foreshadowing Pass"
                  className="w-full p-2 bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[6px] text-xs text-[#221E18] focus:outline-none"
                />
              </div>
              <div>
                <textarea
                  value={newPassDesc}
                  onChange={(e) => setNewPassDesc(e.target.value)}
                  placeholder="Editorial objective and guidelines for this pass..."
                  rows={2}
                  className="w-full p-2 bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[6px] text-xs text-[#221E18] focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowAddPass(false)}
                  className="px-3 py-1.5 text-[#7A705F] hover:text-[#221E18] cursor-pointer min-h-[36px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#221E18] text-[#FAF6EE] rounded-[6px] font-semibold hover:bg-black cursor-pointer min-h-[36px]"
                >
                  Create Pass
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {revisionPasses.map((pass) => {
              const completed = pass.checklist.filter((c) => c.done).length;
              return (
                <div
                  key={pass.id}
                  className="bg-[#F1EAD9] rounded-[8px] border border-[rgba(34,30,24,0.12)] p-5 shadow-warm-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-serif font-bold text-[#221E18] text-base">{pass.name}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-[4px] bg-[#FAF6EE] text-[#7A705F] border border-[rgba(34,30,24,0.08)]">
                        {completed}/{pass.checklist.length} Complete
                      </span>
                    </div>

                    <p className="text-xs text-[#7A705F] mb-4 leading-relaxed">{pass.description}</p>

                    {/* Checklist */}
                    <div className="space-y-2">
                      {pass.checklist.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start gap-2.5 text-xs text-[#221E18] group"
                        >
                          <button
                            onClick={() => toggleCheckItem(pass.id, item.id)}
                            className="mt-0.5 text-[#7A705F] hover:text-[#35505F] transition-colors cursor-pointer"
                          >
                            {item.done ? (
                              <CheckCircle2 size={16} className="text-[#35505F]" />
                            ) : (
                              <div className="w-4 h-4 rounded-[4px] border border-[#7A705F]/60" />
                            )}
                          </button>
                          <span
                            className={`leading-tight flex-1 ${
                              item.done ? 'line-through text-[#7A705F]/60' : ''
                            }`}
                          >
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[rgba(34,30,24,0.12)] flex items-center justify-between text-xs">
                    <button
                      onClick={() => addCheckItem(pass.id)}
                      className="text-[#7A705F] hover:text-[#B54B32] font-medium flex items-center gap-1 cursor-pointer min-h-[32px]"
                    >
                      <Plus size={13} className="text-[#B54B32]" /> Add Scene Task
                    </button>
                    <span className="text-[#7A705F]/70 text-[10px] font-mono">Scene-level tracking</span>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-serif font-semibold text-[#221E18]">
                Point-in-Time Manuscript Snapshots
              </h3>
              <p className="text-xs text-[#7A705F]">
                Capture immutable milestones before major developmental rewrites. Safely diff or restore anytime.
              </p>
            </div>
            <button
              onClick={() => setShowAddSnapshot(true)}
              className="px-3.5 py-1.5 bg-[#221E18] text-[#FAF6EE] rounded-[6px] text-xs font-semibold hover:bg-black flex items-center gap-1.5 shadow-warm-sm transition-colors cursor-pointer min-h-[36px]"
            >
              <Camera size={14} className="text-[#B54B32]" /> Capture Snapshot
            </button>
          </div>

          {showAddSnapshot && (
            <form
              onSubmit={handleCreateSnapshot}
              className="p-4 bg-[#F1EAD9] rounded-[8px] border border-[rgba(34,30,24,0.12)] shadow-warm-sm flex items-center gap-3 animate-in fade-in duration-150"
            >
              <input
                type="text"
                required
                autoFocus
                value={newSnapshotName}
                onChange={(e) => setNewSnapshotName(e.target.value)}
                placeholder="Snapshot label (e.g., Before Act 1 Pacing Overhaul)"
                className="flex-1 p-2 bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[6px] text-xs text-[#221E18] focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#221E18] text-[#FAF6EE] rounded-[6px] text-xs font-semibold hover:bg-black cursor-pointer min-h-[36px]"
              >
                Save Snapshot
              </button>
              <button
                type="button"
                onClick={() => setShowAddSnapshot(false)}
                className="text-xs text-[#7A705F] hover:text-[#221E18] cursor-pointer min-h-[36px] px-2"
              >
                Cancel
              </button>
            </form>
          )}

          {/* Side-by-Side Snapshot Comparison / Diff */}
          {selectedSnapshotA && (
            <div className="bg-[#F1EAD9] rounded-[8px] border border-[rgba(34,30,24,0.12)] p-5 sm:p-6 shadow-warm-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[rgba(34,30,24,0.12)]">
                <div className="flex items-center gap-2">
                  <GitCompare size={16} className="text-[#B54B32]" />
                  <span className="font-serif font-bold text-[#221E18] text-sm">
                    Side-by-Side Manuscript Comparison
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <select
                    value={selectedSnapshotAId}
                    onChange={(e) => setSelectedSnapshotAId(e.target.value)}
                    className="p-1.5 bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[6px] text-[#221E18] text-xs focus:outline-none"
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
                    className="px-3 py-1.5 bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] text-[#221E18] hover:bg-[#F1EAD9] rounded-[6px] text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer min-h-[32px]"
                  >
                    <RotateCcw size={12} className="text-[#B54B32]" /> Restore This Snapshot
                  </button>
                </div>
              </div>

              {/* Side-by-Side scene text comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: Snapshot Version */}
                <div className="p-4 bg-[#FAF6EE] rounded-[6px] border border-[rgba(34,30,24,0.12)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase font-mono text-[#7A705F]">
                      Snapshot: {selectedSnapshotA.name}
                    </span>
                    <span className="text-[10px] text-[#7A705F] font-mono">
                      {selectedSnapshotA.timestamp}
                    </span>
                  </div>
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {selectedSnapshotA.scenesSummary.map((sc) => (
                      <div key={sc.id} className="text-xs">
                        <h5 className="font-serif font-semibold text-[#221E18] mb-1">{sc.title}</h5>
                        <p className="font-mono text-[#221E18] leading-relaxed whitespace-pre-wrap text-[11px]">
                          {sc.proseContent.slice(0, 400)}...
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Current Live Draft */}
                <div className="p-4 bg-[#FAF6EE] rounded-[6px] border border-[#35505F]/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase font-mono text-[#35505F]">
                      Current Live Draft
                    </span>
                    <span className="text-[10px] text-[#35505F] font-mono font-medium">
                      Active Editor State
                    </span>
                  </div>
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {scenes.map((sc) => (
                      <div key={sc.id} className="text-xs">
                        <h5 className="font-serif font-semibold text-[#221E18] mb-1">{sc.title}</h5>
                        <p className="font-mono text-[#221E18] leading-relaxed whitespace-pre-wrap text-[11px]">
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
              <h3 className="text-base font-serif font-semibold text-[#221E18] flex items-center gap-2">
                <Scissors size={16} className="text-[#B54B32]" /> The Cutting Room
              </h3>
              <p className="text-xs text-[#7A705F]">
                Excised prose scraps preserved automatically. Search, restore to draft, or convert into research notes.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-2.5 top-2.5 text-[#7A705F]" />
              <input
                type="text"
                value={cuttingRoomSearch}
                onChange={(e) => setCuttingRoomSearch(e.target.value)}
                placeholder="Search deleted scraps..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[6px] text-xs text-[#221E18] focus:outline-none min-h-[36px]"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredCuts.length === 0 ? (
              <div className="bg-[#F1EAD9] rounded-[8px] border border-[rgba(34,30,24,0.12)] p-12 text-center text-xs text-[#7A705F] italic">
                No clipped passages matching search. Select text in the editor and click "Cutting Room" to preserve deleted prose.
              </div>
            ) : (
              filteredCuts.map((cut) => (
                <div
                  key={cut.id}
                  className="bg-[#F1EAD9] rounded-[8px] border border-[rgba(34,30,24,0.12)] p-5 shadow-warm-sm space-y-3"
                >
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-[rgba(34,30,24,0.12)]">
                    <div className="flex items-center gap-2 font-serif">
                      <span className="font-semibold text-[#221E18]">From: {cut.originalSceneTitle}</span>
                      <span className="text-[#7A705F]/40">·</span>
                      <span className="text-[#7A705F] text-[11px] font-mono">{cut.deletedAt}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onRestoreCuttingRoomItem(cut)}
                        className="px-2.5 py-1 bg-[#FAF6EE] hover:bg-[#F1EAD9] text-[#221E18] rounded-[5px] font-medium border border-[rgba(34,30,24,0.12)] text-xs transition-colors flex items-center gap-1 cursor-pointer min-h-[32px]"
                      >
                        <RotateCcw size={11} className="text-[#B54B32]" /> Restore to Scene
                      </button>
                      <button
                        onClick={() => onConvertCutToNote(cut)}
                        className="px-2.5 py-1 bg-[#FAF6EE] hover:bg-[#F1EAD9] text-[#7A705F] rounded-[5px] font-medium border border-[rgba(34,30,24,0.12)] text-xs transition-colors cursor-pointer min-h-[32px]"
                      >
                        Convert to Note
                      </button>
                      <button
                        onClick={() => onDeleteCuttingRoomItem(cut.id)}
                        className="p-1 text-[#7A705F] hover:text-[#B54B32] transition-colors cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                        title="Delete permanently"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <p className="font-mono text-xs text-[#221E18] leading-relaxed italic bg-[#FAF6EE] p-3 rounded-[6px] border border-[rgba(34,30,24,0.08)]">
                    "{cut.text}"
                  </p>

                  {cut.contextNote && (
                    <div className="text-[11px] text-[#7A705F]">
                      <span className="font-semibold text-[#221E18] font-mono text-[10px] uppercase">
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
