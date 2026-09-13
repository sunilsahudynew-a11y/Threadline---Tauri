import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Edit3,
  Film,
  Dices,
  Volume2,
  VolumeX,
  Coffee,
  Zap,
  RotateCcw,
  CornerDownLeft,
  Shuffle,
  Quote
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
  projectType?: 'novel' | 'screenplay';
}

interface PaletteItem {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  badge?: string;
  shortcut?: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  action: () => void;
}

type PaletteCategory = 'all' | 'scenes' | 'bible' | 'actions' | 'screens' | 'sparks';

const CATEGORIES: PaletteCategory[] = ['all', 'scenes', 'bible', 'actions', 'screens', 'sparks'];

// Creative Writer Twist Prompts for instant inspiration
const PLOT_TWISTS = [
  "A sealed envelope is hand-delivered by someone declared legally dead a decade ago.",
  "The protagonist discovers a brass key in their coat pocket that fits no lock in their house.",
  "An ally quietly reveals they've known the antagonist's true name all along—and protected them.",
  "The power abruptly cuts out during a quiet confession; in the dark, a hand slips away.",
  "A family heirloom turns out to conceal a coded will naming a child never spoken of.",
  "The manuscript the detective was searching for was hiding in plain sight as a diary.",
  "The mentor didn't fall by accident; they staged their disappearance as a final test.",
  "Two opposing factions discover they are receiving telegrams from the exact same anonymous patron.",
  "A sudden freezing gale forces the hero and their fiercest adversary into the same mountain cellar.",
  "An entry in an antique registry predicts today's events with chilling, clockwork accuracy.",
  "The weapon entered into evidence bears fingerprints belonging to the prosecutor's spouse.",
  "The midnight train fails to brake at the scheduled junction—the rails ahead were unbolted."
];

// Literary Quotes to inspire writers in the footer
const LITERARY_QUOTES = [
  { quote: "There is nothing to writing. All you do is sit down at a typewriter and bleed.", author: "Ernest Hemingway" },
  { quote: "You can always edit a bad page. You can’t edit a blank page.", author: "Jodi Picoult" },
  { quote: "Start before you've prepared, start before you're ready.", author: "Steven Pressfield" },
  { quote: "The scariest moment is always just before you begin.", author: "Stephen King" },
  { quote: "A word after a word after a word is power.", author: "Margaret Atwood" },
  { quote: "Write hard and clear about what hurts.", author: "Ernest Hemingway" },
  { quote: "Substitute 'damn' every time you're inclined to write 'very'; your editor will wish it out.", author: "Mark Twain" }
];

// Lightweight synthesized mechanical typewriter sound
const playMechanicalSound = (type: 'key' | 'chime' | 'space') => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'chime') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const baseFreq = type === 'space' ? 420 : 750;
      osc.frequency.setValueAtTime(baseFreq + (Math.random() - 0.5) * 150, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.032);
    }
  } catch {
    // Audio context may be restricted before user interaction
  }
};

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
  onOpenQuickIdeation,
  projectType = 'novel'
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<PaletteCategory>('all');
  const [activeTwist, setActiveTwist] = useState<string | null>(null);
  const [isBreathingMode, setIsBreathingMode] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('threadline_palette_sound') === 'true';
    } catch {
      return false;
    }
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const isKeyboardNavRef = useRef(false);

  // Pick a random inspirational quote per session open
  const currentQuote = useMemo(() => {
    return LITERARY_QUOTES[Math.floor(Math.random() * LITERARY_QUOTES.length)];
  }, [isOpen]);

  // Persist sound preference
  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('threadline_palette_sound', String(next));
      } catch {
        // ignore
      }
      if (next) playMechanicalSound('chime');
      return next;
    });
  };

  // Reset state and focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setSelectedCategory('all');
      setActiveTwist(null);
      setIsBreathingMode(false);
      isKeyboardNavRef.current = false;

      // Ensure focus is grabbed immediately even during animations
      requestAnimationFrame(() => inputRef.current?.focus());
      const t1 = setTimeout(() => inputRef.current?.focus(), 30);
      const t2 = setTimeout(() => inputRef.current?.focus(), 120);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [isOpen]);

  // Breathing meditation loop for creative recharge
  useEffect(() => {
    if (!isBreathingMode) return;
    const interval = setInterval(() => {
      setBreathPhase((prev) => {
        if (prev === 'Inhale') return 'Hold';
        if (prev === 'Hold') return 'Exhale';
        return 'Inhale';
      });
    }, 3200);
    return () => clearInterval(interval);
  }, [isBreathingMode]);

  // Trigger random twist
  const handleRollPlotTwist = () => {
    if (soundEnabled) playMechanicalSound('chime');
    const available = PLOT_TWISTS.filter((t) => t !== activeTwist);
    const nextTwist = available[Math.floor(Math.random() * available.length)];
    setActiveTwist(nextTwist);
    setIsBreathingMode(false);
  };

  // Trigger scene roulette
  const handleSceneRoulette = () => {
    if (scenes.length === 0) return;
    if (soundEnabled) playMechanicalSound('chime');
    const randomScene = scenes[Math.floor(Math.random() * scenes.length)];
    onNavigateToScene(randomScene.id);
    onClose();
  };

  // 1. Screens list
  const isScreenplay = projectType === 'screenplay';
  const screensList: PaletteItem[] = [
    ...(isScreenplay
      ? [{ id: 'nav-screenplay', title: 'Screenplay Studio', subtitle: 'Industry standard script & live table read playback', category: 'Screens', badge: 'Screen', shortcut: '⌘S', icon: Film, action: () => onNavigateToScreen('screenplay') }]
      : [{ id: 'nav-editor', title: 'Manuscript Prose Editor', subtitle: 'Distraction-free canvas, dual-pane binder & typography desk', category: 'Screens', badge: 'Prose', shortcut: '⌘E', icon: FileText, action: () => onNavigateToScreen('editor') }]),
    { id: 'nav-editorial', title: 'Editorial Review Desk', subtitle: 'Pacing cadence, style sheets & manuscript analytics', category: 'Screens', badge: 'Review', icon: Edit3, action: () => onNavigateToScreen('editorial') },
    { id: 'nav-ideation', title: 'Ideation & Plot Frameworks', subtitle: 'Three-Act, Hero’s Journey, Save the Cat! & beat sheets', category: 'Screens', badge: 'Plot', icon: Lightbulb, action: () => onNavigateToScreen('ideation') },
    { id: 'nav-home', title: 'Manuscript Overview Hub', subtitle: 'Project synopsis, chapter telemetry & resume drafting hero', category: 'Screens', badge: 'Home', icon: BookOpen, action: () => onNavigateToScreen('home') },
    { id: 'nav-bible', title: 'Story Bible & Codex', subtitle: 'Character arcs, mythological canon & narrative threads', category: 'Screens', badge: 'Lore', shortcut: '⌘B', icon: Compass, action: () => onNavigateToScreen('bible') },
    { id: 'nav-dash', title: 'Corkboard & Timeline Arc', subtitle: 'Drag-and-drop index cards, timeline sequences & act balance', category: 'Screens', badge: 'Arc', icon: Layers, action: () => onNavigateToScreen('dashboard') },
    { id: 'nav-cont', title: 'Continuity & Lore Audit', subtitle: 'Detect paradoxes, temporal conflicts & unresolved plot threads', category: 'Screens', badge: 'Audit', icon: Sparkles, action: () => onNavigateToScreen('continuity') },
    { id: 'nav-rev', title: 'Revisions & Version History', subtitle: 'Compare snapshots, branch revisions & view diffs', category: 'Screens', badge: 'Diff', icon: History, action: () => onNavigateToScreen('revisions') },
    { id: 'nav-proj', title: 'Manuscript Library', subtitle: 'Switch between projects, export archives or create new titles', category: 'Screens', badge: 'Vault', icon: FolderKanban, action: () => onNavigateToScreen('projects') }
  ];

  // 2. Actions list
  const actionsList: PaletteItem[] = [
    { id: 'act-add-scene', title: 'Create New Chapter Beat', subtitle: 'Append a blank scene card ready for narrative drafting', category: 'Actions', badge: 'Draft', shortcut: '⌘N', icon: Plus, action: onAddScene },
    ...(onOpenQuickIdeation ? [{ id: 'act-quick-ideation', title: 'Capture Quick Rough Idea', subtitle: 'Jot down sudden dialogue sparks, scene twists or research notes', category: 'Actions', badge: 'Idea', shortcut: '⌘I', icon: Lightbulb, action: onOpenQuickIdeation }] : []),
    ...(onToggleFocusMode ? [{ id: 'act-focus', title: 'Toggle Zen Focus Mode', subtitle: 'Collapse all chrome & binders for pure manuscript concentration', category: 'Actions', badge: 'Focus', shortcut: '⌘.', icon: Eye, action: onToggleFocusMode }] : []),
    ...(onToggleTypewriter ? [{ id: 'act-typewriter', title: 'Toggle Typewriter Scroll Mode', subtitle: 'Keep the active typing line locked in the vertical center of the page', category: 'Actions', badge: 'Scroll', icon: Sliders, action: onToggleTypewriter }] : []),
    ...(onOpenTour ? [{ id: 'act-tour', title: 'Studio Orientation Tour', subtitle: 'Walkthrough of Threadline’s editorial capabilities and binder layout', category: 'Actions', badge: 'Tour', icon: Sparkles, action: onOpenTour }] : [])
  ];

  // 3. Scene items
  const sceneItems: PaletteItem[] = scenes.map((s) => ({
    id: `scene-${s.id}`,
    title: `Scene ${s.order}: ${s.title}`,
    subtitle: `${s.wordCount.toLocaleString()} words · ${s.pov || 'Third Limited'} · ${s.status || 'draft'}`,
    category: 'Scenes',
    badge: s.status ? s.status.toUpperCase() : `#${s.order}`,
    icon: FileText,
    action: () => onNavigateToScene(s.id)
  }));

  // 4. Story Bible Entities & Threads
  const bibleItems: PaletteItem[] = [
    ...entities.map((e) => ({
      id: `ent-${e.id}`,
      title: `${e.name}`,
      subtitle: `${e.type.toUpperCase()} · ${e.description || 'Canon entity in Story Bible'}`,
      category: 'Story Bible',
      badge: e.type,
      icon: Compass,
      action: () => onNavigateToScreen('bible')
    })),
    ...threads.map((t) => ({
      id: `th-${t.id}`,
      title: `Thread: ${t.title}`,
      subtitle: `${t.status?.toUpperCase() || 'ACTIVE'} · ${t.description || 'Narrative arc thread'}`,
      category: 'Story Bible',
      badge: 'Thread',
      icon: Layers,
      action: () => onNavigateToScreen('bible')
    }))
  ];

  // 5. Fun & Inspiration Sparks
  const sparksList: PaletteItem[] = [
    {
      id: 'spark-twist',
      title: '🎲 Spark a Random Plot Twist',
      subtitle: 'Break writer’s block with an unexpected narrative complication',
      category: 'Sparks',
      badge: 'Twist',
      icon: Dices,
      action: handleRollPlotTwist
    },
    {
      id: 'spark-roulette',
      title: '🎯 Scene Roulette: Random Jump',
      subtitle: 'Jump into a random scene across your manuscript to revise or expand',
      category: 'Sparks',
      badge: 'Roulette',
      icon: Shuffle,
      action: handleSceneRoulette
    },
    {
      id: 'spark-breathe',
      title: '☕ 2-Minute Mindful Reset',
      subtitle: 'Guided visual breathing cadence to clear cognitive fatigue',
      category: 'Sparks',
      badge: 'Zen',
      icon: Coffee,
      action: () => {
        setIsBreathingMode(true);
        setActiveTwist(null);
        if (soundEnabled) playMechanicalSound('chime');
      }
    },
    {
      id: 'spark-sprint',
      title: '⚡ 5-Minute Word Rush Challenge',
      subtitle: 'Enter Manuscript Editor and draft freely without backspacing',
      category: 'Sparks',
      badge: 'Sprint',
      icon: Zap,
      action: () => {
        onNavigateToScreen(projectType === 'screenplay' ? 'screenplay' : 'editor');
        onClose();
      }
    }
  ];

  // Combine and categorize
  const allItems: PaletteItem[] = [
    ...sparksList,
    ...actionsList,
    ...screensList,
    ...sceneItems,
    ...bibleItems
  ];

  // Category filtering
  const categoryFiltered = useMemo(() => {
    if (selectedCategory === 'all') return allItems;
    if (selectedCategory === 'scenes') return sceneItems;
    if (selectedCategory === 'bible') return bibleItems;
    if (selectedCategory === 'actions') return actionsList;
    if (selectedCategory === 'screens') return screensList;
    if (selectedCategory === 'sparks') return sparksList;
    return allItems;
  }, [selectedCategory, allItems, sceneItems, bibleItems, actionsList, screensList, sparksList]);

  // Query filtering
  const lowerQuery = query.toLowerCase().trim();
  const filtered: PaletteItem[] = useMemo(() => {
    if (!lowerQuery) {
      return categoryFiltered.slice(0, 18);
    }
    return categoryFiltered.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.category.toLowerCase().includes(lowerQuery) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(lowerQuery)) ||
        (item.badge && item.badge.toLowerCase().includes(lowerQuery))
    );
  }, [categoryFiltered, lowerQuery]);

  // Category counts for badges
  const categoryCounts = useMemo(() => {
    return {
      all: allItems.length,
      scenes: sceneItems.length,
      bible: bibleItems.length,
      actions: actionsList.length,
      screens: screensList.length,
      sparks: sparksList.length
    };
  }, [allItems, sceneItems, bibleItems, actionsList, screensList, sparksList]);

  const handleSelect = (item: PaletteItem) => {
    if (soundEnabled) playMechanicalSound('chime');
    item.action();
    if (item.category !== 'Sparks') {
      onClose();
    }
  };

  // Keep selected index in bounds if search query changes the filtered list
  useEffect(() => {
    if (filtered.length > 0 && selectedIndex >= filtered.length) {
      setSelectedIndex(Math.max(0, filtered.length - 1));
    }
  }, [filtered.length, selectedIndex]);

  // Comprehensive keyboard navigation handler
  // Catches Tab (cycling category tabs), ArrowDown/Up (driving through results), Enter, Escape, and Cmd+K
  useEffect(() => {
    if (!isOpen) return;

    const handleWindowKeyDown = (e: KeyboardEvent) => {
      // 1. Toggle / Close with Cmd+K or Ctrl+K
      const isK = e.key === 'k' || e.key === 'K' || e.key?.toLowerCase() === 'k' || e.code === 'KeyK';
      if ((e.metaKey || e.ctrlKey) && isK) {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }

      // 2. Escape to close or dismiss sub-modes
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        if (isBreathingMode) {
          setIsBreathingMode(false);
        } else if (activeTwist) {
          setActiveTwist(null);
        } else {
          onClose();
        }
        return;
      }

      // 3. Tab & Shift+Tab: Cycle through category tabs
      if (e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        isKeyboardNavRef.current = true;
        if (soundEnabled) playMechanicalSound('key');

        const currentIndex = CATEGORIES.indexOf(selectedCategory);
        const nextIndex = e.shiftKey
          ? (currentIndex - 1 + CATEGORIES.length) % CATEGORIES.length
          : (currentIndex + 1) % CATEGORIES.length;
        const nextCategory = CATEGORIES[nextIndex];
        setSelectedCategory(nextCategory);
        setSelectedIndex(0);

        // Keep text cursor in search input so user can seamlessly continue typing
        inputRef.current?.focus();
        return;
      }

      // 4. Arrow Down: Drive downward through the list
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        isKeyboardNavRef.current = true;
        if (soundEnabled) playMechanicalSound('key');
        setSelectedIndex((prev) => {
          if (filtered.length === 0) return 0;
          return (prev + 1) % filtered.length;
        });
        return;
      }

      // 5. Arrow Up: Drive upward through the list
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        isKeyboardNavRef.current = true;
        if (soundEnabled) playMechanicalSound('key');
        setSelectedIndex((prev) => {
          if (filtered.length === 0) return 0;
          return (prev - 1 + filtered.length) % filtered.length;
        });
        return;
      }

      // 6. Enter: Activate currently highlighted item
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        if (filtered[selectedIndex]) {
          handleSelect(filtered[selectedIndex]);
        }
        return;
      }
    };

    // Capture phase ensures immediate handling before any child consumes the event
    window.addEventListener('keydown', handleWindowKeyDown, true);
    return () => window.removeEventListener('keydown', handleWindowKeyDown, true);
  }, [isOpen, selectedCategory, filtered, selectedIndex, isBreathingMode, activeTwist, soundEnabled, onClose]);

  // Scroll active item into view with zero latency
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[selectedIndex] as HTMLElement | undefined;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'auto' });
      }
    }
  }, [selectedIndex]);

  // Scroll active category tab into view when cycling via Tab key
  useEffect(() => {
    if (tabsContainerRef.current) {
      const activeTabEl = tabsContainerRef.current.querySelector(
        `[data-tab-id="${selectedCategory}"]`
      ) as HTMLElement | null;
      if (activeTabEl) {
        activeTabEl.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedCategory]);

  // Highlight matching text query in title
  const renderHighlighted = (text: string, highlight: string) => {
    if (!highlight) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark
              key={i}
              className="bg-[#B54B32]/15 text-[#B54B32] font-bold px-0.5 rounded-[2px]"
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-4 bg-black/55 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -12 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[#FAF6EE] w-full max-w-2xl rounded-[14px] shadow-[0_24px_60px_-15px_rgba(20,18,14,0.4),0_0_0_1px_rgba(34,30,24,0.14)] overflow-hidden flex flex-col max-h-[82vh] border border-[rgba(34,30,24,0.18)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* TOP SEARCH BAR */}
          <div className="relative flex items-center px-4.5 py-3.5 border-b border-[rgba(34,30,24,0.12)] gap-3 bg-[#F1EAD9]/60">
            <div className="w-8 h-8 rounded-[8px] bg-[#B54B32]/10 text-[#B54B32] flex items-center justify-center shrink-0 border border-[#B54B32]/20">
              <Search size={16} strokeWidth={2.2} />
            </div>

            <input
              ref={inputRef}
              type="text"
              autoFocus
              tabIndex={1}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={(e) => {
                if (soundEnabled && e.key.length === 1 && !e.metaKey && !e.ctrlKey) {
                  playMechanicalSound('key');
                }
              }}
              placeholder="Search scenes, Story Bible lore, commands, or 'spark'..."
              className="w-full text-base sm:text-sm bg-transparent border-0 focus:outline-none text-[#221E18] placeholder-[#7A705F]/75 font-sans font-medium"
            />

            {/* Clear query button */}
            {query && (
              <button
                type="button"
                tabIndex={-1}
                onClick={() => {
                  setQuery('');
                  setSelectedIndex(0);
                  inputRef.current?.focus();
                }}
                className="p-1 rounded-[5px] text-[#7A705F] hover:text-[#221E18] hover:bg-[#FAF6EE] cursor-pointer transition-colors"
                title="Clear input"
              >
                <X size={15} />
              </button>
            )}

            {/* Fun Quick Actions in Search Header */}
            <div className="flex items-center gap-1.5 shrink-0 pl-1 border-l border-[rgba(34,30,24,0.12)]">
              {/* Typewriter Audio Toggle */}
              <button
                type="button"
                tabIndex={-1}
                onClick={toggleSound}
                className={`p-1.5 rounded-[6px] border transition-all cursor-pointer ${
                  soundEnabled
                    ? 'bg-[#B54B32]/15 text-[#B54B32] border-[#B54B32]/30 shadow-xs'
                    : 'text-[#7A705F] hover:text-[#221E18] hover:bg-[#FAF6EE] border-transparent'
                }`}
                title={soundEnabled ? 'Typewriter Clicks: ON (Click to mute)' : 'Typewriter Clicks: OFF (Click to unmute)'}
                aria-label="Toggle typewriter audio feedback"
              >
                {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              </button>

              {/* Instant Plot Twist Button */}
              <button
                type="button"
                tabIndex={-1}
                onClick={handleRollPlotTwist}
                className="flex items-center gap-1 px-2 py-1 rounded-[6px] text-xs font-medium bg-[#FAF6EE] text-[#35505F] hover:text-[#221E18] hover:bg-[#F1EAD9] border border-[rgba(34,30,24,0.14)] cursor-pointer transition-colors"
                title="Roll a sudden narrative plot twist spark"
              >
                <Dices size={14} className="text-[#B54B32]" />
                <span className="hidden sm:inline text-[11px] font-mono">Spark</span>
              </button>

              {/* ESC badge */}
              <kbd className="hidden sm:inline-flex items-center text-[10px] font-mono font-medium bg-[#FAF6EE] text-[#7A705F] px-1.5 py-0.5 rounded-[4px] border border-[rgba(34,30,24,0.16)]">
                ESC
              </kbd>
            </div>
          </div>

          {/* CATEGORY FILTER TABS / PILLS */}
          <div
            ref={tabsContainerRef}
            className="flex items-center gap-1 px-3 py-2 border-b border-[rgba(34,30,24,0.08)] bg-[#FAF6EE] overflow-x-auto no-scrollbar scroll-smooth"
          >
            {(
              [
                { id: 'all', label: 'All', count: categoryCounts.all },
                { id: 'scenes', label: 'Scenes', count: categoryCounts.scenes },
                { id: 'bible', label: 'Story Bible', count: categoryCounts.bible },
                { id: 'actions', label: 'Actions', count: categoryCounts.actions },
                { id: 'screens', label: 'Screens', count: categoryCounts.screens },
                { id: 'sparks', label: '✨ Sparks', count: categoryCounts.sparks }
              ] as const
            ).map((tab) => {
              const isSelected = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  tabIndex={-1}
                  data-tab-id={tab.id}
                  onClick={() => {
                    setSelectedCategory(tab.id);
                    setSelectedIndex(0);
                    inputRef.current?.focus();
                    if (soundEnabled) playMechanicalSound('key');
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#221E18] text-[#FAF6EE] shadow-xs'
                      : 'text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] font-mono px-1 rounded-full ${
                      isSelected ? 'bg-white/20 text-[#FAF6EE]' : 'bg-[#F1EAD9] text-[#7A705F]'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
            <div className="ml-auto hidden sm:flex items-center text-[10px] font-mono text-[#7A705F] shrink-0 pl-2">
              <span className="flex items-center gap-1">
                Press <kbd className="px-1 py-0.5 rounded bg-[#F1EAD9] border border-[rgba(34,30,24,0.1)] text-[#221E18]">Tab</kbd> to cycle
              </span>
            </div>
          </div>

          {/* INTERACTIVE FUN BANNER: PLOT TWIST SPARK */}
          {activeTwist && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-[#35505F] text-[#FAF6EE] p-3.5 mx-3 mt-3 rounded-[10px] border border-[#35505F] shadow-sm relative overflow-hidden flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#FAF6EE]/90 uppercase tracking-wider">
                  <Sparkles size={14} className="text-[#E6735A]" />
                  <span>Narrative Plot Twist Spark</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={handleRollPlotTwist}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-[5px] text-[11px] font-mono bg-white/15 hover:bg-white/25 text-[#FAF6EE] transition-colors cursor-pointer"
                    title="Roll another spark"
                  >
                    <RotateCcw size={12} />
                    <span>Roll Again</span>
                  </button>
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setActiveTwist(null)}
                    className="p-1 rounded-[5px] text-[#FAF6EE]/70 hover:text-[#FAF6EE] hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
              <p className="font-serif text-sm sm:text-base leading-snug italic text-[#FAF6EE] pr-4">
                "{activeTwist}"
              </p>
              <div className="flex items-center justify-between text-[11px] text-[#FAF6EE]/80 pt-1 border-t border-white/15">
                <span>Use this unexpected beat to break creative momentum block.</span>
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => {
                    onNavigateToScreen(projectType === 'screenplay' ? 'screenplay' : 'editor');
                    onClose();
                  }}
                  className="text-xs font-medium text-[#FAF6EE] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Draft this into active scene</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </motion.div>
          )}

          {/* INTERACTIVE FUN BANNER: 2-MINUTE MINDFUL RESET */}
          {isBreathingMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-[#221E18] text-[#FAF6EE] p-5 mx-3 mt-3 rounded-[10px] border border-[#221E18] shadow-md flex flex-col items-center justify-center text-center relative"
            >
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setIsBreathingMode(false)}
                className="absolute top-2.5 right-2.5 p-1 rounded-[5px] text-[#FAF6EE]/60 hover:text-[#FAF6EE] hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#7A705F] mb-3">
                Mindful Writer's Reset
              </div>

              {/* Visual pulsing breath circle */}
              <motion.div
                animate={{
                  scale: breathPhase === 'Inhale' ? 1.3 : breathPhase === 'Hold' ? 1.3 : 0.85,
                  opacity: breathPhase === 'Inhale' ? 0.95 : 0.75
                }}
                transition={{ duration: 3, ease: 'easeInOut' }}
                className="w-20 h-20 rounded-full bg-[#B54B32] flex items-center justify-center text-[#FAF6EE] font-bold text-xs shadow-[0_0_25px_rgba(181,75,50,0.5)] my-2"
              >
                <Coffee size={24} />
              </motion.div>

              <div className="font-serif text-lg text-[#FAF6EE] font-medium mt-2">
                {breathPhase}...
              </div>
              <p className="text-xs text-[#FAF6EE]/75 max-w-sm mt-1">
                Release narrative strain. Let the plot untangle in your subconscious.
              </p>

              <button
                type="button"
                tabIndex={-1}
                onClick={() => setIsBreathingMode(false)}
                className="mt-3 px-3 py-1 bg-white/10 hover:bg-white/20 text-[#FAF6EE] rounded-[6px] text-xs font-mono cursor-pointer transition-colors"
              >
                Done · Return to Manuscript
              </button>
            </motion.div>
          )}

          {/* RESULTS LIST */}
          <div
            ref={listRef}
            className="overflow-y-auto p-2 space-y-1 flex-1 min-h-[220px] max-h-[50vh]"
          >
            {filtered.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-10 h-10 rounded-full bg-[#F1EAD9] text-[#7A705F] flex items-center justify-center mx-auto mb-3">
                  <Search size={18} />
                </div>
                <div className="text-sm font-serif font-medium text-[#221E18]">
                  No matching elements found
                </div>
                <p className="text-xs text-[#7A705F] mt-1 max-w-xs mx-auto">
                  No scenes, entities, or commands matched "{query}". Try checking another tab or roll a creative spark.
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <button
                    onClick={handleRollPlotTwist}
                    className="btn-secondary text-xs h-8 px-3"
                  >
                    <Dices size={13} className="text-[#B54B32]" />
                    <span>Spark a Plot Twist</span>
                  </button>
                  <button
                    onClick={() => {
                      setQuery('');
                      setSelectedCategory('all');
                    }}
                    className="btn-secondary text-xs h-8 px-3"
                  >
                    <span>Reset Filter</span>
                  </button>
                </div>
              </div>
            ) : (
              filtered.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = idx === selectedIndex;

                // Category tint classes for distinct visual flair
                const isSpark = item.category === 'Sparks';
                const isScene = item.category === 'Scenes';
                const isBible = item.category === 'Story Bible';
                const isAction = item.category === 'Actions';

                const iconBg = isSelected
                  ? 'bg-white/20 text-[#FAF6EE]'
                  : isSpark
                  ? 'bg-[#8B5CF6]/15 text-[#8B5CF6]'
                  : isScene
                  ? 'bg-[#B54B32]/12 text-[#B54B32]'
                  : isBible
                  ? 'bg-[#35505F]/15 text-[#35505F]'
                  : isAction
                  ? 'bg-[#D9822B]/15 text-[#D9822B]'
                  : 'bg-[#221E18]/10 text-[#221E18]';

                return (
                  <button
                    key={item.id}
                    type="button"
                    tabIndex={-1}
                    onClick={() => handleSelect(item)}
                    onMouseMove={() => {
                      if (isKeyboardNavRef.current) {
                        isKeyboardNavRef.current = false;
                      }
                      if (selectedIndex !== idx) {
                        setSelectedIndex(idx);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[9px] text-left transition-all duration-100 cursor-pointer group relative ${
                      isSelected
                        ? 'bg-[#221E18] text-[#FAF6EE] shadow-sm translate-x-0.5'
                        : 'text-[#221E18] hover:bg-[#F1EAD9]/80'
                    }`}
                  >
                    {/* Active left indicator pill */}
                    {isSelected && (
                      <motion.div
                        layoutId="active-indicator"
                        className="absolute left-0 top-2 bottom-2 w-1 bg-[#B54B32] rounded-r-full"
                      />
                    )}

                    <div className="flex items-center gap-3 min-w-0 pr-2 pl-1">
                      <div className={`p-2 rounded-[8px] shrink-0 transition-colors ${iconBg}`}>
                        <Icon size={16} strokeWidth={1.8} />
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs sm:text-[13px] font-semibold truncate flex items-center gap-2">
                          <span>{renderHighlighted(item.title, query)}</span>
                          {item.badge && (
                            <span
                              className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded ${
                                isSelected
                                  ? 'bg-white/15 text-[#FAF6EE]/90'
                                  : 'bg-[#F1EAD9] text-[#7A705F]'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>

                        {item.subtitle && (
                          <div
                            className={`text-[11px] truncate mt-0.5 leading-normal ${
                              isSelected ? 'text-[#FAF6EE]/75' : 'text-[#7A705F]'
                            }`}
                          >
                            {renderHighlighted(item.subtitle, query)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.shortcut && (
                        <kbd
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded-[4px] border ${
                            isSelected
                              ? 'bg-white/10 text-[#FAF6EE] border-white/20'
                              : 'bg-[#FAF6EE] text-[#7A705F] border-[rgba(34,30,24,0.14)]'
                          }`}
                        >
                          {item.shortcut}
                        </kbd>
                      )}

                      <span
                        className={`text-[10px] font-mono uppercase tracking-wider hidden sm:inline ${
                          isSelected ? 'text-[#FAF6EE]/60' : 'text-[#7A705F]/80'
                        }`}
                      >
                        {item.category}
                      </span>

                      <CornerDownLeft
                        size={13}
                        className={`transition-opacity ${
                          isSelected ? 'text-[#B54B32] opacity-100' : 'opacity-0'
                        }`}
                      />
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* SLEEK & INSPIRATIONAL FOOTER */}
          <div className="px-4 py-2.5 border-t border-[rgba(34,30,24,0.12)] bg-[#F1EAD9]/70 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-sans text-[#7A705F]">
            {/* Left navigation shortcuts */}
            <div className="flex items-center gap-3 font-mono text-[10px]">
              <span className="flex items-center gap-1">
                <kbd className="bg-[#FAF6EE] px-1.5 py-0.5 rounded-[4px] border border-[rgba(34,30,24,0.16)] text-[#221E18]">
                  ↑↓
                </kbd>{' '}
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="bg-[#FAF6EE] px-1.5 py-0.5 rounded-[4px] border border-[rgba(34,30,24,0.16)] text-[#221E18]">
                  ↵
                </kbd>{' '}
                Select
              </span>
              <span className="flex items-center gap-1 hidden sm:inline-flex">
                <kbd className="bg-[#FAF6EE] px-1.5 py-0.5 rounded-[4px] border border-[rgba(34,30,24,0.16)] text-[#221E18]">
                  Tab
                </kbd>{' '}
                Cycle Tabs
              </span>
            </div>

            {/* Right: Fun rotating quote / easter egg */}
            <div className="flex items-center gap-1.5 text-xs text-[#221E18]/80 italic truncate max-w-sm sm:max-w-md">
              <Quote size={11} className="text-[#B54B32] shrink-0" />
              <span className="truncate font-serif text-[11.5px]">
                "{currentQuote.quote}"
              </span>
              <span className="text-[10px] font-mono text-[#7A705F] not-italic shrink-0">
                — {currentQuote.author}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
