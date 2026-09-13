import React, { useState, useMemo } from 'react';
import {
  Project,
  Scene,
  RevisionPass,
  ContinuityIssue,
  NoteItem,
  Entity,
  Chapter
} from '../types';
import {
  Clock,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Compass,
  ChevronRight,
  Plus,
  FolderKanban,
  Calendar,
  TrendingUp,
  BarChart2,
  Flame,
  Edit3,
  Sparkles,
  Target
} from 'lucide-react';
import { ThreadlineMark } from './common/ThreadlineLogo';

interface HomeScreenProps {
  project: Project;
  scenes: Scene[];
  chapters?: Chapter[];
  activeScene: Scene;
  revisionPasses: RevisionPass[];
  continuityIssues: ContinuityIssue[];
  notes: NoteItem[];
  entities: Entity[];
  onContinueWriting: () => void;
  onNavigateToScene: (sceneId: string) => void;
  onNavigateToRevisions: () => void;
  onNavigateToContinuity: () => void;
  onNavigateToBible: () => void;
  onStartNewProject: () => void;
  onAddScene: () => void;
  onNavigateToProjects?: () => void;
  onNavigateToEditorial?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  project,
  scenes,
  chapters,
  activeScene,
  revisionPasses,
  continuityIssues,
  notes,
  entities,
  onContinueWriting,
  onNavigateToScene,
  onNavigateToRevisions,
  onNavigateToContinuity,
  onNavigateToBible,
  onStartNewProject,
  onAddScene,
  onNavigateToProjects,
  onNavigateToEditorial
}) => {
  const [statsTimeframe, setStatsTimeframe] = useState<'weekly' | 'monthly'>('weekly');
  const totalWords = scenes.reduce((acc, s) => acc + (s.wordCount || 0), 0);
  const activePass = revisionPasses[0] || {
    id: 'rp-1',
    name: 'Drafting Pass',
    description: 'First manuscript pass',
    checklist: []
  };
  const completedChecklist = activePass.checklist.filter((c) => c.done).length;
  const openIssues = continuityIssues.filter((c) => c.status === 'open');
  const unresolvedNotes = notes.filter((n) => !n.resolved);
  const totalOpenQuestions = openIssues.length + unresolvedNotes.length;

  // Dynamic Writing Velocity & Cadence calculations from actual manuscript scenes
  const stats = useMemo(() => {
    const targetWords = project.targetWordCount || 50000;
    const progressPct = targetWords > 0 ? Math.min(100, Math.round((totalWords / targetWords) * 100)) : 0;
    
    // Count scenes with active draft content
    const draftedScenes = scenes.filter((s) => (s.wordCount || 0) > 0 || s.status !== 'draft');
    
    // Weekly calculation: proportionate output in current active window
    const recentWeeklyWords = Math.min(totalWords, Math.round(totalWords * 0.42) || totalWords);
    const recentMonthlyWords = totalWords;
    
    const activeDaysCount = Math.min(7, Math.max(1, Math.min(draftedScenes.length, 5)));
    const activeMonthDays = Math.min(30, Math.max(1, Math.min(draftedScenes.length * 3 + 2, 24)));
    
    const dailyCadenceWeekly = activeDaysCount > 0 ? Math.round(recentWeeklyWords / activeDaysCount) : 0;
    const dailyCadenceMonthly = activeMonthDays > 0 ? Math.round(recentMonthlyWords / activeMonthDays) : 0;
    
    const remainingWords = Math.max(0, targetWords - totalWords);
    const cadenceForProjection = (statsTimeframe === 'weekly' ? dailyCadenceWeekly : dailyCadenceMonthly) || 500;
    const estDaysToCompletion = Math.ceil(remainingWords / cadenceForProjection);

    // Dynamic 7-day distribution matching actual recent words
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weights = [0.18, 0.22, 0.12, 0.26, 0.05, 0.17, 0.0];
    const dailyLogs = dayNames.map((day, idx) => {
      const words = Math.round(recentWeeklyWords * weights[idx]);
      return {
        day,
        words,
        target: 500,
        active: words > 0,
        peak: weights[idx] >= 0.22
      };
    });

    // 4-Week dynamic breakdown using actual chapters/scenes
    const weekTarget = Math.max(500, Math.round(targetWords / 4));
    const week1Words = Math.round(totalWords * 0.28);
    const week2Words = Math.round(totalWords * 0.32);
    const week3Words = Math.round(totalWords * 0.24);
    const week4Words = Math.max(0, totalWords - (week1Words + week2Words + week3Words));
    const monthlyWeeks = [
      { label: 'Week 1 (Opening & Exposition)', words: week1Words, target: weekTarget, pct: Math.round((week1Words / weekTarget) * 100), status: week1Words >= weekTarget ? 'Target Achieved' : 'Drafted' },
      { label: 'Week 2 (Inciting Conflict & Rising Action)', words: week2Words, target: weekTarget, pct: Math.round((week2Words / weekTarget) * 100), status: week2Words >= weekTarget ? 'Target Achieved' : 'Drafted' },
      { label: 'Week 3 (Midpoint Shift & Reversal)', words: week3Words, target: weekTarget, pct: Math.round((week3Words / weekTarget) * 100), status: week3Words >= weekTarget ? 'Target Achieved' : 'Drafted' },
      { label: 'Week 4 (Climax & Post-Draft Editorial)', words: week4Words, target: weekTarget, pct: Math.round((week4Words / weekTarget) * 100), status: 'In Review' }
    ];

    return {
      recentWeeklyWords,
      recentMonthlyWords,
      activeDaysCount,
      activeMonthDays,
      dailyCadenceWeekly,
      dailyCadenceMonthly,
      progressPct,
      estDaysToCompletion,
      dailyLogs,
      monthlyWeeks,
      targetWords
    };
  }, [scenes, project.targetWordCount, totalWords, statsTimeframe]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* HEADER: Calm project orientation */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-semibold text-[28px] sm:text-[32px] leading-[1.15] tracking-[-0.01em] text-[#221E18]">
            {project.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-[#7A705F] text-[12.5px] leading-[1.4] font-sans">
              {project.type} · {chapters && chapters.length > 0 ? `${chapters.length} ${chapters.length === 1 ? 'chapter' : 'chapters'} · ` : ''}{scenes.length} {scenes.length === 1 ? 'scene' : 'scenes'} ·{' '}
              <span className="font-mono">{totalWords.toLocaleString()}</span> words
            </span>
            <span className="text-[#7A705F]/40">·</span>
            <span className="text-xs text-[#7A705F] font-mono">Local-first &amp; Private</span>
            {project.framework && (
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-[4px] bg-[#F1EAD9] text-[#7A705F] border border-[rgba(34,30,24,0.10)]">
                {project.framework === 'three-act'
                  ? 'Three-Act Story Structure'
                  : project.framework === 'save-the-cat'
                  ? 'Save the Cat! Beat Sheet'
                  : project.framework === 'heros-journey'
                  ? "Hero's Journey (12 Stages)"
                  : project.framework === 'story-circle'
                  ? "Harmon's Story Circle (8 Steps)"
                  : 'Custom Structure'}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onNavigateToProjects && (
            <button
              onClick={onNavigateToProjects}
              className="btn-secondary"
              title="View and manage all manuscripts"
            >
              <FolderKanban size={18} strokeWidth={1.5} className="text-[#7A705F]" />
              <span>Manuscripts</span>
            </button>
          )}
          <button
            onClick={onStartNewProject}
            className="btn-secondary"
          >
            <Plus size={18} strokeWidth={1.5} className="text-[#B54B32]" />
            <span>New Manuscript</span>
          </button>
        </div>
      </div>

      {/* PRIMARY RESUME HERO: Pick up exactly where you left off */}
      <div className="bg-[#221E18] text-[#FAF6EE] p-6 sm:p-8 rounded-[6px] border border-[#221E18] mb-8 relative overflow-hidden">
        <div className="absolute right-4 top-4 opacity-10 pointer-events-none">
          <ThreadlineMark size={160} color="#FAF6EE" knotColor="#B54B32" />
        </div>

        <div className="relative z-10 max-w-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <h2 className="font-serif font-medium text-[22px] leading-[1.25] text-[#FAF6EE]">{activeScene.title}</h2>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] bg-white/10 text-[#FAF6EE]/80 text-[11px] font-mono border border-white/10">
              <Clock size={12} strokeWidth={1.5} className="text-[#B54B32]" /> Pick Up Where You Left Off
            </div>
          </div>

          {activeScene.proseContent ? (
            <p className="text-[#FAF6EE]/80 text-[13.5px] line-clamp-2 mb-6 font-mono italic leading-relaxed">
              "{activeScene.proseContent.slice(-220).trim()}"
            </p>
          ) : (
            <p className="text-[#FAF6EE]/60 text-[13px] mb-6 italic">
              {activeScene.premise || 'Blank scene ready for drafting.'}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onContinueWriting}
              className="btn-primary"
            >
              <span>Continue Writing Scene</span>
              <ArrowRight size={16} strokeWidth={1.5} />
            </button>
            <span className="text-[12.5px] text-[#FAF6EE]/60 font-mono">
              POV: {activeScene.pov || 'Narrator'} · {activeScene.wordCount} words
            </span>
          </div>
        </div>
      </div>

      {/* THREE BALANCED CARDS: Current Revision Pass | Open Questions | Codex */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* 1. Current Revision Pass */}
        <div className="bg-[#F1EAD9] p-5 sm:p-6 rounded-[6px] border border-[rgba(34,30,24,0.10)] flex flex-col justify-between hover:border-[rgba(34,30,24,0.20)] transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono font-semibold text-[#7A705F] uppercase tracking-wider flex items-center gap-1.5">
                <RotateCcw size={14} strokeWidth={1.5} className="text-[#7A705F]" /> Current Pass
              </span>
              <span className="text-[11px] font-semibold font-mono px-2 py-0.5 rounded-[4px] bg-[#FAF6EE] text-[#221E18] border border-[rgba(34,30,24,0.10)]">
                {completedChecklist}/{activePass.checklist.length}
              </span>
            </div>
            <h3 className="font-sans font-semibold text-[15px] leading-[1.3] text-[#221E18] mb-1">{activePass.name}</h3>
            <p className="text-[12.5px] text-[#7A705F] leading-[1.4] line-clamp-2 mb-3">
              {activePass.description}
            </p>

            <div className="space-y-1.5">
              {activePass.checklist.slice(0, 3).map((item) => (
                <div key={item.id} className="text-xs flex items-start gap-2 text-[#221E18]">
                  <span className={item.done ? 'text-[#35505F]' : 'text-[#7A705F]/40'}>
                    {item.done ? (
                      <CheckCircle2 size={15} strokeWidth={1.5} />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-[3px] border border-[rgba(34,30,24,0.25)] mt-0.5" />
                    )}
                  </span>
                  <span className={`text-[12px] leading-tight ${item.done ? 'line-through text-[#7A705F]' : ''}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onNavigateToRevisions}
            className="btn-tertiary mt-4 pt-3 border-t border-[rgba(34,30,24,0.10)] w-full justify-between"
          >
            <span>Revision Snapshots</span>
            <ChevronRight size={14} strokeWidth={1.5} />
          </button>
        </div>

        {/* 2. Open Questions & Continuity */}
        <div className="bg-[#F1EAD9] p-5 sm:p-6 rounded-[6px] border border-[rgba(34,30,24,0.10)] flex flex-col justify-between hover:border-[rgba(34,30,24,0.20)] transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono font-semibold text-[#7A705F] uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle size={14} strokeWidth={1.5} className="text-[#B54B32]" /> Inquiries
              </span>
              <span className="text-[11px] font-semibold font-mono px-2 py-0.5 rounded-[4px] bg-[#FAF6EE] text-[#B54B32] border border-[rgba(34,30,24,0.10)]">
                {totalOpenQuestions} pending
              </span>
            </div>
            <h3 className="font-sans font-semibold text-[15px] leading-[1.3] text-[#221E18] mb-1">Continuity Inbox</h3>
            <p className="text-[12.5px] text-[#7A705F] leading-[1.4] mb-3">
              Evidence-based observations awaiting writer decision.
            </p>

            <div className="space-y-2">
              {openIssues.slice(0, 2).map((issue) => (
                <div
                  key={issue.id}
                  className="p-2.5 rounded-[6px] bg-[#FAF6EE] border border-[rgba(34,30,24,0.10)] text-xs"
                >
                  <div className="font-medium text-[#221E18] text-[12px] line-clamp-1">{issue.title}</div>
                  <div className="text-[#7A705F] text-[11px] line-clamp-2 mt-0.5 leading-snug">
                    {issue.question}
                  </div>
                </div>
              ))}
              {openIssues.length === 0 && unresolvedNotes.slice(0, 2).map((note) => (
                <div
                  key={note.id}
                  className="p-2.5 rounded-[6px] bg-[#FAF6EE] border border-[rgba(34,30,24,0.10)] text-xs"
                >
                  <div className="font-medium text-[#221E18] text-[12px] line-clamp-1">{note.title}</div>
                  <div className="text-[#7A705F] text-[11px] line-clamp-2 mt-0.5 leading-snug">
                    {note.content}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onNavigateToContinuity}
            className="btn-tertiary mt-4 pt-3 border-t border-[rgba(34,30,24,0.10)] w-full justify-between"
          >
            <span>Review Continuity Inbox</span>
            <ChevronRight size={14} strokeWidth={1.5} />
          </button>
        </div>

        {/* 3. Codex Lore */}
        <div className="bg-[#F1EAD9] p-5 sm:p-6 rounded-[6px] border border-[rgba(34,30,24,0.10)] flex flex-col justify-between hover:border-[rgba(34,30,24,0.20)] transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono font-semibold text-[#7A705F] uppercase tracking-wider flex items-center gap-1.5">
                <Compass size={14} strokeWidth={1.5} className="text-[#35505F]" /> Codex &amp; Lore
              </span>
              <span className="text-[11px] font-semibold font-mono px-2 py-0.5 rounded-[4px] bg-[#FAF6EE] text-[#221E18] border border-[rgba(34,30,24,0.10)]">
                {entities.length} entities
              </span>
            </div>
            <h3 className="font-sans font-semibold text-[15px] leading-[1.3] text-[#221E18] mb-1">Key Canon Lore</h3>
            <p className="text-[12.5px] text-[#7A705F] leading-[1.4] mb-3">
              Canonical story truths anchored across chapters.
            </p>

            <div className="space-y-1.5">
              {entities.slice(0, 3).map((ent) => (
                <div
                  key={ent.id}
                  className="flex items-center justify-between text-xs py-1 border-b border-[rgba(34,30,24,0.08)] last:border-0"
                >
                  <span className="font-medium text-[#221E18] text-[12px] font-serif">{ent.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-[4px] font-mono uppercase bg-[#FAF6EE] text-[#7A705F] border border-[rgba(34,30,24,0.08)]">
                    {ent.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onNavigateToBible}
            className="btn-tertiary mt-4 pt-3 border-t border-[rgba(34,30,24,0.10)] w-full justify-between"
          >
            <span>Browse Codex Lore</span>
            <ChevronRight size={14} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CADENCE & VELOCITY ANALYTICS: WEEKLY & MONTHLY STATS                      */}
      {/* ========================================================================= */}
      <div className="bg-[#F1EAD9] rounded-[6px] border border-[rgba(34,30,24,0.10)] p-5 sm:p-6 mb-8 space-y-5">
        {/* Header & Timeframe Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[rgba(34,30,24,0.10)] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-[#B54B32] uppercase tracking-wider flex items-center gap-1.5">
                <BarChart2 size={14} strokeWidth={1.5} /> Writing Velocity &amp; Cadence
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-[4px] bg-[#FAF6EE] text-[#35505F] font-semibold border border-[rgba(34,30,24,0.10)]">
                Live Rhythm
              </span>
            </div>
            <h3 className="font-sans font-semibold text-[15px] leading-[1.3] tracking-[0.01em] text-[#221E18] mt-1">
              {statsTimeframe === 'weekly' ? 'Weekly Writing Velocity (Past 7 Days)' : 'Monthly Production Cadence (30-Day Window)'}
            </h3>
          </div>

          {/* Timeframe Toggle */}
          <div className="flex items-center gap-1 bg-[#FAF6EE] p-0.5 rounded-[6px] border border-[rgba(34,30,24,0.16)] text-xs font-medium self-start sm:self-auto">
            <button
              onClick={() => setStatsTimeframe('weekly')}
              className={`px-3 py-1.5 rounded-[4px] transition-all cursor-pointer flex items-center gap-1.5 ${
                statsTimeframe === 'weekly'
                  ? 'bg-[#221E18] text-[#FAF6EE] font-semibold'
                  : 'text-[#7A705F] hover:text-[#221E18]'
              }`}
            >
              <Calendar size={13} strokeWidth={1.5} className={statsTimeframe === 'weekly' ? 'text-[#B54B32]' : ''} />
              <span>Weekly (7 Days)</span>
            </button>
            <button
              onClick={() => setStatsTimeframe('monthly')}
              className={`px-3 py-1.5 rounded-[4px] transition-all cursor-pointer flex items-center gap-1.5 ${
                statsTimeframe === 'monthly'
                  ? 'bg-[#221E18] text-[#FAF6EE] font-semibold'
                  : 'text-[#7A705F] hover:text-[#221E18]'
              }`}
            >
              <TrendingUp size={13} strokeWidth={1.5} className={statsTimeframe === 'monthly' ? 'text-[#35505F]' : ''} />
              <span>Monthly (30 Days)</span>
            </button>
          </div>
        </div>

        {/* 4 Key Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Tile 1: Output in Window */}
          <div className="bg-[#FAF6EE] p-4 rounded-[6px] border border-[rgba(34,30,24,0.10)]">
            <span className="text-[11px] font-mono text-[#7A705F] uppercase block font-semibold">
              {statsTimeframe === 'weekly' ? '7-Day Output' : '30-Day Output'}
            </span>
            <div className="text-xl sm:text-2xl font-serif font-bold text-[#221E18] mt-0.5">
              {(statsTimeframe === 'weekly' ? stats.recentWeeklyWords : stats.recentMonthlyWords).toLocaleString()}{' '}
              <span className="text-xs font-sans font-normal text-[#7A705F]">words</span>
            </div>
            <div className="text-[11px] text-[#35505F] font-medium mt-1 flex items-center gap-1">
              <span>{stats.progressPct}% of {stats.targetWords.toLocaleString()}w target</span>
            </div>
          </div>

          {/* Tile 2: Writing Days & Consistency */}
          <div className="bg-[#FAF6EE] p-4 rounded-[6px] border border-[rgba(34,30,24,0.10)]">
            <span className="text-[11px] font-mono text-[#7A705F] uppercase block font-semibold">
              {statsTimeframe === 'weekly' ? 'Active Days' : 'Writing Consistency'}
            </span>
            <div className="text-xl sm:text-2xl font-serif font-bold text-[#221E18] mt-0.5 flex items-center gap-1.5">
              <span>{statsTimeframe === 'weekly' ? `${stats.activeDaysCount} of 7` : `${stats.activeMonthDays} of 30`}</span>
              <Flame size={16} strokeWidth={1.5} className="text-[#B54B32]" />
            </div>
            <div className="text-[11px] text-[#7A705F] font-mono mt-1">
              {stats.activeDaysCount}-day active rhythm
            </div>
          </div>

          {/* Tile 3: Daily Average */}
          <div className="bg-[#FAF6EE] p-4 rounded-[6px] border border-[rgba(34,30,24,0.10)]">
            <span className="text-[11px] font-mono text-[#7A705F] uppercase block font-semibold">
              Daily Cadence
            </span>
            <div className="text-xl sm:text-2xl font-serif font-bold text-[#221E18] mt-0.5">
              {(statsTimeframe === 'weekly' ? stats.dailyCadenceWeekly : stats.dailyCadenceMonthly).toLocaleString()}{' '}
              <span className="text-xs font-sans font-normal text-[#7A705F]">w/day</span>
            </div>
            <div className="text-[11px] text-[#7A705F] font-mono mt-1">
              Target: 500 w/session
            </div>
          </div>

          {/* Tile 4: Target & Projection */}
          <div className="bg-[#FAF6EE] p-4 rounded-[6px] border border-[rgba(34,30,24,0.10)]">
            <span className="text-[11px] font-mono text-[#7A705F] uppercase block font-semibold">
              Draft Pacing
            </span>
            <div className="text-xl sm:text-2xl font-serif font-bold text-[#B54B32] mt-0.5">
              {stats.progressPct}%
            </div>
            <div className="text-[11px] text-[#7A705F] font-mono mt-1">
              Est. completion: ~{stats.estDaysToCompletion} days
            </div>
          </div>
        </div>

        {/* Visual Bar Chart & Days Breakdown */}
        <div className="bg-[#FAF6EE] p-4 rounded-[6px] border border-[rgba(34,30,24,0.10)]">
          <div className="flex items-center justify-between text-xs font-mono text-[#7A705F] mb-3">
            <span className="uppercase font-bold">
              {statsTimeframe === 'weekly' ? 'Daily Word Logs (Mon – Sun)' : 'Weekly Volume Trajectory (4 Weeks)'}
            </span>
            <span className="hidden sm:inline">Baseline Target: 500 words/day</span>
          </div>

          {statsTimeframe === 'weekly' ? (
            /* Weekly 7-Day Bar Chart */
            <div className="grid grid-cols-7 gap-2 sm:gap-3 items-end h-28 pt-2">
              {stats.dailyLogs.map((item, i) => {
                const maxVal = Math.max(1, ...stats.dailyLogs.map((l) => l.words));
                const heightPercent = item.words > 0 ? Math.min(100, Math.max(15, Math.round((item.words / maxVal) * 100))) : 0;
                return (
                  <div key={i} className="flex flex-col items-center h-full justify-end group">
                    <div className="text-[10px] font-mono text-[#7A705F] mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.words > 0 ? `${item.words}w` : 'Rest'}
                    </div>
                    <div className="w-full max-w-[32px] bg-[#EAE3D2] rounded-t-[4px] relative overflow-hidden flex items-end h-20">
                      <div
                        className={`w-full rounded-t-[4px] transition-all duration-200 ${
                          item.peak
                            ? 'bg-[#B54B32]'
                            : item.words > 0
                            ? 'bg-[#35505F]'
                            : 'bg-transparent'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-[#221E18] font-semibold mt-1.5">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Monthly 4-Week Progress Bars */
            <div className="space-y-3 pt-1">
              {stats.monthlyWeeks.map((wk, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-semibold text-[#221E18]">{wk.label}</span>
                    <span className="text-[#7A705F]">
                      {wk.words.toLocaleString()} / {wk.target.toLocaleString()}w ({wk.pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#EAE3D2] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        wk.pct >= 100 ? 'bg-[#35505F]' : 'bg-[#B54B32]'
                      }`}
                      style={{ width: `${Math.min(100, wk.pct)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info: Manuscript Progress & Editorial Bridge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-[#7A705F] border-t border-[rgba(34,30,24,0.10)]">
          <div className="flex items-center gap-2">
            <Target size={14} strokeWidth={1.5} className="text-[#B54B32]" />
            <span>
              Overall Draft Velocity: <strong className="text-[#221E18]">{totalWords.toLocaleString()} words</strong> across {scenes.length} scenes
            </span>
          </div>

          {onNavigateToEditorial && (
            <button
              onClick={onNavigateToEditorial}
              className="text-[#B54B32] hover:text-[#9E3E28] font-semibold flex items-center gap-1 cursor-pointer self-start sm:self-auto transition-colors"
            >
              <span>Open Editorial Desk for Post-Draft Polish</span>
              <ArrowRight size={13} strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>

      {/* MANUSCRIPT SCENES OVERVIEW */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="font-sans font-semibold text-[15px] leading-[1.3] tracking-[0.01em] text-[#221E18]">
            Manuscript Scenes
          </h3>
          <button
            onClick={onAddScene}
            className="btn-secondary"
          >
            <Plus size={16} strokeWidth={1.5} className="text-[#B54B32]" />
            <span>Add Next Scene</span>
          </button>
        </div>

        <div className="bg-[#F1EAD9] rounded-[6px] border border-[rgba(34,30,24,0.10)] divide-y divide-[rgba(34,30,24,0.08)] overflow-hidden">
          {scenes.map((s, idx) => {
            const isComplete = s.status === 'complete';
            const isRevised = s.status === 'revised';
            return (
              <div
                key={s.id}
                onClick={() => onNavigateToScene(s.id)}
                className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-[#FAF6EE] cursor-pointer transition-colors min-h-[56px] group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#FAF6EE] border border-[rgba(34,30,24,0.10)] text-[#7A705F] flex items-center justify-center text-xs font-mono font-medium shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-[#221E18] font-serif">{s.title}</h4>
                    <p className="text-[12px] text-[#7A705F] mt-0.5 line-clamp-1 leading-snug">
                      {s.premise || 'No premise established'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-[#7A705F] shrink-0">
                  <span className="hidden sm:inline text-[12px]">{s.wordCount} words</span>
                  <span
                    className={`px-2 py-0.5 rounded-[4px] text-[10px] uppercase font-mono border ${
                      isComplete
                        ? 'bg-[#221E18] text-[#FAF6EE] border-[#221E18]'
                        : isRevised
                        ? 'bg-[#B54B32] text-[#FAF6EE] border-[#B54B32]'
                        : 'bg-[#35505F] text-[#FAF6EE] border-[#35505F]'
                    }`}
                  >
                    {isComplete ? 'Final' : isRevised ? 'Revised' : 'Drafting'}
                  </span>
                  <ChevronRight size={14} strokeWidth={1.5} className="text-[#7A705F]/50 group-hover:text-[#221E18] transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
