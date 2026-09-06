import {
  Project,
  ProjectBundle,
  Chapter,
  Scene,
  Entity,
  Thread,
  StoryEvent,
  ContinuityIssue,
  RevisionPass,
  NoteItem,
  ProjectType,
  WritingFramework
} from '../types';

export interface FrameworkDefinition {
  id: WritingFramework;
  name: string;
  tagline: string;
  chaptersCount: number;
  beatsCount: number;
  origin: string;
  badge: string;
  badgeColor: string;
  summary: string;
  recommendedFor: string;
  keyPhases: { name: string; chapters: string; beats: string; description: string }[];
}

export const FRAMEWORK_DEFINITIONS: FrameworkDefinition[] = [
  {
    id: 'three-act',
    name: 'Three-Act Story Structure',
    tagline: 'Setup, Confrontation, and Resolution — the time-tested classical spine of dramatic prose.',
    chaptersCount: 9,
    beatsCount: 11,
    origin: 'Aristotle · Syd Field',
    badge: 'Classical Standard',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    summary:
      'Organizes your manuscript into three distinct movements across 9 chapters: Act I establishes the status quo and inciting disruption; Act II doubles the stakes across the Midpoint and rock-bottom crisis; Act III delivers the cathartic climax and transformed world.',
    recommendedFor: 'Literary fiction, mysteries, thrillers, historical novels, and character dramas.',
    keyPhases: [
      { name: 'Act I: Setup', chapters: 'Chapters 1–3', beats: 'Beats 1–4', description: 'Status quo, inciting rupture, debate, and crossing the threshold.' },
      { name: 'Act II: Confrontation', chapters: 'Chapters 4–7', beats: 'Beats 5–9', description: 'Trials, midpoint pivot from passive to active, crisis, and dark night.' },
      { name: 'Act III: Resolution', chapters: 'Chapters 8–9', beats: 'Beats 10–11', description: 'Climactic showdown and establishment of a new equilibrium.' }
    ]
  },
  {
    id: 'save-the-cat',
    name: 'Save the Cat! Beat Sheet',
    tagline: '15 iconic beats mapped with cinematic precision from Opening Image to Final Transformation.',
    chaptersCount: 14,
    beatsCount: 15,
    origin: 'Blake Snyder',
    badge: 'Plotting Powerhouse',
    badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
    summary:
      'The gold standard for commercial pacing. Crafts an ironclad narrative rhythm through 14 chapters structured across Thesis, Antithesis, and Synthesis worlds with poignant Dark Night of the Soul and Finale.',
    recommendedFor: 'Commercial fiction, fast-paced thrillers, young adult, romance, and speculative page-turners.',
    keyPhases: [
      { name: 'Act 1: Thesis World', chapters: 'Chapters 1–5', beats: 'Beats 1–6', description: 'Opening image, theme stated, setup, catalyst, debate, break into two.' },
      { name: 'Act 2: Antithesis World', chapters: 'Chapters 6–11', beats: 'Beats 7–12', description: 'B-story, fun & games, midpoint, bad guys close in, rock bottom.' },
      { name: 'Act 3: Synthesis World', chapters: 'Chapters 12–14', beats: 'Beats 13–15', description: 'Break into three, five-point finale, and triumphant final image.' }
    ]
  },
  {
    id: 'heros-journey',
    name: "The Hero's Journey (Monomyth)",
    tagline: 'The mythic 12-stage cycle of separation, initiation, supreme ordeal, and transformed return.',
    chaptersCount: 11,
    beatsCount: 12,
    origin: 'Joseph Campbell · Christopher Vogler',
    badge: 'Mythic Archetype',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    summary:
      'Grounds storytelling in archetypal human transformation across 11 mythic chapters. The protagonist leaves the Ordinary World, meets mentors, braves the Inmost Cave for the Supreme Ordeal, and returns bearing the Elixir.',
    recommendedFor: 'Epic fantasy, science fiction, coming-of-age epics, historical sagas, and allegories.',
    keyPhases: [
      { name: 'Departure / Separation', chapters: 'Chapters 1–4', beats: 'Stages 1–5', description: 'Ordinary world, call to adventure, refusal, mentor, threshold.' },
      { name: 'Initiation / Trials', chapters: 'Chapters 5–8', beats: 'Stages 6–9', description: 'Tests and allies, inmost cave, supreme ordeal, seizing the reward.' },
      { name: 'Return & Transformation', chapters: 'Chapters 9–11', beats: 'Stages 10–12', description: 'The road back, resurrection test, return with the healing elixir.' }
    ]
  },
  {
    id: 'story-circle',
    name: "Dan Harmon's Story Circle",
    tagline: '8 rhythmic steps powering cyclical character evolution across Order and Chaos.',
    chaptersCount: 8,
    beatsCount: 8,
    origin: 'Dan Harmon (Simplified Monomyth)',
    badge: 'Modern Cyclical Engine',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    summary:
      'A brilliant, streamlined 8-chapter circular model dividing the narrative into top (Order / Comfort) and bottom (Chaos / Unfamiliar) hemispheres. Emphasizes character want vs. need and the steep price paid for growth.',
    recommendedFor: 'Character-driven novels, episodic fiction, modern speculative drama, and psychological fiction.',
    keyPhases: [
      { name: 'Order Hemisphere (Conscious)', chapters: 'Chapters 1–2 & 7–8', beats: 'Steps 1–2 & 7–8', description: 'You (comfort), Need (lack), Return (re-entry), Change (mastery).' },
      { name: 'Chaos Hemisphere (Unconscious)', chapters: 'Chapters 3–6', beats: 'Steps 3–6', description: 'Go (crossing), Search (trials), Find (discovery), Take (heavy price).' }
    ]
  }
];

export interface ProjectSetupConfig {
  title: string;
  type: ProjectType;
  framework: WritingFramework;
  protagonist?: string;
  situation?: string;
  desiredSessionGoal?: string;
  genre?: string;
  targetWordCount?: number;
}

export function generateFrameworkProjectBundle(config: ProjectSetupConfig): ProjectBundle {
  const projId = 'proj-' + Date.now();
  const title = config.title.trim() || 'Untitled Manuscript';
  const protagonist = config.protagonist?.trim() || 'The Protagonist';
  const situation = config.situation?.trim() || 'A sudden disturbance shatters the equilibrium of the normal world.';
  const type = config.type || 'Novel';
  const framework = config.framework || 'three-act';

  switch (framework) {
    case 'save-the-cat':
      return createSaveTheCatBundle(projId, title, type, protagonist, situation, config);
    case 'heros-journey':
      return createHerosJourneyBundle(projId, title, type, protagonist, situation, config);
    case 'story-circle':
      return createStoryCircleBundle(projId, title, type, protagonist, situation, config);
    case 'three-act':
    default:
      return createThreeActBundle(projId, title, type, protagonist, situation, config);
  }
}

// ---------------------------------------------------------------------------
// 1. THREE-ACT STORY STRUCTURE BOILERPLATE
// ---------------------------------------------------------------------------
function createThreeActBundle(
  projId: string,
  title: string,
  type: ProjectType,
  protagonist: string,
  situation: string,
  config: ProjectSetupConfig
): ProjectBundle {
  const scene1Id = 'scene-act1-1';

  const project: Project = {
    id: projId,
    title,
    type,
    protagonist,
    situation,
    genre: config.genre || 'Dramatic Fiction',
    desiredSessionGoal: config.desiredSessionGoal || 'Establish the status quo sensory world and introduce the initial disruption.',
    targetWordCount: config.targetWordCount || (type === 'Novel' ? 75000 : 25000),
    status: 'drafting',
    lastActiveSceneId: scene1Id,
    framework: 'three-act',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const starterProse = type === 'Novel'
    ? `The morning had arrived with a quiet, flinty persistence, the kind of light that exposed every chipped edge and gathered grain of dust in ${protagonist}'s world.

Before the knock came, before the seals were broken, everything had remained safely in its familiar groove. Daily habits formed an armor—measured footsteps upon worn floorboards, the customary tea cooling on the pine table, the predictable obligations of another ordinary dawn.

Yet underneath the silence, an uneasy vibration hummed. ${situation}`
    : `INT. PROTAGONIST'S DOMAIN - DAWN\n\nA grey light cuts through narrow windows, illuminating shelves stacked with relics of a carefully constructed life.\n\n${protagonist.toUpperCase()} sits motionless at the table. Worn hands resting on chilled pine.\n\nEverything here runs on routine. Until now.\n\n${situation.toUpperCase()}`;

  const chapters: Chapter[] = [
    {
      id: 'chap-ta-1',
      number: 1,
      title: 'The Ordinary World & The Flaw',
      actOrPhase: 'Act I: Setup',
      description: 'Establishes baseline reality, protagonist character defect, and the fragile status quo.',
      sceneIds: [scene1Id]
    },
    {
      id: 'chap-ta-2',
      number: 2,
      title: 'The Inciting Catalyst',
      actOrPhase: 'Act I: Setup',
      description: 'An unexpected disturbance shatters the equilibrium and introduces the core conflict.',
      sceneIds: ['scene-act1-2']
    },
    {
      id: 'chap-ta-3',
      number: 3,
      title: 'The Reluctant Threshold',
      actOrPhase: 'Act I: Setup',
      description: 'Internal hesitation, high stakes debate, and the irreversible choice to step into the unknown.',
      sceneIds: ['scene-act1-3', 'scene-act1-4']
    },
    {
      id: 'chap-ta-4',
      number: 4,
      title: 'Entering the New World',
      actOrPhase: 'Act II: Confrontation',
      description: 'The protagonist navigates unfamiliar rules, early trials, and shifting loyalties.',
      sceneIds: ['scene-act2-5']
    },
    {
      id: 'chap-ta-5',
      number: 5,
      title: 'The Midpoint Reversal',
      actOrPhase: 'Act II: Confrontation',
      description: 'Stakes escalate from passive reaction to active confrontation. A false victory or fatal secret is unveiled.',
      sceneIds: ['scene-act2-6']
    },
    {
      id: 'chap-ta-6',
      number: 6,
      title: 'The Walls Cave In',
      actOrPhase: 'Act II: Confrontation',
      description: 'Rising complications, the antagonist strikes back, and the clock begins ticking.',
      sceneIds: ['scene-act2-7']
    },
    {
      id: 'chap-ta-7',
      number: 7,
      title: 'Dark Night of the Soul',
      actOrPhase: 'Act II: Confrontation',
      description: 'All hope is shattered. The protagonist hits rock bottom, sheds their fatal flaw, and synthesizes the truth.',
      sceneIds: ['scene-act2-8', 'scene-act2-9']
    },
    {
      id: 'chap-ta-8',
      number: 8,
      title: 'The Supreme Confrontation',
      actOrPhase: 'Act III: Resolution',
      description: 'The climactic showdown testing the protagonist’s transformation against the primary antagonistic force.',
      sceneIds: ['scene-act3-10']
    },
    {
      id: 'chap-ta-9',
      number: 9,
      title: 'The Transformed Equilibrium',
      actOrPhase: 'Act III: Resolution',
      description: 'The dust settles into a new reality, resolving emotional threads and showing how the world has irrevocably changed.',
      sceneIds: ['scene-act3-11']
    }
  ];

  const scenes: Scene[] = [
    {
      id: scene1Id,
      title: 'Act I: 1. Status Quo & The Ordinary World',
      order: 1,
      chapterId: 'chap-ta-1',
      chapterNumber: 1,
      chapterTitle: 'The Ordinary World & The Flaw',
      actOrPhase: 'Act I: Setup',
      narrativeBeat: '1. Status Quo & Ordinary World',
      premise: `Establish ${protagonist}'s baseline reality, internal flaw, and daily routine before the disturbance strikes.`,
      characters: [protagonist],
      location: 'Primary Ordinary World',
      time: 'Day 1, Morning',
      pov: `${protagonist} (Third Limited)`,
      status: 'draft',
      wordCount: starterProse.trim().split(/\s+/).length,
      notes: 'Focus on sensory textures: the physical sounds, smells, and routines that define life before the inciting catalyst.',
      proseContent: starterProse,
      comments: []
    },
    {
      id: 'scene-act1-2',
      title: 'Act I: 2. Inciting Incident (The Catalyst)',
      order: 2,
      chapterId: 'chap-ta-2',
      chapterNumber: 2,
      chapterTitle: 'The Inciting Catalyst',
      actOrPhase: 'Act I: Setup',
      narrativeBeat: '2. The Catalyst & Inciting Incident',
      premise: 'An unexpected event, arrival, or discovery disrupts normal equilibrium and introduces the core dramatic conflict.',
      characters: [protagonist, 'Inciting Messenger / Rival'],
      location: 'Threshold of Disruption',
      time: 'Day 1, Afternoon',
      pov: `${protagonist} (Third Limited)`,
      status: 'draft',
      wordCount: 0,
      notes: 'Make the interruption irreversible. The protagonist cannot simply pretend this didn’t happen.',
      proseContent: '',
      comments: []
    },
    {
      id: 'scene-act1-3',
      title: 'Act I: 3. Refusal & The Debate',
      order: 3,
      chapterId: 'chap-ta-3',
      chapterNumber: 3,
      chapterTitle: 'The Reluctant Threshold',
      actOrPhase: 'Act I: Setup',
      narrativeBeat: '3. Refusal & The Debate',
      premise: `${protagonist} hesitates, rationalizes, and attempts to protect their comfort zone despite the mounting urgency.`,
      characters: [protagonist, 'Confidant / Ally'],
      location: 'Sanctuary / Private Quarters',
      time: 'Day 2',
      pov: `${protagonist} (Third Limited)`,
      status: 'draft',
      wordCount: 0,
      notes: 'Show the internal stakes: what does the protagonist fear losing if they answer the call?',
      proseContent: '',
      comments: []
    },
    {
      id: 'scene-act1-4',
      title: 'Act I: 4. Break into Act II (Crossing the Threshold)',
      order: 4,
      chapterId: 'chap-ta-3',
      chapterNumber: 3,
      chapterTitle: 'The Reluctant Threshold',
      actOrPhase: 'Act I: Setup',
      narrativeBeat: '4. Crossing the Threshold (Plot Point 1)',
      premise: `An active, conscious decision is made: ${protagonist} commits to the quest and steps across the point of no return.`,
      characters: [protagonist],
      location: 'The Frontier / Edge of the Unknown',
      time: 'Day 3, Sunset',
      pov: `${protagonist} (Third Limited)`,
      status: 'draft',
      wordCount: 0,
      notes: 'Act II begins here. The bridge burns behind them. No turning back.',
      proseContent: '',
      comments: []
    },
    {
      id: 'scene-act2-5',
      title: 'Act II: 5. Rising Action & First Trials',
      order: 5,
      chapterId: 'chap-ta-4',
      chapterNumber: 4,
      chapterTitle: 'Entering the New World',
      actOrPhase: 'Act II: Confrontation',
      narrativeBeat: '5. First Trials & Rising Action',
      premise: 'Entering unfamiliar territory. Navigating new rules, encountering early allies, and facing initial friction.',
      characters: [protagonist, 'New Ally'],
      location: 'The Unfamiliar Arena',
      time: 'Day 5',
      pov: `${protagonist} (Third Limited)`,
      status: 'draft',
      wordCount: 0,
      notes: 'The promise of the premise: explore the unique world and conflicts promised by your story concept.',
      proseContent: '',
      comments: []
    },
    {
      id: 'scene-act2-6',
      title: 'Act II: 6. The Midpoint (Stakes Pivot)',
      order: 6,
      chapterId: 'chap-ta-5',
      chapterNumber: 5,
      chapterTitle: 'The Midpoint Reversal',
      actOrPhase: 'Act II: Confrontation',
      narrativeBeat: '6. The Midpoint (Stakes Pivot)',
      premise: 'A critical discovery or turning point shifts the protagonist from passive defense to proactive, urgent pursuit.',
      characters: [protagonist, 'Antagonist / Rival'],
      location: 'Central Crossroads',
      time: 'Day 10',
      pov: `${protagonist} (Third Limited)`,
      status: 'draft',
      wordCount: 0,
      notes: 'False Victory or False Defeat. The ticking clock begins now. The stakes double.',
      proseContent: '',
      comments: []
    },
    {
      id: 'scene-act2-7',
      title: 'Act II: 7. Complications & Pressure Mounts',
      order: 7,
      chapterId: 'chap-ta-6',
      chapterNumber: 6,
      chapterTitle: 'The Walls Cave In',
      actOrPhase: 'Act II: Confrontation',
      narrativeBeat: '7. Bad Guys Close In & Escalation',
      premise: 'Antagonistic forces tighten the perimeter; interpersonal rifts and doubts threaten the alliance.',
      characters: [protagonist, 'Confidant / Ally'],
      location: 'Contested Ground',
      time: 'Day 14',
      pov: `${protagonist} (Third Limited)`,
      status: 'draft',
      wordCount: 0,
      notes: 'Everything becomes harder. Plans fail. The protagonist’s old coping mechanisms stop working.',
      proseContent: '',
      comments: []
    },
    {
      id: 'scene-act2-8',
      title: 'Act II: 8. All Hope Is Lost (The Dark Night)',
      order: 8,
      chapterId: 'chap-ta-7',
      chapterNumber: 7,
      chapterTitle: 'Dark Night of the Soul',
      actOrPhase: 'Act II: Confrontation',
      narrativeBeat: '8. All Hope Is Lost / The Crisis',
      premise: 'The lowest point. The initial plan collapses completely. A devastating loss forces confrontation with the central flaw.',
      characters: [protagonist],
      location: 'Ruins / The Solitary Night',
      time: 'Day 18, Midnight',
      pov: `${protagonist} (Third Limited)`,
      status: 'draft',
      wordCount: 0,
      notes: 'The death of the old self. The protagonist must acknowledge the truth they have been running from.',
      proseContent: '',
      comments: []
    },
    {
      id: 'scene-act2-9',
      title: 'Act II: 9. Break into Act III (The Synthesis)',
      order: 9,
      chapterId: 'chap-ta-7',
      chapterNumber: 7,
      chapterTitle: 'Dark Night of the Soul',
      actOrPhase: 'Act II: Confrontation',
      narrativeBeat: '9. Dark Night of the Soul (Synthesis)',
      premise: 'From the ashes of defeat, a true epiphany strikes. A new strategy is born combining hard-won truth and resolve.',
      characters: [protagonist, 'Allies'],
      location: 'War Room / Staging Ground',
      time: 'Day 20, Dawn',
      pov: `${protagonist} (Third Limited)`,
      status: 'draft',
      wordCount: 0,
      notes: 'Act III launchpad. The protagonist unites their internal need with their external goal.',
      proseContent: '',
      comments: []
    },
    {
      id: 'scene-act3-10',
      title: 'Act III: 10. The Climax (Supreme Confrontation)',
      order: 10,
      chapterId: 'chap-ta-8',
      chapterNumber: 8,
      chapterTitle: 'The Supreme Confrontation',
      actOrPhase: 'Act III: Resolution',
      narrativeBeat: '11. The Climax (Supreme Confrontation)',
      premise: `Final showdown between ${protagonist} and the opposing force. The central dramatic question is decisively answered.`,
      characters: [protagonist, 'Primary Antagonist', 'Allies'],
      location: 'The Citadel / Core Conflict Arena',
      time: 'Day 21, Apex',
      pov: `${protagonist} (Third Limited)`,
      status: 'draft',
      wordCount: 0,
      notes: 'Test both the physical and moral growth of the protagonist. High dramatic tension.',
      proseContent: '',
      comments: []
    },
    {
      id: 'scene-act3-11',
      title: 'Act III: 11. Resolution & New Equilibrium',
      order: 11,
      chapterId: 'chap-ta-9',
      chapterNumber: 9,
      chapterTitle: 'The Transformed Equilibrium',
      actOrPhase: 'Act III: Resolution',
      narrativeBeat: '12. Resolution & Transformed Equilibrium',
      premise: 'The dust settles. A new status quo is established, contrasting the transformed protagonist with the opening chapter.',
      characters: [protagonist, 'Surviving Allies'],
      location: 'Transformed Ordinary World',
      time: 'One Month Later',
      pov: `${protagonist} (Third Limited)`,
      status: 'draft',
      wordCount: 0,
      notes: 'Tie up emotional threads. Give the reader a sense of earned closure and permanent transformation.',
      proseContent: '',
      comments: []
    }
  ];

  const threads: Thread[] = [
    {
      id: 'th-main-plot',
      title: 'A-Plot: Central Dramatic Question',
      description: `The primary external objective that drives ${protagonist} forward across all three acts.`,
      status: 'active',
      color: '#B45309',
      linkedSceneIds: [scene1Id, 'scene-act1-2', 'scene-act1-4', 'scene-act2-6', 'scene-act2-8', 'scene-act3-10', 'scene-act3-11']
    },
    {
      id: 'th-character-arc',
      title: 'B-Plot: The Internal Need vs. Lie',
      description: `The emotional blindspot ${protagonist} must overcome to succeed at the climax.`,
      status: 'active',
      color: '#047857',
      linkedSceneIds: [scene1Id, 'scene-act1-3', 'scene-act2-6', 'scene-act2-8', 'scene-act2-9', 'scene-act3-10']
    },
    {
      id: 'th-thematic-mirror',
      title: 'C-Plot: Thematic Subplot & Relationship',
      description: 'Secondary relationship or mystery that mirrors and tests the moral premise of the story.',
      status: 'active',
      color: '#6D28D9',
      linkedSceneIds: ['scene-act1-3', 'scene-act2-5', 'scene-act2-7', 'scene-act3-11']
    }
  ];

  const entities: Entity[] = [
    {
      id: 'ent-protagonist',
      name: protagonist,
      type: 'character',
      status: 'confirmed',
      description: `Central character carrying the narrative. Flawed yet driven, confronted with an extraordinary challenge.`,
      canonicalFacts: [
        `Holds an unresolved internal conflict or blind spot.`,
        `Driven by an acute personal motive when disrupted by the inciting incident.`
      ],
      linkedSceneIds: [scene1Id, 'scene-act1-2', 'scene-act1-4', 'scene-act2-6', 'scene-act2-8', 'scene-act3-10']
    },
    {
      id: 'ent-antagonist',
      name: 'The Opposing Force',
      type: 'character',
      status: 'confirmed',
      description: `The primary antagonist or institution embodying the contrary ideology to ${protagonist}.`,
      canonicalFacts: [
        'Possesses clear, motivated objectives that conflict directly with the protagonist.',
        'Controls the high ground until the climax.'
      ],
      linkedSceneIds: ['scene-act2-6', 'scene-act2-7', 'scene-act3-10']
    },
    {
      id: 'ent-crucible',
      name: 'The Arena (Primary Crucible)',
      type: 'place',
      status: 'confirmed',
      description: 'The physical setting in which the drama unfolds, imposing physical and societal constraints.',
      canonicalFacts: [
        'Serves as the pressure cooker preventing characters from easily escaping the conflict.'
      ],
      linkedSceneIds: [scene1Id, 'scene-act1-4', 'scene-act2-6', 'scene-act3-10']
    }
  ];

  const events: StoryEvent[] = [
    {
      id: 'ev-inciting',
      title: 'The Inciting Disturbance',
      time: 'Day 1',
      participants: [protagonist],
      consequences: 'Equilibrium shattered; normal routine can no longer sustain the protagonist.',
      linkedSceneId: 'scene-act1-2'
    },
    {
      id: 'ev-midpoint',
      title: 'The Midpoint Reversal',
      time: 'Day 10',
      participants: [protagonist],
      consequences: 'Stakes escalate; passive reactions convert into proactive strategy.',
      linkedSceneId: 'scene-act2-6'
    },
    {
      id: 'ev-climax',
      title: 'The Final Climax Showdown',
      time: 'Day 21',
      participants: [protagonist, 'The Opposing Force'],
      consequences: 'Final resolution of the dramatic question; new equilibrium established.',
      linkedSceneId: 'scene-act3-10'
    }
  ];

  const revisionPasses: RevisionPass[] = [
    {
      id: 'rp-act1-promise',
      name: 'Act I Pacing & Premise Promise Pass',
      description: 'Audit the opening chapters to ensure the world hook, character flaw, and catalyst hit with clarity.',
      checklist: [
        { id: 'c-1', label: 'Verify protagonist flaw and ordinary world baseline are demonstrated before the disruption', done: false, sceneId: scene1Id },
        { id: 'c-2', label: 'Confirm the Inciting Incident is unmistakably life-altering and irreversible', done: false, sceneId: 'scene-act1-2' },
        { id: 'c-3', label: 'Ensure the decision to cross into Act II is active, not passive or forced by circumstance alone', done: false, sceneId: 'scene-act1-4' }
      ]
    },
    {
      id: 'rp-midpoint-crisis',
      name: 'Midpoint Stakes & Cause-and-Effect Escalation',
      description: 'Check that Act II maintains rising tension without sagging, pivoting cleanly at the Midpoint.',
      checklist: [
        { id: 'c-4', label: 'Confirm the Midpoint shifts protagonist from defense to offense', done: false, sceneId: 'scene-act2-6' },
        { id: 'c-5', label: 'Ensure All Hope Is Lost feels genuinely unrecoverable before the epiphany', done: false, sceneId: 'scene-act2-8' }
      ]
    },
    {
      id: 'rp-climax-payoff',
      name: 'Climax Payoff & Resolution Contrast Audit',
      description: 'Verify the climax tests the character’s internal transformation and leaves a permanent mark.',
      checklist: [
        { id: 'c-6', label: 'Confirm the climax victory requires the protagonist to employ their transformed worldview', done: false, sceneId: 'scene-act3-10' },
        { id: 'c-7', label: 'Contrast the final scene with Scene 1 to ensure visible proof of change', done: false, sceneId: 'scene-act3-11' }
      ]
    }
  ];

  const notes: NoteItem[] = [
    {
      id: 'note-three-act-guide',
      title: 'Three-Act Structure: Craft Principles',
      category: 'research',
      content: `The Three-Act framework thrives on dramatic momentum:\n\n• Act I (~20-25%): Ground the reader, rupture the normal world, and push past the threshold of no return.\n• Act II (~50%): Deliver the "promise of the premise". Pivot at the 50% Midpoint to raise the stakes. Plunge into the Dark Night.\n• Act III (~25%): The epiphany, the supreme test of character, and the establishment of a new normal.`,
      resolved: false
    }
  ];

  const continuityIssues: ContinuityIssue[] = [
    {
      id: 'ci-three-act-starter',
      title: 'World Rule Calibration: Ordinary vs. Special World Rules',
      question: 'Do the societal and physical rules established in Act I remain consistent when entering Act II?',
      severity: 'low',
      status: 'open',
      passageA: {
        sceneId: scene1Id,
        sceneTitle: 'Act I: 1. Status Quo & The Ordinary World',
        excerpt: 'Daily habits formed an armor—measured footsteps upon worn floorboards...'
      },
      passageB: {
        sceneId: 'scene-act2-5',
        sceneTitle: 'Act II: 5. Rising Action & First Trials',
        excerpt: 'Entering unfamiliar territory. Navigating new rules...'
      }
    }
  ];

  return {
    project,
    chapters,
    scenes,
    activeSceneId: scene1Id,
    entities,
    threads,
    events,
    continuityIssues,
    revisionPasses,
    cuttingRoom: [],
    notes,
    snapshots: [],
    aiAuditLogs: []
  };
}

// ---------------------------------------------------------------------------
// 2. SAVE THE CAT! BEAT SHEET BOILERPLATE
// ---------------------------------------------------------------------------
function createSaveTheCatBundle(
  projId: string,
  title: string,
  type: ProjectType,
  protagonist: string,
  situation: string,
  config: ProjectSetupConfig
): ProjectBundle {
  const scene1Id = 'scene-stc-1';

  const project: Project = {
    id: projId,
    title,
    type,
    protagonist,
    situation,
    genre: config.genre || 'Commercial Fiction',
    desiredSessionGoal: config.desiredSessionGoal || 'Nail the Opening Image snapshot and hint at the Theme Stated.',
    targetWordCount: config.targetWordCount || (type === 'Novel' ? 80000 : 25000),
    status: 'drafting',
    lastActiveSceneId: scene1Id,
    framework: 'save-the-cat',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const starterProse = type === 'Novel'
    ? `If you paused time and captured ${protagonist} at precisely this hour, you would see a portrait of a life trapped inside its own reflection.

The room smelled of stale coffee, cold paper, and familiar dissatisfaction. Everything sat in its appointed place, exactly where it had sat for six hundred days. A safe, enclosed kingdom of small compromises.

"Nothing changes here," a voice had warned once. "Until something breaks."

The sudden sound arrived like a stone through glass: ${situation}`
    : `INT. PROTAGONIST'S STAGNANT WORLD - DAY\n\nOPENING IMAGE.\n\n${protagonist.toUpperCase()} sits in the center of the frame. Surrounded by clutter, unfinished business, and stagnant routine.\n\nA visual metaphor for everything that is incomplete in their life.\n\nThen: THE DISRUPTION.\n\n${situation.toUpperCase()}`;

  const chapters: Chapter[] = [
    {
      id: 'chap-stc-1',
      number: 1,
      title: 'Opening Image & Theme Stated',
      actOrPhase: 'Act 1: Thesis World',
      description: 'The starting snapshot of the world before change, accompanied by a subtle statement of the moral premise.',
      sceneIds: [scene1Id, 'scene-stc-2']
    },
    {
      id: 'chap-stc-2',
      number: 2,
      title: 'The Setup & Missing Pieces',
      actOrPhase: 'Act 1: Thesis World',
      description: 'Explores the daily habits, flaws, and the six things that urgently need fixing in the protagonist’s life.',
      sceneIds: ['scene-stc-3']
    },
    {
      id: 'chap-stc-3',
      number: 3,
      title: 'The Catalyst Strikes',
      actOrPhase: 'Act 1: Thesis World',
      description: 'The disruptive incident that knocks down the house of cards and shatters the status quo.',
      sceneIds: ['scene-stc-4']
    },
    {
      id: 'chap-stc-4',
      number: 4,
      title: 'The Debate',
      actOrPhase: 'Act 1: Thesis World',
      description: 'Weighing the terror of the unknown and questioning whether change is possible or too costly.',
      sceneIds: ['scene-stc-5']
    },
    {
      id: 'chap-stc-5',
      number: 5,
      title: 'Break into Two',
      actOrPhase: 'Act 1: Thesis World',
      description: 'An irreversible choice: stepping across the threshold from the Thesis world into the Antithesis world.',
      sceneIds: ['scene-stc-6']
    },
    {
      id: 'chap-stc-6',
      number: 6,
      title: 'The B Story & Mirror Soul',
      actOrPhase: 'Act 2: Antithesis World',
      description: 'Introduction of the key thematic ally, mentor, or romantic counterpart who will guide spiritual change.',
      sceneIds: ['scene-stc-7']
    },
    {
      id: 'chap-stc-7',
      number: 7,
      title: 'Fun & Games: The Core Premise',
      actOrPhase: 'Act 2: Antithesis World',
      description: 'Delivering the unique entertainment and dramatic situations promised by the story idea.',
      sceneIds: ['scene-stc-8']
    },
    {
      id: 'chap-stc-8',
      number: 8,
      title: 'The Midpoint Reversal',
      actOrPhase: 'Act 2: Antithesis World',
      description: 'False Victory or False Defeat. The ticking clock begins and stakes escalate from casual to life-or-death.',
      sceneIds: ['scene-stc-9']
    },
    {
      id: 'chap-stc-9',
      number: 9,
      title: 'Bad Guys Close In',
      actOrPhase: 'Act 2: Antithesis World',
      description: 'External pressures mount while internal doubts, secret agendas, and fissures divide the team.',
      sceneIds: ['scene-stc-10']
    },
    {
      id: 'chap-stc-10',
      number: 10,
      title: 'All Hope Is Lost',
      actOrPhase: 'Act 2: Antithesis World',
      description: 'The Whiff of Death. The original plan dies, illusions are stripped bare, and the protagonist feels defeated.',
      sceneIds: ['scene-stc-11']
    },
    {
      id: 'chap-stc-11',
      number: 11,
      title: 'Dark Night of the Soul',
      actOrPhase: 'Act 2: Antithesis World',
      description: 'The profound silence before the breakthrough. Mourning the old ego and finding the bedrock truth.',
      sceneIds: ['scene-stc-12']
    },
    {
      id: 'chap-stc-12',
      number: 12,
      title: 'Break into Three & The Epiphany',
      actOrPhase: 'Act 3: Synthesis World',
      description: 'Synthesizing the lessons of the B Story with a proactive new strategy for the finale.',
      sceneIds: ['scene-stc-13']
    },
    {
      id: 'chap-stc-13',
      number: 13,
      title: 'The Five-Point Finale',
      actOrPhase: 'Act 3: Synthesis World',
      description: 'Storming the citadel: executing the plan, facing high treason, and overcoming the central flaw.',
      sceneIds: ['scene-stc-14']
    },
    {
      id: 'chap-stc-14',
      number: 14,
      title: 'The Final Image & Transformed World',
      actOrPhase: 'Act 3: Synthesis World',
      description: 'The visual bookend to the Opening Image, proving that the protagonist and their world have permanently evolved.',
      sceneIds: ['scene-stc-15']
    }
  ];

  const stcBeats = [
    { order: 1, name: '1. Opening Image', desc: 'A snapshot of the protagonist’s world and starting flaw before the journey begins.', id: scene1Id, prose: starterProse, chapterId: 'chap-stc-1', chapterNum: 1, chapterTitle: 'Opening Image & Theme Stated', act: 'Act 1: Thesis World' },
    { order: 2, name: '2. Theme Stated', desc: 'A subtle conversation or cue that articulates the life lesson the protagonist must learn.', id: 'scene-stc-2', prose: '', chapterId: 'chap-stc-1', chapterNum: 1, chapterTitle: 'Opening Image & Theme Stated', act: 'Act 1: Thesis World' },
    { order: 3, name: '3. Set-up', desc: 'Explore the protagonist’s life, flaws, and the "six things that need fixing" in their world.', id: 'scene-stc-3', prose: '', chapterId: 'chap-stc-2', chapterNum: 2, chapterTitle: 'The Setup & Missing Pieces', act: 'Act 1: Thesis World' },
    { order: 4, name: '4. Catalyst', desc: 'The life-changing incident that knocks down the house of cards and shatters the status quo.', id: 'scene-stc-4', prose: '', chapterId: 'chap-stc-3', chapterNum: 3, chapterTitle: 'The Catalyst Strikes', act: 'Act 1: Thesis World' },
    { order: 5, name: '5. Debate', desc: 'The hesitation question: "Can I really do this?" Weighing the terror of stepping into the unknown.', id: 'scene-stc-5', prose: '', chapterId: 'chap-stc-4', chapterNum: 4, chapterTitle: 'The Debate', act: 'Act 1: Thesis World' },
    { order: 6, name: '6. Break into Two', desc: 'The active choice to leave the thesis world and cross into the upside-down antithesis world.', id: 'scene-stc-6', prose: '', chapterId: 'chap-stc-5', chapterNum: 5, chapterTitle: 'Break into Two', act: 'Act 1: Thesis World' },
    { order: 7, name: '7. B Story', desc: 'Introduction of the key relationship (friend, mentor, or romance) that will carry the theme.', id: 'scene-stc-7', prose: '', chapterId: 'chap-stc-6', chapterNum: 6, chapterTitle: 'The B Story & Mirror Soul', act: 'Act 2: Antithesis World' },
    { order: 8, name: '8. Fun and Games', desc: 'The promise of the premise! The trailer moments where the story delivers its core concept.', id: 'scene-stc-8', prose: '', chapterId: 'chap-stc-7', chapterNum: 7, chapterTitle: 'Fun & Games: The Core Premise', act: 'Act 2: Antithesis World' },
    { order: 9, name: '9. Midpoint', desc: 'Stakes escalate! False Victory or False Defeat. The ticking clock starts; pressure tightens.', id: 'scene-stc-9', prose: '', chapterId: 'chap-stc-8', chapterNum: 8, chapterTitle: 'The Midpoint Reversal', act: 'Act 2: Antithesis World' },
    { order: 10, name: '10. Bad Guys Close In', desc: 'External enemies coordinate their assault while internal division and doubt tear the team apart.', id: 'scene-stc-10', prose: '', chapterId: 'chap-stc-9', chapterNum: 9, chapterTitle: 'Bad Guys Close In', act: 'Act 2: Antithesis World' },
    { order: 11, name: '11. All Hope Is Lost', desc: 'The "whiff of death". The worst fears materialize; the original strategy has completely failed.', id: 'scene-stc-11', prose: '', chapterId: 'chap-stc-10', chapterNum: 10, chapterTitle: 'All Hope Is Lost', act: 'Act 2: Antithesis World' },
    { order: 12, name: '12. Dark Night of the Soul', desc: 'The quiet hour before dawn. Mourning the death of the old self and accepting the bitter truth.', id: 'scene-stc-12', prose: '', chapterId: 'chap-stc-11', chapterNum: 11, chapterTitle: 'Dark Night of the Soul', act: 'Act 2: Antithesis World' },
    { order: 13, name: '13. Break into Three', desc: 'The epiphany! The protagonist synthesizes the B-Story theme with their new plan.', id: 'scene-stc-13', prose: '', chapterId: 'chap-stc-12', chapterNum: 12, chapterTitle: 'Break into Three & The Epiphany', act: 'Act 3: Synthesis World' },
    { order: 14, name: '14. Finale', desc: 'Executing the new plan across the five-point finale. Storming the castle and defeating the flaw.', id: 'scene-stc-14', prose: '', chapterId: 'chap-stc-13', chapterNum: 13, chapterTitle: 'The Five-Point Finale', act: 'Act 3: Synthesis World' },
    { order: 15, name: '15. Final Image', desc: 'The visual opposite of the Opening Image. Concrete proof that permanent change has taken root.', id: 'scene-stc-15', prose: '', chapterId: 'chap-stc-14', chapterNum: 14, chapterTitle: 'The Final Image & Transformed World', act: 'Act 3: Synthesis World' }
  ];

  const scenes: Scene[] = stcBeats.map((b) => ({
    id: b.id,
    title: `Beat ${b.name}`,
    order: b.order,
    chapterId: b.chapterId,
    chapterNumber: b.chapterNum,
    chapterTitle: b.chapterTitle,
    actOrPhase: b.act,
    narrativeBeat: b.name,
    premise: b.desc,
    characters: [protagonist],
    location: b.order <= 5 ? 'Thesis World' : b.order <= 12 ? 'Antithesis World' : 'Synthesis World',
    time: `Phase ${b.order}`,
    pov: `${protagonist} (Third Limited)`,
    status: 'draft',
    wordCount: b.prose ? b.prose.trim().split(/\s+/).length : 0,
    notes: `Save the Cat! guideline: ${b.desc}`,
    proseContent: b.prose,
    comments: []
  }));

  const threads: Thread[] = [
    {
      id: 'th-stc-a-story',
      title: 'A-Story: The External Goal',
      description: 'The tangible, high-stakes external objective driving the protagonist through all 15 beats.',
      status: 'active',
      color: '#C2410C',
      linkedSceneIds: [scene1Id, 'scene-stc-4', 'scene-stc-6', 'scene-stc-9', 'scene-stc-11', 'scene-stc-14']
    },
    {
      id: 'th-stc-b-story',
      title: 'B-Story: The Relationship & Theme Delivery',
      description: 'The bond that challenges the protagonist to embrace the truth stated in Beat 2.',
      status: 'active',
      color: '#0F766E',
      linkedSceneIds: ['scene-stc-2', 'scene-stc-7', 'scene-stc-9', 'scene-stc-12', 'scene-stc-13', 'scene-stc-15']
    },
    {
      id: 'th-stc-ticking-clock',
      title: 'Ticking Clock & Antagonistic Pressure',
      description: 'The escalating countdown and opposing forces driving the Bad Guys Close In beats.',
      status: 'active',
      color: '#991B1B',
      linkedSceneIds: ['scene-stc-9', 'scene-stc-10', 'scene-stc-11', 'scene-stc-14']
    }
  ];

  const entities: Entity[] = [
    {
      id: 'ent-stc-protagonist',
      name: protagonist,
      type: 'character',
      status: 'confirmed',
      description: 'The protagonist starting in the Thesis world, burdened by flaws and ripe for transformation.',
      canonicalFacts: [
        'Has a deep, unacknowledged need that clashes with what they consciously want.'
      ],
      linkedSceneIds: [scene1Id, 'scene-stc-6', 'scene-stc-9', 'scene-stc-12', 'scene-stc-15']
    },
    {
      id: 'ent-stc-b-story-partner',
      name: 'B-Story Catalyst / Foil',
      type: 'character',
      status: 'confirmed',
      description: 'The partner, rival, or mentor who speaks the truth the protagonist is not yet ready to hear.',
      canonicalFacts: [
        'Introduced in Beat 7 (B-Story)',
        'Carries the thematic wisdom that rescues the protagonist during the Dark Night.'
      ],
      linkedSceneIds: ['scene-stc-7', 'scene-stc-9', 'scene-stc-12', 'scene-stc-13']
    }
  ];

  const events: StoryEvent[] = [
    {
      id: 'ev-stc-catalyst',
      title: 'The Catalyst',
      time: 'Act 1',
      participants: [protagonist],
      consequences: 'Destroys the old status quo; demands a choice.',
      linkedSceneId: 'scene-stc-4'
    },
    {
      id: 'ev-stc-midpoint',
      title: 'The Midpoint Stakes Escalation',
      time: 'Act 2 Midpoint',
      participants: [protagonist],
      consequences: 'False peak; stakes invert and the countdown commences.',
      linkedSceneId: 'scene-stc-9'
    },
    {
      id: 'ev-stc-whiff-of-death',
      title: 'All Hope Is Lost (Whiff of Death)',
      time: 'Late Act 2',
      participants: [protagonist],
      consequences: 'Total collapse of the initial scheme; clearing the way for genuine thematic rebirth.',
      linkedSceneId: 'scene-stc-11'
    }
  ];

  const revisionPasses: RevisionPass[] = [
    {
      id: 'rp-stc-beats-audit',
      name: 'Save the Cat! Core Beats Pacing Audit',
      description: 'Ensure the 15 beats hit their emotional benchmarks and preserve narrative momentum.',
      checklist: [
        { id: 'c-stc-1', label: 'Does the Opening Image establish what is broken in the protagonist’s life?', done: false, sceneId: scene1Id },
        { id: 'c-stc-2', label: 'Is the Theme Stated clearly in dialogue or event within the first 10%?', done: false, sceneId: 'scene-stc-2' },
        { id: 'c-stc-3', label: 'Does the Break into Two represent a proactive choice rather than passive drift?', done: false, sceneId: 'scene-stc-6' },
        { id: 'c-stc-4', label: 'Does Fun and Games deliver on the core premise of your book concept?', done: false, sceneId: 'scene-stc-8' }
      ]
    },
    {
      id: 'rp-stc-mirror',
      name: 'Opening vs. Final Image Transformation Check',
      description: 'Verify that Beat 15 visually and emotionally inverts Beat 1 to prove undeniable transformation.',
      checklist: [
        { id: 'c-stc-5', label: 'Place Opening Image and Final Image side-by-side to inspect the contrast', done: false, sceneId: 'scene-stc-15' }
      ]
    }
  ];

  const notes: NoteItem[] = [
    {
      id: 'note-stc-guide',
      title: 'Save the Cat! Beat Sheet Companion',
      category: 'research',
      content: `Blake Snyder’s 15 Beats guide:\n\n• Act 1 (1-25%): Opening Image, Theme Stated, Set-up, Catalyst, Debate, Break into Two.\n• Act 2 (25-75%): B Story, Fun and Games, Midpoint (raise stakes!), Bad Guys Close In, All Hope Is Lost, Dark Night of the Soul.\n• Act 3 (75-100%): Break into Three, Finale (Gather team, execute plan, high tower surprise, new plan, victory), Final Image.`,
      resolved: false
    }
  ];

  const continuityIssues: ContinuityIssue[] = [
    {
      id: 'ci-stc-starter',
      title: 'Thematic Echo: Theme Stated vs. Epiphany',
      question: 'Does the realization in Break into Three directly answer the philosophical premise spoken in Theme Stated?',
      severity: 'medium',
      status: 'open',
      passageA: {
        sceneId: 'scene-stc-2',
        sceneTitle: 'Beat 2. Theme Stated',
        excerpt: 'A subtle conversation or cue that articulates the life lesson...'
      },
      passageB: {
        sceneId: 'scene-stc-13',
        sceneTitle: 'Beat 13. Break into Three',
        excerpt: 'The epiphany! The protagonist synthesizes the B-Story theme...'
      }
    }
  ];

  return {
    project,
    chapters,
    scenes,
    activeSceneId: scene1Id,
    entities,
    threads,
    events,
    continuityIssues,
    revisionPasses,
    cuttingRoom: [],
    notes,
    snapshots: [],
    aiAuditLogs: []
  };
}

// ---------------------------------------------------------------------------
// 3. THE HERO'S JOURNEY (MONOMYTH) BOILERPLATE
// ---------------------------------------------------------------------------
function createHerosJourneyBundle(
  projId: string,
  title: string,
  type: ProjectType,
  protagonist: string,
  situation: string,
  config: ProjectSetupConfig
): ProjectBundle {
  const scene1Id = 'scene-hero-1';

  const project: Project = {
    id: projId,
    title,
    type,
    protagonist,
    situation,
    genre: config.genre || 'Mythic Adventure / Speculative Saga',
    desiredSessionGoal: config.desiredSessionGoal || 'Establish the Ordinary World textures and hint at the heralds of the Call.',
    targetWordCount: config.targetWordCount || (type === 'Novel' ? 85000 : 30000),
    status: 'drafting',
    lastActiveSceneId: scene1Id,
    framework: 'heros-journey',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const starterProse = type === 'Novel'
    ? `The boundary of the valley was where the known world came to an end.

For ${protagonist}, the Ordinary World was a tapestry of predictable seasons, familiar boundaries, and quiet, unuttered longings. Everyone here knew their station; traditions were etched into stone markers along the cart tracks.

And yet, watching the horizon where grey crags met the cloudbank, an unsettling feeling lingered—a certainty that this valley was not a cradle, but a cage.

Then, across the frontier, came the sign: ${situation}`
    : `EXT. THE ORDINARY WORLD - DAY\n\nA quiet, enclosed settlement at the boundary of a vast, uncharted continent.\n\n${protagonist.toUpperCase()} works within the rhythm of ancestral routine, but their eyes constantly stray toward the forbidden border.\n\nA HERALD ARRIVES.\n\n${situation.toUpperCase()}`;

  const chapters: Chapter[] = [
    {
      id: 'chap-hero-1',
      number: 1,
      title: 'The Ordinary World',
      actOrPhase: 'Departure / Separation',
      description: 'The protagonist in their humble starting ground, establishing limitations, routines, and unfulfilled yearning.',
      sceneIds: [scene1Id]
    },
    {
      id: 'chap-hero-2',
      number: 2,
      title: 'Call to Adventure & The Hesitation',
      actOrPhase: 'Departure / Separation',
      description: 'A herald or disaster brings the call, met initially by internal fear, doubt, and hesitation.',
      sceneIds: ['scene-hero-2', 'scene-hero-3']
    },
    {
      id: 'chap-hero-3',
      number: 3,
      title: 'Meeting with the Mentor',
      actOrPhase: 'Departure / Separation',
      description: 'A guide endowed with wisdom or talismans provides training, equipment, and confidence for the journey.',
      sceneIds: ['scene-hero-4']
    },
    {
      id: 'chap-hero-4',
      number: 4,
      title: 'Crossing the First Threshold',
      actOrPhase: 'Departure / Separation',
      description: 'The hero steps past the threshold guardians into the Special World, leaving the known world behind.',
      sceneIds: ['scene-hero-5']
    },
    {
      id: 'chap-hero-5',
      number: 5,
      title: 'Tests, Allies, and Enemies',
      actOrPhase: 'Initiation / Trials',
      description: 'Navigating the new realm: learning allies from foes, passing trial tests, and forging comradeship.',
      sceneIds: ['scene-hero-6']
    },
    {
      id: 'chap-hero-6',
      number: 6,
      title: 'Approach to the Inmost Cave',
      actOrPhase: 'Initiation / Trials',
      description: 'Marching toward the stronghold of supreme danger; final preparations and psychological dread.',
      sceneIds: ['scene-hero-7']
    },
    {
      id: 'chap-hero-7',
      number: 7,
      title: 'The Supreme Ordeal',
      actOrPhase: 'Initiation / Trials',
      description: 'The central death-and-rebirth crisis. Confronting the greatest terror and surviving on a razor’s edge.',
      sceneIds: ['scene-hero-8']
    },
    {
      id: 'chap-hero-8',
      number: 8,
      title: 'Seizing the Reward',
      actOrPhase: 'Initiation / Trials',
      description: 'Claiming the treasure, talisman, or sacred knowledge earned through surviving the ordeal.',
      sceneIds: ['scene-hero-9']
    },
    {
      id: 'chap-hero-9',
      number: 9,
      title: 'The Road Back',
      actOrPhase: 'Return & Transformation',
      description: 'Urgency redoubles! Retaliation from shadow forces; a desperate chase to bring the elixir home.',
      sceneIds: ['scene-hero-10']
    },
    {
      id: 'chap-hero-10',
      number: 10,
      title: 'The Resurrection Test',
      actOrPhase: 'Return & Transformation',
      description: 'The ultimate cleansing exam: a final test requiring the hero’s complete moral and spiritual evolution.',
      sceneIds: ['scene-hero-11']
    },
    {
      id: 'chap-hero-11',
      number: 11,
      title: 'Return with the Elixir',
      actOrPhase: 'Return & Transformation',
      description: 'Returning to the Ordinary World transformed, bearing the healing wisdom or power that regenerates society.',
      sceneIds: ['scene-hero-12']
    }
  ];

  const heroStages = [
    { order: 1, name: '1. The Ordinary World', desc: 'The hero’s humble starting ground, establishing limitations, routines, and unfulfilled yearning.', id: scene1Id, prose: starterProse, chapterId: 'chap-hero-1', chapterNum: 1, chapterTitle: 'The Ordinary World', act: 'Departure / Separation' },
    { order: 2, name: '2. Call to Adventure', desc: 'A herald, disaster, or message arrives, challenging the hero and offering a quest with deep stakes.', id: 'scene-hero-2', prose: '', chapterId: 'chap-hero-2', chapterNum: 2, chapterTitle: 'Call to Adventure & The Hesitation', act: 'Departure / Separation' },
    { order: 3, name: '3. Refusal of the Call', desc: 'Fear, familial obligations, or doubt induce hesitation; the cost of departure seems too steep.', id: 'scene-hero-3', prose: '', chapterId: 'chap-hero-2', chapterNum: 2, chapterTitle: 'Call to Adventure & The Hesitation', act: 'Departure / Separation' },
    { order: 4, name: '4. Meeting the Mentor', desc: 'A guide endowed with wisdom or talismans provides training, confidence, or equipment for the road.', id: 'scene-hero-4', prose: '', chapterId: 'chap-hero-3', chapterNum: 3, chapterTitle: 'Meeting with the Mentor', act: 'Departure / Separation' },
    { order: 5, name: '5. Crossing the First Threshold', desc: 'The hero steps past the threshold guardians into the Special World, where foreign rules prevail.', id: 'scene-hero-5', prose: '', chapterId: 'chap-hero-4', chapterNum: 4, chapterTitle: 'Crossing the First Threshold', act: 'Departure / Separation' },
    { order: 6, name: '6. Tests, Allies, and Enemies', desc: 'Navigating the new realm: learning allies from foes, passing trial tests, and forging comradeship.', id: 'scene-hero-6', prose: '', chapterId: 'chap-hero-5', chapterNum: 5, chapterTitle: 'Tests, Allies, and Enemies', act: 'Initiation / Trials' },
    { order: 7, name: '7. Approach to the Inmost Cave', desc: 'Marching toward the stronghold of great danger; making final preparations and facing psychological dread.', id: 'scene-hero-7', prose: '', chapterId: 'chap-hero-6', chapterNum: 6, chapterTitle: 'Approach to the Inmost Cave', act: 'Initiation / Trials' },
    { order: 8, name: '8. The Supreme Ordeal', desc: 'The central death-and-rebirth crisis. Confronting the greatest fear and surviving on razor’s edge.', id: 'scene-hero-8', prose: '', chapterId: 'chap-hero-7', chapterNum: 7, chapterTitle: 'The Supreme Ordeal', act: 'Initiation / Trials' },
    { order: 9, name: '9. The Reward (Seizing the Sword)', desc: 'Claiming the treasure, elixir, or sacred knowledge earned through surviving the ordeal.', id: 'scene-hero-9', prose: '', chapterId: 'chap-hero-8', chapterNum: 8, chapterTitle: 'Seizing the Reward', act: 'Initiation / Trials' },
    { order: 10, name: '10. The Road Back', desc: 'Urgency redoubles! Retaliation from the shadow forces; a desperate chase to bring the elixir home.', id: 'scene-hero-10', prose: '', chapterId: 'chap-hero-9', chapterNum: 9, chapterTitle: 'The Road Back', act: 'Return & Transformation' },
    { order: 11, name: '11. The Resurrection', desc: 'The ultimate cleansing exam: a final test on higher moral ground requiring the hero’s complete evolution.', id: 'scene-hero-11', prose: '', chapterId: 'chap-hero-10', chapterNum: 10, chapterTitle: 'The Resurrection Test', act: 'Return & Transformation' },
    { order: 12, name: '12. Return with the Elixir', desc: 'Returning to the Ordinary World transformed, bearing the healing wisdom or power that regenerates society.', id: 'scene-hero-12', prose: '', chapterId: 'chap-hero-11', chapterNum: 11, chapterTitle: 'Return with the Elixir', act: 'Return & Transformation' }
  ];

  const scenes: Scene[] = heroStages.map((s) => ({
    id: s.id,
    title: `Stage ${s.name}`,
    order: s.order,
    chapterId: s.chapterId,
    chapterNumber: s.chapterNum,
    chapterTitle: s.chapterTitle,
    actOrPhase: s.act,
    narrativeBeat: s.name,
    premise: s.desc,
    characters: [protagonist],
    location: s.order <= 4 ? 'The Ordinary World' : s.order <= 11 ? 'The Special World' : 'Renewed World',
    time: `Stage ${s.order}`,
    pov: `${protagonist} (Third Limited)`,
    status: 'draft',
    wordCount: s.prose ? s.prose.trim().split(/\s+/).length : 0,
    notes: `Hero’s Journey archetypal note: ${s.desc}`,
    proseContent: s.prose,
    comments: []
  }));

  const threads: Thread[] = [
    {
      id: 'th-hero-quest',
      title: 'The Mythic Quest (External Trial)',
      description: 'The heroic pilgrimage from the Ordinary World through the Inmost Cave to return with the Elixir.',
      status: 'active',
      color: '#4338CA',
      linkedSceneIds: [scene1Id, 'scene-hero-2', 'scene-hero-5', 'scene-hero-8', 'scene-hero-9', 'scene-hero-12']
    },
    {
      id: 'th-hero-shadow',
      title: 'The Shadow & Inner Wound',
      description: 'The internal darkness, doubts, and psychological shadows mirrored by the antagonist.',
      status: 'active',
      color: '#7E22CE',
      linkedSceneIds: [scene1Id, 'scene-hero-3', 'scene-hero-8', 'scene-hero-11']
    },
    {
      id: 'th-hero-mentor',
      title: "The Mentor's Legacy",
      description: 'The teachings, talisman, and ethical code imparted by the guide.',
      status: 'active',
      color: '#0369A1',
      linkedSceneIds: ['scene-hero-4', 'scene-hero-7', 'scene-hero-11', 'scene-hero-12']
    }
  ];

  const entities: Entity[] = [
    {
      id: 'ent-hero-protagonist',
      name: protagonist,
      type: 'character',
      status: 'confirmed',
      description: 'The Hero called from ordinary circumstances to endure the trials of the special realm.',
      canonicalFacts: [
        'Carries a latent virtue or unique sensitivity that enables them to cross the threshold.'
      ],
      linkedSceneIds: [scene1Id, 'scene-hero-5', 'scene-hero-8', 'scene-hero-12']
    },
    {
      id: 'ent-hero-mentor',
      name: 'The Mentor / Guide',
      type: 'character',
      status: 'confirmed',
      description: 'The keeper of ancient knowledge who equips the hero for the trials ahead.',
      canonicalFacts: [
        'Bestows a key talisman or vital insight in Stage 4.'
      ],
      linkedSceneIds: ['scene-hero-4', 'scene-hero-7']
    },
    {
      id: 'ent-hero-special-world',
      name: 'The Special World (Realm of Trials)',
      type: 'place',
      status: 'confirmed',
      description: 'The mystical, hostile, or unfamiliar territory governed by tests and threshold guardians.',
      canonicalFacts: [
        'Inverts the rules and securities of the Ordinary World.'
      ],
      linkedSceneIds: ['scene-hero-5', 'scene-hero-6', 'scene-hero-8']
    }
  ];

  const events: StoryEvent[] = [
    {
      id: 'ev-hero-threshold',
      title: 'Crossing the First Threshold',
      time: 'Stage 5',
      participants: [protagonist],
      consequences: 'Departure from safety; entry into the trials of the Special World.',
      linkedSceneId: 'scene-hero-5'
    },
    {
      id: 'ev-hero-ordeal',
      title: 'The Supreme Ordeal',
      time: 'Stage 8',
      participants: [protagonist],
      consequences: 'Near-death experience, symbolic rebirth, and claiming the Elixir.',
      linkedSceneId: 'scene-hero-8'
    }
  ];

  const revisionPasses: RevisionPass[] = [
    {
      id: 'rp-hero-world-contrast',
      name: 'Ordinary World vs. Special World Sensory Contrast',
      description: 'Check that the Ordinary World and Special World feel vividly distinct in atmosphere, danger, and rhythm.',
      checklist: [
        { id: 'c-hero-1', label: 'Verify the Ordinary World feels tangible, restricted, and distinct', done: false, sceneId: scene1Id },
        { id: 'c-hero-2', label: 'Ensure the Threshold crossing feels weighty and psychologically irreversible', done: false, sceneId: 'scene-hero-5' }
      ]
    },
    {
      id: 'rp-hero-elixir',
      name: 'Ordeal & Elixir Resonance Check',
      description: 'Audit the Supreme Ordeal to ensure the Elixir won is genuine and capable of healing the Ordinary World.',
      checklist: [
        { id: 'c-hero-3', label: 'Does the Supreme Ordeal extract a true sacrifice or brush with death?', done: false, sceneId: 'scene-hero-8' },
        { id: 'c-hero-4', label: 'Does the Return with the Elixir demonstrate how the hero’s community is healed or renewed?', done: false, sceneId: 'scene-hero-12' }
      ]
    }
  ];

  const notes: NoteItem[] = [
    {
      id: 'note-hero-guide',
      title: "Hero's Journey Archetypal Codex",
      category: 'research',
      content: `Christopher Vogler’s 12 Stages:\n\n1. Ordinary World -> 2. Call to Adventure -> 3. Refusal -> 4. Meeting Mentor -> 5. Crossing Threshold\n6. Tests/Allies/Enemies -> 7. Approach to Inmost Cave -> 8. Ordeal -> 9. Reward\n10. Road Back -> 11. Resurrection -> 12. Return with Elixir\n\nEnsure every archetype (Shadow, Herald, Threshold Guardian, Trickster, Shape-shifter) tests a distinct facet of the hero's soul.`,
      resolved: false
    }
  ];

  const continuityIssues: ContinuityIssue[] = [
    {
      id: 'ci-hero-starter',
      title: 'Talisman Continuity: Mentor’s Gift',
      question: 'Is the mentor’s talisman or advice properly referenced and utilized during the Supreme Ordeal in the Inmost Cave?',
      severity: 'medium',
      status: 'open',
      passageA: {
        sceneId: 'scene-hero-4',
        sceneTitle: 'Stage 4. Meeting the Mentor',
        excerpt: 'A guide endowed with wisdom or talismans provides training...'
      },
      passageB: {
        sceneId: 'scene-hero-8',
        sceneTitle: 'Stage 8. The Supreme Ordeal',
        excerpt: 'The central death-and-rebirth crisis. Confronting the greatest fear...'
      }
    }
  ];

  return {
    project,
    chapters,
    scenes,
    activeSceneId: scene1Id,
    entities,
    threads,
    events,
    continuityIssues,
    revisionPasses,
    cuttingRoom: [],
    notes,
    snapshots: [],
    aiAuditLogs: []
  };
}

// ---------------------------------------------------------------------------
// 4. DAN HARMON'S STORY CIRCLE BOILERPLATE
// ---------------------------------------------------------------------------
function createStoryCircleBundle(
  projId: string,
  title: string,
  type: ProjectType,
  protagonist: string,
  situation: string,
  config: ProjectSetupConfig
): ProjectBundle {
  const scene1Id = 'scene-circle-1';

  const project: Project = {
    id: projId,
    title,
    type,
    protagonist,
    situation,
    genre: config.genre || 'Modern Speculative / Character Drama',
    desiredSessionGoal: config.desiredSessionGoal || 'Set up the Zone of Comfort (YOU) and the emerging hunger or void (NEED).',
    targetWordCount: config.targetWordCount || (type === 'Novel' ? 70000 : 25000),
    status: 'drafting',
    lastActiveSceneId: scene1Id,
    framework: 'story-circle',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const starterProse = type === 'Novel'
    ? `${protagonist} was comfortable. That was the core problem.

In the small, well-lit perimeter of everyday existence, everything functioned according to expectations. The rhythm was established, the perimeter was quiet, and nothing asked for more than could be safely given.

Yet inside that comfort, a small hunger had begun to gnaw—a sharp, quiet realization that comfort is just another word for standing still.

And then, the crack in the floorboards appeared: ${situation}`
    : `INT. ZONE OF COMFORT - DAY\n\nSTEP 1: YOU.\n\n${protagonist.toUpperCase()} in their element. Master of this small domain. Everything works, everything is in its place.\n\nAND YET: AN ACHING VOID.\n\n${situation.toUpperCase()}`;

  const chapters: Chapter[] = [
    {
      id: 'chap-circle-1',
      number: 1,
      title: 'YOU — The Zone of Comfort',
      actOrPhase: 'Top Hemisphere: Order',
      description: 'Establish the protagonist in their familiar, comfortable status quo and everyday rhythms.',
      sceneIds: [scene1Id]
    },
    {
      id: 'chap-circle-2',
      number: 2,
      title: 'NEED — Desire & The Crack in Reality',
      actOrPhase: 'Top Hemisphere: Order',
      description: 'A profound want, lack, or external disruption creates an irresistible hunger for something more.',
      sceneIds: ['scene-circle-2']
    },
    {
      id: 'chap-circle-3',
      number: 3,
      title: 'GO — Crossing into the Unknown',
      actOrPhase: 'Bottom Hemisphere: Chaos',
      description: 'Crossing the boundary from the Order hemisphere into the Chaos hemisphere of the unknown.',
      sceneIds: ['scene-circle-3']
    },
    {
      id: 'chap-circle-4',
      number: 4,
      title: 'SEARCH — The Road of Trials',
      actOrPhase: 'Bottom Hemisphere: Chaos',
      description: 'Adapting to chaos: experimenting with new habits, hunting for answers, and taking bruises.',
      sceneIds: ['scene-circle-4']
    },
    {
      id: 'chap-circle-5',
      number: 5,
      title: 'FIND — The Core Discovery',
      actOrPhase: 'Bottom Hemisphere: Chaos',
      description: 'Reaching the deep center of the circle: finding what was sought (the treasure, truth, or prize).',
      sceneIds: ['scene-circle-5']
    },
    {
      id: 'chap-circle-6',
      number: 6,
      title: 'TAKE — The Heavy Price',
      actOrPhase: 'Bottom Hemisphere: Chaos',
      description: 'The terrible cost of acquisition. Paying a steep price (loss, injury, sacrifice) for taking the prize.',
      sceneIds: ['scene-circle-6']
    },
    {
      id: 'chap-circle-7',
      number: 7,
      title: 'RETURN — Racing Back to Order',
      actOrPhase: 'Top Hemisphere: Order',
      description: 'Leaving the Chaos hemisphere and racing back toward the familiar world of order.',
      sceneIds: ['scene-circle-7']
    },
    {
      id: 'chap-circle-8',
      number: 8,
      title: 'CHANGE — Master of Both Worlds',
      actOrPhase: 'Top Hemisphere: Order',
      description: 'Back where they began, but fundamentally altered—master of both the old world and the new.',
      sceneIds: ['scene-circle-8']
    }
  ];

  const circleSteps = [
    { order: 1, name: '1. YOU (Zone of Comfort)', desc: 'Establish the protagonist in their familiar, comfortable status quo and everyday rhythms.', id: scene1Id, prose: starterProse, chapterId: 'chap-circle-1', chapterNum: 1, chapterTitle: 'YOU — The Zone of Comfort', act: 'Top Hemisphere: Order' },
    { order: 2, name: '2. NEED (Desire & Disruption)', desc: 'A profound want, lack, or external disruption creates an irresistible hunger for something more.', id: 'scene-circle-2', prose: '', chapterId: 'chap-circle-2', chapterNum: 2, chapterTitle: 'NEED — Desire & The Crack in Reality', act: 'Top Hemisphere: Order' },
    { order: 3, name: '3. GO (Enter Unfamiliar)', desc: 'Crossing the boundary from the Order hemisphere into the Chaos hemisphere of the unknown.', id: 'scene-circle-3', prose: '', chapterId: 'chap-circle-3', chapterNum: 3, chapterTitle: 'GO — Crossing into the Unknown', act: 'Bottom Hemisphere: Chaos' },
    { order: 4, name: '4. SEARCH (Road of Trials)', desc: 'Adapting to chaos: experimenting with new habits, hunting for answers, and taking bruises.', id: 'scene-circle-4', prose: '', chapterId: 'chap-circle-4', chapterNum: 4, chapterTitle: 'SEARCH — The Road of Trials', act: 'Bottom Hemisphere: Chaos' },
    { order: 5, name: '5. FIND (The Discovery)', desc: 'Reaching the deep center of the circle: finding what was sought (the treasure, truth, or prize).', id: 'scene-circle-5', prose: '', chapterId: 'chap-circle-5', chapterNum: 5, chapterTitle: 'FIND — The Core Discovery', act: 'Bottom Hemisphere: Chaos' },
    { order: 6, name: '6. TAKE (The Heavy Price)', desc: 'The terrible cost of acquisition. Paying a steep price (loss, injury, sacrifice) for taking the prize.', id: 'scene-circle-6', prose: '', chapterId: 'chap-circle-6', chapterNum: 6, chapterTitle: 'TAKE — The Heavy Price', act: 'Bottom Hemisphere: Chaos' },
    { order: 7, name: '7. RETURN (Journey Back)', desc: 'Leaving the Chaos hemisphere and racing back toward the familiar world of order.', id: 'scene-circle-7', prose: '', chapterId: 'chap-circle-7', chapterNum: 7, chapterTitle: 'RETURN — Racing Back to Order', act: 'Top Hemisphere: Order' },
    { order: 8, name: '8. CHANGE (Transformed State)', desc: 'Back where they began, but fundamentally altered—master of both the old world and the new.', id: 'scene-circle-8', prose: '', chapterId: 'chap-circle-8', chapterNum: 8, chapterTitle: 'CHANGE — Master of Both Worlds', act: 'Top Hemisphere: Order' }
  ];

  const scenes: Scene[] = circleSteps.map((c) => ({
    id: c.id,
    title: `Step ${c.name}`,
    order: c.order,
    chapterId: c.chapterId,
    chapterNumber: c.chapterNum,
    chapterTitle: c.chapterTitle,
    actOrPhase: c.act,
    narrativeBeat: c.name,
    premise: c.desc,
    characters: [protagonist],
    location: c.order <= 2 || c.order === 8 ? 'Order Hemisphere' : 'Chaos Hemisphere',
    time: `Step ${c.order}`,
    pov: `${protagonist} (Third Limited)`,
    status: 'draft',
    wordCount: c.prose ? c.prose.trim().split(/\s+/).length : 0,
    notes: `Dan Harmon Story Circle step: ${c.desc}`,
    proseContent: c.prose,
    comments: []
  }));

  const threads: Thread[] = [
    {
      id: 'th-circle-need-want',
      title: 'Need vs. Want (Internal Evolution)',
      description: 'The divergence between what the protagonist wants in Step 2 and what they truly need to survive Step 6.',
      status: 'active',
      color: '#059669',
      linkedSceneIds: [scene1Id, 'scene-circle-2', 'scene-circle-5', 'scene-circle-6', 'scene-circle-8']
    },
    {
      id: 'th-circle-search',
      title: 'The Search & Adaptation (Chaos Trials)',
      description: 'The trials through the unfamiliar world as the protagonist unlearns old assumptions.',
      status: 'active',
      color: '#0284C7',
      linkedSceneIds: ['scene-circle-3', 'scene-circle-4', 'scene-circle-5']
    },
    {
      id: 'th-circle-price',
      title: 'The Heavy Price (Consequences)',
      description: 'The inescapable toll exacted in Step 6 (TAKE) that transforms the protagonist.',
      status: 'active',
      color: '#DC2626',
      linkedSceneIds: ['scene-circle-5', 'scene-circle-6', 'scene-circle-7', 'scene-circle-8']
    }
  ];

  const entities: Entity[] = [
    {
      id: 'ent-circle-protagonist',
      name: protagonist,
      type: 'character',
      status: 'confirmed',
      description: 'The character embarking on the cyclical journey from comfort to chaos and back.',
      canonicalFacts: [
        'Starts in a state of comfortable stagnation.',
        'Must pay a heavy price in Step 6 to achieve genuine transformation.'
      ],
      linkedSceneIds: [scene1Id, 'scene-circle-3', 'scene-circle-6', 'scene-circle-8']
    },
    {
      id: 'ent-circle-unfamiliar',
      name: 'The Unfamiliar Realm (Chaos Hemisphere)',
      type: 'place',
      status: 'confirmed',
      description: 'The underworld of chaos where old rules fail and the protagonist must adapt or perish.',
      canonicalFacts: [
        'Occupies Steps 3 through 6 of the Story Circle.'
      ],
      linkedSceneIds: ['scene-circle-3', 'scene-circle-4', 'scene-circle-5', 'scene-circle-6']
    }
  ];

  const events: StoryEvent[] = [
    {
      id: 'ev-circle-crossing',
      title: 'Entering the Chaos Hemisphere (GO)',
      time: 'Step 3',
      participants: [protagonist],
      consequences: 'Leaves the zone of comfort; enters the unfamiliar realm of trials.',
      linkedSceneId: 'scene-circle-3'
    },
    {
      id: 'ev-circle-the-price',
      title: 'Paying the Heavy Price (TAKE)',
      time: 'Step 6',
      participants: [protagonist],
      consequences: 'Great loss or sacrifice incurred in exchange for achieving the core goal.',
      linkedSceneId: 'scene-circle-6'
    }
  ];

  const revisionPasses: RevisionPass[] = [
    {
      id: 'rp-circle-hemispheres',
      name: 'Order vs. Chaos Hemisphere Balance Pass',
      description: 'Audit the narrative boundary between the conscious top half and the unconscious bottom half of the circle.',
      checklist: [
        { id: 'c-cir-1', label: 'Does Step 1 (YOU) feel undeniably stable and comfortable?', done: false, sceneId: scene1Id },
        { id: 'c-cir-2', label: 'Does Step 3 (GO) feel like crossing a real threshold into the unknown?', done: false, sceneId: 'scene-circle-3' },
        { id: 'c-cir-3', label: 'Is the price paid in Step 6 (TAKE) commensurate with the magnitude of the goal?', done: false, sceneId: 'scene-circle-6' },
        { id: 'c-cir-4', label: 'Does Step 8 (CHANGE) clearly show the character transformed compared to Step 1?', done: false, sceneId: 'scene-circle-8' }
      ]
    }
  ];

  const notes: NoteItem[] = [
    {
      id: 'note-circle-guide',
      title: "Dan Harmon's Story Circle Architecture",
      category: 'research',
      content: `The 8 Steps of the Circle:\n\n1. YOU (Zone of comfort)\n2. NEED (Want something)\n3. GO (Enter unfamiliar situation)\n4. SEARCH (Adapt to it)\n5. FIND (Get what was wanted)\n6. TAKE (Pay a heavy price)\n7. RETURN (Go back to where they started)\n8. CHANGE (Having changed)\n\nTop Hemisphere = Consciousness / Order\nBottom Hemisphere = Subconscious / Chaos\nLeft Half = Returning / Changing\nRight Half = Venturing / Searching`,
      resolved: false
    }
  ];

  const continuityIssues: ContinuityIssue[] = [
    {
      id: 'ci-circle-starter',
      title: 'Transformation Delta: Step 1 (YOU) vs. Step 8 (CHANGE)',
      question: 'Does the protagonist return to the original setting behaving distinctly differently than they did in the opening beat?',
      severity: 'medium',
      status: 'open',
      passageA: {
        sceneId: scene1Id,
        sceneTitle: 'Step 1. YOU (Zone of Comfort)',
        excerpt: 'In the small, well-lit perimeter of everyday existence...'
      },
      passageB: {
        sceneId: 'scene-circle-8',
        sceneTitle: 'Step 8. CHANGE (Transformed State)',
        excerpt: 'Back where they began, but fundamentally altered...'
      }
    }
  ];

  return {
    project,
    chapters,
    scenes,
    activeSceneId: scene1Id,
    entities,
    threads,
    events,
    continuityIssues,
    revisionPasses,
    cuttingRoom: [],
    notes,
    snapshots: [],
    aiAuditLogs: []
  };
}
