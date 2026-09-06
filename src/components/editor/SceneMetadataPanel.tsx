import React, { useState } from 'react';
import { Scene, Entity, Chapter } from '../../types';
import { Sliders, BookOpen, Layers, Plus, Check, Compass, Scissors } from 'lucide-react';

interface SceneMetadataPanelProps {
  scene: Scene;
  sceneEntities: Entity[];
  chapters?: Chapter[];
  onUpdateScene: (updatedFields: Partial<Scene>) => void;
  onCreateChapter?: (chapter: Chapter) => void;
}

export const SceneMetadataPanel: React.FC<SceneMetadataPanelProps> = ({
  scene,
  sceneEntities,
  chapters = [],
  onUpdateScene,
  onCreateChapter
}) => {
  const [isCreatingChapter, setIsCreatingChapter] = useState(false);
  const [newChapTitle, setNewChapTitle] = useState('');
  const [newChapPhase, setNewChapPhase] = useState('');

  const handleSelectChapter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__new__') {
      setIsCreatingChapter(true);
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

  return (
    <aside className="w-72 border-l border-[rgba(34,30,24,0.12)] bg-[#FAF6EE] overflow-y-auto scrollbar-subtle flex flex-col shrink-0 select-none text-xs">
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
    </aside>
  );
};
