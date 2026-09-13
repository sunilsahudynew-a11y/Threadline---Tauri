import { Scene, Entity, Project, ContinuityIssue, ContinuityIssueCategory } from '../types';

// ==========================================
// 1. SYLLABLE & READABILITY COMPUTATIONS
// ==========================================

function countSyllablesInWord(word: string): number {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (clean.length <= 3) return 1;
  
  // Basic English syllable heuristic
  let count = 0;
  const vowels = 'aeiouy';
  let prevIsVowel = false;

  for (let i = 0; i < clean.length; i++) {
    const isVowel = vowels.includes(clean[i]);
    if (isVowel && !prevIsVowel) {
      count++;
    }
    prevIsVowel = isVowel;
  }

  // Adjust for silent e at end
  if (clean.endsWith('e') && !clean.endsWith('le') && count > 1) {
    count--;
  }
  // Adjust for -ed if not -ded/-ted
  if (clean.endsWith('ed') && !clean.endsWith('ded') && !clean.endsWith('ted') && count > 1) {
    count--;
  }

  return Math.max(1, count);
}

export interface ReadabilityMetrics {
  totalWords: number;
  totalSentences: number;
  totalSyllables: number;
  avgSentenceLength: number;
  avgSyllablesPerWord: number;
  fleschReadingEase: number;
  readingEaseLabel: string;
  fleschKincaidGrade: number;
  gradeLevelLabel: string;
  sentenceVarieties: {
    shortPct: number;    // < 10 words
    mediumPct: number;   // 10-25 words
    longPct: number;     // > 25 words
    rhythmEvaluation: 'Dynamic' | 'Balanced' | 'Monotonous' | 'Staccato';
  };
}

export function calculateReadabilityMetrics(text: string): ReadabilityMetrics {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const totalWords = words.length;

  if (totalWords === 0) {
    return {
      totalWords: 0,
      totalSentences: 0,
      totalSyllables: 0,
      avgSentenceLength: 0,
      avgSyllablesPerWord: 0,
      fleschReadingEase: 100,
      readingEaseLabel: 'Empty Manuscript',
      fleschKincaidGrade: 0,
      gradeLevelLabel: 'N/A',
      sentenceVarieties: {
        shortPct: 0,
        mediumPct: 0,
        longPct: 0,
        rhythmEvaluation: 'Balanced'
      }
    };
  }

  // Sentence split on punctuation . ! ? followed by space or newline
  const sentences = text
    .split(/(?<=[.!?])\s+|\n{2,}/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2 && /[a-zA-Z]/.test(s));
  const totalSentences = Math.max(1, sentences.length);

  let totalSyllables = 0;
  for (const w of words) {
    totalSyllables += countSyllablesInWord(w);
  }

  const avgSentenceLength = totalWords / totalSentences;
  const avgSyllablesPerWord = totalSyllables / totalWords;

  // Flesch Reading Ease Formula: 206.835 - (1.015 * ASL) - (84.6 * ASW)
  let fleschReadingEase = Math.round(
    206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord
  );
  fleschReadingEase = Math.max(0, Math.min(100, fleschReadingEase));

  let readingEaseLabel = 'Standard Fiction';
  if (fleschReadingEase >= 90) readingEaseLabel = 'Very Easy (5th Grade)';
  else if (fleschReadingEase >= 80) readingEaseLabel = 'Easy (6th Grade)';
  else if (fleschReadingEase >= 70) readingEaseLabel = 'Fairly Easy (7th Grade)';
  else if (fleschReadingEase >= 60) readingEaseLabel = 'Standard Commercial Fiction';
  else if (fleschReadingEase >= 50) readingEaseLabel = 'Fairly Difficult (10th-12th Grade)';
  else if (fleschReadingEase >= 30) readingEaseLabel = 'Difficult (College Level)';
  else readingEaseLabel = 'Very Difficult (Dense/Academic)';

  // Flesch-Kincaid Grade Level Formula: (0.39 * ASL) + (11.8 * ASW) - 15.59
  let fleschKincaidGrade = Math.round((0.39 * avgSentenceLength + 11.8 * avgSyllablesPerWord - 15.59) * 10) / 10;
  fleschKincaidGrade = Math.max(1, fleschKincaidGrade);

  let gradeLevelLabel = `Grade ${fleschKincaidGrade}`;
  if (fleschKincaidGrade <= 6) gradeLevelLabel = `Grade ${fleschKincaidGrade} (Middle Grade)`;
  else if (fleschKincaidGrade <= 9) gradeLevelLabel = `Grade ${fleschKincaidGrade} (YA / Commercial)`;
  else if (fleschKincaidGrade <= 12) gradeLevelLabel = `Grade ${fleschKincaidGrade} (Literary / High)`;
  else gradeLevelLabel = `Grade ${fleschKincaidGrade}+ (Academic / Complex)`;

  // Sentence variety breakdown
  let shortCount = 0;
  let mediumCount = 0;
  let longCount = 0;

  for (const s of sentences) {
    const sWords = s.split(/\s+/).filter(Boolean).length;
    if (sWords < 10) shortCount++;
    else if (sWords <= 25) mediumCount++;
    else longCount++;
  }

  const shortPct = Math.round((shortCount / totalSentences) * 100);
  const mediumPct = Math.round((mediumCount / totalSentences) * 100);
  const longPct = Math.round((longCount / totalSentences) * 100);

  let rhythmEvaluation: 'Dynamic' | 'Balanced' | 'Monotonous' | 'Staccato' = 'Balanced';
  if (shortPct > 65) rhythmEvaluation = 'Staccato';
  else if (shortPct >= 20 && mediumPct >= 35 && longPct >= 15) rhythmEvaluation = 'Dynamic';
  else if (mediumPct > 70 || longPct > 60) rhythmEvaluation = 'Monotonous';

  return {
    totalWords,
    totalSentences,
    totalSyllables,
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 100) / 100,
    fleschReadingEase,
    readingEaseLabel,
    fleschKincaidGrade,
    gradeLevelLabel,
    sentenceVarieties: {
      shortPct,
      mediumPct,
      longPct,
      rhythmEvaluation
    }
  };
}

// ==========================================
// 2. PASSIVE VOICE & LINGUISTIC STYLE
// ==========================================

export interface PassiveVoiceMatch {
  phrase: string;
  sentence: string;
  sceneId: string;
  sceneTitle: string;
  index: number;
}

const PASSIVE_REGEX = /\b(is|am|are|was|were|be|been|being)\s+([a-z]+ed|[a-z]+en|lost|found|built|given|taken|made|done|seen|heard|kept|told|known|set|cut|run|read|put|hit|held|brought|drawn|paid|met|caught|chosen|driven|eaten|fallen|felt|forgotten|forgiven|frozen|grown|hidden|laid|left|lit|proven|risen|shaken|shown|shut|slept|spent|spoken|stolen|struck|swept|sworn|taught|torn|thrown|understood|worn|written)\b/gi;

export function detectPassiveVoiceInScenes(scenes: Scene[]): {
  matches: PassiveVoiceMatch[];
  totalPassiveCount: number;
  passivePerScene: Record<string, number>;
} {
  const matches: PassiveVoiceMatch[] = [];
  const passivePerScene: Record<string, number> = {};

  for (const scene of scenes) {
    const text = scene.proseContent || '';
    if (!text.trim()) continue;

    let sceneCount = 0;
    const sentences = text.split(/(?<=[.!?])\s+|\n+/).filter((s) => s.trim().length > 0);

    for (let i = 0; i < sentences.length; i++) {
      const sent = sentences[i];
      let match: RegExpExecArray | null;
      PASSIVE_REGEX.lastIndex = 0;
      while ((match = PASSIVE_REGEX.exec(sent)) !== null) {
        sceneCount++;
        if (matches.length < 30) {
          matches.push({
            phrase: match[0],
            sentence: sent.trim(),
            sceneId: scene.id,
            sceneTitle: scene.title,
            index: i
          });
        }
      }
    }

    passivePerScene[scene.id] = sceneCount;
  }

  const totalPassiveCount = Object.values(passivePerScene).reduce((acc, c) => acc + c, 0);
  return { matches, totalPassiveCount, passivePerScene };
}

// ==========================================
// 3. WEAK DIALOGUE TAGS & ADVERBS
// ==========================================

export interface WeakAdverbMatch {
  phrase: string;
  sceneId: string;
  sceneTitle: string;
  excerpt: string;
}

const WEAK_DIALOGUE_TAG_REGEX = /"(?:[^"]*)"\s+(?:he|she|they|[A-Z][a-z]+)\s+(said|whispered|muttered|replied|asked|answered|screamed)\s+([a-z]+ly)\b/gi;

export function detectWeakDialogueTags(scenes: Scene[]): WeakAdverbMatch[] {
  const matches: WeakAdverbMatch[] = [];

  for (const scene of scenes) {
    const text = scene.proseContent || '';
    let match: RegExpExecArray | null;
    WEAK_DIALOGUE_TAG_REGEX.lastIndex = 0;

    while ((match = WEAK_DIALOGUE_TAG_REGEX.exec(text)) !== null) {
      if (matches.length < 20) {
        matches.push({
          phrase: `${match[1]} ${match[2]}`,
          sceneId: scene.id,
          sceneTitle: scene.title,
          excerpt: match[0].length > 100 ? '...' + match[0].slice(-90) : match[0]
        });
      }
    }
  }

  return matches;
}

// ==========================================
// 4. SCREENPLAY INDUSTRY STANDARDS
// ==========================================

export interface ScreenplayDiagnostics {
  estimatedPageCount: number;
  estimatedRuntimeMinutes: number;
  actionWordCount: number;
  dialogueWordCount: number;
  dialoguePct: number;
  actionPct: number;
  characterDialogueShares: {
    character: string;
    wordCount: number;
    speechCount: number;
    percentage: number;
  }[];
  monologueWarnings: {
    character: string;
    wordCount: number;
    excerpt: string;
    sceneTitle: string;
    sceneId: string;
  }[];
  actionBloatWarnings: {
    sceneTitle: string;
    sceneId: string;
    wordCount: number;
    lineCount: number;
    excerpt: string;
  }[];
  sluglineWarnings: {
    sceneTitle: string;
    sceneId: string;
    slugline: string;
    reason: string;
  }[];
}

export function calculateScreenplayDiagnostics(scenes: Scene[]): ScreenplayDiagnostics {
  let totalWords = 0;
  let dialogueWordCount = 0;
  let actionWordCount = 0;
  let totalScriptLines = 0;

  const characterMap: Record<string, { wordCount: number; speechCount: number }> = {};
  const monologueWarnings: ScreenplayDiagnostics['monologueWarnings'] = [];
  const actionBloatWarnings: ScreenplayDiagnostics['actionBloatWarnings'] = [];
  const sluglineWarnings: ScreenplayDiagnostics['sluglineWarnings'] = [];

  for (const scene of scenes) {
    const text = scene.proseContent || '';
    const lines = text.split('\n');
    totalScriptLines += lines.length;

    // Check slugline integrity on scene header
    const sceneLines = lines.map((l) => l.trim()).filter(Boolean);
    const firstLine = sceneLines[0] || '';
    const isHeading = /^(INT\.|EXT\.|INT\.\/EXT\.|EXT\.\/INT\.)/i.test(firstLine);

    if (sceneLines.length > 0 && !isHeading) {
      sluglineWarnings.push({
        sceneTitle: scene.title,
        sceneId: scene.id,
        slugline: firstLine.slice(0, 45) || 'None',
        reason: 'Missing industry standard INT. or EXT. slugline prefix'
      });
    } else if (isHeading) {
      // Check if time of day is indicated (e.g. - DAY, - NIGHT)
      if (!/-\s*(DAY|NIGHT|DUSK|DAWN|EVENING|AFTERNOON|CONTINUOUS|LATER|MOMENTS LATER|SAME TIME)/i.test(firstLine)) {
        sluglineWarnings.push({
          sceneTitle: scene.title,
          sceneId: scene.id,
          slugline: firstLine,
          reason: 'Missing lighting/time-of-day indicator (e.g., - DAY or - NIGHT)'
        });
      }
    }

    let currentSpeaker: string | null = null;
    let currentSpeechWords: string[] = [];
    let currentActionParagraph: string[] = [];

    const flushActionParagraph = () => {
      if (currentActionParagraph.length > 0) {
        const fullAction = currentActionParagraph.join(' ');
        const aWords = fullAction.split(/\s+/).filter(Boolean);
        actionWordCount += aWords.length;
        totalWords += aWords.length;

        // Industry standard: Action blocks > 5 lines or > 65 words cause script reader fatigue
        if (currentActionParagraph.length >= 5 || aWords.length >= 65) {
          actionBloatWarnings.push({
            sceneTitle: scene.title,
            sceneId: scene.id,
            wordCount: aWords.length,
            lineCount: currentActionParagraph.length,
            excerpt: fullAction.slice(0, 140) + '...'
          });
        }
        currentActionParagraph = [];
      }
    };

    const flushDialogue = () => {
      if (currentSpeaker && currentSpeechWords.length > 0) {
        const wCount = currentSpeechWords.length;
        dialogueWordCount += wCount;
        totalWords += wCount;

        if (!characterMap[currentSpeaker]) {
          characterMap[currentSpeaker] = { wordCount: 0, speechCount: 0 };
        }
        characterMap[currentSpeaker].wordCount += wCount;
        characterMap[currentSpeaker].speechCount += 1;

        // Industry rule: Monologues over 120 words break dialogue rhythm
        if (wCount >= 120) {
          monologueWarnings.push({
            character: currentSpeaker,
            wordCount: wCount,
            excerpt: currentSpeechWords.slice(0, 24).join(' ') + '...',
            sceneTitle: scene.title,
            sceneId: scene.id
          });
        }
        currentSpeaker = null;
        currentSpeechWords = [];
      }
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        flushDialogue();
        flushActionParagraph();
        continue;
      }

      // Check if character cue line: 2-35 characters, uppercase, not INT./EXT.
      const isCharacterCue =
        /^[A-Z0-9\s()'. -]{2,35}$/.test(trimmed) &&
        !trimmed.startsWith('INT.') &&
        !trimmed.startsWith('EXT.') &&
        !trimmed.startsWith('SCENE') &&
        !trimmed.startsWith('ACT');

      if (isCharacterCue && !trimmed.includes(':')) {
        flushDialogue();
        flushActionParagraph();
        // Clean off parentheticals for character name
        currentSpeaker = trimmed.replace(/\s*\(.*?\)\s*/g, '').trim();
      } else if (currentSpeaker) {
        // Collect spoken dialogue lines
        const wordsInLine = trimmed.split(/\s+/).filter(Boolean);
        currentSpeechWords.push(...wordsInLine);
      } else {
        // Action line
        currentActionParagraph.push(trimmed);
      }
    }

    flushDialogue();
    flushActionParagraph();
  }

  // Calculate estimated page count (standard 1 page ≈ 54 lines or ~220 words)
  const pageCountByLines = Math.max(1, Math.round(totalScriptLines / 52));
  const pageCountByWords = Math.max(1, Math.round(totalWords / 230));
  const estimatedPageCount = Math.max(pageCountByLines, pageCountByWords);
  const estimatedRuntimeMinutes = estimatedPageCount; // 1 page ≈ 1 minute

  const dialoguePct = totalWords > 0 ? Math.round((dialogueWordCount / totalWords) * 100) : 55;
  const actionPct = 100 - dialoguePct;

  const characterDialogueShares = Object.entries(characterMap)
    .map(([character, data]) => ({
      character,
      wordCount: data.wordCount,
      speechCount: data.speechCount,
      percentage: dialogueWordCount > 0 ? Math.round((data.wordCount / dialogueWordCount) * 100) : 0
    }))
    .sort((a, b) => b.wordCount - a.wordCount)
    .slice(0, 8);

  return {
    estimatedPageCount,
    estimatedRuntimeMinutes,
    actionWordCount,
    dialogueWordCount,
    dialoguePct,
    actionPct,
    characterDialogueShares,
    monologueWarnings: monologueWarnings.slice(0, 10),
    actionBloatWarnings: actionBloatWarnings.slice(0, 10),
    sluglineWarnings: sluglineWarnings.slice(0, 10)
  };
}

// ==========================================
// 5. AUTOMATED CONTINUITY & CANON AUDIT ENGINE
// ==========================================

export function runAutomatedContinuityAudit(
  scenes: Scene[],
  entities: Entity[] = [],
  project: Project,
  existingIssues: ContinuityIssue[] = []
): {
  newIssues: ContinuityIssue[];
  auditedSceneCount: number;
  newCount: number;
} {
  const discovered: ContinuityIssue[] = [];

  // Map of existing issues by key to preserve resolved/intentional status
  const existingMap = new Map<string, ContinuityIssue>();
  existingIssues.forEach((issue) => {
    existingMap.set(issue.title.toLowerCase().trim(), issue);
    existingMap.set(issue.id, issue);
  });

  const isScreenplay = project.type === 'Screenplay' || project.type === 'Screenplay Experiment';

  // 1. CHRONOLOGY & TIMELINE ANOMALIES
  for (let i = 0; i < scenes.length - 1; i++) {
    const current = scenes[i];
    const next = scenes[i + 1];

    const curTime = (current.time || '').toLowerCase();
    const nextTime = (next.time || '').toLowerCase();

    // Check for impossible Night -> Morning on the same immediate beat without passage
    if (
      curTime.includes('night') &&
      nextTime.includes('morning') &&
      current.chapterNumber === next.chapterNumber &&
      !next.proseContent.toLowerCase().includes('morning') &&
      !next.proseContent.toLowerCase().includes('next day') &&
      !next.proseContent.toLowerCase().includes('dawn') &&
      !next.proseContent.toLowerCase().includes('hours later')
    ) {
      const title = `Timeline Abruptness: ${current.title} to ${next.title}`;
      const existing = existingMap.get(title.toLowerCase().trim());
      discovered.push(
        existing || {
          id: `audit-timeline-${current.id}-${next.id}`,
          title,
          question: `Scene "${current.title}" is set at Night, while immediately following scene "${next.title}" is tagged Morning in the same chapter without an explicit temporal transition phrase.`,
          passageA: {
            sceneTitle: current.title,
            sceneId: current.id,
            excerpt: current.time ? `Setting Time: ${current.time}` : current.proseContent.slice(0, 120) + '...'
          },
          passageB: {
            sceneTitle: next.title,
            sceneId: next.id,
            excerpt: next.time ? `Setting Time: ${next.time}` : next.proseContent.slice(0, 120) + '...'
          },
          status: 'open',
          severity: 'medium',
          category: 'timeline',
          suggestion: 'Insert a brief temporal signifier (e.g., "By daybreak", "The following morning") or adjust scene metadata.'
        }
      );
    }
  }

  // 2. ENTITY & CHARACTER CANON INTEGRITY
  if (entities.length > 0) {
    for (const entity of entities) {
      // Check if entity is marked retired or contradicted but appears in active scenes
      if (entity.type === 'character' && (entity.status === 'retired' || entity.status === 'contradicted')) {
        for (const scene of scenes) {
          const text = (scene.proseContent || '').toLowerCase();
          const nameLower = entity.name.toLowerCase();

          if (nameLower.length > 2 && text.includes(nameLower)) {
            // Check if it's just a memory/mention or active dialogue
            const regex = new RegExp(`\\b${entity.name}\\b`, 'i');
            if (regex.test(scene.proseContent)) {
              const title = `Canon Integrity: ${entity.name} in "${scene.title}"`;
              const existing = existingMap.get(title.toLowerCase().trim());
              discovered.push(
                existing || {
                  id: `audit-canon-${entity.id}-${scene.id}`,
                  title,
                  question: `Character "${entity.name}" is logged as "${entity.status}" in the Story Bible, but is mentioned in active beat "${scene.title}". Is this a flashback or an accidental canon breach?`,
                  passageA: {
                    sceneTitle: `Codex: ${entity.name}`,
                    sceneId: scene.id,
                    excerpt: `${entity.name} (${entity.type}) — Status: ${entity.status}. ${entity.description || ''}`
                  },
                  passageB: {
                    sceneTitle: scene.title,
                    sceneId: scene.id,
                    excerpt: `...${scene.proseContent.slice(0, 140)}...`
                  },
                  status: 'open',
                  severity: 'high',
                  category: 'canon',
                  suggestion: 'Confirm if this reference is a retrospective memory or update character status in the Story Bible.'
                }
              );
              break;
            }
          }
        }
      }
    }
  }

  // 3. POV INTEGRITY & PERSPECTIVE COLLISION (Novel prose)
  if (!isScreenplay) {
    for (const scene of scenes) {
      const text = scene.proseContent || '';
      if (text.length < 150) continue;

      const pov = (scene.pov || '').trim();
      const hasSpecificPov = pov.length > 0;

      // Check if 3rd person POV scene contains stray 1st-person pronouns outside dialogue
      // Remove all quoted strings first
      const proseWithoutDialogue = text.replace(/"[^"]*"/g, '').replace(/“[^”]*”/g, '');
      const firstPersonMatches = proseWithoutDialogue.match(/\b(I\s+|I'm|I've|I'd|my\s+|me\s+|we\s+|our\s+)/g) || [];

      if (hasSpecificPov && firstPersonMatches.length >= 4) {
        const title = `POV Drift: 1st Person Slippage in "${scene.title}"`;
        const existing = existingMap.get(title.toLowerCase().trim());
        discovered.push(
          existing || {
            id: `audit-pov-${scene.id}`,
            title,
            question: `Scene is designated as third-person POV for character "${pov}", but contains ${firstPersonMatches.length} unquoted first-person pronouns ("I", "my", "me") in narration.`,
            passageA: {
              sceneTitle: scene.title,
              sceneId: scene.id,
              excerpt: `POV Designation: ${pov} (3rd person)`
            },
            passageB: {
              sceneTitle: scene.title,
              sceneId: scene.id,
              excerpt: proseWithoutDialogue.slice(0, 160) + '...'
            },
            status: 'open',
            severity: 'medium',
            category: 'pov',
            suggestion: 'Examine narrative voice to ensure consistency between first-person interiority and third-person narration.'
          }
        );
      }
    }
  }

  // 4. BEAT COMPLETION & PLACEHOLDER DETECTION
  for (const scene of scenes) {
    const text = (scene.proseContent || '').trim();
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    if (scene.status !== 'draft' && wordCount < 40) {
      const title = `Beat Completeness: Underwritten scene "${scene.title}"`;
      const existing = existingMap.get(title.toLowerCase().trim());
      discovered.push(
        existing || {
          id: `audit-incomplete-${scene.id}`,
          title,
          question: `Scene "${scene.title}" is marked as "${scene.status}", but only contains ${wordCount} words. Is this an unexpanded story outline beat?`,
          passageA: {
            sceneTitle: scene.title,
            sceneId: scene.id,
            excerpt: `Status: ${scene.status} · Word Count: ${wordCount}`
          },
          passageB: {
            sceneTitle: scene.title,
            sceneId: scene.id,
            excerpt: text || '(Empty content)'
          },
          status: 'open',
          severity: 'low',
          category: 'pacing',
          suggestion: 'Draft remaining scene dialogue and descriptive action before advancing editorial status.'
        }
      );
    }
  }

  // 5. SCREENPLAY FORMATTING INTEGRITY (Screenplay mode)
  if (isScreenplay) {
    for (const scene of scenes) {
      const text = (scene.proseContent || '').trim();
      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
      const firstLine = lines[0] || '';

      if (lines.length > 0 && !/^(INT\.|EXT\.|INT\.\/EXT\.)/i.test(firstLine)) {
        const title = `Slugline Violation: "${scene.title}"`;
        const existing = existingMap.get(title.toLowerCase().trim());
        discovered.push(
          existing || {
            id: `audit-slugline-${scene.id}`,
            title,
            question: `Screenplay scene "${scene.title}" begins without an industry-standard INT. or EXT. slugline. Script coverage readers require standardized scene headings.`,
            passageA: {
              sceneTitle: scene.title,
              sceneId: scene.id,
              excerpt: `Current opening line: "${firstLine}"`
            },
            passageB: {
              sceneTitle: scene.title,
              sceneId: scene.id,
              excerpt: lines.slice(0, 3).join('\n')
            },
            status: 'open',
            severity: 'high',
            category: 'formatting',
            suggestion: 'Format the opening line as: INT. LOCATION - DAY or EXT. LOCATION - NIGHT.'
          }
        );
      }
    }
  }

  // Merge with existing issues that were manually logged or previously audited
  const mergedMap = new Map<string, ContinuityIssue>();

  // Add existing issues first so custom ones aren't lost
  existingIssues.forEach((i) => mergedMap.set(i.id, i));

  // Add newly discovered issues
  let newCount = 0;
  discovered.forEach((issue) => {
    if (!mergedMap.has(issue.id)) {
      mergedMap.set(issue.id, issue);
      newCount++;
    }
  });

  const finalIssues = Array.from(mergedMap.values());

  return {
    newIssues: finalIssues,
    auditedSceneCount: scenes.length,
    newCount
  };
}
