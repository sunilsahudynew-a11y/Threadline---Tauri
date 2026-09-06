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
  CuttingRoomItem,
  NoteItem,
  Snapshot
} from '../types';

export const INITIAL_PROJECT: Project = {
  id: 'proj-clockmaker',
  title: 'The Glass Clockmaker of Prague',
  type: 'Novel',
  protagonist: 'Silas Vance',
  genre: 'Historical Mystery & Speculative Fiction',
  situation: 'An artisan horologist receives an order for an automaton that counts backward toward an unknown catastrophe.',
  desiredSessionGoal: 'Finish Scene 3 confrontation at Quay 4 and reconcile the alloy timeline.',
  targetWordCount: 75000,
  status: 'in-progress',
  lastActiveSceneId: 'scene-3',
  createdAt: '2026-08-10T14:30:00.000Z',
  updatedAt: new Date().toISOString()
};

export const INITIAL_CHAPTERS: Chapter[] = [
  {
    id: 'chap-1',
    number: 1,
    title: "The Artisan's Warning",
    actOrPhase: 'Act I: Setup',
    description: 'Silas Vance receives the impossible copper sphere inscribed with an astronomical warning and assays its metallurgical impossibility at the Imperial Vaults.',
    sceneIds: ['scene-1', 'scene-2']
  },
  {
    id: 'chap-2',
    number: 2,
    title: 'The Salt Barges at Midnight',
    actOrPhase: 'Act I: The Crossing',
    description: 'Silas tracks the wounded courier through the fog of Quay 4 to discover who commanded the casting of the forbidden alloy.',
    sceneIds: ['scene-3']
  },
  {
    id: 'chap-3',
    number: 3,
    title: "The Alchemist's Kiln",
    actOrPhase: 'Act II: Confrontation',
    description: 'Silas infiltrates the Old Foundry under the Charles Bridge to uncover the secret guild forge creating reverse escapements.',
    sceneIds: []
  },
  {
    id: 'chap-4',
    number: 4,
    title: 'The Reverse Pendulum',
    actOrPhase: 'Act II: Confrontation',
    description: 'Midpoint pivot: Silas discovers the automaton does not merely predict disaster—it triggers the clocktower collapse.',
    sceneIds: []
  },
  {
    id: 'chap-5',
    number: 5,
    title: "The Grand Censor's Raid",
    actOrPhase: 'Act II: Confrontation',
    description: 'The Imperial Guard seals the guild quarters; Silas loses his workshop and archivist Julian Croft is arrested.',
    sceneIds: []
  },
  {
    id: 'chap-6',
    number: 6,
    title: 'The Broken Escapement',
    actOrPhase: 'Act II: Confrontation',
    description: 'Dark Night of the Soul: Trapped in the flooded sewers beneath Quay 4 with the copper sphere ticking backward.',
    sceneIds: []
  },
  {
    id: 'chap-7',
    number: 7,
    title: 'The Solstice Clock',
    actOrPhase: 'Act III: Resolution',
    description: 'Climax: Silas scales the Great Astronomical Dial to halt the reverse gear before the final eclipse hour strikes.',
    sceneIds: []
  },
  {
    id: 'chap-8',
    number: 8,
    title: 'The Quiet Meridian',
    actOrPhase: 'Act III: Resolution',
    description: 'Resolution: The restored municipal dial rings true noon; the transformed artisan returns to his workbench.',
    sceneIds: []
  }
];

export const INITIAL_SCENES: Scene[] = [
  {
    id: 'scene-1',
    title: '1. The Escapement in the Mist',
    order: 1,
    chapterId: 'chap-1',
    chapterNumber: 1,
    chapterTitle: "The Artisan's Warning",
    actOrPhase: 'Act I: Setup',
    narrativeBeat: '1. Opening Image & Status Quo',
    premise: 'Silas is visited at dawn by a courier bearing an untraceable copper sphere inscribed with a temporal warning.',
    characters: ['Silas Vance', 'Courier Maren'],
    location: 'Old Town Clocktower Workshop',
    time: 'Autumn dawn, 1894',
    pov: 'Silas Vance (Third Limited)',
    status: 'complete',
    wordCount: 742,
    notes: 'Ground the reader in sensory weight: the smell of untreated tallow, damp cedar joists, and seventy-heartbeat crown wheel vibrations.',
    comments: [
      {
        id: 'c-1',
        selection: 'untreated tallow',
        note: 'Check if Bohemian clocksmiths used mutton tallow or whale spermaceti in the 1890s.',
        author: 'Writer Note',
        timestamp: 'Yesterday at 3:15 PM'
      }
    ],
    proseContent: `The cold had set deep into the granite flags before Silas Vance struck his first sulphur match. 

The Old Town tower hummed around him—an old, hollow ribcage of cedar joists and damp lime plaster. Above his skull, the forty-tooth crown wheel turned once every seventy heartbeats, releasing a heavy brass cough into the flue of the chimney.

A sharp rap struck the lower street door. Four measured strikes, followed by the drag of an iron-tipped boot heel.

"The shop is closed till tierce," Silas muttered to the unlit hearth. He did not turn from his worktable, where sixty watch jewels sat nested in elderberry pith.

The brass letter slot clattered. A small pouch dropped onto the sweepings, smelling distinctly of saltpetre and river reeds. Through the iron grille, Courier Maren did not wait for an answer; her grey wool shawl vanished into the canal mist before his brass key had even engaged the tumbler.

Inside the pouch lay an unstamped copper sphere, no larger than a pigeon’s egg, cold enough to draw the condensation from his knuckles. Stamped along its equator in minute Latin script was a single instruction: 

*Do not wind past the equinox.*`
  },
  {
    id: 'scene-2',
    title: '2. The Ministry of Calipers',
    order: 2,
    chapterId: 'chap-1',
    chapterNumber: 1,
    chapterTitle: "The Artisan's Warning",
    actOrPhase: 'Act I: Setup',
    narrativeBeat: '2. The Catalyst & Inciting Incident',
    premise: 'Silas visits the Imperial Metallurgical Vaults to assay the alloy, but his archivist ally reacts with pure dread.',
    characters: ['Silas Vance', 'Archivist Julian Croft'],
    location: 'The Imperial Metallurgical Vaults',
    time: 'Noon of the same day',
    pov: 'Silas Vance (Third Limited)',
    status: 'revised',
    wordCount: 885,
    notes: 'Julian Croft should embody bureaucratic caution. Emphasize the bone micrometer and the ink blot.',
    comments: [],
    proseContent: `The Ministry vaults smelled of vinegar, sulphur, and rotting ledger calfskin. 

Julian Croft did not look up when Silas approached the high copper clerk’s desk. He was measuring the thickness of an import seal with a micrometer crafted from blackened whalebone.

"You brought untreated copper into the municipal basement, Silas," Julian said softly without shifting his loupe. "You know the damp in this district turns honest brass into green salt in twenty minutes."

Silas placed the egg on the emerald blotting felt between them. "Scrape the bevel. Tell me which foundry cast the seam."

Julian froze. His quill remained poised over the open register, a single black droplet gathering on the split nib until it fell onto the blotter with a muted smack. He slowly lifted his head, his pale eyes magnifying behind thick pebbled lenses.

"Where did you get this?" Julian's voice fell half an octave. "The Royal Foundry decommissioned this die fifty years ago. My father melted down the last set of stamps himself during the guild strike of 1844."

"It was delivered to my letter slot at dawn," Silas said.

Julian touched the sphere with a gloved thumb. "Then your courier is either a ghost, Silas, or someone broke into the Emperor's private kiln."`
  },
  {
    id: 'scene-3',
    title: '3. Lower River Docks (Quay 4)',
    order: 3,
    chapterId: 'chap-2',
    chapterNumber: 2,
    chapterTitle: 'The Salt Barges at Midnight',
    actOrPhase: 'Act I: The Crossing',
    narrativeBeat: '4. Crossing the Threshold (Plot Point 1)',
    premise: 'Silas tracks Maren to the salt barges to force the truth, but finds her wounded and terrified.',
    characters: ['Silas Vance', 'Courier Maren'],
    location: 'Lower River Docks, Quay 4',
    time: 'Midnight, fog rolling off the Vltava',
    pov: 'Silas Vance (Third Limited)',
    status: 'draft',
    wordCount: 685,
    notes: 'Silas has never held a weapon; his only improvised tool is an adjustable brass spanner.',
    comments: [],
    proseContent: `The salt barges sat low in the black current like waterlogged coffins. 

Silas kept his hand buried inside his greatcoat pocket, wrapped around the cold teeth of an adjustable spanner. It was the only implement he possessed with weight enough to simulate courage. The river fog tasted of coal smoke and wet bilge.

A single lantern flickered between two stacks of tarred hemp rope. Maren was knotting a cargo sling with her teeth, working one-handed while her right arm hung limp at her side.

"You followed the grease trail," she said without turning around.

"You left the sphere on my door," Silas said, stepping onto the slime-slick gangway. "The alloy was melted down fifty years ago. Who had the foundry stamps?"

Maren spat out the frayed hemp. When she turned, her face was drawn pale by the paraffin flame, a dark crescent of dried blood behind her ear.

"No one had the stamps, Silas. The sphere wasn't cast fifty years ago." She stepped into the lantern light, trembling. "It was cast this morning at the Old Foundry."`
  }
];

export const INITIAL_ENTITIES: Entity[] = [
  {
    id: 'ent-1',
    name: 'Silas Vance',
    type: 'character',
    status: 'confirmed',
    description: 'Master horologist and keeper of the municipal clockworks. Quiet, methodical, observant, allergic to political intrigue.',
    canonicalFacts: [
      'Apprenticed under Master Bron in Prague in 1872',
      'Suffers from intermittent tremor in left thumb after severe winter cold exposure',
      'Lives and works on the third landing of the Old Town Astronomical Clocktower',
      'Refuses to carry firearms; relies on precision calipers and heavy spanners'
    ],
    linkedSceneIds: ['scene-1', 'scene-2', 'scene-3']
  },
  {
    id: 'ent-2',
    name: 'Courier Maren',
    type: 'character',
    status: 'tentative',
    description: 'River runner and messenger for the unregistered guilds along the Vltava. Cautious, fiercely independent.',
    canonicalFacts: [
      'Identified by a coarse, dyed-grey Bohemian wool shawl',
      'Speaks with an upland dialect from the Krkonoše mountains',
      'Appeared at Quay 4 with a severe head laceration and injured right arm'
    ],
    linkedSceneIds: ['scene-1', 'scene-3']
  },
  {
    id: 'ent-3',
    name: 'Archivist Julian Croft',
    type: 'character',
    status: 'confirmed',
    description: 'Third-grade ledger clerk at the Imperial Metallurgical Vaults. Obsessed with guild records and chemical purity.',
    canonicalFacts: [
      'Son of Foundrymaster Croft who broke the 1844 guild strike',
      'Suffers from extreme myopia, uses a hand-carved bone micrometer',
      'Secretly holds records of unregistered foundry runs'
    ],
    linkedSceneIds: ['scene-2']
  },
  {
    id: 'ent-4',
    name: 'The Backward Automaton',
    type: 'object',
    status: 'tentative',
    description: 'A rumored mechanical contrivance commissioned by an anonymous client, said to unwind chronological tension.',
    canonicalFacts: [
      'Triggered by an egg-shaped copper sphere with Latin inscriptions',
      'Inscribed warning: *Do not wind past the equinox*',
      'Alloy composition matches decommissioned 1844 Royal Foundry dies'
    ],
    linkedSceneIds: ['scene-1', 'scene-2', 'scene-3']
  },
  {
    id: 'ent-5',
    name: 'Old Town Clocktower Workshop',
    type: 'place',
    status: 'confirmed',
    description: 'The damp, high attic quarters above the municipal square astronomical clock.',
    canonicalFacts: [
      'Forty-tooth crown wheel overhead turns once every seventy heartbeats',
      'Granite hearth smokes during southerly winds',
      'Houses sixty watch jewels in elderberry pith'
    ],
    linkedSceneIds: ['scene-1']
  },
  {
    id: 'ent-6',
    name: 'The Imperial Metallurgical Vaults',
    type: 'place',
    status: 'confirmed',
    description: 'Subterranean archives housing historical metal dies, assay balances, and import registers.',
    canonicalFacts: [
      'Damp atmosphere oxidizes raw copper into verdigris rapidly',
      'Guarded by clerk-registrars of the third grade'
    ],
    linkedSceneIds: ['scene-2']
  },
  {
    id: 'ent-7',
    name: 'Quay 4 / Salt Barges',
    type: 'place',
    status: 'confirmed',
    description: 'Low-water moorings along the southern bank of the Vltava where uninspected cargo transfers occur.',
    canonicalFacts: [
      'Smells of coal smoke and wet bilge',
      'Controlled by the river runners guild'
    ],
    linkedSceneIds: ['scene-3']
  }
];

export const INITIAL_THREADS: Thread[] = [
  {
    id: 'th-1',
    title: 'The Foundry Stamp Mystery',
    description: 'How can an alloy die decommissioned in 1844 be freshly cast and struck this morning?',
    status: 'active',
    color: 'border-amber-500 text-amber-900 bg-amber-50',
    linkedSceneIds: ['scene-1', 'scene-2', 'scene-3']
  },
  {
    id: 'th-2',
    title: 'Maren’s Missing Hours & Wound',
    description: 'Who ambushed Maren between her dawn delivery at the clocktower and her midnight rendezvous at Quay 4?',
    status: 'active',
    color: 'border-emerald-500 text-emerald-900 bg-emerald-50',
    linkedSceneIds: ['scene-1', 'scene-3']
  },
  {
    id: 'th-3',
    title: 'The Equinox Deadline',
    description: 'The Latin inscription sets an ominous boundary: what happens when the automaton winds past the equinox?',
    status: 'active',
    color: 'border-stone-500 text-stone-900 bg-stone-100',
    linkedSceneIds: ['scene-1', 'scene-2']
  }
];

export const INITIAL_EVENTS: StoryEvent[] = [
  {
    id: 'ev-1',
    title: 'Dawn Delivery of the Sphere',
    time: 'Autumn Dawn, 1894',
    participants: ['Silas Vance', 'Courier Maren'],
    consequences: 'Silas discovers the 1844 alloy and the Latin inscription.',
    linkedSceneId: 'scene-1'
  },
  {
    id: 'ev-2',
    title: 'Metallurgical Assay at the Vaults',
    time: 'Noon, Same Day',
    participants: ['Silas Vance', 'Archivist Julian Croft'],
    consequences: 'Julian Croft confirms the stamp die was supposedly melted 50 years ago.',
    linkedSceneId: 'scene-2'
  },
  {
    id: 'ev-3',
    title: 'The Confrontation at Quay 4',
    time: 'Midnight, Same Day',
    participants: ['Silas Vance', 'Courier Maren'],
    consequences: 'Maren reveals the sphere was cast that very morning, overturning Julian’s history.',
    linkedSceneId: 'scene-3'
  }
];

export const INITIAL_CONTINUITY_ISSUES: ContinuityIssue[] = [
  {
    id: 'ci-1',
    title: 'Timeline Gap: Silas’s Unaccounted Afternoon',
    question: 'Scene 2 concludes at "Noon of the same day" in the vaults, but Scene 3 jumps directly to "Midnight" without accounting for Silas’s whereabouts or preparations during the intervening 12 hours.',
    passageA: {
      sceneTitle: '2. The Ministry of Calipers',
      sceneId: 'scene-2',
      excerpt: 'Noon of the same day. "Then your courier is either a ghost, Silas, or someone broke into the Emperor\'s private kiln."'
    },
    passageB: {
      sceneTitle: '3. Lower River Docks (Quay 4)',
      sceneId: 'scene-3',
      excerpt: 'Midnight, fog rolling off the Vltava. Silas kept his hand buried inside his greatcoat pocket, wrapped around the cold teeth of an adjustable spanner.'
    },
    status: 'open',
    severity: 'medium'
  },
  {
    id: 'ci-2',
    title: 'Physical Condition Continuity: Maren’s Head Laceration',
    question: 'Maren was described running swiftly through the morning mist in Scene 1 without physical distress, but in Scene 3 arrives with dried blood behind her ear and a limp arm. Is this deliberate off-page escalation or a missing connective scene?',
    passageA: {
      sceneTitle: '1. The Escapement in the Mist',
      sceneId: 'scene-1',
      excerpt: 'her grey wool shawl vanished into the canal mist before his brass key had even engaged the tumbler...'
    },
    passageB: {
      sceneTitle: '3. Lower River Docks (Quay 4)',
      sceneId: 'scene-3',
      excerpt: 'working one-handed while her right arm hung limp at her side... a dark crescent of dried blood behind her ear.'
    },
    status: 'intentional',
    severity: 'low'
  },
  {
    id: 'ci-3',
    title: 'Object Custody: Physical Location of the Copper Sphere',
    question: 'Silas left the copper sphere on Julian’s blotting felt in Scene 2. In Scene 3, did Silas retrieve it, or did Julian Croft retain it in the Ministry vaults?',
    passageA: {
      sceneTitle: '2. The Ministry of Calipers',
      sceneId: 'scene-2',
      excerpt: 'Silas placed the egg on the emerald blotting felt between them... Julian touched the sphere with a gloved thumb.'
    },
    passageB: {
      sceneTitle: '3. Lower River Docks (Quay 4)',
      sceneId: 'scene-3',
      excerpt: '"The alloy was melted down fifty years ago. Who had the foundry stamps?" Maren spat out the frayed hemp.'
    },
    status: 'open',
    severity: 'high'
  }
];

export const INITIAL_REVISION_PASSES: RevisionPass[] = [
  {
    id: 'rp-1',
    name: 'Sensory & Atmospheric Texture Pass',
    description: 'Audit atmospheric realism, sharpen mechanical terminology, and eliminate passive verbs.',
    checklist: [
      { id: 'chk-1', label: 'Scene 1: Reinforce the rhythmic seventy-heartbeat crown wheel cadence', done: true, sceneId: 'scene-1' },
      { id: 'chk-2', label: 'Scene 2: Emphasize the vinegar and calfskin smell of the municipal vaults', done: true, sceneId: 'scene-2' },
      { id: 'chk-3', label: 'Scene 3: Describe the physical oily grip and leverage of the spanner', done: false, sceneId: 'scene-3' },
      { id: 'chk-4', label: 'Scene 3: Accentuate the cold water slap against the hull of the salt barges', done: false, sceneId: 'scene-3' }
    ]
  },
  {
    id: 'rp-2',
    name: 'Object Journey & Mystery Pass',
    description: 'Track the physical custody and handling of the copper egg sphere across all drafted chapters.',
    checklist: [
      { id: 'chk-5', label: 'Explicitly clarify if Silas put the egg back in his pocket after leaving Julian', done: false, sceneId: 'scene-2' },
      { id: 'chk-6', label: 'Confirm whether Maren recognized the Latin inscription or only the courier mark', done: false, sceneId: 'scene-3' }
    ]
  }
];

export const INITIAL_CUTTING_ROOM: CuttingRoomItem[] = [
  {
    id: 'cut-1',
    text: `Before the war of the eight cantons, Silas had spent three seasons in Munich studying under master Berthold. He recalled how Berthold would tap a steel tuning fork against a balance spring to test its temper; the reverberation sounded like a silver bee trapped inside a crystal jar.`,
    originalSceneTitle: '1. The Escapement in the Mist',
    deletedAt: '2 days ago',
    contextNote: 'Poetic sensory detail, but stalled the urgency right after the courier’s knock at the tower door.'
  },
  {
    id: 'cut-2',
    text: `"There are sixteen registered guilds along the south bank," Silas muttered, thumbing the edge of his pocket ledger. "None of them hold a license for open metallurgical kilns after the dusk bell."`,
    originalSceneTitle: '2. The Ministry of Calipers',
    deletedAt: 'Yesterday',
    contextNote: 'Overly procedural exposition on municipal zoning; keep the scene focused on Julian’s growing fear.'
  },
  {
    id: 'cut-3',
    text: `A coal skiff drifted past the pier, its pilot leaning against the tiller with a clay pipe clutched between his teeth. The spark flew wide and vanished into the river with a soft, dying fizzle.`,
    originalSceneTitle: '3. Lower River Docks (Quay 4)',
    deletedAt: '3 hours ago',
    contextNote: 'Atmospheric bridge removed to keep focus tight on Silas and Maren.'
  }
];

export const INITIAL_NOTES: NoteItem[] = [
  {
    id: 'note-1',
    title: 'Bohemian clock escapements in 1890s',
    content: 'Check whether Silas would use a Graham deadbeat escapement or an anchor escapement for the tower clock. The deadbeat eliminates recoil, matching his precise personality.',
    category: 'research',
    sceneId: 'scene-1',
    resolved: false
  },
  {
    id: 'note-2',
    title: 'Why did Maren risk coming herself?',
    content: 'If the sphere is dangerous contraband, why deliver it personally rather than using a street boy? Did she want to warn Silas or test his reaction?',
    category: 'question',
    sceneId: 'scene-3',
    resolved: false
  },
  {
    id: 'note-3',
    title: 'Julian Croft’s True Loyalty',
    content: 'Could Julian be reporting to the Grand Censor while pretending to be Silas’s friend? His father broke the strike; perhaps there is family debt involved.',
    category: 'idea',
    sceneId: 'scene-2',
    resolved: false
  }
];

export const INITIAL_SNAPSHOTS: Snapshot[] = [
  {
    id: 'snap-1',
    name: 'Before Lower Docks Confrontation Draft',
    timestamp: 'Yesterday at 4:30 PM',
    scenesSummary: INITIAL_SCENES.map(s => ({
      id: s.id,
      title: s.title,
      wordCount: s.wordCount,
      proseContent: s.proseContent
    }))
  }
];

export const SECOND_PROJECT_BUNDLE: ProjectBundle = {
  project: {
    id: 'proj-trench',
    title: 'Echoes of the Obsidian Trench',
    type: 'Screenplay Experiment',
    protagonist: 'Dr. Maya Lin',
    genre: 'Abyssal Sci-Fi Thriller',
    situation: 'A deep-sea acoustic surveyor at 10,000 meters discovers non-random harmonic transmissions echoing from a sealed geological fault.',
    desiredSessionGoal: 'Polish Act I inciting incident and dialogue cadence.',
    targetWordCount: 22000,
    status: 'drafting',
    lastActiveSceneId: 'trench-scene-1',
    createdAt: '2026-08-25T10:15:00.000Z',
    updatedAt: '2026-09-02T16:40:00.000Z'
  },
  chapters: [
    {
      id: 't-chap-1',
      number: 1,
      title: 'Descent to the Hadal Ridge',
      actOrPhase: 'Phase 1: Deep Descent',
      description: 'Dr. Maya Lin and Chief Engineer Thorne pilot the Hadal-IV submersible into the unmapped abyssal depths.',
      sceneIds: ['trench-scene-1', 'trench-scene-2']
    },
    {
      id: 't-chap-2',
      number: 2,
      title: 'Resonance & Rupture',
      actOrPhase: 'Phase 2: Abyssal Rift',
      description: 'The bathyscaphe crosses the seismic trench threshold as electrical systems fail under artificial harmonic strain.',
      sceneIds: []
    },
    {
      id: 't-chap-3',
      number: 3,
      title: 'The Monolith at Horizon Zero',
      actOrPhase: 'Phase 3: The Abyssal Convergence',
      description: 'Climax and ascent: Unlocking the seabed spire before oxygen depletion seals their fate.',
      sceneIds: []
    }
  ],
  scenes: [
    {
      id: 'trench-scene-1',
      title: 'Scene 1: Pressure Hull Resonances',
      order: 1,
      chapterId: 't-chap-1',
      chapterNumber: 1,
      chapterTitle: 'Descent to the Hadal Ridge',
      actOrPhase: 'Phase 1: Deep Descent',
      narrativeBeat: '1. Opening Image & Acoustic Hook',
      premise: 'Establish isolation, extreme pressure environment, and first detection of anomalous acoustic waveform.',
      characters: ['Dr. Maya Lin', 'Chief Engineer Thorne'],
      location: 'Bathyscaphe Hadal-IV Cockpit',
      time: '04:12 UTC - 10,820m Depth',
      pov: 'Third Objective (Screenplay)',
      status: 'complete',
      wordCount: 384,
      notes: 'Focus on claustrophobia and the sound design: creaking titanium, water pumps, silence.',
      comments: [
        {
          id: 't-c-1',
          selection: 'eighteen point four seconds',
          note: 'Confirm that this frequency matches the underwater harmonic resonance calculated in Chapter 2.',
          author: 'Writer Note',
          timestamp: '3 days ago'
        }
      ],
      proseContent: `INT. BATHYSCAPHE "HADAL-IV" - CONTINUOUS

The titanium sphere GROANS. Not metal fatigue—something heavier. A sustained low-frequency vibration that rattles the ceramic coffee mug on the telemetry console.

MAYA LIN (38, hollow-eyed, salt-streaked thermal jumpsuit) presses her palm flat against the viewport acrylic. Outside, six miles of black salt water press inward at eleven hundred atmospheres.

THORNE (50s, welding visor propped on his brow) taps the sonar readout with a grease-stained thumb.

THORNE
Secondary sonar transducer just gave up. If you're chasing that phantom pulse again, Maya, do it before the starboard battery drops past twenty percent.

MAYA
It's not a phantom. Listen to the phase interval. It repeats every eighteen point four seconds. That is not tectonic grinding. That is an acoustic carrier wave.

On the phosphor monitor, a waveform blossoms: clean, mathematically symmetrical sinusoidal peaks.

THORNE
(stepping closer)
Basalt doesn't vibrate in sine waves.

MAYA
Nothing in this trench vibrates in sine waves.`
    },
    {
      id: 'trench-scene-2',
      title: 'Scene 2: The Core Sample Anomaly',
      order: 2,
      chapterId: 't-chap-1',
      chapterNumber: 1,
      chapterTitle: 'Descent to the Hadal Ridge',
      actOrPhase: 'Phase 1: Deep Descent',
      narrativeBeat: '2. The Catalyst & Anomaly Discovery',
      premise: 'Maya analyzes the basalt core sample and realizes the geological anomaly is artificial.',
      characters: ['Dr. Maya Lin'],
      location: 'Hadal-IV Hyperbaric Glovebox',
      time: '04:55 UTC',
      pov: 'Third Objective (Screenplay)',
      status: 'draft',
      wordCount: 265,
      notes: 'Make the transition from scientific curiosity to quiet dread visceral.',
      comments: [],
      proseContent: `INT. COMPARTMENT B - LAB MODULE - MOMENTS LATER

The pressurized hyperbaric glovebox HISSES as nitrogen purge valves release.

Maya slides her hands into the neoprene gauntlets. Inside the vacuum chamber sits the basalt core cylinder retrieved from Trench Ridge 7.

Under ultraviolet inspection lamps, the core sample doesn't reflect light. It absorbs it completely. A three-inch vein of black crystalline vitrification that has no right to exist under hydrothermal conditions.

MAYA
(whispering to audio log)
Sample Seven-Bravo. Crystalline density exceeds known terrestrial basalt by a factor of four point two. Microscopic striations along the shear line suggest artificial laser etching, predating the oceanic crust layer by at least three million years.

A sharp CLICK echoes through the intercom. Silence. Then Thorne's breathing.

THORNE (O.S.)
Maya. Look out the bow port. Now.`
    }
  ],
  entities: [
    {
      id: 't-ent-1',
      name: 'Dr. Maya Lin',
      type: 'character',
      status: 'confirmed',
      description: 'Lead marine geophysicist aboard the private Hadal Deep Survey. Uncompromising empiricist with deep sea acoustic specialty.',
      canonicalFacts: [
        'Doctorate in Subduction Geophysics from Scripps Institute',
        'Has logged over 400 deep-submergence dive hours',
        'Suffers from mild acoustic tinnitus since the Marianas expedition'
      ],
      linkedSceneIds: ['trench-scene-1', 'trench-scene-2']
    },
    {
      id: 't-ent-2',
      name: 'Chief Engineer Thorne',
      type: 'character',
      status: 'confirmed',
      description: 'Veteran life-support engineer. Skeptical, cautious, and intensely protective of vessel safety margins.',
      canonicalFacts: [
        'Built the Hadal-IV pressure hull dual-redundant seals',
        'Lost three fingers on an Arctic salvage rig in 2018'
      ],
      linkedSceneIds: ['trench-scene-1']
    },
    {
      id: 't-ent-3',
      name: 'The Obsidian Monolith',
      type: 'place',
      status: 'tentative',
      description: 'An anomalous vitrified basalt megalith resting on Ridge 7 at 10,820m depth, showing zero sediment accumulation.',
      canonicalFacts: [
        'Transmits non-random 18.4-second acoustic carrier pulses',
        'Surface exhibits sub-micron precision linear incisions'
      ],
      linkedSceneIds: ['trench-scene-1', 'trench-scene-2']
    }
  ],
  threads: [
    {
      id: 't-th-1',
      title: 'The 18.4-Second Transmission Sequence',
      description: 'Deconstructing whether the acoustic pulse is an automated beacon or an interactive ping.',
      status: 'active',
      color: '#0284C7',
      linkedSceneIds: ['trench-scene-1']
    },
    {
      id: 't-th-2',
      title: 'Vessel Battery & Margin to Surface',
      description: 'Critical tension between gathering data and having enough power for the 4-hour ascent.',
      status: 'active',
      color: '#D97706',
      linkedSceneIds: ['trench-scene-1']
    }
  ],
  events: [
    {
      id: 't-ev-1',
      title: 'Descent to Trench Ridge 7',
      time: '02:00 UTC',
      participants: ['Dr. Maya Lin', 'Chief Engineer Thorne'],
      consequences: 'Hadal-IV reaches bottom depth; primary transducer fails during landing.',
      linkedSceneId: 'trench-scene-1'
    }
  ],
  continuityIssues: [
    {
      id: 't-ci-1',
      title: 'Descent Elapsed Time vs Battery Gauge',
      question: 'In Scene 1 Thorne states battery is nearing 20%, but the descent log indicates Hadal-IV has only been at seafloor for 75 minutes.',
      passageA: {
        sceneTitle: 'Scene 1: Pressure Hull Resonances',
        sceneId: 'trench-scene-1',
        excerpt: 'before the starboard battery drops past twenty percent'
      },
      passageB: {
        sceneTitle: 'Descent Log Technical Note',
        sceneId: 'trench-scene-1',
        excerpt: 'descent ballast dropped at 02:00 UTC with four hours of reserve margin'
      },
      status: 'open',
      severity: 'medium'
    }
  ],
  revisionPasses: [
    {
      id: 't-rp-1',
      name: 'Sound & Pressure Atmosphere Pass',
      description: 'Ensure every line heightens the sensory dread of deep ocean physics.',
      checklist: [
        { id: 't-c-1', label: 'Verify acoustic terminology (attenuation, thermocline, carrier wave)', done: true },
        { id: 't-c-2', label: 'Audit dialogue economy to reflect low-oxygen tension', done: false }
      ]
    }
  ],
  cuttingRoom: [],
  notes: [
    {
      id: 't-n-1',
      title: 'Sound velocity at 1,100 atmospheres',
      content: 'Under extreme pressure and 2°C temperature, sound travels through water at roughly 1,535 m/s. Calculate transmission delay to surface buoy.',
      category: 'research',
      sceneId: 'trench-scene-1',
      resolved: false
    }
  ],
  snapshots: [],
  aiAuditLogs: []
};

export const INITIAL_PROJECTS: Project[] = [
  INITIAL_PROJECT,
  SECOND_PROJECT_BUNDLE.project
];

