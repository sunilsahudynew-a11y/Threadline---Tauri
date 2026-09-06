import React, { useState, useEffect } from 'react';
import {
  Folder,
  FolderSync,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  FolderOpen,
  X,
  FileText,
  BookOpen,
  Scissors,
  Bookmark
} from 'lucide-react';
import {
  VaultInfo,
  VaultSyncResult
} from '../services/storage/vaultTypes';
import {
  getVaultInfo,
  pickVaultFolder,
  writeBundleToVault,
  readBundleFromVault,
  disconnectVaultFolder,
  isTauriEnvironment,
  isFileSystemAccessSupported
} from '../services/storage/vaultStorage';
import { ProjectBundle } from '../types';

interface VaultManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBundle: ProjectBundle;
  onReloadBundleFromVault: (newBundle: ProjectBundle) => void;
  onVaultStatusChange?: (info: VaultInfo) => void;
}

export const VaultManagerModal: React.FC<VaultManagerModalProps> = ({
  isOpen,
  onClose,
  currentBundle,
  onReloadBundleFromVault,
  onVaultStatusChange
}) => {
  const [vaultInfo, setVaultInfo] = useState<VaultInfo | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [syncResult, setSyncResult] = useState<VaultSyncResult | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const isTauri = isTauriEnvironment();
  const isFsaSupported = isFileSystemAccessSupported();

  useEffect(() => {
    if (isOpen) {
      loadInfo();
    }
  }, [isOpen, currentBundle.project.id]);

  const loadInfo = async () => {
    const info = await getVaultInfo(currentBundle.project.id);
    setVaultInfo(info);
    if (onVaultStatusChange) onVaultStatusChange(info);
  };

  const handlePickFolder = async () => {
    setIsProcessing(true);
    setStatusMessage('Selecting folder...');
    try {
      const picked = await pickVaultFolder(currentBundle.project.id);
      if (picked) {
        setVaultInfo(picked);
        if (onVaultStatusChange) onVaultStatusChange(picked);

        // Immediately write current project into the chosen folder
        setStatusMessage('Syncing project files to folder...');
        const result = await writeBundleToVault(currentBundle);
        setSyncResult(result);
        setStatusMessage(result.success ? `Folder connected: ${picked.folderName}` : 'Folder connected, sync pending');
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage('Failed to connect folder');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSyncNow = async () => {
    setIsProcessing(true);
    setStatusMessage('Syncing files to disk...');
    try {
      const result = await writeBundleToVault(currentBundle);
      setSyncResult(result);
      if (result.success) {
        setStatusMessage(`Successfully synced ${result.fileCount || ''} files.`);
      } else {
        setStatusMessage(`Sync error: ${result.message}`);
      }
      loadInfo();
    } catch (err: any) {
      setStatusMessage('Sync failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReloadFromDisk = async () => {
    setIsProcessing(true);
    setStatusMessage('Reading chapters and files from disk...');
    try {
      const loaded = await readBundleFromVault(currentBundle.project.id);
      if (loaded) {
        onReloadBundleFromVault(loaded);
        setStatusMessage('Project successfully reloaded from folder!');
      } else {
        setStatusMessage('Could not find project.json in this folder.');
      }
    } catch (err) {
      setStatusMessage('Error reading files from folder');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDisconnect = () => {
    disconnectVaultFolder(currentBundle.project.id);
    loadInfo();
    setSyncResult(null);
    setStatusMessage('Disconnected from local folder');
  };

  if (!isOpen) return null;

  const isConnected = vaultInfo && vaultInfo.mode !== 'browser-cached';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-[#FAF6EE] border border-[rgba(34,30,24,0.16)] rounded-[6px] shadow-warm-modal max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[rgba(34,30,24,0.12)] flex items-center justify-between bg-[#F1EAD9]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[5px] bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] flex items-center justify-center text-[#221E18]">
              <HardDrive size={18} />
            </div>
            <div>
              <h2 className="text-base font-serif font-semibold text-[#221E18]">Project Storage &amp; Folder Vault</h2>
              <p className="text-xs text-[#7A705F]">
                {isTauri ? 'Native macOS/Windows File System' : 'Direct Local Folder Storage (Obsidian-Style)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#7A705F] hover:text-[#221E18] hover:bg-[#FAF6EE] rounded-[5px] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-[#221E18]">
          {/* Current Status Card */}
          <div className="bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[6px] p-4 shadow-warm-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7A705F] font-mono">Connected Directory</span>
              {isConnected ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F1EAD9] text-[#221E18] border border-[rgba(34,30,24,0.16)]">
                  <CheckCircle2 size={12} className="text-[#35505F]" /> Active Vault
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F1EAD9] text-[#7A705F] border border-[rgba(34,30,24,0.12)]">
                  <AlertCircle size={12} /> Browser Storage Only
                </span>
              )}
            </div>

            {isConnected ? (
              <div className="space-y-1.5">
                <div className="font-semibold text-[#221E18] flex items-center gap-2">
                  <Folder size={16} className="text-[#35505F]" />
                  <span>{vaultInfo?.folderName}</span>
                </div>
                {vaultInfo?.folderPath && (
                  <p className="text-xs text-[#7A705F] font-mono break-all bg-[#F1EAD9] p-2 rounded-[5px] border border-[rgba(34,30,24,0.12)]">
                    {vaultInfo.folderPath}
                  </p>
                )}
                <p className="text-xs text-[#7A705F] mt-2">
                  All chapters are saved as pure Markdown files (<code className="text-[#221E18] font-mono bg-[#F1EAD9] px-1 py-0.5 rounded">.md</code>) in this folder.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-[#5A5143] text-xs leading-relaxed mb-3">
                  This project is currently stored only inside your browser’s temporary storage. Connect a dedicated folder
                  on your computer to store human-readable Markdown files, organize chapters, and edit with external tools like Obsidian.
                </p>
                <button
                  type="button"
                  onClick={handlePickFolder}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#221E18] hover:bg-black text-[#FAF6EE] rounded-[6px] font-semibold text-xs transition-colors shadow-warm-sm cursor-pointer disabled:opacity-50 min-h-[40px]"
                >
                  <FolderOpen size={16} />
                  Choose Dedicated Folder for this Project
                </button>
              </div>
            )}

            {statusMessage && (
              <div className="mt-3 p-2.5 rounded-[5px] bg-[#F1EAD9] text-xs text-[#221E18] border border-[rgba(34,30,24,0.12)] flex items-center gap-2">
                <RefreshCw size={12} className={isProcessing ? 'animate-spin text-[#B54B32]' : 'text-[#7A705F]'} />
                <span>{statusMessage}</span>
              </div>
            )}
          </div>

          {/* Actions if connected */}
          {isConnected && (
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={handleSyncNow}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F1EAD9] hover:bg-[#EAE4D6] text-[#221E18] text-xs font-medium rounded-[6px] border border-[rgba(34,30,24,0.12)] transition-colors cursor-pointer min-h-[36px]"
              >
                <FolderSync size={14} className={isProcessing ? 'animate-spin text-[#B54B32]' : ''} />
                Sync to Folder Now
              </button>
              <button
                type="button"
                onClick={handleReloadFromDisk}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F1EAD9] hover:bg-[#EAE4D6] text-[#221E18] text-xs font-medium rounded-[6px] border border-[rgba(34,30,24,0.12)] transition-colors cursor-pointer min-h-[36px]"
              >
                <RefreshCw size={14} />
                Reload from Folder
              </button>
              <button
                type="button"
                onClick={handlePickFolder}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F1EAD9] hover:bg-[#EAE4D6] text-[#221E18] text-xs font-medium rounded-[6px] border border-[rgba(34,30,24,0.12)] transition-colors cursor-pointer min-h-[36px]"
              >
                <FolderOpen size={14} />
                Change Folder
              </button>
              <button
                type="button"
                onClick={handleDisconnect}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[#B54B32] hover:bg-[#B54B32]/10 text-xs font-medium rounded-[6px] transition-colors cursor-pointer sm:ml-auto min-h-[36px]"
              >
                Disconnect Folder
              </button>
            </div>
          )}

          {/* Folder Structure Preview */}
          <div className="border-t border-[rgba(34,30,24,0.12)] pt-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#7A705F] mb-3 font-mono">
              How Threadline Structures Your Folder
            </h4>
            <div className="bg-[#F1EAD9]/60 border border-[rgba(34,30,24,0.12)] rounded-[6px] p-3 text-xs font-mono space-y-1 text-[#221E18]">
              <div className="flex items-center gap-2 text-[#221E18] font-bold">
                <Folder size={14} className="text-[#35505F]" />
                <span>{vaultInfo?.folderName || 'MyNovel/'}</span>
              </div>
              <div className="pl-5 flex items-center gap-2 text-[#5A5143]">
                <FileText size={12} className="text-[#7A705F]" />
                <span>project.json</span>
                <span className="text-[#7A705F] font-sans text-[11px]">(Project metadata &amp; outline order)</span>
              </div>
              <div className="pl-5 flex items-center gap-2 text-[#221E18] font-semibold">
                <Folder size={13} className="text-[#35505F]" />
                <span>Manuscript/</span>
                <span className="text-[#7A705F] font-sans text-[11px]">(Human-readable Markdown chapters)</span>
              </div>
              <div className="pl-10 text-[#5A5143] text-[11px]">
                ├── 01 - {currentBundle.scenes[0]?.title || 'Chapter One'}.md
              </div>
              <div className="pl-10 text-[#5A5143] text-[11px]">
                ├── 02 - {currentBundle.scenes[1]?.title || 'Chapter Two'}.md
              </div>
              <div className="pl-10 text-[#5A5143] text-[11px]">└── ...</div>
              <div className="pl-5 flex items-center gap-2 text-[#5A5143]">
                <BookOpen size={12} className="text-[#7A705F]" />
                <span>StoryBible/</span>
                <span className="text-[#7A705F] font-sans text-[11px]">(Characters, places, threads, timeline)</span>
              </div>
              <div className="pl-5 flex items-center gap-2 text-[#5A5143]">
                <Scissors size={12} className="text-[#7A705F]" />
                <span>CuttingRoom/</span>
                <span className="text-[#7A705F] font-sans text-[11px]">(Saved cuts &amp; excerpts)</span>
              </div>
              <div className="pl-5 flex items-center gap-2 text-[#5A5143]">
                <Bookmark size={12} className="text-[#7A705F]" />
                <span>Notes/</span>
                <span className="text-[#7A705F] font-sans text-[11px]">(Research items &amp; scratchpad)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[rgba(34,30,24,0.12)] bg-[#F1EAD9] flex items-center justify-between">
          <span className="text-xs text-[#7A705F]">
            Zero lock-in. Works directly with Obsidian, iA Writer, Git, and Dropbox.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#221E18] hover:bg-black text-[#FAF6EE] rounded-[6px] font-medium text-xs transition-colors cursor-pointer min-h-[36px]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
