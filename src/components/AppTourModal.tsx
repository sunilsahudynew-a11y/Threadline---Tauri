import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  BookOpen,
  Layers,
  Compass,
  Sparkles,
  HardDrive,
  Feather,
  Smartphone,
  CheckCircle2,
  FolderKanban
} from 'lucide-react';
import { markTourCompleted } from '../utils/cookieUtils';
import { ThreadlineBadge } from './common/ThreadlineLogo';

interface AppTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToScreen?: (screen: any) => void;
}

interface TourStep {
  title: string;
  badge: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accentColor: string;
  headline: string;
  description: string;
  highlights: { title: string; detail: string }[];
  targetScreen?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome to Threadline',
    badge: 'Overview',
    icon: Feather,
    accentColor: '#B54B32',
    headline: 'The Distraction-Free Long-Form Novel Studio',
    description:
      'Threadline is crafted specifically for authors, novelists, and narrative designers. Everything is designed around deep creative flow, local data ownership, and manuscript continuity.',
    highlights: [
      { title: 'Privacy & Ownership', detail: 'Your words stay on your device or local folder vault. No mandatory cloud lock-in.' },
      { title: 'Dramatic Architecture', detail: 'Native support for 3-Act structure, Save the Cat beats, and multi-POV tracking.' },
      { title: 'Continuity Intelligence', detail: 'Automatic contradiction tracking across character lore, timelines, and scenes.' }
    ]
  },
  {
    title: 'Adaptive Navigation',
    badge: 'Desktop & Mobile',
    icon: Smartphone,
    accentColor: '#35505F',
    headline: 'Sidebar on Large Screens, Bottom Bar on Mobile',
    description:
      'Threadline automatically adapts to your display. Enjoy a full Notion-style collapsible sidebar with chapter tree on desktop and tablet screens, and a thumb-reachable bottom navigation bar on mobile.',
    highlights: [
      { title: 'Desktop & Tablet', detail: 'Notion-style collapsible sidebar with drag reordering and chapter hierarchies.' },
      { title: 'Mobile Screens', detail: 'Ergonomic 5-tab bottom navigation with instant access to Write, Corkboard, Codex, and More.' },
      { title: 'Universal Command Palette', detail: 'Press ⌘K or Ctrl+K anywhere to jump between chapters, characters, and actions.' }
    ]
  },
  {
    title: 'Distraction-Free Prose Editor',
    badge: 'Manuscript',
    icon: BookOpen,
    accentColor: '#B54B32',
    headline: 'Craft with Typewriter Scroll & Deep Focus',
    description:
      'The editor is engineered for uninterrupted writing. Toggle Focus Mode to dim everything except your current paragraph, enable typewriter scrolling, and monitor live word targets.',
    highlights: [
      { title: 'Typewriter Centering', detail: 'Keeps your active line comfortably centered on the screen as you draft.' },
      { title: 'Margin Scratchpad & Cuts', detail: 'Clip text safely into your personal Cutting Room instead of deleting drafts.' },
      { title: 'POV & Beat Metadata', detail: 'Easily tag Point-of-View characters, chapter status, and dramatic tension.' }
    ]
  },
  {
    title: 'Dynamic Corkboard & Beats',
    badge: 'Structure',
    icon: Layers,
    accentColor: '#8C5E39',
    headline: 'Save the Cat & Three-Act Structure Visualizer',
    description:
      'Step back and view your entire manuscript as tangible index cards. Group by Chapters, Three-Act Phases, or the canonical 12 Dramatic Beats to ensure pitch-perfect narrative pacing.',
    highlights: [
      { title: 'Multi-View Layouts', detail: 'Switch seamlessly between Chapter View, Act View, and 12 Dramatic Beats.' },
      { title: 'Status Tracking', detail: 'Visual badges for drafts, revised chapters, and polished final scenes.' },
      { title: 'Pacing Ribbon', detail: 'Real-time manuscript word distribution against your book target.' }
    ]
  },
  {
    title: 'Codex & Continuity Engine',
    badge: 'Worldbuilding',
    icon: Compass,
    accentColor: '#2D6A4F',
    headline: 'Living Story Bible with Automatic Flaw Detection',
    description:
      'Track characters, locations, artifacts, factions, and subplot threads. The built-in Continuity Auditor detects contradictions between your manuscript prose and your established lore.',
    highlights: [
      { title: 'Story Bible Codex', detail: 'Rich profiles with character arcs, aliases, physical traits, and relationships.' },
      { title: 'Subplot Threadlines', detail: 'Visualize romantic tensions, mystery clues, and rivalries across chapters.' },
      { title: 'Continuity Inbox', detail: 'Flag eye-color discrepancies, broken timelines, and forgotten plot promises.' }
    ]
  },
  {
    title: 'Obsidian-Style Vault & Export',
    badge: 'Storage & Output',
    icon: HardDrive,
    accentColor: '#221E18',
    headline: 'Direct Disk Sync & Industry-Standard Publishing',
    description:
      'Connect any local folder on your computer (macOS DMG or browser File System). Threadline syncs human-readable Markdown files with YAML frontmatter, ready for git or Obsidian.',
    highlights: [
      { title: 'Local Vault Sync', detail: 'Sync directly to your Documents folder or Obsidian vault with zero friction.' },
      { title: 'Full Compilation', detail: 'Export clean Markdown, print-ready PDF, standard EPUB, and DOCX formats.' },
      { title: 'Point-in-Time Snapshots', detail: 'Take instant rollback snapshots before embarking on major structural revisions.' }
    ]
  }
];

export const AppTourModal: React.FC<AppTourModalProps> = ({
  isOpen,
  onClose,
  onNavigateToScreen
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Keyboard navigation (Arrow keys and Escape)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleFinish();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex]);

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];
  const StepIcon = currentStep.icon;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleFinish();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    markTourCompleted();
    onClose();
  };

  const handleStepJump = (idx: number) => {
    setCurrentStepIndex(idx);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in select-none">
      <div
        className="bg-[#FAF6EE] border border-[rgba(34,30,24,0.16)] rounded-[8px] shadow-warm-modal max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[rgba(34,30,24,0.12)] flex items-center justify-between bg-[#F1EAD9]">
          <div className="flex items-center gap-3">
            <ThreadlineBadge size={28} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-serif font-bold text-[#221E18]">
                  Threadline Studio Tour
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] text-[#7A705F]">
                  Step {currentStepIndex + 1} of {TOUR_STEPS.length}
                </span>
              </div>
              <p className="text-xs text-[#7A705F]">
                Quick orientation guide for new authors
              </p>
            </div>
          </div>
          <button
            onClick={handleFinish}
            className="p-1.5 text-[#7A705F] hover:text-[#221E18] hover:bg-[#FAF6EE] rounded-[5px] transition-colors cursor-pointer"
            title="Close and finish tour"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step Progression Bar */}
        <div className="flex w-full bg-[#F1EAD9] h-1.5">
          {TOUR_STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`h-full flex-1 transition-all duration-300 ${
                idx <= currentStepIndex ? 'bg-[#B54B32]' : 'bg-[rgba(34,30,24,0.08)]'
              }`}
            />
          ))}
        </div>

        {/* Step Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-[#221E18]">
          {/* Step Category Badge & Icon */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-[6px] flex items-center justify-center shrink-0 border border-[rgba(34,30,24,0.12)] shadow-warm-xs"
              style={{ backgroundColor: '#F1EAD9', color: currentStep.accentColor }}
            >
              <StepIcon size={22} />
            </div>
            <div>
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#7A705F]">
                {currentStep.badge}
              </span>
              <h3 className="font-serif font-bold text-lg text-[#221E18] leading-snug">
                {currentStep.headline}
              </h3>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-[#7A705F] leading-relaxed">
            {currentStep.description}
          </p>

          {/* Highlight Points Card */}
          <div className="bg-[#F1EAD9] border border-[rgba(34,30,24,0.12)] rounded-[6px] p-4 space-y-3 shadow-warm-xs">
            {currentStep.highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#35505F] shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <strong className="text-[#221E18] font-medium">{h.title}: </strong>
                  <span className="text-[#7A705F]">{h.detail}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Step Pill Indicators */}
          <div className="flex items-center justify-center gap-1.5 pt-2">
            {TOUR_STEPS.map((step, idx) => (
              <button
                key={idx}
                onClick={() => handleStepJump(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentStepIndex
                    ? 'w-6 bg-[#B54B32]'
                    : 'w-2 bg-[rgba(34,30,24,0.2)] hover:bg-[rgba(34,30,24,0.4)]'
                }`}
                title={step.title}
                aria-label={`Jump to ${step.title}`}
              />
            ))}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-[#F1EAD9] border-t border-[rgba(34,30,24,0.12)] flex items-center justify-between">
          <button
            onClick={handleFinish}
            className="text-xs text-[#7A705F] hover:text-[#221E18] font-medium cursor-pointer transition-colors"
          >
            Skip Tour
          </button>

          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[rgba(34,30,24,0.16)] bg-[#FAF6EE] text-[#221E18] text-xs font-medium hover:bg-[#F1EAD9] transition-colors cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Previous</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-[6px] bg-[#B54B32] hover:bg-[#9E3E27] text-[#FAF6EE] text-xs font-semibold shadow-warm-xs transition-colors cursor-pointer"
            >
              <span>{isLastStep ? 'Get Started' : 'Next Step'}</span>
              {isLastStep ? <Check size={14} /> : <ArrowRight size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
