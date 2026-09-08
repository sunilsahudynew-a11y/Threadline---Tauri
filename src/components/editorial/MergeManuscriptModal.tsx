import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  ArrowRight,
  Layers,
  FileText,
  Lock
} from 'lucide-react';
import { Scene, Project } from '../../types';

interface MergeManuscriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  scene: Scene;
  editedText: string;
  baselineText: string;
  onConfirmMerge: (sceneId: string, finalProse: string) => void;
}

export const MergeManuscriptModal: React.FC<MergeManuscriptModalProps> = ({
  isOpen,
  onClose,
  project,
  scene,
  editedText,
  baselineText,
  onConfirmMerge
}) => {
  const [createBackup, setCreateBackup] = useState(true);
  const [backupNote, setBackupNote] = useState('Pre-editorial merge snapshot');

  if (!isOpen) return null;

  const originalWords = (baselineText.match(/\b\w+\b/g) || []).length;
  const editedWords = (editedText.match(/\b\w+\b/g) || []).length;
  const wordDelta = editedWords - originalWords;

  const handleMerge = () => {
    onConfirmMerge(scene.id, editedText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#FAF6EE] text-[#221E18] rounded-[10px] border border-[rgba(34,30,24,0.18)] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[rgba(34,30,24,0.12)] bg-[#F1EAD9] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[5px] bg-[#B54B32] text-[#FAF6EE] flex items-center justify-center shadow-xs">
              <ShieldCheck size={16} />
            </div>
            <div>
              <h2 className="font-serif font-bold text-sm text-[#221E18] leading-tight">
                Merge Editorial Copy to Original Manuscript
              </h2>
              <p className="text-[11px] text-[#7A705F] font-sans">
                Intentional promotion of editorial revisions into the draft
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#7A705F] hover:text-[#221E18] hover:bg-[#ECE5D6] rounded-[5px] transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-[#221E18]">
          {/* Reassurance Notice */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-[8px] p-3 flex gap-2.5 items-start">
            <AlertTriangle size={16} className="text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1 text-[#5A451E]">
              <div className="font-semibold text-xs">
                Independent Workspace Architecture
              </div>
              <p className="text-[11px] leading-relaxed">
                Until now, your original manuscript draft remained <strong>100% untouched</strong>. Merging will update the author’s primary draft prose for <em>"{scene.title}"</em> with the polished editorial text.
              </p>
            </div>
          </div>

          {/* Diff Metrics */}
          <div className="bg-[#F3EDE0] border border-[rgba(34,30,24,0.1)] rounded-[8px] p-3.5 space-y-2">
            <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#7A705F]">
              Scene Comparison
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-[#FAF6EE] p-2 rounded-[5px] border border-[rgba(34,30,24,0.06)]">
                <div className="text-[10px] text-[#7A705F] font-mono">Original Draft</div>
                <div className="text-sm font-semibold font-serif mt-0.5">{originalWords}w</div>
              </div>
              <div className="bg-[#FAF6EE] p-2 rounded-[5px] border border-[rgba(34,30,24,0.06)]">
                <div className="text-[10px] text-[#7A705F] font-mono">Editorial Copy</div>
                <div className="text-sm font-semibold font-serif mt-0.5">{editedWords}w</div>
              </div>
              <div className="bg-[#FAF6EE] p-2 rounded-[5px] border border-[rgba(34,30,24,0.06)]">
                <div className="text-[10px] text-[#7A705F] font-mono">Net Delta</div>
                <div className={`text-sm font-semibold font-mono mt-0.5 ${wordDelta <= 0 ? 'text-[#3A7D6E]' : 'text-[#B54B32]'}`}>
                  {wordDelta > 0 ? `+${wordDelta}` : wordDelta}w
                </div>
              </div>
            </div>
          </div>

          {/* Automatic Backup Option */}
          <div className="border border-[rgba(34,30,24,0.12)] rounded-[8px] p-3.5 bg-[#FAF6EE] space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={createBackup}
                onChange={(e) => setCreateBackup(e.target.checked)}
                className="rounded text-[#B54B32] focus:ring-[#B54B32]"
              />
              <span className="font-semibold text-xs text-[#221E18]">
                Save Automatic Revision Snapshot in Version History
              </span>
            </label>
            <p className="text-[11px] text-[#7A705F] pl-5 leading-tight">
              Permanently archives the author’s original draft in the scene’s version history before overwriting, so it can be restored anytime.
            </p>
            {createBackup && (
              <div className="pl-5 pt-1">
                <input
                  type="text"
                  value={backupNote}
                  onChange={(e) => setBackupNote(e.target.value)}
                  placeholder="Snapshot label"
                  className="w-full text-xs bg-[#FAF6EE] border border-[rgba(34,30,24,0.14)] rounded-[4px] px-2.5 py-1 text-[#221E18] focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-[rgba(34,30,24,0.12)] bg-[#F1EAD9] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-[#7A705F] hover:text-[#221E18] rounded-[5px] hover:bg-[#ECE5D6] transition-colors cursor-pointer"
          >
            Keep Working Copy Separate
          </button>

          <button
            onClick={handleMerge}
            className="px-4 py-1.5 bg-[#B54B32] hover:bg-[#9E3E27] text-[#FAF6EE] text-xs font-semibold rounded-[5px] transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <ShieldCheck size={14} />
            <span>Confirm & Merge into Manuscript</span>
          </button>
        </div>
      </div>
    </div>
  );
};
