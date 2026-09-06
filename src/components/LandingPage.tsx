import React, { useState } from 'react';
import {
  FileText,
  Layers,
  Compass,
  Sparkles,
  Sliders,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
  BookOpen,
  FolderKanban,
  Download,
  Terminal,
  Lock,
  Clock,
  Scissors,
  Bookmark,
  Check,
  Eye,
  ChevronRight,
  HardDrive
} from 'lucide-react';
import { ThreadlineMark, ThreadlineBadge } from './common/ThreadlineLogo';
import { ScreenType } from './Navigation';

interface LandingPageProps {
  onEnterStudio: (initialScreen?: ScreenType) => void;
  onOpenSampleProject?: (projectId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterStudio,
  onOpenSampleProject
}) => {
  const [activeInteractiveTab, setActiveInteractiveTab] = useState<'canvas' | 'corkboard' | 'codex' | 'continuity'>('canvas');
  const [calculatorWords, setCalculatorWords] = useState<number>(80000);
  const [calculatorDailyRate, setCalculatorDailyRate] = useState<number>(800);

  const estimatedDays = Math.ceil(calculatorWords / calculatorDailyRate);
  const estimatedMonths = (estimatedDays / 30.5).toFixed(1);

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#221E18] selection:bg-[#F1EAD9] selection:text-[#221E18] font-sans">
      {/* 1. TOP EDITORIAL BANNER */}
      <div className="bg-[#F1EAD9] text-[#221E18] text-xs font-sans py-2.5 px-4 border-b border-[rgba(34,30,24,0.12)] flex flex-wrap items-center justify-center gap-2.5 shadow-warm-sm transition-colors">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] text-[10px] font-mono font-medium text-[#7A705F]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B54B32]" />
          <span className="tracking-[0.14em] uppercase text-[#B54B32] font-semibold">Editorial Edition</span>
        </div>
        <span className="text-[#221E18] font-medium tracking-tight">
          Local-first manuscript drafting with the 42% optical typewriter horizon.
        </span>
        <button
          onClick={() => onEnterStudio('editor')}
          className="inline-flex items-center gap-1 font-semibold text-[#B54B32] hover:text-[#9E3E27] transition-colors cursor-pointer group underline-offset-4 hover:underline"
        >
          <span>Open Canvas</span>
          <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* 2. PRIMARY NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 bg-[#FAF6EE]/95 backdrop-blur-md border-b border-[rgba(34,30,24,0.12)] transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => onEnterStudio('home')}
              className="flex items-center gap-2.5 cursor-pointer text-left group"
            >
              <ThreadlineBadge size={28} />
              <div className="flex flex-col leading-none">
                <span className="font-serif font-semibold text-base tracking-tight text-[#221E18] group-hover:text-[#B54B32] transition-colors">
                  Threadline
                </span>
                <span className="text-[9px] font-sans font-semibold tracking-[0.16em] uppercase text-[#7A705F]">
                  Narrative Studio
                </span>
              </div>
            </button>

            {/* In-page navigation links */}
            <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-[#7A705F]">
              <a href="#canvas" className="hover:text-[#221E18] transition-colors">
                Manuscript Canvas
              </a>
              <a href="#corkboard" className="hover:text-[#221E18] transition-colors">
                Corkboard
              </a>
              <a href="#codex" className="hover:text-[#221E18] transition-colors">
                Codex &amp; Lore
              </a>
              <a href="#continuity" className="hover:text-[#221E18] transition-colors">
                Continuity Radar
              </a>
              <a href="#manifesto" className="hover:text-[#221E18] transition-colors">
                Local Vault
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onEnterStudio('projects')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs font-medium text-[#221E18] bg-[#F1EAD9] hover:bg-[#EAE4D6] border border-[rgba(34,30,24,0.12)] transition-colors cursor-pointer min-h-[36px]"
            >
              <FolderKanban size={13} className="text-[#7A705F]" />
              <span>Manuscripts</span>
            </button>

            <button
              onClick={() => onEnterStudio('editor')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] text-xs font-semibold text-[#FAF6EE] bg-[#B54B32] hover:bg-[#9E3E27] shadow-warm-sm transition-all active:scale-98 cursor-pointer min-h-[36px]"
            >
              <span>Launch Studio</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className="pt-14 md:pt-20 pb-16 px-4 sm:px-6 relative overflow-hidden border-b border-[rgba(34,30,24,0.12)]">
        {/* Decorative background watermark */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 opacity-5 pointer-events-none">
          <ThreadlineMark size={680} color="#221E18" knotColor="#B54B32" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F1EAD9] border border-[rgba(34,30,24,0.12)] text-[#7A705F] text-[11px] font-mono font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-[#B54B32]" />
            <span className="tracking-[0.16em] uppercase">The Novelist's Private Workspace</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-semibold text-[#221E18] tracking-tight leading-[1.12] mb-6">
            Keep the story connected.
            <br />
            <span className="italic font-normal text-[#B54B32]">Keep the voice yours.</span>
          </h1>

          {/* Deck */}
          <p className="text-base sm:text-lg md:text-xl text-[#7A705F] max-w-2xl mx-auto font-sans leading-relaxed mb-8">
            The distraction-free narrative workspace for novelists and long-form storytellers. Structure your chapters with proven frameworks, track canon lore with zero clutter, and draft at eye-level on a calm paper canvas.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
            <button
              onClick={() => onEnterStudio('editor')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-[6px] text-sm font-semibold text-[#FAF6EE] bg-[#B54B32] hover:bg-[#9E3E27] shadow-warm-modal transition-all active:scale-98 cursor-pointer min-h-[44px]"
            >
              <span>Start Writing Immediately</span>
              <ArrowRight size={15} />
            </button>

            <button
              onClick={() => {
                if (onOpenSampleProject) {
                  onOpenSampleProject('proj-1');
                } else {
                  onEnterStudio('home');
                }
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-[6px] text-sm font-medium text-[#221E18] bg-[#F1EAD9] hover:bg-[#EAE4D6] border border-[rgba(34,30,24,0.12)] transition-all cursor-pointer min-h-[44px]"
            >
              <BookOpen size={15} className="text-[#35505F]" />
              <span>Explore Demo Manuscript</span>
            </button>
          </div>

          {/* Architecture Trust Highlights */}
          <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-[#7A705F] font-mono pt-4 border-t border-[rgba(34,30,24,0.12)] max-w-2xl mx-auto">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#35505F]" /> 100% Local-First &amp; Private
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Zap size={14} className="text-[#B54B32]" /> Zero Cloud Telemetry
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Terminal size={14} className="text-[#35505F]" /> Plain Markdown Portability
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Lock size={14} className="text-[#7A705F]" /> No Account Required
            </span>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE LIVE PRODUCT DEMO / EXPLORER */}
      <section className="py-16 px-4 sm:px-6 bg-[#F1EAD9]/40 border-b border-[rgba(34,30,24,0.12)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="section-label block mb-2">Interactive Workspace</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#221E18]">
              Four Integrated Narrative Systems
            </h2>
            <p className="text-xs sm:text-sm text-[#7A705F] mt-2">
              Explore how Threadline keeps prose, character canon, story structure, and continuity in sync.
            </p>
          </div>

          {/* Tab Selection Row */}
          <div className="flex items-center justify-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
            {[
              { id: 'canvas', label: 'Manuscript Canvas', icon: FileText },
              { id: 'corkboard', label: 'Corkboard Matrix', icon: Layers },
              { id: 'codex', label: 'Codex & Lore Vault', icon: Compass },
              { id: 'continuity', label: 'Continuity Radar', icon: Sparkles }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeInteractiveTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveInteractiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-[6px] text-xs font-medium transition-all cursor-pointer min-h-[44px] ${
                    isActive
                      ? 'bg-[#FAF6EE] text-[#221E18] font-semibold border border-[rgba(34,30,24,0.12)] shadow-warm-sm'
                      : 'text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9]'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-[#B54B32]' : 'text-[#7A705F]'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Display Card */}
          <div className="bg-[#FAF6EE] rounded-[6px] border border-[rgba(34,30,24,0.12)] shadow-warm-modal overflow-hidden p-6 md:p-8">
            {activeInteractiveTab === 'canvas' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-[rgba(34,30,24,0.12)] pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono uppercase text-[#7A705F]">Chapter 01 · Scene 01</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#35505F]" />
                    <span className="text-xs font-medium text-[#35505F]">Drafting Mode</span>
                  </div>
                  <div className="text-xs font-mono text-[#7A705F]">
                    Typewriter Horizon: <span className="text-[#221E18] font-bold">42%</span>
                  </div>
                </div>

                <div className="max-w-2xl mx-auto py-6 font-serif text-lg leading-relaxed text-[#221E18]">
                  <p className="mb-4">
                    The iron bell of St. Jude tolled three minutes past midnight. Below the clocktower, the harbor smelled of low tide and charred spruce, the unmistakable perfume of the northern slipways.
                  </p>
                  <p className="p-3 bg-[#F1EAD9] rounded-[6px] border-l-2 border-[#B54B32] text-sm font-sans italic text-[#221E18]">
                    <span className="font-semibold text-[#B54B32] not-italic mr-2">Caret Anchored:</span>
                    Your eye stays locked on the horizon line while prose flows beneath it without neck strain.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[rgba(34,30,24,0.12)] text-xs text-[#7A705F]">
                  <div className="flex items-center gap-4">
                    <span>Target: 2,500 words</span>
                    <span>Actual: 1,840 words (73%)</span>
                  </div>
                  <button
                    onClick={() => onEnterStudio('editor')}
                    className="inline-flex items-center gap-1.5 font-semibold text-[#B54B32] hover:underline cursor-pointer"
                  >
                    <span>Try in Editor</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            )}

            {activeInteractiveTab === 'corkboard' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-[rgba(34,30,24,0.12)] pb-4">
                  <div className="flex items-center gap-2">
                    <Layers size={15} className="text-[#B54B32]" />
                    <span className="font-serif font-semibold text-sm">Act I: The Call &amp; Crossing</span>
                  </div>
                  <span className="text-xs font-mono text-[#7A705F]">Index Card Grid (4 scenes)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {[
                    { num: '01', title: 'The Harbor Bell', status: 'Drafting', color: '#35505F', words: '1,840', pov: 'Evelyn Gray' },
                    { num: '02', title: 'The Ledger Office', status: 'Revised', color: '#B54B32', words: '2,100', pov: 'Marcus Vance' },
                    { num: '03', title: 'Whispers at the Quay', status: 'Idea', color: '#7A705F', words: '950', pov: 'Evelyn Gray' }
                  ].map((card) => (
                    <div key={card.num} className="bg-[#F1EAD9] p-4 rounded-[6px] border border-[rgba(34,30,24,0.12)] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-[#7A705F]">Scene {card.num}</span>
                        <span
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded-[4px] font-semibold text-[#FAF6EE]"
                          style={{ backgroundColor: card.color }}
                        >
                          {card.status}
                        </span>
                      </div>
                      <div className="font-serif font-semibold text-sm text-[#221E18]">{card.title}</div>
                      <div className="text-[11px] text-[#7A705F] flex items-center justify-between pt-2 border-t border-[rgba(34,30,24,0.08)]">
                        <span>POV: {card.pov}</span>
                        <span>{card.words} w</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[rgba(34,30,24,0.12)] text-xs text-[#7A705F]">
                  <span>Pacing heatmap &amp; chapter word-count quotas update automatically.</span>
                  <button
                    onClick={() => onEnterStudio('dashboard')}
                    className="inline-flex items-center gap-1.5 font-semibold text-[#B54B32] hover:underline cursor-pointer"
                  >
                    <span>Open Corkboard</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            )}

            {activeInteractiveTab === 'codex' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-[rgba(34,30,24,0.12)] pb-4">
                  <div className="flex items-center gap-2">
                    <Compass size={15} className="text-[#35505F]" />
                    <span className="font-serif font-semibold text-sm">Codex Profile: Evelyn Gray (Protagonist)</span>
                  </div>
                  <span className="text-xs font-mono text-[#35505F] bg-[#35505F]/10 px-2 py-0.5 rounded-[4px]">
                    Confirmed Canon
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-[#F1EAD9] p-4 rounded-[6px] border border-[rgba(34,30,24,0.12)] space-y-2">
                    <div className="font-semibold text-[#221E18] uppercase tracking-wider text-[10px] font-mono">
                      Canonical Facts
                    </div>
                    <ul className="space-y-1.5 text-[#221E18]">
                      <li className="flex items-start gap-1.5">
                        <span className="text-[#B54B32]">•</span> Eye color: Hazel (confirmed Chapter 01)
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-[#B54B32]">•</span> Age: 31 during Harbor Riots
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-[#B54B32]">•</span> Motivation: Vindicate father's lost ledger
                      </li>
                    </ul>
                  </div>

                  <div className="bg-[#F1EAD9] p-4 rounded-[6px] border border-[rgba(34,30,24,0.12)] space-y-2">
                    <div className="font-semibold text-[#221E18] uppercase tracking-wider text-[10px] font-mono">
                      Bidirectional Presence
                    </div>
                    <div className="space-y-1.5 text-[#7A705F]">
                      <div className="flex items-center justify-between">
                        <span>Ch. 01: The Harbor Bell</span>
                        <span className="text-[#221E18] font-medium">Primary POV</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Ch. 03: Whispers at Quay</span>
                        <span className="text-[#221E18] font-medium">Participant</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Ch. 07: The Vault Below</span>
                        <span className="text-[#7A705F]">Mentioned only</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[rgba(34,30,24,0.12)] text-xs text-[#7A705F]">
                  <span>Inline mention engine links @Character and #Lore directly inside your prose.</span>
                  <button
                    onClick={() => onEnterStudio('codex')}
                    className="inline-flex items-center gap-1.5 font-semibold text-[#B54B32] hover:underline cursor-pointer"
                  >
                    <span>Explore Codex</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            )}

            {activeInteractiveTab === 'continuity' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-[rgba(34,30,24,0.12)] pb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles size={15} className="text-[#B54B32]" />
                    <span className="font-serif font-semibold text-sm">Continuity Radar &amp; Inquiry Inbox</span>
                  </div>
                  <span className="text-xs font-mono text-[#B54B32] bg-[#B54B32]/10 px-2 py-0.5 rounded-[4px] font-semibold">
                    1 Critical Warning Active
                  </span>
                </div>

                <div className="bg-[#F1EAD9] p-4 rounded-[6px] border border-[rgba(34,30,24,0.12)] space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#B54B32]" />
                        <span className="font-serif font-semibold text-sm text-[#221E18]">
                          Eye Color Inconsistency: Evelyn Gray
                        </span>
                      </div>
                      <p className="text-xs text-[#7A705F] mt-1">
                        Scene 01 states Evelyn has "hazel eyes," but Scene 09 describes her with "steely blue eyes in the rain."
                      </p>
                    </div>
                    <button
                      onClick={() => onEnterStudio('continuity')}
                      className="px-2.5 py-1 text-xs font-medium text-[#FAF6EE] bg-[#B54B32] rounded-[6px] cursor-pointer shrink-0"
                    >
                      Resolve Flag
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[rgba(34,30,24,0.12)] text-xs text-[#7A705F]">
                  <span>Automated audit checks your timeline, entity attributes, and travel durations.</span>
                  <button
                    onClick={() => onEnterStudio('continuity')}
                    className="inline-flex items-center gap-1.5 font-semibold text-[#B54B32] hover:underline cursor-pointer"
                  >
                    <span>Open Continuity Inbox</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. LOCAL-FIRST MANIFESTO & ZERO LOCK-IN ARCHITECTURE */}
      <section id="manifesto" className="py-20 px-4 sm:px-6 border-b border-[rgba(34,30,24,0.12)]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="section-label block mb-2">Zero Platform Lock-In</span>
            <h2 className="text-3xl font-serif font-semibold text-[#221E18]">
              Your Words Live in Plain Files on Your Disk
            </h2>
            <p className="text-sm text-[#7A705F] mt-2">
              Threadline does not trap your life's work in a proprietary cloud database or closed binary bundle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="bg-[#F1EAD9] p-6 rounded-[6px] border border-[rgba(34,30,24,0.12)] font-mono text-xs text-[#221E18] space-y-2">
              <div className="text-[#7A705F] pb-2 border-b border-[rgba(34,30,24,0.12)] flex items-center justify-between">
                <span>📁 MyNovel_Vault/</span>
                <span className="text-[10px] text-[#35505F]">Obsidian Compatible</span>
              </div>
              <div className="space-y-1.5 pl-2 text-[11px]">
                <div>📄 project.json</div>
                <div>📁 Manuscript/</div>
                <div className="pl-4 text-[#B54B32]">📄 01 - The Harbor.md</div>
                <div className="pl-4 text-[#B54B32]">📄 02 - Whispers.md</div>
                <div className="pl-4 text-[#B54B32]">📄 03 - Midnight.md</div>
                <div>📁 StoryBible/</div>
                <div className="pl-4 text-[#35505F]">📄 entities.json</div>
                <div className="pl-4 text-[#35505F]">📄 timeline.json</div>
                <div>📁 CuttingRoom/</div>
                <div className="pl-4 text-[#7A705F]">📄 cuts.json</div>
                <div>📁 Notes/</div>
                <div className="pl-4 text-[#7A705F]">📄 scratchpad.md</div>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-[#7A705F] leading-relaxed">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-[#35505F] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#221E18] block text-sm">Pure Markdown Files</strong>
                  Every chapter and scene is written as standard Markdown with clean frontmatter. You can open them in Obsidian, VS Code, iA Writer, or standard text editors.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-[#35505F] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#221E18] block text-sm">Git &amp; Backup Friendly</strong>
                  Track your revisions with standard Git, sync with iCloud or Dropbox, or keep it on an offline encrypted hard drive.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-[#35505F] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#221E18] block text-sm">Native Desktop &amp; Responsive Web</strong>
                  Runs natively on macOS and Windows via Tauri v2 with instant local file writes, and operates as a companion studio on mobile browsers.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. WORD COUNT SPRINT ESTIMATOR */}
      <section className="py-16 px-4 sm:px-6 bg-[#F1EAD9]/40 border-b border-[rgba(34,30,24,0.12)]">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <span className="section-label block">Drafting Pace Calculator</span>
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#221E18]">
            Plan Your Manuscript Horizon
          </h2>

          <div className="bg-[#FAF6EE] p-6 rounded-[6px] border border-[rgba(34,30,24,0.12)] shadow-warm-sm space-y-5 text-left">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span>Target Manuscript Word Count:</span>
                <span className="font-mono font-bold text-[#B54B32]">{calculatorWords.toLocaleString()} words</span>
              </div>
              <input
                type="range"
                min="20000"
                max="150000"
                step="5000"
                value={calculatorWords}
                onChange={(e) => setCalculatorWords(Number(e.target.value))}
                className="w-full accent-[#B54B32] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span>Daily Drafting Pace:</span>
                <span className="font-mono font-bold text-[#35505F]">{calculatorDailyRate} words / day</span>
              </div>
              <input
                type="range"
                min="250"
                max="2500"
                step="50"
                value={calculatorDailyRate}
                onChange={(e) => setCalculatorDailyRate(Number(e.target.value))}
                className="w-full accent-[#35505F] cursor-pointer"
              />
            </div>

            <div className="pt-4 border-t border-[rgba(34,30,24,0.12)] flex items-center justify-between text-center">
              <div>
                <div className="text-2xl sm:text-3xl font-serif font-bold text-[#221E18]">{estimatedDays}</div>
                <div className="text-[11px] text-[#7A705F] uppercase font-mono tracking-wider">Writing Days</div>
              </div>
              <div className="h-8 w-px bg-[rgba(34,30,24,0.12)]" />
              <div>
                <div className="text-2xl sm:text-3xl font-serif font-bold text-[#B54B32]">{estimatedMonths}</div>
                <div className="text-[11px] text-[#7A705F] uppercase font-mono tracking-wider">Months to Complete</div>
              </div>
              <div className="h-8 w-px bg-[rgba(34,30,24,0.12)]" />
              <div>
                <button
                  onClick={() => onEnterStudio('new-project')}
                  className="px-3.5 py-2 rounded-[6px] bg-[#221E18] text-[#FAF6EE] text-xs font-semibold hover:bg-black transition-colors cursor-pointer min-h-[40px]"
                >
                  Start Manuscript
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="py-12 px-4 sm:px-6 bg-[#FAF6EE] text-xs text-[#7A705F]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <ThreadlineBadge size={24} />
            <span className="font-serif font-semibold text-[#221E18]">Threadline Studio</span>
            <span className="text-[11px]">·</span>
            <span>Version 1.0 (Editorial)</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => onEnterStudio('projects')} className="hover:text-[#221E18] transition-colors cursor-pointer">
              Manuscripts Hub
            </button>
            <button onClick={() => onEnterStudio('editor')} className="hover:text-[#221E18] transition-colors cursor-pointer">
              Editor
            </button>
            <button onClick={() => onEnterStudio('dashboard')} className="hover:text-[#221E18] transition-colors cursor-pointer">
              Corkboard
            </button>
            <button onClick={() => onEnterStudio('codex')} className="hover:text-[#221E18] transition-colors cursor-pointer">
              Codex
            </button>
            <button onClick={() => onEnterStudio('export')} className="hover:text-[#221E18] transition-colors cursor-pointer">
              Export
            </button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto text-center sm:text-left mt-6 pt-6 border-t border-[rgba(34,30,24,0.12)]">
          "Keep the story connected. Keep the voice yours." Built for novelists and long-form narrative architects.
        </div>
      </footer>
    </div>
  );
};
