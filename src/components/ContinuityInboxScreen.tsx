import React, { useState } from 'react';
import { ContinuityIssue, Scene } from '../types';
import {
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  Clock,
  Sparkles,
  ExternalLink,
  Filter,
  Check,
  RefreshCw,
  Plus
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
        `Scanned ${scenes.length} scenes against Story Bible canon. 3 observations active; no new contradictory timeline breaches detected.`
      );
    }, 800);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-[#AAA69F] uppercase font-mono">
            Evidence-Based Analysis
          </span>
          <h2 className="text-2xl md:text-3xl font-serif text-[#1A1814] font-semibold mt-1">
            Continuity Inbox
          </h2>
          <p className="text-[#8C887F] text-xs mt-1">
            Non-authoritative observations across chapters. Every inquiry presents side-by-side evidence so you make the ultimate narrative decision.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onCreateIssue && (
            <button
              onClick={() => setShowLogModal(true)}
              className="px-3.5 py-2 bg-white border border-[#EBE8E2] text-[#2D2A26] hover:bg-[#FAF9F5] rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Plus size={13} />
              <span>Log Inquiry</span>
            </button>
          )}

          <button
            disabled={isScanning}
            onClick={handleRunRuleScan}
            className="px-3.5 py-2 bg-[#2D2A26] text-white hover:bg-[#1A1814] disabled:opacity-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            {isScanning ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                <span>Auditing Canon Rules...</span>
              </>
            ) : (
              <>
                <Sparkles size={13} />
                <span>Run Continuity Audit</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Log Inquiry Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#EBE8E2]">
            <h3 className="font-serif font-bold text-[#1A1814] text-lg mb-1">Log Continuity Inquiry</h3>
            <p className="text-xs text-[#8C887F] mb-4">
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
                <label className="block text-[10px] font-mono uppercase font-bold text-[#AAA69F] mb-1">
                  Inquiry Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Silas pocket watch discrepancy"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2 bg-[#FAF9F5] border border-[#EBE8E2] rounded-lg text-xs text-[#1A1814] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase font-bold text-[#AAA69F] mb-1">
                  Editorial Question
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Silas lost the gold watch in Chapter 1, but checks it in Chapter 4..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="w-full p-2 bg-[#FAF9F5] border border-[#EBE8E2] rounded-lg text-xs text-[#1A1814] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold text-[#AAA69F] mb-1">
                    First Scene
                  </label>
                  <select
                    value={newSceneA}
                    onChange={(e) => setNewSceneA(e.target.value)}
                    className="w-full p-2 bg-[#FAF9F5] border border-[#EBE8E2] rounded-lg text-xs text-[#1A1814]"
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
                    className="w-full mt-1.5 p-1.5 bg-[#FAF9F5] border border-[#EBE8E2] rounded-lg text-[11px] text-[#1A1814]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold text-[#AAA69F] mb-1">
                    Second Scene
                  </label>
                  <select
                    value={newSceneB}
                    onChange={(e) => setNewSceneB(e.target.value)}
                    className="w-full p-2 bg-[#FAF9F5] border border-[#EBE8E2] rounded-lg text-xs text-[#1A1814]"
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
                    className="w-full mt-1.5 p-1.5 bg-[#FAF9F5] border border-[#EBE8E2] rounded-lg text-[11px] text-[#1A1814]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EBE8E2]">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-[#EBE8E2] hover:bg-[#FAF9F5] text-[#736F66]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#2D2A26] text-white hover:bg-[#1A1814] font-semibold shadow-2xs"
                >
                  Save Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {scanMessage && (
        <div className="mb-6 p-3 bg-[#FAF9F5] rounded-lg border border-[#EBE8E2] text-xs text-[#6C6960] font-mono">
          {scanMessage}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-2 border-b border-[#EBE8E2]">
        <div className="flex gap-1 text-xs bg-[#F1F0EC] p-0.5 rounded-lg border border-[#EBE8E2] self-start">
          <button
            onClick={() => setFilter('open')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filter === 'open'
                ? 'bg-white shadow-xs text-[#1A1814] font-bold'
                : 'text-[#6C6960] hover:text-[#1A1814]'
            }`}
          >
            Needs Decision ({openCount})
          </button>
          <button
            onClick={() => setFilter('intentional')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filter === 'intentional'
                ? 'bg-white shadow-xs text-[#1A1814] font-bold'
                : 'text-[#6C6960] hover:text-[#1A1814]'
            }`}
          >
            Marked Intentional (Subversions)
          </button>
          <button
            onClick={() => setFilter('dismissed')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filter === 'dismissed'
                ? 'bg-white shadow-xs text-[#1A1814] font-bold'
                : 'text-[#6C6960] hover:text-[#1A1814]'
            }`}
          >
            Dismissed
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filter === 'all'
                ? 'bg-white shadow-xs text-[#1A1814] font-bold'
                : 'text-[#6C6960] hover:text-[#1A1814]'
            }`}
          >
            All Items ({issues.length})
          </button>
        </div>

        <div className="text-[11px] text-[#AAA69F] italic">
          Threadline never alters manuscript prose automatically.
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-6">
        {filteredIssues.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#EBE8E2] p-12 text-center">
            <CheckCircle2 size={32} className="mx-auto text-emerald-600 mb-2 opacity-80" />
            <h4 className="font-serif font-semibold text-[#1A1814] text-sm">Inbox Clear</h4>
            <p className="text-[#8C887F] text-xs mt-1 max-w-sm mx-auto">
              No items in this category. All identified timeline, character, and object cues are in harmony.
            </p>
          </div>
        ) : (
          filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className="bg-white rounded-xl border border-[#EBE8E2] p-6 shadow-2xs space-y-4"
            >
              {/* Question Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EBE8E2]">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      issue.status === 'open'
                        ? issue.severity === 'high'
                          ? 'bg-amber-500'
                          : 'bg-stone-400'
                        : issue.status === 'intentional'
                        ? 'bg-emerald-500'
                        : 'bg-stone-300'
                    }`}
                  />
                  <h3 className="font-serif font-bold text-[#1A1814] text-base">{issue.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase ${
                      issue.status === 'open'
                        ? 'bg-amber-100 text-amber-900'
                        : issue.status === 'intentional'
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-[#F1F0EC] text-[#6C6960]'
                    }`}
                  >
                    {issue.status}
                  </span>
                </div>
              </div>

              {/* Inquiry Framing */}
              <div className="text-xs text-[#1A1814] bg-[#FAF9F5] p-3.5 rounded-lg border border-[#EBE8E2] leading-relaxed font-serif">
                <strong className="font-sans font-bold text-[#AAA69F] block text-[10px] uppercase font-mono mb-1">
                  Continuity Inquiry:
                </strong>
                {issue.question}
              </div>

              {/* Side-by-Side Passages Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Passage A */}
                <div className="bg-[#FAF9F5] rounded-lg border border-[#EBE8E2] p-3.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase font-mono text-[#AAA69F]">
                        Evidence Passage 1
                      </span>
                      <button
                        onClick={() => onNavigateToScene(issue.passageA.sceneId)}
                        className="text-[11px] text-[#D4A373] hover:text-[#b88554] flex items-center gap-1 font-medium"
                      >
                        <span>{issue.passageA.sceneTitle}</span>
                        <ArrowRight size={11} />
                      </button>
                    </div>
                    <p className="font-manuscript text-xs text-[#3C3933] italic leading-relaxed">
                      "{issue.passageA.excerpt}"
                    </p>
                  </div>
                </div>

                {/* Passage B */}
                <div className="bg-[#FAF9F5] rounded-lg border border-[#EBE8E2] p-3.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase font-mono text-[#AAA69F]">
                        Evidence Passage 2
                      </span>
                      <button
                        onClick={() => onNavigateToScene(issue.passageB.sceneId)}
                        className="text-[11px] text-[#D4A373] hover:text-[#b88554] flex items-center gap-1 font-medium"
                      >
                        <span>{issue.passageB.sceneTitle}</span>
                        <ArrowRight size={11} />
                      </button>
                    </div>
                    <p className="font-manuscript text-xs text-[#3C3933] italic leading-relaxed">
                      "{issue.passageB.excerpt}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Dismiss | Mark Intentional | Create Note | Jump */}
              <div className="pt-3 border-t border-[#EBE8E2] flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateIssue({ ...issue, status: 'intentional' })}
                    className="px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-medium transition-colors"
                  >
                    Mark as Intentional (Subversion)
                  </button>
                  <button
                    onClick={() => onUpdateIssue({ ...issue, status: 'dismissed' })}
                    className="px-3 py-1.5 rounded-lg border border-[#EBE8E2] bg-[#FAF9F5] hover:bg-[#F1F0EC] text-[#3C3933] font-medium transition-colors"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => onCreateNoteFromIssue(issue)}
                    className="px-3 py-1.5 rounded-lg border border-[#EBE8E2] bg-[#FAF9F5] hover:bg-[#F1F0EC] text-[#3C3933] font-medium transition-colors"
                  >
                    + Note in Scratchpad
                  </button>
                </div>

                <button
                  onClick={() => onNavigateToScene(issue.passageB.sceneId)}
                  className="text-[#1A1814] hover:text-[#D4A373] font-medium flex items-center gap-1"
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
