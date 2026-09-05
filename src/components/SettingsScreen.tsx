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
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8">
        <span className="text-[10px] font-bold tracking-widest text-[#AAA69F] uppercase font-mono">
          Security & Sovereignty
        </span>
        <h2 className="text-2xl md:text-3xl font-serif text-[#1A1814] font-semibold mt-1">
          Settings & Privacy Policy
        </h2>
        <p className="text-[#8C887F] text-xs mt-1">
          Complete creative sovereignty. Your words remain strictly your own.
        </p>
      </div>

      <div className="space-y-6">
        {/* Privacy Declaration Card */}
        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-6 shadow-2xs">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-emerald-950 text-base">
                Local-First & Zero Training Guarantee
              </h3>
              <p className="text-xs text-emerald-900/90 mt-1 leading-relaxed">
                Threadline stores your entire project, Story Bible, and revisions locally on your device in browser storage. Your manuscript is never transmitted to third-party ad networks, never sold, and <strong>strictly never used to train foundation AI models</strong>.
              </p>
              <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-emerald-800 font-mono">
                <span className="flex items-center gap-1">
                  <Check size={13} className="text-emerald-700" /> Local Storage Active
                </span>
                <span className="flex items-center gap-1">
                  <Check size={13} className="text-emerald-700" /> Zero Silent AI Merges
                </span>
                <span className="flex items-center gap-1">
                  <Check size={13} className="text-emerald-700" /> Complete Export Portability
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dedicated Folder Storage / Vault (Obsidian Model) */}
        <div className="bg-white rounded-xl border border-[#EBE8E2] p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#FAF6EE] text-[#8C6D3F] border border-[#E5DEC9]">
                <Folder size={18} />
              </div>
              <div>
                <h3 className="font-serif font-bold text-[#1A1814] text-base">
                  Local Folder Vault Storage
                </h3>
                <p className="text-xs text-[#8C887F]">
                  Store your manuscript directly in a dedicated directory on your computer, arranged like Obsidian or Scrivener.
                </p>
              </div>
            </div>
            {isVaultConnected ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 size={12} /> Connected: {vaultInfo?.folderName}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#FAF6EE] text-[#7A705F] border border-[#E5DEC9]">
                <HardDrive size={12} /> Browser Local Only
              </span>
            )}
          </div>

          <p className="text-xs text-[#5A5143] leading-relaxed">
            By connecting a dedicated folder, Threadline will save all chapters as readable <code className="text-[#1A1814] font-mono">.md</code> files inside a <code className="text-[#1A1814] font-mono">Manuscript/</code> subfolder, accompanied by a <code className="text-[#1A1814] font-mono">project.json</code> and <code className="text-[#1A1814] font-mono">StoryBible/</code>. You can back it up with Git or iCloud, or edit chapters concurrently in any text editor.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onOpenVaultManager}
              className="px-4 py-2 bg-[#2D2A26] hover:bg-[#1A1814] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <FolderOpen size={13} /> {isVaultConnected ? 'Manage Folder Vault' : 'Choose Local Project Folder'}
            </button>
            {isVaultConnected && vaultInfo?.folderPath && (
              <span className="text-[11px] font-mono text-[#7A705F] bg-[#FAF9F5] px-2.5 py-1.5 rounded border border-[#EBE8E2] truncate max-w-sm">
                {vaultInfo.folderPath}
              </span>
            )}
          </div>
        </div>

        {/* Transparent AI Execution Logs */}
        <div className="bg-white rounded-xl border border-[#EBE8E2] p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#D4A373]" />
              <h3 className="font-serif font-bold text-[#1A1814] text-base">
                Transparent AI Execution Audit Log
              </h3>
            </div>
            <span className="text-xs text-[#AAA69F] font-mono">
              {aiAuditLogs.length} logged actions
            </span>
          </div>
          <p className="text-xs text-[#8C887F] mb-4">
            Every query sent to the Sounding Board assistant is logged here with the exact source scope and whether you accepted or discarded the proposed output.
          </p>

          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {aiAuditLogs.length === 0 ? (
              <p className="text-xs text-[#AAA69F] italic py-3 text-center">
                No AI sounding board actions recorded yet.
              </p>
            ) : (
              aiAuditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-[#FAF9F5] rounded-lg border border-[#EBE8E2] text-xs"
                >
                  <div className="flex items-center justify-between mb-1 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-[#1A1814] uppercase text-[10px]">
                        [{log.action}]
                      </span>
                      <span className="text-[#AAA69F] font-mono">{log.timestamp}</span>
                    </div>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-mono uppercase ${
                        log.status === 'accepted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-[#F1F0EC] text-[#6C6960]'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#8C887F] font-serif italic truncate mb-1">
                    Scope: "{log.scopeSnippet}"
                  </div>
                  <div className="text-[10px] text-[#3C3933] font-mono line-clamp-2 bg-white p-1.5 rounded border border-[#EBE8E2]">
                    {log.output}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Data Management & Project Reset */}
        <div className="bg-white rounded-xl border border-[#EBE8E2] p-6 shadow-2xs space-y-4">
          <h3 className="font-serif font-bold text-[#1A1814] text-base">
            Data Sovereignty & Local Storage
          </h3>
          <p className="text-xs text-[#8C887F]">
            Export a full machine-readable JSON archive of your project, or restore the initial demonstration project "The Glass Clockmaker of Prague."
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onExportFullArchive}
              className="px-4 py-2 bg-[#2D2A26] hover:bg-[#1A1814] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
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
              className="px-4 py-2 bg-[#FAF9F5] hover:bg-[#F1F0EC] text-[#3C3933] border border-[#EBE8E2] rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
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
              className="px-4 py-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ml-auto"
            >
              <Trash2 size={13} /> Clear All Local Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
