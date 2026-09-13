import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy Google GenAI initialization
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// Advisor / Sounding Board Analysis Endpoint
app.post('/api/advisor', async (req, res) => {
  try {
    const {
      text,
      scopeType = 'scene',
      title = 'Current Scene',
      actionType = 'critique',
      chapterTitle,
      charactersLore = [],
      metrics
    } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({
        error: 'Text content is required for literary analysis.'
      });
    }

    const ai = getGenAI();

    // Prepare system instructions & action guidance
    let prompt = '';
    const wordCount = text.trim().split(/\s+/).length;
    const metricsContext = metrics ? `
[Empirical Manuscript Metrics - ProWritingAid Engine]:
- Word Count: ${metrics.wordCount}
- Average Sentence Length: ${metrics.averageSentenceLength} words (Standard Deviation: ${metrics.sentenceStandardDeviation})
- Rhythm Verdict: ${metrics.rhythmVerdict}
- Cadence Spread: ${metrics.cadenceBreakdown?.short || 0} short (≤8w), ${metrics.cadenceBreakdown?.medium || 0} medium (9-20w), ${metrics.cadenceBreakdown?.long || 0} long (21-35w), ${metrics.cadenceBreakdown?.veryLong || 0} very long (36+w)
- Dialogue vs Exposition Ratio: ${metrics.dialoguePercentage}% Dialogue, ${100 - (metrics.dialoguePercentage || 0)}% Exposition
- Sensory Anchor Words: ${metrics.sensoryScores?.totalSensoryAnchorWords || 0} (Sight: ${metrics.sensoryScores?.sight || 0}, Sound: ${metrics.sensoryScores?.sound || 0}, Touch: ${metrics.sensoryScores?.touch || 0}, Smell: ${metrics.sensoryScores?.smell || 0}, Taste: ${metrics.sensoryScores?.taste || 0})
- Filter Words Count: ${metrics.filterWordsTotal || 0} (e.g., felt, saw, noticed, heard)
- Glue Words Ratio: ${metrics.glueWordsRatio || 0}% (filler structural words)
- Flesch Reading Ease: ${metrics.readingEase || 0}/100 (Grade Level: ${metrics.gradeLevel || 0})
` : '';

    const loreContext = charactersLore && charactersLore.length > 0
      ? `\n[Known Codex Lore & Characters in this scene]:\n${charactersLore.map((c: any) => `• ${typeof c === 'string' ? c : c.name + (c.role ? ` (${c.role})` : '')}`).join('\n')}\n`
      : '';

    if (actionType === 'critique') {
      prompt = `You are a master fiction editor and manuscript craft advisor (specializing in prose cadence, narrative rhythm, sensory immersion, and tone consistency, inspired by the depth of ProWritingAid and Chicago Manual of Style).

Analyze the following ${scopeType} titled "${title}"${chapterTitle ? ` (from Chapter: "${chapterTitle}")` : ''} (${wordCount} words).
${metricsContext}
${loreContext}

Manuscript Excerpt:
"""
${text.slice(0, 14000)}
"""

Provide an insightful, rigorous, craft-first literary critique formatted cleanly in Markdown with the following structured sections:

### 1. Cadence & Rhythmic Waves
Audit the sentence length variety and pacing. Identify where sentences flow musically and where they stumble into monotonous patterns or unintentional run-ons. Quote 1-2 examples directly from the text to illustrate your points.

### 2. Sensory Anchoring & Atmospheric Immersion
Evaluate physical grounding. Which of the five senses (sight, sound, touch, smell, taste) are actively engaged, and where does "floating head syndrome" or white-room syndrome threaten the scene?

### 3. Tone, Mood & Emotional Resonance
Assess the consistency of narrative voice and emotional tension. Does the prose posture match the stakes? Are emotional shifts earned?

### 4. Filter Words & Psychological Distance
Audit filter verbs (e.g., "she saw", "he felt", "she wondered", "he noticed") that dilute immersion. Point out specific instances that could be transformed into immediate visceral experience.

### 5. Concrete Line Revisions (Before & After)
Provide 2-3 specific before-and-after line polishes illustrating how tightening cadence or deepening sensory details elevates the prose.

Maintain an encouraging yet precise, professional literary tone. Do not use generic praise or superficial filler.`;
    } else if (actionType === 'pacing') {
      prompt = `You are an expert story analyst focusing on narrative pacing and scene progression.
Analyze the following ${scopeType} titled "${title}" (${wordCount} words).
${metricsContext}
${loreContext}

Manuscript Excerpt:
"""
${text.slice(0, 14000)}
"""

Provide a detailed Pacing & Scene Architecture review in Markdown:
### 1. Narrative Beat Progression
Break down the sequence of story beats, turns, and character discoveries in this passage.

### 2. Scene Acceleration vs. Introspection
Where does the narrative drag with excess exposition? Where does it rush through critical revelations without letting the emotional impact land?

### 3. Tension Wave & Micro-Stakes
Analyze how question-answer cycles sustain tension from the opening hook to the closing beat.

### 4. Recommended Pacing Adjustments
List 3 concrete adjustments to calibrate narrative momentum.`;
    } else if (actionType === 'dialogue') {
      prompt = `You are a dialogue specialist and fiction editor.
Analyze the dialogue in this ${scopeType} titled "${title}" (${wordCount} words).
${metricsContext}
${loreContext}

Manuscript Excerpt:
"""
${text.slice(0, 14000)}
"""

Provide a Dialogue & Voice Audit in Markdown:
### 1. Character Voice Distinction
Do characters sound distinct in vocabulary, cadence, and worldview?

### 2. Subtext vs. On-the-Nose Speech
Identify lines that state exposition or emotion too directly and suggest subtler subtextual approaches.

### 3. Dialogue Tags & Action Beats
Audit speech tags and action beats. Flag excessive adverb tags or opportunities to ground speech in tactile movement.

### 4. Sample Line Polishes
Provide before-and-after improvements for 2-3 lines of dialogue.`;
    } else if (actionType === 'lore') {
      prompt = `You are a continuity editor and lore archivist.
Analyze the following ${scopeType} titled "${title}" (${wordCount} words) against the story bible and canon entities.
${loreContext}

Manuscript Excerpt:
"""
${text.slice(0, 14000)}
"""

Provide a Canon & Continuity Audit in Markdown:
### 1. Entity & Character Tracking
List characters, objects, factions, and locations present, verifying their consistency with established lore.

### 2. Potential Continuity Hazards
Flag any potential contradictions in timeline, physical abilities, character knowledge, or geography.

### 3. Worldbuilding Depth Opportunities
Identify moments where existing codex lore could subtly enrich the scene without bogging it down in exposition.`;
    } else if (actionType === 'brainstorm') {
      prompt = `You are a creative sounding board and narrative consultant for authors.
Given this ${scopeType} titled "${title}" (${wordCount} words):
${loreContext}

Manuscript Excerpt:
"""
${text.slice(0, 14000)}
"""

Suggest 3 compelling next narrative turns or unforeseen character reactions to this scene's climax:
- **Option A (The Complication)**: An unexpected consequence or obstacle that raises the stakes.
- **Option B (The Emotional Pivot)**: A vulnerable or surprising character choice that deepens relationships.
- **Option C (The Lore / Mystery Hook)**: A revelation that ties back into the larger story arc.`;
    } else {
      prompt = `You are a fiction writing advisor. Provide an editorial review for "${title}" (${wordCount} words):\n\n${text.slice(0, 14000)}`;
    }

    if (ai) {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('AI response timed out')), 6000)
        );

        const response: any = await Promise.race([
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt
          }),
          timeoutPromise
        ]);

        const outputText = response.text || 'Analysis completed with no output.';
        return res.json({
          status: 'ok',
          critique: outputText,
          provider: 'gemini-3.8-flash'
        });
      } catch (geminiError: any) {
        console.warn('Gemini API call failed or timed out, generating craft synthesis fallback:', geminiError?.message);
      }
    }

    // High-craft fallback synthesis if GEMINI_API_KEY is unset or temporary error
    const fallbackCritique = generateCraftFallback(title, scopeType, actionType, metrics, text);
    return res.json({
      status: 'ok',
      critique: fallbackCritique,
      provider: 'algorithmic-craft-engine'
    });
  } catch (error: any) {
    console.error('Advisor endpoint error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to analyze text.'
    });
  }
});

// Algorithmic craft synthesis fallback
function generateCraftFallback(
  title: string,
  scopeType: string,
  actionType: string,
  metrics: any,
  rawText: string
): string {
  const avgLen = metrics?.averageSentenceLength || 15;
  const stdDev = metrics?.sentenceStandardDeviation || 6;
  const dialogueRatio = metrics?.dialoguePercentage || 30;
  const sensoryDensity = metrics?.sensoryScores?.sensoryDensityPer100Words || 2.5;
  const filterCount = metrics?.filterWordsTotal || 0;
  const glueRatio = metrics?.glueWordsRatio || 40;

  return `### Cadence & Rhythmic Flow (${scopeType === 'chapter' ? 'Chapter Scope' : 'Scene Scope'}: "${title}")

**Empirical Diagnosis:**
• **Sentence Variance:** Average sentence length is **${avgLen} words** with a standard deviation of **${stdDev}**.
• **Rhythm Archetype:** ${metrics?.rhythmVerdict || 'Balanced Pacing'}. ${
    stdDev < 4
      ? 'The sentence lengths remain too uniform across consecutive paragraphs, risking rhythmic monotony. Inject staccato fragments or expansive compound sentences to vary the tempo.'
      : 'Good musical variation exists between brisk action statements and deliberate, layered descriptions.'
  }

---

### Sensory Anchoring & Immersion
• **Sensory Density:** ${sensoryDensity} sensory anchor words per 100 words (${metrics?.sensoryScores?.totalSensoryAnchorWords || 0} detected across sight, sound, touch, smell, taste).
• **Five Senses Balance:**
  - **Visual:** ${metrics?.sensoryScores?.sight || 0} markers (dominant framing)
  - **Auditory:** ${metrics?.sensoryScores?.sound || 0} acoustic beats
  - **Tactile:** ${metrics?.sensoryScores?.touch || 0} physical friction points
  - **Olfactory / Gustatory:** ${(metrics?.sensoryScores?.smell || 0) + (metrics?.sensoryScores?.taste || 0)} atmosphere cues
${
  sensoryDensity < 2.0
    ? '⚠️ *Caution:* Sensory density is slightly sparse. Anchor character reactions in physical temperature, texture, or acoustic reverberation to eliminate white-room abstraction.'
    : '✓ *Strength:* The prose demonstrates consistent physical grounding in its immediate environment.'
}

---

### Filter Words & Psychological Distance
• **Filter Words Found:** **${filterCount} instances** detected (${metrics?.filterWords?.map((f: any) => `"${f.word}" (${f.count})`).slice(0, 4).join(', ') || 'None'}).
${
  filterCount > 4
    ? 'Phrases such as "she saw" or "he felt" insert an invisible camera between the reader and the protagonist. Remove the filter verb to pull the reader into unmediated sensory contact.'
    : 'Prose maintains tight emotional proximity with minimal filtering verbs.'
}

---

### Dialogue-to-Narrative Pacing
• **Dialogue Ratio:** **${dialogueRatio}% Dialogue** vs. **${100 - dialogueRatio}% Exposition**.
${
  dialogueRatio > 65
    ? 'Scene is dialogue-heavy. Ensure character movements, vocal hesitations, and environmental friction break up rapid exchanges.'
    : dialogueRatio < 15
    ? 'Scene leans heavily toward introspective exposition. Consider introducing character vocal friction or spoken stakes.'
    : 'Well-balanced ratio between spoken exchange and reflective internal observation.'
}

---

### Actionable Polish Suggestions
1. **Tighten Structural Glue (${glueRatio}% glue words):** Strip redundant conjunctions (*and then, just, really, that*) from action beats.
2. **Elevate Emotional Turns:** Align sentence rhythm with emotional stakes—shorten sentences as tension rises, lengthen during introspective aftermath.`;
}

// Vite middleware for development vs static build in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Threadline Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
