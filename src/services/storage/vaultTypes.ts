import { ProjectBundle, Scene } from '../../types';

export type VaultStorageMode = 'tauri-fs' | 'browser-fsa' | 'browser-cached';

export interface VaultInfo {
  mode: VaultStorageMode;
  folderName: string;
  folderPath?: string; // On Desktop / Tauri (e.g. /Users/author/Documents/MyNovel)
  lastSyncedAt?: string;
  isAvailable: boolean;
  canSyncContinuously: boolean;
}

export interface VaultSyncResult {
  success: boolean;
  message?: string;
  fileCount?: number;
  timestamp: string;
}

export interface FrontmatterScene {
  id: string;
  title: string;
  order: number;
  chapterId?: string;
  chapterNumber?: number;
  chapterTitle?: string;
  actOrPhase?: string;
  status: 'draft' | 'revised' | 'complete';
  pov: string;
  characters: string[];
  location: string;
  time: string;
  wordCount: number;
  premise: string;
  notes: string;
}
