import React, { useState, useRef, useEffect } from 'react';
import { ResearchVaultItem, Scene, Entity, DocumentBookmark } from '../../types';
import {
  FolderArchive,
  Music,
  FileText,
  Image as ImageIcon,
  Globe,
  Plus,
  Search,
  Tag,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Trash2,
  Copy,
  Check,
  Clock,
  ZoomIn,
  ZoomOut,
  ChevronRight,
  Maximize2,
  X,
  FileAudio,
  UploadCloud,
  Paperclip,
  AlertCircle,
  HardDrive
} from 'lucide-react';
import { useToast } from '../Toast';

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

interface ResearchVaultScreenProps {
  vaultItems: ResearchVaultItem[];
  activeScene?: Scene;
  allScenes: Scene[];
  entities: Entity[];
  onUpdateVaultItems: (items: ResearchVaultItem[]) => void;
  onPinToScene?: (sceneId: string, bookmark: DocumentBookmark) => void;
  onNavigateToScene?: (sceneId: string) => void;
}

export const ResearchVaultScreen: React.FC<ResearchVaultScreenProps> = ({
  vaultItems,
  activeScene,
  allScenes,
  entities,
  onUpdateVaultItems,
  onPinToScene,
  onNavigateToScene
}) => {
  const { showToast } = useToast();
  const [selectedItemId, setSelectedItemId] = useState<string>(() => vaultItems[0]?.id || '');
  const [filterType, setFilterType] = useState<'all' | 'audio' | 'pdf' | 'image' | 'web-link'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Audio player state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isMuted, setIsMuted] = useState(false);

  // New item modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'audio' | 'pdf' | 'image' | 'web-link'>('image');
  const [newUrl, setNewUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [sourceMode, setSourceMode] = useState<'file' | 'url'>('file');
  const [selectedFileObj, setSelectedFileObj] = useState<{
    name: string;
    sizeFormatted: string;
    dataUrl: string;
    type: 'image' | 'audio' | 'pdf' | 'web-link';
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // PDF simulated zoom
  const [pdfZoom, setPdfZoom] = useState(100);

  // Filter items
  const filteredItems = vaultItems.filter((item) => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (selectedTag && !item.tags.includes(selectedTag)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.notes && item.notes.toLowerCase().includes(q)) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const activeItem = vaultItems.find((i) => i.id === selectedItemId) || filteredItems[0];

  // All unique tags
  const allTags = Array.from(new Set(vaultItems.flatMap((i) => i.tags)));

  // Sync audio player when activeItem changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [activeItem?.id]);

  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch((err) => {
        console.warn('Audio play prevented:', err);
      });
    }
  };

  const handleSeekAudio = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
    if (!isPlaying) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleJumpAudio = (seconds: number) => {
    if (!audioRef.current) return;
    const newT = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
    audioRef.current.currentTime = newT;
    setCurrentTime(newT);
  };

  const handleChangePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Pin to active scene
  const handlePinItem = (item: ResearchVaultItem) => {
    if (!activeScene || !onPinToScene) {
      showToast('No active scene selected to pin reference', 'error');
      return;
    }
    const bookmark: DocumentBookmark = {
      id: `bm-${Date.now()}`,
      type: 'research',
      targetId: item.id,
      title: item.title,
      note: item.description || item.notes || `Research item (${item.type})`,
      pinnedAt: new Date().toISOString()
    };
    onPinToScene(activeScene.id, bookmark);
    showToast(`Pinned "${item.title}" to ${activeScene.title}`);
  };

  const isPinnedToActiveScene = (itemId: string) => {
    if (!activeScene || !activeScene.bookmarks) return false;
    return activeScene.bookmarks.some((b) => b.targetId === itemId);
  };

  // File picker and modal helpers
  const resetFormState = () => {
    setNewTitle('');
    setNewUrl('');
    setNewDescription('');
    setNewTags('');
    setNewNotes('');
    setNewType('image');
    setSelectedFileObj(null);
    setFileError(null);
    setIsDragging(false);
    setSourceMode('file');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openAddModal = () => {
    resetFormState();
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    resetFormState();
  };

  const processSelectedFile = (file: File) => {
    setFileError(null);

    // 25MB safety guard for browser storage performance
    if (file.size > 25 * 1024 * 1024) {
      setFileError('File exceeds 25MB limit. Please choose a smaller file for responsive studio storage.');
      return;
    }

    // Auto-detect media category
    let inferredType: 'image' | 'audio' | 'pdf' | 'web-link' = 'image';
    if (file.type.startsWith('image/')) {
      inferredType = 'image';
    } else if (file.type.startsWith('audio/')) {
      inferredType = 'audio';
    } else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      inferredType = 'pdf';
    } else {
      inferredType = 'web-link';
    }
    setNewType(inferredType);

    // Auto-fill title if currently blank
    if (!newTitle.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setNewTitle(cleanName);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setNewUrl(result);
        setSelectedFileObj({
          name: file.name,
          sizeFormatted: formatBytes(file.size),
          dataUrl: result,
          type: inferredType
        });
      }
    };
    reader.onerror = () => {
      setFileError('Failed to read file from disk. Please try another file.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFileObj(null);
    setNewUrl('');
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Create new research item
  const handleCreateNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const tagsArray = newTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newItem: ResearchVaultItem = {
      id: `vault-${Date.now()}`,
      title: newTitle.trim(),
      type: newType,
      url: newUrl.trim() || undefined,
      description: newDescription.trim() || undefined,
      notes: newNotes.trim() || undefined,
      tags: tagsArray.length > 0 ? tagsArray : ['General'],
      fileSize: selectedFileObj ? selectedFileObj.sizeFormatted : undefined,
      createdAt: new Date().toISOString()
    };

    onUpdateVaultItems([newItem, ...vaultItems]);
    setSelectedItemId(newItem.id);
    closeAddModal();
    showToast(`Added "${newItem.title}" to Research Vault`);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#FAF6EE] text-[#221E18]">
      {/* LEFT BROWSER COLUMN */}
      <div className="w-80 sm:w-96 border-r border-[rgba(34,30,24,0.12)] bg-[#F8F4EC] flex flex-col shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-[rgba(34,30,24,0.12)] bg-[#F1EAD9] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[5px] bg-[#221E18] text-[#FAF6EE] flex items-center justify-center">
              <FolderArchive size={15} />
            </div>
            <div>
              <h1 className="text-sm font-serif font-bold text-[#221E18]">Research Vault</h1>
              <p className="text-[11px] text-[#7A705F]">Multi-media dossier &amp; assets</p>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="px-2.5 py-1 text-xs bg-[#221E18] hover:bg-black text-[#FAF6EE] rounded-[5px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Plus size={13} />
            <span>New Item</span>
          </button>
        </div>

        {/* Search & Type Filters */}
        <div className="p-3 border-b border-[rgba(34,30,24,0.08)] bg-white space-y-2">
          <div className="flex items-center gap-2 bg-[#FAF6EE] border border-[rgba(34,30,24,0.14)] rounded-[6px] px-2.5 py-1">
            <Search size={13} className="text-[#7A705F]" />
            <input
              type="text"
              placeholder="Search documents, audio, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs bg-transparent focus:outline-none w-full text-[#221E18]"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-[#7A705F] text-xs">
                <X size={12} />
              </button>
            )}
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2 py-0.5 rounded-[4px] font-medium whitespace-nowrap cursor-pointer ${
                filterType === 'all' ? 'bg-[#221E18] text-[#FAF6EE]' : 'bg-[#FAF6EE] text-[#7A705F] hover:text-[#221E18]'
              }`}
            >
              All ({vaultItems.length})
            </button>
            <button
              onClick={() => setFilterType('audio')}
              className={`px-2 py-0.5 rounded-[4px] font-medium whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                filterType === 'audio' ? 'bg-[#221E18] text-[#FAF6EE]' : 'bg-[#FAF6EE] text-[#7A705F] hover:text-[#221E18]'
              }`}
            >
              <Music size={11} /> Audio
            </button>
            <button
              onClick={() => setFilterType('pdf')}
              className={`px-2 py-0.5 rounded-[4px] font-medium whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                filterType === 'pdf' ? 'bg-[#221E18] text-[#FAF6EE]' : 'bg-[#FAF6EE] text-[#7A705F] hover:text-[#221E18]'
              }`}
            >
              <FileText size={11} /> Documents
            </button>
            <button
              onClick={() => setFilterType('image')}
              className={`px-2 py-0.5 rounded-[4px] font-medium whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                filterType === 'image' ? 'bg-[#221E18] text-[#FAF6EE]' : 'bg-[#FAF6EE] text-[#7A705F] hover:text-[#221E18]'
              }`}
            >
              <ImageIcon size={11} /> Images
            </button>
            <button
              onClick={() => setFilterType('web-link')}
              className={`px-2 py-0.5 rounded-[4px] font-medium whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                filterType === 'web-link' ? 'bg-[#221E18] text-[#FAF6EE]' : 'bg-[#FAF6EE] text-[#7A705F] hover:text-[#221E18]'
              }`}
            >
              <Globe size={11} /> Web
            </button>
          </div>

          {/* Tags cloud filter */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto text-[11px] pt-1">
              <span className="text-[#7A705F] shrink-0 font-mono">Tags:</span>
              {selectedTag && (
                <button
                  onClick={() => setSelectedTag(null)}
                  className="px-1.5 py-0.5 rounded bg-[#221E18] text-[#FAF6EE] font-mono shrink-0 cursor-pointer"
                >
                  Clear Tag ×
                </button>
              )}
              {allTags.slice(0, 6).map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`px-1.5 py-0.5 rounded border border-[rgba(34,30,24,0.1)] shrink-0 cursor-pointer ${
                    selectedTag === tag ? 'bg-[#DE6346] text-white' : 'bg-[#FAF6EE] text-[#7A705F] hover:text-[#221E18]'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[rgba(34,30,24,0.06)]">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#7A705F]">
              No research media found matching filters.
            </div>
          ) : (
            filteredItems.map((item) => {
              const isSelected = activeItem?.id === item.id;
              const isPinned = isPinnedToActiveScene(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={`p-3 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-white border-l-3 border-[#DE6346] shadow-2xs'
                      : 'hover:bg-[#F1EAD9]/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-[4px] bg-[#FAF6EE] text-[#221E18] border border-[rgba(34,30,24,0.08)]">
                        {item.type === 'audio' && <FileAudio size={14} className="text-amber-700" />}
                        {item.type === 'pdf' && <FileText size={14} className="text-blue-700" />}
                        {item.type === 'image' && <ImageIcon size={14} className="text-emerald-700" />}
                        {item.type === 'web-link' && <Globe size={14} className="text-purple-700" />}
                      </div>
                      <span className="font-semibold text-xs text-[#221E18] line-clamp-1">
                        {item.title}
                      </span>
                    </div>

                    {isPinned && (
                      <span className="text-[10px] text-[#DE6346] flex items-center gap-0.5" title="Pinned to current scene">
                        <Bookmark size={11} className="fill-[#DE6346]" />
                      </span>
                    )}
                  </div>

                  {item.description && (
                    <p className="text-[11px] text-[#7A705F] line-clamp-2 mt-1">
                      {item.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-2 text-[10px] text-[#7A705F]">
                    <div className="flex items-center gap-1">
                      {item.tags.slice(0, 2).map((t) => (
                        <span key={t} className="px-1 py-0.5 rounded bg-[#FAF6EE] border border-[rgba(34,30,24,0.08)]">
                          {t}
                        </span>
                      ))}
                    </div>
                    {item.fileSize && <span className="font-mono">{item.fileSize}</span>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PREVIEW & INSPECTOR CANVAS */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {activeItem ? (
          <>
            {/* Top Toolbar */}
            <div className="px-6 py-3 border-b border-[rgba(34,30,24,0.12)] bg-[#FAF6EE] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-[#F1EAD9] text-[#7A705F] border border-[rgba(34,30,24,0.1)]">
                  {activeItem.type}
                </span>
                <h2 className="text-sm font-serif font-bold text-[#221E18]">
                  {activeItem.title}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                {activeScene && (
                  <button
                    onClick={() => handlePinItem(activeItem)}
                    className={`px-3 py-1 text-xs rounded-[5px] font-medium border flex items-center gap-1.5 cursor-pointer transition-colors ${
                      isPinnedToActiveScene(activeItem.id)
                        ? 'bg-[#FAF6EE] text-[#DE6346] border-[#DE6346]'
                        : 'bg-white text-[#221E18] border-[rgba(34,30,24,0.14)] hover:bg-[#FAF6EE]'
                    }`}
                  >
                    <Bookmark size={12} className={isPinnedToActiveScene(activeItem.id) ? 'fill-[#DE6346]' : ''} />
                    <span>{isPinnedToActiveScene(activeItem.id) ? 'Pinned to Active Scene' : 'Pin to Active Scene'}</span>
                  </button>
                )}

                {activeItem.url && (
                  <a
                    href={activeItem.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-[5px] text-[#7A705F] hover:text-[#221E18] border border-[rgba(34,30,24,0.14)] bg-white hover:bg-[#FAF6EE]"
                    title="Open external source"
                  >
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>
            </div>

            {/* Media Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* 1. AUDIO PLAYER & TRANSCRIPTION */}
              {activeItem.type === 'audio' && (
                <div className="space-y-4">
                  {activeItem.url && (
                    <audio
                      ref={audioRef}
                      src={activeItem.url}
                      onTimeUpdate={() => {
                        if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
                      }}
                      onLoadedMetadata={() => {
                        if (audioRef.current) setDuration(audioRef.current.duration || 60);
                      }}
                      onEnded={() => setIsPlaying(false)}
                    />
                  )}

                  {/* Media Audio Console */}
                  <div className="p-5 rounded-[8px] bg-[#FAF6EE] border border-[rgba(34,30,24,0.14)] shadow-2xs">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#221E18] text-[#FAF6EE] flex items-center justify-center">
                          <Music size={16} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#221E18]">{activeItem.title}</div>
                          <div className="text-[11px] text-[#7A705F]">Acoustic Reference Track</div>
                        </div>
                      </div>

                      {/* Speed Buttons */}
                      <div className="flex items-center gap-1 bg-white border border-[rgba(34,30,24,0.12)] rounded p-0.5 text-xs font-mono">
                        {[0.75, 1, 1.25, 1.5].map((rate) => (
                          <button
                            key={rate}
                            onClick={() => handleChangePlaybackRate(rate)}
                            className={`px-1.5 py-0.5 rounded cursor-pointer ${
                              playbackRate === rate ? 'bg-[#221E18] text-[#FAF6EE]' : 'text-[#7A705F]'
                            }`}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Progress Slider */}
                    <div className="space-y-1 mb-4">
                      <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        value={currentTime}
                        onChange={(e) => handleSeekAudio(Number(e.target.value))}
                        className="w-full accent-[#DE6346] cursor-pointer"
                      />
                      <div className="flex justify-between text-[11px] font-mono text-[#7A705F]">
                        <span>{formatSeconds(currentTime)}</span>
                        <span>{formatSeconds(duration || 60)}</span>
                      </div>
                    </div>

                    {/* Playback Controls */}
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={() => handleJumpAudio(-5)}
                        className="p-2 rounded-full hover:bg-[#EBE5D8] text-[#7A705F] hover:text-[#221E18] cursor-pointer"
                        title="Rewind 5 seconds"
                      >
                        <RotateCcw size={16} />
                      </button>

                      <button
                        onClick={togglePlayAudio}
                        className="w-12 h-12 rounded-full bg-[#221E18] text-[#FAF6EE] flex items-center justify-center hover:bg-black cursor-pointer shadow-warm-subtle"
                      >
                        {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                      </button>

                      <button
                        onClick={() => handleJumpAudio(5)}
                        className="p-2 rounded-full hover:bg-[#EBE5D8] text-[#7A705F] hover:text-[#221E18] cursor-pointer"
                        title="Forward 5 seconds"
                      >
                        <RotateCw size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Interactive Timecoded Transcriptions */}
                  {activeItem.transcriptions && activeItem.transcriptions.length > 0 && (
                    <div className="border border-[rgba(34,30,24,0.12)] rounded-[8px] overflow-hidden bg-white">
                      <div className="px-4 py-2.5 bg-[#F1EAD9] text-xs font-mono font-bold uppercase text-[#7A705F] border-b border-[rgba(34,30,24,0.1)] flex items-center justify-between">
                        <span>Timecoded Field Transcriptions</span>
                        <span className="text-[10px] lowercase text-[#7A705F]">click timestamp to jump audio</span>
                      </div>
                      <div className="divide-y divide-[rgba(34,30,24,0.06)] text-xs">
                        {activeItem.transcriptions.map((t, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleSeekAudio(t.time)}
                            className={`p-3 flex items-start gap-3 hover:bg-[#FAF6EE] cursor-pointer transition-colors ${
                              Math.abs(currentTime - t.time) < 4 ? 'bg-[#F1EAD9]/80 border-l-3 border-[#DE6346]' : ''
                            }`}
                          >
                            <span className="px-2 py-0.5 rounded font-mono font-semibold bg-[#221E18] text-[#FAF6EE] text-[11px] shrink-0">
                              {formatSeconds(t.time)}
                            </span>
                            <span className="text-[#221E18] leading-relaxed flex-1">
                              {t.note}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 2. PDF & DOCUMENT VIEWER */}
              {activeItem.type === 'pdf' && (
                <div className="space-y-4">
                  {activeItem.url && (activeItem.url.startsWith('data:application/pdf') || activeItem.url.toLowerCase().endsWith('.pdf')) ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2.5 rounded-[6px] bg-[#FAF6EE] border border-[rgba(34,30,24,0.1)] text-xs">
                        <div className="flex items-center gap-2">
                          <FileText size={14} className="text-[#DE6346]" />
                          <span className="font-semibold text-[#221E18]">{activeItem.title}</span>
                          {activeItem.fileSize && (
                            <span className="font-mono text-[10px] text-[#7A705F]">({activeItem.fileSize})</span>
                          )}
                        </div>
                        <a
                          href={activeItem.url}
                          download={`${activeItem.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-[rgba(34,30,24,0.12)] text-[#221E18] text-xs font-medium hover:bg-[#FAF6EE] transition-colors"
                        >
                          <ExternalLink size={12} />
                          <span>Open / Download PDF</span>
                        </a>
                      </div>
                      <div className="rounded-[8px] overflow-hidden border border-[rgba(34,30,24,0.14)] bg-white h-[650px] shadow-2xs">
                        <iframe
                          src={activeItem.url}
                          title={activeItem.title}
                          className="w-full h-full border-0"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Zoom controls */}
                      <div className="flex items-center justify-between p-2.5 rounded-[6px] bg-[#FAF6EE] border border-[rgba(34,30,24,0.1)] text-xs">
                        <span className="font-mono text-[#7A705F]">Archival Document Reader</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPdfZoom(Math.max(60, pdfZoom - 15))}
                            className="p-1 rounded hover:bg-white text-[#7A705F] cursor-pointer"
                            title="Zoom out"
                          >
                            <ZoomOut size={14} />
                          </button>
                          <span className="font-mono text-[11px] w-12 text-center">{pdfZoom}%</span>
                          <button
                            onClick={() => setPdfZoom(Math.min(160, pdfZoom + 15))}
                            className="p-1 rounded hover:bg-white text-[#7A705F] cursor-pointer"
                            title="Zoom in"
                          >
                            <ZoomIn size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Simulated High-Grade Historical PDF Page */}
                      <div className="flex justify-center bg-[#525659] p-6 rounded-[8px] overflow-x-auto">
                        <div
                          className="bg-white shadow-2xl p-10 font-serif text-stone-900 border border-stone-300 transition-all duration-200"
                          style={{
                            width: `${Math.round(620 * (pdfZoom / 100))}px`,
                            minHeight: `${Math.round(800 * (pdfZoom / 100))}px`,
                            fontSize: `${Math.round(13 * (pdfZoom / 100))}px`
                          }}
                        >
                          <div className="text-center border-b border-stone-300 pb-4 mb-6">
                            <span className="text-[10px] font-mono tracking-widest uppercase text-stone-500 block mb-1">
                              Imperial Horological Registry • Prague Archives • 1892
                            </span>
                            <h3 className="text-lg font-bold tracking-tight">
                              GUILD CHARTER ON REVERSE ESCAPEMENTS &amp; TERNARY ALLOYS
                            </h3>
                            <p className="text-xs italic text-stone-600 mt-1">
                              Declassified Under Ordinance 44-B • Certified Metallurgy Assay
                            </p>
                          </div>

                          <div className="space-y-4 leading-relaxed text-justify">
                            <p>
                              <strong>ARTICLE IV (Metallurgical Prohibitions).</strong> No guild artisan, journeyman, or apprentice within the jurisdiction of the Upper and Lower Towns shall temper or cast clockwork gears incorporating antimony exceeding two parts per thousand, nor shall copper be annealed with quicksilver baths.
                            </p>
                            <p>
                              <strong>ARTICLE V (Astronomical Escapements).</strong> The central crown wheel of any public timepiece exceeding fifty cubits elevation must adhere strictly to forward solar progression. Any counter-wheel fashioned to unwind backwards past the solar equinox shall be seized immediately by the Grand Censor, and its creator remanded to the Citadel vaults.
                            </p>
                            <div className="p-3 my-4 bg-amber-50/60 border-l-2 border-amber-600 text-xs italic font-sans text-stone-800">
                              Researcher Annotation: Notice how Julian Croft’s father personally melted down the 1844 stamps. Any newly discovered sphere containing this alloy is prima facie evidence of an active, illicit guild furnace operating under Prague.
                            </div>
                          </div>

                          <div className="mt-12 pt-4 border-t border-stone-200 flex justify-between text-[10px] font-mono text-stone-400">
                            <span>Page 14 of 48</span>
                            <span>Archival Seal #881-Bohemia</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* 3. IMAGE & MOODBOARD GALLERY */}
              {activeItem.type === 'image' && (
                <div className="space-y-4">
                  {activeItem.url ? (
                    <div className="rounded-[8px] overflow-hidden border border-[rgba(34,30,24,0.14)] bg-[#FAF6EE]">
                      <img
                        src={activeItem.url}
                        alt={activeItem.title}
                        className="w-full max-h-[500px] object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="h-64 rounded-[8px] bg-[#FAF6EE] flex items-center justify-center text-xs text-[#7A705F]">
                      No image preview URL provided
                    </div>
                  )}

                  {/* Visual Color Palette Chips */}
                  <div className="p-4 rounded-[8px] bg-[#FAF6EE] border border-[rgba(34,30,24,0.1)]">
                    <h4 className="text-xs font-mono uppercase text-[#7A705F] mb-2 font-bold">
                      Extracted Atmosphere Palette
                    </h4>
                    <div className="flex items-center gap-2">
                      {['#221E18', '#DE6346', '#7A705F', '#D97706', '#2E7D32'].map((color) => (
                        <div key={color} className="flex items-center gap-1.5 bg-white p-1 rounded border border-[rgba(34,30,24,0.08)]">
                          <div className="w-5 h-5 rounded-[3px]" style={{ backgroundColor: color }} />
                          <span className="text-[10px] font-mono text-[#7A705F] pr-1">{color}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 4. WEB SNIPPETS / GENERAL NOTES */}
              {activeItem.type === 'web-link' && (
                <div className="p-4 rounded-[8px] bg-[#FAF6EE] border border-[rgba(34,30,24,0.1)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-[#7A705F]">Web Citation Source</span>
                    {activeItem.url && (
                      <a
                        href={activeItem.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#DE6346] flex items-center gap-1 underline font-medium"
                      >
                        Visit Original Web Archive <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-[#221E18] leading-relaxed">
                    {activeItem.description}
                  </p>
                </div>
              )}

              {/* RESEARCH NOTES SECTION */}
              <div className="p-4 rounded-[8px] bg-[#F8F4EC] border border-[rgba(34,30,24,0.1)] space-y-2">
                <h4 className="text-xs font-mono uppercase text-[#7A705F] font-bold">
                  Author Field Notes &amp; Story Relevance
                </h4>
                <p className="text-xs text-[#221E18] leading-relaxed whitespace-pre-wrap">
                  {activeItem.notes || activeItem.description || 'No specific field notes recorded yet.'}
                </p>
              </div>

              {/* ASSOCIATED STORY CHAPTERS & CHARACTERS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-[6px] bg-[#FAF6EE] border border-[rgba(34,30,24,0.08)]">
                  <span className="text-[10px] font-mono uppercase text-[#7A705F] block mb-1">
                    Linked Story Scenes
                  </span>
                  {activeItem.linkedSceneIds && activeItem.linkedSceneIds.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {activeItem.linkedSceneIds.map((sid) => {
                        const sceneObj = allScenes.find((s) => s.id === sid);
                        return (
                          <button
                            key={sid}
                            onClick={() => onNavigateToScene && onNavigateToScene(sid)}
                            className="px-2 py-0.5 rounded bg-white border border-[rgba(34,30,24,0.12)] text-[#221E18] hover:border-[#DE6346] cursor-pointer"
                          >
                            {sceneObj ? sceneObj.title : sid}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-[#7A705F] italic">None linked</span>
                  )}
                </div>

                <div className="p-3 rounded-[6px] bg-[#FAF6EE] border border-[rgba(34,30,24,0.08)]">
                  <span className="text-[10px] font-mono uppercase text-[#7A705F] block mb-1">
                    Linked Codex Lore
                  </span>
                  {activeItem.linkedEntityIds && activeItem.linkedEntityIds.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {activeItem.linkedEntityIds.map((eid) => {
                        const entObj = entities.find((e) => e.id === eid);
                        return (
                          <span
                            key={eid}
                            className="px-2 py-0.5 rounded bg-white border border-[rgba(34,30,24,0.12)] text-[#221E18]"
                          >
                            {entObj ? entObj.name : eid}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-[#7A705F] italic">None linked</span>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-xs text-[#7A705F]">
            <FolderArchive size={32} className="mb-2 text-[#7A705F]/40" />
            <p>Select a research media item from the left drawer or create a new one.</p>
          </div>
        )}
      </div>

      {/* ADD NEW ITEM MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-[#FAF6EE] rounded-[10px] border border-[rgba(34,30,24,0.14)] shadow-warm-modal overflow-hidden text-[#221E18]">
            <div className="px-5 py-3.5 bg-[#F1EAD9] border-b border-[rgba(34,30,24,0.12)] flex items-center justify-between">
              <h3 className="text-sm font-serif font-bold text-[#221E18]">
                Add Multi-Media Research Item
              </h3>
              <button
                onClick={closeAddModal}
                className="p-1 rounded text-[#7A705F] hover:text-[#221E18] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateNewItem} className="p-5 space-y-3.5 text-xs">
              {/* Hidden file input for file picker */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,audio/*,application/pdf,.pdf,.doc,.docx,.txt,.md,.rtf,.json,.csv"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <div>
                <label className="block font-medium text-[#221E18] mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bohemian Guild Clocktower Blueprint"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-white border border-[rgba(34,30,24,0.14)] focus:outline-none focus:border-[#221E18]"
                />
              </div>

              {/* Source Mode Toggle: Local File Picker vs Web Link */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-medium text-[#221E18]">Media Source</label>
                  <div className="flex items-center gap-1 p-0.5 bg-[#F1EAD9] rounded-[6px] border border-[rgba(34,30,24,0.1)] text-[11px]">
                    <button
                      type="button"
                      onClick={() => setSourceMode('file')}
                      className={`px-2.5 py-1 rounded-[4px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                        sourceMode === 'file'
                          ? 'bg-white text-[#221E18] shadow-2xs font-semibold'
                          : 'text-[#7A705F] hover:text-[#221E18]'
                      }`}
                    >
                      <UploadCloud size={12} className={sourceMode === 'file' ? 'text-[#DE6346]' : ''} />
                      <span>Local File</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSourceMode('url')}
                      className={`px-2.5 py-1 rounded-[4px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                        sourceMode === 'url'
                          ? 'bg-white text-[#221E18] shadow-2xs font-semibold'
                          : 'text-[#7A705F] hover:text-[#221E18]'
                      }`}
                    >
                      <Globe size={12} className={sourceMode === 'url' ? 'text-[#DE6346]' : ''} />
                      <span>Web URL</span>
                    </button>
                  </div>
                </div>

                {/* Local File Picker Dropzone & Selected Card */}
                {sourceMode === 'file' && (
                  <div>
                    {selectedFileObj ? (
                      <div className="p-3 bg-white border border-[rgba(34,30,24,0.14)] rounded-[8px] flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {selectedFileObj.type === 'image' && selectedFileObj.dataUrl ? (
                            <img
                              src={selectedFileObj.dataUrl}
                              alt={selectedFileObj.name}
                              className="w-10 h-10 rounded object-cover border border-[rgba(34,30,24,0.1)] shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-[#F1EAD9] flex items-center justify-center text-[#221E18] shrink-0">
                              {selectedFileObj.type === 'audio' ? (
                                <FileAudio size={18} className="text-[#DE6346]" />
                              ) : selectedFileObj.type === 'pdf' ? (
                                <FileText size={18} className="text-blue-700" />
                              ) : (
                                <Paperclip size={18} className="text-[#7A705F]" />
                              )}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-[#221E18] truncate max-w-[220px]">
                              {selectedFileObj.name}
                            </div>
                            <div className="text-[11px] font-mono text-[#7A705F] flex items-center gap-1.5 mt-0.5">
                              <span className="px-1.5 py-0.2 rounded bg-[#FAF6EE] border border-[rgba(34,30,24,0.08)] text-[10px]">
                                {selectedFileObj.sizeFormatted}
                              </span>
                              <span>· Local file loaded</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-2.5 py-1 rounded bg-[#F1EAD9] hover:bg-[#EAE2D1] text-[#221E18] text-[11px] font-medium cursor-pointer"
                          >
                            Replace
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveFile}
                            className="p-1 rounded text-[#7A705F] hover:text-red-700 hover:bg-red-50 cursor-pointer"
                            title="Remove file"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-4 rounded-[8px] border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1.5 ${
                          isDragging
                            ? 'border-[#DE6346] bg-[#FAF6EE] scale-[1.01]'
                            : 'border-[rgba(34,30,24,0.18)] hover:border-[#DE6346] bg-white/60 hover:bg-white'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-full bg-[#FAF6EE] border border-[rgba(34,30,24,0.1)] flex items-center justify-center text-[#DE6346]">
                          <UploadCloud size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-[#221E18]">
                            Choose a local file or drag &amp; drop here
                          </p>
                          <p className="text-[11px] text-[#7A705F] mt-0.5">
                            Images (PNG, JPG, WebP), Audio (MP3, WAV), PDF documents, or notes
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="mt-1 px-3 py-1 rounded bg-[#221E18] text-[#FAF6EE] text-[11px] font-medium hover:bg-black transition-colors cursor-pointer shadow-2xs inline-flex items-center gap-1.5"
                        >
                          <Paperclip size={12} />
                          <span>Browse Files</span>
                        </button>
                      </div>
                    )}

                    {fileError && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs flex items-center gap-2">
                        <AlertCircle size={14} className="shrink-0" />
                        <span>{fileError}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* External URL Mode */}
                {sourceMode === 'url' && (
                  <div>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      className="w-full px-3 py-1.5 rounded bg-white border border-[rgba(34,30,24,0.14)] focus:outline-none focus:border-[#221E18]"
                    />
                    <span className="text-[10px] text-[#7A705F] mt-1 block">
                      Paste a direct URL for an online image, audio stream, PDF archive, or article link.
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#221E18] mb-1">Media Category</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded bg-white border border-[rgba(34,30,24,0.14)] focus:outline-none focus:border-[#221E18]"
                  >
                    <option value="image">Image / Moodboard</option>
                    <option value="audio">Audio / Interview Recording</option>
                    <option value="pdf">PDF / Historical Document</option>
                    <option value="web-link">Web Clip / Article Archive</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-[#221E18] mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Metallurgy, Prague, Archive"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-white border border-[rgba(34,30,24,0.14)] focus:outline-none focus:border-[#221E18]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#221E18] mb-1">Description / Synopsis</label>
                <textarea
                  rows={2}
                  placeholder="Brief synopsis of what this media documents..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-white border border-[rgba(34,30,24,0.14)] focus:outline-none focus:border-[#221E18]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#221E18] mb-1">Author Notes &amp; Story Relevance</label>
                <textarea
                  rows={3}
                  placeholder="Detailed notes on how to use this reference in upcoming chapters..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-white border border-[rgba(34,30,24,0.14)] focus:outline-none focus:border-[#221E18]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[rgba(34,30,24,0.1)]">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="px-3 py-1.5 rounded border border-[rgba(34,30,24,0.14)] bg-white hover:bg-[#FAF6EE] text-[#7A705F] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#221E18] text-[#FAF6EE] font-medium hover:bg-black cursor-pointer shadow-2xs"
                >
                  Save to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
