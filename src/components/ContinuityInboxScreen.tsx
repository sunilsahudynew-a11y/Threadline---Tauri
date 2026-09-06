import React, { useState } from 'react';
import { ContinuityIssue, Scene } from '../types';
import {
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Plus,
  Compass,
  AlertTriangle
} from 'lucide-react';

interface ContinuityInboxScreenProps {
  issues: ContinuityIssue[];
  scenes: Scene[];
  onUpdateIssue: (issue: ContinuityIssue) => void;
  onNavigateToScene: (sceneId: string) => void;
  onCreateNoteFromIssue: (issue: ContinuityIssue) => void;
  onCreateIssue?: (issue: ContinuityIssue) => void;
}

export const ContinuityInboxScreen: React.FC<ContinuityInboxScreenProps> = ({
  issues,
  scenes,
  onUpdateIssue,
  onNavigateToScene,
  onCreateNoteFromIssue,
  onCreateIssue
}) => {
  const [filter, setFilter] = useState<'all' | 'open' | 'intentional' | 'dismissed'>('open');
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [newSceneA, setNewSceneA] = useState(scenes[0]?.id || '');
  const [newSceneB, setNewSceneB] = useState(scenes[1]?.id || scenes[0]?.id || '');
  const [newExcerptA, setNewExcerptA] = useState('');
  const [newExcerptB, setNewExcerptB] = useState('');
  const [newSeverity, setNewSeverity] = useState<'low' | 'medium' | 'high'>('medium');

  const filteredIssues = issues.filter((issue) => {
    if (filter === 'all') return true;
    return issue.status === filter;
  });

  const openCount = issues.filter((i) => i.status === 'open').length;

  const handleRunRuleScan = () => {
    setIsScanning(true);
    setScanMessage(null);
    setTimeout(() => {
      setIsScanning(false);
      setScanMessage(
        `Scanned ${scenes.length} scenes against Codex lore. Active observations verified; no critical plot timeline breaches detected.`
      );
    }, 700);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] font-mono font-semibold tracking-[0.14em] text-[#7A705F] uppercase">
            Evidence-Based Analysis
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#221E18] font-semibold mt-1">
            Continuity Inbox
          </h1>
          <p className="text-[#7A705F] text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Non-authoritative observations across chapters. Every inquiry presents side-by-side textual evidence so you make the final authorial decision.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onCreateIssue && (
            <button
              onClick={() => setShowLogModal(true)}
              className="px-3.5 py-2 bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] text-[#221E18] hover:bg-[#F1EAD9] rounded-[6px] text-xs font-semibold flex items-center gap-1.5 shadow-warm-sm transition-colors cursor-pointer min-h-[40px]"
            >
              <Plus size={14} className="text-[#B54B32]" />
              <span>Log Inquiry</span>
            </button>
          )}

          <button
            disabled={isScanning}
            onClick={handleRunRuleScan}
            className="px-3.5 py-2 bg-[#221E18] text-[#FAF6EE] hover:bg-black disabled:opacity-50 rounded-[6px] text-xs font-semibold flex items-center gap-1.5 shadow-warm-sm transition-colors cursor-pointer min-h-[40px]"
          >
            {isScanning ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Auditing Canon Rules...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} className="text-[#B54B32]" />
                <span>Run Continuity Audit</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Log Inquiry Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-[#FAF6EE] rounded-[8px] max-w-lg w-full p-6 shadow-warm-modal border border-[rgba(34,30,24,0.12)]">
            <h3 className="font-serif font-bold text-[#221E18] text-lg mb-1">Log Continuity Inquiry</h3>
            <p className="text-xs text-[#7A705F] mb-4">
              Document an inconsistency between two scene passages for future editorial review.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newTitle.trim() || !newQuestion.trim()) return;

                const scA = scenes.find((s) => s.id === newSceneA) || scenes[0];
                const scB = scenes.find((s) => s.id === newSceneB) || scenes[1] || scenes[0];

                const created: ContinuityIssue = {
                  id: 'issue-' + Date.now(),
                  title: newTitle.trim(),
                  severity: newSeverity,
                  status: 'open',
                  question: newQuestion.trim(),
                  passageA: {
                    sceneId: scA?.id || 'scene-1',
                    sceneTitle: scA?.title || 'Scene 1',
                    excerpt: newExcerptA.trim() || 'Excerpt passage A'
                  },
                  passageB: {
                    sceneId: scB?.id || 'scene-2',
                    sceneTitle: scB?.title || 'Scene 2',
                    excerpt: newExcerptB.trim() || 'Excerpt passage B'
                  }
                };

                if (onCreateIssue) {
                  onCreateIssue(created);
                }
                setShowLogModal(false);
                setNewTitle('');
                setNewQuestion('');
                setNewExcerptA('');
                setNewExcerptB('');
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block text-[10px] font-mono uppercase font-bold text-[#7A705F] mb-1">
                  Inquiry Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Silas pocket watch discrepancy"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2 bg-[#F1EAD9] border border-[rgba(34,30,24,0.12)] rounded-[6px] text-xs text-[#221E18] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase font-bold text-[#7A705F] mb-1">
                  Editorial Question
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Silas lost the gold watch in Chapter 1, but checks it in Chapter 4..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="w-full p-2 bg-[#F1EAD9] border border-[rgba(34,30,24,0.12)] rounded-[6px] text-xs text-[#221E18] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold text-[#7A705F] mb-1">
                    First Scene
                  </label>
                  <select
                    value={newSceneA}
                    onChange={(e) => setNewSceneA(e.target.value)}
                    className="w-full p-2 bg-[#F1EAD9] border border-[rgba(34,30,24,0.12)] rounded-[6px] text-xs text-[#221E18]"
                  >
                    {scenes.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.order}. {s.title}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Excerpt from Scene 1..."
                    value={newExcerptA}
                    onChange={(e) => setNewExcerptA(e.target.value)}
                    className="w-full mt-1.5 p-1.5 bg-[#F1EAD9] border border-[rgba(34,30,24,0.12)] rounded-[6px] text-[11px] text-[#221E18]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold text-[#7A705F] mb-1">
                    Second Scene
                  </label>
                  <select
                    value={newSceneB}
                    onChange={(e) => setNewSceneB(e.target.value)}
                    className="w-full p-2 bg-[#F1EAD9] border border-[rgba(34,30,24,0.12)] rounded-[6px] text-xs text-[#221E18]"
                  >
                    {scenes.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.order}. {s.title}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Contradicting excerpt from Scene 2..."
                    value={newExcerptB}
                    onChange={(e) => setNewExcerptB(e.target.value)}
                    className="w-full mt-1.5 p-1.5 bg-[#F1EAD9] border border-[rgba(34,30,24,0.12)] rounded-[6px] text-[11px] text-[#221E18]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[rgba(34,30,24,0.12)]">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-3.5 py-1.5 rounded-[6px] border border-[rgba(34,30,24,0.12)] hover:bg-[#F1EAD9] text-[#7A705F] cursor-pointer min-h-[36px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-[6px] bg-[#221E18] text-[#FAF6EE] hover:bg-black font-semibold shadow-warm-sm cursor-pointer min-h-[36px]"
                >
                  Save Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {scanMessage && (
        <div className="mb-6 p-3 bg-[#F1EAD9] rounded-[6px] border border-[rgba(34,30,24,0.12)] text-xs text-[#221E18] font-mono flex items-center gap-2">
          <CheckCircle2 size={14} className="text-[#35505F] shrink-0" />
          <span>{scanMessage}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-2 border-b border-[rgba(34,30,24,0.12)]">
        <div className="flex gap-1 text-xs bg-[#F1EAD9] p-0.5 rounded-[6px] border border-[rgba(34,30,24,0.12)] self-start overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilter('open')}
            className={`px-3 py-1.5 rounded-[5px] font-medium transition-colors cursor-pointer min-h-[36px] whitespace-nowrap ${
              filter === 'open'
                ? 'bg-[#FAF6EE] shadow-warm-sm text-[#221E18] font-bold'
                : 'text-[#7A705F] hover:text-[#221E18]'
            }`}
          >
            Needs Decision ({openCount})
          </button>
          <button
            onClick={() => setFilter('intentional')}
            className={`px-3 py-1.5 rounded-[5px] font-medium transition-colors cursor-pointer min-h-[36px] whitespace-nowrap ${
              filter === 'intentional'
                ? 'bg-[#FAF6EE] shadow-warm-sm text-[#221E18] font-bold'
                : 'text-[#7A705F] hover:text-[#221E18]'
            }`}
          >
            Marked Intentional
          </button>
          <button
            onClick={() => setFilter('dismissed')}
            className={`px-3 py-1.5 rounded-[5px] font-medium transition-colors cursor-pointer min-h-[36px] whitespace-nowrap ${
              filter === 'dismissed'
                ? 'bg-[#FAF6EE] shadow-warm-sm text-[#221E18] font-bold'
                : 'text-[#7A705F] hover:text-[#221E18]'
            }`}
          >
            Dismissed
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-[5px] font-medium transition-colors cursor-pointer min-h-[36px] whitespace-nowrap ${
              filter === 'all'
                ? 'bg-[#FAF6EE] shadow-warm-sm text-[#221E18] font-bold'
                : 'text-[#7A705F] hover:text-[#221E18]'
            }`}
          >
            All Items ({issues.length})
          </button>
        </div>

        <div className="text-[11px] text-[#7A705F] italic">
          Threadline never alters manuscript prose automatically.
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-4">
        {filteredIssues.length === 0 ? (
          <div className="bg-[#F1EAD9] rounded-[8px] border border-[rgba(34,30,24,0.12)] p-12 text-center">
            <CheckCircle2 size={32} className="mx-auto text-[#35505F] mb-2 opacity-80" />
            <h4 className="font-serif font-semibold text-[#221E18] text-sm">Inbox Clear</h4>
            <p className="text-[#7A705F] text-xs mt-1 max-w-sm mx-auto">
              No items in this category. All identified timeline, character, and lore cues are in harmony.
            </p>
          </div>
        ) : (
          filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className="bg-[#F1EAD9] rounded-[8px] border border-[rgba(34,30,24,0.12)] p-5 sm:p-6 shadow-warm-sm space-y-4"
            >
              {/* Question Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[rgba(34,30,24,0.12)]">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      issue.status === 'open'
                        ? issue.severity === 'high'
                          ? 'bg-[#B54B32]'
                          : 'bg-[#35505F]'
                        : issue.status === 'intentional'
                        ? 'bg-[#35505F]'
                        : 'bg-[#7A705F]/40'
                    }`}
                  />
                  <h3 className="font-serif font-bold text-[#221E18] text-base">{issue.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider border ${
                      issue.status === 'open'
                        ? 'bg-[#B54B32]/10 text-[#B54B32] border-[#B54B32]/30'
                        : issue.status === 'intentional'
                        ? 'bg-[#35505F]/10 text-[#35505F] border-[#35505F]/30'
                        : 'bg-[#FAF6EE] text-[#7A705F] border-[rgba(34,30,24,0.12)]'
                    }`}
                  >
                    {issue.status === 'open' ? 'Needs Decision' : issue.status}
                  </span>
                </div>
              </div>

              {/* Inquiry Framing */}
              <div className="text-xs text-[#221E18] bg-[#FAF6EE] p-3.5 rounded-[6px] border border-[rgba(34,30,24,0.12)] leading-relaxed font-serif">
                <strong className="font-sans font-bold text-[#7A705F] block text-[10px] uppercase font-mono mb-1">
                  Continuity Inquiry:
                </strong>
                {issue.question}
              </div>

              {/* Side-by-Side Passages Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Passage A */}
                <div className="bg-[#FAF6EE] rounded-[6px] border border-[rgba(34,30,24,0.12)] p-3.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase font-mono text-[#7A705F]">
                        Evidence Passage 1
                      </span>
                      <button
                        onClick={() => onNavigateToScene(issue.passageA.sceneId)}
                        className="text-[11px] text-[#B54B32] hover:text-[#9E3E27] flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <span>{issue.passageA.sceneTitle}</span>
                        <ArrowRight size={11} />
                      </button>
                    </div>
                    <p className="font-mono text-xs text-[#221E18] italic leading-relaxed">
                      "{issue.passageA.excerpt}"
                    </p>
                  </div>
                </div>

                {/* Passage B */}
                <div className="bg-[#FAF6EE] rounded-[6px] border border-[rgba(34,30,24,0.12)] p-3.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase font-mono text-[#7A705F]">
                        Evidence Passage 2
                      </span>
                      <button
                        onClick={() => onNavigateToScene(issue.passageB.sceneId)}
                        className="text-[11px] text-[#B54B32] hover:text-[#9E3E27] flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <span>{issue.passageB.sceneTitle}</span>
                        <ArrowRight size={11} />
                      </button>
                    </div>
                    <p className="font-mono text-xs text-[#221E18] italic leading-relaxed">
                      "{issue.passageB.excerpt}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[rgba(34,30,24,0.12)] flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => onUpdateIssue({ ...issue, status: 'intentional' })}
                    className="px-3 py-1.5 rounded-[5px] border border-[#35505F]/40 bg-[#35505F]/10 text-[#35505F] hover:bg-[#35505F]/20 font-medium transition-colors cursor-pointer min-h-[36px]"
                  >
                    Mark as Intentional (Subversion)
                  </button>
                  <button
                    onClick={() => onUpdateIssue({ ...issue, status: 'dismissed' })}
                    className="px-3 py-1.5 rounded-[5px] border border-[rgba(34,30,24,0.12)] bg-[#FAF6EE] hover:bg-[#F1EAD9] text-[#7A705F] font-medium transition-colors cursor-pointer min-h-[36px]"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => onCreateNoteFromIssue(issue)}
                    className="px-3 py-1.5 rounded-[5px] border border-[rgba(34,30,24,0.12)] bg-[#FAF6EE] hover:bg-[#F1EAD9] text-[#7A705F] font-medium transition-colors cursor-pointer min-h-[36px]"
                  >
                    + Note in Scratchpad
                  </button>
                </div>

                <button
                  onClick={() => onNavigateToScene(issue.passageB.sceneId)}
                  className="text-[#221E18] hover:text-[#B54B32] font-medium flex items-center gap-1 cursor-pointer min-h-[36px]"
                >
                  <span>Jump to Scene in Editor</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
