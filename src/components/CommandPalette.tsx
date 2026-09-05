import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  BookOpen,
  Compass,
  FileText,
  Layers,
  Sparkles,
  ArrowRight,
  Plus,
  Eye,
  Sliders,
  X,
  FolderKanban,
  Check
} from 'lucide-react';
import { Scene, Entity, Thread } from '../types';
import { ScreenType } from './Navigation';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  scenes: Scene[];
  entities: Entity[];
  threads: Thread[];
  onNavigateToScreen: (screen: ScreenType) => void;
  onNavigateToScene: (sceneId: string) => void;
  onAddScene: () => void;
  onToggleFocusMode?: () => void;
  onToggleTypewriter?: () => void;
}

interface PaletteItem {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  scenes,
  entities,
  threads,
  onNavigateToScreen,
  onNavigateToScene,
  onAddScene,
  onToggleFocusMode,
  onToggleTypewriter
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global shortcut to open/close palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open
          setQuery('');
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Build searchable items list
  const lowerQuery = query.toLowerCase().trim();

  // Screen items
  const screensList: PaletteItem[] = [
    { id: 'nav-editor', title: 'Manuscript Editor', category: 'Screens', icon: FileText, action: () => onNavigateToScreen('editor') },
    { id: 'nav-home', title: 'Project Overview', category: 'Screens', icon: BookOpen, action: () => onNavigateToScreen('home') },
    { id: 'nav-bible', title: 'Story Bible (Canon & Mythology)', category: 'Screens', icon: Compass, action: () => onNavigateToScreen('bible') },
    { id: 'nav-dash', title: 'Timeline Arc & Sequence', category: 'Screens', icon: Layers, action: () => onNavigateToScreen('dashboard') },
    { id: 'nav-cont', title: 'Continuity Inbox', category: 'Screens', icon: Sparkles, action: () => onNavigateToScreen('continuity') },
    { id: 'nav-rev', title: 'Revisions & Snapshots', category: 'Screens', icon: Sliders, action: () => onNavigateToScreen('revisions') },
    { id: 'nav-proj', title: 'All Projects Hub', category: 'Screens', icon: FolderKanban, action: () => onNavigateToScreen('projects') },
    { id: 'nav-landing', title: 'Product Landing Page (/landing)', category: 'Screens', icon: BookOpen, action: () => onNavigateToScreen('landing') }
  ];

  // Actions
  const actionsList: PaletteItem[] = [
    { id: 'act-add-scene', title: 'Create New Chapter Beat', category: 'Actions', icon: Plus, action: onAddScene },
    ...(onToggleFocusMode ? [{ id: 'act-focus', title: 'Toggle Focus Mode', category: 'Actions', icon: Eye, action: onToggleFocusMode }] : []),
    ...(onToggleTypewriter ? [{ id: 'act-typewriter', title: 'Toggle Typewriter Scroll Mode', category: 'Actions', icon: Sliders, action: onToggleTypewriter }] : [])
  ];

  // Scene items
  const sceneItems: PaletteItem[] = scenes.map((s) => ({
    id: `scene-${s.id}`,
    title: `Scene ${s.order}: ${s.title}`,
    subtitle: `${s.wordCount} words · ${s.pov || 'Third Limited'}`,
    category: 'Manuscript Scenes',
    icon: FileText,
    action: () => onNavigateToScene(s.id)
  }));

  // Entity items
  const entityItems: PaletteItem[] = entities.map((e) => ({
    id: `ent-${e.id}`,
    title: `${e.name} (${e.type})`,
    subtitle: e.description,
    category: 'Story Bible Entities',
    icon: Compass,
    action: () => onNavigateToScreen('bible')
  }));

  // Thread items
  const threadItems: PaletteItem[] = threads.map((t) => ({
    id: `th-${t.id}`,
    title: `Thread: ${t.title}`,
    subtitle: t.description,
    category: 'Narrative Threads',
    icon: Layers,
    action: () => onNavigateToScreen('bible')
  }));

  const allItems: PaletteItem[] = [...screensList, ...actionsList, ...sceneItems, ...entityItems, ...threadItems];

  const filtered: PaletteItem[] = lowerQuery
    ? allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(lowerQuery) ||
          item.category.toLowerCase().includes(lowerQuery) ||
          (item.subtitle && item.subtitle.toLowerCase().includes(lowerQuery))
      )
    : allItems.slice(0, 15);

  const handleSelect = (item: PaletteItem) => {
    item.action();
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        handleSelect(filtered[selectedIndex]);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-100">
      <div
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-[#EBE8E2] overflow-hidden flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#EBE8E2] gap-3">
          <Search size={18} className="text-[#8C887F] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search manuscript scenes, Story Bible, commands..."
            className="w-full text-sm bg-transparent border-0 focus:outline-none text-[#1A1814] placeholder-[#AAA69F]"
          />
          <kbd className="text-[10px] font-mono bg-[#F2EFE9] text-[#736F66] px-1.5 py-0.5 rounded border border-[#E5E1D8]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#AAA69F]">
              No matches found for "{query}".
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                    isSelected ? 'bg-[#2D2A26] text-white shadow-xs' : 'text-[#2D2A26] hover:bg-[#FAF9F5]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div
                      className={`p-1.5 rounded-lg shrink-0 ${
                        isSelected ? 'bg-[#3E3A35] text-[#F3EFE6]' : 'bg-[#F2EFE9] text-[#736F66]'
                      }`}
                    >
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium truncate">{item.title}</div>
                      {'subtitle' in item && item.subtitle && (
                        <div
                          className={`text-[11px] truncate ${
                            isSelected ? 'text-[#C9C5BC]' : 'text-[#8C887F]'
                          }`}
                        >
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-mono uppercase tracking-wider ${
                        isSelected ? 'text-[#AAA69F]' : 'text-[#B0ACA5]'
                      }`}
                    >
                      {item.category}
                    </span>
                    <ArrowRight
                      size={12}
                      className={isSelected ? 'text-[#D4C3A3]' : 'text-transparent'}
                    />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 border-t border-[#EBE8E2] bg-[#FAF9F5] flex items-center justify-between text-[10px] font-mono text-[#AAA69F]">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="bg-white px-1 py-0.5 rounded border border-[#EBE8E2]">↑↓</kbd> Navigate
            </span>
            <span>
              <kbd className="bg-white px-1 py-0.5 rounded border border-[#EBE8E2]">↵</kbd> Select
            </span>
          </div>
          <span>Threadline Quick Navigator</span>
        </div>
      </div>
    </div>
  );
};
