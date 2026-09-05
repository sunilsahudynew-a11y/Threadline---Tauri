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
  AlignVerticalJustifyCenter,
  BookOpen,
  FolderKanban,
  Download,
  Terminal,
  Lock,
  Feather,
  Clock,
  History,
  Scissors,
  Bookmark,
  Check,
  ChevronRight
} from 'lucide-react';
import { ThreadlineMark, ThreadlineBadge, ThreadlineLogo } from './common/ThreadlineLogo';
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
  const [calculatorWords, setCalculatorWords] = useState<number>(75000);
  const [calculatorDailyRate, setCalculatorDailyRate] = useState<number>(750);

  const estimatedDays = Math.ceil(calculatorWords / calculatorDailyRate);
  const estimatedMonths = (estimatedDays / 30.5).toFixed(1);

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#221E18] selection:bg-[#F1EAD9] selection:text-[#221E18] font-sans">
      {/* 1. TOP ANNOUNCEMENT / ORIENTATION BANNER */}
      <div className="bg-[#F1EAD9] text-[#221E18] text-xs font-sans py-2 px-4 border-b border-[#E5DEC9] flex flex-wrap items-center justify-center gap-2.5 shadow-warm-sm transition-colors">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FAF6EE] border border-[#E5DEC9] text-[10px] font-mono font-medium text-[#7A705F]">
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
      <header className="sticky top-0 z-40 bg-[#FAF6EE]/90 backdrop-blur-md border-b border-[#E5DEC9] transition-all">
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
                Lore Codex
              </a>
              <a href="#continuity" className="hover:text-[#221E18] transition-colors">
                Continuity
              </a>
              <a href="#manifesto" className="hover:text-[#221E18] transition-colors">
                Local-First Manifesto
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onEnterStudio('projects')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#221E18] bg-[#F1EAD9] hover:bg-[#EAE4D6] border border-[#E5DEC9] transition-colors cursor-pointer"
            >
              <FolderKanban size={13} className="text-[#7A705F]" />
              <span>Manuscripts</span>
            </button>

            <button
              onClick={() => onEnterStudio('home')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#FAF6EE] bg-[#B54B32] hover:bg-[#9E3E27] shadow-warm-sm transition-all active:scale-98 cursor-pointer"
            >
              <span>Launch Studio</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className="pt-14 md:pt-20 pb-16 px-4 sm:px-6 relative overflow-hidden border-b border-[#E5DEC9]">
        {/* Subtle background decorative watermark */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 opacity-5 pointer-events-none">
          <ThreadlineMark size={680} color="#221E18" knotColor="#B54B32" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F1EAD9] border border-[#E5DEC9] text-[#7A705F] text-[11px] font-mono font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-[#B54B32]" />
            <span className="tracking-[0.16em] uppercase">The Novelist's Private Sanctuary</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-semibold text-[#221E18] tracking-tight leading-[1.12] mb-6">
            Keep the story connected.
            <br />
            <span className="italic font-normal text-[#B54B32]">Keep the voice yours.</span>
          </h1>

          {/* Deck */}
          <p className="text-base sm:text-lg md:text-xl text-[#7A705F] max-w-2xl mx-auto font-sans leading-relaxed mb-8">
            The distraction-free narrative studio for novelists and long-form storytellers. Structure your chapters with proven frameworks, track canon lore with zero clutter, and draft at eye-level on a calm paper canvas.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
            <button
              onClick={() => onEnterStudio('editor')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold text-[#FAF6EE] bg-[#B54B32] hover:bg-[#9E3E27] shadow-warm-modal transition-all active:scale-98 cursor-pointer"
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
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-medium text-[#221E18] bg-[#F1EAD9] hover:bg-[#EAE4D6] border border-[#E5DEC9] transition-all cursor-pointer"
            >
              <BookOpen size={15} className="text-[#35505F]" />
              <span>Explore Demo Manuscript</span>
            </button>
          </div>

          {/* Architecture Trust Highlights */}
          <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-[#7A705F] font-mono pt-4 border-t border-[#E5DEC9]/70 max-w-2xl mx-auto">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#3C6E47]" /> 100% Local-First &amp; Private
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Zap size={14} className="text-[#C88A2E]" /> Zero Cloud Telemetry
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Terminal size={14} className="text-[#35505F]" /> Plain Markdown Portability
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Lock size={14} className="text-[#857C90]" /> No Account Required
            </span>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE LIVE PRODUCT DEMO / EXPLORER */}
      <section className="py-16 px-4 sm:px-6 bg-[#F1EAD9]/40 border-b border-[#E5DEC9]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="section-label block mb-2">Interactive Preview</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#221E18] tracking-tight mb-3">
              Crafted with tactile restraint
            </h2>
            <p className="text-sm text-[#7A705F] leading-relaxed">
              Every detail is calibrated to protect writer focus. Switch between Threadline's four core studio workspaces below to experience the interface.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center justify-center mb-6">
            <div className="inline-flex p-1 bg-[#F1EAD9] rounded-xl border border-[#E5DEC9] gap-1 overflow-x-auto max-w-full">
              <button
                onClick={() => setActiveInteractiveTab('canvas')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer shrink-0 ${
                  activeInteractiveTab === 'canvas'
                    ? 'bg-[#FAF6EE] text-[#221E18] font-semibold shadow-warm-sm border border-[#E5DEC9]'
                    : 'text-[#7A705F] hover:text-[#221E18]'
                }`}
              >
                <FileText size={14} className={activeInteractiveTab === 'canvas' ? 'text-[#B54B32]' : ''} />
                <span>1. Manuscript Canvas</span>
              </button>
              <button
                onClick={() => setActiveInteractiveTab('corkboard')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer shrink-0 ${
                  activeInteractiveTab === 'corkboard'
                    ? 'bg-[#FAF6EE] text-[#221E18] font-semibold shadow-warm-sm border border-[#E5DEC9]'
                    : 'text-[#7A705F] hover:text-[#221E18]'
                }`}
              >
                <Layers size={14} className={activeInteractiveTab === 'corkboard' ? 'text-[#35505F]' : ''} />
                <span>2. Corkboard Beats</span>
              </button>
              <button
                onClick={() => setActiveInteractiveTab('codex')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer shrink-0 ${
                  activeInteractiveTab === 'codex'
                    ? 'bg-[#FAF6EE] text-[#221E18] font-semibold shadow-warm-sm border border-[#E5DEC9]'
                    : 'text-[#7A705F] hover:text-[#221E18]'
                }`}
              >
                <Compass size={14} className={activeInteractiveTab === 'codex' ? 'text-[#C88A2E]' : ''} />
                <span>3. Lore Codex</span>
              </button>
              <button
                onClick={() => setActiveInteractiveTab('continuity')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer shrink-0 ${
                  activeInteractiveTab === 'continuity'
                    ? 'bg-[#FAF6EE] text-[#221E18] font-semibold shadow-warm-sm border border-[#E5DEC9]'
                    : 'text-[#7A705F] hover:text-[#221E18]'
                }`}
              >
                <Sparkles size={14} className={activeInteractiveTab === 'continuity' ? 'text-[#3C6E47]' : ''} />
                <span>4. Continuity Inbox</span>
              </button>
            </div>
          </div>

          {/* Interactive Screen Display Container */}
          <div className="bg-[#FAF6EE] rounded-2xl border border-[#E5DEC9] shadow-warm-modal overflow-hidden">
            {/* Top Mock Window Bar */}
            <div className="h-10 bg-[#F1EAD9] border-b border-[#E5DEC9] px-4 flex items-center justify-between text-xs text-[#7A705F]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E5DEC9] border border-[#7A705F]/30" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#E5DEC9] border border-[#7A705F]/30" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#E5DEC9] border border-[#7A705F]/30" />
                <span className="ml-2 font-serif italic text-[#221E18] font-medium hidden sm:inline">
                  The Clockmaker's Secret — Chapter 1
                </span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span className="text-[#3C6E47] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3C6E47]" /> Saved Locally
                </span>
                <span className="hidden sm:inline text-[#7A705F]/60">·</span>
                <span className="hidden sm:inline">2,418 words</span>
              </div>
            </div>

            {/* TAB CONTENT: 1. Manuscript Canvas */}
            {activeInteractiveTab === 'canvas' && (
              <div className="p-6 sm:p-10 relative min-h-[380px] flex flex-col justify-between">
                {/* Simulated 42% Caret Horizon Guide */}
                <div
                  className="absolute left-0 right-0 pointer-events-none border-b border-dashed border-[#35505F]/35 z-10"
                  style={{ top: '42%' }}
                >
                  <div className="max-w-2xl mx-auto flex justify-end pr-6">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-[#35505F] bg-[#FAF6EE] px-2 -translate-y-1/2 border border-[#35505F]/20 rounded">
                      42% VIEWPORT — CARET HORIZON (EYE LEVEL)
                    </span>
                  </div>
                </div>

                <div className="max-w-2xl mx-auto w-full">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono uppercase text-[#7A705F] tracking-widest">
                      Scene 3 · The Midnight Pendulum
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#F6EEDA] text-[#C88A2E] border border-[#C88A2E]/20 uppercase">
                      Drafting
                    </span>
                  </div>

                  <h3 className="text-3xl font-serif font-semibold text-[#221E18] mb-4">
                    The Midnight Pendulum
                  </h3>

                  <div className="font-serif text-[#221E18] text-base sm:text-lg leading-relaxed space-y-4">
                    <p>
                      Silas did not look at the dials when the chiming started. He had learned forty years ago that brass could lie if the gear teeth were cut with malice.
                    </p>
                    <p className="relative">
                      Instead, he touched the escapement pallet with a calloused thumb. The vibration was too rapid—nearly three hundred beats per minute, humming like a trapped wasp inside the cedar casing.
                      <span className="inline-block w-0.5 h-5 bg-[#B54B32] align-middle ml-1 animate-pulse" />
                    </p>
                    <blockquote className="border-l-2 border-[#B54B32] pl-4 py-1 italic bg-[#F1EAD9] text-sm text-[#221E18] rounded-r-md">
                      "If the escapement slips past midnight," his grandfather had written in the ledger, "do not reach inside with bare hands."
                    </blockquote>
                  </div>
                </div>

                {/* Simulated Format Footer */}
                <div className="mt-8 pt-4 border-t border-[#E5DEC9] flex flex-wrap items-center justify-between text-xs text-[#7A705F]">
                  <span className="font-mono flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B54B32]" />
                    Type <code className="bg-[#F1EAD9] px-1 py-0.5 rounded text-[#221E18] font-mono">/</code> for block commands, <code className="bg-[#F1EAD9] px-1 py-0.5 rounded text-[#221E18] font-mono">#</code> for headings
                  </span>
                  <button
                    onClick={() => onEnterStudio('editor')}
                    className="text-[#B54B32] hover:underline font-medium font-sans flex items-center gap-1 cursor-pointer"
                  >
                    Open Live Editor <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 2. Corkboard Beats */}
            {activeInteractiveTab === 'corkboard' && (
              <div className="p-6 sm:p-8 min-h-[380px]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="font-serif text-lg font-semibold text-[#221E18]">
                      Save the Cat! 15-Beat Story Architecture
                    </h4>
                    <p className="text-xs text-[#7A705F] mt-0.5">
                      Visual beat cards anchored to chapters with continuous word counts and narrative status.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[#7A705F] bg-[#F1EAD9] px-2.5 py-1 rounded border border-[#E5DEC9]">
                    Act I: Opening World
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-[#F1EAD9] border border-[#E5DEC9] shadow-warm-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono uppercase text-[#7A705F] font-bold">Beat 01</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E5EFE7] text-[#3C6E47] uppercase">Final</span>
                      </div>
                      <h5 className="font-serif font-semibold text-sm text-[#221E18] mb-1">Opening Image</h5>
                      <p className="text-xs text-[#7A705F] leading-snug">
                        Silas cleans the bronze pendulum as the town bells strike dusk. The quiet world before the gears slip.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#E5DEC9] text-[11px] font-mono text-[#7A705F] flex justify-between">
                      <span>POV: Silas</span>
                      <span>1,420 words</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FAF6EE] border-2 border-[#B54B32]/40 shadow-warm-sm flex flex-col justify-between relative">
                    <span className="absolute -top-2.5 right-3 bg-[#B54B32] text-[#FAF6EE] text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full font-bold">
                      Current Draft
                    </span>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono uppercase text-[#7A705F] font-bold">Beat 02</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F6EEDA] text-[#C88A2E] uppercase">Drafting</span>
                      </div>
                      <h5 className="font-serif font-semibold text-sm text-[#221E18] mb-1">Theme Stated</h5>
                      <p className="text-xs text-[#7A705F] leading-snug">
                        Master Chen reminds Silas that an artisan who controls time will eventually be consumed by it.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#E5DEC9] text-[11px] font-mono text-[#7A705F] flex justify-between">
                      <span>POV: Silas</span>
                      <span>2,418 words</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#F1EAD9] border border-[#E5DEC9] shadow-warm-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono uppercase text-[#7A705F] font-bold">Beat 03</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#ECE8E1] text-[#857C90] uppercase">Idea</span>
                      </div>
                      <h5 className="font-serif font-semibold text-sm text-[#221E18] mb-1">Catalyst / Incident</h5>
                      <p className="text-xs text-[#7A705F] leading-snug">
                        A broken pocket watch arrives with a seal from the Sunken Foundry, dated three years in the future.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#E5DEC9] text-[11px] font-mono text-[#7A705F] flex justify-between">
                      <span>POV: Silas</span>
                      <span>0 words</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 3. Lore Codex */}
            {activeInteractiveTab === 'codex' && (
              <div className="p-6 sm:p-8 min-h-[380px]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="font-serif text-lg font-semibold text-[#221E18]">
                      Lore Codex &amp; Story Bible
                    </h4>
                    <p className="text-xs text-[#7A705F] mt-0.5">
                      Character dossiers, locations, and narrative promises anchored to scenes.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[#7A705F] bg-[#F1EAD9] px-2.5 py-1 rounded border border-[#E5DEC9]">
                    3 Core Characters · 2 Open Threads
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#F1EAD9] border border-[#E5DEC9]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-serif font-bold text-[#221E18]">Silas Vance (Protagonist)</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#E5EFE7] text-[#3C6E47] uppercase">Confirmed Canon</span>
                    </div>
                    <p className="text-xs text-[#7A705F] leading-relaxed mb-3">
                      Master horologist. Secretly deaf in his left ear from a boiler explosion. Carries his grandfather's silver escapement wrench in his left vest pocket.
                    </p>
                    <div className="text-[11px] font-mono text-[#7A705F] pt-2 border-t border-[#E5DEC9] flex items-center justify-between">
                      <span>Motive: Protect the Archive</span>
                      <span>Anchored in 6 Scenes</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#F1EAD9] border border-[#E5DEC9]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-serif font-bold text-[#221E18]">The Brass Astrolabe (Relic)</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#F6EEDA] text-[#C88A2E] uppercase">Needs Verification</span>
                    </div>
                    <p className="text-xs text-[#7A705F] leading-relaxed mb-3">
                      Forged in 1842. Only operates when submerged in salted oil. Contains celestial coordinates for the Sunken Archive vault under the harbor.
                    </p>
                    <div className="text-[11px] font-mono text-[#7A705F] pt-2 border-t border-[#E5DEC9] flex items-center justify-between">
                      <span>Promise: Chapter 4 Payoff</span>
                      <span>Anchored in 2 Scenes</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 4. Continuity Inbox */}
            {activeInteractiveTab === 'continuity' && (
              <div className="p-6 sm:p-8 min-h-[380px]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="font-serif text-lg font-semibold text-[#221E18]">
                      Continuity Inbox &amp; Inquiry Logger
                    </h4>
                    <p className="text-xs text-[#7A705F] mt-0.5">
                      Evidence-based observations and timeline inconsistencies waiting for writer resolution.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[#C88A2E] bg-[#F6EEDA] px-2.5 py-1 rounded border border-[#C88A2E]/20">
                    2 Pending Inquiries
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-[#F1EAD9] border border-[#E5DEC9] flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#B54B32]/10 text-[#B54B32] font-semibold uppercase">
                          Timeline Collision
                        </span>
                        <span className="text-xs font-serif font-bold text-[#221E18]">
                          Silas's Pocket Watch Handedness
                        </span>
                      </div>
                      <p className="text-xs text-[#7A705F] leading-relaxed">
                        In Scene 1, Silas reaches with his left hand. In Scene 4, you mention his left arm was in a sling after the foundry fire. Did this injury heal before midnight?
                      </p>
                    </div>
                    <button
                      onClick={() => onEnterStudio('continuity')}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#221E18] bg-[#FAF6EE] border border-[#E5DEC9] hover:bg-[#EAE4D6] shrink-0 cursor-pointer"
                    >
                      Resolve
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-[#F1EAD9] border border-[#E5DEC9] flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#35505F]/10 text-[#35505F] font-semibold uppercase">
                          Narrative Thread
                        </span>
                        <span className="text-xs font-serif font-bold text-[#221E18]">
                          The Missing Wrench in Chapter 2
                        </span>
                      </div>
                      <p className="text-xs text-[#7A705F] leading-relaxed">
                        The silver escapement wrench was dropped into the clockworks in Scene 2, but Silas uses it again in Scene 6 without retrieving it.
                      </p>
                    </div>
                    <button
                      onClick={() => onEnterStudio('continuity')}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#221E18] bg-[#FAF6EE] border border-[#E5DEC9] hover:bg-[#EAE4D6] shrink-0 cursor-pointer"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. FOUR CORE PRODUCT PILLARS */}
      <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="section-label block mb-2">The Architecture of Long-Form Fiction</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-[#221E18] tracking-tight mb-4">
            Four quiet pillars. Zero distraction.
          </h2>
          <p className="text-sm sm:text-base text-[#7A705F] leading-relaxed">
            Threadline solves the friction of writing a 90,000-word book by giving every stage of drafting its dedicated, tactile home.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pillar 1: The Canvas */}
          <div id="canvas" className="p-8 rounded-2xl bg-[#F1EAD9] border border-[#E5DEC9] shadow-warm-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#221E18] text-[#FAF6EE] flex items-center justify-center mb-5 shadow-xs">
                <AlignVerticalJustifyCenter size={20} className="text-[#B54B32]" />
              </div>
              <span className="section-label text-[10px] block mb-1">The Canvas</span>
              <h3 className="text-xl font-serif font-semibold text-[#221E18] mb-3">
                42% Optical Caret Horizon
              </h3>
              <p className="text-sm text-[#7A705F] leading-relaxed mb-4">
                Typing at the bottom of a monitor ruins writer posture and breaks immersion. Threadline's optical typewriter scroll anchors your active line precisely at 42% height—at natural eye-level—scrolling the manuscript beneath your fingers like vintage heavy parchment.
              </p>
              <ul className="space-y-2 text-xs text-[#221E18]">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#3C6E47] shrink-0" />
                  <span>Dual editing modes: Interactive rich live preview or raw markdown syntax</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#3C6E47] shrink-0" />
                  <span>Notion-style <code className="font-mono bg-[#FAF6EE] px-1 py-0.5 rounded border border-[#E5DEC9]">/</code> slash palette for instant formatting</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#3C6E47] shrink-0" />
                  <span>Subtle word pacing timer without intrusive notifications</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E5DEC9]">
              <button
                onClick={() => onEnterStudio('editor')}
                className="text-xs font-semibold text-[#B54B32] hover:text-[#9E3E27] flex items-center gap-1 cursor-pointer"
              >
                Launch the Manuscript Canvas →
              </button>
            </div>
          </div>

          {/* Pillar 2: The Corkboard */}
          <div id="corkboard" className="p-8 rounded-2xl bg-[#F1EAD9] border border-[#E5DEC9] shadow-warm-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#221E18] text-[#FAF6EE] flex items-center justify-center mb-5 shadow-xs">
                <Layers size={20} className="text-[#35505F]" />
              </div>
              <span className="section-label text-[10px] block mb-1">Story Architecture</span>
              <h3 className="text-xl font-serif font-semibold text-[#221E18] mb-3">
                Corkboard &amp; Narrative Frameworks
              </h3>
              <p className="text-sm text-[#7A705F] leading-relaxed mb-4">
                Never lose your story's momentum. Choose from time-tested narrative frameworks—Three-Act Structure, Save the Cat! 15 Beats, Hero's Journey, or 7-Point Story Architecture—or draft freeform. Rearrange chapters and track completion status at a glance.
              </p>
              <ul className="space-y-2 text-xs text-[#221E18]">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#3C6E47] shrink-0" />
                  <span>Color-coded progression: Idea, Drafting, Revised, Final</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#3C6E47] shrink-0" />
                  <span>Automatic chapter-level word rollups and target pacing</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#3C6E47] shrink-0" />
                  <span>Instantly jump from any corkboard beat card straight into the scene</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E5DEC9]">
              <button
                onClick={() => onEnterStudio('dashboard')}
                className="text-xs font-semibold text-[#35505F] hover:text-[#221E18] flex items-center gap-1 cursor-pointer"
              >
                Inspect Story Architecture →
              </button>
            </div>
          </div>

          {/* Pillar 3: The Lore Codex */}
          <div id="codex" className="p-8 rounded-2xl bg-[#F1EAD9] border border-[#E5DEC9] shadow-warm-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#221E18] text-[#FAF6EE] flex items-center justify-center mb-5 shadow-xs">
                <Compass size={20} className="text-[#C88A2E]" />
              </div>
              <span className="section-label text-[10px] block mb-1">Canon Worldbuilding</span>
              <h3 className="text-xl font-serif font-semibold text-[#221E18] mb-3">
                Lore Codex &amp; Story Bible
              </h3>
              <p className="text-sm text-[#7A705F] leading-relaxed mb-4">
                Keep the facts of your fictional universe anchored and verified. Record character motivations, physical flaws, faction loyalties, and sacred relics. Link each entry to the exact scenes where they appear.
              </p>
              <ul className="space-y-2 text-xs text-[#221E18]">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#3C6E47] shrink-0" />
                  <span>Categorized by Characters, Locations, Factions, Relics, and Lore</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#3C6E47] shrink-0" />
                  <span>Narrative Promise Tracker: Map story threads to payoffs</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#3C6E47] shrink-0" />
                  <span>Status verification tags to distinguish confirmed canon from conjecture</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E5DEC9]">
              <button
                onClick={() => onEnterStudio('bible')}
                className="text-xs font-semibold text-[#C88A2E] hover:text-[#221E18] flex items-center gap-1 cursor-pointer"
              >
                Browse the Lore Codex →
              </button>
            </div>
          </div>

          {/* Pillar 4: Continuity & Snapshots */}
          <div id="continuity" className="p-8 rounded-2xl bg-[#F1EAD9] border border-[#E5DEC9] shadow-warm-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#221E18] text-[#FAF6EE] flex items-center justify-center mb-5 shadow-xs">
                <Sliders size={20} className="text-[#857C90]" />
              </div>
              <span className="section-label text-[10px] block mb-1">Safety &amp; Revision</span>
              <h3 className="text-xl font-serif font-semibold text-[#221E18] mb-3">
                Snapshots &amp; The Cutting Room
              </h3>
              <p className="text-sm text-[#7A705F] leading-relaxed mb-4">
                Never hesitate to kill your darlings. When you prune a 500-word paragraph, preserve it in the Cutting Room scrap vault. Take immutable revision snapshots before major structural edits so you can experiment without fear.
              </p>
              <ul className="space-y-2 text-xs text-[#221E18]">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#3C6E47] shrink-0" />
                  <span>One-click Point-in-Time snapshots of the entire manuscript</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#3C6E47] shrink-0" />
                  <span>Dedicated Cutting Room vault for preserved scraps and fragments</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#3C6E47] shrink-0" />
                  <span>Evidence-based continuity inbox for plotting and beta notes</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E5DEC9]">
              <button
                onClick={() => onEnterStudio('revisions')}
                className="text-xs font-semibold text-[#857C90] hover:text-[#221E18] flex items-center gap-1 cursor-pointer"
              >
                View Revision Snapshots →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. MANUSCRIPT CALCULATOR / PACING ESTIMATOR */}
      <section className="py-16 px-4 sm:px-6 bg-[#F1EAD9]/60 border-y border-[#E5DEC9]">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#FAF6EE] p-8 md:p-10 rounded-2xl border border-[#E5DEC9] shadow-warm-modal">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <span className="section-label block mb-1">Drafting Rhythm</span>
                <h3 className="text-2xl font-serif font-semibold text-[#221E18]">
                  Manuscript Pacing Calculator
                </h3>
                <p className="text-xs text-[#7A705F] mt-1">
                  Adjust your book's target scope and daily output to calculate your completion horizon.
                </p>
              </div>

              <div className="flex items-center gap-4 bg-[#F1EAD9] px-4 py-2.5 rounded-xl border border-[#E5DEC9]">
                <div>
                  <div className="text-[10px] font-mono uppercase text-[#7A705F]">Finish Horizon</div>
                  <div className="text-lg font-serif font-bold text-[#B54B32]">{estimatedDays} Days ({estimatedMonths} mo)</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="flex justify-between text-xs font-medium mb-2">
                  <span className="text-[#221E18]">Target Word Count:</span>
                  <span className="font-mono text-[#B54B32] font-semibold">{calculatorWords.toLocaleString()} words</span>
                </div>
                <input
                  type="range"
                  min={30000}
                  max={160000}
                  step={5000}
                  value={calculatorWords}
                  onChange={(e) => setCalculatorWords(Number(e.target.value))}
                  className="w-full accent-[#B54B32] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#7A705F] mt-1">
                  <span>Novella (40k)</span>
                  <span>Standard Novel (80k)</span>
                  <span>Epic Fantasy (140k)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-2">
                  <span className="text-[#221E18]">Daily Writing Output:</span>
                  <span className="font-mono text-[#35505F] font-semibold">{calculatorDailyRate.toLocaleString()} words/day</span>
                </div>
                <input
                  type="range"
                  min={250}
                  max={2500}
                  step={50}
                  value={calculatorDailyRate}
                  onChange={(e) => setCalculatorDailyRate(Number(e.target.value))}
                  className="w-full accent-[#35505F] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#7A705F] mt-1">
                  <span>Slow &amp; Steady (300)</span>
                  <span>Daily Habit (750)</span>
                  <span>NaNoWriMo Sprint (1,667)</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#E5DEC9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs text-[#7A705F] leading-relaxed">
                At <span className="font-mono text-[#221E18] font-medium">{calculatorDailyRate} words</span> per day, your {calculatorWords.toLocaleString()}-word book will be drafted in approximately <span className="font-mono text-[#221E18] font-medium">{estimatedDays} writing sessions</span>.
              </p>
              <button
                onClick={() => onEnterStudio('new-project')}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-[#FAF6EE] bg-[#221E18] hover:bg-[#35505F] shrink-0 transition-colors cursor-pointer"
              >
                Set Up This Manuscript Project →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. COMPARISON MATRIX (THE THREADLINE DIFFERENCE) */}
      <section className="py-20 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="section-label block mb-2">Honest Comparison</span>
          <h2 className="text-3xl font-serif font-semibold text-[#221E18] tracking-tight mb-3">
            Built for writers, not corporate meetings
          </h2>
          <p className="text-sm text-[#7A705F]">
            How Threadline contrasts with traditional word processors and legacy novel drafting tools.
          </p>
        </div>

        <div className="bg-[#FAF6EE] rounded-2xl border border-[#E5DEC9] shadow-warm-modal overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E5DEC9] bg-[#F1EAD9]/70 text-[#7A705F] font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Feature &amp; Philosophy</th>
                <th className="py-3.5 px-4 font-bold text-[#B54B32] bg-[#F1EAD9]">Threadline</th>
                <th className="py-3.5 px-4 font-normal">Scrivener</th>
                <th className="py-3.5 px-4 font-normal">Google Docs / Word</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DEC9] text-[#221E18]">
              <tr>
                <td className="py-3.5 px-4 font-medium">Local-First Storage</td>
                <td className="py-3.5 px-4 font-semibold bg-[#F1EAD9]/40 text-[#3C6E47] flex items-center gap-1.5">
                  <Check size={14} /> 100% Private (No Cloud)
                </td>
                <td className="py-3.5 px-4 text-[#7A705F]">Local (Sync Errors Common)</td>
                <td className="py-3.5 px-4 text-[#7A705F]">Cloud-Only (Required Account)</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-medium">42% Optical Caret Horizon</td>
                <td className="py-3.5 px-4 font-semibold bg-[#F1EAD9]/40 text-[#3C6E47] flex items-center gap-1.5">
                  <Check size={14} /> Eye-Level Active Guide
                </td>
                <td className="py-3.5 px-4 text-[#7A705F]">Basic Centered (No Guide)</td>
                <td className="py-3.5 px-4 text-[#7A705F]">None (Types at Bottom)</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-medium">Story Architecture Frameworks</td>
                <td className="py-3.5 px-4 font-semibold bg-[#F1EAD9]/40 text-[#3C6E47] flex items-center gap-1.5">
                  <Check size={14} /> 4 Built-In Systems
                </td>
                <td className="py-3.5 px-4 text-[#7A705F]">Generic Binder Folders</td>
                <td className="py-3.5 px-4 text-[#7A705F]">None</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-medium">Lore Codex &amp; Thread Payoffs</td>
                <td className="py-3.5 px-4 font-semibold bg-[#F1EAD9]/40 text-[#3C6E47] flex items-center gap-1.5">
                  <Check size={14} /> Integrated Scene Linking
                </td>
                <td className="py-3.5 px-4 text-[#7A705F]">Plain Notes Files</td>
                <td className="py-3.5 px-4 text-[#7A705F]">None</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-medium">Distraction-Free Paper Theme</td>
                <td className="py-3.5 px-4 font-semibold bg-[#F1EAD9]/40 text-[#3C6E47] flex items-center gap-1.5">
                  <Check size={14} /> Aged Paper &amp; Ink
                </td>
                <td className="py-3.5 px-4 text-[#7A705F]">2005 Windows/Mac OS Chrome</td>
                <td className="py-3.5 px-4 text-[#7A705F]">Harsh Fluorescent White</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-medium">No Subscription / Telemetry</td>
                <td className="py-3.5 px-4 font-semibold bg-[#F1EAD9]/40 text-[#3C6E47] flex items-center gap-1.5">
                  <Check size={14} /> Free &amp; Zero Tracking
                </td>
                <td className="py-3.5 px-4 text-[#7A705F]">Paid License per OS</td>
                <td className="py-3.5 px-4 text-[#7A705F]">Data Harvested / Telemetry</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 8. LOCAL-FIRST MANIFESTO */}
      <section id="manifesto" className="py-20 px-4 sm:px-6 bg-[#221E18] text-[#FAF6EE]">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <ThreadlineBadge size={32} />
            <span className="text-xs font-mono tracking-[0.16em] uppercase text-[#FAF6EE]/60">
              The Threadline Manifesto
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-medium tracking-tight mb-8 leading-snug">
            Your manuscript is not training data.
            <br />
            It is your life's work.
          </h2>

          <div className="space-y-6 text-[#FAF6EE]/80 text-sm sm:text-base leading-relaxed font-serif">
            <p>
              In recent years, writing software surrendered to venture capital metrics. Every tool became an AI ghostwriter attempting to replace the writer, a bloated collaborative suite with cursor pings and notification dots, or a hostage negotiation charging $15 a month just to access your own words.
            </p>
            <p>
              We built Threadline because writing a novel requires solitude, focus, and sovereignty.
            </p>
            <blockquote className="border-l-2 border-[#B54B32] pl-5 my-6 italic text-[#FAF6EE] text-base sm:text-lg">
              "We believe your stories belong on your machine, written with calm typography, structured by proven narrative bones, and owned forever by you."
            </blockquote>
            <p>
              Threadline requires no login. It emits zero telemetry. It runs entirely inside your browser's persistent sandbox. When you close the tab, your prose remains safe on your drive. When you want to leave, you export clean Markdown or JSON archives in one click.
            </p>
          </div>

          <div className="mt-10 pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs font-mono text-[#FAF6EE]/60">
              Threadline Narrative Architecture · Open &amp; Local-First
            </div>
            <button
              onClick={() => onEnterStudio('home')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-[#B54B32] hover:bg-[#9E3E27] text-[#FAF6EE] transition-colors cursor-pointer"
            >
              <span>Enter Workspace Now</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* 9. FINAL CALL TO ACTION */}
      <section className="py-24 px-4 sm:px-6 text-center bg-[#FAF6EE]">
        <div className="max-w-2xl mx-auto">
          <ThreadlineMark size={100} color="#221E18" knotColor="#B54B32" className="mx-auto mb-6" />

          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-[#221E18] tracking-tight mb-4">
            Sit down. Breathe. Write.
          </h2>

          <p className="text-sm sm:text-base text-[#7A705F] leading-relaxed mb-8">
            Your next chapter is waiting. No credit card, no sign-up forms, and no cloud surveillance. Just you and the manuscript.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onEnterStudio('editor')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-[#FAF6EE] bg-[#B54B32] hover:bg-[#9E3E27] shadow-warm-modal transition-all active:scale-98 cursor-pointer"
            >
              <span>Open Threadline Studio</span>
              <ArrowRight size={15} />
            </button>

            <button
              onClick={() => onEnterStudio('projects')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-medium text-[#221E18] bg-[#F1EAD9] hover:bg-[#EAE4D6] border border-[#E5DEC9] transition-all cursor-pointer"
            >
              <FolderKanban size={15} className="text-[#7A705F]" />
              <span>Browse Manuscripts Catalog</span>
            </button>
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="bg-[#F1EAD9] border-t border-[#E5DEC9] py-12 px-4 sm:px-6 text-xs text-[#7A705F]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <ThreadlineBadge size={24} />
            <div>
              <span className="font-serif font-bold text-[#221E18] text-sm">Threadline</span>
              <span className="text-[10px] font-mono text-[#7A705F] ml-2">v2.4 Editorial Edition</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <button
              onClick={() => onEnterStudio('editor')}
              className="hover:text-[#221E18] transition-colors cursor-pointer"
            >
              Manuscript Editor
            </button>
            <button
              onClick={() => onEnterStudio('dashboard')}
              className="hover:text-[#221E18] transition-colors cursor-pointer"
            >
              Corkboard
            </button>
            <button
              onClick={() => onEnterStudio('bible')}
              className="hover:text-[#221E18] transition-colors cursor-pointer"
            >
              Lore Codex
            </button>
            <button
              onClick={() => onEnterStudio('continuity')}
              className="hover:text-[#221E18] transition-colors cursor-pointer"
            >
              Continuity Inbox
            </button>
            <button
              onClick={() => onEnterStudio('export')}
              className="hover:text-[#221E18] transition-colors cursor-pointer"
            >
              Plaintext Export
            </button>
          </div>

          <div className="text-[11px] font-mono text-[#7A705F]">
            Local-First &amp; Encrypted · All Rights Reserved
          </div>
        </div>
      </footer>
    </div>
  );
};
