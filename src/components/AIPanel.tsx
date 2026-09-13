import React, { useState, useMemo, useEffect } from 'react';
import { AIAuditLog, Entity } from '../types';
import {
  Sparkles, X, Check, RefreshCw, Play, FileText, ArrowRight,
  ShieldCheck, Copy, BookOpen, Layers, MousePointerClick,
  Activity, Volume2, Eye, Compass, MessageSquare, AlertTriangle,
  Flame, CheckCircle2, ChevronRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { analyzeProseCadence, CadenceMetrics } from '../utils/proseCadenceAnalyzer';

export interface AIPanelProps {
  scene?: {
    id: string;
    title: string;
    proseContent: string;
    wordCount?: number;
    chapterId?: string;
    characters?: string[];
  };
  chapters?: Array<{ id: string; title: string; actOrPhase?: string; sceneIds: string[] }>;
  allScenes?: Array<{ id: string; title: string; proseContent: string; wordCount?: number; chapterId?: string }>;
  sceneEntities?: Entity[] | Array<{ id: string; name: string; type: string; role?: string; status?: string }>;
  selectedText?: string;
  onClose: () => void;
  onAcceptOutput?: (output: string, actionType: string, destination: 'append' | 'replace' | 'note') => void;
  onDiscardOutput?: () => void;
  onLogAction?: (log: AIAuditLog) => void;
}

type ScopeMode = 'scene' | 'chapter' | 'selection';

interface ActionOption {
  id: string;
  label: string;
  badge: string;
  desc: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export const AIPanel: React.FC<AIPanelProps> = ({
  scene,
  chapters = [],
  allScenes = [],
  sceneEntities = [],
  selectedText = '',
  onClose,
  onAcceptOutput,
  onDiscardOutput,
  onLogAction
}) => {
  // 1. Determine active chapter & scenes
  const currentChapter = useMemo(() => {
    if (!scene?.chapterId) return null;
    return chapters.find(c => c.id === scene.chapterId) || null;
  }, [scene?.chapterId, chapters]);

  const chapterScenes = useMemo(() => {
    if (!currentChapter) return scene ? [scene] : [];
    return allScenes.filter(s => s.chapterId === currentChapter.id);
  }, [currentChapter, allScenes, scene]);

  // 2. Scope management: scene, chapter, or selection
  const hasSelection = Boolean(selectedText && selectedText.trim().length > 0);
  const [scopeMode, setScopeMode] = useState<ScopeMode>(() => {
    return hasSelection ? 'selection' : 'scene';
  });

  // Calculate scope text and metadata
  const { scopeText, scopeTitle, wordCount } = useMemo(() => {
    if (scopeMode === 'selection' && hasSelection) {
      const text = selectedText.trim();
      return {
        scopeText: text,
        scopeTitle: `Selected Excerpt (${text.slice(0, 30)}...)`,
        wordCount: text.split(/\s+/).filter(Boolean).length
      };
    }

    if (scopeMode === 'chapter' && currentChapter) {
      const combined = chapterScenes.map(s => `## ${s.title}\n\n${s.proseContent}`).join('\n\n---\n\n');
      return {
        scopeText: combined,
        scopeTitle: currentChapter.title || 'Current Chapter',
        wordCount: combined.split(/\s+/).filter(Boolean).length
      };
    }

    // Default to Scene
    const text = scene?.proseContent || selectedText || '';
    return {
      scopeText: text,
      scopeTitle: scene?.title || 'Current Scene',
      wordCount: text ? text.split(/\s+/).filter(Boolean).length : 0
    };
  }, [scopeMode, hasSelection, selectedText, scene, currentChapter, chapterScenes]);

  // 3. Algorithmic Cadence & Literary Metrics (ProWritingAid Engine)
  const metrics: CadenceMetrics = useMemo(() => {
    return analyzeProseCadence(scopeText);
  }, [scopeText]);

  // 4. Action / Report Type
  const [actionType, setActionType] = useState<string>('critique');
  const [isLoading, setIsLoading] = useState(false);
  const [reportResult, setReportResult] = useState<string | null>(null);
  const [analysisProvider, setAnalysisProvider] = useState<string | null>(null);
  const [destination, setDestination] = useState<'append' | 'replace' | 'note'>('note');
  const [activeTab, setActiveTab] = useState<'report' | 'metrics'>('report');
  const [copied, setCopied] = useState(false);

  const actionOptions: ActionOption[] = [
    {
      id: 'critique',
      label: 'Critique Cadence & Tone',
      badge: 'Core Audit',
      desc: 'Deep audit of sentence rhythm waves, pacing spikes, sensory immersion, and tone consistency.',
      icon: Activity
    },
    {
      id: 'pacing',
      label: 'Pacing & Narrative Waves',
      badge: 'Story Flow',
      desc: 'Identifies narrative drag vs. rushed turns, exposition density, and micro-tension cycles.',
      icon: Compass
    },
    {
      id: 'dialogue',
      label: 'Dialogue & Tension Dynamics',
      badge: 'Character Voice',
      desc: 'Assesses spoken subtext, distinct character voices, filter words, and tag clutter.',
      icon: MessageSquare
    },
    {
      id: 'lore',
      label: 'Story Codex & Continuity',
      badge: 'World Bible',
      desc: 'Cross-references scene events and characters against established canonical lore.',
      icon: BookOpen
    },
    {
      id: 'brainstorm',
      label: 'Sounding Board: Next Beats',
      badge: 'Generative',
      desc: 'Suggests 3 in-character narrative complications and unexpected turns.',
      icon: Sparkles
    }
  ];

  // Run Real Analysis (calls server-side /api/advisor with Gemini fallback)
  const handleRunAnalysis = async () => {
    if (!scopeText.trim()) return;
    setIsLoading(true);
    setReportResult(null);

    try {
      const response = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: scopeText,
          scopeType: scopeMode,
          title: scopeTitle,
          actionType,
          chapterTitle: currentChapter?.title,
          charactersLore: sceneEntities,
          metrics
        })
      });

      if (!response.ok) {
        throw new Error(`Advisor server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      setReportResult(data.critique || 'No critique returned.');
      setAnalysisProvider(data.provider || 'gemini-3.8-flash');
      setActiveTab('report');
    } catch (err: any) {
      console.warn('Direct server request failed, falling back to local craft engine:', err?.message);
      // Generate instantaneous fallback from calculated metrics
      const fallbackReport = `### Cadence & Rhythmic Flow (${scopeMode.toUpperCase()} SCOPE: "${scopeTitle}")

**Empirical Diagnosis:**
• **Sentence Variety:** Average length is **${metrics.averageSentenceLength} words** with a standard deviation of **${metrics.sentenceStandardDeviation}**.
• **Rhythm Verdict:** **${metrics.rhythmVerdict}**. ${
        metrics.sentenceStandardDeviation < 4
          ? 'The sentence lengths remain too uniform across consecutive paragraphs, risking rhythmic monotony. Inject staccato fragments or expansive compound sentences to vary the tempo.'
          : 'Good musical variation exists between brisk action statements and deliberate, layered descriptions.'
      }

---

### Sensory Anchoring & Immersion
• **Sensory Anchor Words:** ${metrics.sensoryScores.totalSensoryAnchorWords} detected (${metrics.sensoryScores.sensoryDensityPer100Words} per 100 words).
• **Sensory Breakdown:**
  - **Visual:** ${metrics.sensoryScores.sight} markers
  - **Auditory:** ${metrics.sensoryScores.sound} acoustic cues
  - **Tactile:** ${metrics.sensoryScores.touch} physical textures
  - **Olfactory / Gustatory:** ${metrics.sensoryScores.smell + metrics.sensoryScores.taste} atmosphere markers
${
  metrics.sensoryScores.sensoryDensityPer100Words < 2.0
    ? '⚠️ *Caution:* Sensory density is slightly sparse. Anchor character reactions in physical temperature, texture, or acoustic reverberation to eliminate white-room abstraction.'
    : '✓ *Strength:* The prose demonstrates consistent physical grounding in its immediate environment.'
}

---

### Filter Words & Psychological Distance
• **Filter Words Found:** **${metrics.filterWordsTotal} instances** (${metrics.filterWords.map(f => `"${f.word}" (${f.count})`).slice(0, 4).join(', ') || 'None'}).
${
  metrics.filterWordsTotal > 4
    ? 'Phrases such as "she saw" or "he felt" insert an invisible camera between reader and protagonist. Remove the filter verb to pull the reader into unmediated sensory contact.'
    : 'Prose maintains tight emotional proximity with minimal filtering verbs.'
}

---

### Actionable Polish Suggestions
1. **Tighten Structural Glue (${metrics.glueWordsRatio}% glue words):** Strip redundant conjunctions (*and then, just, really, that*) from action beats.
2. **Elevate Emotional Turns:** Align sentence rhythm with emotional stakes—shorten sentences as tension rises, lengthen during introspective aftermath.`;

      setReportResult(fallbackReport);
      setAnalysisProvider('local-craft-engine');
      setActiveTab('report');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyReport = () => {
    if (!reportResult) return;
    navigator.clipboard.writeText(reportResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyToWork = () => {
    if (!reportResult) return;

    if (onLogAction) {
      const log: AIAuditLog = {
        id: 'ai-' + Date.now(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: actionType,
        scopeSnippet: scopeText.slice(0, 80) + (scopeText.length > 80 ? '...' : ''),
        output: reportResult,
        status: 'accepted'
      };
      onLogAction(log);
    }

    if (onAcceptOutput) {
      onAcceptOutput(reportResult, actionType, destination);
    }
    onClose();
  };

  const handleDiscard = () => {
    if (onLogAction && reportResult) {
      const log: AIAuditLog = {
        id: 'ai-' + Date.now(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: actionType,
        scopeSnippet: scopeText.slice(0, 80) + (scopeText.length > 80 ? '...' : ''),
        output: reportResult,
        status: 'discarded'
      };
      onLogAction(log);
    }
    setReportResult(null);
    if (onDiscardOutput) {
      onDiscardOutput();
    }
  };

  // Keyboard shortcut: Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-150">
      {/* Semi-transparent backdrop with click-outside */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Slide-Over Drawer */}
      <div className="relative z-10 w-full max-w-xl sm:max-w-2xl h-full bg-[#FAF6EE] shadow-warm-modal flex flex-col animate-in slide-in-from-right duration-200 border-l border-[rgba(34,30,24,0.12)] select-none text-[#221E18]">
        {/* TOP HEADER */}
        <div className="p-3.5 border-b border-[rgba(34,30,24,0.1)] bg-[#F6F2EA] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-[6px] bg-[#B54B32] text-[#FAF6EE] flex items-center justify-center shadow-xs shrink-0">
              <Sparkles size={15} />
            </div>
            <div className="min-w-0">
              <div className="font-serif font-bold text-sm text-[#221E18] truncate flex items-center gap-2">
                <span>Literary Advisor &amp; Sounding Board</span>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-sm bg-[#EAE2D1] text-[#7A705F] border border-[rgba(34,30,24,0.08)]">
                  ProWritingAid Craft
                </span>
              </div>
              <div className="text-[11px] text-[#7A705F] font-sans truncate">
                Cadence, tone, sensory grounding, and narrative pacing review
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onClose}
              className="p-1.5 rounded-[5px] text-[#7A705F] hover:text-[#221E18] hover:bg-[#EAE2D1] transition-colors cursor-pointer"
              title="Close Advisor (Esc)"
              aria-label="Close Advisor"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* SUBHEADER: ZERO TRAINING PRIVACY NOTICE */}
        <div className="px-4 py-2 border-b border-[rgba(34,30,24,0.08)] bg-[#FAF6EE] flex items-center justify-between text-[11px] text-[#5C5242]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-[#3F6212] shrink-0" />
            <span>Scoped strictly to active manuscript context. Never used for public training.</span>
          </div>
          {analysisProvider && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F1EAD9] text-[#7A705F] border border-[rgba(34,30,24,0.08)] shrink-0">
              {analysisProvider}
            </span>
          )}
        </div>

        {/* MAIN BODY: SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 select-text">
          {/* 1. SCOPE SELECTOR: Scene vs Chapter vs Selection */}
          <div className="p-3 rounded-lg bg-[#F1EAD9] border border-[rgba(34,30,24,0.1)] select-none">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#7A705F]">
                1. Select Analysis Scope
              </span>
              <span className="text-xs font-mono font-bold text-[#B54B32]">
                {wordCount.toLocaleString()} words
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {/* Scene Scope */}
              <button
                type="button"
                onClick={() => setScopeMode('scene')}
                className={`p-2 rounded-md border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  scopeMode === 'scene'
                    ? 'bg-[#221E18] text-[#FAF6EE] border-[#221E18] shadow-xs'
                    : 'bg-[#FAF6EE] text-[#5C5242] border-[rgba(34,30,24,0.12)] hover:text-[#221E18] hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <FileText size={13} />
                  <span className="font-semibold text-xs truncate">Current Scene</span>
                </div>
                <div className={`text-[10px] truncate ${scopeMode === 'scene' ? 'text-[#FAF6EE]/70' : 'text-[#7A705F]'}`}>
                  {scene?.title || 'Active Scene'}
                </div>
              </button>

              {/* Chapter Scope */}
              <button
                type="button"
                onClick={() => setScopeMode('chapter')}
                className={`p-2 rounded-md border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  scopeMode === 'chapter'
                    ? 'bg-[#221E18] text-[#FAF6EE] border-[#221E18] shadow-xs'
                    : 'bg-[#FAF6EE] text-[#5C5242] border-[rgba(34,30,24,0.12)] hover:text-[#221E18] hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Layers size={13} />
                  <span className="font-semibold text-xs truncate">Full Chapter</span>
                </div>
                <div className={`text-[10px] truncate ${scopeMode === 'chapter' ? 'text-[#FAF6EE]/70' : 'text-[#7A705F]'}`}>
                  {currentChapter?.title || 'Entire Chapter'}
                </div>
              </button>

              {/* Selection Scope */}
              <button
                type="button"
                onClick={() => hasSelection && setScopeMode('selection')}
                disabled={!hasSelection}
                className={`p-2 rounded-md border text-left transition-all flex flex-col justify-between ${
                  !hasSelection
                    ? 'opacity-40 bg-[#FAF6EE] text-[#7A705F] border-[rgba(34,30,24,0.08)] cursor-not-allowed'
                    : scopeMode === 'selection'
                    ? 'bg-[#221E18] text-[#FAF6EE] border-[#221E18] shadow-xs cursor-pointer'
                    : 'bg-[#FAF6EE] text-[#5C5242] border-[rgba(34,30,24,0.12)] hover:text-[#221E18] hover:bg-white cursor-pointer'
                }`}
                title={hasSelection ? 'Analyze highlighted text' : 'Highlight text in the editor to activate'}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <MousePointerClick size={13} />
                  <span className="font-semibold text-xs truncate">Selection</span>
                </div>
                <div className={`text-[10px] truncate ${scopeMode === 'selection' ? 'text-[#FAF6EE]/70' : 'text-[#7A705F]'}`}>
                  {hasSelection ? `${selectedText.split(/\s+/).filter(Boolean).length} words` : 'None highlighted'}
                </div>
              </button>
            </div>
          </div>

          {/* 2. REAL-TIME LITERARY CRAFT STATS BAR (PROWRITINGAID METRICS) */}
          <div className="p-3 rounded-lg bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] space-y-2 select-none">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#7A705F] flex items-center gap-1.5">
                <Activity size={13} className="text-[#B54B32]" />
                Prose Cadence Diagnostics
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#EAE2D1] text-[#221E18]">
                {metrics.rhythmVerdict}
              </span>
            </div>

            {/* Metric Pills Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              <div className="p-2 rounded-md bg-[#F6F2EA] border border-[rgba(34,30,24,0.08)]">
                <div className="text-[10px] text-[#7A705F] font-mono">Avg Sentence</div>
                <div className="font-serif font-bold text-[#221E18] text-sm">
                  {metrics.averageSentenceLength} <span className="text-[10px] font-sans font-normal text-[#7A705F]">words</span>
                </div>
                <div className="text-[9px] text-[#7A705F]">σ = {metrics.sentenceStandardDeviation} words</div>
              </div>

              <div className="p-2 rounded-md bg-[#F6F2EA] border border-[rgba(34,30,24,0.08)]">
                <div className="text-[10px] text-[#7A705F] font-mono">Dialogue Ratio</div>
                <div className="font-serif font-bold text-[#221E18] text-sm">
                  {metrics.dialoguePercentage}% <span className="text-[10px] font-sans font-normal text-[#7A705F]">spoken</span>
                </div>
                <div className="text-[9px] text-[#7A705F]">{100 - metrics.dialoguePercentage}% narrative</div>
              </div>

              <div className="p-2 rounded-md bg-[#F6F2EA] border border-[rgba(34,30,24,0.08)]">
                <div className="text-[10px] text-[#7A705F] font-mono">Sensory Anchors</div>
                <div className="font-serif font-bold text-[#221E18] text-sm">
                  {metrics.sensoryScores.totalSensoryAnchorWords} <span className="text-[10px] font-sans font-normal text-[#7A705F]">cues</span>
                </div>
                <div className="text-[9px] text-[#7A705F]">{metrics.sensoryScores.sensoryDensityPer100Words} per 100w</div>
              </div>

              <div className="p-2 rounded-md bg-[#F6F2EA] border border-[rgba(34,30,24,0.08)]">
                <div className="text-[10px] text-[#7A705F] font-mono">Filter Verbs</div>
                <div className="font-serif font-bold text-[#221E18] text-sm">
                  {metrics.filterWordsTotal} <span className="text-[10px] font-sans font-normal text-[#7A705F]">detected</span>
                </div>
                <div className="text-[9px] text-[#7A705F]">{metrics.glueWordsRatio}% glue words</div>
              </div>
            </div>

            {/* Sentence Length Distribution Bar */}
            <div className="pt-1.5">
              <div className="flex items-center justify-between text-[10px] text-[#7A705F] font-mono mb-1">
                <span>Rhythm Distribution ({metrics.sentenceCount} sentences)</span>
                <span>Short {metrics.cadenceBreakdown.short} • Med {metrics.cadenceBreakdown.medium} • Long {metrics.cadenceBreakdown.long} • Heavy {metrics.cadenceBreakdown.veryLong}</span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden bg-[#EAE2D1] flex">
                <div
                  style={{ width: `${(metrics.cadenceBreakdown.short / Math.max(1, metrics.sentenceCount)) * 100}%` }}
                  className="bg-[#2D6A4F] h-full"
                  title={`Short Sentences (≤8w): ${metrics.cadenceBreakdown.short}`}
                />
                <div
                  style={{ width: `${(metrics.cadenceBreakdown.medium / Math.max(1, metrics.sentenceCount)) * 100}%` }}
                  className="bg-[#3F6212] h-full"
                  title={`Medium Sentences (9-20w): ${metrics.cadenceBreakdown.medium}`}
                />
                <div
                  style={{ width: `${(metrics.cadenceBreakdown.long / Math.max(1, metrics.sentenceCount)) * 100}%` }}
                  className="bg-[#B54B32] h-full"
                  title={`Long Sentences (21-35w): ${metrics.cadenceBreakdown.long}`}
                />
                <div
                  style={{ width: `${(metrics.cadenceBreakdown.veryLong / Math.max(1, metrics.sentenceCount)) * 100}%` }}
                  className="bg-[#7F1D1D] h-full"
                  title={`Very Long Sentences (36+w): ${metrics.cadenceBreakdown.veryLong}`}
                />
              </div>
            </div>
          </div>

          {/* 3. REPORT TYPE SELECTION */}
          <div>
            <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-[#7A705F] mb-1.5 select-none">
              2. Select Editorial Lens
            </label>
            <div className="space-y-1.5 select-none">
              {actionOptions.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = actionType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setActionType(opt.id)}
                    className={`w-full p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? 'border-[#B54B32] bg-[#F1EAD9] shadow-xs'
                        : 'border-[rgba(34,30,24,0.1)] hover:bg-[#FAF6EE] bg-[#FAF6EE] text-[#5C5242]'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-[5px] flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? 'bg-[#B54B32] text-white' : 'bg-[#EAE2D1] text-[#7A705F]'
                      }`}
                    >
                      <IconComponent size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`font-semibold text-xs ${isSelected ? 'text-[#221E18]' : 'text-[#221E18]'}`}>
                          {opt.label}
                        </span>
                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-[rgba(34,30,24,0.06)] text-[#7A705F]">
                          {opt.badge}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#7A705F] mt-0.5 leading-snug">
                        {opt.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. RUN AUDIT BUTTON */}
          <button
            disabled={wordCount === 0 || isLoading}
            onClick={handleRunAnalysis}
            className="w-full py-2.5 bg-[#B54B32] hover:bg-[#9E3E28] disabled:opacity-40 text-[#FAF6EE] rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer min-h-[40px] select-none"
          >
            {isLoading ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Auditing {scopeTitle} ({wordCount.toLocaleString()} words)...</span>
              </>
            ) : (
              <>
                <Play size={14} />
                <span>Run {actionOptions.find(a => a.id === actionType)?.label}</span>
              </>
            )}
          </button>

          {/* 5. REPORT OUTPUT SECTION */}
          {reportResult && (
            <div className="p-3.5 bg-[#F6F2EA] rounded-xl border border-[rgba(34,30,24,0.14)] shadow-xs animate-in fade-in duration-200">
              {/* Output Header */}
              <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[rgba(34,30,24,0.1)]">
                <div className="flex items-center gap-1.5">
                  <FileText size={14} className="text-[#B54B32]" />
                  <span className="font-serif font-bold text-xs text-[#221E18]">
                    Editorial Critique &amp; Recommendations
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handleCopyReport}
                    className="p-1 px-2 text-[11px] rounded bg-[#FAF6EE] hover:bg-white text-[#5C5242] border border-[rgba(34,30,24,0.1)] transition-colors cursor-pointer flex items-center gap-1"
                    title="Copy report markdown to clipboard"
                  >
                    {copied ? <CheckCircle2 size={12} className="text-[#2D6A4F]" /> : <Copy size={12} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Formatted Markdown Content */}
              <div className="p-3.5 bg-white rounded-lg border border-[rgba(34,30,24,0.1)] font-serif text-xs text-[#221E18] leading-relaxed max-h-96 overflow-y-auto prose prose-stone max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {reportResult}
                </ReactMarkdown>
              </div>

              {/* DESTINATION SELECTION & ACTION BUTTONS */}
              <div className="mt-3.5 pt-2.5 border-t border-[rgba(34,30,24,0.1)] select-none">
                <label className="block text-[10px] font-mono uppercase font-semibold text-[#7A705F] mb-1.5">
                  If accepted, apply recommendations as:
                </label>
                <div className="grid grid-cols-3 gap-1.5 mb-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setDestination('note')}
                    className={`p-1.5 rounded-md border text-center transition-all cursor-pointer ${
                      destination === 'note'
                        ? 'bg-[#221E18] text-[#FAF6EE] border-[#221E18] font-semibold shadow-xs'
                        : 'border-[rgba(34,30,24,0.12)] bg-[#FAF6EE] text-[#5C5242] hover:bg-white'
                    }`}
                  >
                    Scene Notes
                  </button>
                  <button
                    type="button"
                    onClick={() => setDestination('append')}
                    className={`p-1.5 rounded-md border text-center transition-all cursor-pointer ${
                      destination === 'append'
                        ? 'bg-[#221E18] text-[#FAF6EE] border-[#221E18] font-semibold shadow-xs'
                        : 'border-[rgba(34,30,24,0.12)] bg-[#FAF6EE] text-[#5C5242] hover:bg-white'
                    }`}
                  >
                    Append to Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => setDestination('replace')}
                    disabled={!hasSelection || scopeMode !== 'selection'}
                    className={`p-1.5 rounded-md border text-center transition-all ${
                      !hasSelection || scopeMode !== 'selection'
                        ? 'opacity-40 bg-[#FAF6EE] text-[#7A705F] border-[rgba(34,30,24,0.08)] cursor-not-allowed'
                        : destination === 'replace'
                        ? 'bg-[#221E18] text-[#FAF6EE] border-[#221E18] font-semibold shadow-xs cursor-pointer'
                        : 'border-[rgba(34,30,24,0.12)] bg-[#FAF6EE] text-[#5C5242] hover:bg-white cursor-pointer'
                    }`}
                    title={hasSelection && scopeMode === 'selection' ? 'Replace highlighted text' : 'Only available for highlighted excerpt'}
                  >
                    Replace Selection
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleApplyToWork}
                    className="flex-1 py-2 bg-[#2D6A4F] hover:bg-[#22543D] text-[#FAF6EE] rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer min-h-[36px]"
                  >
                    <Check size={14} />
                    <span>Insert into Manuscript</span>
                  </button>
                  <button
                    onClick={handleDiscard}
                    className="px-4 py-2 bg-[#FAF6EE] hover:bg-[#EAE2D1] text-[#7A705F] hover:text-[#221E18] rounded-lg font-semibold text-xs transition-colors border border-[rgba(34,30,24,0.12)] cursor-pointer min-h-[36px]"
                    title="Dismiss report without applying"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
