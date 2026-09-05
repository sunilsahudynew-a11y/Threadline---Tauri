import React, { useState } from 'react';
import { Scene, Entity, Chapter } from '../../types';
import { Sliders, BookOpen, Layers, Plus, Check } from 'lucide-react';

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
    <aside className="w-72 border-l border-[#EBE8E2] bg-white overflow-y-auto scrollbar-subtle flex flex-col shrink-0 select-none text-xs">
      {/* Chapter & Act Architecture Section */}
      <div className="p-4 border-b border-[#EBE8E2] bg-[#FAF9F5]/70">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <BookOpen size={12} className="text-[#8C887F]" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#AAA69F]">
              Chapter & Structure
            </h3>
          </div>
          {scene.actOrPhase && (
            <span className="text-[9px] bg-[#2D2A26] text-white px-2 py-0.5 rounded font-mono uppercase tracking-wider">
              {scene.actOrPhase.split(':')[0] || 'Act'}
            </span>
          )}
        </div>

        {/* Chapter Assignment Dropdown */}
        <div className="space-y-2">
          <div>
            <label className="block text-[#8C887F] text-[10px] font-medium mb-1">
              Assigned Chapter
            </label>
            <select
              value={scene.chapterId || ''}
              onChange={handleSelectChapter}
              className="w-full p-2 bg-white border border-[#EBE8E2] rounded-lg text-[#3C3933] text-xs focus:outline-none focus:border-[#D4A373] cursor-pointer"
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
              className="p-2.5 bg-white border border-[#D4A373]/50 rounded-lg space-y-2 shadow-2xs"
            >
              <div className="text-[10px] font-bold text-[#1A1814]">New Chapter Setup</div>
              <input
                type="text"
                placeholder="Chapter Title (e.g., The Crossing)"
                value={newChapTitle}
                onChange={(e) => setNewChapTitle(e.target.value)}
                className="w-full p-1.5 border border-[#EBE8E2] rounded text-xs focus:outline-none"
                autoFocus
              />
              <input
                type="text"
                placeholder="Act or Phase (e.g., Act II: Confrontation)"
                value={newChapPhase}
                onChange={(e) => setNewChapPhase(e.target.value)}
                className="w-full p-1.5 border border-[#EBE8E2] rounded text-xs focus:outline-none"
              />
              <div className="flex items-center justify-end gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreatingChapter(false)}
                  className="px-2 py-1 text-[10px] text-[#8C887F] hover:text-[#1A1814]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newChapTitle.trim()}
                  className="px-2.5 py-1 text-[10px] font-semibold bg-[#2D2A26] text-white rounded hover:bg-[#1A1814] disabled:opacity-50"
                >
                  Save Chapter
                </button>
              </div>
            </form>
          )}

          {/* Chapter Details Details Display / Inputs */}
          {scene.chapterNumber && (
            <div className="pt-1.5 space-y-1.5 text-[11px] text-[#6C6960]">
              <div className="flex items-center justify-between">
                <span className="text-[#8C887F] text-[10px]">Chapter Number:</span>
                <input
                  type="number"
                  value={scene.chapterNumber}
                  onChange={(e) =>
                    onUpdateScene({ chapterNumber: parseInt(e.target.value, 10) || 1 })
                  }
                  className="w-16 p-1 bg-white border border-[#EBE8E2] rounded text-right font-mono text-xs"
                />
              </div>

              <div>
                <span className="text-[#8C887F] text-[10px] block mb-0.5">Chapter Title:</span>
                <input
                  type="text"
                  value={scene.chapterTitle || ''}
                  onChange={(e) => onUpdateScene({ chapterTitle: e.target.value })}
                  placeholder="Chapter title..."
                  className="w-full p-1.5 bg-white border border-[#EBE8E2] rounded text-xs"
                />
              </div>

              <div>
                <span className="text-[#8C887F] text-[10px] block mb-0.5">Act / Story Phase:</span>
                <input
                  type="text"
                  value={scene.actOrPhase || ''}
                  onChange={(e) => onUpdateScene({ actOrPhase: e.target.value })}
                  placeholder="e.g. Act I: Setup, Descent"
                  className="w-full p-1.5 bg-white border border-[#EBE8E2] rounded text-xs"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Story Bible & Objectives Section */}
      <div className="p-4 border-b border-[#EBE8E2]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#AAA69F]">
            Beat Objective & Bible
          </h3>
          <span className="text-[9px] bg-[#F1F0EC] px-1.5 py-0.5 rounded text-[#6C6960] font-mono uppercase">
            {scene.status}
          </span>
        </div>

        {/* Premise field */}
        <div className="mb-3">
          <label className="block text-[#AAA69F] text-[10px] font-bold uppercase tracking-wider mb-1">
            Scene Objective
          </label>
          <textarea
            value={scene.premise}
            onChange={(e) => onUpdateScene({ premise: e.target.value })}
            rows={2}
            className="w-full p-2 bg-[#FAF9F5] border border-[#EBE8E2] rounded-lg text-[#3C3933] text-xs focus:bg-white focus:outline-none leading-relaxed"
            placeholder="Dramatic premise or shift..."
          />
        </div>

        {/* Linked Story Bible Cards */}
        <div className="space-y-2.5">
          {sceneEntities.length === 0 ? (
            <p className="text-[#8C887F] italic text-[11px] py-1">
              No entities linked. Highlight prose to anchor characters or places.
            </p>
          ) : (
            sceneEntities.map((ent) => (
              <div
                key={ent.id}
                className="p-2.5 rounded-xl border border-[#EBE8E2] bg-[#FAF9F5] space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1A1814]">{ent.name}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase ${
                      ent.status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ent.status === 'contradicted'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {ent.status}
                  </span>
                </div>
                <p className="text-[10px] text-[#8C887F] leading-relaxed line-clamp-2">
                  {ent.description}
                </p>
                {ent.canonicalFacts && ent.canonicalFacts.length > 0 && (
                  <div className="pt-1 text-[10px] text-[#3C3933] font-serif italic border-t border-[#EBE8E2]/60">
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
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#AAA69F] mb-3">
          Continuity & Notes
        </h3>
        <div className="space-y-3">
          {scene.notes ? (
            <div className="flex gap-2.5 items-start">
              <div className="mt-0.5 text-amber-500 shrink-0">
                <Sliders size={12} />
              </div>
              <p className="text-[11px] text-[#6C6960] italic leading-relaxed">
                "{scene.notes}"
              </p>
            </div>
          ) : (
            <p className="text-[11px] text-[#8C887F] italic">No active continuity flags in this beat.</p>
          )}
        </div>
      </div>

      {/* CUTTING ROOM SNIPPET PREVIEW */}
      <div className="p-4 bg-white border-t border-[#EBE8E2]">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-[#AAA69F] mb-2">
          <span>Cutting Room</span>
          <span className="text-[#D4A373]">Safe Scraps</span>
        </div>
        <div className="bg-[#FAF9F5] p-2 rounded-lg border border-[#EBE8E2] text-[10px] text-[#8C887F] italic truncate">
          Highlight any text & click "Cutting Room" to clip cleanly.
        </div>
      </div>
    </aside>
  );
};
