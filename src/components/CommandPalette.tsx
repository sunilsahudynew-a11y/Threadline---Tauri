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
  Check,
  History,
  Lightbulb,
  Edit3
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
  onOpenTour?: () => void;
  onOpenQuickIdeation?: () => void;
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
  onToggleTypewriter,
  onOpenTour,
  onOpenQuickIdeation
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
    { id: 'nav-editorial', title: 'Editor Mode (Editorial Desk & Style Sheets)', category: 'Screens', icon: Edit3, action: () => onNavigateToScreen('editorial') },
    { id: 'nav-ideation', title: 'Ideation & Frameworks (3-Act, Hero\'s Journey, Rough Ideas)', category: 'Screens', icon: Lightbulb, action: () => onNavigateToScreen('ideation') },
    { id: 'nav-home', title: 'Project Overview', category: 'Screens', icon: BookOpen, action: () => onNavigateToScreen('home') },
    { id: 'nav-bible', title: 'Story Bible (Canon & Mythology)', category: 'Screens', icon: Compass, action: () => onNavigateToScreen('bible') },
    { id: 'nav-dash', title: 'Timeline Arc & Sequence', category: 'Screens', icon: Layers, action: () => onNavigateToScreen('dashboard') },
    { id: 'nav-cont', title: 'Continuity Inbox', category: 'Screens', icon: Sparkles, action: () => onNavigateToScreen('continuity') },
    { id: 'nav-rev', title: 'Revisions, Snapshots & Version History', category: 'Screens', icon: History, action: () => onNavigateToScreen('revisions') },
    { id: 'nav-proj', title: 'All Projects Hub', category: 'Screens', icon: FolderKanban, action: () => onNavigateToScreen('projects') },
    { id: 'nav-landing', title: 'Product Landing Page (/landing)', category: 'Screens', icon: BookOpen, action: () => onNavigateToScreen('landing') }
  ];

  // Actions
  const actionsList: PaletteItem[] = [
    ...(onOpenQuickIdeation ? [{ id: 'act-quick-ideation', title: 'Quick Rough Idea (Ideation)', subtitle: 'Shortcut: ⌘I / Ctrl+I', category: 'Actions', icon: Lightbulb, action: onOpenQuickIdeation }] : []),
    { id: 'act-add-scene', title: 'Create New Chapter Beat', category: 'Actions', icon: Plus, action: onAddScene },
    ...(onOpenTour ? [{ id: 'act-tour', title: 'Take Studio Orientation Tour', category: 'Actions', icon: Sparkles, action: onOpenTour }] : []),
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
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF6EE] w-full max-w-xl rounded-[6px] shadow-warm-modal border border-[rgba(34,30,24,0.16)] overflow-hidden flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[rgba(34,30,24,0.12)] gap-3 bg-[#F1EAD9]/50">
          <Search size={18} className="text-[#7A705F] shrink-0" />
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
            className="w-full text-sm bg-transparent border-0 focus:outline-none text-[#221E18] placeholder-[#7A705F]"
          />
          <kbd className="text-[10px] font-mono bg-[#FAF6EE] text-[#7A705F] px-1.5 py-0.5 rounded-[4px] border border-[rgba(34,30,24,0.16)]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#7A705F]">
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
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[5px] text-left transition-colors cursor-pointer ${
                    isSelected ? 'bg-[#221E18] text-[#FAF6EE] shadow-warm-sm' : 'text-[#221E18] hover:bg-[#F1EAD9]/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div
                      className={`p-1.5 rounded-[4px] shrink-0 ${
                        isSelected ? 'bg-[#353029] text-[#FAF6EE]' : 'bg-[#F1EAD9] text-[#7A705F]'
                      }`}
                    >
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate">{item.title}</div>
                      {'subtitle' in item && item.subtitle && (
                        <div
                          className={`text-[11px] truncate ${
                            isSelected ? 'text-[#FAF6EE]/80' : 'text-[#7A705F]'
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
                        isSelected ? 'text-[#FAF6EE]/70' : 'text-[#7A705F]'
                      }`}
                    >
                      {item.category}
                    </span>
                    <ArrowRight
                      size={12}
                      className={isSelected ? 'text-[#B54B32]' : 'text-transparent'}
                    />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2.5 border-t border-[rgba(34,30,24,0.12)] bg-[#F1EAD9]/60 flex items-center justify-between text-[10px] font-mono text-[#7A705F]">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="bg-[#FAF6EE] px-1 py-0.5 rounded-[3px] border border-[rgba(34,30,24,0.16)] text-[#221E18]">↑↓</kbd> Navigate
            </span>
            <span>
              <kbd className="bg-[#FAF6EE] px-1 py-0.5 rounded-[3px] border border-[rgba(34,30,24,0.16)] text-[#221E18]">↵</kbd> Select
            </span>
          </div>
          <span>Threadline Command Navigator</span>
        </div>
      </div>
    </div>
  );
};
