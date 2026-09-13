import React, { useState, useMemo } from 'react';
import { Scene } from '../../types';
import {
  analyzeDeepStatistics,
  DeepTextStatistics,
  WordFrequencyItem
} from '../../utils/textAnalysis';
import {
  X,
  BarChart3,
  BookOpen,
  MessageSquare,
  Activity,
  Search,
  Filter,
  ArrowUpDown,
  Copy,
  Check,
  Sparkles,
  Info,
  Layers
} from 'lucide-react';

interface LinguisticStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeScene: Scene;
  allScenes: Scene[];
}

export const LinguisticStatsModal: React.FC<LinguisticStatsModalProps> = ({
  isOpen,
  onClose,
  activeScene,
  allScenes
}) => {
  const [scope, setScope] = useState<'scene' | 'manuscript'>('scene');
  const [activeTab, setActiveTab] = useState<'readability' | 'frequency' | 'dialogue' | 'sentences'>('readability');
  const [excludeStopWords, setExcludeStopWords] = useState(true);
  const [wordSearch, setWordSearch] = useState('');
  const [sortBy, setSortBy] = useState<'count' | 'alpha'>('count');
  const [copied, setCopied] = useState(false);

  // Compute text according to scope
  const targetText = useMemo(() => {
    if (scope === 'scene') {
      return activeScene.proseContent || '';
    }
    return allScenes.map((s) => s.proseContent || '').join('\n\n');
  }, [scope, activeScene, allScenes]);

  const stats: DeepTextStatistics = useMemo(() => {
    return analyzeDeepStatistics(targetText);
  }, [targetText]);

  // Filter and sort word frequencies
  const displayedFrequencies = useMemo(() => {
    let list: WordFrequencyItem[] = excludeStopWords
      ? stats.filteredFrequencies
      : stats.wordFrequencies;

    if (wordSearch.trim()) {
      const q = wordSearch.trim().toLowerCase();
      list = list.filter((item) => item.word.toLowerCase().includes(q));
    }

    if (sortBy === 'alpha') {
      return [...list].sort((a, b) => a.word.localeCompare(b.word));
    }
    return list;
  }, [stats, excludeStopWords, wordSearch, sortBy]);

  if (!isOpen) return null;

  const handleCopySummary = () => {
    const summary = `THREADLINE DEEP LINGUISTIC AUDIT (${scope === 'scene' ? activeScene.title : 'Full Manuscript'})
--------------------------------------------------
Total Words: ${stats.totalWords.toLocaleString()}
Total Sentences: ${stats.sentenceVariance.totalSentences}
Flesch Reading Ease: ${stats.readability.fleschReadingEase} / 100 (${stats.readability.readingEaseLabel})
Flesch-Kincaid Grade Level: ${stats.readability.fleschGradeLevel} (${stats.readability.gradeLevelLabel})
Gunning Fog Index: ${stats.readability.gunningFogIndex}
Coleman-Liau Index: ${stats.readability.colemanLiauIndex}
Automated Readability Index: ${stats.readability.automatedReadabilityIndex}

DIALOGUE VS NARRATIVE:
Dialogue: ${stats.dialogueNarrative.dialogueWords.toLocaleString()} words (${stats.dialogueNarrative.dialoguePercentage}%)
Narrative: ${stats.dialogueNarrative.narrativeWords.toLocaleString()} words (${stats.dialogueNarrative.narrativePercentage}%)

SENTENCE RHYTHM:
Avg Sentence Length: ${stats.sentenceVariance.avgSentenceLength} words
Min: ${stats.sentenceVariance.minSentenceLength} | Max: ${stats.sentenceVariance.maxSentenceLength} | StdDev: ${stats.sentenceVariance.stdDeviation}
Short (<10w): ${stats.sentenceVariance.shortSentences} | Medium (10-25w): ${stats.sentenceVariance.mediumSentences} | Long (26-40w): ${stats.sentenceVariance.longSentences} | Complex (>40w): ${stats.sentenceVariance.complexSentences}

TOP 10 KEYWORDS:
${stats.filteredFrequencies.slice(0, 10).map((f, i) => `${i + 1}. ${f.word}: ${f.count} (${f.percentage}%)`).join('\n')}
`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[90vh] bg-[#FAF6EE] rounded-[10px] shadow-warm-modal border border-[rgba(34,30,24,0.14)] flex flex-col overflow-hidden text-[#221E18]">
        {/* HEADER */}
        <div className="px-5 py-4 border-b border-[rgba(34,30,24,0.12)] bg-[#F1EAD9] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[6px] bg-[#221E18] text-[#FAF6EE] flex items-center justify-center">
              <BarChart3 size={17} />
            </div>
            <div>
              <h2 className="text-sm font-serif font-bold text-[#221E18]">
                Deep Linguistic & Text Statistics
              </h2>
              <p className="text-[11px] text-[#7A705F]">
                Comprehensive readability metrics, vocabulary density, and sentence cadence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Scope Switcher */}
            <div className="bg-[#FAF6EE] border border-[rgba(34,30,24,0.14)] rounded-[6px] p-0.5 flex text-xs">
              <button
                onClick={() => setScope('scene')}
                className={`px-2.5 py-1 rounded-[4px] font-medium cursor-pointer transition-colors ${
                  scope === 'scene'
                    ? 'bg-[#221E18] text-[#FAF6EE] shadow-2xs'
                    : 'text-[#7A705F] hover:text-[#221E18]'
                }`}
              >
                Active Scene
              </button>
              <button
                onClick={() => setScope('manuscript')}
                className={`px-2.5 py-1 rounded-[4px] font-medium cursor-pointer transition-colors ${
                  scope === 'manuscript'
                    ? 'bg-[#221E18] text-[#FAF6EE] shadow-2xs'
                    : 'text-[#7A705F] hover:text-[#221E18]'
                }`}
              >
                Full Manuscript ({allScenes.length} scenes)
              </button>
            </div>

            <button
              onClick={handleCopySummary}
              className="px-2.5 py-1 text-xs border border-[rgba(34,30,24,0.14)] rounded-[6px] bg-[#FAF6EE] hover:bg-white text-[#4A4031] flex items-center gap-1 cursor-pointer"
              title="Copy audit summary"
            >
              {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy Report'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-[5px] text-[#7A705F] hover:text-[#221E18] hover:bg-[#E2D8C3] cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* HIGH-LEVEL METRICS STRIP */}
        <div className="px-5 py-3 border-b border-[rgba(34,30,24,0.08)] bg-[#FDFBF7] grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className="p-2.5 rounded-[6px] bg-white border border-[rgba(34,30,24,0.08)]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A705F]">Word Count</span>
            <div className="text-lg font-bold font-serif text-[#221E18] mt-0.5">
              {stats.totalWords.toLocaleString()}
            </div>
            <span className="text-[11px] text-[#7A705F]">
              {stats.totalCharacters.toLocaleString()} characters
            </span>
          </div>

          <div className="p-2.5 rounded-[6px] bg-white border border-[rgba(34,30,24,0.08)]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A705F]">Reading Ease</span>
            <div className="text-lg font-bold font-serif text-[#DE6346] mt-0.5 flex items-baseline gap-1.5">
              <span>{stats.readability.fleschReadingEase}</span>
              <span className="text-xs font-sans font-medium text-[#7A705F]">/ 100</span>
            </div>
            <span className="text-[11px] text-[#7A705F] truncate block">
              {stats.readability.readingEaseLabel}
            </span>
          </div>

          <div className="p-2.5 rounded-[6px] bg-white border border-[rgba(34,30,24,0.08)]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A705F]">Grade Level</span>
            <div className="text-lg font-bold font-serif text-[#221E18] mt-0.5">
              {stats.readability.fleschGradeLevel}
            </div>
            <span className="text-[11px] text-[#7A705F]">
              Gunning Fog: {stats.readability.gunningFogIndex}
            </span>
          </div>

          <div className="p-2.5 rounded-[6px] bg-white border border-[rgba(34,30,24,0.08)]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A705F]">Dialogue Ratio</span>
            <div className="text-lg font-bold font-serif text-[#2E7D32] mt-0.5">
              {stats.dialogueNarrative.dialoguePercentage}%
            </div>
            <span className="text-[11px] text-[#7A705F]">
              {stats.dialogueNarrative.dialogueWords.toLocaleString()} spoken words
            </span>
          </div>
        </div>

        {/* TABS HEADER */}
        <div className="px-5 border-b border-[rgba(34,30,24,0.12)] bg-[#F8F4EC] flex gap-4 text-xs font-medium shrink-0">
          <button
            onClick={() => setActiveTab('readability')}
            className={`py-2.5 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'readability'
                ? 'border-[#221E18] text-[#221E18] font-bold'
                : 'border-transparent text-[#7A705F] hover:text-[#221E18]'
            }`}
          >
            <BookOpen size={13} />
            <span>Readability & Indexes</span>
          </button>
          <button
            onClick={() => setActiveTab('frequency')}
            className={`py-2.5 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'frequency'
                ? 'border-[#221E18] text-[#221E18] font-bold'
                : 'border-transparent text-[#7A705F] hover:text-[#221E18]'
            }`}
          >
            <BarChart3 size={13} />
            <span>Word Frequency List ({stats.uniqueWords})</span>
          </button>
          <button
            onClick={() => setActiveTab('dialogue')}
            className={`py-2.5 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'dialogue'
                ? 'border-[#221E18] text-[#221E18] font-bold'
                : 'border-transparent text-[#7A705F] hover:text-[#221E18]'
            }`}
          >
            <MessageSquare size={13} />
            <span>Dialogue vs Narrative</span>
          </button>
          <button
            onClick={() => setActiveTab('sentences')}
            className={`py-2.5 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'sentences'
                ? 'border-[#221E18] text-[#221E18] font-bold'
                : 'border-transparent text-[#7A705F] hover:text-[#221E18]'
            }`}
          >
            <Activity size={13} />
            <span>Sentence Rhythm & Variance</span>
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* 1. READABILITY & INDEXES */}
          {activeTab === 'readability' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Flesch Reading Ease Box */}
                <div className="p-4 rounded-[8px] bg-white border border-[rgba(34,30,24,0.12)]">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-mono font-bold uppercase text-[#7A705F]">
                      Flesch Reading Ease
                    </h3>
                    <span className="px-2 py-0.5 rounded-[4px] text-xs font-semibold bg-[#FAF6EE] text-[#DE6346] border border-[rgba(34,30,24,0.1)]">
                      {stats.readability.fleschReadingEase} / 100
                    </span>
                  </div>
                  {/* Gauge Progress Bar */}
                  <div className="w-full bg-[#EBE5D8] h-3 rounded-full overflow-hidden my-3">
                    <div
                      className="h-full bg-linear-to-r from-red-500 via-amber-500 to-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, stats.readability.fleschReadingEase)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#7A705F] font-mono mb-2">
                    <span>0 (Academic / Confusing)</span>
                    <span>60 (Standard)</span>
                    <span>100 (Very Easy)</span>
                  </div>
                  <p className="text-xs text-[#4A4031] bg-[#FAF6EE] p-2.5 rounded-[6px] border border-[rgba(34,30,24,0.06)]">
                    <strong>{stats.readability.readingEaseLabel}:</strong> {stats.readability.readingEaseDescription}
                  </p>
                </div>

                {/* Academic Grade Formulas Grid */}
                <div className="p-4 rounded-[8px] bg-white border border-[rgba(34,30,24,0.12)] flex flex-col justify-between">
                  <h3 className="text-xs font-mono font-bold uppercase text-[#7A705F] mb-3">
                    Multi-Index Grade Analysis
                  </h3>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between p-2 rounded bg-[#FAF6EE]">
                      <div>
                        <span className="font-semibold text-[#221E18]">Flesch-Kincaid Grade</span>
                        <p className="text-[11px] text-[#7A705F]">US School grade level formula</p>
                      </div>
                      <span className="font-mono font-bold text-sm text-[#221E18]">
                        Grade {stats.readability.fleschGradeLevel}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded bg-[#FAF6EE]">
                      <div>
                        <span className="font-semibold text-[#221E18]">Gunning Fog Index</span>
                        <p className="text-[11px] text-[#7A705F]">Years of formal education required</p>
                      </div>
                      <span className="font-mono font-bold text-sm text-[#221E18]">
                        {stats.readability.gunningFogIndex} yrs
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded bg-[#FAF6EE]">
                      <div>
                        <span className="font-semibold text-[#221E18]">Coleman-Liau Index</span>
                        <p className="text-[11px] text-[#7A705F]">Character length per word index</p>
                      </div>
                      <span className="font-mono font-bold text-sm text-[#221E18]">
                        Grade {stats.readability.colemanLiauIndex}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded bg-[#FAF6EE]">
                      <div>
                        <span className="font-semibold text-[#221E18]">Automated Readability (ARI)</span>
                        <p className="text-[11px] text-[#7A705F]">Calculated stroke complexity</p>
                      </div>
                      <span className="font-mono font-bold text-sm text-[#221E18]">
                        {stats.readability.automatedReadabilityIndex}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ESTIMATED TIMINGS & VOCABULARY DIVERSITY */}
              <div className="p-4 rounded-[8px] bg-white border border-[rgba(34,30,24,0.12)]">
                <h3 className="text-xs font-mono font-bold uppercase text-[#7A705F] mb-3">
                  Pacing & Lexical Diversity
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-[6px] bg-[#FAF6EE]">
                    <span className="text-[10px] font-mono text-[#7A705F] uppercase">Silent Reading Time</span>
                    <div className="text-base font-bold font-serif text-[#221E18] mt-1">
                      ~{stats.estimatedReadingMinutes} min
                    </div>
                    <span className="text-[10px] text-[#7A705F]">Based on standard 225 wpm</span>
                  </div>

                  <div className="p-3 rounded-[6px] bg-[#FAF6EE]">
                    <span className="text-[10px] font-mono text-[#7A705F] uppercase">Audio / Speech Time</span>
                    <div className="text-base font-bold font-serif text-[#221E18] mt-1">
                      ~{stats.estimatedSpeakingMinutes} min
                    </div>
                    <span className="text-[10px] text-[#7A705F]">Based on audiobook 130 wpm</span>
                  </div>

                  <div className="p-3 rounded-[6px] bg-[#FAF6EE]">
                    <span className="text-[10px] font-mono text-[#7A705F] uppercase">Lexical Variety</span>
                    <div className="text-base font-bold font-serif text-[#221E18] mt-1">
                      {(stats.lexicalDiversity * 100).toFixed(1)}%
                    </div>
                    <span className="text-[10px] text-[#7A705F]">
                      {stats.uniqueWords} unique / {stats.totalWords} words
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. WORD FREQUENCY LIST */}
          {activeTab === 'frequency' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              {/* Controls bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white rounded-[8px] border border-[rgba(34,30,24,0.12)]">
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <Search size={14} className="text-[#7A705F]" />
                  <input
                    type="text"
                    placeholder="Search word list..."
                    value={wordSearch}
                    onChange={(e) => setWordSearch(e.target.value)}
                    className="text-xs bg-[#FAF6EE] border border-[rgba(34,30,24,0.14)] rounded px-2.5 py-1 w-full max-w-xs focus:outline-none focus:border-[#221E18]"
                  />
                  {wordSearch && (
                    <button
                      onClick={() => setWordSearch('')}
                      className="text-[#7A705F] hover:text-[#221E18] text-xs cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer text-[#4A4031]">
                    <input
                      type="checkbox"
                      checked={excludeStopWords}
                      onChange={(e) => setExcludeStopWords(e.target.checked)}
                      className="rounded text-[#221E18] focus:ring-0"
                    />
                    <span>Exclude Stop Words</span>
                  </label>

                  <div className="flex items-center gap-1 bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] rounded p-0.5">
                    <button
                      onClick={() => setSortBy('count')}
                      className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${
                        sortBy === 'count' ? 'bg-[#221E18] text-[#FAF6EE]' : 'text-[#7A705F]'
                      }`}
                    >
                      Count
                    </button>
                    <button
                      onClick={() => setSortBy('alpha')}
                      className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${
                        sortBy === 'alpha' ? 'bg-[#221E18] text-[#FAF6EE]' : 'text-[#7A705F]'
                      }`}
                    >
                      A-Z
                    </button>
                  </div>
                </div>
              </div>

              {/* Frequency Table */}
              <div className="bg-white rounded-[8px] border border-[rgba(34,30,24,0.12)] overflow-hidden">
                <div className="grid grid-cols-12 px-4 py-2 bg-[#F1EAD9] text-[11px] font-mono uppercase text-[#7A705F] font-semibold border-b border-[rgba(34,30,24,0.1)]">
                  <div className="col-span-1">#</div>
                  <div className="col-span-6">Word</div>
                  <div className="col-span-2 text-right">Count</div>
                  <div className="col-span-3 text-right">Frequency</div>
                </div>

                <div className="max-h-96 overflow-y-auto divide-y divide-[rgba(34,30,24,0.06)] text-xs">
                  {displayedFrequencies.length === 0 ? (
                    <div className="p-8 text-center text-[#7A705F]">
                      No words match your search query.
                    </div>
                  ) : (
                    displayedFrequencies.slice(0, 150).map((item, idx) => (
                      <div
                        key={item.word + idx}
                        className="grid grid-cols-12 px-4 py-2 hover:bg-[#FAF6EE] transition-colors items-center"
                      >
                        <div className="col-span-1 text-[11px] font-mono text-[#7A705F]">
                          {idx + 1}
                        </div>
                        <div className="col-span-6 font-medium text-[#221E18]">
                          {item.word}
                        </div>
                        <div className="col-span-2 text-right font-mono font-semibold text-[#221E18]">
                          {item.count}
                        </div>
                        <div className="col-span-3 flex items-center justify-end gap-2">
                          <div className="w-16 bg-[#EBE5D8] h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#DE6346] rounded-full"
                              style={{ width: `${Math.min(100, item.percentage * 10)}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] text-[#7A705F] w-10 text-right">
                            {item.percentage}%
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              {displayedFrequencies.length > 150 && (
                <p className="text-[11px] text-[#7A705F] text-center italic">
                  Showing top 150 of {displayedFrequencies.length} words. Use search to find specific terminology.
                </p>
              )}
            </div>
          )}

          {/* 3. DIALOGUE VS NARRATIVE */}
          {activeTab === 'dialogue' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-[8px] bg-white border border-[rgba(34,30,24,0.12)]">
                <h3 className="text-xs font-mono font-bold uppercase text-[#7A705F] mb-3">
                  Spoken Dialogue vs. Exposition Ratio
                </h3>

                {/* Stacked Ratio Bar */}
                <div className="w-full h-5 rounded-full overflow-hidden flex bg-[#EBE5D8] my-4 shadow-inner">
                  <div
                    className="bg-[#2E7D32] transition-all duration-500 flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ width: `${stats.dialogueNarrative.dialoguePercentage}%` }}
                    title={`Dialogue: ${stats.dialogueNarrative.dialoguePercentage}%`}
                  >
                    {stats.dialogueNarrative.dialoguePercentage > 15 && `${stats.dialogueNarrative.dialoguePercentage}%`}
                  </div>
                  <div
                    className="bg-[#DE6346] transition-all duration-500 flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ width: `${stats.dialogueNarrative.narrativePercentage}%` }}
                    title={`Narrative: ${stats.dialogueNarrative.narrativePercentage}%`}
                  >
                    {stats.dialogueNarrative.narrativePercentage > 15 && `${stats.dialogueNarrative.narrativePercentage}%`}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-3 rounded-[6px] bg-[#FAF6EE] border-l-3 border-[#2E7D32]">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2E7D32]">
                      <MessageSquare size={13} />
                      <span>Dialogue (Spoken Quotes)</span>
                    </div>
                    <div className="text-xl font-bold font-serif text-[#221E18] mt-1">
                      {stats.dialogueNarrative.dialogueWords.toLocaleString()} words
                    </div>
                    <span className="text-[11px] text-[#7A705F]">
                      {stats.dialogueNarrative.dialoguePercentage}% of prose | {stats.dialogueNarrative.quoteCount} spoken exchanges
                    </span>
                  </div>

                  <div className="p-3 rounded-[6px] bg-[#FAF6EE] border-l-3 border-[#DE6346]">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#DE6346]">
                      <BookOpen size={13} />
                      <span>Narrative Exposition</span>
                    </div>
                    <div className="text-xl font-bold font-serif text-[#221E18] mt-1">
                      {stats.dialogueNarrative.narrativeWords.toLocaleString()} words
                    </div>
                    <span className="text-[11px] text-[#7A705F]">
                      {stats.dialogueNarrative.narrativePercentage}% of prose | Action & introspection
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-[6px] bg-[#FAF6EE] border border-[rgba(34,30,24,0.08)] text-xs text-[#4A4031]">
                  <strong>Genre Guidance:</strong> Modern literary fiction and mysteries generally range between <strong>25% to 45% dialogue</strong>. Thrillers with high pacing may reach <strong>50%+</strong>, while descriptive speculative worldbuilding often sits between <strong>15% to 30%</strong>.
                </div>
              </div>
            </div>
          )}

          {/* 4. SENTENCE RHYTHM & VARIANCE */}
          {activeTab === 'sentences' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-[8px] bg-white border border-[rgba(34,30,24,0.12)]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-mono font-bold uppercase text-[#7A705F]">
                    Sentence Length Variance & Rhythm
                  </h3>
                  {stats.sentenceVariance.monotonyRisk && (
                    <span className="px-2 py-0.5 rounded text-[11px] bg-amber-100 text-amber-900 border border-amber-300 font-medium">
                      ⚠️ Monotony Warning
                    </span>
                  )}
                </div>

                {stats.sentenceVariance.monotonyNote && (
                  <div className="p-2.5 rounded-[6px] bg-amber-50 border border-amber-200 text-amber-900 text-xs mb-4">
                    {stats.sentenceVariance.monotonyNote}
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3">
                  <div className="p-3 rounded-[6px] bg-[#FAF6EE]">
                    <span className="text-[10px] font-mono uppercase text-[#7A705F]">Average Length</span>
                    <div className="text-lg font-bold font-serif text-[#221E18] mt-0.5">
                      {stats.sentenceVariance.avgSentenceLength} words
                    </div>
                    <span className="text-[10px] text-[#7A705F]">Std dev: ±{stats.sentenceVariance.stdDeviation}</span>
                  </div>

                  <div className="p-3 rounded-[6px] bg-[#FAF6EE]">
                    <span className="text-[10px] font-mono uppercase text-[#7A705F]">Shortest Sentence</span>
                    <div className="text-lg font-bold font-serif text-[#221E18] mt-0.5">
                      {stats.sentenceVariance.minSentenceLength} words
                    </div>
                    <span className="text-[10px] text-[#7A705F]">Punchy beat</span>
                  </div>

                  <div className="p-3 rounded-[6px] bg-[#FAF6EE]">
                    <span className="text-[10px] font-mono uppercase text-[#7A705F]">Longest Sentence</span>
                    <div className="text-lg font-bold font-serif text-[#221E18] mt-0.5">
                      {stats.sentenceVariance.maxSentenceLength} words
                    </div>
                    <span className="text-[10px] text-[#7A705F]">Complex clause</span>
                  </div>

                  <div className="p-3 rounded-[6px] bg-[#FAF6EE]">
                    <span className="text-[10px] font-mono uppercase text-[#7A705F]">Total Sentences</span>
                    <div className="text-lg font-bold font-serif text-[#221E18] mt-0.5">
                      {stats.sentenceVariance.totalSentences}
                    </div>
                    <span className="text-[10px] text-[#7A705F]">Full sample</span>
                  </div>
                </div>

                {/* Sentence Length Distribution Chart */}
                <h4 className="text-[11px] font-mono uppercase text-[#7A705F] mt-5 mb-2 font-semibold">
                  Distribution Histogram
                </h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-medium text-[#221E18]">Punchy & Direct (&lt; 10 words)</span>
                      <span className="font-mono text-[#7A705F]">
                        {stats.sentenceVariance.shortSentences} ({stats.sentenceVariance.totalSentences ? Math.round((stats.sentenceVariance.shortSentences / stats.sentenceVariance.totalSentences) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#EBE5D8] h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#2E7D32] h-full rounded-full"
                        style={{
                          width: `${stats.sentenceVariance.totalSentences ? (stats.sentenceVariance.shortSentences / stats.sentenceVariance.totalSentences) * 100 : 0}%`
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-medium text-[#221E18]">Standard Cadence (10 – 25 words)</span>
                      <span className="font-mono text-[#7A705F]">
                        {stats.sentenceVariance.mediumSentences} ({stats.sentenceVariance.totalSentences ? Math.round((stats.sentenceVariance.mediumSentences / stats.sentenceVariance.totalSentences) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#EBE5D8] h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#3B82F6] h-full rounded-full"
                        style={{
                          width: `${stats.sentenceVariance.totalSentences ? (stats.sentenceVariance.mediumSentences / stats.sentenceVariance.totalSentences) * 100 : 0}%`
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-medium text-[#221E18]">Flowing & Descriptive (26 – 40 words)</span>
                      <span className="font-mono text-[#7A705F]">
                        {stats.sentenceVariance.longSentences} ({stats.sentenceVariance.totalSentences ? Math.round((stats.sentenceVariance.longSentences / stats.sentenceVariance.totalSentences) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#EBE5D8] h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#F59E0B] h-full rounded-full"
                        style={{
                          width: `${stats.sentenceVariance.totalSentences ? (stats.sentenceVariance.longSentences / stats.sentenceVariance.totalSentences) * 100 : 0}%`
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-medium text-[#221E18]">Complex & Periodic (&gt; 40 words)</span>
                      <span className="font-mono text-[#7A705F]">
                        {stats.sentenceVariance.complexSentences} ({stats.sentenceVariance.totalSentences ? Math.round((stats.sentenceVariance.complexSentences / stats.sentenceVariance.totalSentences) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#EBE5D8] h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#DE6346] h-full rounded-full"
                        style={{
                          width: `${stats.sentenceVariance.totalSentences ? (stats.sentenceVariance.complexSentences / stats.sentenceVariance.totalSentences) * 100 : 0}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-5 py-3 border-t border-[rgba(34,30,24,0.12)] bg-[#F1EAD9] flex items-center justify-between text-xs shrink-0">
          <span className="text-[#7A705F]">
            Audited {stats.totalWords.toLocaleString()} words across {scope === 'scene' ? 'active scene' : `${allScenes.length} scenes`}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-[6px] bg-[#221E18] text-[#FAF6EE] font-medium hover:bg-black transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
