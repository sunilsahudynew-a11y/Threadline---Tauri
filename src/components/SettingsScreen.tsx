import React, { useState } from 'react';
import { AIAuditLog } from '../types';
import { VaultInfo } from '../services/storage/vaultTypes';
import {
  ShieldCheck,
  Lock,
  Database,
  Trash2,
  RotateCcw,
  Sparkles,
  Check,
  FileText,
  Download,
  AlertTriangle,
  Folder,
  FolderOpen,
  FolderSync,
  HardDrive,
  CheckCircle2
} from 'lucide-react';

interface SettingsScreenProps {
  aiAuditLogs: AIAuditLog[];
  onResetToDemo: () => void;
  onClearAllData: () => void;
  onExportFullArchive: () => void;
  vaultInfo?: VaultInfo | null;
  onOpenVaultManager?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  aiAuditLogs,
  onResetToDemo,
  onClearAllData,
  onExportFullArchive,
  vaultInfo,
  onOpenVaultManager
}) => {
  const [resetConfirm, setResetConfirm] = useState(false);

  const isVaultConnected = vaultInfo && vaultInfo.mode !== 'browser-cached';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 text-[#221E18]">
      <div className="mb-6 sm:mb-8">
        <span className="section-label block mb-1">
          Security &amp; Sovereignty
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif text-[#221E18] font-semibold">
          Settings &amp; Vault Sovereignty
        </h2>
        <p className="text-[#7A705F] text-xs sm:text-sm mt-1">
          Complete creative sovereignty. Your words remain strictly your own.
        </p>
      </div>

      <div className="space-y-6">
        {/* Privacy Declaration Card */}
        <div className="bg-[#F1EAD9] border border-[rgba(34,30,24,0.16)] rounded-[6px] p-5 sm:p-6 shadow-warm-sm">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-[5px] bg-[#FAF6EE] text-[#35505F] border border-[rgba(34,30,24,0.12)] shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-[#221E18] text-base">
                Local-First &amp; Zero Training Guarantee
              </h3>
              <p className="text-xs text-[#5A5143] mt-1 leading-relaxed">
                Threadline stores your entire project, Story Bible, and revisions locally on your device in browser storage or your chosen disk folder. Your manuscript is never transmitted to third-party ad networks, never sold, and <strong className="text-[#221E18]">strictly never used to train foundation AI models</strong>.
              </p>
              <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-[#35505F] font-mono">
                <span className="flex items-center gap-1">
                  <Check size={13} className="text-[#35505F]" /> Local Storage Active
                </span>
                <span className="flex items-center gap-1">
                  <Check size={13} className="text-[#35505F]" /> Zero Silent AI Merges
                </span>
                <span className="flex items-center gap-1">
                  <Check size={13} className="text-[#35505F]" /> Complete Export Portability
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dedicated Folder Storage / Vault (Obsidian Model) */}
        <div className="bg-[#FAF6EE] rounded-[6px] border border-[rgba(34,30,24,0.12)] p-5 sm:p-6 shadow-warm-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-[5px] bg-[#F1EAD9] text-[#7A705F] border border-[rgba(34,30,24,0.12)]">
                <Folder size={18} />
              </div>
              <div>
                <h3 className="font-serif font-bold text-[#221E18] text-base">
                  Local Folder Vault Storage
                </h3>
                <p className="text-xs text-[#7A705F]">
                  Store your manuscript directly in a dedicated directory on your computer, arranged like Obsidian or Scrivener.
                </p>
              </div>
            </div>
            {isVaultConnected ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F1EAD9] text-[#221E18] border border-[rgba(34,30,24,0.16)] shrink-0 self-start sm:self-auto">
                <CheckCircle2 size={12} className="text-[#35505F]" /> Connected: {vaultInfo?.folderName}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F1EAD9] text-[#7A705F] border border-[rgba(34,30,24,0.12)] shrink-0 self-start sm:self-auto">
                <HardDrive size={12} /> Browser Local Only
              </span>
            )}
          </div>

          <p className="text-xs text-[#5A5143] leading-relaxed">
            By connecting a dedicated folder, Threadline will save all chapters as readable <code className="text-[#221E18] font-mono bg-[#F1EAD9] px-1 py-0.5 rounded">.md</code> files inside a <code className="text-[#221E18] font-mono bg-[#F1EAD9] px-1 py-0.5 rounded">Manuscript/</code> subfolder, accompanied by a <code className="text-[#221E18] font-mono bg-[#F1EAD9] px-1 py-0.5 rounded">project.json</code> and <code className="text-[#221E18] font-mono bg-[#F1EAD9] px-1 py-0.5 rounded">StoryBible/</code>. You can back it up with Git or iCloud, or edit chapters concurrently in any text editor.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onOpenVaultManager}
              className="px-4 py-2 bg-[#221E18] hover:bg-black text-[#FAF6EE] rounded-[6px] text-xs font-semibold flex items-center gap-1.5 shadow-warm-sm transition-colors cursor-pointer min-h-[38px]"
            >
              <FolderOpen size={13} /> {isVaultConnected ? 'Manage Folder Vault' : 'Choose Local Project Folder'}
            </button>
            {isVaultConnected && vaultInfo?.folderPath && (
              <span className="text-[11px] font-mono text-[#7A705F] bg-[#F1EAD9] px-2.5 py-1.5 rounded-[5px] border border-[rgba(34,30,24,0.12)] truncate max-w-sm">
                {vaultInfo.folderPath}
              </span>
            )}
          </div>
        </div>

        {/* Transparent AI Execution Logs */}
        <div className="bg-[#FAF6EE] rounded-[6px] border border-[rgba(34,30,24,0.12)] p-5 sm:p-6 shadow-warm-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#B54B32]" />
              <h3 className="font-serif font-bold text-[#221E18] text-base">
                Transparent AI Execution Audit Log
              </h3>
            </div>
            <span className="text-xs text-[#7A705F] font-mono">
              {aiAuditLogs.length} logged actions
            </span>
          </div>
          <p className="text-xs text-[#7A705F] mb-4">
            Every query sent to the Sounding Board assistant is logged here with the exact source scope and whether you accepted or discarded the proposed output.
          </p>

          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {aiAuditLogs.length === 0 ? (
              <p className="text-xs text-[#7A705F] italic py-4 text-center">
                No AI sounding board actions recorded yet.
              </p>
            ) : (
              aiAuditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-[#F1EAD9]/40 rounded-[5px] border border-[rgba(34,30,24,0.08)] text-xs"
                >
                  <div className="flex items-center justify-between mb-1 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-[#221E18] uppercase text-[10px]">
                        [{log.action}]
                      </span>
                      <span className="text-[#7A705F] font-mono">{log.timestamp}</span>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-mono uppercase ${
                        log.status === 'accepted'
                          ? 'bg-[#FAF6EE] text-[#35505F] border border-[rgba(34,30,24,0.12)] font-semibold'
                          : 'bg-[#F1EAD9] text-[#7A705F]'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#7A705F] font-serif italic truncate mb-1">
                    Scope: "{log.scopeSnippet}"
                  </div>
                  <div className="text-[10px] text-[#221E18] font-mono line-clamp-2 bg-[#FAF6EE] p-2 rounded-[4px] border border-[rgba(34,30,24,0.08)]">
                    {log.output}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Data Management & Project Reset */}
        <div className="bg-[#FAF6EE] rounded-[6px] border border-[rgba(34,30,24,0.12)] p-5 sm:p-6 shadow-warm-sm space-y-4">
          <h3 className="font-serif font-bold text-[#221E18] text-base">
            Data Sovereignty &amp; Local Storage
          </h3>
          <p className="text-xs text-[#7A705F]">
            Export a full machine-readable JSON archive of your project, or restore the initial demonstration project "The Glass Clockmaker of Prague."
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onExportFullArchive}
              className="px-4 py-2 bg-[#221E18] hover:bg-black text-[#FAF6EE] rounded-[6px] text-xs font-semibold flex items-center gap-1.5 shadow-warm-sm transition-colors cursor-pointer min-h-[38px]"
            >
              <Download size={13} /> Export Full JSON Archive
            </button>

            <button
              onClick={() => {
                if (
                  window.confirm(
                    'Reset all scenes and Story Bible back to the default "The Glass Clockmaker of Prague" demo?'
                  )
                ) {
                  onResetToDemo();
                }
              }}
              className="px-4 py-2 bg-[#F1EAD9] hover:bg-[#EAE4D6] text-[#221E18] border border-[rgba(34,30,24,0.12)] rounded-[6px] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer min-h-[38px]"
            >
              <RotateCcw size={13} /> Reset to Demo Project
            </button>

            <button
              onClick={() => {
                if (
                  window.confirm(
                    'Permanently delete all locally stored projects and scenes? This cannot be undone.'
                  )
                ) {
                  onClearAllData();
                }
              }}
              className="px-4 py-2 bg-[#FAF6EE] hover:bg-rose-50 text-[#B54B32] border border-[#B54B32]/30 rounded-[6px] text-xs font-medium flex items-center gap-1.5 transition-colors sm:ml-auto cursor-pointer min-h-[38px]"
            >
              <Trash2 size={13} /> Clear All Local Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
