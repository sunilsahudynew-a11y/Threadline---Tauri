import React from 'react';
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
  FolderKanban
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
  onNavigateToProjects
}) => {
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* HEADER: Calm project orientation */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-semibold tracking-[0.14em] uppercase text-[#7A705F]">
              Threadline Studio
            </span>
            <span className="text-[#7A705F]/40">·</span>
            <span className="text-xs text-[#7A705F] font-mono">Local-first &amp; Private</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#221E18] mt-1 font-semibold tracking-tight">
            {project.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="text-[#7A705F] text-xs">
              {project.type} · {chapters && chapters.length > 0 ? `${chapters.length} ${chapters.length === 1 ? 'chapter' : 'chapters'} · ` : ''}{scenes.length} {scenes.length === 1 ? 'scene' : 'scenes'} ·{' '}
              <span className="font-mono">{totalWords.toLocaleString()}</span> words
            </span>
            {project.framework && (
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#F1EAD9] text-[#7A705F] border border-[rgba(34,30,24,0.12)]">
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
              className="px-3 py-2 text-xs font-medium text-[#221E18] bg-[#F1EAD9] hover:bg-[#EAE4D6] rounded-[6px] transition-colors border border-[rgba(34,30,24,0.12)] shadow-warm-sm flex items-center gap-1.5 cursor-pointer min-h-[40px]"
              title="View and manage all manuscripts"
            >
              <FolderKanban size={14} className="text-[#7A705F]" /> Manuscripts
            </button>
          )}
          <button
            onClick={onStartNewProject}
            className="px-3.5 py-2 text-xs font-medium text-[#221E18] bg-[#FAF6EE] hover:bg-[#F1EAD9] rounded-[6px] transition-colors border border-[rgba(34,30,24,0.12)] shadow-warm-sm flex items-center gap-1.5 cursor-pointer min-h-[40px]"
          >
            <Plus size={14} className="text-[#B54B32]" /> New Manuscript
          </button>
        </div>
      </div>

      {/* PRIMARY RESUME HERO: Pick up exactly where you left off */}
      <div className="bg-[#221E18] text-[#FAF6EE] p-6 sm:p-8 rounded-[8px] shadow-warm-modal border border-[#221E18] mb-8 relative overflow-hidden">
        <div className="absolute right-4 top-4 opacity-10 pointer-events-none">
          <ThreadlineMark size={160} color="#FAF6EE" knotColor="#B54B32" />
        </div>

        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-[#FAF6EE] text-xs font-medium mb-3 border border-white/10 font-mono">
            <Clock size={12} className="text-[#B54B32]" /> Pick Up Where You Left Off
          </div>

          <h2 className="text-2xl font-serif text-[#FAF6EE] font-medium mb-2">{activeScene.title}</h2>

          {activeScene.proseContent ? (
            <p className="text-[#FAF6EE]/80 text-xs sm:text-sm line-clamp-2 mb-6 font-mono italic leading-relaxed">
              "{activeScene.proseContent.slice(-220).trim()}"
            </p>
          ) : (
            <p className="text-[#FAF6EE]/60 text-xs mb-6 italic">
              {activeScene.premise || 'Blank scene ready for drafting.'}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onContinueWriting}
              className="inline-flex items-center gap-2 bg-[#B54B32] hover:bg-[#9E3E27] text-[#FAF6EE] px-5 py-2.5 rounded-[6px] text-xs font-bold transition-all shadow-warm-sm active:scale-98 cursor-pointer min-h-[44px]"
            >
              <span>Continue Writing Scene</span>
              <ArrowRight size={15} />
            </button>
            <span className="text-xs text-[#FAF6EE]/60 font-mono">
              POV: {activeScene.pov || 'Narrator'} · {activeScene.wordCount} words
            </span>
          </div>
        </div>
      </div>

      {/* THREE BALANCED CARDS: Current Revision Pass | Open Questions | Codex */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* 1. Current Revision Pass */}
        <div className="bg-[#F1EAD9] p-5 rounded-[8px] border border-[rgba(34,30,24,0.12)] shadow-warm-sm flex flex-col justify-between hover:border-[#7A705F]/40 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-semibold text-[#7A705F] uppercase tracking-wider flex items-center gap-1.5">
                <RotateCcw size={12} className="text-[#7A705F]" /> Current Pass
              </span>
              <span className="text-[10px] font-semibold font-mono px-2 py-0.5 rounded-[4px] bg-[#FAF6EE] text-[#221E18]">
                {completedChecklist}/{activePass.checklist.length}
              </span>
            </div>
            <h3 className="font-serif font-semibold text-[#221E18] text-sm mb-1">{activePass.name}</h3>
            <p className="text-[11px] text-[#7A705F] line-clamp-2 mb-3 leading-normal">
              {activePass.description}
            </p>

            <div className="space-y-1.5">
              {activePass.checklist.slice(0, 3).map((item) => (
                <div key={item.id} className="text-xs flex items-start gap-2 text-[#221E18]">
                  <span className={item.done ? 'text-[#35505F]' : 'text-[#7A705F]/40'}>
                    {item.done ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-[3px] border border-[#7A705F]/40 mt-0.5" />
                    )}
                  </span>
                  <span className={`text-[11px] leading-tight ${item.done ? 'line-through text-[#7A705F]' : ''}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onNavigateToRevisions}
            className="mt-4 pt-3 border-t border-[rgba(34,30,24,0.12)] text-xs font-medium text-[#221E18] hover:text-[#B54B32] flex items-center justify-between transition-colors cursor-pointer min-h-[36px]"
          >
            <span>Revision Snapshots</span>
            <ChevronRight size={13} />
          </button>
        </div>

        {/* 2. Open Questions & Continuity */}
        <div className="bg-[#F1EAD9] p-5 rounded-[8px] border border-[rgba(34,30,24,0.12)] shadow-warm-sm flex flex-col justify-between hover:border-[#7A705F]/40 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-semibold text-[#7A705F] uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle size={12} className="text-[#B54B32]" /> Inquiries
              </span>
              <span className="text-[10px] font-semibold font-mono px-2 py-0.5 rounded-[4px] bg-[#FAF6EE] text-[#B54B32]">
                {totalOpenQuestions} pending
              </span>
            </div>
            <h3 className="font-serif font-semibold text-[#221E18] text-sm mb-1">Continuity Inbox</h3>
            <p className="text-[11px] text-[#7A705F] mb-3 leading-normal">
              Evidence-based observations awaiting writer decision.
            </p>

            <div className="space-y-2">
              {openIssues.slice(0, 2).map((issue) => (
                <div
                  key={issue.id}
                  className="p-2.5 rounded-[6px] bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] text-xs"
                >
                  <div className="font-medium text-[#221E18] text-[11px] line-clamp-1">{issue.title}</div>
                  <div className="text-[#7A705F] text-[10px] line-clamp-2 mt-0.5 leading-snug">
                    {issue.question}
                  </div>
                </div>
              ))}
              {openIssues.length === 0 && unresolvedNotes.slice(0, 2).map((note) => (
                <div
                  key={note.id}
                  className="p-2.5 rounded-[6px] bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] text-xs"
                >
                  <div className="font-medium text-[#221E18] text-[11px] line-clamp-1">{note.title}</div>
                  <div className="text-[#7A705F] text-[10px] line-clamp-2 mt-0.5 leading-snug">
                    {note.content}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onNavigateToContinuity}
            className="mt-4 pt-3 border-t border-[rgba(34,30,24,0.12)] text-xs font-medium text-[#221E18] hover:text-[#B54B32] flex items-center justify-between transition-colors cursor-pointer min-h-[36px]"
          >
            <span>Review Continuity Inbox</span>
            <ChevronRight size={13} />
          </button>
        </div>

        {/* 3. Codex Lore */}
        <div className="bg-[#F1EAD9] p-5 rounded-[8px] border border-[rgba(34,30,24,0.12)] shadow-warm-sm flex flex-col justify-between hover:border-[#7A705F]/40 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-semibold text-[#7A705F] uppercase tracking-wider flex items-center gap-1.5">
                <Compass size={12} className="text-[#35505F]" /> Codex &amp; Lore
              </span>
              <span className="text-[10px] font-semibold font-mono px-2 py-0.5 rounded-[4px] bg-[#FAF6EE] text-[#221E18]">
                {entities.length} entities
              </span>
            </div>
            <h3 className="font-serif font-semibold text-[#221E18] text-sm mb-1">Key Canon Lore</h3>
            <p className="text-[11px] text-[#7A705F] mb-3 leading-normal">
              Canonical story truths anchored across chapters.
            </p>

            <div className="space-y-1.5">
              {entities.slice(0, 3).map((ent) => (
                <div
                  key={ent.id}
                  className="flex items-center justify-between text-xs py-1 border-b border-[rgba(34,30,24,0.08)] last:border-0"
                >
                  <span className="font-medium text-[#221E18] text-[11px] font-serif">{ent.name}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-[4px] font-mono uppercase bg-[#FAF6EE] text-[#7A705F] border border-[rgba(34,30,24,0.08)]">
                    {ent.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onNavigateToBible}
            className="mt-4 pt-3 border-t border-[rgba(34,30,24,0.12)] text-xs font-medium text-[#221E18] hover:text-[#B54B32] flex items-center justify-between transition-colors cursor-pointer min-h-[36px]"
          >
            <span>Browse Codex Lore</span>
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* MANUSCRIPT SCENES OVERVIEW */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-base font-serif font-semibold text-[#221E18]">Manuscript Scenes</h3>
          <button
            onClick={onAddScene}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#221E18] hover:bg-[#F1EAD9] bg-[#FAF6EE] px-3 py-1.5 rounded-[6px] border border-[rgba(34,30,24,0.12)] transition-colors cursor-pointer min-h-[36px]"
          >
            <Plus size={14} className="text-[#B54B32]" /> Add Next Scene
          </button>
        </div>

        <div className="bg-[#F1EAD9] rounded-[8px] border border-[rgba(34,30,24,0.12)] divide-y divide-[rgba(34,30,24,0.08)] overflow-hidden shadow-warm-sm">
          {scenes.map((s, idx) => {
            const isComplete = s.status === 'complete';
            const isRevised = s.status === 'revised';
            return (
              <div
                key={s.id}
                onClick={() => onNavigateToScene(s.id)}
                className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-[#FAF6EE] cursor-pointer transition-colors min-h-[56px]"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] text-[#7A705F] flex items-center justify-center text-xs font-mono font-medium shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-[#221E18] font-serif">{s.title}</h4>
                    <p className="text-[11px] text-[#7A705F] mt-0.5 line-clamp-1 leading-snug">
                      {s.premise || 'No premise established'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-[#7A705F] shrink-0">
                  <span className="hidden sm:inline">{s.wordCount} words</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-mono border ${
                      isComplete
                        ? 'bg-[#221E18] text-[#FAF6EE] border-[#221E18]'
                        : isRevised
                        ? 'bg-[#B54B32] text-[#FAF6EE] border-[#B54B32]'
                        : 'bg-[#35505F] text-[#FAF6EE] border-[#35505F]'
                    }`}
                  >
                    {isComplete ? 'Final' : isRevised ? 'Revised' : 'Drafting'}
                  </span>
                  <ChevronRight size={14} className="text-[#7A705F]/50" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
