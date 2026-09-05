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
      <div className="bg-[#FAF7F0] border border-[#E3DC handle-border #D9D0BE] rounded-xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E8E1D1] flex items-center justify-between bg-[#F4EFE2]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#E2DAC6] flex items-center justify-center text-[#221E18]">
              <HardDrive size={20} />
            </div>
            <div>
              <h2 className="text-base font-serif font-medium text-[#221E18]">Project Storage & Folder Vault</h2>
              <p className="text-xs text-[#7A705F]">
                {isTauri ? 'Native macOS/Windows File System' : 'Direct Local Folder Storage (Obsidian-Style)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#7A705F] hover:text-[#221E18] hover:bg-[#E8E1D1] rounded-md transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-[#4A4338]">
          {/* Current Status Card */}
          <div className="bg-[#FFFFFF] border border-[#E8E1D1] rounded-lg p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#7A705F]">Connected Directory</span>
              {isConnected ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 size={12} /> Active Vault
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                  <AlertCircle size={12} /> Browser Memory Only
                </span>
              )}
            </div>

            {isConnected ? (
              <div className="space-y-1">
                <div className="font-medium text-[#221E18] flex items-center gap-2">
                  <Folder size={16} className="text-[#8C6D3F]" />
                  <span>{vaultInfo?.folderName}</span>
                </div>
                {vaultInfo?.folderPath && (
                  <p className="text-xs text-[#7A705F] font-mono break-all bg-[#F8F5EE] p-1.5 rounded border border-[#EAE3D4]">
                    {vaultInfo.folderPath}
                  </p>
                )}
                <p className="text-xs text-[#7A705F] mt-2">
                  All chapters are saved as pure Markdown files (<code className="text-[#221E18]">.md</code>) in this folder.
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
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#3B3428] hover:bg-[#2A251D] text-[#FAF7F0] rounded-md font-medium text-xs transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <FolderOpen size={16} />
                  Choose Dedicated Folder for this Project
                </button>
              </div>
            )}

            {statusMessage && (
              <div className="mt-3 p-2 rounded bg-[#F8F5EE] text-xs text-[#4A4338] border border-[#EAE3D4] flex items-center gap-2">
                <RefreshCw size={12} className={isProcessing ? 'animate-spin text-[#8C6D3F]' : 'text-[#7A705F]'} />
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
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EFE9DB] hover:bg-[#E4DDCB] text-[#221E18] text-xs font-medium rounded-md border border-[#D9D0BE] transition-colors cursor-pointer"
              >
                <FolderSync size={14} className={isProcessing ? 'animate-spin' : ''} />
                Sync to Folder Now
              </button>
              <button
                type="button"
                onClick={handleReloadFromDisk}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EFE9DB] hover:bg-[#E4DDCB] text-[#221E18] text-xs font-medium rounded-md border border-[#D9D0BE] transition-colors cursor-pointer"
              >
                <RefreshCw size={14} />
                Reload from Folder
              </button>
              <button
                type="button"
                onClick={handlePickFolder}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EFE9DB] hover:bg-[#E4DDCB] text-[#221E18] text-xs font-medium rounded-md border border-[#D9D0BE] transition-colors cursor-pointer"
              >
                <FolderOpen size={14} />
                Change Folder
              </button>
              <button
                type="button"
                onClick={handleDisconnect}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:bg-red-50 text-xs font-medium rounded-md transition-colors cursor-pointer ml-auto"
              >
                Disconnect Folder
              </button>
            </div>
          )}

          {/* Folder Structure Preview */}
          <div className="border-t border-[#E8E1D1] pt-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#7A705F] mb-3">
              How Threadline Structures Your Folder
            </h4>
            <div className="bg-[#F6F1E5] border border-[#E5DEC9] rounded-lg p-3 text-xs font-mono space-y-1 text-[#3E382E]">
              <div className="flex items-center gap-2 text-[#221E18] font-bold">
                <Folder size={14} className="text-[#8C6D3F]" />
                <span>{vaultInfo?.folderName || 'MyNovel/'}</span>
              </div>
              <div className="pl-5 flex items-center gap-2 text-[#5E5546]">
                <FileText size={12} className="text-[#8C6D3F]" />
                <span>project.json</span>
                <span className="text-[#968A78] font-sans text-[11px]">(Project metadata & outline order)</span>
              </div>
              <div className="pl-5 flex items-center gap-2 text-[#221E18] font-semibold">
                <Folder size={13} className="text-[#8C6D3F]" />
                <span>Manuscript/</span>
                <span className="text-[#968A78] font-sans text-[11px]">(Human-readable Markdown chapters)</span>
              </div>
              <div className="pl-10 text-[#6B6150] text-[11px]">
                ├── 01 - {currentBundle.scenes[0]?.title || 'Chapter One'}.md
              </div>
              <div className="pl-10 text-[#6B6150] text-[11px]">
                ├── 02 - {currentBundle.scenes[1]?.title || 'Chapter Two'}.md
              </div>
              <div className="pl-10 text-[#6B6150] text-[11px]">└── ...</div>
              <div className="pl-5 flex items-center gap-2 text-[#5E5546]">
                <BookOpen size={12} className="text-[#8C6D3F]" />
                <span>StoryBible/</span>
                <span className="text-[#968A78] font-sans text-[11px]">(Characters, places, threads, timeline)</span>
              </div>
              <div className="pl-5 flex items-center gap-2 text-[#5E5546]">
                <Scissors size={12} className="text-[#8C6D3F]" />
                <span>CuttingRoom/</span>
                <span className="text-[#968A78] font-sans text-[11px]">(Saved cuts & excerpts)</span>
              </div>
              <div className="pl-5 flex items-center gap-2 text-[#5E5546]">
                <Bookmark size={12} className="text-[#8C6D3F]" />
                <span>Notes/</span>
                <span className="text-[#968A78] font-sans text-[11px]">(Research items & scratchpad)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#E8E1D1] bg-[#F4EFE2] flex items-center justify-between">
          <span className="text-xs text-[#7A705F]">
            Zero lock-in. Works directly with Obsidian, iA Writer, Git, and Dropbox.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#3B3428] hover:bg-[#2A251D] text-[#FAF7F0] rounded-md font-medium text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
