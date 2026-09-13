import React, { useState } from 'react';
import {
  MessageSquare,
  Check,
  RotateCcw,
  CornerDownRight,
  Trash2,
  AlertCircle,
  Sparkles,
  User,
  Send
} from 'lucide-react';
import { EditorialQuery } from '../../types';

export interface ThreadComment {
  id: string;
  author: string;
  authorRole?: string;
  avatarColor?: string;
  createdAt: string;
  content: string;
  severity: 'note' | 'suggestion' | 'critical';
  resolved: boolean;
  selectedText?: string;
  lineNumber?: number;
  replies?: {
    id: string;
    author: string;
    content: string;
    createdAt: string;
  }[];
}

interface CommentThreadProps {
  comment: ThreadComment;
  isActive?: boolean;
  onSelect?: () => void;
  onResolve: (id: string, resolved: boolean) => void;
  onAddReply: (id: string, replyText: string, author: string) => void;
  onDelete: (id: string) => void;
}

export const CommentThread: React.FC<CommentThreadProps> = ({
  comment,
  isActive = false,
  onSelect,
  onResolve,
  onAddReply,
  onDelete
}) => {
  const [replyText, setReplyText] = useState('');
  const [showReplyInput, setShowReplyInput] = useState(false);

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onAddReply(comment.id, replyText.trim(), 'Reviewer');
    setReplyText('');
    setShowReplyInput(false);
  };

  const severityBadge = {
    note: { label: 'Note', bg: 'bg-stone-200 text-stone-700' },
    suggestion: { label: 'Suggestion', bg: 'bg-amber-100 text-amber-800' },
    critical: { label: 'Critical', bg: 'bg-rose-100 text-rose-800' }
  }[comment.severity] || { label: 'Note', bg: 'bg-stone-200 text-stone-700' };

  return (
    <div
      onClick={onSelect}
      className={`rounded-lg border p-3.5 transition-all text-xs cursor-pointer ${
        comment.resolved
          ? 'bg-[#FAF6EE]/50 border-[rgba(34,30,24,0.08)] opacity-70'
          : isActive
            ? 'bg-[#FAF6EE] border-[#B54B32] shadow-md ring-1 ring-[#B54B32]/30'
            : 'bg-[#FAF6EE] border-[rgba(34,30,24,0.12)] hover:border-[rgba(34,30,24,0.25)] shadow-xs'
      }`}
    >
      {/* Anchor Text Excerpt */}
      {comment.selectedText && (
        <div className="mb-2 pl-2 border-l-2 border-[#B54B32] text-[11px] font-serif italic text-[#5C5242] line-clamp-2">
          &ldquo;{comment.selectedText}&rdquo;
        </div>
      )}

      {/* Header with Author and Severity */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-[#E8DFD0] text-[#221E18] flex items-center justify-center font-bold text-[10px]">
            {comment.author.charAt(0).toUpperCase()}
          </div>
          <span className="font-semibold text-[#221E18]">{comment.author}</span>
          <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${severityBadge.bg}`}>
            {severityBadge.label}
          </span>
        </div>

        <span className="text-[10px] text-[#7A705F] font-mono">
          {comment.createdAt}
        </span>
      </div>

      {/* Comment Body Text */}
      <p className="text-xs text-[#221E18] leading-relaxed mb-3">
        {comment.content}
      </p>

      {/* Thread Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2 mb-3 pt-2 border-t border-[rgba(34,30,24,0.08)] pl-2">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="text-[11px] leading-snug">
              <div className="flex items-center gap-1 text-[10px] text-[#7A705F] mb-0.5">
                <CornerDownRight size={10} />
                <span className="font-semibold text-[#221E18]">{reply.author}</span>
                <span>•</span>
                <span className="font-mono">{reply.createdAt}</span>
              </div>
              <p className="text-[#3A332A] pl-3">{reply.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Reply Input Form */}
      {showReplyInput && (
        <form onSubmit={handleSubmitReply} className="mt-2 pt-2 border-t border-[rgba(34,30,24,0.08)] flex gap-1.5">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your editorial reply..."
            className="flex-1 px-2.5 py-1 text-xs rounded bg-white border border-[#DDD5C5] text-[#221E18] focus:outline-none focus:border-[#B54B32]"
            autoFocus
          />
          <button
            type="submit"
            className="px-2 py-1 rounded bg-[#B54B32] text-white hover:bg-[#9E3E27] cursor-pointer"
          >
            <Send size={11} />
          </button>
        </form>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-[rgba(34,30,24,0.06)] text-[11px]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onResolve(comment.id, !comment.resolved)}
            className={`flex items-center gap-1 cursor-pointer font-medium transition-colors ${
              comment.resolved
                ? 'text-emerald-700 hover:text-emerald-800'
                : 'text-[#7A705F] hover:text-[#221E18]'
            }`}
          >
            {comment.resolved ? (
              <>
                <RotateCcw size={11} />
                <span>Reopen</span>
              </>
            ) : (
              <>
                <Check size={11} />
                <span>Resolve</span>
              </>
            )}
          </button>

          {!showReplyInput && (
            <button
              onClick={() => setShowReplyInput(true)}
              className="text-[#7A705F] hover:text-[#221E18] cursor-pointer"
            >
              Reply
            </button>
          )}
        </div>

        <button
          onClick={() => onDelete(comment.id)}
          className="text-stone-400 hover:text-rose-600 p-0.5 rounded transition-colors cursor-pointer"
          title="Delete comment"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
};
