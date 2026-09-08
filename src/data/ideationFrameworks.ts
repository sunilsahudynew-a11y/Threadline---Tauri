import { FrameworkPointer, RoughIdea } from '../types';

export interface FrameworkBeatDefinition {
  key: string;
  name: string;
  actOrStage: string;
  tensionLevel: number; // 0 (calm) to 100 (highest climax)
  percent: number; // 0% to 100% position along timeline
  angleDeg?: number; // for circular frameworks (0 to 360)
  description: string;
  craftTip: string;
  color: string;
}

export interface FrameworkModel {
  id: 'three-act' | 'heros-journey' | 'story-circle' | 'save-the-cat';
  name: string;
  subtitle: string;
  visualType: 'curve' | 'circle';
  description: string;
  beats: FrameworkBeatDefinition[];
}

export const THREE_ACT_FRAMEWORK: FrameworkModel = {
  id: 'three-act',
  name: 'Three-Act Dramatic Arc',
  subtitle: 'Rising & Falling Dramatic Tension Graph',
  visualType: 'curve',
  description: 'The foundational architectural arc of storytelling: Hook, Rising Confrontation, Midpoint Shift, Dark Night Crisis, Explosive Climax, and Cathartic Resolution.',
  beats: [
    {
      key: 'act1-hook',
      name: 'Status Quo & Hook',
      actOrStage: 'Act I',
      tensionLevel: 20,
      percent: 5,
      description: 'Establish the protagonist’s normal world, flaw, and sensory reality before disruption.',
      craftTip: 'Demonstrate Silas Vance at work in the cold tower before the brass letter slot clatters.',
      color: '#4B6B94'
    },
    {
      key: 'act1-inciting',
      name: 'Inciting Incident',
      actOrStage: 'Act I',
      tensionLevel: 38,
      percent: 14,
      description: 'The catalyst event that breaks the status quo and introduces the irreversible dilemma.',
      craftTip: 'The courier drops the contraband sphere inscribed: "Do not wind past the equinox."',
      color: '#B54B32'
    },
    {
      key: 'act1-plotpoint1',
      name: 'Plot Point 1 (Lock-In)',
      actOrStage: 'Act I',
      tensionLevel: 45,
      percent: 25,
      description: 'The protagonist steps through the door of no return into the unfamiliar arena of Act II.',
      craftTip: 'Silas refuses to melt the sphere and leaves his workshop into the foggy curfew.',
      color: '#D17B2F'
    },
    {
      key: 'act2-pinch1',
      name: 'Pinch Point 1',
      actOrStage: 'Act II-A',
      tensionLevel: 55,
      percent: 37,
      description: 'First visceral reminder of the antagonistic force’s lethal power and rising pressure.',
      craftTip: 'The Imperial Censors raid the river runners’ guild; Maren is cornered.',
      color: '#8E4A49'
    },
    {
      key: 'act2-midpoint',
      name: 'Midpoint (False Victory / Reversal)',
      actOrStage: 'Act II',
      tensionLevel: 72,
      percent: 50,
      description: 'The pivot from reactive defense to proactive offense; true stakes are revealed.',
      craftTip: 'Silas disassembles the outer brass shell, revealing harmonic coordinates cast into the gears.',
      color: '#C44900'
    },
    {
      key: 'act2-pinch2',
      name: 'Pinch Point 2',
      actOrStage: 'Act II-B',
      tensionLevel: 68,
      percent: 63,
      description: 'Second strike by the antagonistic forces, cutting off exits and tightening the clock.',
      craftTip: 'The Ministry seals the bridges; Silas discovers Julian Croft’s secret ledger.',
      color: '#8E4A49'
    },
    {
      key: 'act2-all-lost',
      name: 'All Is Lost / Dark Night',
      actOrStage: 'Act II-B',
      tensionLevel: 32,
      percent: 75,
      description: 'The lowest emotional point; the initial plan has shattered, mentor or allies lost.',
      craftTip: 'The tools are seized, Maren is arrested, and the equinox bell is set to ring at dawn.',
      color: '#2F3E46'
    },
    {
      key: 'act3-break-into-three',
      name: 'Break into Act III (The Epiphany)',
      actOrStage: 'Act III',
      tensionLevel: 65,
      percent: 82,
      description: 'The protagonist synthesizes what they need (internal growth) to forge the final attack.',
      craftTip: 'Silas realizes the escapement doesn’t count time forward—it releases steam backwards.',
      color: '#3A7D6E'
    },
    {
      key: 'act3-climax',
      name: 'The Climax',
      actOrStage: 'Act III',
      tensionLevel: 98,
      percent: 91,
      description: 'The ultimate confrontation where internal transformation and external stakes clash.',
      craftTip: 'Belltower confrontation between Silas, the Censor, and the screaming steam valve.',
      color: '#B54B32'
    },
    {
      key: 'act3-resolution',
      name: 'Resolution & New Equilibrium',
      actOrStage: 'Act III',
      tensionLevel: 15,
      percent: 99,
      description: 'The aftermath; emotional resonance, transformed status quo, and the final image.',
      craftTip: 'The dawn bells strike a clear, resonant tierce across the silent Prague rooftops.',
      color: '#5C746A'
    }
  ]
};

export const HEROS_JOURNEY_FRAMEWORK: FrameworkModel = {
  id: 'heros-journey',
  name: 'The Hero’s Journey (Monomyth)',
  subtitle: '12-Stage Cyclical Monomyth Dial',
  visualType: 'circle',
  description: 'Joseph Campbell & Christopher Vogler’s 12-stage circular voyage across the threshold from the Known Ordinary World into the Unknown Special World and back.',
  beats: [
    {
      key: 'hj-1',
      name: '1. Ordinary World',
      actOrStage: 'Departure',
      tensionLevel: 20,
      percent: 8,
      angleDeg: 270, // 12 o'clock
      description: 'Hero is introduced in their everyday environment, marked by an unfulfilled yearning.',
      craftTip: 'Silas Vance surrounded by sixty watch jewels nested in elderberry pith.',
      color: '#4B6B94'
    },
    {
      key: 'hj-2',
      name: '2. Call to Adventure',
      actOrStage: 'Departure',
      tensionLevel: 35,
      percent: 16,
      angleDeg: 300,
      description: 'The disruption of the comfort zone; a challenge or quest arrives from outside.',
      craftTip: 'Unstamped copper sphere dropped through the door with Latin inscription.',
      color: '#B54B32'
    },
    {
      key: 'hj-3',
      name: '3. Refusal of the Call',
      actOrStage: 'Departure',
      tensionLevel: 28,
      percent: 25,
      angleDeg: 330,
      description: 'Hesitation, fear of the unknown, or obligation that binds the hero to safety.',
      craftTip: '"The shop is closed till tierce. I repair municipal escapements, not conspiracies."',
      color: '#7A705F'
    },
    {
      key: 'hj-4',
      name: '4. Meeting the Mentor',
      actOrStage: 'Departure',
      tensionLevel: 42,
      percent: 33,
      angleDeg: 0, // 3 o'clock (Upper edge of Special World)
      description: 'Hero receives guidance, equipment, or confidence needed for the journey ahead.',
      craftTip: 'Consulting Master Bron’s preserved 1844 guild diary in the cedar attic rafters.',
      color: '#3A7D6E'
    },
    {
      key: 'hj-5',
      name: '5. Crossing the Threshold',
      actOrStage: 'Initiation',
      tensionLevel: 55,
      percent: 41,
      angleDeg: 30, // Entering Special World below horizon
      description: 'The irreversible commitment to enter the dangerous Special World.',
      craftTip: 'Leaving the locked tower and stepping down onto Quay 4 past curfew bells.',
      color: '#D17B2F'
    },
    {
      key: 'hj-6',
      name: '6. Tests, Allies & Enemies',
      actOrStage: 'Initiation',
      tensionLevel: 62,
      percent: 50,
      angleDeg: 60,
      description: 'Navigating unfamiliar rules, testing companions, and discovering true motives.',
      craftTip: 'Encountering the River Runners and testing Julian Croft’s metallurgical assays.',
      color: '#5C746A'
    },
    {
      key: 'hj-7',
      name: '7. Approach to the Inmost Cave',
      actOrStage: 'Initiation',
      tensionLevel: 75,
      percent: 58,
      angleDeg: 90, // 6 o'clock bottom (deepest threshold)
      description: 'Preparation for the central trial; penetrating the heart of enemy territory.',
      craftTip: 'Slipping into the subterranean steam conduit beneath the Imperial Foundry.',
      color: '#B54B32'
    },
    {
      key: 'hj-8',
      name: '8. The Ordeal',
      actOrStage: 'Initiation',
      tensionLevel: 90,
      percent: 66,
      angleDeg: 120,
      description: 'Direct confrontation with the greatest fear; symbolic death and rebirth.',
      craftTip: 'Trapped in the flooded flues; Silas sacrifices his prized watchmaker tools to wedge the valve.',
      color: '#8E4A49'
    },
    {
      key: 'hj-9',
      name: '9. Reward (Seizing the Sword)',
      actOrStage: 'Return',
      tensionLevel: 70,
      percent: 75,
      angleDeg: 150,
      description: 'Hero claims the treasure, knowledge, or talisman won through surviving the ordeal.',
      craftTip: 'Unlocking the sphere’s harmonic core, proving the 1844 disaster was sabotage.',
      color: '#C9A66B'
    },
    {
      key: 'hj-10',
      name: '10. The Road Back',
      actOrStage: 'Return',
      tensionLevel: 80,
      percent: 83,
      angleDeg: 180, // 9 o'clock (Returning across horizon)
      description: 'Urgent race back to the Ordinary World as forces pursue to reclaim the prize.',
      craftTip: 'Racing the equinox sunrise through the foggy alleys while constables sound the klaxon.',
      color: '#B54B32'
    },
    {
      key: 'hj-11',
      name: '11. Resurrection',
      actOrStage: 'Return',
      tensionLevel: 96,
      percent: 91,
      angleDeg: 210,
      description: 'Final climactic test of purified hero; all lessons applied simultaneously.',
      craftTip: 'Silas mounts the tower ladder with one injured hand to realign the astronomical crown wheel.',
      color: '#B54B32'
    },
    {
      key: 'hj-12',
      name: '12. Return with Elixir',
      actOrStage: 'Return',
      tensionLevel: 25,
      percent: 100,
      angleDeg: 240,
      description: 'Returning home transformed, bearing the gift that heals the broken world.',
      craftTip: 'The town square bells ring true; the guild monopoly is broken, and Maren is freed.',
      color: '#3A7D6E'
    }
  ]
};

export const STORY_CIRCLE_FRAMEWORK: FrameworkModel = {
  id: 'story-circle',
  name: 'Dan Harmon’s Story Circle',
  subtitle: '8-Phase Character Psychology Loop',
  visualType: 'circle',
  description: 'An 8-step distillation of Campbell’s monomyth centered on internal psychological transformation: You, Need, Go, Search, Find, Take, Return, Change.',
  beats: [
    { key: 'sc-1', name: '1. YOU (Zone of Comfort)', actOrStage: 'Comfort', tensionLevel: 20, percent: 12, angleDeg: 270, description: 'A character is in a zone of comfort.', craftTip: 'Silas at his bench, insulated from the city.', color: '#4B6B94' },
    { key: 'sc-2', name: '2. NEED (Desire)', actOrStage: 'Desire', tensionLevel: 35, percent: 25, angleDeg: 315, description: 'But they want something.', craftTip: 'Silas longs to solve the 1844 fatal flaw that killed his mentor.', color: '#B54B32' },
    { key: 'sc-3', name: '3. GO (Threshold)', actOrStage: 'Unfamiliar', tensionLevel: 50, percent: 37, angleDeg: 0, description: 'They enter an unfamiliar situation.', craftTip: 'Stepping into the criminal underworld of Quay 4.', color: '#D17B2F' },
    { key: 'sc-4', name: '4. SEARCH (Adaptation)', actOrStage: 'Adaptation', tensionLevel: 65, percent: 50, angleDeg: 45, description: 'Adapt to it and learn the rules.', craftTip: 'Decoding the cipher with Courier Maren.', color: '#5C746A' },
    { key: 'sc-5', name: '5. FIND (Discovery)', actOrStage: 'Discovery', tensionLevel: 80, percent: 62, angleDeg: 90, description: 'Get what they wanted.', craftTip: 'Recovering the missing master cylinder from the vault.', color: '#C9A66B' },
    { key: 'sc-6', name: '6. TAKE (Heavy Price)', actOrStage: 'Heavy Price', tensionLevel: 88, percent: 75, angleDeg: 135, description: 'Pay a heavy price for it.', craftTip: 'Julian Croft’s betrayal and Maren’s arrest.', color: '#8E4A49' },
    { key: 'sc-7', name: '7. RETURN (Familiar)', actOrStage: 'Return', tensionLevel: 75, percent: 87, angleDeg: 180, description: 'Then return to their familiar situation.', craftTip: 'Silas returns to his tower clock with the key.', color: '#3A7D6E' },
    { key: 'sc-8', name: '8. CHANGE (Mastery)', actOrStage: 'Change', tensionLevel: 30, percent: 100, angleDeg: 225, description: 'Having changed.', craftTip: 'No longer hiding behind his bench; he defends the city.', color: '#4B6B94' }
  ]
};

export const ALL_FRAMEWORKS: FrameworkModel[] = [
  THREE_ACT_FRAMEWORK,
  HEROS_JOURNEY_FRAMEWORK,
  STORY_CIRCLE_FRAMEWORK
];

export const INITIAL_ROUGH_IDEAS: RoughIdea[] = [
  {
    id: 'idea-1',
    title: 'Harmonic Whistling of the Copper Sphere',
    description: 'The copper sphere’s equatorial seam is actually a micro-cut reed valve. When spun at 72 RPM in cold damp mist, it emits a pitch that resonates with church bronze bells.',
    category: 'world',
    status: 'in-progress',
    priority: 'high',
    tags: ['Sphere', 'Acoustics', 'Atmosphere'],
    linkedBeatKey: 'act2-midpoint',
    createdAt: '2026-09-07T14:30:00.000Z',
    updatedAt: '2026-09-07T16:00:00.000Z'
  },
  {
    id: 'idea-2',
    title: 'Maren’s Sister Indenture at the Mill',
    description: 'Maren isn’t smuggling contraband for the money; her younger sister is indentured in the Censor’s pneumatic silk looms until the guild debt is cleared.',
    category: 'character',
    status: 'fleshed-out',
    priority: 'high',
    tags: ['Maren', 'Backstory', 'Stakes'],
    linkedBeatKey: 'act2-pinch1',
    createdAt: '2026-09-07T15:10:00.000Z',
    updatedAt: '2026-09-07T18:20:00.000Z'
  },
  {
    id: 'idea-3',
    title: 'The Deadbeat Escapement Dialogue',
    description: 'Silas explains to Julian why an anchor escapement jerks backwards on every beat, wasting power—using it as an explicit metaphor for the Emperor’s reactionary council.',
    category: 'dialogue',
    status: 'fleshed-out',
    priority: 'medium',
    tags: ['Theme', 'Silas', 'Philosophy'],
    linkedBeatKey: 'act1-hook',
    createdAt: '2026-09-07T16:45:00.000Z',
    updatedAt: '2026-09-07T17:00:00.000Z'
  },
  {
    id: 'idea-4',
    title: 'Steam Condensation Trap in the Bell Chamber',
    description: 'What if the final confrontation happens in blinding steam where sound and vibrations are the only navigation cues Silas can trust?',
    category: 'plot',
    status: 'spark',
    priority: 'high',
    tags: ['Climax', 'Action', 'Sensory'],
    linkedBeatKey: 'act3-climax',
    createdAt: '2026-09-08T00:05:00.000Z',
    updatedAt: '2026-09-08T00:05:00.000Z'
  },
  {
    id: 'idea-5',
    title: 'The Censor’s Bone Calipers are Counterfeit',
    description: 'A twist: The Grand Censor’s heirloom bone calipers are actually whalebone scrimshaw carved with fake imperial guild crests from Vienna.',
    category: 'twist',
    status: 'spark',
    priority: 'low',
    tags: ['Twist', 'Forgery'],
    createdAt: '2026-09-08T00:10:00.000Z',
    updatedAt: '2026-09-08T00:10:00.000Z'
  }
];

export const INITIAL_FRAMEWORK_POINTERS: FrameworkPointer[] = [
  // Three-Act Structure pointers
  {
    id: 'ptr-3act-1',
    framework: 'three-act',
    beatKey: 'act1-hook',
    title: 'Sensory Isolation in the Clocktower Attic',
    notes: 'Ground Silas in physical horology: tallow candle smoke, elderberry pith, sixty watch jewels.',
    color: '#4B6B94',
    linkedSceneId: 'scene-1',
    createdAt: '2026-09-07T10:00:00.000Z'
  },
  {
    id: 'ptr-3act-2',
    framework: 'three-act',
    beatKey: 'act1-inciting',
    title: 'Four Measured Knocks at the Lower Grille',
    notes: 'Maren vanishes into the fog; the copper sphere rolls across the sweepings.',
    color: '#B54B32',
    linkedSceneId: 'scene-1',
    createdAt: '2026-09-07T11:00:00.000Z'
  },
  {
    id: 'ptr-3act-3',
    framework: 'three-act',
    beatKey: 'act1-plotpoint1',
    title: 'Lock-In: Silas Conceals the 1844 Alloy',
    notes: 'Julian Croft warns him of surveillance; Silas hides the sphere in his hollow wooden spanner handle.',
    color: '#D17B2F',
    linkedSceneId: 'scene-2',
    createdAt: '2026-09-07T12:00:00.000Z'
  },
  {
    id: 'ptr-3act-4',
    framework: 'three-act',
    beatKey: 'act2-midpoint',
    title: 'Quay 4 Revelation: The Sphere was Struck Today',
    notes: 'Maren is injured; reveals the alloy wasn’t melted in 1844, it was secretly recast at dawn.',
    color: '#C44900',
    linkedSceneId: 'scene-3',
    createdAt: '2026-09-07T13:00:00.000Z'
  },
  {
    id: 'ptr-3act-5',
    framework: 'three-act',
    beatKey: 'act3-climax',
    title: 'The Astronomical Escapement Race',
    notes: 'Silas drives the brass taper pin through the reverse gear while the town hammer falls.',
    color: '#B54B32',
    createdAt: '2026-09-07T14:00:00.000Z'
  },
  // Hero's Journey pointers
  {
    id: 'ptr-hj-1',
    framework: 'heros-journey',
    beatKey: 'hj-1',
    title: 'Ordinary World: Third Landing of Astronomical Clock',
    notes: 'Silas Vance allergic to politics, counting heartbeats against the crown wheel.',
    color: '#4B6B94',
    linkedSceneId: 'scene-1',
    createdAt: '2026-09-07T10:00:00.000Z'
  },
  {
    id: 'ptr-hj-2',
    framework: 'heros-journey',
    beatKey: 'hj-2',
    title: 'Call to Adventure: The Latin Inscription',
    notes: '"Do not wind past the equinox" introduces the inescapable countdown.',
    color: '#B54B32',
    linkedSceneId: 'scene-1',
    createdAt: '2026-09-07T10:30:00.000Z'
  },
  {
    id: 'ptr-hj-5',
    framework: 'heros-journey',
    beatKey: 'hj-5',
    title: 'Crossing the Threshold: Descent to the Misty Quays',
    notes: 'Silas leaves the high clean clock tower into the muddy coal barges of Quay 4.',
    color: '#D17B2F',
    linkedSceneId: 'scene-3',
    createdAt: '2026-09-07T11:15:00.000Z'
  },
  {
    id: 'ptr-hj-8',
    framework: 'heros-journey',
    beatKey: 'hj-8',
    title: 'The Ordeal: Foundry Drainage Flues',
    notes: 'Trapped beneath high-pressure steam pipes; surviving through pure tactile horological knowledge.',
    color: '#8E4A49',
    createdAt: '2026-09-07T12:45:00.000Z'
  }
];
