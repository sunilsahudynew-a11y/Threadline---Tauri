import React, { useState, useMemo } from 'react';
import {
  Project,
  Scene,
  Entity,
  ContinuityIssue,
  PersonaProjectType
} from '../../types';
import {
  BookOpen,
  MessageSquare,
  Sparkles,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  X,
  Compass,
  FileText,
  Plus,
  ArrowRight
} from 'lucide-react';
import { CommentThread, ThreadComment } from '../editor/CommentThread';

interface EditorReviewScreenProps {
  project: Project;
  projectType: PersonaProjectType;
  scenes: Scene[];
  entities: Entity[];
  issues: ContinuityIssue[];
  activeSceneId: string;
  onSelectScene: (sceneId: string) => void;
  onUpdateScene?: (sceneId: string, updated: Partial<Scene>) => void;
}

export const EditorReviewScreen: React.FC<EditorReviewScreenProps> = ({
  project,
  projectType,
  scenes,
  entities,
  issues,
  activeSceneId,
  onSelectScene,
  onUpdateScene
}) => {
  const isScreenplay = projectType === 'screenplay';
  const activeScene = scenes.find((s) => s.id === activeSceneId) || scenes[0];

  // Overlay state: toggle insights highlights
  const [showInsightsOverlay, setShowInsightsOverlay] = useState(true);

  // Look up flyout state
  const [showLookupFlyout, setShowLookupFlyout] = useState(false);
  const [lookupQuery, setLookupQuery] = useState('');

  // Active margin comments
  const [comments, setComments] = useState<ThreadComment[]>([
    {
      id: 'c-1',
      author: 'Eleanor Vance (Senior Editor)',
      createdAt: 'Today, 2:15 PM',
      severity: 'suggestion',
      resolved: false,
      selectedText: 'The mist rose slowly from the canal.',
      content: 'Consider heightening sensory immediacy here — what does the water smell of? Sea-salt encrustation or furnace runoff?',
      replies: [
        {
          id: 'r-1',
          author: 'Author',
          content: 'Good note. Will anchor it to sulfur and brine.',
          createdAt: 'Today, 2:40 PM'
        }
      ]
    },
    {
      id: 'c-2',
      author: 'Developmental Editor',
      createdAt: 'Yesterday',
      severity: 'note',
      resolved: true,
      selectedText: 'Silas paused before opening the velvet pouch.',
      content: 'Pacing check: Beat flows well with the escalating tension in the room.'
    }
  ]);

  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [selectedTextForComment, setSelectedTextForComment] = useState('');

  // Filtered Lore search for the "Look up" flyout
  const filteredEntities = useMemo(() => {
    if (!lookupQuery.trim()) return entities.slice(0, 10);
    const q = lookupQuery.toLowerCase();
    return entities.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        (e.description && e.description.toLowerCase().includes(q)) ||
        e.type.toLowerCase().includes(q)
    );
  }, [entities, lookupQuery]);

  const handleResolveComment = (id: string, resolved: boolean) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, resolved } : c))
    );
  };

  const handleAddReply = (id: string, replyContent: string, author: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const newReply = {
          id: `r-${Date.now()}`,
          author,
          content: replyContent,
          createdAt: 'Just now'
        };
        return { ...c, replies: [...(c.replies || []), newReply] };
      })
    );
  };

  const handleDeleteComment = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  const handleCreateComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newC: ThreadComment = {
      id: `c-${Date.now()}`,
      author: 'Reviewer',
      createdAt: 'Just now',
      severity: 'suggestion',
      resolved: false,
      selectedText: selectedTextForComment || undefined,
      content: newCommentText.trim()
    };

    setComments((prev) => [newC, ...prev]);
    setNewCommentText('');
    setSelectedTextForComment('');
    setIsAddingComment(false);
  };

  // Text selection handler
  const handleMouseUpText = () => {
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed) {
      const text = sel.toString().trim();
      if (text.length > 2) {
        setSelectedTextForComment(text);
        setIsAddingComment(true);
      }
    }
  };

  // Extract lines/paragraphs
  const paragraphs = useMemo(() => {
    return (activeScene?.proseContent || '').split('\n\n').filter(Boolean);
  }, [activeScene?.proseContent]);

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden bg-[#FAF6EE] text-[#221E18]">
      {/* TOP REVIEW BAR */}
      <div className="px-5 py-2.5 border-b border-[rgba(34,30,24,0.1)] bg-[#FAF6EE] flex items-center justify-between gap-3 shrink-0 select-none">
        {/* Left: Scene Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[#7A705F]">
            <BookOpen size={14} className="text-[#B54B32]" />
            <span className="font-semibold text-[#221E18]">Editorial Review:</span>
          </div>

          <select
            value={activeScene?.id}
            onChange={(e) => onSelectScene(e.target.value)}
            className="px-2.5 py-1 text-xs rounded bg-[#F1EAD9] border border-[rgba(34,30,24,0.12)] text-[#221E18] font-medium focus:outline-none focus:border-[#B54B32] cursor-pointer max-w-[220px] truncate"
          >
            {scenes.map((s, idx) => (
              <option key={s.id} value={s.id}>
                {idx + 1}. {s.title} ({s.wordCount} words)
              </option>
            ))}
          </select>
        </div>

        {/* Center/Right: Actions (Insights Overlay toggle & Look up flyout) */}
        <div className="flex items-center gap-2.5">
          {/* Insights Flag Overlay Toggle */}
          <button
            onClick={() => setShowInsightsOverlay(!showInsightsOverlay)}
            className={`px-2.5 py-1 rounded-[5px] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
              showInsightsOverlay
                ? 'bg-[#B54B32]/10 border-[#B54B32]/30 text-[#B54B32]'
                : 'bg-[#F1EAD9] border-[rgba(34,30,24,0.1)] text-[#7A705F] hover:text-[#221E18]'
            }`}
            title="Toggle inline continuity & pacing highlights directly on manuscript"
          >
            <Sparkles size={12} />
            <span>{showInsightsOverlay ? 'Insights Overlays Active' : 'Show Insights Overlays'}</span>
          </button>

          {/* Lightweight Look up Flyout Trigger */}
          <button
            onClick={() => setShowLookupFlyout(!showLookupFlyout)}
            className={`px-2.5 py-1 rounded-[5px] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
              showLookupFlyout
                ? 'bg-[#221E18] text-[#FAF6EE] border-[#221E18]'
                : 'bg-[#F1EAD9] border-[rgba(34,30,24,0.1)] text-[#7A705F] hover:text-[#221E18]'
            }`}
            title="Look up characters, locations, and lore without leaving review"
          >
            <Compass size={12} />
            <span>Look up Canon Lore</span>
          </button>
        </div>
      </div>

      {/* MAIN READING & REVIEW CANVAS */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Center: Read-Only / Suggestion Text Canvas */}
        <div
          className="flex-1 overflow-y-auto p-6 sm:p-12 lg:p-16 flex justify-center selection:bg-[#B54B32]/20"
          onMouseUp={handleMouseUpText}
        >
          <div className="w-full max-w-2xl">
            {/* Header info */}
            <div className="mb-8 pb-4 border-b border-[rgba(34,30,24,0.1)]">
              <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#221E18]">
                {activeScene?.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#7A705F] mt-2">
                <span className="font-medium text-[#221E18]">
                  {isScreenplay ? 'Screenplay Sequence' : 'Manuscript Chapter Beat'}
                </span>
                <span>·</span>
                <span>{activeScene?.wordCount || 0} words</span>
                <span>·</span>
                <span>POV: {activeScene?.pov || 'Third Limited'}</span>
                <span>·</span>
                <span>Setting: {activeScene?.location || 'Unspecified'}</span>
              </div>
            </div>

            {/* Prose / Script Body with Annotations */}
            <div className={`space-y-4 ${
              isScreenplay
                ? 'font-mono text-sm leading-relaxed max-w-xl mx-auto'
                : 'font-serif text-base sm:text-lg leading-relaxed text-[#221E18]'
            }`}>
              {paragraphs.map((para, pIdx) => {
                const isHeading = isScreenplay && (para.startsWith('INT.') || para.startsWith('EXT.'));

                return (
                  <p
                    key={pIdx}
                    className={`relative ${
                      isHeading ? 'font-bold uppercase tracking-wider text-black pt-4' : ''
                    } ${
                      showInsightsOverlay && para.toLowerCase().includes('suddenly')
                        ? 'bg-amber-100/40 rounded px-1'
                        : ''
                    }`}
                  >
                    {para}
                    {showInsightsOverlay && para.toLowerCase().includes('suddenly') && (
                      <span className="inline-flex items-center gap-0.5 ml-1 text-[10px] font-sans font-bold text-amber-700 bg-amber-100 px-1 py-0.2 rounded align-middle">
                        <AlertTriangle size={9} /> filter word
                      </span>
                    )}
                  </p>
                );
              })}
            </div>

            <div className="mt-12 pt-6 border-t border-[rgba(34,30,24,0.1)] text-xs text-stone-400 italic text-center">
              Highlight text anywhere to leave an editorial note or margin comment thread.
            </div>
          </div>
        </div>

        {/* Right Sidebar: Margin Comments Stream */}
        <div className="w-80 sm:w-96 border-l border-[rgba(34,30,24,0.1)] bg-[#FAF6EE] flex flex-col shrink-0 overflow-hidden">
          <div className="p-3.5 border-b border-[rgba(34,30,24,0.1)] bg-[#FAF6EE] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <MessageSquare size={14} className="text-[#B54B32]" />
              <span className="font-semibold text-xs text-[#221E18]">
                Editorial Threads ({comments.filter((c) => !c.resolved).length} open)
              </span>
            </div>

            <button
              onClick={() => setIsAddingComment(true)}
              className="p-1 rounded hover:bg-[#EAE1CE] text-[#221E18] transition-colors cursor-pointer"
              title="Add editorial comment"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* New Comment Creator Box */}
          {isAddingComment && (
            <div className="p-3 bg-[#F1EAD9] border-b border-[rgba(34,30,24,0.1)] animate-in fade-in duration-150 text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-[#221E18]">New Margin Note</span>
                <button
                  onClick={() => setIsAddingComment(false)}
                  className="text-[#7A705F] hover:text-[#221E18]"
                >
                  <X size={13} />
                </button>
              </div>

              {selectedTextForComment && (
                <p className="text-[11px] font-serif italic text-[#7A705F] line-clamp-2 border-l-2 border-[#B54B32] pl-2 mb-2">
                  &ldquo;{selectedTextForComment}&rdquo;
                </p>
              )}

              <form onSubmit={handleCreateComment}>
                <textarea
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Enter editorial feedback, query, or suggestion..."
                  className="w-full p-2 text-xs rounded bg-white border border-[#DDD5C5] text-[#221E18] focus:outline-none focus:border-[#B54B32] resize-none h-18"
                  autoFocus
                />
                <div className="flex justify-end gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingComment(false)}
                    className="px-2.5 py-1 rounded text-[#7A705F] hover:bg-[#E2D8C3] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded bg-[#B54B32] text-white font-medium hover:bg-[#9E3E27] cursor-pointer"
                  >
                    Post Note
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Comment list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {comments.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#7A705F]">
                <MessageSquare size={20} className="mx-auto mb-2 opacity-40" />
                <p>No comments on this scene yet.</p>
                <p className="text-[11px] mt-1">Select any line to start a margin review thread.</p>
              </div>
            ) : (
              comments.map((comment) => (
                <CommentThread
                  key={comment.id}
                  comment={comment}
                  isActive={activeCommentId === comment.id}
                  onSelect={() => setActiveCommentId(comment.id)}
                  onResolve={handleResolveComment}
                  onAddReply={handleAddReply}
                  onDelete={handleDeleteComment}
                />
              ))
            )}
          </div>
        </div>

        {/* LIGHTWEIGHT "LOOK UP" FLYOUT DRAWER */}
        {showLookupFlyout && (
          <div className="absolute right-96 top-0 bottom-0 w-80 bg-[#FAF6EE] border-l border-[#DDD5C5] shadow-2xl z-40 flex flex-col animate-in slide-in-from-right-4 duration-200">
            <div className="p-3.5 border-b border-[rgba(34,30,24,0.1)] bg-[#FAF6EE] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Compass size={14} className="text-[#B54B32]" />
                <span className="font-serif font-bold text-xs text-[#221E18]">
                  Canon Lore Quick Look Up
                </span>
              </div>
              <button
                onClick={() => setShowLookupFlyout(false)}
                className="text-[#7A705F] hover:text-[#221E18] p-0.5 rounded cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-[rgba(34,30,24,0.08)] bg-[#F1EAD9]/40">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-2.5 text-[#7A705F]" />
                <input
                  type="text"
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  placeholder="Look up character, location, faction..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded bg-white border border-[#DDD5C5] text-[#221E18] focus:outline-none focus:border-[#B54B32]"
                  autoFocus
                />
              </div>
            </div>

            {/* Entity Results */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {filteredEntities.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#7A705F]">
                  No matching lore entries found.
                </div>
              ) : (
                filteredEntities.map((ent) => (
                  <div
                    key={ent.id}
                    className="p-2.5 rounded bg-white border border-[#E8E0D0] text-xs shadow-2xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-serif font-bold text-[#221E18]">
                        {ent.name}
                      </span>
                      <span className="text-[9px] font-mono px-1 rounded bg-[#F1EAD9] text-[#7A705F] uppercase">
                        {ent.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5C5242] leading-snug">
                      {ent.description || 'No description entered.'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
