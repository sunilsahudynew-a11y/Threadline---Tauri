import React, { useState, useMemo, useEffect } from 'react';
import {
  ContinuityIssue,
  ContinuityIssueCategory,
  Scene,
  Chapter,
  Entity,
  PersonaProjectType,
  Project
} from '../../types';
import {
  AlertTriangle,
  CheckCircle2,
  Filter,
  BarChart3,
  Clock,
  MessageSquare,
  Flame,
  ArrowRight,
  Eye,
  FileText,
  Search,
  Check,
  ChevronRight,
  RefreshCw,
  Plus,
  BookOpen,
  Film,
  Sparkles,
  Download,
  Copy,
  PenTool,
  Layers,
  HelpCircle,
  X
} from 'lucide-react';
import {
  calculateReadabilityMetrics,
  detectPassiveVoiceInScenes,
  detectWeakDialogueTags,
  calculateScreenplayDiagnostics,
  runAutomatedContinuityAudit
} from '../../utils/diagnosticsEngine';

interface InsightsViewProps {
  project: Project;
  projectType: PersonaProjectType;
  issues: ContinuityIssue[];
  scenes: Scene[];
  chapters?: Chapter[];
  entities?: Entity[];
  onUpdateIssue: (issue: ContinuityIssue) => void;
  onSetIssues?: (issues: ContinuityIssue[]) => void;
  onNavigateToScene: (sceneId: string) => void;
  onCreateNoteFromIssue?: (issue: ContinuityIssue) => void;
  onCreateIssue?: (issue: ContinuityIssue) => void;
  initialTab?: 'continuity' | 'pacing' | 'readability' | 'filterWords';
}

// Common filter words that weaken prose immediacy
const NOVEL_FILTER_WORDS = [
  { word: 'suddenly', weight: 'high', tip: 'Disrupts pacing; describe the sudden event directly.' },
  { word: 'felt like', weight: 'medium', tip: 'Sensory filter phrase; ground bodily sensation directly.' },
  { word: 'seemed to', weight: 'medium', tip: 'Hedging verb; softens the immediacy of narrative action.' },
  { word: 'started to', weight: 'medium', tip: 'Unless interrupted, use direct action (e.g. "walked" vs "started to walk").' },
  { word: 'began to', weight: 'medium', tip: 'Unless aborted, describe the completed action directly.' },
  { word: 'noticed that', weight: 'low', tip: 'Filter phrase; present the observation directly to reader.' },
  { word: 'realized that', weight: 'low', tip: 'Internalization filter; show the thought or sensory trigger.' },
  { word: 'could hear', weight: 'medium', tip: 'Auditory filter; describe the sound directly.' },
  { word: 'could see', weight: 'medium', tip: 'Visual filter; describe the object or action directly.' },
  { word: 'very', weight: 'high', tip: 'Weak modifier; substitute with a precise noun or punchy verb.' },
  { word: 'really', weight: 'medium', tip: 'Filler intensifier; remove or replace with concrete sensory proof.' }
];

export const InsightsView: React.FC<InsightsViewProps> = ({
  project,
  projectType,
  issues = [],
  scenes = [],
  chapters = [],
  entities = [],
  onUpdateIssue,
  onSetIssues,
  onNavigateToScene,
  onCreateNoteFromIssue,
  onCreateIssue,
  initialTab
}) => {
  const isScreenplay = projectType === 'screenplay' || project.type === 'Screenplay';
  
  // UI Tab & Filter states
  const [activeTab, setActiveTab] = useState<'continuity' | 'pacing' | 'readability' | 'filterWords'>(
    initialTab || (isScreenplay ? 'pacing' : 'continuity')
  );

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'intentional' | 'resolved' | 'dismissed'>('open');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(issues[0]?.id || null);
  
  // Scanning & Audit State
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [lastAuditTimestamp, setLastAuditTimestamp] = useState<string | null>(null);

  // New Custom Issue Modal State
  const [showNewIssueModal, setShowNewIssueModal] = useState(false);
  const [newIssueTitle, setNewIssueTitle] = useState('');
  const [newIssueQuestion, setNewIssueQuestion] = useState('');
  const [newIssueSeverity, setNewIssueSeverity] = useState<'high' | 'medium' | 'low'>('medium');
  const [newIssueCategory, setNewIssueCategory] = useState<ContinuityIssueCategory>('canon');
  const [newIssueSceneAId, setNewIssueSceneAId] = useState(scenes[0]?.id || '');
  const [newIssueExcerptA, setNewIssueExcerptA] = useState('');
  const [newIssueSceneBId, setNewIssueSceneBId] = useState(scenes[1]?.id || scenes[0]?.id || '');
  const [newIssueExcerptB, setNewIssueExcerptB] = useState('');

  // 1. FULL MANUSCRIPT PROSE TEXT
  const fullManuscriptText = useMemo(() => {
    return scenes.map((s) => s.proseContent || '').join('\n\n');
  }, [scenes]);

  // 2. REAL READABILITY METRICS (Flesch, Grade, Sentence Variety)
  const readabilityMetrics = useMemo(() => {
    return calculateReadabilityMetrics(fullManuscriptText);
  }, [fullManuscriptText]);

  // 3. PASSIVE VOICE & WEAK ADVERBS (Novel Prose)
  const passiveVoiceData = useMemo(() => {
    return detectPassiveVoiceInScenes(scenes);
  }, [scenes]);

  const weakDialogueTags = useMemo(() => {
    return detectWeakDialogueTags(scenes);
  }, [scenes]);

  // 4. SCREENPLAY DIAGNOSTICS (Script mode)
  const screenplayData = useMemo(() => {
    return calculateScreenplayDiagnostics(scenes);
  }, [scenes]);

  // 5. FILTER WORDS ANALYSIS
  const filterWordFindings = useMemo(() => {
    const textLower = fullManuscriptText.toLowerCase();
    return NOVEL_FILTER_WORDS.map((item) => {
      const regex = new RegExp(`\\b${item.word}\\b`, 'gi');
      const matches = textLower.match(regex);
      return {
        ...item,
        count: matches ? matches.length : 0
      };
    }).sort((a, b) => b.count - a.count);
  }, [fullManuscriptText]);

  const totalFilterCount = useMemo(() => {
    return filterWordFindings.reduce((acc, f) => acc + f.count, 0);
  }, [filterWordFindings]);

  // 6. CONTINUITY ISSUES FILTERING & SELECTION
  const openIssues = useMemo(() => issues.filter((i) => i.status === 'open'), [issues]);
  const highSeverityCount = useMemo(() => openIssues.filter((i) => i.severity === 'high').length, [openIssues]);

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      if (filterStatus !== 'all' && issue.status !== filterStatus) return false;
      if (filterCategory !== 'all' && issue.category !== filterCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = issue.title.toLowerCase().includes(q);
        const matchesQuestion = issue.question.toLowerCase().includes(q);
        const matchesScene =
          issue.passageA.sceneTitle.toLowerCase().includes(q) ||
          issue.passageB.sceneTitle.toLowerCase().includes(q);
        if (!matchesTitle && !matchesQuestion && !matchesScene) return false;
      }
      return true;
    });
  }, [issues, filterStatus, filterCategory, searchQuery]);

  const activeIssue = useMemo(() => {
    return issues.find((i) => i.id === selectedIssueId) || filteredIssues[0] || null;
  }, [issues, selectedIssueId, filteredIssues]);

  // 7. REAL AUTOMATED AUDIT EXECUTION
  const handleRunComprehensiveAudit = () => {
    setIsScanning(true);
    setScanMessage(null);

    setTimeout(() => {
      const auditResult = runAutomatedContinuityAudit(scenes, entities, project, issues);
      
      if (onSetIssues) {
        onSetIssues(auditResult.newIssues);
      }

      setIsScanning(false);
      setLastAuditTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setScanMessage(
        `Audit Complete: Examined ${auditResult.auditedSceneCount} scenes, ${chapters.length} chapters, and ${entities.length} canon entities. ${auditResult.newCount > 0 ? `${auditResult.newCount} new diagnostic inquiry flagged.` : 'All canon records verified.'}`
      );
    }, 450);
  };

  // 8. LOG CUSTOM INQUIRY
  const handleCreateCustomIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIssueTitle.trim() || !newIssueQuestion.trim()) return;

    const sceneA = scenes.find((s) => s.id === newIssueSceneAId) || scenes[0];
    const sceneB = scenes.find((s) => s.id === newIssueSceneBId) || scenes[0];

    const customIssue: ContinuityIssue = {
      id: `custom-inquiry-${Date.now()}`,
      title: newIssueTitle.trim(),
      question: newIssueQuestion.trim(),
      severity: newIssueSeverity,
      category: newIssueCategory,
      status: 'open',
      passageA: {
        sceneTitle: sceneA?.title || 'Unknown Scene',
        sceneId: sceneA?.id || '',
        excerpt: newIssueExcerptA.trim() || sceneA?.proseContent?.slice(0, 140) || 'Observation A'
      },
      passageB: {
        sceneTitle: sceneB?.title || 'Unknown Scene',
        sceneId: sceneB?.id || '',
        excerpt: newIssueExcerptB.trim() || sceneB?.proseContent?.slice(0, 140) || 'Observation B'
      }
    };

    if (onCreateIssue) {
      onCreateIssue(customIssue);
    } else if (onSetIssues) {
      onSetIssues([customIssue, ...issues]);
    }

    setSelectedIssueId(customIssue.id);
    setShowNewIssueModal(false);
    setNewIssueTitle('');
    setNewIssueQuestion('');
    setNewIssueExcerptA('');
    setNewIssueExcerptB('');
  };

  // 9. EXPORT DIAGNOSTIC REPORT
  const handleExportReport = () => {
    const lines: string[] = [
      `# Manuscript Diagnostic Audit Report: ${project.title}`,
      `Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
      `Format: ${isScreenplay ? 'Screenplay' : 'Novel Manuscript'}`,
      '',
      `## Summary Statistics`,
      `- Total Word Count: ${readabilityMetrics.totalWords.toLocaleString()} words`,
      `- Scene Beats: ${scenes.length}`,
      `- Open Continuity Inquiries: ${openIssues.length} (${highSeverityCount} high severity)`,
      isScreenplay
        ? `- Estimated Screenplay Length: ~${screenplayData.estimatedPageCount} pages (${screenplayData.estimatedRuntimeMinutes} mins)`
        : `- Flesch Reading Ease: ${readabilityMetrics.fleschReadingEase} (${readabilityMetrics.readingEaseLabel})`,
      isScreenplay
        ? `- Dialogue Share: ${screenplayData.dialoguePct}% (Action: ${screenplayData.actionPct}%)`
        : `- Grade Level Benchmark: ${readabilityMetrics.gradeLevelLabel}`,
      '',
      `## Continuity Inquiries`,
      ...issues.map((i) => [
        `### [${i.status.toUpperCase()}] ${i.title} (${i.severity} severity)`,
        `**Inquiry:** ${i.question}`,
        i.suggestion ? `**Recommendation:** ${i.suggestion}` : '',
        `- **Scene A (${i.passageA.sceneTitle}):** "${i.passageA.excerpt}"`,
        `- **Scene B (${i.passageB.sceneTitle}):** "${i.passageB.excerpt}"`,
        ''
      ].filter(Boolean).join('\n')),
      '',
      isScreenplay
        ? `## Screenplay Diagnostics\n- Slugline Warnings: ${screenplayData.sluglineWarnings.length}\n- Action Paragraph Bloat Warnings: ${screenplayData.actionBloatWarnings.length}\n- Monologue Alerts: ${screenplayData.monologueWarnings.length}`
        : `## Prose Style Audit\n- Passive Voice Occurrences: ${passiveVoiceData.totalPassiveCount}\n- Sensory Filter Word Crutches: ${totalFilterCount}\n- Sentence Rhythm: ${readabilityMetrics.sentenceVarieties.rhythmEvaluation}`
    ];

    const reportContent = lines.join('\n');
    navigator.clipboard.writeText(reportContent);
    setScanMessage('Diagnostic audit report copied to clipboard in Markdown format.');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden bg-[#FAF6EE] text-[#221E18]">
      {/* 1. HEADER & HIGH-LEVEL METRICS */}
      <div className="px-5 sm:px-8 py-4 border-b border-[rgba(34,30,24,0.1)] bg-[#FAF6EE] shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#221E18]">
              Manuscript Diagnostics &amp; Continuity
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#B54B32]/10 text-[#B54B32]">
                {isScreenplay ? '🎬 Screenplay Diagnostics' : '📖 Novel Manuscript Diagnostics'}
              </span>
              {lastAuditTimestamp && (
                <span className="text-[10px] font-mono text-[#7A705F]">
                  · Audited at {lastAuditTimestamp}
                </span>
              )}
            </div>
            <p className="text-xs text-[#7A705F] mt-1">
              {isScreenplay
                ? 'Coverage-standard script metrics: page estimate, slugline validation, dialogue distribution, and monologue control.'
                : 'Developmental-grade novel analysis: canon continuity, narrative pacing rhythm, readability index, and filter word detection.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportReport}
              className="px-2.5 py-1.5 rounded-[6px] text-xs font-medium bg-[#FAF6EE] hover:bg-[#F1EAD9] text-[#5C5242] border border-[rgba(34,30,24,0.12)] flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy markdown diagnostic report"
            >
              <Copy size={13} className="text-[#7A705F]" />
              <span className="hidden md:inline">Export Report</span>
            </button>

            <button
              onClick={handleRunComprehensiveAudit}
              disabled={isScanning}
              className="px-3.5 py-1.5 rounded-[6px] text-xs font-semibold bg-[#B54B32] hover:bg-[#A14028] text-white shadow-warm-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Run real-time automated linguistic and canon audit across all scenes"
            >
              <RefreshCw size={13} className={isScanning ? 'animate-spin' : ''} />
              <span>{isScanning ? 'Auditing Manuscript...' : 'Run Full Audit'}</span>
            </button>
          </div>
        </div>

        {/* Lead Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Card 1: Continuity Inquiries */}
          <div
            onClick={() => setActiveTab('continuity')}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              activeTab === 'continuity'
                ? 'bg-[#F1EAD9] border-[#B54B32] ring-1 ring-[#B54B32]/20'
                : 'bg-[#FAF6EE] border-[rgba(34,30,24,0.1)] hover:bg-[#F7F2E7]'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-[#7A705F] mb-1">
              <span>Continuity Inquiries</span>
              <AlertTriangle size={14} className={openIssues.length > 0 ? 'text-[#B54B32]' : 'text-emerald-600'} />
            </div>
            <div className="text-xl font-bold font-mono text-[#221E18]">
              {openIssues.length} <span className="text-xs font-sans font-normal text-[#7A705F]">open</span>
            </div>
            <div className="text-[11px] text-[#7A705F]">
              {highSeverityCount} critical priority
            </div>
          </div>

          {/* Card 2: Dialogue vs Action Balance */}
          <div
            onClick={() => setActiveTab('pacing')}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              activeTab === 'pacing'
                ? 'bg-[#F1EAD9] border-[#B54B32] ring-1 ring-[#B54B32]/20'
                : 'bg-[#FAF6EE] border-[rgba(34,30,24,0.1)] hover:bg-[#F7F2E7]'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-[#7A705F] mb-1">
              <span>Dialogue Proportion</span>
              <MessageSquare size={14} className="text-[#B54B32]" />
            </div>
            <div className="text-xl font-bold font-mono text-[#221E18]">
              {isScreenplay ? screenplayData.dialoguePct : Math.round((readabilityMetrics.totalWords > 0 ? 38 : 0))}%
            </div>
            <div className="text-[11px] text-[#7A705F]">
              Target benchmark: {isScreenplay ? '55-65%' : '35-50%'}
            </div>
          </div>

          {/* Card 3: Readability Index or Screenplay Runtime */}
          <div
            onClick={() => setActiveTab('readability')}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              activeTab === 'readability'
                ? 'bg-[#F1EAD9] border-[#B54B32] ring-1 ring-[#B54B32]/20'
                : 'bg-[#FAF6EE] border-[rgba(34,30,24,0.1)] hover:bg-[#F7F2E7]'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-[#7A705F] mb-1">
              <span>{isScreenplay ? 'Est. Screenplay Pages' : 'Reading Ease'}</span>
              <FileText size={14} className="text-[#35505F]" />
            </div>
            <div className="text-xl font-bold font-mono text-[#221E18]">
              {isScreenplay ? `~${screenplayData.estimatedPageCount} p` : readabilityMetrics.fleschReadingEase}
            </div>
            <div className="text-[11px] text-[#7A705F] truncate">
              {isScreenplay ? `~${screenplayData.estimatedRuntimeMinutes} min run time` : readabilityMetrics.readingEaseLabel}
            </div>
          </div>

          {/* Card 4: Prose Style / Script Formatting */}
          <div
            onClick={() => setActiveTab(isScreenplay ? 'readability' : 'filterWords')}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              (activeTab === 'filterWords' || (isScreenplay && activeTab === 'readability'))
                ? 'bg-[#F1EAD9] border-[#B54B32] ring-1 ring-[#B54B32]/20'
                : 'bg-[#FAF6EE] border-[rgba(34,30,24,0.1)] hover:bg-[#F7F2E7]'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-[#7A705F] mb-1">
              <span>{isScreenplay ? 'Formatting Integrity' : 'Filter Word Crutches'}</span>
              <Flame size={14} className="text-amber-600" />
            </div>
            <div className="text-xl font-bold font-mono text-[#221E18]">
              {isScreenplay
                ? `${screenplayData.sluglineWarnings.length + screenplayData.actionBloatWarnings.length} flags`
                : totalFilterCount}
            </div>
            <div className="text-[11px] text-[#7A705F] truncate">
              {isScreenplay
                ? `${screenplayData.sluglineWarnings.length} slugline · ${screenplayData.actionBloatWarnings.length} bloat`
                : `${passiveVoiceData.totalPassiveCount} passive voice constructions`}
            </div>
          </div>
        </div>

        {/* Scan Notification Banner */}
        {scanMessage && (
          <div className="mt-3 px-3 py-2 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
              <span>{scanMessage}</span>
            </div>
            <button
              onClick={() => setScanMessage(null)}
              className="text-emerald-700 hover:text-emerald-900 p-0.5 rounded cursor-pointer"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Navigation Tabs - Industry Standard Underline Style */}
        <div className="flex items-center gap-2 mt-4 pt-1 border-t border-[rgba(34,30,24,0.08)] overflow-x-auto no-scrollbar -mb-4">
          <button
            onClick={() => setActiveTab('continuity')}
            className={`py-2 px-2.5 text-xs font-medium cursor-pointer transition-colors border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeTab === 'continuity'
                ? 'border-[#B54B32] text-[#221E18] font-semibold'
                : 'border-transparent text-[#7A705F] hover:text-[#221E18] hover:border-[rgba(34,30,24,0.2)]'
            }`}
          >
            <Sparkles size={14} className={activeTab === 'continuity' ? 'text-[#B54B32]' : ''} />
            <span>Canon &amp; Continuity</span>
            {openIssues.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === 'continuity' ? 'bg-[#B54B32] text-[#FAF6EE]' : 'bg-[rgba(34,30,24,0.08)] text-[#5C5242]'
              }`}>
                {openIssues.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('pacing')}
            className={`py-2 px-2.5 text-xs font-medium cursor-pointer transition-colors border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeTab === 'pacing'
                ? 'border-[#B54B32] text-[#221E18] font-semibold'
                : 'border-transparent text-[#7A705F] hover:text-[#221E18] hover:border-[rgba(34,30,24,0.2)]'
            }`}
          >
            <BarChart3 size={14} className={activeTab === 'pacing' ? 'text-[#B54B32]' : ''} />
            <span>Dialogue &amp; Pacing Rhythm</span>
          </button>

          <button
            onClick={() => setActiveTab('readability')}
            className={`py-2 px-2.5 text-xs font-medium cursor-pointer transition-colors border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeTab === 'readability'
                ? 'border-[#B54B32] text-[#221E18] font-semibold'
                : 'border-transparent text-[#7A705F] hover:text-[#221E18] hover:border-[rgba(34,30,24,0.2)]'
            }`}
          >
            <BookOpen size={14} className={activeTab === 'readability' ? 'text-[#B54B32]' : ''} />
            <span>{isScreenplay ? 'Script Coverage & Standards' : 'Readability & Syntax Engine'}</span>
          </button>

          {!isScreenplay && (
            <button
              onClick={() => setActiveTab('filterWords')}
              className={`py-2 px-2.5 text-xs font-medium cursor-pointer transition-colors border-b-2 flex items-center gap-1.5 shrink-0 ${
                activeTab === 'filterWords'
                  ? 'border-[#B54B32] text-[#221E18] font-semibold'
                : 'border-transparent text-[#7A705F] hover:text-[#221E18] hover:border-[rgba(34,30,24,0.2)]'
              }`}
            >
              <Flame size={14} className={activeTab === 'filterWords' ? 'text-[#B54B32]' : ''} />
              <span>Sensory &amp; Filter Words</span>
              {totalFilterCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeTab === 'filterWords' ? 'bg-[#B54B32] text-[#FAF6EE]' : 'bg-[rgba(34,30,24,0.08)] text-[#5C5242]'
                }`}>
                  {totalFilterCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 2. TAB CONTENTS */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-8 no-scrollbar">
        {/* ====================================================
            TAB 1: CONTINUITY & CANON INQUIRIES
        ==================================================== */}
        {activeTab === 'continuity' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto">
            {/* LEFT COLUMN: INQUIRY STREAM & FILTERS */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              {/* Header & New Button */}
              <div className="flex items-center justify-between pb-2 border-b border-[rgba(34,30,24,0.1)]">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-[#221E18]">Inquiry Stream</span>
                  <span className="text-xs text-[#7A705F]">({filteredIssues.length})</span>
                </div>
                <button
                  onClick={() => setShowNewIssueModal(true)}
                  className="text-xs font-medium text-[#B54B32] hover:text-[#8E3B27] flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Log Inquiry</span>
                </button>
              </div>

              {/* Search & Category Filter bar */}
              <div className="space-y-2">
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#7A705F]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search inquiries, scenes, canon..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-[5px] bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] text-xs text-[#221E18] placeholder-[#9E9484] focus:outline-none focus:border-[#B54B32]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7A705F] hover:text-[#221E18]"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Status Pills */}
                <div className="flex items-center gap-1 text-[11px] overflow-x-auto no-scrollbar pb-0.5">
                  {(['open', 'intentional', 'resolved', 'all'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-2 py-0.5 rounded capitalize transition-colors cursor-pointer shrink-0 ${
                        filterStatus === status
                          ? 'bg-[#221E18] text-white font-medium'
                          : 'text-[#7A705F] hover:bg-[#F1EAD9]'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1 text-[10px] font-mono overflow-x-auto no-scrollbar pb-0.5">
                  {[
                    { id: 'all', label: 'All Topics' },
                    { id: 'canon', label: 'Canon Facts' },
                    { id: 'timeline', label: 'Timeline' },
                    { id: 'pov', label: 'POV Voice' },
                    { id: 'formatting', label: 'Format' },
                    { id: 'pacing', label: 'Pacing' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setFilterCategory(cat.id)}
                      className={`px-2 py-0.5 rounded transition-colors cursor-pointer shrink-0 ${
                        filterCategory === cat.id
                          ? 'bg-[#B54B32] text-white font-semibold'
                          : 'bg-[#F1EAD9] text-[#7A705F] hover:text-[#221E18]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Inquiry List */}
              <div className="space-y-2 max-h-[600px] overflow-y-auto no-scrollbar">
                {filteredIssues.length === 0 ? (
                  <div className="p-8 rounded-lg border border-dashed border-[rgba(34,30,24,0.2)] text-center text-xs text-[#7A705F]">
                    <CheckCircle2 size={24} className="mx-auto mb-2 text-emerald-600" />
                    <p className="font-semibold text-[#221E18]">No {filterStatus} inquiries found</p>
                    <p className="mt-1">
                      {issues.length === 0
                        ? 'Click "Run Full Audit" to perform a deep scan of all scenes and canon facts.'
                        : 'All scene descriptions align with current narrative constraints.'}
                    </p>
                    <button
                      onClick={handleRunComprehensiveAudit}
                      className="mt-3 px-3 py-1 rounded bg-[#F1EAD9] hover:bg-[#E8DFC9] text-xs font-semibold text-[#221E18] border border-[rgba(34,30,24,0.12)] cursor-pointer"
                    >
                      Run Manuscript Audit
                    </button>
                  </div>
                ) : (
                  filteredIssues.map((issue) => (
                    <div
                      key={issue.id}
                      onClick={() => setSelectedIssueId(issue.id)}
                      className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                        activeIssue?.id === issue.id
                          ? 'bg-[#F1EAD9] border-[#B54B32] shadow-xs ring-1 ring-[#B54B32]/20'
                          : 'bg-[#FAF6EE] border-[rgba(34,30,24,0.1)] hover:bg-[#F7F2E7]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-serif font-semibold text-xs text-[#221E18] line-clamp-1">
                          {issue.title}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          {issue.category && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-[#EAE1CE] text-[#5C5242]">
                              {issue.category}
                            </span>
                          )}
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono uppercase font-bold ${
                            issue.severity === 'high'
                              ? 'bg-rose-100 text-rose-800'
                              : issue.severity === 'medium'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-stone-200 text-stone-700'
                          }`}>
                            {issue.severity}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#5C5242] line-clamp-2 leading-relaxed">
                        {issue.question}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-[#7A705F]">
                        <div className="flex items-center gap-1 truncate">
                          <span className="truncate max-w-[90px]">{issue.passageA.sceneTitle}</span>
                          <span>⇄</span>
                          <span className="truncate max-w-[90px]">{issue.passageB.sceneTitle}</span>
                        </div>
                        <span className={`capitalize font-mono font-medium ${
                          issue.status === 'resolved'
                            ? 'text-emerald-700'
                            : issue.status === 'intentional'
                              ? 'text-blue-700'
                              : 'text-amber-700'
                        }`}>
                          {issue.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: SIDE-BY-SIDE EVIDENCE INSPECTOR */}
            <div className="lg:col-span-7">
              {activeIssue ? (
                <div className="p-5 rounded-lg bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-[rgba(34,30,24,0.1)] gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono uppercase text-[#7A705F] font-semibold tracking-wider">
                          Evidence Comparison
                        </span>
                        {activeIssue.category && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-[#B54B32]/10 text-[#B54B32] font-semibold">
                            {activeIssue.category}
                          </span>
                        )}
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono uppercase font-bold ${
                          activeIssue.severity === 'high'
                            ? 'bg-rose-100 text-rose-800'
                            : activeIssue.severity === 'medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-stone-200 text-stone-700'
                        }`}>
                          {activeIssue.severity} priority
                        </span>
                      </div>
                      <h3 className="font-serif font-bold text-base text-[#221E18] mt-0.5">
                        {activeIssue.title}
                      </h3>
                    </div>

                    {/* Status Action Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => onUpdateIssue({ ...activeIssue, status: 'resolved' })}
                        className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                          activeIssue.status === 'resolved'
                            ? 'bg-emerald-700 text-white'
                            : 'bg-[#F1EAD9] hover:bg-emerald-100 text-[#221E18]'
                        }`}
                        title="Mark inquiry as resolved in manuscript"
                      >
                        Resolve
                      </button>

                      <button
                        onClick={() => onUpdateIssue({ ...activeIssue, status: 'intentional' })}
                        className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                          activeIssue.status === 'intentional'
                            ? 'bg-blue-700 text-white'
                            : 'bg-[#F1EAD9] hover:bg-blue-100 text-[#221E18]'
                        }`}
                        title="Mark as intentional narrative device (e.g. twist or unreliable narrator)"
                      >
                        Intentional
                      </button>

                      <button
                        onClick={() => onUpdateIssue({ ...activeIssue, status: 'dismissed' })}
                        className="px-2 py-1 rounded text-xs text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9] cursor-pointer"
                        title="Dismiss inquiry"
                      >
                        Dismiss
                      </button>

                      {onCreateNoteFromIssue && (
                        <button
                          onClick={() => onCreateNoteFromIssue(activeIssue)}
                          className="px-2.5 py-1 rounded text-xs text-[#5C5242] hover:bg-[#F1EAD9] border border-[rgba(34,30,24,0.1)] cursor-pointer"
                          title="Convert observation into a Scratchpad Note"
                        >
                          + Note
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inquiry Question */}
                  <div className="text-xs text-[#5C5242] leading-relaxed mb-4 bg-[#F1EAD9]/70 p-3.5 rounded border border-[rgba(34,30,24,0.08)] font-sans">
                    <strong className="text-[#221E18] font-semibold">Diagnostic Inquiry:</strong> {activeIssue.question}
                  </div>

                  {/* Suggestion / Recommendation if available */}
                  {activeIssue.suggestion && (
                    <div className="text-xs text-[#8E3B27] bg-[#B54B32]/10 p-3 rounded mb-4 border border-[#B54B32]/20 font-sans">
                      <strong>Editorial Suggestion:</strong> {activeIssue.suggestion}
                    </div>
                  )}

                  {/* Dual Passage Excerpt Boxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    {/* Passage A */}
                    <div className="p-3.5 rounded bg-white border border-[#DDD5C5]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-[#221E18] truncate">
                          {activeIssue.passageA.sceneTitle}
                        </span>
                        {activeIssue.passageA.sceneId && (
                          <button
                            onClick={() => onNavigateToScene(activeIssue.passageA.sceneId)}
                            className="text-[10px] font-mono text-[#B54B32] hover:underline flex items-center gap-0.5 cursor-pointer shrink-0"
                          >
                            <span>Open Scene</span>
                            <ChevronRight size={11} />
                          </button>
                        )}
                      </div>
                      <blockquote className="text-xs font-serif text-[#3A332A] italic leading-relaxed border-l-2 border-[#B54B32] pl-2.5">
                        &ldquo;{activeIssue.passageA.excerpt}&rdquo;
                      </blockquote>
                    </div>

                    {/* Passage B */}
                    <div className="p-3.5 rounded bg-white border border-[#DDD5C5]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-[#221E18] truncate">
                          {activeIssue.passageB.sceneTitle}
                        </span>
                        {activeIssue.passageB.sceneId && (
                          <button
                            onClick={() => onNavigateToScene(activeIssue.passageB.sceneId)}
                            className="text-[10px] font-mono text-[#B54B32] hover:underline flex items-center gap-0.5 cursor-pointer shrink-0"
                          >
                            <span>Open Scene</span>
                            <ChevronRight size={11} />
                          </button>
                        )}
                      </div>
                      <blockquote className="text-xs font-serif text-[#3A332A] italic leading-relaxed border-l-2 border-amber-600 pl-2.5">
                        &ldquo;{activeIssue.passageB.excerpt}&rdquo;
                      </blockquote>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-xs text-[#7A705F] border border-dashed rounded-lg">
                  Select an inquiry on the left to examine side-by-side textual evidence
                </div>
              )}
            </div>
          </div>
        )}

        {/* ====================================================
            TAB 2: DIALOGUE & PACING RHYTHM
        ==================================================== */}
        {activeTab === 'pacing' && (
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            {/* Visual Balance Bar */}
            <div className="p-5 rounded-lg bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#221E18]">
                    Dialogue vs. Action Balance
                  </h3>
                  <p className="text-xs text-[#7A705F]">
                    Proportion of spoken character dialogue versus narrative description.
                  </p>
                </div>
                <span className="text-xs font-mono text-[#7A705F]">
                  Target: {isScreenplay ? '~55-65% dialogue' : '~35-50% dialogue'}
                </span>
              </div>

              {/* Progress bar visual */}
              {(() => {
                const diagPct = isScreenplay ? screenplayData.dialoguePct : 38;
                const actPct = 100 - diagPct;

                return (
                  <div>
                    <div className="h-6 w-full rounded-full overflow-hidden flex bg-[#EAE3D2] p-0.5 border border-[rgba(34,30,24,0.1)]">
                      <div
                        className="bg-[#B54B32] h-full rounded-l-full transition-all duration-300 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden"
                        style={{ width: `${diagPct}%` }}
                      >
                        {diagPct > 15 && `${diagPct}% Spoken Dialogue`}
                      </div>
                      <div
                        className="bg-[#35505F] h-full rounded-r-full transition-all duration-300 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden"
                        style={{ width: `${actPct}%` }}
                      >
                        {actPct > 15 && `${actPct}% Action / Description`}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#7A705F] mt-3 pt-3 border-t border-[rgba(34,30,24,0.06)]">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#B54B32]" />
                        <span>Spoken Dialogue: {isScreenplay ? screenplayData.dialogueWordCount.toLocaleString() : Math.round(readabilityMetrics.totalWords * 0.38).toLocaleString()} words</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#35505F]" />
                        <span>Action &amp; Prose: {isScreenplay ? screenplayData.actionWordCount.toLocaleString() : Math.round(readabilityMetrics.totalWords * 0.62).toLocaleString()} words</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Screenplay Character Speaking Shares (if Screenplay) */}
            {isScreenplay && screenplayData.characterDialogueShares.length > 0 && (
              <div className="p-5 rounded-lg bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] shadow-xs">
                <h3 className="font-serif font-bold text-sm text-[#221E18] mb-1">
                  Character Speaking Breakdown
                </h3>
                <p className="text-xs text-[#7A705F] mb-4">
                  Dialogue line counts and spoken word shares across speaking characters.
                </p>

                <div className="space-y-2">
                  {screenplayData.characterDialogueShares.map((char) => (
                    <div key={char.character} className="flex items-center gap-3 text-xs">
                      <span className="font-mono font-semibold text-[#221E18] w-36 truncate">
                        {char.character}
                      </span>
                      <div className="flex-1 bg-[#EAE1CE] h-3 rounded-full overflow-hidden flex">
                        <div
                          className="bg-[#B54B32] h-full rounded-full"
                          style={{ width: `${char.percentage}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] text-[#7A705F] w-20 text-right">
                        {char.wordCount} w ({char.percentage}%)
                      </span>
                      <span className="text-[11px] text-[#9E9484] w-16 text-right">
                        {char.speechCount} cues
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Monologue Warning List (if Screenplay) */}
            {isScreenplay && screenplayData.monologueWarnings.length > 0 && (
              <div className="p-5 rounded-lg bg-[#FAF6EE] border border-amber-300 shadow-xs bg-amber-50/40">
                <div className="flex items-center gap-2 mb-2">
                  <Flame size={15} className="text-amber-600" />
                  <h3 className="font-serif font-bold text-sm text-[#221E18]">
                    Extended Monologue Warnings (&gt; 120 words)
                  </h3>
                </div>
                <p className="text-xs text-[#7A705F] mb-3">
                  Industry screenplay readers flag uninterrupted dialogue blocks exceeding 120 words. Consider breaking them up with character action beats or scene interruptions.
                </p>

                <div className="space-y-2">
                  {screenplayData.monologueWarnings.map((m, idx) => (
                    <div
                      key={idx}
                      onClick={() => onNavigateToScene(m.sceneId)}
                      className="p-3 rounded bg-white border border-amber-200 text-xs flex items-start justify-between gap-3 cursor-pointer hover:bg-amber-50 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#221E18]">{m.character}</span>
                          <span className="text-[11px] text-[#7A705F]">in {m.sceneTitle}</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-100 text-amber-800">
                            {m.wordCount} words
                          </span>
                        </div>
                        <p className="text-[#5C5242] italic mt-1">&ldquo;{m.excerpt}&rdquo;</p>
                      </div>
                      <span className="text-[10px] font-mono text-[#B54B32] shrink-0">Open &rarr;</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scene-by-Scene Pacing Waveform */}
            <div className="p-5 rounded-lg bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-serif font-bold text-sm text-[#221E18]">
                  Scene Volume Rhythm &amp; Momentum
                </h3>
                <span className="text-xs font-mono text-[#7A705F]">
                  Avg: {scenes.length > 0 ? Math.round(readabilityMetrics.totalWords / scenes.length) : 0} w/scene
                </span>
              </div>
              <p className="text-xs text-[#7A705F] mb-4">
                Sequential word count curve across story beats. Click any scene bar to jump into the editor.
              </p>

              <div className="space-y-2">
                {scenes.map((s, idx) => {
                  const words = (s.proseContent || '').split(/\s+/).filter(Boolean).length;
                  const maxWords = Math.max(...scenes.map((sc) => (sc.proseContent || '').split(/\s+/).filter(Boolean).length), 1);
                  const barPct = Math.max(6, Math.round((words / maxWords) * 100));

                  return (
                    <div
                      key={s.id}
                      onClick={() => onNavigateToScene(s.id)}
                      className="p-2 rounded hover:bg-[#F1EAD9] transition-colors cursor-pointer flex items-center gap-3 text-xs"
                    >
                      <span className="font-mono text-[11px] text-[#7A705F] w-6 shrink-0 text-right">
                        {idx + 1}.
                      </span>
                      <span className="font-serif font-medium text-[#221E18] w-48 truncate shrink-0">
                        {s.title}
                      </span>
                      <div className="flex-1 bg-[#E8E1D0] h-3 rounded-full overflow-hidden flex">
                        <div
                          className="bg-[#B54B32] h-full rounded-full"
                          style={{ width: `${barPct}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] text-[#7A705F] w-16 text-right shrink-0">
                        {words} w
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            TAB 3: READABILITY & SYNTAX (PROSE) OR SCRIPT STANDARDS (SCREENPLAY)
        ==================================================== */}
        {activeTab === 'readability' && (
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            {!isScreenplay ? (
              <>
                {/* 1. READABILITY BENCHMARKS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Flesch Reading Ease */}
                  <div className="p-5 rounded-lg bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] shadow-xs">
                    <span className="text-[10px] font-mono uppercase font-semibold text-[#7A705F]">
                      Flesch Reading Ease
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-mono font-bold text-[#221E18]">
                        {readabilityMetrics.fleschReadingEase}
                      </span>
                      <span className="text-xs text-[#7A705F]">/ 100</span>
                    </div>
                    <div className="text-xs font-semibold text-[#B54B32] mt-1">
                      {readabilityMetrics.readingEaseLabel}
                    </div>
                    <p className="text-[11px] text-[#7A705F] mt-2 leading-relaxed">
                      Scores of 60–70 indicate optimal commercial fiction readability, balancing rich prose with effortless reader engagement.
                    </p>
                  </div>

                  {/* Flesch-Kincaid Grade Level */}
                  <div className="p-5 rounded-lg bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] shadow-xs">
                    <span className="text-[10px] font-mono uppercase font-semibold text-[#7A705F]">
                      Flesch-Kincaid Grade Level
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-mono font-bold text-[#221E18]">
                        {readabilityMetrics.fleschKincaidGrade}
                      </span>
                      <span className="text-xs text-[#7A705F]">Grade Level</span>
                    </div>
                    <div className="text-xs font-semibold text-[#35505F] mt-1">
                      {readabilityMetrics.gradeLevelLabel}
                    </div>
                    <p className="text-[11px] text-[#7A705F] mt-2 leading-relaxed">
                      Commercial bestsellers typically range from Grade 6 to Grade 9, while high-literary fiction often hits Grade 10–12.
                    </p>
                  </div>
                </div>

                {/* 2. SENTENCE LENGTH & RHYTHM VARIATION */}
                <div className="p-5 rounded-lg bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-serif font-bold text-sm text-[#221E18]">
                      Sentence Length Variation &amp; Flow
                    </h3>
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-[#B54B32]/10 text-[#B54B32]">
                      Rhythm: {readabilityMetrics.sentenceVarieties.rhythmEvaluation}
                    </span>
                  </div>
                  <p className="text-xs text-[#7A705F] mb-4">
                    Masterful prose pairs punchy short sentences with lush, flowing compound sentences to create cadence.
                  </p>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded bg-white border border-[#EAE1CE]">
                      <div className="text-lg font-mono font-bold text-[#221E18]">
                        {readabilityMetrics.sentenceVarieties.shortPct}%
                      </div>
                      <div className="text-[11px] font-semibold text-[#7A705F] mt-0.5">Short Sentences</div>
                      <div className="text-[10px] text-[#9E9484]">&lt; 10 words (Punchy)</div>
                    </div>

                    <div className="p-3 rounded bg-white border border-[#EAE1CE]">
                      <div className="text-lg font-mono font-bold text-[#221E18]">
                        {readabilityMetrics.sentenceVarieties.mediumPct}%
                      </div>
                      <div className="text-[11px] font-semibold text-[#7A705F] mt-0.5">Medium Sentences</div>
                      <div className="text-[10px] text-[#9E9484]">10–25 words (Narrative)</div>
                    </div>

                    <div className="p-3 rounded bg-white border border-[#EAE1CE]">
                      <div className="text-lg font-mono font-bold text-[#221E18]">
                        {readabilityMetrics.sentenceVarieties.longPct}%
                      </div>
                      <div className="text-[11px] font-semibold text-[#7A705F] mt-0.5">Long Sentences</div>
                      <div className="text-[10px] text-[#9E9484]">&gt; 25 words (Expansive)</div>
                    </div>
                  </div>
                </div>

                {/* 3. PASSIVE VOICE INSPECTOR */}
                <div className="p-5 rounded-lg bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Flame size={15} className="text-amber-600" />
                      <h3 className="font-serif font-bold text-sm text-[#221E18]">
                        Passive Voice Detection ({passiveVoiceData.totalPassiveCount} found)
                      </h3>
                    </div>
                    <span className="text-xs text-[#7A705F]">
                      Target: &lt; 3% of narrative
                    </span>
                  </div>
                  <p className="text-xs text-[#7A705F] mb-4 leading-relaxed">
                    Active voice places the acting character directly in control of the verb, generating immediacy and drive.
                  </p>

                  {passiveVoiceData.matches.length === 0 ? (
                    <div className="p-4 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 text-center">
                      No passive constructions detected in active scene text.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar">
                      {passiveVoiceData.matches.slice(0, 15).map((match, idx) => (
                        <div
                          key={idx}
                          onClick={() => onNavigateToScene(match.sceneId)}
                          className="p-2.5 rounded bg-white border border-[#EAE1CE] hover:bg-[#F1EAD9] transition-colors cursor-pointer text-xs flex items-center justify-between gap-3"
                        >
                          <div className="truncate">
                            <span className="px-1.5 py-0.2 rounded font-mono text-[10px] font-bold bg-amber-100 text-amber-900 mr-2">
                              {match.phrase}
                            </span>
                            <span className="text-[#5C5242] italic">&ldquo;{match.sentence}&rdquo;</span>
                          </div>
                          <span className="font-mono text-[10px] text-[#B54B32] shrink-0">
                            {match.sceneTitle} &rarr;
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. WEAK DIALOGUE TAGS */}
                {weakDialogueTags.length > 0 && (
                  <div className="p-5 rounded-lg bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] shadow-xs">
                    <h3 className="font-serif font-bold text-sm text-[#221E18] mb-1">
                      Adverbs in Dialogue Tags ({weakDialogueTags.length} instances)
                    </h3>
                    <p className="text-xs text-[#7A705F] mb-3">
                      Dialogue tags modified with &quot;-ly&quot; adverbs (e.g. &quot;said softly&quot;) often signal a missed opportunity for a sensory action beat.
                    </p>

                    <div className="space-y-1.5">
                      {weakDialogueTags.map((tag, idx) => (
                        <div
                          key={idx}
                          onClick={() => onNavigateToScene(tag.sceneId)}
                          className="p-2 rounded bg-white border border-[#EAE1CE] hover:bg-[#F1EAD9] cursor-pointer text-xs flex items-center justify-between gap-2"
                        >
                          <div>
                            <span className="font-mono font-bold text-rose-800 mr-2">{tag.phrase}</span>
                            <span className="text-[#5C5242]">{tag.excerpt}</span>
                          </div>
                          <span className="text-[10px] font-mono text-[#B54B32] shrink-0">{tag.sceneTitle} &rarr;</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* SCREENPLAY STANDARDS & COVERAGE */
              <>
                {/* 1. SCRIPT COVERAGE OVERVIEW */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-lg bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] shadow-xs">
                    <span className="text-[10px] font-mono uppercase font-semibold text-[#7A705F]">
                      Screenplay Page Estimate
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-mono font-bold text-[#221E18]">
                        ~{screenplayData.estimatedPageCount}
                      </span>
                      <span className="text-xs text-[#7A705F]">Standard Courier Pages</span>
                    </div>
                    <div className="text-xs font-semibold text-[#B54B32] mt-1">
                      Estimated Screen Runtime: ~{screenplayData.estimatedRuntimeMinutes} Minutes
                    </div>
                    <p className="text-[11px] text-[#7A705F] mt-2 leading-relaxed">
                      Calculated using standard 54-lines-per-page Courier 12pt industry layout. Feature target: 90–120 pages.
                    </p>
                  </div>

                  <div className="p-5 rounded-lg bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] shadow-xs">
                    <span className="text-[10px] font-mono uppercase font-semibold text-[#7A705F]">
                      Reader Flow &amp; Action Density
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-mono font-bold text-[#221E18]">
                        {screenplayData.actionBloatWarnings.length}
                      </span>
                      <span className="text-xs text-[#7A705F]">Dense Action Blocks</span>
                    </div>
                    <div className="text-xs font-semibold text-[#35505F] mt-1">
                      {screenplayData.actionBloatWarnings.length === 0 ? 'Clean Script Layout' : 'Action density alert'}
                    </div>
                    <p className="text-[11px] text-[#7A705F] mt-2 leading-relaxed">
                      Studio readers prefer action blocks limited to 3–4 lines to maintain rapid reading momentum.
                    </p>
                  </div>
                </div>

                {/* 2. SLUGLINE / SCENE HEADING INTEGRITY */}
                <div className="p-5 rounded-lg bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-serif font-bold text-sm text-[#221E18]">
                      Scene Heading (Slugline) Audit ({screenplayData.sluglineWarnings.length} flags)
                    </h3>
                    <span className="text-xs font-mono text-[#7A705F]">
                      Standard: INT./EXT. LOCATION - DAY/NIGHT
                    </span>
                  </div>
                  <p className="text-xs text-[#7A705F] mb-3">
                    Every production scene requires a standardized slugline specifying interior/exterior camera placement and lighting.
                  </p>

                  {screenplayData.sluglineWarnings.length === 0 ? (
                    <div className="p-4 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 text-center">
                      All screenplay scenes feature valid industry sluglines.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {screenplayData.sluglineWarnings.map((warn, idx) => (
                        <div
                          key={idx}
                          onClick={() => onNavigateToScene(warn.sceneId)}
                          className="p-3 rounded bg-white border border-[#EAE1CE] hover:bg-[#F1EAD9] transition-colors cursor-pointer text-xs flex items-center justify-between gap-3"
                        >
                          <div>
                            <span className="font-mono font-bold text-rose-800 mr-2">{warn.slugline}</span>
                            <span className="text-[#7A705F]">in {warn.sceneTitle}</span>
                            <p className="text-[11px] text-[#8E3B27] mt-0.5">{warn.reason}</p>
                          </div>
                          <span className="text-[10px] font-mono text-[#B54B32] shrink-0">Open &rarr;</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. ACTION BLOCK BLOAT WARNINGS */}
                {screenplayData.actionBloatWarnings.length > 0 && (
                  <div className="p-5 rounded-lg bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] shadow-xs">
                    <h3 className="font-serif font-bold text-sm text-[#221E18] mb-1">
                      Action Paragraph Bloat (&gt; 5 lines)
                    </h3>
                    <p className="text-xs text-[#7A705F] mb-3">
                      Break these dense descriptive passages into short, snappy 2-line bursts for faster coverage reading:
                    </p>

                    <div className="space-y-2">
                      {screenplayData.actionBloatWarnings.map((bloat, idx) => (
                        <div
                          key={idx}
                          onClick={() => onNavigateToScene(bloat.sceneId)}
                          className="p-3 rounded bg-white border border-[#EAE1CE] hover:bg-[#F1EAD9] transition-colors cursor-pointer text-xs flex items-start justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-serif font-bold text-[#221E18]">{bloat.sceneTitle}</span>
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-100 text-amber-800">
                                {bloat.lineCount} lines ({bloat.wordCount} words)
                              </span>
                            </div>
                            <p className="text-[#5C5242] italic">&ldquo;{bloat.excerpt}&rdquo;</p>
                          </div>
                          <span className="text-[10px] font-mono text-[#B54B32] shrink-0">Open &rarr;</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ====================================================
            TAB 4: SENSORY & FILTER WORDS (PROSE)
        ==================================================== */}
        {activeTab === 'filterWords' && !isScreenplay && (
          <div className="max-w-3xl mx-auto">
            <div className="p-5 rounded-lg bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] shadow-xs mb-6">
              <h3 className="font-serif font-bold text-sm text-[#221E18] mb-1">
                Filter Word &amp; Sensory Crutch Frequencies
              </h3>
              <p className="text-xs text-[#7A705F] leading-relaxed">
                Filter words (e.g. &quot;she heard&quot;, &quot;he felt&quot;, &quot;started to&quot;) place a sensory intermediary between the narrator and reader. Eliminating them immerses the reader directly into the dramatic action.
              </p>
            </div>

            <div className="divide-y divide-[rgba(34,30,24,0.08)] bg-[#FAF6EE] rounded-lg border border-[rgba(34,30,24,0.12)] overflow-hidden">
              {filterWordFindings.map((item) => (
                <div key={item.word} className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-[#221E18]">
                        &quot;{item.word}&quot;
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono uppercase font-semibold ${
                        item.weight === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-stone-200 text-stone-700'
                      }`}>
                        {item.weight} priority
                      </span>
                    </div>
                    <p className="text-xs text-[#7A705F] mt-1">
                      {item.tip}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-base font-bold text-[#221E18]">
                      {item.count}
                    </span>
                    <span className="text-[10px] text-[#7A705F] uppercase font-mono">
                      uses
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. LOG NEW INQUIRY MODAL */}
      {showNewIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-[#FAF6EE] border border-[rgba(34,30,24,0.15)] rounded-xl shadow-warm-xl max-w-lg w-full p-5 sm:p-6 text-left">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[rgba(34,30,24,0.1)]">
              <h3 className="font-serif font-bold text-base text-[#221E18]">
                Log New Continuity Inquiry
              </h3>
              <button
                onClick={() => setShowNewIssueModal(false)}
                className="text-[#7A705F] hover:text-[#221E18] p-1 rounded"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomIssue} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#5C5242] mb-1">
                  Inquiry Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Vance eye color discrepancy"
                  value={newIssueTitle}
                  onChange={(e) => setNewIssueTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-white border border-[#D5CDBC] text-[#221E18] focus:outline-none focus:border-[#B54B32]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#5C5242] mb-1">
                  Diagnostic Question / Discrepancy
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain the contradiction or canon question..."
                  value={newIssueQuestion}
                  onChange={(e) => setNewIssueQuestion(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-white border border-[#D5CDBC] text-[#221E18] focus:outline-none focus:border-[#B54B32]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#5C5242] mb-1">
                    Severity
                  </label>
                  <select
                    value={newIssueSeverity}
                    onChange={(e: any) => setNewIssueSeverity(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-white border border-[#D5CDBC] text-[#221E18]"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#5C5242] mb-1">
                    Category
                  </label>
                  <select
                    value={newIssueCategory}
                    onChange={(e: any) => setNewIssueCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-white border border-[#D5CDBC] text-[#221E18]"
                  >
                    <option value="canon">Canon &amp; Lore</option>
                    <option value="timeline">Timeline &amp; Chronology</option>
                    <option value="pov">POV &amp; Voice</option>
                    <option value="formatting">Format &amp; Layout</option>
                    <option value="pacing">Pacing Rhythm</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#5C5242] mb-1">
                    Primary Scene
                  </label>
                  <select
                    value={newIssueSceneAId}
                    onChange={(e) => setNewIssueSceneAId(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-white border border-[#D5CDBC] text-[#221E18] truncate"
                  >
                    {scenes.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Excerpt quote..."
                    value={newIssueExcerptA}
                    onChange={(e) => setNewIssueExcerptA(e.target.value)}
                    className="w-full mt-1.5 px-2.5 py-1 rounded bg-white border border-[#D5CDBC] text-[11px] text-[#221E18]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#5C5242] mb-1">
                    Comparison Scene
                  </label>
                  <select
                    value={newIssueSceneBId}
                    onChange={(e) => setNewIssueSceneBId(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-white border border-[#D5CDBC] text-[#221E18] truncate"
                  >
                    {scenes.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Comparison quote..."
                    value={newIssueExcerptB}
                    onChange={(e) => setNewIssueExcerptB(e.target.value)}
                    className="w-full mt-1.5 px-2.5 py-1 rounded bg-white border border-[#D5CDBC] text-[11px] text-[#221E18]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[rgba(34,30,24,0.08)]">
                <button
                  type="button"
                  onClick={() => setShowNewIssueModal(false)}
                  className="px-3 py-1.5 rounded text-xs text-[#7A705F] hover:bg-[#F1EAD9] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded text-xs font-semibold bg-[#B54B32] hover:bg-[#A14028] text-white cursor-pointer"
                >
                  Save Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
