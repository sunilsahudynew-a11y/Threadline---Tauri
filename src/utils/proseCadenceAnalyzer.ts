// Prose Cadence, Tone & Narrative Rhythm Analyzer
// Computes ProWritingAid-style literary craft metrics

export interface CadenceMetrics {
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  averageSentenceLength: number;
  sentenceStandardDeviation: number;
  rhythmVerdict: 'Dynamic & Varied' | 'Balanced Pacing' | 'Staccato / Abrupt' | 'Monotonous / Low Variety' | 'Dense & Compound';
  cadenceBreakdown: {
    short: number; // <= 8 words
    medium: number; // 9 - 20 words
    long: number; // 21 - 35 words
    veryLong: number; // >= 36 words
  };
  monotonousRuns: Array<{
    startIndex: number;
    sentenceCount: number;
    avgLength: number;
    sampleText: string;
  }>;
  dialogueWords: number;
  expositionWords: number;
  dialoguePercentage: number;
  sensoryScores: {
    sight: number;
    sound: number;
    touch: number;
    smell: number;
    taste: number;
    totalSensoryAnchorWords: number;
    sensoryDensityPer100Words: number;
  };
  filterWords: Array<{ word: string; count: number; sampleSentences: string[] }>;
  filterWordsTotal: number;
  glueWordsRatio: number; // % of glue words
  readingEase: number; // 0-100 Flesch Reading Ease
  gradeLevel: number; // US school grade
  readingTimeMinutes: number;
}

const GLUE_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'all', 'also', 'am', 'an', 'and', 'any', 'are', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'could', 'did', 'do', 'does', 'doing', 'down', 'during',
  'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here',
  'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its',
  'itself', 'just', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off',
  'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
  'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while',
  'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves'
]);

const SENSORY_DICTIONARY = {
  sight: [
    'gleam', 'glint', 'flicker', 'shadow', 'silhouette', 'pale', 'crimson', 'glare', 'dull', 'shimmer',
    'blurred', 'luster', 'amber', 'pitch', 'dim', 'haze', 'scarlet', 'gilded', 'tarnished', 'murky',
    'opaque', 'translucent', 'luminescent', 'radiant', 'gleamed', 'shadowed', 'shimmered', 'stared', 'gazed'
  ],
  sound: [
    'whisper', 'clang', 'murmur', 'creak', 'rumble', 'shriek', 'rustle', 'snap', 'hum', 'silence',
    'echo', 'deafening', 'hiss', 'roar', 'clatter', 'groan', 'gasp', 'crunch', 'drone', 'screech',
    'rattle', 'whistle', 'clink', 'splutter', 'whispered', 'shrieked', 'echoed', 'rumbled', 'clanged'
  ],
  touch: [
    'cold', 'sharp', 'slick', 'rough', 'damp', 'frozen', 'numb', 'bristling', 'clammy', 'searing',
    'gritty', 'velvet', 'coarse', 'shudder', 'prickle', 'burning', 'frigid', 'slimy', 'scratched',
    'parched', 'brittle', 'throbbing', 'trembling', 'sting', 'feverish', 'chilled', 'greasy', 'abrasive'
  ],
  smell: [
    'brine', 'sulfur', 'smoke', 'iron', 'rot', 'pine', 'musk', 'perfume', 'stale', 'incense',
    'copper', 'ozone', 'pungent', 'musty', 'dampness', 'decay', 'tar', 'paraffin', 'charcoal',
    'rank', 'fragrant', 'acrid', 'scented', 'reeking', 'aroma', 'foul', 'sour', 'smoldering'
  ],
  taste: [
    'bitter', 'metallic', 'sweet', 'sour', 'salty', 'acid', 'ash', 'bile', 'vinegar', 'stinging',
    'tangy', 'sweetness', 'briny', 'peppery', 'burnt', 'soot', 'copper', 'tart', 'cloying'
  ]
};

const FILTER_VERBS = [
  'saw', 'heard', 'felt', 'noticed', 'wondered', 'watched', 'smelled', 'seemed',
  'appeared', 'observed', 'realized', 'looked', 'tasted', 'listened', 'sensed'
];

export function analyzeProseCadence(text: string): CadenceMetrics {
  const clean = text.trim();
  if (!clean) {
    return {
      wordCount: 0,
      sentenceCount: 0,
      paragraphCount: 0,
      averageSentenceLength: 0,
      sentenceStandardDeviation: 0,
      rhythmVerdict: 'Balanced Pacing',
      cadenceBreakdown: { short: 0, medium: 0, long: 0, veryLong: 0 },
      monotonousRuns: [],
      dialogueWords: 0,
      expositionWords: 0,
      dialoguePercentage: 0,
      sensoryScores: { sight: 0, sound: 0, touch: 0, smell: 0, taste: 0, totalSensoryAnchorWords: 0, sensoryDensityPer100Words: 0 },
      filterWords: [],
      filterWordsTotal: 0,
      glueWordsRatio: 0,
      readingEase: 70,
      gradeLevel: 6,
      readingTimeMinutes: 0
    };
  }

  // 1. Paragraphs
  const paragraphs = clean.split(/\n+/).filter(p => p.trim().length > 0);
  const paragraphCount = Math.max(1, paragraphs.length);

  // 2. Sentences (split by sentence-ending punctuation)
  const rawSentences = clean
    .replace(/([.?!])\s*(?=[A-Z0-9“"'\n])/g, '$1|THREADLINE_SENT_SEP|')
    .split('|THREADLINE_SENT_SEP|')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const sentenceCount = Math.max(1, rawSentences.length);

  // 3. Words & Sentence Lengths
  const sentenceLengths: number[] = [];
  const words: string[] = [];
  let glueWordCount = 0;

  rawSentences.forEach(s => {
    const sWords = s
      .toLowerCase()
      .replace(/[^\w\s'-]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 0);
    const count = sWords.length;
    sentenceLengths.push(count);

    sWords.forEach(w => {
      words.push(w);
      if (GLUE_WORDS.has(w)) {
        glueWordCount++;
      }
    });
  });

  const wordCount = Math.max(1, words.length);
  const averageSentenceLength = parseFloat((wordCount / sentenceCount).toFixed(1));

  // Variance & Standard Deviation
  const variance = sentenceLengths.reduce((acc, len) => acc + Math.pow(len - averageSentenceLength, 2), 0) / sentenceCount;
  const sentenceStandardDeviation = parseFloat(Math.sqrt(variance).toFixed(1));

  // Cadence breakdown
  const cadenceBreakdown = {
    short: 0,
    medium: 0,
    long: 0,
    veryLong: 0
  };

  sentenceLengths.forEach(len => {
    if (len <= 8) cadenceBreakdown.short++;
    else if (len <= 20) cadenceBreakdown.medium++;
    else if (len <= 35) cadenceBreakdown.long++;
    else cadenceBreakdown.veryLong++;
  });

  // Rhythm Verdict
  let rhythmVerdict: CadenceMetrics['rhythmVerdict'] = 'Balanced Pacing';
  if (sentenceStandardDeviation >= 8.5 && cadenceBreakdown.short > 0 && (cadenceBreakdown.long > 0 || cadenceBreakdown.veryLong > 0)) {
    rhythmVerdict = 'Dynamic & Varied';
  } else if (sentenceStandardDeviation < 3.5 && sentenceCount > 5) {
    rhythmVerdict = 'Monotonous / Low Variety';
  } else if (averageSentenceLength <= 9) {
    rhythmVerdict = 'Staccato / Abrupt';
  } else if (averageSentenceLength >= 26) {
    rhythmVerdict = 'Dense & Compound';
  }

  // Monotonous runs (3+ sentences with length within +/- 2 words)
  const monotonousRuns: CadenceMetrics['monotonousRuns'] = [];
  let currentRun: number[] = [];
  let runStartIndex = 0;

  for (let i = 0; i < sentenceLengths.length; i++) {
    const len = sentenceLengths[i];
    if (currentRun.length === 0) {
      currentRun.push(len);
      runStartIndex = i;
    } else {
      const avg = currentRun.reduce((a, b) => a + b, 0) / currentRun.length;
      if (Math.abs(len - avg) <= 2.5) {
        currentRun.push(len);
      } else {
        if (currentRun.length >= 3) {
          monotonousRuns.push({
            startIndex: runStartIndex,
            sentenceCount: currentRun.length,
            avgLength: Math.round(avg),
            sampleText: rawSentences.slice(runStartIndex, runStartIndex + Math.min(3, currentRun.length)).join(' ')
          });
        }
        currentRun = [len];
        runStartIndex = i;
      }
    }
  }
  if (currentRun.length >= 3) {
    const avg = currentRun.reduce((a, b) => a + b, 0) / currentRun.length;
    monotonousRuns.push({
      startIndex: runStartIndex,
      sentenceCount: currentRun.length,
      avgLength: Math.round(avg),
      sampleText: rawSentences.slice(runStartIndex, runStartIndex + Math.min(3, currentRun.length)).join(' ')
    });
  }

  // 4. Dialogue vs Exposition
  let dialogueWords = 0;
  const dialogueMatches = (clean.match(/(?:“[^”]+”|"[^"]+"|'[^']+')/g) || []) as string[];
  dialogueMatches.forEach((quote: string) => {
    const quoteWords = quote.replace(/[^\w\s]/g, ' ').trim().split(/\s+/).filter(Boolean);
    dialogueWords += quoteWords.length;
  });
  const expositionWords = Math.max(0, wordCount - dialogueWords);
  const dialoguePercentage = Math.min(100, Math.round((dialogueWords / wordCount) * 100));

  // 5. Sensory Scores
  const sensoryScores = {
    sight: 0,
    sound: 0,
    touch: 0,
    smell: 0,
    taste: 0,
    totalSensoryAnchorWords: 0,
    sensoryDensityPer100Words: 0
  };

  words.forEach(w => {
    if (SENSORY_DICTIONARY.sight.includes(w)) sensoryScores.sight++;
    if (SENSORY_DICTIONARY.sound.includes(w)) sensoryScores.sound++;
    if (SENSORY_DICTIONARY.touch.includes(w)) sensoryScores.touch++;
    if (SENSORY_DICTIONARY.smell.includes(w)) sensoryScores.smell++;
    if (SENSORY_DICTIONARY.taste.includes(w)) sensoryScores.taste++;
  });
  sensoryScores.totalSensoryAnchorWords =
    sensoryScores.sight + sensoryScores.sound + sensoryScores.touch + sensoryScores.smell + sensoryScores.taste;
  sensoryScores.sensoryDensityPer100Words = parseFloat(((sensoryScores.totalSensoryAnchorWords / wordCount) * 100).toFixed(1));

  // 6. Filter Words (Sensory distancing)
  const filterMap = new Map<string, { count: number; samples: string[] }>();
  FILTER_VERBS.forEach(verb => {
    const regex = new RegExp(`\\b${verb}\\b`, 'gi');
    let matchCount = 0;
    const samples: string[] = [];

    rawSentences.forEach(s => {
      if (regex.test(s)) {
        matchCount++;
        if (samples.length < 2) {
          samples.push(s.length > 80 ? s.slice(0, 80) + '...' : s);
        }
      }
    });

    if (matchCount > 0) {
      filterMap.set(verb, { count: matchCount, samples });
    }
  });

  const filterWords = Array.from(filterMap.entries()).map(([word, data]) => ({
    word,
    count: data.count,
    sampleSentences: data.samples
  })).sort((a, b) => b.count - a.count);

  const filterWordsTotal = filterWords.reduce((sum, item) => sum + item.count, 0);

  // 7. Glue Words Ratio
  const glueWordsRatio = Math.round((glueWordCount / wordCount) * 100);

  // 8. Flesch Readability Calculations
  // Estimate syllables
  let totalSyllables = 0;
  words.forEach(w => {
    totalSyllables += countSyllables(w);
  });
  const syllablesPerWord = totalSyllables / wordCount;
  const wordsPerSentence = averageSentenceLength;

  // Flesch Reading Ease = 206.835 - (1.015 * ASL) - (84.6 * ASW)
  const readingEaseRaw = 206.835 - (1.015 * wordsPerSentence) - (84.6 * syllablesPerWord);
  const readingEase = Math.max(0, Math.min(100, Math.round(readingEaseRaw)));

  // Flesch-Kincaid Grade Level = (0.39 * ASL) + (11.8 * ASW) - 15.59
  const gradeLevelRaw = (0.39 * wordsPerSentence) + (11.8 * syllablesPerWord) - 15.59;
  const gradeLevel = Math.max(1, Math.min(18, Math.round(gradeLevelRaw)));

  // 9. Reading Time (avg 220 words per minute)
  const readingTimeMinutes = Math.max(1, Math.round((wordCount / 220) * 10) / 10);

  return {
    wordCount,
    sentenceCount,
    paragraphCount,
    averageSentenceLength,
    sentenceStandardDeviation,
    rhythmVerdict,
    cadenceBreakdown,
    monotonousRuns,
    dialogueWords,
    expositionWords,
    dialoguePercentage,
    sensoryScores,
    filterWords,
    filterWordsTotal,
    glueWordsRatio,
    readingEase,
    gradeLevel,
    readingTimeMinutes
  };
}

function countSyllables(word: string): number {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (clean.length <= 3) return 1;
  const formatted = clean
    .replace(/(?:[^laeiouy]|ed|es|e)$/, '')
    .replace(/^y/, '');
  const matches = formatted.match(/[aeiouy]{1,2}/g);
  return matches ? Math.max(1, matches.length) : 1;
}
