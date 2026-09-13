// Deep Linguistic & Text Statistics Utility for Threadline

export interface WordFrequencyItem {
  word: string;
  count: number;
  percentage: number;
}

export interface ReadabilityMetrics {
  fleschReadingEase: number;
  fleschGradeLevel: number;
  gunningFogIndex: number;
  colemanLiauIndex: number;
  automatedReadabilityIndex: number;
  readingEaseLabel: string;
  readingEaseDescription: string;
  gradeLevelLabel: string;
}

export interface DialogueNarrativeBreakdown {
  dialogueWords: number;
  narrativeWords: number;
  dialoguePercentage: number;
  narrativePercentage: number;
  quoteCount: number;
}

export interface SentenceVarianceMetrics {
  totalSentences: number;
  avgSentenceLength: number;
  minSentenceLength: number;
  maxSentenceLength: number;
  stdDeviation: number;
  shortSentences: number;   // < 10 words
  mediumSentences: number;  // 10 - 25 words
  longSentences: number;    // 26 - 40 words
  complexSentences: number; // > 40 words
  monotonyRisk: boolean;
  monotonyNote?: string;
}

export interface DeepTextStatistics {
  totalWords: number;
  totalCharacters: number;
  totalCharactersNoSpaces: number;
  totalParagraphs: number;
  uniqueWords: number;
  lexicalDiversity: number; // unique / total
  wordFrequencies: WordFrequencyItem[];
  filteredFrequencies: WordFrequencyItem[]; // excluding stop words
  readability: ReadabilityMetrics;
  dialogueNarrative: DialogueNarrativeBreakdown;
  sentenceVariance: SentenceVarianceMetrics;
  estimatedReadingMinutes: number;
  estimatedSpeakingMinutes: number;
}

// Common English stop words
export const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'can\'t', 'cannot', 'could', 'couldn\'t',
  'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during',
  'each', 'few', 'for', 'from', 'further',
  'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s',
  'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself',
  'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my', 'myself',
  'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
  'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such',
  'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 'very',
  'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t',
  'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves'
]);

// Syllable counting heuristic
export function countSyllables(word: string): number {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!clean) return 0;
  if (clean.length <= 3) return 1;

  // Replace common suffixes that affect syllable count
  const normalized = clean
    .replace(/(?:[^laeiouy]|ed|es|e)$/, '')
    .replace(/^y/, '');

  const matches = normalized.match(/[aeiouy]{1,2}/g);
  return matches ? Math.max(1, matches.length) : 1;
}

export function analyzeDeepStatistics(text: string): DeepTextStatistics {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      totalWords: 0,
      totalCharacters: 0,
      totalCharactersNoSpaces: 0,
      totalParagraphs: 0,
      uniqueWords: 0,
      lexicalDiversity: 0,
      wordFrequencies: [],
      filteredFrequencies: [],
      readability: {
        fleschReadingEase: 100,
        fleschGradeLevel: 0,
        gunningFogIndex: 0,
        colemanLiauIndex: 0,
        automatedReadabilityIndex: 0,
        readingEaseLabel: 'Very Easy',
        readingEaseDescription: 'Effortless to read',
        gradeLevelLabel: 'Grade 0'
      },
      dialogueNarrative: {
        dialogueWords: 0,
        narrativeWords: 0,
        dialoguePercentage: 0,
        narrativePercentage: 0,
        quoteCount: 0
      },
      sentenceVariance: {
        totalSentences: 0,
        avgSentenceLength: 0,
        minSentenceLength: 0,
        maxSentenceLength: 0,
        stdDeviation: 0,
        shortSentences: 0,
        mediumSentences: 0,
        longSentences: 0,
        complexSentences: 0,
        monotonyRisk: false
      },
      estimatedReadingMinutes: 0,
      estimatedSpeakingMinutes: 0
    };
  }

  // Tokenize words
  const rawWords: string[] = trimmed.match(/[A-Za-z0-9'’]+(?:-[A-Za-z0-9'’]+)*/g) || [];
  const totalWords = rawWords.length;
  const totalCharacters = trimmed.length;
  const totalCharactersNoSpaces = trimmed.replace(/\s+/g, '').length;
  const paragraphs = trimmed.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const totalParagraphs = paragraphs.length;

  // Word frequencies
  const freqMap = new Map<string, number>();
  let totalSyllables = 0;
  let complexWordCount = 0; // 3+ syllables

  rawWords.forEach((w) => {
    const norm = w.toLowerCase().replace(/^[’']+|[’']+$/g, '');
    if (!norm) return;
    freqMap.set(norm, (freqMap.get(norm) || 0) + 1);

    const syl = countSyllables(norm);
    totalSyllables += syl;
    if (syl >= 3) {
      complexWordCount++;
    }
  });

  const uniqueWords = freqMap.size;
  const lexicalDiversity = totalWords > 0 ? Number((uniqueWords / totalWords).toFixed(3)) : 0;

  const allFrequencies: WordFrequencyItem[] = Array.from(freqMap.entries())
    .map(([word, count]) => ({
      word,
      count,
      percentage: Number(((count / totalWords) * 100).toFixed(1))
    }))
    .sort((a, b) => b.count - a.count);

  const filteredFrequencies: WordFrequencyItem[] = allFrequencies.filter(
    item => !STOP_WORDS.has(item.word) && item.word.length > 1
  );

  // Sentences
  const sentenceMatches = trimmed.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g) || [];
  const validSentences = sentenceMatches.map(s => s.trim()).filter(Boolean);
  const totalSentences = Math.max(1, validSentences.length);

  const sentenceLengths: number[] = validSentences.map((s) => {
    const words = s.match(/[A-Za-z0-9'’]+/g);
    return words ? words.length : 0;
  }).filter(l => l > 0);

  const avgSentenceLength = totalWords > 0 && sentenceLengths.length > 0
    ? Number((totalWords / sentenceLengths.length).toFixed(1))
    : 0;

  const minSentenceLength = sentenceLengths.length > 0 ? Math.min(...sentenceLengths) : 0;
  const maxSentenceLength = sentenceLengths.length > 0 ? Math.max(...sentenceLengths) : 0;

  // Standard deviation
  let varianceSum = 0;
  sentenceLengths.forEach(len => {
    varianceSum += Math.pow(len - avgSentenceLength, 2);
  });
  const stdDeviation = sentenceLengths.length > 0
    ? Number(Math.sqrt(varianceSum / sentenceLengths.length).toFixed(1))
    : 0;

  let shortSentences = 0;
  let mediumSentences = 0;
  let longSentences = 0;
  let complexSentences = 0;

  sentenceLengths.forEach(len => {
    if (len < 10) shortSentences++;
    else if (len <= 25) mediumSentences++;
    else if (len <= 40) longSentences++;
    else complexSentences++;
  });

  // Monotony check: 3+ consecutive sentences within 2 words of length
  let consecutiveSimilar = 0;
  let monotonyRisk = false;
  for (let i = 1; i < sentenceLengths.length; i++) {
    if (Math.abs(sentenceLengths[i] - sentenceLengths[i - 1]) <= 2) {
      consecutiveSimilar++;
      if (consecutiveSimilar >= 3) {
        monotonyRisk = true;
        break;
      }
    } else {
      consecutiveSimilar = 0;
    }
  }

  // Dialogue vs Narrative parsing
  // Matches "...", “...”, or '...'
  const dialogueRegex = /(["“][^"”]*["”]|'[^']*')/g;
  let dialogueWordCount = 0;
  let quoteCount = 0;
  let match: RegExpExecArray | null;

  while ((match = dialogueRegex.exec(trimmed)) !== null) {
    quoteCount++;
    const inside = match[0].slice(1, -1);
    const dWords = inside.match(/[A-Za-z0-9'’]+/g);
    if (dWords) {
      dialogueWordCount += dWords.length;
    }
  }

  const dialogueWords = Math.min(totalWords, dialogueWordCount);
  const narrativeWords = Math.max(0, totalWords - dialogueWords);
  const dialoguePercentage = totalWords > 0 ? Number(((dialogueWords / totalWords) * 100).toFixed(1)) : 0;
  const narrativePercentage = totalWords > 0 ? Number(((narrativeWords / totalWords) * 100).toFixed(1)) : 0;

  // Readability Formulas
  const asl = avgSentenceLength; // Average Sentence Length
  const asw = totalWords > 0 ? totalSyllables / totalWords : 1.2; // Average Syllables per Word

  // Flesch Reading Ease: 206.835 - 1.015(ASL) - 84.6(ASW)
  let flesch = 206.835 - (1.015 * asl) - (84.6 * asw);
  flesch = Math.max(0, Math.min(100, Number(flesch.toFixed(1))));

  let readingEaseLabel = 'Standard';
  let readingEaseDescription = 'Plain English; understandable by 13 to 15-year-olds.';
  if (flesch >= 90) {
    readingEaseLabel = 'Very Easy';
    readingEaseDescription = 'Easily understood by an average 11-year-old.';
  } else if (flesch >= 80) {
    readingEaseLabel = 'Easy';
    readingEaseDescription = 'Conversational English for 12-year-olds.';
  } else if (flesch >= 70) {
    readingEaseLabel = 'Fairly Easy';
    readingEaseDescription = 'Comfortable reading for 7th graders.';
  } else if (flesch >= 60) {
    readingEaseLabel = 'Standard';
    readingEaseDescription = 'Accessible to 8th and 9th grade readers.';
  } else if (flesch >= 50) {
    readingEaseLabel = 'Fairly Difficult';
    readingEaseDescription = 'High school level prose.';
  } else if (flesch >= 30) {
    readingEaseLabel = 'Difficult';
    readingEaseDescription = 'College-level vocabulary and syntax.';
  } else {
    readingEaseLabel = 'Very Confusing';
    readingEaseDescription = 'Dense academic or specialized literature.';
  }

  // Flesch-Kincaid Grade Level: (0.39 * ASL) + (11.8 * ASW) - 15.59
  let fkGrade = (0.39 * asl) + (11.8 * asw) - 15.59;
  fkGrade = Math.max(0, Number(fkGrade.toFixed(1)));
  const gradeLevelLabel = `Grade ${Math.round(fkGrade)}`;

  // Gunning Fog Index: 0.4 * (ASL + 100 * (complexWords / totalWords))
  const complexPct = totalWords > 0 ? (complexWordCount / totalWords) * 100 : 0;
  let gunningFog = 0.4 * (asl + complexPct);
  gunningFog = Math.max(0, Number(gunningFog.toFixed(1)));

  // Coleman-Liau: 0.0588 * L - 0.296 * S - 15.8
  // L = avg letters per 100 words, S = avg sentences per 100 words
  const letters = (trimmed.match(/[A-Za-z]/g) || []).length;
  const L = totalWords > 0 ? (letters / totalWords) * 100 : 0;
  const S = totalWords > 0 ? (totalSentences / totalWords) * 100 : 0;
  let colemanLiau = (0.0588 * L) - (0.296 * S) - 15.8;
  colemanLiau = Math.max(0, Number(colemanLiau.toFixed(1)));

  // Automated Readability Index (ARI): 4.71 * (characters/words) + 0.5 * (words/sentences) - 21.43
  const cpw = totalWords > 0 ? totalCharactersNoSpaces / totalWords : 4;
  let ari = (4.71 * cpw) + (0.5 * asl) - 21.43;
  ari = Math.max(0, Number(ari.toFixed(1)));

  return {
    totalWords,
    totalCharacters,
    totalCharactersNoSpaces,
    totalParagraphs,
    uniqueWords,
    lexicalDiversity,
    wordFrequencies: allFrequencies,
    filteredFrequencies,
    readability: {
      fleschReadingEase: flesch,
      fleschGradeLevel: fkGrade,
      gunningFogIndex: gunningFog,
      colemanLiauIndex: colemanLiau,
      automatedReadabilityIndex: ari,
      readingEaseLabel,
      readingEaseDescription,
      gradeLevelLabel
    },
    dialogueNarrative: {
      dialogueWords,
      narrativeWords,
      dialoguePercentage,
      narrativePercentage,
      quoteCount
    },
    sentenceVariance: {
      totalSentences,
      avgSentenceLength,
      minSentenceLength,
      maxSentenceLength,
      stdDeviation,
      shortSentences,
      mediumSentences,
      longSentences,
      complexSentences,
      monotonyRisk,
      monotonyNote: monotonyRisk
        ? 'Detected clusters of 3+ consecutive sentences with nearly identical length. Vary rhythm for punchier flow.'
        : undefined
    },
    estimatedReadingMinutes: Math.max(1, Math.round(totalWords / 225)),
    estimatedSpeakingMinutes: Math.max(1, Math.round(totalWords / 130))
  };
}
