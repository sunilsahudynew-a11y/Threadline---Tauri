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
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* HEADER: Calm project orientation */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-sans font-semibold tracking-[0.16em] uppercase text-[#7A705F]">
              Threadline Studio
            </span>
            <span className="text-[#E5DEC9]">·</span>
            <span className="text-xs text-[#7A705F] font-mono">Local-first &amp; Private</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-[#221E18] mt-1 font-semibold tracking-tight">
            {project.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="text-[#7A705F] text-xs">
              {project.type} · {chapters && chapters.length > 0 ? `${chapters.length} ${chapters.length === 1 ? 'chapter' : 'chapters'} · ` : ''}{scenes.length} {scenes.length === 1 ? 'scene' : 'scenes'} ·{' '}
              <span className="font-mono">{totalWords.toLocaleString()}</span> words
            </span>
            {project.framework && (
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#F1EAD9] text-[#7A705F] border border-[#E5DEC9]">
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

        <div className="flex items-center gap-2">
          {onNavigateToProjects && (
            <button
              onClick={onNavigateToProjects}
              className="px-3 py-2 text-xs font-medium text-[#221E18] bg-[#F1EAD9] hover:bg-[#EAE4D6] rounded-lg transition-colors border border-[#E5DEC9] shadow-warm-sm flex items-center gap-1.5 cursor-pointer"
              title="View and manage all manuscripts"
            >
              <FolderKanban size={13} className="text-[#7A705F]" /> Manuscripts
            </button>
          )}
          <button
            onClick={onStartNewProject}
            className="px-3.5 py-2 text-xs font-medium text-[#221E18] bg-[#FAF6EE] hover:bg-[#F1EAD9] rounded-lg transition-colors border border-[#E5DEC9] shadow-warm-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={13} className="text-[#B54B32]" /> New Manuscript
          </button>
        </div>
      </div>

      {/* PRIMARY RESUME HERO: Pick up exactly where you left off */}
      <div className="bg-[#221E18] text-[#FAF6EE] p-7 md:p-8 rounded-2xl shadow-warm-modal border border-[#221E18] mb-8 relative overflow-hidden">
        <div className="absolute right-4 top-4 opacity-15 pointer-events-none">
          <ThreadlineMark size={160} color="#FAF6EE" knotColor="#B54B32" />
        </div>

        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-[#F1EAD9] text-xs font-medium mb-3 border border-white/10 font-mono">
            <Clock size={12} className="text-[#B54B32]" /> Pick Up Where You Left Off
          </div>

          <h2 className="text-2xl font-serif text-[#FAF6EE] font-medium mb-2">{activeScene.title}</h2>

          {activeScene.proseContent ? (
            <p className="text-[#FAF6EE]/80 text-xs md:text-sm line-clamp-2 mb-6 font-serif italic leading-relaxed">
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
              className="inline-flex items-center gap-2 bg-[#B54B32] hover:bg-[#9E3E27] text-[#FAF6EE] px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-98 cursor-pointer"
            >
              <span>Continue Writing Scene</span>
              <ArrowRight size={15} />
            </button>
            <span className="text-xs text-[#FAF6EE]/60 font-mono">
              POV: {activeScene.pov || 'Silas'} · {activeScene.wordCount} words
            </span>
          </div>
        </div>
      </div>

      {/* THREE BALANCED CARDS: Current Revision Pass | Open Questions | Story Bible */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {/* 1. Current Revision Pass */}
        <div className="bg-[#FAF6EE] p-5 rounded-xl border border-[#E5DEC9] shadow-warm-sm flex flex-col justify-between hover:border-[#7A705F]/40 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-sans font-semibold text-[#7A705F] uppercase tracking-[0.16em] flex items-center gap-1.5">
                <RotateCcw size={12} className="text-[#7A705F]" /> Current Pass
              </span>
              <span className="text-[10px] font-semibold font-mono px-2 py-0.5 rounded bg-[#F1EAD9] text-[#221E18]">
                {completedChecklist}/{activePass.checklist.length}
              </span>
            </div>
            <h3 className="font-serif font-semibold text-[#221E18] text-sm mb-1">{activePass.name}</h3>
            <p className="text-[11px] text-[#7A705F] line-clamp-2 mb-3.5 leading-normal">
              {activePass.description}
            </p>

            <div className="space-y-2">
              {activePass.checklist.slice(0, 3).map((item) => (
                <div key={item.id} className="text-xs flex items-start gap-2 text-[#221E18]">
                  <span className={item.done ? 'text-[#3C6E47]' : 'text-[#7A705F]/40'}>
                    {item.done ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-[#7A705F]/40 mt-0.5" />
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
            className="mt-4 pt-3 border-t border-[#E5DEC9] text-xs font-medium text-[#221E18] hover:text-[#B54B32] flex items-center justify-between transition-colors cursor-pointer"
          >
            <span>Revision Snapshots</span>
            <ChevronRight size={13} />
          </button>
        </div>

        {/* 2. Open Questions & Continuity */}
        <div className="bg-[#FAF6EE] p-5 rounded-xl border border-[#E5DEC9] shadow-warm-sm flex flex-col justify-between hover:border-[#7A705F]/40 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-sans font-semibold text-[#7A705F] uppercase tracking-[0.16em] flex items-center gap-1.5">
                <AlertCircle size={12} className="text-[#C88A2E]" /> Open Questions
              </span>
              <span className="text-[10px] font-semibold font-mono px-2 py-0.5 rounded bg-[#F6EEDA] text-[#C88A2E]">
                {totalOpenQuestions} pending
              </span>
            </div>
            <h3 className="font-serif font-semibold text-[#221E18] text-sm mb-1">Continuity &amp; Inquiries</h3>
            <p className="text-[11px] text-[#7A705F] mb-3 leading-normal">
              Evidence-based observations awaiting writer decision.
            </p>

            <div className="space-y-2">
              {openIssues.slice(0, 2).map((issue) => (
                <div
                  key={issue.id}
                  className="p-2.5 rounded-lg bg-[#F1EAD9] border border-[#E5DEC9] text-xs"
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
                  className="p-2.5 rounded-lg bg-[#F1EAD9] border border-[#E5DEC9] text-xs"
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
            className="mt-4 pt-3 border-t border-[#E5DEC9] text-xs font-medium text-[#221E18] hover:text-[#B54B32] flex items-center justify-between transition-colors cursor-pointer"
          >
            <span>Review Continuity Inbox</span>
            <ChevronRight size={13} />
          </button>
        </div>

        {/* 3. Story Bible Snapshot */}
        <div className="bg-[#FAF6EE] p-5 rounded-xl border border-[#E5DEC9] shadow-warm-sm flex flex-col justify-between hover:border-[#7A705F]/40 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-sans font-semibold text-[#7A705F] uppercase tracking-[0.16em] flex items-center gap-1.5">
                <Compass size={12} className="text-[#35505F]" /> Lore Codex
              </span>
              <span className="text-[10px] font-semibold font-mono px-2 py-0.5 rounded bg-[#F1EAD9] text-[#221E18]">
                {entities.length} entities
              </span>
            </div>
            <h3 className="font-serif font-semibold text-[#221E18] text-sm mb-1">Key Canon Facts</h3>
            <p className="text-[11px] text-[#7A705F] mb-3 leading-normal">
              Hard story truths anchored across chapters.
            </p>

            <div className="space-y-1.5">
              {entities.slice(0, 3).map((ent) => (
                <div
                  key={ent.id}
                  className="flex items-center justify-between text-xs py-1 border-b border-[#E5DEC9] last:border-0"
                >
                  <span className="font-medium text-[#221E18] text-[11px] font-serif">{ent.name}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase ${
                      ent.status === 'confirmed'
                        ? 'bg-[#E5EFE7] text-[#3C6E47] border border-[#3C6E47]/20'
                        : 'bg-[#F6EEDA] text-[#C88A2E] border border-[#C88A2E]/20'
                    }`}
                  >
                    {ent.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onNavigateToBible}
            className="mt-4 pt-3 border-t border-[#E5DEC9] text-xs font-medium text-[#221E18] hover:text-[#B54B32] flex items-center justify-between transition-colors cursor-pointer"
          >
            <span>Browse Lore Codex</span>
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
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#221E18] hover:bg-[#EAE4D6] bg-[#F1EAD9] px-3 py-1.5 rounded-lg border border-[#E5DEC9] transition-colors cursor-pointer"
          >
            <Plus size={13} className="text-[#B54B32]" /> Add Next Scene
          </button>
        </div>

        <div className="bg-[#FAF6EE] rounded-xl border border-[#E5DEC9] divide-y divide-[#E5DEC9] overflow-hidden shadow-warm-sm">
          {scenes.map((s, idx) => {
            const statusConfig = {
              idea: { bg: 'bg-[#ECE8E1]', text: 'text-[#857C90]', label: 'Idea' },
              drafting: { bg: 'bg-[#F6EEDA]', text: 'text-[#C88A2E]', label: 'Drafting' },
              revised: { bg: 'bg-[#E5ECF0]', text: 'text-[#35505F]', label: 'Revised' },
              complete: { bg: 'bg-[#E5EFE7]', text: 'text-[#3C6E47]', label: 'Final' }
            }[s.status || 'drafting'] || { bg: 'bg-[#F1EAD9]', text: 'text-[#7A705F]', label: s.status };

            return (
              <div
                key={s.id}
                onClick={() => onNavigateToScene(s.id)}
                className="p-4 flex items-center justify-between hover:bg-[#F1EAD9]/60 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <span className="w-6 h-6 rounded-full bg-[#F1EAD9] border border-[#E5DEC9] text-[#7A705F] flex items-center justify-center text-xs font-mono font-medium">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs md:text-sm font-medium text-[#221E18] font-serif">{s.title}</h4>
                    <p className="text-[11px] text-[#7A705F] mt-0.5 line-clamp-1 leading-snug">
                      {s.premise || 'No premise established'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-[#7A705F]">
                  <span className="hidden sm:inline">{s.wordCount} words</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono ${statusConfig.bg} ${statusConfig.text}`}
                  >
                    {statusConfig.label}
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
