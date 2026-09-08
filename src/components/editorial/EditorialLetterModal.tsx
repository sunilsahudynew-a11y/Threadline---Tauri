import React, { useState, useMemo } from 'react';
import {
  X,
  FileText,
  Copy,
  Check,
  Download,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  HelpCircle,
  Printer
} from 'lucide-react';
import { Project, Scene, Chapter, ManuscriptStyleSheet, EditorialPassDef } from '../../types';

interface EditorialLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  scenes: Scene[];
  chapters?: Chapter[];
  styleSheet?: ManuscriptStyleSheet;
  editorialPasses?: EditorialPassDef[];
}

export const EditorialLetterModal: React.FC<EditorialLetterModalProps> = ({
  isOpen,
  onClose,
  project,
  scenes = [],
  chapters = [],
  styleSheet,
  editorialPasses = []
}) => {
  const [copied, setCopied] = useState(false);
  const [editorName, setEditorName] = useState('Senior Editor Desk');
  const [executiveNotes, setExecutiveNotes] = useState(
    'The manuscript demonstrates extraordinary atmospheric depth and sensory texture. The historical grounding and botanical precision in the prose are deeply compelling. The editorial revisions focus on tightening sentence cadence, eliminating conversational throat-clearing, and heightening the dramatic stakes in the middle beats.'
  );

  // Compute manuscript editorial metrics
  const stats = useMemo(() => {
    let baselineWords = 0;
    let editedWords = 0;
    let openQueriesCount = 0;
    let cleanApprovedScenes = 0;
    let lineEditedScenes = 0;
    let inReviewScenes = 0;

    const allQueries: { sceneTitle: string; excerpt: string; comment: string; category: string; severity: string }[] = [];

    scenes.forEach((s) => {
      const bText = s.editorialBaseline || s.proseContent || '';
      const eText = s.editorialProseContent !== undefined ? s.editorialProseContent : s.proseContent || '';

      const bWords = (bText.match(/\b\w+\b/g) || []).length;
      const eWords = (eText.match(/\b\w+\b/g) || []).length;

      baselineWords += bWords;
      editedWords += eWords;

      if (s.editorialStatus === 'clean-approved') cleanApprovedScenes++;
      else if (s.editorialStatus === 'line-edited') lineEditedScenes++;
      else inReviewScenes++;

      if (s.editorialQueries) {
        s.editorialQueries.forEach((q) => {
          if (!q.resolved) {
            openQueriesCount++;
            allQueries.push({
              sceneTitle: s.title,
              excerpt: q.selectionExcerpt,
              comment: q.comment,
              category: q.category,
              severity: q.severity
            });
          }
        });
      }
    });

    const wordDelta = editedWords - baselineWords;
    const percentChange = baselineWords > 0 ? ((wordDelta / baselineWords) * 100).toFixed(1) : '0';

    return {
      baselineWords,
      editedWords,
      wordDelta,
      percentChange,
      openQueriesCount,
      cleanApprovedScenes,
      lineEditedScenes,
      inReviewScenes,
      totalScenes: scenes.length,
      allQueries
    };
  }, [scenes]);

  // Generate markdown format of the letter
  const markdownLetter = useMemo(() => {
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `# EDITORIAL MEMO & ASSESSMENT
**Project:** ${project.title}
**Author:** ${project.author || 'Author'}
**Genre / Category:** ${project.genre || 'Literary Fiction'}
**Date:** ${today}
**Editor:** ${editorName}

---

## 1. Executive Summary & Word Count Audit
- **Original Draft Word Count:** ${stats.baselineWords.toLocaleString()} words
- **Edited Working Copy:** ${stats.editedWords.toLocaleString()} words
- **Net Delta:** ${stats.wordDelta >= 0 ? `+${stats.wordDelta}` : stats.wordDelta} words (${stats.percentChange}%)
- **Scene Review Progress:** ${stats.cleanApprovedScenes} of ${stats.totalScenes} scenes approved clean (${stats.lineEditedScenes} line-edited, ${stats.inReviewScenes} in review)
- **Open Queries Requiring Feedback:** ${stats.openQueriesCount}

### Editorial Assessment
${executiveNotes}

---

## 2. Manuscript Arc & Developmental Observations
- **Opening Hook & Immersion:** Strong sensory grounding in early chapters. The conflict between institutional authority and personal stewardship provides a clear thematic spine.
- **Pacing & Tension:** Trimming passive constructions and repetitive qualifiers has accelerated beat transitions without sacrificing descriptive lyricism.
- **Character Motivation:** Geneviève's determination carries the emotional core; maintain consistency in her dialogue economy.

---

## 3. Style Sheet & Conventions Compliance
- **Oxford Comma:** ${styleSheet?.oxfordComma ? 'Enforced across all serial clauses' : 'Omitted per author preference'}
- **Dialogue Punctuation:** ${styleSheet?.dialogueQuoteStyle === 'single' ? 'British / Single Quotes' : 'American / Double Quotes'}
- **Em-Dash Spacing:** ${styleSheet?.emDashSpacing === 'spaced' ? 'Spaced em-dashes ( — )' : 'Closed em-dashes (—)'}
- **Numbers:** Spelled out under ${styleSheet?.numbersSpelledUnder || 100}

---

## 4. Editorial Queries Awaiting Author Review (${stats.openQueriesCount} Open)
${
  stats.allQueries.length === 0
    ? '_No unresolved author queries. All marginalia have been addressed._'
    : stats.allQueries
        .map(
          (q, idx) =>
            `${idx + 1}. **[${q.sceneTitle}]** (${q.category.toUpperCase()} · ${q.severity})\n   _Passage:_ "${q.excerpt}"\n   _Query:_ ${q.comment}\n`
        )
        .join('\n')
}

---

## 5. Publishing Passes Status
${editorialPasses
  .map(
    (p) =>
      `- [${p.completed ? 'X' : ' '}] **${p.name}** (${p.completedChecks}/${p.totalChecks} checks) — ${p.focus}`
  )
  .join('\n')}

---
_Generated by Threadline Studio Editorial Desk · Working Copy Layer_
`;
  }, [project, stats, editorName, executiveNotes, styleSheet, editorialPasses]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([markdownLetter], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.title.toLowerCase().replace(/\s+/g, '_')}_editorial_letter.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#FAF6EE] text-[#221E18] rounded-[10px] border border-[rgba(34,30,24,0.18)] shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-[rgba(34,30,24,0.12)] bg-[#F1EAD9] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[5px] bg-[#221E18] text-[#DE6346] flex items-center justify-center shadow-xs">
              <FileText size={15} />
            </div>
            <div>
              <h2 className="font-serif font-bold text-sm sm:text-base text-[#221E18] leading-tight">
                Editorial Letter & Manuscript Review Memo
              </h2>
              <p className="text-[11px] text-[#7A705F] font-sans">
                Comprehensive publishing report for {project.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 text-xs font-semibold bg-[#FAF6EE] hover:bg-[#ECE5D6] text-[#221E18] rounded-[5px] border border-[rgba(34,30,24,0.14)] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Copy Markdown Letter"
            >
              {copied ? <Check size={13} className="text-[#3A7D6E]" /> : <Copy size={13} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-2.5 py-1 text-xs font-semibold bg-[#B54B32] hover:bg-[#9E3E27] text-[#FAF6EE] rounded-[5px] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Download Markdown Report (.md)"
            >
              <Download size={13} />
              <span>Download</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-[#7A705F] hover:text-[#221E18] hover:bg-[#ECE5D6] rounded-[5px] transition-colors cursor-pointer ml-1"
              title="Close modal"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-[#221E18]">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#F3EDE0] border border-[rgba(34,30,24,0.1)] rounded-[6px] p-2.5">
              <div className="text-[10px] font-mono uppercase text-[#7A705F]">Draft Baseline</div>
              <div className="text-sm font-semibold font-serif text-[#221E18] mt-0.5">
                {stats.baselineWords.toLocaleString()} words
              </div>
            </div>

            <div className="bg-[#F3EDE0] border border-[rgba(34,30,24,0.1)] rounded-[6px] p-2.5">
              <div className="text-[10px] font-mono uppercase text-[#7A705F]">Edited Working Copy</div>
              <div className="text-sm font-semibold font-serif text-[#221E18] mt-0.5">
                {stats.editedWords.toLocaleString()} words
              </div>
            </div>

            <div className="bg-[#F3EDE0] border border-[rgba(34,30,24,0.1)] rounded-[6px] p-2.5">
              <div className="text-[10px] font-mono uppercase text-[#7A705F]">Word Delta</div>
              <div className={`text-sm font-semibold font-mono mt-0.5 ${stats.wordDelta <= 0 ? 'text-[#3A7D6E]' : 'text-[#B54B32]'}`}>
                {stats.wordDelta > 0 ? `+${stats.wordDelta}` : stats.wordDelta} ({stats.percentChange}%)
              </div>
            </div>

            <div className="bg-[#F3EDE0] border border-[rgba(34,30,24,0.1)] rounded-[6px] p-2.5">
              <div className="text-[10px] font-mono uppercase text-[#7A705F]">Open Author Queries</div>
              <div className="text-sm font-semibold font-mono text-[#B54B32] mt-0.5">
                {stats.openQueriesCount} queries
              </div>
            </div>
          </div>

          {/* Editor Name & Executive Notes Input */}
          <div className="bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded-[8px] p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#7A705F]">
                Editor Signature & Desk
              </label>
              <input
                type="text"
                value={editorName}
                onChange={(e) => setEditorName(e.target.value)}
                placeholder="Senior Editor Desk"
                className="text-xs font-serif bg-[#FAF6EE] border border-[rgba(34,30,24,0.14)] rounded-[4px] px-2 py-0.5 text-[#221E18] focus:outline-none w-48 text-right"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-[#7A705F] mb-1">
                Executive Assessment (Author-facing notes)
              </label>
              <textarea
                value={executiveNotes}
                onChange={(e) => setExecutiveNotes(e.target.value)}
                rows={3}
                className="w-full text-xs font-serif bg-[#FAF6EE] border border-[rgba(34,30,24,0.14)] rounded-[5px] p-2 text-[#221E18] focus:outline-none resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Letter Preview Box */}
          <div>
            <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#7A705F] mb-1.5 flex items-center justify-between">
              <span>Letter Preview (Markdown / Export Format)</span>
              <span className="text-[10px] font-normal text-[#9E9484]">Formatted for author delivery</span>
            </div>
            <pre className="bg-[#F5F0E4] border border-[rgba(34,30,24,0.12)] rounded-[8px] p-4 text-[11px] font-mono text-[#3E382E] leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-80 select-text">
              {markdownLetter}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[rgba(34,30,24,0.12)] bg-[#F1EAD9] flex items-center justify-between shrink-0">
          <div className="text-[11px] text-[#7A705F] italic">
            Working copy is independent; author manuscript remains untouched.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#221E18] text-[#FAF6EE] text-xs font-semibold rounded-[5px] hover:bg-[#3E382E] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
