import React, { useState } from 'react';
import { Scene, Entity, Chapter, DocumentBookmark, ResearchVaultItem } from '../../types';
import {
  Sliders,
  BookOpen,
  Layers,
  Plus,
  Check,
  Compass,
  Scissors,
  History,
  Tag,
  Bookmark,
  ExternalLink,
  Trash2,
  Clapperboard,
  FileText,
  FolderArchive,
  Link2
} from 'lucide-react';
import { SceneVersionHistoryTab } from './SceneVersionHistoryTab';
import { INITIAL_PROJECT_LABELS } from '../../data/initialData';

interface SceneMetadataPanelProps {
  scene: Scene;
  sceneEntities: Entity[];
  chapters?: Chapter[];
  allScenes?: Scene[];
  researchVault?: ResearchVaultItem[];
  onUpdateScene: (updatedFields: Partial<Scene>) => void;
  onCreateChapter?: (chapter: Chapter) => void;
  onNavigateToScene?: (sceneId: string) => void;
  onOpenResearchItem?: (itemId: string) => void;
  onOpenCodexEntity?: (entityId: string) => void;
  activeTab?: 'facts' | 'history' | 'bookmarks';
  onTabChange?: (tab: 'facts' | 'history' | 'bookmarks') => void;
}

const PRESET_STATUS_TINTS = [
  'First Draft',
  'In Progress',
  'Revised',
  'Needs Continuity Check',
  'Locked / Approved',
  'Proofread Ready'
];

export const SceneMetadataPanel: React.FC<SceneMetadataPanelProps> = ({
  scene,
  sceneEntities,
  chapters = [],
  allScenes = [],
  researchVault = [],
  onUpdateScene,
  onCreateChapter,
  onNavigateToScene,
  onOpenResearchItem,
  onOpenCodexEntity,
  activeTab: controlledTab,
  onTabChange
}) => {
  const [internalTab, setInternalTab] = useState<'facts' | 'history' | 'bookmarks'>('facts');
  const activeTab = controlledTab !== undefined ? controlledTab : internalTab;

  const handleTabClick = (tab: 'facts' | 'history' | 'bookmarks') => {
    setInternalTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const [isCreatingChapter, setIsCreatingChapter] = useState(false);
  const [newChapTitle, setNewChapTitle] = useState('');
  const [newChapPhase, setNewChapPhase] = useState('');

  // New bookmark creation modal/form
  const [isAddingBookmark, setIsAddingBookmark] = useState(false);
  const [bookmarkType, setBookmarkType] = useState<'scene' | 'entity' | 'research'>('scene');
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [bookmarkNote, setBookmarkNote] = useState('');

  const versionCount = (scene.versions || []).length;
  const bookmarkCount = (scene.bookmarks || []).length;

  const handleSelectChapter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__new__') {
      setIsCreatingChapter(true);
      return;
    }
    if (!val) {
      onUpdateScene({
        chapterId: undefined,
        chapterNumber: undefined,
        chapterTitle: undefined
      });
      return;
    }
    const found = chapters.find((c) => c.id === val);
    if (found) {
      onUpdateScene({
        chapterId: found.id,
        chapterNumber: found.number,
        chapterTitle: found.title,
        actOrPhase: found.actOrPhase
      });
    }
  };

  const handleCreateNewChapterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapTitle.trim()) return;

    const nextNum = chapters.length > 0 ? Math.max(...chapters.map((c) => c.number)) + 1 : 1;
    const newChap: Chapter = {
      id: 'chap-' + Date.now(),
      number: nextNum,
      title: newChapTitle.trim(),
      actOrPhase: newChapPhase.trim() || scene.actOrPhase || 'Act I: Setup',
      sceneIds: [scene.id]
    };

    if (onCreateChapter) {
      onCreateChapter(newChap);
    }

    onUpdateScene({
      chapterId: newChap.id,
      chapterNumber: newChap.number,
      chapterTitle: newChap.title,
      actOrPhase: newChap.actOrPhase
    });

    setNewChapTitle('');
    setNewChapPhase('');
    setIsCreatingChapter(false);
  };

  const handleAddBookmark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTargetId) return;

    let title = 'Reference';
    if (bookmarkType === 'scene') {
      const target = allScenes.find((s) => s.id === selectedTargetId);
      title = target ? `Scene: ${target.title}` : 'Linked Scene';
    } else if (bookmarkType === 'entity') {
      const target = sceneEntities.find((ent) => ent.id === selectedTargetId);
      title = target ? `Codex: ${target.name}` : 'Linked Codex Entry';
    } else if (bookmarkType === 'research') {
      const target = researchVault.find((r) => r.id === selectedTargetId);
      title = target ? `Vault: ${target.title}` : 'Research Item';
    }

    const newBookmark: DocumentBookmark = {
      id: 'bm-' + Date.now(),
      type: bookmarkType,
      targetId: selectedTargetId,
      title,
      note: bookmarkNote.trim(),
      pinnedAt: new Date().toISOString()
    };

    const currentBookmarks = scene.bookmarks || [];
    onUpdateScene({
      bookmarks: [...currentBookmarks, newBookmark]
    });

    setIsAddingBookmark(false);
    setSelectedTargetId('');
    setBookmarkNote('');
  };

  const handleRemoveBookmark = (bmId: string) => {
    const currentBookmarks = scene.bookmarks || [];
    onUpdateScene({
      bookmarks: currentBookmarks.filter((b) => b.id !== bmId)
    });
  };

  return (
    <aside className="w-full h-full max-h-full min-h-0 border-l border-[rgba(34,30,24,0.12)] bg-[#FAF6EE] flex flex-col shrink-0 select-none text-xs">
      {/* 3-Tab Switcher */}
      <div className="flex items-center border-b border-[rgba(34,30,24,0.12)] bg-[#F1EAD9] p-1 gap-1 shrink-0">
        <button
          onClick={() => handleTabClick('facts')}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-[5px] text-[11px] font-medium transition-colors cursor-pointer ${
            activeTab === 'facts'
              ? 'bg-[#FAF6EE] text-[#221E18] shadow-xs font-semibold'
              : 'text-[#7A705F] hover:text-[#221E18] hover:bg-[#FAF6EE]/50'
          }`}
          title="Facts, Structure & Labels"
        >
          <BookOpen size={11} className={activeTab === 'facts' ? 'text-[#35505F]' : ''} />
          <span>Structure</span>
        </button>

        <button
          onClick={() => handleTabClick('bookmarks')}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-[5px] text-[11px] font-medium transition-colors cursor-pointer ${
            activeTab === 'bookmarks'
              ? 'bg-[#FAF6EE] text-[#221E18] shadow-xs font-semibold'
              : 'text-[#7A705F] hover:text-[#221E18] hover:bg-[#FAF6EE]/50'
          }`}
          title="Bookmarks & Linked References"
        >
          <Bookmark size={11} className={activeTab === 'bookmarks' ? 'text-[#DE6346]' : ''} />
          <span>Bookmarks</span>
          {bookmarkCount > 0 && (
            <span className="px-1 py-0.2 rounded-full bg-[#DE6346] text-white text-[8px] font-mono font-bold leading-none">
              {bookmarkCount}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabClick('history')}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-[5px] text-[11px] font-medium transition-colors cursor-pointer ${
            activeTab === 'history'
              ? 'bg-[#FAF6EE] text-[#221E18] shadow-xs font-semibold'
              : 'text-[#7A705F] hover:text-[#221E18] hover:bg-[#FAF6EE]/50'
          }`}
          title="Scene Revision History"
        >
          <History size={11} className={activeTab === 'history' ? 'text-[#B54B32]' : ''} />
          <span>History</span>
          {versionCount > 0 && (
            <span className="px-1 py-0.2 rounded-full bg-[#B54B32] text-[#FAF6EE] text-[8px] font-mono font-bold leading-none">
              {versionCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content Area */}
      {activeTab === 'history' ? (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <SceneVersionHistoryTab scene={scene} onUpdateScene={onUpdateScene} />
        </div>
      ) : activeTab === 'bookmarks' ? (
        /* BOOKMARKS & WIKILINKS TAB */
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[#221E18] font-serif font-bold text-xs">
              <Bookmark size={13} className="text-[#DE6346]" />
              <span>Document Bookmarks</span>
            </div>
            <button
              onClick={() => setIsAddingBookmark(true)}
              className="px-2 py-1 rounded bg-[#F1EAD9] hover:bg-[#EAE2D1] text-[#221E18] text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors border border-[rgba(34,30,24,0.1)]"
            >
              <Plus size={11} className="text-[#DE6346]" />
              <span>Pin Reference</span>
            </button>
          </div>

          <p className="text-[11px] text-[#7A705F] leading-relaxed">
            Pin companion scenes, lore codex entries, or research media for quick side-by-side access while drafting this scene.
          </p>

          {/* Add Bookmark Modal / Dropdown Box */}
          {isAddingBookmark && (
            <form
              onSubmit={handleAddBookmark}
              className="p-3 bg-white rounded-[6px] border border-[rgba(34,30,24,0.15)] space-y-2.5 shadow-sm"
            >
              <div className="text-xs font-bold text-[#221E18]">Pin New Reference</div>

              {/* Bookmark Type Switcher */}
              <div className="grid grid-cols-3 gap-1 bg-[#F1EAD9] p-0.5 rounded">
                {(['scene', 'entity', 'research'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setBookmarkType(t);
                      setSelectedTargetId('');
                    }}
                    className={`py-1 text-[10px] font-mono capitalize rounded cursor-pointer ${
                      bookmarkType === t
                        ? 'bg-white font-bold text-[#221E18] shadow-2xs'
                        : 'text-[#7A705F]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Target Picker */}
              <div>
                <label className="block text-[10px] text-[#7A705F] mb-1">
                  Select {bookmarkType === 'scene' ? 'Scene' : bookmarkType === 'entity' ? 'Codex Entity' : 'Research File'}
                </label>
                <select
                  value={selectedTargetId}
                  onChange={(e) => setSelectedTargetId(e.target.value)}
                  className="w-full p-1.5 bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded text-xs text-[#221E18] focus:outline-none"
                  required
                >
                  <option value="">-- Choose item --</option>
                  {bookmarkType === 'scene' &&
                    allScenes
                      .filter((s) => s.id !== scene.id)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.order}. {s.title}
                        </option>
                      ))}
                  {bookmarkType === 'entity' &&
                    sceneEntities.map((ent) => (
                      <option key={ent.id} value={ent.id}>
                        {ent.name} ({ent.type})
                      </option>
                    ))}
                  {bookmarkType === 'research' &&
                    researchVault.map((r) => (
                      <option key={r.id} value={r.id}>
                        [{r.type.toUpperCase()}] {r.title}
                      </option>
                    ))}
                </select>
              </div>

              {/* Optional note */}
              <div>
                <label className="block text-[10px] text-[#7A705F] mb-1">Author's Note / Context</label>
                <input
                  type="text"
                  placeholder="e.g. Silas recalls this key dialogue..."
                  value={bookmarkNote}
                  onChange={(e) => setBookmarkNote(e.target.value)}
                  className="w-full p-1.5 bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded text-xs text-[#221E18] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingBookmark(false)}
                  className="px-2 py-1 text-[11px] text-[#7A705F] hover:text-[#221E18]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedTargetId}
                  className="px-3 py-1 text-[11px] font-semibold bg-[#221E18] text-white rounded hover:bg-black disabled:opacity-50"
                >
                  Pin Bookmark
                </button>
              </div>
            </form>
          )}

          {/* Bookmarks List */}
          <div className="space-y-2">
            {(!scene.bookmarks || scene.bookmarks.length === 0) ? (
              <div className="p-4 rounded-[6px] border border-dashed border-[rgba(34,30,24,0.16)] text-center text-[#7A705F] italic text-[11px]">
                No bookmarks pinned to this scene yet. Click "Pin Reference" above or type [[wikilinks]] in your prose.
              </div>
            ) : (
              scene.bookmarks.map((bm) => (
                <div
                  key={bm.id}
                  className="p-2.5 rounded-[6px] border border-[rgba(34,30,24,0.12)] bg-white space-y-1 shadow-xs hover:border-[#DE6346]/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#F1EAD9] text-[#7A705F]">
                      {bm.type}
                    </span>
                    <button
                      onClick={() => handleRemoveBookmark(bm.id)}
                      className="text-[#7A705F] hover:text-red-600 p-0.5 rounded cursor-pointer"
                      title="Unpin bookmark"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>

                  <div className="font-serif font-bold text-xs text-[#221E18] flex items-center justify-between pt-0.5">
                    <span className="truncate">{bm.title}</span>
                    {bm.type === 'scene' && onNavigateToScene && (
                      <button
                        onClick={() => onNavigateToScene(bm.targetId)}
                        className="text-[#DE6346] hover:underline text-[10px] font-sans font-medium flex items-center gap-0.5 shrink-0 ml-1"
                      >
                        <span>Open</span>
                        <ExternalLink size={10} />
                      </button>
                    )}
                    {bm.type === 'research' && onOpenResearchItem && (
                      <button
                        onClick={() => onOpenResearchItem(bm.targetId)}
                        className="text-[#DE6346] hover:underline text-[10px] font-sans font-medium flex items-center gap-0.5 shrink-0 ml-1"
                      >
                        <span>View</span>
                        <ExternalLink size={10} />
                      </button>
                    )}
                    {bm.type === 'entity' && onOpenCodexEntity && (
                      <button
                        onClick={() => onOpenCodexEntity(bm.targetId)}
                        className="text-[#DE6346] hover:underline text-[10px] font-sans font-medium flex items-center gap-0.5 shrink-0 ml-1"
                      >
                        <span>Inspect</span>
                        <ExternalLink size={10} />
                      </button>
                    )}
                  </div>

                  {bm.note && (
                    <p className="text-[11px] text-[#7A705F] italic pt-0.5 line-clamp-2">
                      "{bm.note}"
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* FACTS & STRUCTURE TAB */
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-subtle flex flex-col">
          {/* VISUAL LABEL & STATUS TINT SECTION */}
          <div className="p-4 border-b border-[rgba(34,30,24,0.12)] bg-[#FAF6EE] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Tag size={12} className="text-[#DE6346]" />
                <h3 className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#7A705F]">
                  Visual Label &amp; Status
                </h3>
              </div>
              {scene.editorMode && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded uppercase bg-[#221E18] text-white">
                  {scene.editorMode}
                </span>
              )}
            </div>

            {/* Label Selector */}
            <div>
              <label className="block text-[#7A705F] text-[10px] font-medium mb-1">
                Visual Label (POV / Arc / Plot)
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {INITIAL_PROJECT_LABELS.map((lbl) => {
                  const isSelected = scene.labelColor === lbl.color;
                  return (
                    <button
                      key={lbl.id}
                      type="button"
                      onClick={() =>
                        onUpdateScene({
                          labelColor: lbl.color,
                          labelName: lbl.name
                        })
                      }
                      className={`flex items-center gap-1.5 p-1.5 rounded-[5px] border text-left cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-[#221E18] bg-white shadow-2xs font-semibold'
                          : 'border-[rgba(34,30,24,0.1)] bg-[#F1EAD9]/60 hover:bg-[#F1EAD9]'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: lbl.color }}
                      />
                      <span className="truncate text-[10px] text-[#221E18]">{lbl.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status Tint Selector */}
            <div>
              <label className="block text-[#7A705F] text-[10px] font-medium mb-1">
                Manuscript Status Tint
              </label>
              <select
                value={scene.statusTint || 'First Draft'}
                onChange={(e) => onUpdateScene({ statusTint: e.target.value })}
                className="w-full p-2 bg-white border border-[rgba(34,30,24,0.12)] rounded-[5px] text-[#221E18] text-xs focus:outline-none cursor-pointer"
              >
                {PRESET_STATUS_TINTS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Chapter & Act Architecture Section */}
          <div className="p-4 border-b border-[rgba(34,30,24,0.12)] bg-[#F1EAD9]">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <BookOpen size={12} className="text-[#35505F]" />
                <h3 className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#7A705F]">
                  Chapter &amp; Structure
                </h3>
              </div>
              {scene.actOrPhase && (
                <span className="text-[9px] bg-[#221E18] text-[#FAF6EE] px-2 py-0.5 rounded-[4px] font-mono uppercase tracking-wider">
                  {scene.actOrPhase.split(':')[0] || 'Act'}
                </span>
              )}
            </div>

            {/* Chapter Assignment Dropdown */}
            <div className="space-y-2">
              <div>
                <label className="block text-[#7A705F] text-[10px] font-medium mb-1">
                  Assigned Chapter
                </label>
                <select
                  value={scene.chapterId || ''}
                  onChange={handleSelectChapter}
                  className="w-full p-2 bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[6px] text-[#221E18] text-xs focus:outline-none focus:border-[#35505F] cursor-pointer"
                >
                  <option value="">No Chapter (Unassigned)</option>
                  {chapters.map((chap) => (
                    <option key={chap.id} value={chap.id}>
                      Ch. {chap.number}: {chap.title}
                    </option>
                  ))}
                  <option value="__new__">+ Create New Chapter...</option>
                </select>
              </div>

              {/* Quick Create New Chapter Form */}
              {isCreatingChapter && (
                <form
                  onSubmit={handleCreateNewChapterSubmit}
                  className="p-2.5 bg-[#FAF6EE] border border-[#B54B32]/40 rounded-[6px] space-y-2 shadow-warm-sm"
                >
                  <div className="text-[10px] font-bold text-[#221E18]">New Chapter Setup</div>
                  <input
                    type="text"
                    placeholder="Chapter Title (e.g., The Crossing)"
                    value={newChapTitle}
                    onChange={(e) => setNewChapTitle(e.target.value)}
                    className="w-full p-1.5 bg-[#F1EAD9] border border-[rgba(34,30,24,0.12)] rounded-[4px] text-xs text-[#221E18] focus:outline-none"
                    autoFocus
                  />
                  <input
                    type="text"
                    placeholder="Act or Phase (e.g., Act II: Confrontation)"
                    value={newChapPhase}
                    onChange={(e) => setNewChapPhase(e.target.value)}
                    className="w-full p-1.5 bg-[#F1EAD9] border border-[rgba(34,30,24,0.12)] rounded-[4px] text-xs text-[#221E18] focus:outline-none"
                  />
                  <div className="flex items-center justify-end gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsCreatingChapter(false)}
                      className="px-2 py-1 text-[10px] text-[#7A705F] hover:text-[#221E18]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newChapTitle.trim()}
                      className="px-2.5 py-1 text-[10px] font-semibold bg-[#221E18] text-[#FAF6EE] rounded-[4px] hover:bg-black disabled:opacity-50"
                    >
                      Save Chapter
                    </button>
                  </div>
                </form>
              )}

              {/* Chapter Details Display / Inputs */}
              {scene.chapterNumber && (
                <div className="pt-1.5 space-y-1.5 text-[11px] text-[#221E18]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#7A705F] text-[10px]">Chapter Number:</span>
                    <input
                      type="number"
                      value={scene.chapterNumber}
                      onChange={(e) =>
                        onUpdateScene({ chapterNumber: parseInt(e.target.value, 10) || 1 })
                      }
                      className="w-16 p-1 bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[4px] text-right font-mono text-xs"
                    />
                  </div>

                  <div>
                    <span className="text-[#7A705F] text-[10px] block mb-0.5">Chapter Title:</span>
                    <input
                      type="text"
                      value={scene.chapterTitle || ''}
                      onChange={(e) => onUpdateScene({ chapterTitle: e.target.value })}
                      placeholder="Chapter title..."
                      className="w-full p-1.5 bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[4px] text-xs text-[#221E18]"
                    />
                  </div>

                  <div>
                    <span className="text-[#7A705F] text-[10px] block mb-0.5">Act / Story Phase:</span>
                    <input
                      type="text"
                      value={scene.actOrPhase || ''}
                      onChange={(e) => onUpdateScene({ actOrPhase: e.target.value })}
                      placeholder="e.g. Act I: Setup, Descent"
                      className="w-full p-1.5 bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[4px] text-xs text-[#221E18]"
                    />
                  </div>

                  <div>
                    <span className="text-[#7A705F] text-[10px] block mb-0.5">Dramatic Beat:</span>
                    <input
                      type="text"
                      value={scene.narrativeBeat || ''}
                      onChange={(e) => onUpdateScene({ narrativeBeat: e.target.value })}
                      placeholder="e.g. 1. Opening Image &amp; Status Quo"
                      className="w-full p-1.5 bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[4px] text-xs text-[#221E18]"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Codex & Objectives Section */}
          <div className="p-4 border-b border-[rgba(34,30,24,0.12)]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#7A705F] flex items-center gap-1.5">
                <Compass size={12} className="text-[#B54B32]" />
                <span>Codex Lore &amp; Scene Goals</span>
              </h3>
              <span className="text-[9px] bg-[#F1EAD9] px-1.5 py-0.5 rounded-[4px] text-[#7A705F] font-mono uppercase">
                {scene.status}
              </span>
            </div>

            {/* Premise field */}
            <div className="mb-3">
              <label className="block text-[#7A705F] text-[10px] font-mono font-semibold uppercase tracking-wider mb-1">
                Dramatic Objective
              </label>
              <textarea
                value={scene.premise}
                onChange={(e) => onUpdateScene({ premise: e.target.value })}
                rows={2}
                className="w-full p-2 bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[6px] text-[#221E18] text-xs focus:outline-none focus:border-[#35505F] leading-relaxed"
                placeholder="Dramatic premise or shift..."
              />
            </div>

            {/* Linked Codex Entities Cards */}
            <div className="space-y-2">
              {sceneEntities.length === 0 ? (
                <p className="text-[#7A705F] italic text-[11px] py-1">
                  No entities linked. Highlight text to anchor characters or places.
                </p>
              ) : (
                sceneEntities.map((ent) => (
                  <div
                    key={ent.id}
                    className="p-2.5 rounded-[6px] border border-[rgba(34,30,24,0.12)] bg-[#F1EAD9] space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-serif font-bold text-[#221E18]">{ent.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-[4px] font-mono uppercase bg-[#FAF6EE] text-[#7A705F] border border-[rgba(34,30,24,0.08)]">
                        {ent.type}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#7A705F] leading-relaxed line-clamp-2">
                      {ent.description}
                    </p>
                    {ent.canonicalFacts && ent.canonicalFacts.length > 0 && (
                      <div className="pt-1 text-[10px] text-[#221E18] font-serif italic border-t border-[rgba(34,30,24,0.08)]">
                        📌 {ent.canonicalFacts[0]}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* CONTINUITY NOTES SECTION */}
          <div className="flex-1 p-4 overflow-y-auto scrollbar-subtle">
            <h3 className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#7A705F] mb-3">
              Continuity &amp; Notes
            </h3>
            <div className="space-y-2">
              {scene.notes ? (
                <div className="flex gap-2.5 items-start p-2 bg-[#F1EAD9] rounded-[6px] border border-[rgba(34,30,24,0.12)]">
                  <div className="mt-0.5 text-[#B54B32] shrink-0">
                    <Sliders size={12} />
                  </div>
                  <p className="text-[11px] text-[#221E18] italic leading-relaxed">
                    "{scene.notes}"
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-[#7A705F] italic">No active continuity flags in this scene.</p>
              )}
            </div>
          </div>

          {/* CUTTING ROOM SNIPPET PREVIEW */}
          <div className="p-3.5 bg-[#F1EAD9] border-t border-[rgba(34,30,24,0.12)]">
            <div className="flex items-center justify-between text-[10px] font-mono font-semibold uppercase tracking-wider text-[#7A705F] mb-1.5">
              <span className="flex items-center gap-1.5">
                <Scissors size={12} className="text-[#B54B32]" />
                <span>Cutting Room</span>
              </span>
              <span className="text-[#35505F]">Safe Vault</span>
            </div>
            <div className="bg-[#FAF6EE] p-2 rounded-[4px] border border-[rgba(34,30,24,0.12)] text-[10px] text-[#7A705F] italic">
              Select prose and click "Cutting Room" to safely stash trims.
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
