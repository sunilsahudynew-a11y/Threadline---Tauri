import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FileText,
  Layers,
  Compass,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Terminal,
  Lock,
  Download,
  Check,
  CheckCircle2,
  ChevronDown,
  Monitor,
  Laptop,
  Globe,
  RefreshCw,
  ExternalLink,
  Smartphone,
  Tablet,
  AlertCircle,
  Eye,
  Feather,
  Quote,
  Clock,
  BookOpen
} from 'lucide-react';
import { ThreadlineMark, ThreadlineBadge } from './common/ThreadlineLogo';
import { HeroThreeCanvas } from './landing/HeroThreeCanvas';
import { AppleLogo, WindowsLogo, LinuxLogo, WebBrowserLogo } from './landing/OsLogos';
import { ScreenType } from './Navigation';
import {
  fetchLatestRelease,
  formatFileSize,
  GithubReleaseInfo,
  DEFAULT_GITHUB_REPO
} from '../services/githubRelease';

interface LandingPageProps {
  onEnterStudio: (initialScreen?: ScreenType) => void;
  onOpenSampleProject?: (projectId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterStudio,
  onOpenSampleProject
}) => {
  // Sticky header state after 100px scroll
  const [isScrolled, setIsScrolled] = useState(false);
  // Detect OS for prioritized download
  const [detectedOS, setDetectedOS] = useState<'macos' | 'windows' | 'web'>('web');
  // Motion preference detection
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Tab systems state
  const [activeTab, setActiveTab] = useState<'canvas' | 'corkboard' | 'codex' | 'continuity'>('canvas');

  // Interactive Drafting Calculator
  const [calculatorWords, setCalculatorWords] = useState<number>(80000);
  const [calculatorDailyRate, setCalculatorDailyRate] = useState<number>(800);

  // GitHub Release Live Info
  const [releaseInfo, setReleaseInfo] = useState<GithubReleaseInfo | null>(null);
  const [isLoadingRelease, setIsLoadingRelease] = useState(false);

  // Vault File Tree sequential entrance on scroll
  const [vaultInView, setVaultInView] = useState(false);
  const [visibleTreeLines, setVisibleTreeLines] = useState<number>(0);
  const vaultRef = useRef<HTMLDivElement>(null);

  // Animated Codex mention counter
  const [codexMentionCount, setCodexMentionCount] = useState(1);

  // Animated Continuity Radar loop (flagged -> resolving -> resolved)
  const [continuityState, setContinuityState] = useState<'flagged' | 'resolving' | 'resolved'>('flagged');

  // Detect motion preference & OS on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);

      // Detect OS
      const ua = window.navigator.userAgent.toLowerCase();
      const platform = (window.navigator as any).userAgentData?.platform?.toLowerCase() || window.navigator.platform?.toLowerCase() || '';
      if (/mac|macintosh|mac os x|iphone|ipad/i.test(ua) || /mac/i.test(platform)) {
        setDetectedOS('macos');
      } else if (/win|windows/i.test(ua) || /win/i.test(platform)) {
        setDetectedOS('windows');
      } else {
        setDetectedOS('web');
      }

      // Scroll listener for sticky header
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 100);
      };
      window.addEventListener('scroll', handleScroll, { passive: true });

      return () => {
        mediaQuery.removeEventListener('change', listener);
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  // Fetch release info
  const loadRelease = useCallback(async () => {
    setIsLoadingRelease(true);
    try {
      const data = await fetchLatestRelease();
      setReleaseInfo(data);
    } catch {
      // Graceful fallback already built in githubRelease.ts
    } finally {
      setIsLoadingRelease(false);
    }
  }, []);

  useEffect(() => {
    loadRelease();
  }, [loadRelease]);

  // Observer for Vault File Tree animation
  useEffect(() => {
    if (!vaultRef.current || prefersReducedMotion) {
      if (prefersReducedMotion) setVisibleTreeLines(12);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVaultInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(vaultRef.current);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  // Sequential line build-in for Vault file tree
  useEffect(() => {
    if (!vaultInView || prefersReducedMotion) return;
    const totalLines = 11;
    const timer = setInterval(() => {
      setVisibleTreeLines((prev) => {
        if (prev < totalLines) return prev + 1;
        clearInterval(timer);
        return prev;
      });
    }, 85);
    return () => clearInterval(timer);
  }, [vaultInView, prefersReducedMotion]);

  // Codex Tab Mention Counter animation
  useEffect(() => {
    if (activeTab === 'codex' && !prefersReducedMotion) {
      setCodexMentionCount(1);
      const interval = setInterval(() => {
        setCodexMentionCount((prev) => (prev < 14 ? prev + 1 : 14));
      }, 90);
      return () => clearInterval(interval);
    } else {
      setCodexMentionCount(14);
    }
  }, [activeTab, prefersReducedMotion]);

  // Continuity Radar Tab resolution loop
  useEffect(() => {
    if (activeTab !== 'continuity' || prefersReducedMotion) return;
    const loop = setInterval(() => {
      setContinuityState('resolving');
      const t1 = setTimeout(() => {
        setContinuityState('resolved');
        const t2 = setTimeout(() => {
          setContinuityState('flagged');
        }, 2200);
        return () => clearTimeout(t2);
      }, 1200);
      return () => clearTimeout(t1);
    }, 5500);

    return () => clearInterval(loop);
  }, [activeTab, prefersReducedMotion]);

  // Calculations for pace planner
  const estimatedDays = Math.ceil(calculatorWords / calculatorDailyRate);
  const estimatedMonths = (estimatedDays / 30.5).toFixed(1);

  // File tree items in Vault
  const fileTreeRows = [
    { indent: 0, icon: '📁', name: 'MyNovel_Vault/', badge: 'Obsidian Compatible', color: 'text-[#8E8474]' },
    { indent: 1, icon: '📄', name: 'project.json', color: 'text-[#A09686]' },
    { indent: 1, icon: '📁', name: 'Manuscript/', color: 'text-[#B54B32] font-semibold' },
    { indent: 2, icon: '📄', name: '01 - The Slipway Bell.md', color: 'text-[#E08D79]' },
    { indent: 2, icon: '📄', name: '02 - Low Tide Whispers.md', color: 'text-[#E08D79]' },
    { indent: 2, icon: '📄', name: '03 - The Astronomical Gear.md', color: 'text-[#E08D79]' },
    { indent: 1, icon: '📁', name: 'Codex/', badge: 'Canon Bible', color: 'text-[#7CB3CD] font-semibold' },
    { indent: 2, icon: '📄', name: 'characters.json', color: 'text-[#7CB3CD]' },
    { indent: 2, icon: '📄', name: 'timeline.json', color: 'text-[#7CB3CD]' },
    { indent: 1, icon: '📁', name: 'CuttingRoom/', color: 'text-[#8E8474]' },
    { indent: 2, icon: '📄', name: 'cuts.json', color: 'text-[#A09686]' }
  ];

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#221E18] selection:bg-[#F1EAD9] selection:text-[#221E18] font-sans antialiased">
      {/* 1. TOP ANNOUNCEMENT BANNER */}
      <aside
        aria-label="Announcement"
        className="bg-[#F1EAD9] text-[#221E18] text-xs font-sans py-2.5 px-4 border-b border-[rgba(34,30,24,0.12)] flex flex-wrap items-center justify-center gap-2.5 shadow-xs transition-colors"
      >
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] text-[10px] font-mono font-medium text-[#7A705F]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B54B32]" />
          <span className="tracking-[0.14em] uppercase text-[#B54B32] font-semibold">Local-First Studio</span>
        </div>
        <span className="text-[#221E18] font-medium tracking-tight">
          Local-first manuscript drafting with the 42% optical typewriter horizon.
        </span>
        <button
          onClick={() => onEnterStudio('editor')}
          className="inline-flex items-center gap-1 font-semibold text-[#B54B32] hover:text-[#9E3E27] transition-colors cursor-pointer group underline-offset-4 hover:underline"
        >
          <span>Start Writing →</span>
        </button>
      </aside>

      {/* 2. PRIMARY STICKY NAVIGATION HEADER */}
      <header
        className={`sticky top-0 z-40 bg-[#FAF6EE]/95 backdrop-blur-md border-b border-[rgba(34,30,24,0.12)] transition-all duration-200 ${
          isScrolled ? 'py-2 shadow-xs' : 'py-3'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <button
              onClick={() => onEnterStudio('home')}
              className="flex items-center gap-2.5 cursor-pointer text-left group"
              aria-label="Threadline Home"
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

            {/* Benefit-First 4 Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#7A705F]" aria-label="Main Navigation">
              <a href="#structure" className="hover:text-[#221E18] transition-colors">
                Structure
              </a>
              <a href="#codex" className="hover:text-[#221E18] transition-colors">
                Codex
              </a>
              <a href="#files" className="hover:text-[#221E18] transition-colors">
                Your Files
              </a>
              <a href="#downloads" className="hover:text-[#221E18] transition-colors">
                Downloads
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Subtle returning user link */}
            <button
              onClick={() => onEnterStudio('projects')}
              className="text-xs text-[#7A705F] hover:text-[#221E18] transition-colors font-medium px-2 py-1 cursor-pointer hidden sm:inline-block"
            >
              My Projects
            </button>

            {/* Unified Primary Action: Start Writing */}
            <button
              onClick={() => onEnterStudio('editor')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold text-[#FAF6EE] bg-[#B54B32] hover:bg-[#9E3E27] shadow-xs transition-all active:scale-[0.98] cursor-pointer min-h-[36px]"
            >
              <span>Start Writing →</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION — THREE.JS ANIMATION + CONVERSATIONAL HEADLINE + PRODUCT DEMO */}
      <section className="pt-10 sm:pt-14 md:pt-18 pb-16 px-4 sm:px-6 relative overflow-hidden border-b border-[rgba(34,30,24,0.12)]">
        {/* Subtle Background Watermark */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 opacity-4 pointer-events-none">
          <ThreadlineMark size={640} color="#221E18" knotColor="#B54B32" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Main Title with modern Instrument Serif display font */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-['Instrument_Serif',serif] font-normal text-[#161412] tracking-tight leading-[1.05] mb-5">
            Writing is hard enough.
            <br />
            <span className="italic text-[#B54B32]">
              Your tools shouldn&apos;t get in the way.
            </span>
          </h1>

          {/* Conversational, honest Subheadline */}
          <p className="text-base sm:text-lg text-[#6E6659] max-w-2xl mx-auto font-['Plus_Jakarta_Sans',sans-serif] leading-relaxed mb-8">
            Threadline is the quiet, local-first studio for novelists and screenwriters who want to draft in peace. No subscriptions, no cloud sync conflicts right before a deadline, and no AI rewriting your voice. Just your words, saved directly to your hard drive in clean text.
          </p>

          {/* Primary CTA + Secondary Anchor Link */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
            <button
              onClick={() => onEnterStudio('editor')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-md text-sm font-semibold text-[#FAF6EE] bg-[#B54B32] hover:bg-[#9E3E27] shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer min-h-[46px] font-['Plus_Jakarta_Sans',sans-serif]"
            >
              <span>Start Writing — Free, No Signup</span>
              <ArrowRight size={15} />
            </button>

            <a
              href="#downloads"
              className="text-xs font-mono text-[#6E6659] hover:text-[#161412] py-2 px-3 transition-colors cursor-pointer inline-flex items-center gap-1.5 hover:underline underline-offset-4"
            >
              <span>or download desktop app for Mac &amp; Windows ↓</span>
            </a>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F1EAD9]/80 border border-[rgba(34,30,24,0.12)] text-[#6E6659] text-[11px] font-mono mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B54B32]" />
            <span>No Accounts · No Cloud Anxiety · 100% On Your Machine</span>
          </div>

          {/* THREE.JS HERO ANIMATION STAGE (MINIMAL, INTERACTIVE, AESTHETIC) */}
          <div className="max-w-3xl mx-auto mb-10">
            <div className="relative h-[230px] sm:h-[270px] md:h-[300px] w-full rounded-lg border border-[rgba(34,30,24,0.12)] bg-[#F5EFE4]/80 backdrop-blur-xs overflow-hidden shadow-xs ring-1 ring-[rgba(34,30,24,0.04)]">
              {/* Three.js interactive canvas */}
              <HeroThreeCanvas className="w-full h-full" />

              {/* Minimal header overlay */}
              <div className="absolute top-3 left-4 pointer-events-none flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B54B32]" />
                <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#6E6659] font-medium">
                  Living Narrative Ribbon · Interactive Three.js
                </span>
              </div>
            </div>
          </div>

          {/* LIVE ANIMATED PRODUCT DEMO (ABOVE THE FOLD) */}
          <div className="mt-4 mb-10 text-left max-w-3xl mx-auto">
            <div className="bg-[#FAF6EE] rounded-lg border border-[rgba(34,30,24,0.14)] shadow-md overflow-hidden ring-1 ring-[rgba(34,30,24,0.06)]">
              {/* Editor Chrome Top Bar */}
              <div className="bg-[#F1EAD9] px-4 py-2.5 border-b border-[rgba(34,30,24,0.12)] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E08D79]/40 border border-[#B54B32]/30" />
                    <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                    <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                  </div>
                  <span className="font-mono text-[11px] text-[#7A705F] pl-2 border-l border-[rgba(34,30,24,0.12)]">
                    Chapter 01 · The Slipway Bell
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-800 font-medium">
                    Drafting
                  </span>
                </div>

                <div className="flex items-center gap-2 font-mono text-[11px] text-[#7A705F]">
                  <span className="hidden sm:inline">Optical Horizon:</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] text-[#B54B32] font-semibold text-[10px]">
                    42% LOCKED
                  </span>
                </div>
              </div>

              {/* Editor Viewport with Fixed 42% Horizon Caret Line */}
              <div className="relative h-[260px] sm:h-[290px] bg-[#FAF6EE] overflow-hidden p-6 sm:p-8 select-none">
                {/* Visual Horizon Guide Pinned at 42% */}
                <div
                  className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                  style={{ top: '42%' }}
                >
                  <div className="w-full h-px bg-[#B54B32]/35 border-b border-dashed border-[#B54B32]/40" />
                  <div className="absolute right-4 -top-2.5 px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider bg-[#B54B32] text-white shadow-xs">
                    Typewriter Horizon 42%
                  </div>
                </div>

                {/* Animated Text Block Scrolling Beneath Fixed Horizon */}
                <div
                  className={`font-serif text-base sm:text-lg leading-[1.8] text-[#221E18] max-w-xl mx-auto ${
                    prefersReducedMotion ? '' : 'animate-horizon-scroll'
                  }`}
                  style={{
                    willChange: 'transform'
                  }}
                >
                  <p className="mb-6">
                    The iron bell of St. Jude tolled three minutes past midnight. Below the clocktower, the harbor smelled of low tide and charred spruce, the unmistakable perfume of the northern slipways.
                  </p>
                  <p className="mb-6">
                    Silas smoothed the vellum ledger across the heavy oak table, his fountain pen hovering above the inkwell. Every brass gear in the astronomical tower hummed in sympathetic vibration. If the tide rose another three inches before dawn, the seawall lock would trigger.
                  </p>
                  <p className="mb-6">
                    A solitary lantern flickered on the wet granite cobbles below. A courier in an oiled cloak looked up toward his window, waiting for the signal to cross the basin.
                  </p>
                  <p className="mb-6 text-[#7A705F]">
                    He dipped the nib into the iron-gall ink. Some stories demand to be told from their endings; this one began with water.
                  </p>
                </div>

                {/* Subtle Top & Bottom Gradient Fades for Smooth Horizon Flow */}
                <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-[#FAF6EE] to-transparent pointer-events-none z-10" />
                <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-[#FAF6EE] to-transparent pointer-events-none z-10" />
              </div>

              {/* Editor Chrome Footer */}
              <div className="bg-[#F1EAD9]/80 px-4 py-2 border-t border-[rgba(34,30,24,0.12)] flex flex-wrap items-center justify-between text-[11px] font-mono text-[#7A705F] gap-2">
                <div className="flex items-center gap-3">
                  <span>Scene 01 · 1,840 words</span>
                  <span className="hidden sm:inline">· Target: 2,500 words (73%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#221E18] font-semibold">Reading Time: ~7 min</span>
                  <span className="text-[#B54B32]">● Autosaved</span>
                </div>
              </div>
            </div>

            {/* Quiet Caption under Demo (Replacing Clunky Callout) */}
            <p className="text-center text-xs font-mono text-[#7A705F] mt-3">
              The 42% optical horizon keeps your gaze fixed at eye-level while prose flows beneath it without neck strain.
            </p>
          </div>

          {/* Trust-badge row with interactive hover tooltips */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-[#7A705F] font-mono pt-6 border-t border-[rgba(34,30,24,0.12)] max-w-3xl mx-auto text-left">
            <div className="p-2 rounded bg-[#F1EAD9]/40 hover:bg-[#F1EAD9] transition-colors border border-[rgba(34,30,24,0.06)] group">
              <div className="flex items-center gap-1.5 font-semibold text-[#221E18] mb-0.5">
                <ShieldCheck size={14} className="text-[#35505F] shrink-0" />
                <span className="truncate">100% Local-First</span>
              </div>
              <p className="text-[10px] text-[#7A705F] leading-tight">All words stay on your disk.</p>
            </div>

            <div className="p-2 rounded bg-[#F1EAD9]/40 hover:bg-[#F1EAD9] transition-colors border border-[rgba(34,30,24,0.06)] group">
              <div className="flex items-center gap-1.5 font-semibold text-[#221E18] mb-0.5">
                <Zap size={14} className="text-[#B54B32] shrink-0" />
                <span className="truncate">Zero Telemetry</span>
              </div>
              <p className="text-[10px] text-[#7A705F] leading-tight">No trackers or cloud logs.</p>
            </div>

            <div className="p-2 rounded bg-[#F1EAD9]/40 hover:bg-[#F1EAD9] transition-colors border border-[rgba(34,30,24,0.06)] group">
              <div className="flex items-center gap-1.5 font-semibold text-[#221E18] mb-0.5">
                <Terminal size={14} className="text-[#35505F] shrink-0" />
                <span className="truncate">Plain Markdown</span>
              </div>
              <p className="text-[10px] text-[#7A705F] leading-tight">Readable in any text editor.</p>
            </div>

            <div className="p-2 rounded bg-[#F1EAD9]/40 hover:bg-[#F1EAD9] transition-colors border border-[rgba(34,30,24,0.06)] group">
              <div className="flex items-center gap-1.5 font-semibold text-[#221E18] mb-0.5">
                <Lock size={14} className="text-[#7A705F] shrink-0" />
                <span className="truncate">No Account</span>
              </div>
              <p className="text-[10px] text-[#7A705F] leading-tight">Start drafting immediately.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SOCIAL PROOF STRIP (NEW THIN BAND) */}
      <section className="bg-[#F1EAD9] py-4 px-4 sm:px-6 border-b border-[rgba(34,30,24,0.12)]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-mono text-[#7A705F]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#B54B32]" />
            <span className="text-[#221E18] font-bold">Trusted by 4,200+ writers</span>
            <span>drafting over 18,500,000 words this month</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#221E18] italic font-serif">
            <Quote size={12} className="text-[#B54B32] not-italic inline" />
            <span>&ldquo;Drafted my 120,000-word debut novel entirely in Threadline.&rdquo;</span>
            <span className="text-[#7A705F] font-mono not-italic text-[10px]">— Sarah Chen</span>
          </div>
        </div>
      </section>

      {/* 5. FOUR INTEGRATED NARRATIVE SYSTEMS (ANIMATED TAB DEMOS) */}
      <section id="structure" className="py-20 px-4 sm:px-6 bg-[#FAF6EE] border-b border-[rgba(34,30,24,0.12)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl sm:text-4xl font-['Instrument_Serif',serif] text-[#161412] tracking-tight">
              Built around how books &amp; scripts <span className="italic text-[#B54B32]">actually get written</span>.
            </h2>
            <p className="text-sm text-[#6E6659] mt-3 font-['Plus_Jakarta_Sans',sans-serif] leading-relaxed">
              Four connected narrative systems—no complicated database formulas or endless configuration menus. Just four focused spaces that keep your active draft, corkboard outline, character lore, and continuity in sync.
            </p>
          </div>

          {/* Tab Selection Row */}
          <div className="flex items-center justify-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
            {[
              { id: 'canvas', label: 'Manuscript Canvas', icon: FileText },
              { id: 'corkboard', label: 'Structure Matrix', icon: Layers },
              { id: 'codex', label: 'Codex & Lore Vault', icon: Compass },
              { id: 'continuity', label: 'Continuity Radar', icon: Sparkles }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer min-h-[42px] border ${
                    isActive
                      ? 'bg-[#F1EAD9] text-[#221E18] border-[rgba(34,30,24,0.18)] shadow-xs font-semibold'
                      : 'text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9]/60 border-transparent'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-[#B54B32]' : 'text-[#7A705F]'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB CONTENT DEMO CARD */}
          <div className="bg-[#FAF6EE] rounded-lg border border-[rgba(34,30,24,0.14)] shadow-sm overflow-hidden p-6 sm:p-8 transition-all">
            {/* TAB 1: MANUSCRIPT CANVAS */}
            {activeTab === 'canvas' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[rgba(34,30,24,0.12)] pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono uppercase text-[#7A705F]">Chapter 01 · Scene 01</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#35505F]" />
                    <span className="text-xs font-medium text-[#35505F]">Prose &amp; Markdown Canvas</span>
                  </div>
                  <div className="text-xs font-mono text-[#7A705F]">
                    Eye-Level Typewriter Horizon: <span className="text-[#B54B32] font-bold">42%</span>
                  </div>
                </div>

                <div className="max-w-2xl mx-auto py-4 font-serif text-base sm:text-lg leading-relaxed text-[#221E18]">
                  <p className="mb-4">
                    The iron bell of St. Jude tolled three minutes past midnight. Below the clocktower, the harbor smelled of low tide and charred spruce, the unmistakable perfume of the northern slipways.
                  </p>
                  <p className="mb-4 text-[#7A705F]">
                    Silas smoothed the vellum ledger across the oak table, his fountain pen hovering above the inkwell. Every brass gear in the astronomical tower hummed in sympathetic vibration.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[rgba(34,30,24,0.12)] text-xs text-[#7A705F]">
                  <div className="flex items-center gap-4">
                    <span>Target: 2,500 words</span>
                    <span>Actual: 1,840 words (73%)</span>
                  </div>
                  <button
                    onClick={() => onEnterStudio('editor')}
                    className="inline-flex items-center gap-1.5 font-semibold text-[#B54B32] hover:text-[#9E3E27] cursor-pointer"
                  >
                    <span>Try in Editor →</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: CORKBOARD MATRIX */}
            {activeTab === 'corkboard' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[rgba(34,30,24,0.12)] pb-4">
                  <div className="flex items-center gap-2">
                    <Layers size={15} className="text-[#B54B32]" />
                    <span className="font-serif font-semibold text-sm">Act I: The Call &amp; Crossing</span>
                  </div>
                  <span className="text-xs font-mono text-[#7A705F]">3 Scene Index Cards</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {[
                    { num: '01', title: 'The Harbor Bell', status: 'Drafting', color: '#35505F', words: '1,840', pov: 'Evelyn Gray', delay: 0 },
                    { num: '02', title: 'The Ledger Office', status: 'Revised', color: '#B54B32', words: '2,100', pov: 'Marcus Vance', delay: 60 },
                    { num: '03', title: 'Whispers at the Quay', status: 'Idea', color: '#7A705F', words: '950', pov: 'Evelyn Gray', delay: 120 }
                  ].map((card) => (
                    <div
                      key={card.num}
                      className="bg-[#F1EAD9] p-4 rounded-md border border-[rgba(34,30,24,0.12)] space-y-2.5 hover:shadow-xs transition-all"
                      style={{
                        animation: prefersReducedMotion ? 'none' : 'fadeInUp 200ms ease-out forwards',
                        animationDelay: `${card.delay}ms`
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-[#7A705F]">Scene {card.num}</span>
                        <span
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold text-[#FAF6EE]"
                          style={{ backgroundColor: card.color }}
                        >
                          {card.status}
                        </span>
                      </div>
                      <div className="font-serif font-semibold text-sm text-[#221E18]">{card.title}</div>
                      <div className="text-[11px] text-[#7A705F] flex items-center justify-between pt-2 border-t border-[rgba(34,30,24,0.08)]">
                        <span>POV: {card.pov}</span>
                        <span className="font-mono">{card.words} w</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[rgba(34,30,24,0.12)] text-xs text-[#7A705F]">
                  <span>Pacing heatmap &amp; chapter word-count quotas update automatically.</span>
                  <button
                    onClick={() => onEnterStudio('dashboard')}
                    className="inline-flex items-center gap-1.5 font-semibold text-[#B54B32] hover:text-[#9E3E27] cursor-pointer"
                  >
                    <span>Try in Editor →</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: CODEX & LORE VAULT */}
            {activeTab === 'codex' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[rgba(34,30,24,0.12)] pb-4">
                  <div className="flex items-center gap-2">
                    <Compass size={15} className="text-[#35505F]" />
                    <span className="font-serif font-semibold text-sm">Codex Profile: Evelyn Gray (Protagonist)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#35505F] bg-[#35505F]/10 px-2 py-0.5 rounded font-medium">
                      Confirmed Canon
                    </span>
                    <span className="text-xs font-mono text-[#B54B32] bg-[#B54B32]/10 px-2 py-0.5 rounded font-semibold">
                      Mentioned in {codexMentionCount} scenes
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-[#F1EAD9] p-4 rounded-md border border-[rgba(34,30,24,0.12)] space-y-2">
                    <div className="font-semibold text-[#221E18] uppercase tracking-wider text-[10px] font-mono">
                      Canonical Attributes
                    </div>
                    <ul className="space-y-1.5 text-[#221E18]">
                      <li className="flex items-start gap-1.5">
                        <span className="text-[#B54B32]">•</span> Eye color: Hazel (confirmed Chapter 01)
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-[#B54B32]">•</span> Age: 31 during Harbor Riots
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-[#B54B32]">•</span> Motivation: Vindicate father&apos;s lost ledger
                      </li>
                    </ul>
                  </div>

                  <div className="bg-[#F1EAD9] p-4 rounded-md border border-[rgba(34,30,24,0.12)] space-y-2">
                    <div className="font-semibold text-[#221E18] uppercase tracking-wider text-[10px] font-mono">
                      Bidirectional Scene Tracking
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
                        <span className="text-[#7A705F]">Referenced</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[rgba(34,30,24,0.12)] text-xs text-[#7A705F]">
                  <span>Inline mention engine links @Character and #Lore directly inside your prose.</span>
                  <button
                    onClick={() => onEnterStudio('codex')}
                    className="inline-flex items-center gap-1.5 font-semibold text-[#B54B32] hover:text-[#9E3E27] cursor-pointer"
                  >
                    <span>Try in Editor →</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: CONTINUITY RADAR */}
            {activeTab === 'continuity' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[rgba(34,30,24,0.12)] pb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles size={15} className="text-[#B54B32]" />
                    <span className="font-serif font-semibold text-sm">Continuity Radar &amp; Timeline Audit</span>
                  </div>
                  <span
                    className={`text-xs font-mono px-2 py-0.5 rounded font-semibold transition-all ${
                      continuityState === 'resolved'
                        ? 'text-emerald-800 bg-emerald-100'
                        : 'text-[#B54B32] bg-[#B54B32]/10'
                    }`}
                  >
                    {continuityState === 'resolved' ? 'All Inconsistencies Cleared' : '1 Warning Flagged'}
                  </span>
                </div>

                <div className="bg-[#F1EAD9] p-4 rounded-md border border-[rgba(34,30,24,0.12)] space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full transition-colors ${
                            continuityState === 'resolved' ? 'bg-emerald-600' : 'bg-[#B54B32]'
                          }`}
                        />
                        <span
                          className={`font-serif font-semibold text-sm transition-all ${
                            continuityState === 'resolved'
                              ? 'text-[#7A705F] line-through'
                              : 'text-[#221E18]'
                          }`}
                        >
                          Eye Color Inconsistency: Evelyn Gray
                        </span>
                      </div>
                      <p className="text-xs text-[#7A705F] mt-1">
                        Scene 01 states Evelyn has &ldquo;hazel eyes,&rdquo; but Scene 09 describes her with &ldquo;steely blue eyes.&rdquo;
                      </p>
                    </div>

                    <div className="shrink-0">
                      {continuityState === 'resolved' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded">
                          <Check size={12} strokeWidth={3} /> Resolved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-[#B54B32] bg-[#B54B32]/10 px-2.5 py-1 rounded">
                          <AlertCircle size={12} /> Resolving...
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[rgba(34,30,24,0.12)] text-xs text-[#7A705F]">
                  <span>Timeline and lore audit flags contradictions before you send your manuscript to beta readers.</span>
                  <button
                    onClick={() => onEnterStudio('continuity')}
                    className="inline-flex items-center gap-1.5 font-semibold text-[#B54B32] hover:text-[#9E3E27] cursor-pointer"
                  >
                    <span>Try in Editor →</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. ZERO PLATFORM LOCK-IN (FORMALIZED DARK TERMINAL MOMENT) */}
      <section
        id="files"
        ref={vaultRef}
        className="py-24 px-4 sm:px-6 bg-[#17140F] text-[#FAF6EE] border-t border-b border-[#2F2720]"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-5xl font-['Instrument_Serif',serif] font-normal text-[#FAF6EE] tracking-tight">
              If we vanished tomorrow, <span className="italic text-[#E08D79]">you wouldn&apos;t lose a word</span>.
            </h2>
            <p className="text-sm text-[#A89E8E] mt-3 leading-relaxed font-['Plus_Jakarta_Sans',sans-serif] max-w-xl mx-auto">
              Plain text, zero lock-in: we never trap your life&apos;s work behind a proprietary format or paywalled server. Every chapter is saved as a clean text file on your hard drive. Open it in Obsidian, VS Code, or Notepad fifty years from now.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Terminal File Tree with Sequential Animation & Corrected Codex/ folder */}
            <div className="bg-[#100E0B] p-6 rounded-md border border-[#2F2720] shadow-2xl font-mono text-xs text-[#DDD4C4] space-y-2 min-h-[300px]">
              <div className="text-[#8E8474] pb-2 border-b border-[#262019] flex items-center justify-between">
                <span>📁 MyNovel_Vault/</span>
                <span className="text-[10px] text-[#7CB3CD] bg-[#1E2830] px-2 py-0.5 rounded border border-[#2D3E4B]">
                  Obsidian Compatible
                </span>
              </div>

              <div className="space-y-1.5 pl-2 text-[11px]">
                {fileTreeRows.slice(1).map((row, idx) => {
                  const isVisible = idx < visibleTreeLines;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between transition-opacity duration-150 ${
                        isVisible ? 'opacity-100' : 'opacity-0'
                      }`}
                      style={{ paddingLeft: `${(row.indent - 1) * 16}px` }}
                    >
                      <span className={row.color}>
                        {row.icon} {row.name}
                      </span>
                      {row.badge && (
                        <span className="text-[9px] text-[#E08D79] bg-[#341F1A] px-1.5 py-0.2 rounded border border-[#52291E]">
                          {row.badge}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Benefit Bullets (Accurate Mobile Copy) */}
            <div className="space-y-5 text-xs sm:text-sm text-[#A89E8E] leading-relaxed">
              <div className="flex items-start gap-3.5">
                <div className="p-1 rounded bg-[#25201A] border border-[#3D342B] text-[#7CB3CD] shrink-0 mt-0.5">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <strong className="text-[#FAF6EE] block text-sm font-sans mb-1">Pure Markdown Files</strong>
                  Every chapter and scene is written as standard Markdown with clean frontmatter. You can open them in Obsidian, VS Code, iA Writer, or standard text editors.
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-1 rounded bg-[#25201A] border border-[#3D342B] text-[#7CB3CD] shrink-0 mt-0.5">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <strong className="text-[#FAF6EE] block text-sm font-sans mb-1">Git &amp; Backup Friendly</strong>
                  Track your revisions with standard Git, sync with iCloud or Dropbox, or keep it on an offline encrypted hard drive.
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-1 rounded bg-[#25201A] border border-[#3D342B] text-[#7CB3CD] shrink-0 mt-0.5">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <strong className="text-[#FAF6EE] block text-sm font-sans mb-1">Native Desktop &amp; Companion Web</strong>
                  Runs natively on macOS and Windows with instant local file writes, and is available as a lightweight companion view on phone and tablet browsers.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS / DEEPER SOCIAL PROOF (NEW SECTION) */}
      <section className="py-20 px-4 sm:px-6 bg-[#FAF6EE] border-b border-[rgba(34,30,24,0.12)]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-['Instrument_Serif',serif] text-[#161412] tracking-tight">
              Writers who left <span className="italic text-[#B54B32]">subscription fatigue</span> behind.
            </h2>
            <p className="text-sm text-[#6E6659] mt-2 font-['Plus_Jakarta_Sans',sans-serif]">
              Thoughts from novelists and screenwriters who wanted a distraction-free desk instead of another monthly invoice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Testimonial 1 */}
            <div className="bg-[#F1EAD9] p-6 sm:p-7 rounded-lg border border-[rgba(34,30,24,0.12)] shadow-xs flex flex-col justify-between space-y-4">
              <p className="font-serif text-sm sm:text-base leading-relaxed text-[#221E18] italic">
                &ldquo;Threadline replaced three disjointed tools for me. Drafting with the fixed horizon feels like writing on an endless sheet of fine heavy paper, while the Codex quietly kept my 120,000-word timeline watertight.&rdquo;
              </p>
              <div className="pt-4 border-t border-[rgba(34,30,24,0.08)] flex items-center justify-between">
                <div>
                  <div className="font-serif font-bold text-sm text-[#221E18]">Sarah Chen</div>
                  <div className="text-[11px] font-mono text-[#7A705F]">
                    Historical Fiction Novelist · Querying Agents
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] text-[#35505F] font-medium">
                  120k Manuscript
                </span>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-[#F1EAD9] p-6 sm:p-7 rounded-lg border border-[rgba(34,30,24,0.12)] shadow-xs flex flex-col justify-between space-y-4">
              <p className="font-serif text-sm sm:text-base leading-relaxed text-[#221E18] italic">
                &ldquo;Having native industry-standard screenplay formatting alongside a real local-first markdown vault is unprecedented. It&apos;s the only writing tool on my Mac that has zero lag, zero cloud dependencies, and zero distractions.&rdquo;
              </p>
              <div className="pt-4 border-t border-[rgba(34,30,24,0.08)] flex items-center justify-between">
                <div>
                  <div className="font-serif font-bold text-sm text-[#221E18]">Julian Vance</div>
                  <div className="text-[11px] font-mono text-[#7A705F]">
                    Feature Screenwriter &amp; Showrunner · WGA East
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] text-[#B54B32] font-medium">
                  Film &amp; TV
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. DRAFTING PACE ESTIMATOR */}
      <section className="py-16 px-4 sm:px-6 bg-[#F1EAD9]/60 border-b border-[rgba(34,30,24,0.12)]">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div>
            <h2 className="text-3xl sm:text-4xl font-['Instrument_Serif',serif] text-[#161412] tracking-tight">
              When will that first draft <span className="italic text-[#B54B32]">actually be finished</span>?
            </h2>
            <p className="text-sm text-[#6E6659] mt-2 font-['Plus_Jakarta_Sans',sans-serif]">
              Realistic forecasting: slide the numbers to see your timeline based on how you truly write. No guilt trips, just math.
            </p>
          </div>

          <div className="bg-[#FAF6EE] p-6 rounded-lg border border-[rgba(34,30,24,0.14)] shadow-xs space-y-5 text-left">
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
                  className="px-4 py-2 rounded-md bg-[#221E18] text-[#FAF6EE] text-xs font-semibold hover:bg-black transition-colors cursor-pointer min-h-[38px]"
                >
                  Start Manuscript
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. DOWNLOADS SECTION (OFFICIAL OS LOGOS, OS AUTO-DETECTED, CONVERSATIONAL TRUST) */}
      <section id="downloads" className="py-20 md:py-24 px-4 sm:px-6 bg-[#F2EADA] border-t border-b border-[rgba(34,30,24,0.14)]">
        <div className="max-w-5xl mx-auto space-y-10">
          {/* Section Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-['Instrument_Serif',serif] font-normal text-[#161412] tracking-tight">
              Ready when you are. <span className="italic text-[#B54B32]">Write on your own terms</span>.
            </h2>
            <p className="text-sm sm:text-base text-[#6E6659] max-w-xl mx-auto font-['Plus_Jakarta_Sans',sans-serif] leading-relaxed">
              Grab our zero-latency desktop app for direct local disk access, or launch right in your browser tab. Both are 100% offline-ready, free to use, and require zero signup.
            </p>

            {/* Trust Reinforcement Line Directly Above Cards */}
            <div className="text-xs font-mono text-[#7A705F] pt-2">
              100% offline &amp; local-first · Zero cloud telemetry · Direct file writes to your disk
            </div>
          </div>

          {/* 3 Main Options Grid: Windows, macOS, Web App (Auto-Detected OS Prioritized) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* OPTION 1: MACOS WITH AUTHENTIC APPLE LOGO */}
            <div
              className={`bg-[#FAF6EE] rounded-lg p-6 flex flex-col justify-between transition-all relative ${
                detectedOS === 'macos'
                  ? 'border-2 border-[#B54B32] shadow-md ring-1 ring-[#B54B32]/20'
                  : 'border border-[rgba(34,30,24,0.12)] shadow-xs hover:shadow-sm'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-lg bg-[#F1EAD9] border border-[rgba(34,30,24,0.12)] flex items-center justify-center text-[#161412] shadow-2xs">
                    <AppleLogo size={26} className="text-[#161412]" />
                  </div>
                  {detectedOS === 'macos' ? (
                    <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#B54B32] text-white">
                      ★ Recommended for Mac
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono uppercase font-medium px-2 py-0.5 rounded bg-[#F1EAD9] text-[#7A705F]">
                      macOS 12+
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-['Syne',sans-serif] text-lg font-bold text-[#161412] flex items-center gap-1.5">
                    <span>Apple macOS</span>
                  </h3>
                  <p className="text-xs text-[#7A705F] font-mono mt-0.5">Apple Silicon (M1–M4) &amp; Intel (.dmg)</p>
                </div>

                <p className="text-xs text-[#6E6659] font-['Plus_Jakarta_Sans',sans-serif] leading-relaxed">
                  Universal binary tuned for macOS Sonoma &amp; Sequoia. Sharp Retina typography, instant SQLite indexing, and local markdown vaults.
                </p>

                {/* Collapsed Details Disclosure */}
                <details className="text-[11px] font-mono text-[#7A705F] cursor-pointer pt-1">
                  <summary className="hover:text-[#221E18] transition-colors py-1 select-none">
                    Technical specifications &amp; file size
                  </summary>
                  <div className="mt-2 p-2.5 rounded bg-[#F1EAD9]/60 border border-[rgba(34,30,24,0.08)] space-y-1">
                    <div className="flex justify-between">
                      <span>Package:</span>
                      <span className="text-[#221E18] font-semibold truncate max-w-[130px]">
                        {releaseInfo?.macosAsset?.name || 'Threadline_universal.dmg'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <span className="text-[#221E18]">
                        {releaseInfo?.macosAsset?.size ? formatFileSize(releaseInfo.macosAsset.size) : '~79 MB'}
                      </span>
                    </div>
                  </div>
                </details>
              </div>

              <div className="mt-6 pt-4 border-t border-[rgba(34,30,24,0.08)] space-y-2">
                <a
                  href={releaseInfo?.macosAsset?.browser_download_url || releaseInfo?.htmlUrl || `https://github.com/${DEFAULT_GITHUB_REPO}/releases`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-md text-xs font-semibold transition-colors shadow-xs min-h-[42px] font-['Plus_Jakarta_Sans',sans-serif] ${
                    detectedOS === 'macos'
                      ? 'bg-[#B54B32] hover:bg-[#9E3E27] text-white'
                      : 'bg-[#161412] hover:bg-[#35505F] text-white'
                  }`}
                >
                  <AppleLogo size={18} className="text-white shrink-0" />
                  <span>Download for macOS (.dmg)</span>
                </a>
                <p className="text-[10px] text-center text-[#7A705F] font-mono">
                  Apple universal disk image (.dmg)
                </p>
              </div>
            </div>

            {/* OPTION 2: WINDOWS WITH AUTHENTIC WINDOWS LOGO */}
            <div
              className={`bg-[#FAF6EE] rounded-lg p-6 flex flex-col justify-between transition-all relative ${
                detectedOS === 'windows'
                  ? 'border-2 border-[#B54B32] shadow-md ring-1 ring-[#B54B32]/20'
                  : 'border border-[rgba(34,30,24,0.12)] shadow-xs hover:shadow-sm'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-lg bg-[#F1EAD9] border border-[rgba(34,30,24,0.12)] flex items-center justify-center text-[#0078D4] shadow-2xs">
                    <WindowsLogo size={24} className="text-[#0078D4]" />
                  </div>
                  {detectedOS === 'windows' ? (
                    <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#B54B32] text-white">
                      ★ Recommended for PC
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono uppercase font-medium px-2 py-0.5 rounded bg-[#F1EAD9] text-[#7A705F]">
                      Windows 10 / 11
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-['Syne',sans-serif] text-lg font-bold text-[#161412] flex items-center gap-1.5">
                    <span>Microsoft Windows</span>
                  </h3>
                  <p className="text-xs text-[#7A705F] font-mono mt-0.5">Windows 11 &amp; 10 64-bit (.exe)</p>
                </div>

                <p className="text-xs text-[#6E6659] font-['Plus_Jakarta_Sans',sans-serif] leading-relaxed">
                  Native Windows 10 and 11 executable. Direct local file writes, offline SQLite indexing, and smooth typewriting.
                </p>

                {/* Collapsed Details Disclosure */}
                <details className="text-[11px] font-mono text-[#7A705F] cursor-pointer pt-1">
                  <summary className="hover:text-[#221E18] transition-colors py-1 select-none">
                    Technical specifications &amp; file size
                  </summary>
                  <div className="mt-2 p-2.5 rounded bg-[#F1EAD9]/60 border border-[rgba(34,30,24,0.08)] space-y-1">
                    <div className="flex justify-between">
                      <span>Package:</span>
                      <span className="text-[#221E18] font-semibold truncate max-w-[130px]">
                        {releaseInfo?.windowsAsset?.name || 'Threadline_x64-setup.exe'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <span className="text-[#221E18]">
                        {releaseInfo?.windowsAsset?.size ? formatFileSize(releaseInfo.windowsAsset.size) : '~75 MB'}
                      </span>
                    </div>
                  </div>
                </details>
              </div>

              <div className="mt-6 pt-4 border-t border-[rgba(34,30,24,0.08)] space-y-2">
                <a
                  href={releaseInfo?.windowsAsset?.browser_download_url || releaseInfo?.htmlUrl || `https://github.com/${DEFAULT_GITHUB_REPO}/releases`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-md text-xs font-semibold transition-colors shadow-xs min-h-[42px] font-['Plus_Jakarta_Sans',sans-serif] ${
                    detectedOS === 'windows'
                      ? 'bg-[#B54B32] hover:bg-[#9E3E27] text-white'
                      : 'bg-[#161412] hover:bg-[#35505F] text-white'
                  }`}
                >
                  <WindowsLogo size={17} className="text-white shrink-0" />
                  <span>Download for Windows (.exe)</span>
                </a>
                <p className="text-[10px] text-center text-[#7A705F] font-mono">
                  Standard setup installer (.exe)
                </p>
              </div>
            </div>

            {/* OPTION 3: LAUNCH WEB APP WITH WEB BROWSER LOGO */}
            <div
              className={`bg-[#FAF6EE] rounded-lg p-6 flex flex-col justify-between transition-all relative ${
                detectedOS === 'web'
                  ? 'border-2 border-[#B54B32] shadow-md ring-1 ring-[#B54B32]/20'
                  : 'border border-[rgba(34,30,24,0.12)] shadow-xs hover:shadow-sm'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-md bg-[#F1EAD9] border border-[rgba(34,30,24,0.12)] flex items-center justify-center text-[#161412]">
                    <WebBrowserLogo size={22} className="text-[#161412]" />
                  </div>
                  {detectedOS === 'web' ? (
                    <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#B54B32] text-white">
                      ★ Instant Access
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono uppercase font-medium px-2 py-0.5 rounded bg-[#F1EAD9] text-[#7A705F]">
                      Browser
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-['Syne',sans-serif] text-lg font-bold text-[#161412] flex items-center gap-1.5">
                    <span>Web Studio</span>
                  </h3>
                  <p className="text-xs text-[#7A705F] font-mono mt-0.5">Browser Studio · Zero Install</p>
                </div>

                <p className="text-xs text-[#6E6659] font-['Plus_Jakarta_Sans',sans-serif] leading-relaxed">
                  Open Threadline immediately inside Chrome, Safari, Firefox, or Edge. Offline storage and seamless archive backups.
                </p>

                {/* Collapsed Details Disclosure */}
                <details className="text-[11px] font-mono text-[#7A705F] cursor-pointer pt-1">
                  <summary className="hover:text-[#221E18] transition-colors py-1 select-none">
                    Technical specifications &amp; engine
                  </summary>
                  <div className="mt-2 p-2.5 rounded bg-[#F1EAD9]/60 border border-[rgba(34,30,24,0.08)] space-y-1">
                    <div className="flex justify-between">
                      <span>Engine:</span>
                      <span className="text-[#221E18]">HTML5 / React 19 Client</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Storage:</span>
                      <span className="text-emerald-800 font-semibold">IndexedDB &amp; File System</span>
                    </div>
                  </div>
                </details>
              </div>

              <div className="mt-6 pt-4 border-t border-[rgba(34,30,24,0.08)] space-y-2">
                <button
                  onClick={() => onEnterStudio('editor')}
                  className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-xs font-semibold transition-colors shadow-xs cursor-pointer min-h-[40px] font-['Plus_Jakarta_Sans',sans-serif] ${
                    detectedOS === 'web'
                      ? 'bg-[#B54B32] hover:bg-[#9E3E27] text-white'
                      : 'bg-[#161412] hover:bg-stone-800 text-white'
                  }`}
                >
                  <WebBrowserLogo size={15} className="text-white shrink-0" />
                  <span>Launch Web Studio</span>
                  <ArrowRight size={14} />
                </button>
                <p className="text-[10px] text-center text-[#7A705F] font-mono">
                  Runs directly in modern browsers
                </p>
              </div>
            </div>
          </div>

          {/* Linux and Changelog Bar with Linux Vector Logo */}
          <div className="p-4 rounded-md bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] text-xs text-[#7A705F] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono">
            <div className="flex items-center gap-2.5">
              <LinuxLogo size={18} className="text-[#161412] shrink-0" />
              <span>
                Looking for Linux? Download universal <strong className="text-[#161412]">.AppImage</strong> and <strong className="text-[#161412]">.deb</strong> builds directly on GitHub.
              </span>
            </div>
            <a
              href={`https://github.com/${DEFAULT_GITHUB_REPO}/releases`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#B54B32] hover:underline shrink-0"
            >
              <span>GitHub Releases &amp; Linux</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </section>

      {/* 10. FINAL REPEATED CTA BAND */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-[#FAF6EE] text-center border-b border-[rgba(34,30,24,0.12)]">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-5xl font-['Instrument_Serif',serif] font-normal text-[#161412] tracking-tight">
            Keep the story connected. <span className="italic text-[#B54B32]">Keep the voice yours</span>.
          </h2>
          <p className="text-sm sm:text-base text-[#6E6659] max-w-xl mx-auto font-['Plus_Jakarta_Sans',sans-serif] leading-relaxed">
            Sit down, open a fresh sheet, and begin chapter one. Jump into the web studio right now with zero signup, or download the native desktop app for macOS and Windows.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onEnterStudio('editor')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-md text-sm font-semibold text-[#FAF6EE] bg-[#B54B32] hover:bg-[#9E3E27] shadow-sm transition-all active:scale-[0.98] cursor-pointer min-h-[46px] font-['Plus_Jakarta_Sans',sans-serif]"
            >
              <span>Start Writing — Free</span>
              <ArrowRight size={15} />
            </button>
            <a
              href="#downloads"
              className="text-xs font-mono text-[#6E6659] hover:text-[#161412] py-2 px-3 transition-colors cursor-pointer inline-flex items-center gap-1 hover:underline underline-offset-4"
            >
              <span>or download the desktop app ↓</span>
            </a>
          </div>
          <div className="text-[11px] font-mono text-[#7A705F]">
            Instant browser access · No account required · 100% local-first
          </div>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="py-12 px-4 sm:px-6 bg-[#14110E] text-xs text-[#958C7C] border-t border-[#26211B]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <ThreadlineBadge size={24} />
            <span className="font-serif font-semibold text-[#FAF6EE]">Threadline Studio</span>
            <span className="text-[11px] text-[#4A4235]">·</span>
            <span className="text-[#958C7C]">Editorial Edition</span>
          </div>

          <div className="flex items-center gap-6 flex-wrap justify-center font-medium">
            <a href="#structure" className="hover:text-[#FAF6EE] transition-colors">
              Structure
            </a>
            <a href="#codex" className="hover:text-[#FAF6EE] transition-colors">
              Codex
            </a>
            <a href="#files" className="hover:text-[#FAF6EE] transition-colors">
              Your Files
            </a>
            <a href="#downloads" className="text-[#E08D79] hover:text-[#FAF6EE] transition-colors">
              Downloads
            </a>
            <button
              onClick={() => onEnterStudio('projects')}
              className="hover:text-[#FAF6EE] transition-colors cursor-pointer"
            >
              Manuscripts Hub
            </button>
            <button
              onClick={() => onEnterStudio('editor')}
              className="hover:text-[#FAF6EE] transition-colors cursor-pointer"
            >
              Editor
            </button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto text-center sm:text-left mt-6 pt-6 border-t border-[#26211B] text-[#787062] font-mono text-[11px]">
          &ldquo;Keep the story connected. Keep the voice yours.&rdquo; Built for novelists, screenwriters, and long-form narrative architects.
        </div>
      </footer>
    </div>
  );
};
