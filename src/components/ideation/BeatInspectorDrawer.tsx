import React, { useState } from 'react';
import { FrameworkBeatDefinition } from '../../data/ideationFrameworks';
import { FrameworkPointer, RoughIdea, Scene } from '../../types';
import {
  X,
  Plus,
  Trash2,
  FileText,
  Lightbulb,
  Sparkles,
  ArrowRight,
  Bookmark,
  Check,
  Tag
} from 'lucide-react';

interface BeatInspectorDrawerProps {
  beat: FrameworkBeatDefinition;
  pointers: FrameworkPointer[];
  roughIdeas?: RoughIdea[];
  scenes?: Scene[];
  onClose: () => void;
  onAddPointer: (pointer: Omit<FrameworkPointer, 'id' | 'createdAt'>) => void;
  onDeletePointer: (id: string) => void;
  onLinkRoughIdea: (ideaId: string, beatKey: string) => void;
  onNavigateToScene?: (sceneId: string) => void;
}

export const BeatInspectorDrawer: React.FC<BeatInspectorDrawerProps> = ({
  beat,
  pointers,
  roughIdeas = [],
  scenes = [],
  onClose,
  onAddPointer,
  onDeletePointer,
  onLinkRoughIdea,
  onNavigateToScene
}) => {
  const [isAddingPointer, setIsAddingPointer] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newColor, setNewColor] = useState(beat.color);
  const [newLinkedSceneId, setNewLinkedSceneId] = useState('');

  const beatPointers = pointers.filter((p) => p.beatKey === beat.key);
  const unlinkedIdeas = roughIdeas.filter((idea) => idea.linkedBeatKey !== beat.key);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddPointer({
      framework: 'three-act',
      beatKey: beat.key,
      title: newTitle.trim(),
      notes: newNotes.trim() || undefined,
      color: newColor,
      linkedSceneId: newLinkedSceneId || undefined
    });

    setNewTitle('');
    setNewNotes('');
    setIsAddingPointer(false);
  };

  return (
    <div className="bg-[#FAF6EE] rounded-[10px] border border-[rgba(34,30,24,0.12)] p-4 sm:p-5 shadow-warm-md flex flex-col h-full select-none text-[#221E18]">
      {/* Drawer Header */}
      <div className="flex items-start justify-between gap-3 border-b border-[rgba(34,30,24,0.08)] pb-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: beat.color }}
            />
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A705F] font-semibold">
              {beat.actOrStage}
            </span>
          </div>
          <h2 className="text-lg font-serif font-bold text-[#221E18] mt-0.5">
            {beat.name}
          </h2>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-[5px] text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9] transition-colors cursor-pointer"
          title="Close Inspector"
        >
          <X size={16} />
        </button>
      </div>

      {/* Beat Description & Craft Tip */}
      <div className="space-y-2 mb-4 bg-[#F1EAD9] p-3 rounded-[6px] border border-[rgba(34,30,24,0.06)] text-xs">
        <p className="text-[#3A3026] leading-relaxed">
          {beat.description}
        </p>
        <div className="flex items-start gap-1.5 pt-1.5 border-t border-[rgba(34,30,24,0.08)] text-[#B54B32]">
          <Sparkles size={13} className="shrink-0 mt-0.5" />
          <p className="italic text-[11px] text-[#554D40]">
            <span className="font-semibold text-[#B54B32]">Craft Tip: </span>
            {beat.craftTip}
          </p>
        </div>
      </div>

      {/* Charted Pointers Section */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#7A705F] font-semibold flex items-center gap-1.5">
            <Bookmark size={13} className="text-[#B54B32]" />
            <span>Charted Pointers ({beatPointers.length})</span>
          </h3>

          {!isAddingPointer && (
            <button
              onClick={() => setIsAddingPointer(true)}
              className="flex items-center gap-1 text-xs font-semibold text-[#B54B32] hover:text-[#9E3E27] cursor-pointer"
            >
              <Plus size={13} />
              <span>Add Pointer</span>
            </button>
          )}
        </div>

        {/* Add Pointer Inline Form */}
        {isAddingPointer && (
          <form onSubmit={handleCreate} className="p-3 bg-white rounded-[6px] border border-[#B54B32] shadow-warm-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-[#B54B32]">New Beat Pointer</span>
              <button
                type="button"
                onClick={() => setIsAddingPointer(false)}
                className="text-[#7A705F] hover:text-[#221E18]"
              >
                <X size={13} />
              </button>
            </div>

            <input
              type="text"
              placeholder="Pointer title / story beat..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
              className="w-full text-xs px-2.5 py-1.5 rounded-[4px] border border-[rgba(34,30,24,0.15)] focus:outline-none focus:border-[#B54B32] bg-[#FAF6EE]"
            />

            <textarea
              placeholder="Key notes, dialogue cues, sensory stakes..."
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              rows={2}
              className="w-full text-xs px-2.5 py-1.5 rounded-[4px] border border-[rgba(34,30,24,0.15)] focus:outline-none focus:border-[#B54B32] bg-[#FAF6EE] resize-none"
            />

            {/* Link Scene Dropdown */}
            {scenes.length > 0 && (
              <div className="flex items-center gap-2">
                <FileText size={12} className="text-[#7A705F] shrink-0" />
                <select
                  value={newLinkedSceneId}
                  onChange={(e) => setNewLinkedSceneId(e.target.value)}
                  className="flex-1 text-[11px] px-2 py-1 rounded-[4px] border border-[rgba(34,30,24,0.12)] bg-[#FAF6EE] text-[#221E18]"
                >
                  <option value="">-- Link to Manuscript Scene (Optional) --</option>
                  {scenes.map((s) => (
                    <option key={s.id} value={s.id}>
                      Scene: {s.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              {/* Color swatches */}
              <div className="flex items-center gap-1.5">
                {['#B54B32', '#4B6B94', '#3A7D6E', '#C44900', '#2F3E46'].map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setNewColor(col)}
                    className={`w-4 h-4 rounded-full transition-transform ${
                      newColor === col ? 'scale-125 ring-2 ring-offset-1 ring-[#221E18]' : ''
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingPointer(false)}
                  className="px-2.5 py-1 text-xs text-[#7A705F] hover:text-[#221E18]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-[#B54B32] text-[#FAF6EE] rounded-[4px] text-xs font-semibold hover:bg-[#9E3E27]"
                >
                  Save Pointer
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Existing Pointers List */}
        {beatPointers.length === 0 && !isAddingPointer ? (
          <div className="text-center py-6 px-4 border border-dashed border-[rgba(34,30,24,0.15)] rounded-[6px] text-xs text-[#7A705F] space-y-2">
            <p>No pointers charted for this beat yet.</p>
            <button
              onClick={() => setIsAddingPointer(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[5px] bg-[#FAF6EE] text-[#B54B32] border border-[#B54B32] font-semibold text-xs hover:bg-[#F1EAD9] cursor-pointer"
            >
              <Plus size={13} />
              <span>Chart First Pointer</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {beatPointers.map((ptr) => {
              const linkedScene = scenes.find((s) => s.id === ptr.linkedSceneId);

              return (
                <div
                  key={ptr.id}
                  className="p-3 bg-[#F1EAD9] rounded-[6px] border border-[rgba(34,30,24,0.08)] hover:border-[rgba(34,30,24,0.18)] transition-all shadow-2xs group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                        style={{ backgroundColor: ptr.color || beat.color }}
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-[#221E18] leading-tight">
                          {ptr.title}
                        </h4>
                        {ptr.notes && (
                          <p className="text-[11px] text-[#554D40] mt-1 leading-relaxed">
                            {ptr.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onDeletePointer(ptr.id)}
                      className="text-[#7A705F] hover:text-[#B54B32] opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer"
                      title="Remove Pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {/* Linked Scene Tag */}
                  {linkedScene && (
                    <div className="mt-2 pt-1.5 border-t border-[rgba(34,30,24,0.06)] flex items-center justify-between text-[10px]">
                      <span className="text-[#7A705F] flex items-center gap-1 truncate">
                        <FileText size={10} className="text-[#B54B32]" />
                        <span>Scene: {linkedScene.title}</span>
                      </span>
                      {onNavigateToScene && (
                        <button
                          onClick={() => onNavigateToScene(linkedScene.id)}
                          className="text-[#B54B32] font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>Open</span>
                          <ArrowRight size={10} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Attach Rough Idea Section */}
        {unlinkedIdeas.length > 0 && (
          <div className="pt-3 border-t border-[rgba(34,30,24,0.08)]">
            <span className="text-[11px] font-mono text-[#7A705F] block mb-1.5 uppercase tracking-wider">
              Attach Existing Rough Idea:
            </span>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  onLinkRoughIdea(e.target.value, beat.key);
                  e.target.value = '';
                }
              }}
              className="w-full text-xs px-2.5 py-1.5 rounded-[4px] border border-[rgba(34,30,24,0.12)] bg-[#F1EAD9] text-[#221E18]"
              defaultValue=""
            >
              <option value="">-- Select Rough Idea to Anchor here --</option>
              {unlinkedIdeas.map((idea) => (
                <option key={idea.id} value={idea.id}>
                  [{idea.category.toUpperCase()}] {idea.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};
