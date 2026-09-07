import React, { useState } from 'react';
import { Scene, SceneVersion } from '../../types';
import { History, Plus, RotateCcw, Trash2, ChevronDown, ChevronRight, Check, AlertCircle, Clock, FileText } from 'lucide-react';
import { useToast } from '../Toast';

interface SceneVersionHistoryTabProps {
  scene: Scene;
  onUpdateScene: (updatedFields: Partial<Scene>) => void;
}

export const SceneVersionHistoryTab: React.FC<SceneVersionHistoryTabProps> = ({
  scene,
  onUpdateScene
}) => {
  const { showToast } = useToast();
  const [newVersionLabel, setNewVersionLabel] = useState('');
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [expandedVersionId, setExpandedVersionId] = useState<string | null>(null);
  const [confirmRestoreId, setConfirmRestoreId] = useState<string | null>(null);

  const versions: SceneVersion[] = scene.versions || [];

  const handleCreateVersion = (e: React.FormEvent) => {
    e.preventDefault();
    const newVersion: SceneVersion = {
      id: 'ver-' + Date.now(),
      timestamp: new Date().toISOString(),
      title: scene.title,
      proseContent: scene.proseContent,
      wordCount: scene.wordCount,
      label: newVersionLabel.trim() || 'Manual revision snapshot'
    };

    const updatedVersions = [newVersion, ...versions];
    onUpdateScene({ versions: updatedVersions });
    setNewVersionLabel('');
    setIsCreatingVersion(false);
    showToast('Version snapshot recorded');
  };

  const handleRestoreVersion = (version: SceneVersion) => {
    // 1. First, create an automated rollback backup of current state so nothing is ever lost
    const backupVersion: SceneVersion = {
      id: 'ver-backup-' + Date.now(),
      timestamp: new Date().toISOString(),
      title: scene.title,
      proseContent: scene.proseContent,
      wordCount: scene.wordCount,
      label: `Pre-restore rollback (saved before restoring ${new Date(version.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
    };

    const updatedVersions = [backupVersion, ...versions.filter((v) => v.id !== version.id), version];

    onUpdateScene({
      proseContent: version.proseContent,
      wordCount: version.wordCount,
      versions: updatedVersions
    });

    setConfirmRestoreId(null);
    showToast(`Restored version from ${new Date(version.timestamp).toLocaleTimeString()}`);
  };

  const handleDeleteVersion = (versionId: string) => {
    const updated = versions.filter((v) => v.id !== versionId);
    onUpdateScene({ versions: updated });
    showToast('Version removed from history');
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Header & Create Snapshot Button */}
      <div className="p-3 bg-[#F1EAD9] border-b border-[rgba(34,30,24,0.12)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <History size={14} className="text-[#35505F]" />
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#7A705F]">
              Scene Version History
            </span>
          </div>
          <button
            onClick={() => setIsCreatingVersion(!isCreatingVersion)}
            className="flex items-center gap-1 px-2 py-1 bg-[#FAF6EE] hover:bg-[#ECE5D6] border border-[rgba(34,30,24,0.12)] rounded-[5px] text-[10px] font-medium text-[#221E18] transition-colors cursor-pointer"
            title="Save manual snapshot of current scene"
          >
            <Plus size={12} />
            <span>Save Snapshot</span>
          </button>
        </div>

        {/* Snapshot Creation Form */}
        {isCreatingVersion && (
          <form onSubmit={handleCreateVersion} className="mt-2.5 pt-2 border-t border-[rgba(34,30,24,0.1)] space-y-2">
            <input
              type="text"
              placeholder="Version label (e.g., Before character confrontation)"
              value={newVersionLabel}
              onChange={(e) => setNewVersionLabel(e.target.value)}
              className="w-full p-1.5 bg-[#FAF6EE] border border-[rgba(34,30,24,0.14)] rounded-[4px] text-xs text-[#221E18] focus:outline-none focus:border-[#35505F]"
              autoFocus
            />
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setIsCreatingVersion(false)}
                className="px-2 py-1 text-[10px] text-[#7A705F] hover:text-[#221E18] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-2.5 py-1 text-[10px] font-medium bg-[#221E18] text-[#FAF6EE] rounded-[4px] hover:bg-black cursor-pointer"
              >
                Record Snapshot
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Version List */}
      <div className="flex-1 overflow-y-auto px-3 space-y-2.5 pb-6">
        {versions.length === 0 ? (
          <div className="py-8 text-center px-4">
            <div className="w-9 h-9 rounded-full bg-[#F1EAD9] flex items-center justify-center mx-auto text-[#7A705F] mb-2">
              <Clock size={18} />
            </div>
            <p className="text-xs font-serif font-medium text-[#221E18]">No Saved Versions Yet</p>
            <p className="text-[11px] text-[#7A705F] mt-1 leading-relaxed">
              Click &quot;Save Snapshot&quot; above to capture milestone revisions, major cuts, or alternative drafts for this scene.
            </p>
          </div>
        ) : (
          versions.map((ver) => {
            const date = new Date(ver.timestamp);
            const isExpanded = expandedVersionId === ver.id;
            const isConfirming = confirmRestoreId === ver.id;
            const wordDiff = ver.wordCount - scene.wordCount;

            return (
              <div
                key={ver.id}
                className={`border rounded-[6px] transition-all ${
                  isConfirming
                    ? 'border-[#B54B32] bg-[#FAF6EE] shadow-warm-sm'
                    : 'border-[rgba(34,30,24,0.1)] bg-[#FAF6EE] hover:border-[rgba(34,30,24,0.18)]'
                }`}
              >
                {/* Version Card Header */}
                <div className="p-2.5">
                  <div className="flex items-start justify-between gap-1">
                    <button
                      onClick={() => setExpandedVersionId(isExpanded ? null : ver.id)}
                      className="flex-1 text-left flex items-start gap-1.5 min-w-0 cursor-pointer"
                    >
                      <span className="text-[#7A705F] mt-0.5 shrink-0">
                        {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-serif font-semibold text-xs text-[#221E18] truncate">
                          {ver.label || 'Revision Snapshot'}
                        </div>
                        <div className="text-[10px] text-[#7A705F] font-mono flex items-center gap-2 mt-0.5">
                          <span>{date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>•</span>
                          <span>{ver.wordCount} words</span>
                          {wordDiff !== 0 && (
                            <span className={wordDiff > 0 ? 'text-emerald-700 font-bold' : 'text-[#B54B32] font-bold'}>
                              {wordDiff > 0 ? `+${wordDiff}` : wordDiff}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleDeleteVersion(ver.id)}
                      className="p-1 text-[#7A705F] hover:text-[#B54B32] rounded transition-colors cursor-pointer shrink-0"
                      title="Delete this revision"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {/* Restore Actions */}
                  <div className="mt-2 pt-2 border-t border-[rgba(34,30,24,0.06)] flex items-center justify-between gap-2">
                    {isConfirming ? (
                      <div className="w-full bg-[#F1EAD9] p-2 rounded-[5px] space-y-1.5">
                        <div className="flex items-center gap-1 text-[11px] font-medium text-[#B54B32]">
                          <AlertCircle size={12} />
                          <span>Restore this version?</span>
                        </div>
                        <p className="text-[10px] text-[#7A705F]">
                          A safety snapshot of your current prose will be created automatically before restoring.
                        </p>
                        <div className="flex items-center justify-end gap-1.5 pt-1">
                          <button
                            onClick={() => setConfirmRestoreId(null)}
                            className="px-2 py-0.5 text-[10px] text-[#7A705F] hover:text-[#221E18] cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleRestoreVersion(ver)}
                            className="px-2 py-0.5 text-[10px] font-medium bg-[#B54B32] text-[#FAF6EE] rounded-[4px] hover:bg-[#9B3F29] cursor-pointer"
                          >
                            Yes, Restore
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmRestoreId(ver.id)}
                        className="flex items-center gap-1 px-2 py-1 rounded-[4px] bg-[#35505F]/10 hover:bg-[#35505F]/20 text-[#35505F] text-[11px] font-medium transition-colors cursor-pointer"
                        title="Restore this version into current editor"
                      >
                        <RotateCcw size={11} />
                        <span>Restore This Version</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Expandable Preview */}
                {isExpanded && (
                  <div className="p-2.5 pt-0 border-t border-[rgba(34,30,24,0.08)] bg-[#F1EAD9]/30">
                    <div className="text-[10px] font-mono text-[#7A705F] uppercase mb-1 flex items-center gap-1">
                      <FileText size={10} />
                      <span>Prose Preview</span>
                    </div>
                    <div className="max-h-40 overflow-y-auto p-2 bg-[#FAF6EE] rounded border border-[rgba(34,30,24,0.08)] text-[11px] font-serif text-[#221E18] leading-relaxed whitespace-pre-wrap select-text">
                      {ver.proseContent ? ver.proseContent.slice(0, 800) + (ver.proseContent.length > 800 ? '...' : '') : '(Empty scene prose)'}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
