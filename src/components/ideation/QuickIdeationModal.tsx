import React, { useState, useEffect, useRef } from 'react';
import { RoughIdea, IdeaCategory, IdeaPriority } from '../../types';
import { Lightbulb, X, Tag, Sparkles, Flame, Check, CornerDownLeft } from 'lucide-react';

interface QuickIdeationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveIdea: (idea: Omit<RoughIdea, 'id' | 'createdAt' | 'updatedAt'>) => void;
  currentSceneTitle?: string;
}

export const QuickIdeationModal: React.FC<QuickIdeationModalProps> = ({
  isOpen,
  onClose,
  onSaveIdea,
  currentSceneTitle
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IdeaCategory>('plot');
  const [priority, setPriority] = useState<IdeaPriority>('medium');
  const [tags, setTags] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setTitle('');
      setDescription('');
      setCategory('plot');
      setPriority('medium');
      setTags('');
    }
  }, [isOpen]);

  // Handle ESC or ENTER
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tagsList = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSaveIdea({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      status: 'spark',
      tags: tagsList
    });

    onClose();
  };

  const categories: { id: IdeaCategory; label: string; icon: string }[] = [
    { id: 'plot', label: 'Plot Twist', icon: '⚡' },
    { id: 'character', label: 'Character Arc', icon: '🎭' },
    { id: 'world', label: 'World & Lore', icon: '🗺️' },
    { id: 'dialogue', label: 'Dialogue Scrap', icon: '💬' },
    { id: 'theme', label: 'Thematic Motif', icon: '🌿' },
    { id: 'twist', label: 'Reversal', icon: '🔄' },
    { id: 'research', label: 'Research Query', icon: '🔬' }
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#FAF6EE] text-[#221E18] rounded-[10px] border border-[rgba(34,30,24,0.16)] shadow-warm-modal overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 bg-[#F1EAD9] border-b border-[rgba(34,30,24,0.1)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#B54B32] text-[#FAF6EE] flex items-center justify-center shadow-xs">
              <Lightbulb size={13} />
            </div>
            <div>
              <h3 className="font-serif font-semibold text-sm text-[#221E18]">
                Quick Rough Ideation
              </h3>
              <span className="text-[10px] font-mono text-[#7A705F]">
                Global Shortcut (⌘I / Ctrl+I)
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-[#7A705F] hover:text-[#221E18] hover:bg-[#FAF6EE] transition-colors cursor-pointer"
            title="Dismiss (Esc)"
          >
            <X size={15} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What spark just struck you? (e.g. Silas poisoned the greenhouse soil)..."
              className="w-full px-3 py-2 text-sm font-medium rounded-[6px] border border-[rgba(34,30,24,0.15)] bg-white/70 focus:outline-none focus:border-[#B54B32] text-[#221E18] shadow-2xs"
              autoFocus
            />
          </div>

          <div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Rough notes, snippet or sensory details (optional)..."
              rows={3}
              className="w-full px-3 py-2 text-xs rounded-[6px] border border-[rgba(34,30,24,0.12)] bg-white/50 focus:outline-none focus:border-[#B54B32] text-[#221E18]"
            />
          </div>

          {/* Category Chips */}
          <div>
            <label className="text-[10px] font-mono uppercase text-[#7A705F] font-bold block mb-1.5">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-[5px] text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 border ${
                    category === cat.id
                      ? 'bg-[#221E18] text-[#FAF6EE] border-[#221E18] font-semibold'
                      : 'bg-[#F1EAD9] text-[#554D40] hover:text-[#221E18] border-[rgba(34,30,24,0.08)]'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Priority & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-[10px] font-mono uppercase text-[#7A705F] font-bold block mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as IdeaPriority)}
                className="w-full text-xs px-2.5 py-1.5 rounded-[5px] border border-[rgba(34,30,24,0.12)] bg-[#F1EAD9] text-[#221E18] cursor-pointer"
              >
                <option value="high">High (Urgent Plot/Scene Need)</option>
                <option value="medium">Medium (Standard Exploration)</option>
                <option value="low">Low (Someday / Background Idea)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-[#7A705F] font-bold block mb-1">
                Tags (Comma-separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. Silas, Bell jar, Cloche"
                className="w-full text-xs px-2.5 py-1.5 rounded-[5px] border border-[rgba(34,30,24,0.12)] bg-[#F1EAD9] text-[#221E18]"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-[rgba(34,30,24,0.1)] flex items-center justify-between">
            <span className="text-[11px] text-[#7A705F] flex items-center gap-1 font-mono">
              <kbd className="px-1 py-0.5 rounded bg-[rgba(34,30,24,0.06)] text-[#221E18] font-semibold text-[9px]">
                Esc
              </kbd>
              to cancel
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-[#7A705F] hover:text-[#221E18] rounded-[5px] cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="px-4 py-1.5 text-xs font-bold bg-[#B54B32] hover:bg-[#9E3E27] disabled:opacity-40 text-[#FAF6EE] rounded-[5px] transition-all flex items-center gap-1.5 shadow-warm-sm cursor-pointer"
              >
                <span>Save Spark</span>
                <CornerDownLeft size={13} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
