import {
  ProjectBundle,
  Project,
  Chapter,
  Scene,
  Entity,
  Thread,
  StoryEvent,
  ContinuityIssue,
  RevisionPass,
  ManuscriptStyleSheet,
  EditorialPassDef,
  EditorialQuery
} from '../types';

export const NOVELLA_STYLE_SHEET: ManuscriptStyleSheet = {
  oxfordComma: true,
  dialogueQuoteStyle: 'double',
  emDashSpacing: 'closed',
  numbersSpelledUnder: 100,
  customTerms: [
    { term: 'glasshouse', note: 'One word, lowercase in running text unless referencing the Historic Guild Glasshouse.' },
    { term: 'sea-salt', note: 'Hyphenate when modifying flora or atmosphere (sea-salt encrustation).' },
    { term: 'Gentiana hiberna', note: 'Italicize Linnaean binomial; capitalize genus, lowercase specific epithet.' },
    { term: 'cloche', note: 'French glass bell jar; use lowercase without italics as it is anglicized.' },
    { term: 'Grand-Bé', note: 'Hyphenate island name with acute accent on Bé.' }
  ],
  flaggedEchoes: ['suddenly', 'very', 'started to', 'seemed to', 'glanced', 'felt like']
};

export const NOVELLA_EDITORIAL_PASSES: EditorialPassDef[] = [
  {
    id: 'ed-pass-1',
    name: 'Developmental & Narrative Arc',
    stage: 'developmental',
    description: 'Verify Geneviève’s internal motivation against the external ticking clock of the winter freeze.',
    focus: 'Character agency, pacing of botanical discoveries, atmospheric weight',
    completed: true,
    totalChecks: 6,
    completedChecks: 6
  },
  {
    id: 'ed-pass-2',
    name: 'Line Edit & Sensory Cadence',
    stage: 'line',
    description: 'Tighten rhythm, prune conversational filler, enhance sensory tactile details of frost and peat.',
    focus: 'Sentence variety, sensory imagery, eliminating throat-clearing openers',
    completed: false,
    totalChecks: 8,
    completedChecks: 5
  },
  {
    id: 'ed-pass-3',
    name: 'Copyediting & Publishing Style Sheet',
    stage: 'copy',
    description: 'Standardize botanical Latin conventions, em-dashes, and historical post-war terminology.',
    focus: 'Orthography, Linnaean names, dialogue punctuation, punctuation spacing',
    completed: false,
    totalChecks: 7,
    completedChecks: 3
  },
  {
    id: 'ed-pass-4',
    name: 'Final Proofread & Galleys',
    stage: 'proof',
    description: 'Catch rogue typographic anomalies, hyphenation collisions, and scene transition spacing.',
    focus: 'Typesetting, orphan lines, layout continuity',
    completed: false,
    totalChecks: 5,
    completedChecks: 0
  }
];

export const NOVELLA_PROJECT: Project = {
  id: 'proj-winter-garden',
  title: 'The Winter Garden of Saint-Malo',
  type: 'Novella',
  protagonist: 'Geneviève Laurent',
  genre: 'Historical Fiction & Botanical Mystery',
  situation: 'In the bitter winter of 1948, a botanical conservator in fortified Saint-Malo unearths a sealed subterranean greenhouse holding the last viable seeds of a legendary alpine gentian.',
  desiredSessionGoal: 'Execute post-draft line edit on Scene 2 and resolve the author queries on botanical taxonomy.',
  targetWordCount: 18500,
  status: 'completed',
  framework: 'three-act',
  lastActiveSceneId: 'novella-scene-1',
  createdAt: '2026-08-15T09:00:00.000Z',
  updatedAt: new Date().toISOString()
};

export const NOVELLA_CHAPTERS: Chapter[] = [
  {
    id: 'n-chap-1',
    number: 1,
    title: 'The Glasshouses by the Ramparts',
    actOrPhase: 'Act I: Setup & Discovery',
    description: 'Geneviève battles the biting Atlantic gale to preserve the shattered panes of the municipal conservatory and uncovers a sealed basement vault.',
    sceneIds: ['novella-scene-1', 'novella-scene-2']
  },
  {
    id: 'n-chap-2',
    number: 2,
    title: 'Salt Air and Iron Cloches',
    actOrPhase: 'Act I: The Crossing',
    description: 'Inside the subterranean crypt, Geneviève and her elder mentor Henri inspect an airtight copper canister bearing frozen soil from 1912.',
    sceneIds: ['novella-scene-3']
  },
  {
    id: 'n-chap-3',
    number: 3,
    title: 'The Linnaean Margin Notes',
    actOrPhase: 'Act II: Confrontation & Crisis',
    description: 'An envoy from the Paris Natural History Guild arrives demanding surrender of the seeds; Geneviève discovers handwritten cipher notes in the herbarium register.',
    sceneIds: ['novella-scene-4', 'novella-scene-5']
  },
  {
    id: 'n-chap-4',
    number: 4,
    title: 'The Solstice Germination',
    actOrPhase: 'Act III: Climax & Resolution',
    description: 'As a December blizzard batters the granite sea-walls, Geneviève kindles the coal stoves to coax the dormant alpine embryo into its luminous first blossom.',
    sceneIds: ['novella-scene-6']
  }
];

export const NOVELLA_SCENES: Scene[] = [
  {
    id: 'novella-scene-1',
    title: '1. Frost on the Victorian Panes',
    order: 1,
    chapterId: 'n-chap-1',
    chapterNumber: 1,
    chapterTitle: 'The Glasshouses by the Ramparts',
    actOrPhase: 'Act I: Setup & Discovery',
    narrativeBeat: '1. Opening Image & Physical Isolation',
    premise: 'Establish Geneviève’s meticulous devotion to the wounded conservatory, the biting coastal frost, and her discovery of ice forming inside the tropical bay.',
    characters: ['Geneviève Laurent'],
    location: 'Saint-Malo Municipal Conservatory, Upper Tier',
    time: 'Dawn, November 28, 1948',
    pov: 'Geneviève Laurent (Third Limited)',
    status: 'complete',
    wordCount: 684,
    notes: 'Focus heavily on the contrast between maritime salt spray outside and the humid, mossy decay inside the damaged glass dome.',
    editorialStatus: 'in-review',
    proseContent: `The salt gale had blown all night off the Channel, riming the tall Victorian ironwork of the conservatory in coats of grey brine. Geneviève Laurent stood on the third rung of her wooden orchard ladder, her woolen mittens dusted in powdered putty, pressing a triangle of salvage glass into the western clerestory frame.

Beneath her, three hundred potted ferns breathed in the damp gloom. They were survivors of the siege four years gone, their fronds ragged where shrapnel had scarred the terracotta tubs. Outside, the granite ramparts of Saint-Malo stood black against the churning foam of the tide. But inside the glass dome, the temperature was tumbling. The copper thermometer by the potting bench hovered at two degrees above freezing.

"Hold fast," she whispered to the brass brads, seating them with the flat cheek of her tacking hammer. "Just until the coal cart makes the quay."

A draft answered her—not from the western clerestory she was caulking, but from the low flagstones near the dead boiler flue. A thin ribbon of vapor curled up between the joint of two slate paving stones, smelling not of sea salt or rotted leaf mold, but of dry subterranean lime and beeswax.

Geneviève wiped her sleeve across her frost-stung brow and climbed down. When she knelt and touched the seam, the stone was stone-cold, yet the current of air was unmistakably rising from below, warm enough to thaw the frost from the edge of her fingernail.`,
    editorialBaseline: `The salt gale had blown all night off the Channel, riming the tall Victorian ironwork of the conservatory in coats of grey brine. Geneviève Laurent stood on the third rung of her wooden orchard ladder, her woolen mittens dusted in powdered putty, pressing a triangle of salvage glass into the western clerestory frame.

Beneath her, three hundred potted ferns breathed in the damp gloom. They were survivors of the siege four years gone, their fronds ragged where shrapnel had scarred the terracotta tubs. Outside, the granite ramparts of Saint-Malo stood black against the churning foam of the tide. But inside the glass dome, the temperature was tumbling. The copper thermometer by the potting bench hovered at two degrees above freezing.

"Hold fast," she whispered to the brass brads, seating them with the flat cheek of her tacking hammer. "Just until the coal cart makes the quay."

A draft answered her—not from the western clerestory she was caulking, but from the low flagstones near the dead boiler flue. A thin ribbon of vapor curled up between the joint of two slate paving stones, smelling not of sea salt or rotted leaf mold, but of dry subterranean lime and beeswax.

Geneviève wiped her sleeve across her frost-stung brow and climbed down. When she knelt and touched the seam, the stone was stone-cold, yet the current of air was unmistakably rising from below, warm enough to thaw the frost from the edge of her fingernail.`,
    editorialProseContent: `The salt gale had battered the Channel all night, riming the Victorian iron ribs of the conservatory in crusts of grey brine. Geneviève Laurent balanced on the third rung of her orchard ladder, woolen mittens stiff with linseed putty, pressing a triangle of salvaged glass into the western clerestory frame.

Beneath her boots, three hundred potted ferns stirred in the damp gloom. They were scarred survivors of the 1944 bombardment, their fronds stunted where shrapnel had chipped the terracotta tubs. Beyond the glass, the granite ramparts of Saint-Malo stood stark against the churning foam. Inside the dome, however, the air was plummeting. The brass thermometer beside the potting bench had sunk to two degrees above freezing.

"Hold fast," she murmured to the zinc glazing brads, seating each with a clean tap of her tacking hammer. "Until the coal barge reaches the quay."

A draft answered her—not from the high clerestory she had just sealed, but from the floorboards beside the disused boiler flue. A wisp of vapor curled between two granite paving stones. It carried no scent of sea salt or decaying peat; instead, it smelled of dry lime mortar and melted beeswax.

Geneviève drew her sleeve across her stinging brow and descended. When she pressed her bare palm against the joint, the stone was frigid, yet the breath rising through the hairline fracture was unmistakably warm—enough to melt the frost clinging to her knuckles.`,
    editorialQueries: [
      {
        id: 'eq-1',
        sceneId: 'novella-scene-1',
        selectionExcerpt: 'zinc glazing brads',
        comment: 'Excellent historical correction from brass brads—zinc sprigs were standard in post-war French horticultural glazing.',
        category: 'line-edit',
        severity: 'note',
        resolved: true,
        author: 'Line Editor (Claire M.)',
        createdAt: '2026-09-02T11:20:00Z',
        authorReply: 'Confirmed via 1947 Saint-Malo municipal supply archives.'
      },
      {
        id: 'eq-2',
        sceneId: 'novella-scene-1',
        selectionExcerpt: 'smelled of dry lime mortar and melted beeswax',
        comment: 'AQ: Is the beeswax smell from sealing jars or wax candles? If candles, consider adding a brief sensory echo of tallow.',
        category: 'author-query',
        severity: 'suggestion',
        resolved: false,
        author: 'Developmental Editor (Marcus K.)',
        createdAt: '2026-09-02T14:15:00Z'
      }
    ],
    comments: [
      {
        id: 'nc-1',
        selection: 'zinc glazing brads',
        note: 'Verified against Saint-Malo municipal archives.',
        author: 'Author Note',
        timestamp: 'Sep 2, 2026'
      }
    ]
  },
  {
    id: 'novella-scene-2',
    title: '2. The Crypt of the Apothecary',
    order: 2,
    chapterId: 'n-chap-1',
    chapterNumber: 1,
    chapterTitle: 'The Glasshouses by the Ramparts',
    actOrPhase: 'Act I: Setup & Discovery',
    narrativeBeat: '2. Inciting Incident & Threshold',
    premise: 'Geneviève levers up the loose flagstone and discovers a forgotten 18th-century vaulted cellar containing the leaden seed chests of Brother Anselm.',
    characters: ['Geneviève Laurent'],
    location: 'Conservatory Sub-Vault',
    time: 'Morning, November 28, 1948',
    pov: 'Geneviève Laurent (Third Limited)',
    status: 'complete',
    wordCount: 718,
    notes: 'The transition from the cold grey daylight into the warm, dust-mottled crypt must feel mystical yet grounded in historical botanical science.',
    editorialStatus: 'in-review',
    proseContent: `Using the iron pry-bar from the potting shed, Geneviève coaxed the heavy flagstone upward. It yielded with a grinding groan of mortar, releasing an intoxicating puff of dry earth, cloves, and cedar shavings.

She struck a sulfur match and held it over the dark void. A flight of six granite steps descended into an arched cellar she had never seen on the city survey maps. When the war raged through the old quarter, when fire rained from bombers and gutted the cathedral spire, this stone ceiling had borne the collapse of three stories of masonry without yielding an inch.

She took the brass hurricane lantern from the work table, lit its wick, and walked down.

The walls were lined with tiered chestnut drying racks. Upon them rested dozens of wide-mouthed glass jars sealed with red paraffin wax, each bearing a parchment label penned in brown iron-gall ink.

Geneviève drew her lantern close to the nearest jar.

"Papaver somniferum var. maritimum," she read aloud, her voice trembling in the vaulted stillness. "Harvested at Cap Fréhel, August 1789."

At the center of the chamber, resting on a pedestal of dressed slate, sat a cylindrical container of spun copper, sealed with three lead seals bearing the crest of the Benedictine abbey that had once crowned the rocky promontory. On its polished lid was stamped a single Latin line:

Non omnis moriar. I shall not wholly die.`,
    editorialBaseline: `Using the iron pry-bar from the potting shed, Geneviève coaxed the heavy flagstone upward. It yielded with a grinding groan of mortar, releasing an intoxicating puff of dry earth, cloves, and cedar shavings.

She struck a sulfur match and held it over the dark void. A flight of six granite steps descended into an arched cellar she had never seen on the city survey maps. When the war raged through the old quarter, when fire rained from bombers and gutted the cathedral spire, this stone ceiling had borne the collapse of three stories of masonry without yielding an inch.

She took the brass hurricane lantern from the work table, lit its wick, and walked down.

The walls were lined with tiered chestnut drying racks. Upon them rested dozens of wide-mouthed glass jars sealed with red paraffin wax, each bearing a parchment label penned in brown iron-gall ink.

Geneviève drew her lantern close to the nearest jar.

"Papaver somniferum var. maritimum," she read aloud, her voice trembling in the vaulted stillness. "Harvested at Cap Fréhel, August 1789."

At the center of the chamber, resting on a pedestal of dressed slate, sat a cylindrical container of spun copper, sealed with three lead seals bearing the crest of the Benedictine abbey that had once crowned the rocky promontory. On its polished lid was stamped a single Latin line:

Non omnis moriar. I shall not wholly die.`,
    editorialProseContent: `Wedging the iron crowbar beneath the flagstone’s worn shoulder, Geneviève leaned her full weight against the shaft. The slab shifted with a dry, grinding scrape, releasing a gust of cedar shavings, crushed clove, and sun-baked peat.

She struck a match against her boot heel and thrust the flare over the aperture. Six granite treads descended into a barrel-vaulted crypt entirely absent from the municipal survey plans. When incendiaries had devastated the walled town in the summer of 1944, leveling the timbered facades and collapsing the cathedral’s slate spire, these subterranean arches had held fast beneath thousands of tons of rubble.

She lit the hurricane lantern, hooked its wire bail over her thumb, and stepped into the vault.

Tiered chestnut drying racks lined the walls from flagstone to springline. Rows of hand-blown glass jars sat in orderly regiments, their cork stoppers dipped in scarlet wax, each bearing a label inscribed in faded iron-gall ink.

Geneviève brought the lantern closer.

"Papaver somniferum var. maritimum," she whispered, her breath barely clouding the glass. "Cap Fréhel, August 1789."

Yet it was not the opium poppies that drew her gaze to the center of the room. There, atop an octagonal pedestal of dark slate, rested a heavy cylinder of spun copper, banded with brass rivets and secured by three lead seals bearing the Benedictine knot of Saint-Malo. Stamped across its cold domed cap was an inscription in roman capitals:

NON OMNIS MORIAR.`,
    editorialQueries: [
      {
        id: 'eq-3',
        sceneId: 'novella-scene-2',
        selectionExcerpt: 'NON OMNIS MORIAR',
        comment: 'Line Edit: Horace Odes Book III.30. Perfect thematic resonance for the resurrection of lost seed stock.',
        category: 'developmental',
        severity: 'note',
        resolved: true,
        author: 'Senior Editor (Julian S.)',
        createdAt: '2026-09-03T09:40:00Z'
      },
      {
        id: 'eq-4',
        sceneId: 'novella-scene-2',
        selectionExcerpt: 'entirely absent from the municipal survey plans',
        comment: 'Pacing Check: Consider whether Geneviève should show more astonishment here, given she has cataloged this building for five years.',
        category: 'pacing',
        severity: 'suggestion',
        resolved: false,
        author: 'Line Editor (Claire M.)',
        createdAt: '2026-09-03T10:15:00Z'
      }
    ],
    comments: []
  },
  {
    id: 'novella-scene-3',
    title: '3. The Elder Botanist of Paramé',
    order: 3,
    chapterId: 'n-chap-2',
    chapterNumber: 2,
    chapterTitle: 'Salt Air and Iron Cloches',
    actOrPhase: 'Act I: The Crossing',
    narrativeBeat: '3. Consultation & Lore Revelation',
    premise: 'Geneviève brings the cylinder to Henri Vasseur, her retired mentor living in the salt marshes of Paramé, who reveals the mythic lineage of the alpine gentian.',
    characters: ['Geneviève Laurent', 'Henri Vasseur'],
    location: "Henri's Cottage Study, Paramé",
    time: 'Dusk, November 29, 1948',
    pov: 'Geneviève Laurent (Third Limited)',
    status: 'complete',
    wordCount: 742,
    notes: 'Ground the intellectual debate: Henri believes the seed is too fragile to survive germination, while Geneviève insists on attempting the winter bloom.',
    editorialStatus: 'in-review',
    proseContent: `Henri Vasseur adjusted his magnifying spectacles with fingers twisted by arthritis. The oil lamp on his cluttered desk cast amber light across stacks of drying blotters and pressed herbarium sheets.

"Gentiana hiberna," the old man murmured, turning the heavy copper canister between his palms as though it might detonate. "I thought the last wild clump was grazed out of existence by goat herds in the Val d'Isère before my grandfather was born."

"Brother Anselm brought twelve seed pods across the mountains in the autumn of 1791," Geneviève said, leaning over the desk. "He sealed them inside glass ampoules filled with argon gas and alpine charcoal. Look at the seals, Henri. They are unbreached."

"And if you break them, Laurent?" Henri looked up, his pale blue eyes fierce under bushy white brows. "You have thirty seeds. If you place them in soil and they rot in our wet Brittany cold, the species is extinct forever. Extinct by your own vanity."

"And if they sit in that vault another fifty years?" she countered, her voice quiet but ringing. "Every winter the seed embryo loses two percent of its metabolic vigor. By the turn of the century, they will be nothing more than sterile dust. We have to wake them now."`,
    editorialBaseline: `Henri Vasseur adjusted his magnifying spectacles with fingers twisted by arthritis. The oil lamp on his cluttered desk cast amber light across stacks of drying blotters and pressed herbarium sheets.

"Gentiana hiberna," the old man murmured, turning the heavy copper canister between his palms as though it might detonate. "I thought the last wild clump was grazed out of existence by goat herds in the Val d'Isère before my grandfather was born."

"Brother Anselm brought twelve seed pods across the mountains in the autumn of 1791," Geneviève said, leaning over the desk. "He sealed them inside glass ampoules filled with argon gas and alpine charcoal. Look at the seals, Henri. They are unbreached."

"And if you break them, Laurent?" Henri looked up, his pale blue eyes fierce under bushy white brows. "You have thirty seeds. If you place them in soil and they rot in our wet Brittany cold, the species is extinct forever. Extinct by your own vanity."

"And if they sit in that vault another fifty years?" she countered, her voice quiet but ringing. "Every winter the seed embryo loses two percent of its metabolic vigor. By the turn of the century, they will be nothing more than sterile dust. We have to wake them now."`,
    editorialProseContent: `Henri Vasseur adjusted his twin magnifying loupes with knobby, arthritic knuckles. The kerosene lamp on his drafting desk cast deep amber pools across decades of pressed herbarium sheets and handwritten field journals.

"Gentiana hiberna," the old man breathed, turning the copper cylinder in his palm as if measuring the weight of a live shell. "The Savoyards called it the Scribe’s Gentian because its petals dried to the exact tint of midnight ink. I believed the last wild colonies had been grazed into oblivion before my grandfather was born."

"Brother Anselm carried twelve seed heads across the high passes in October 1791," Geneviève said, leaning across the table. "He sealed each pod inside a glass ampoule filled with alpine charcoal. The seals are intact, Henri. Not a speck of maritime moisture has touched them."

"And the moment you crack the glass, Geneviève?" Henri raised his head, his pale eyes narrowing behind thick lenses. "You possess perhaps forty seeds in total. If you bed them in damp Brittany peat and they damp off under winter mildew, the entire species is extinguished. Gone because a young conservator could not bear to leave a relic in peace."

"And if we leave them in the dark?" she demanded, matching his gaze. "Every season that passes diminishes their metabolic vitality. In another generation, the embryo’s reserves will be spent. They will be nothing more than inert dust in a copper reliquary. We must sow them before the solstice."`,
    editorialQueries: [
      {
        id: 'eq-5',
        sceneId: 'novella-scene-3',
        selectionExcerpt: 'the Scribe’s Gentian because its petals dried to the exact tint of midnight ink',
        comment: 'Sensory line polish: Brilliant worldbuilding detail. Ties directly to the illuminated manuscripts in Chapter 3.',
        category: 'line-edit',
        severity: 'note',
        resolved: true,
        author: 'Line Editor (Claire M.)',
        createdAt: '2026-09-04T08:30:00Z'
      }
    ],
    comments: []
  },
  {
    id: 'novella-scene-4',
    title: '4. The Envoy from the Rue Cuvier',
    order: 4,
    chapterId: 'n-chap-3',
    chapterNumber: 3,
    chapterTitle: 'The Linnaean Margin Notes',
    actOrPhase: 'Act II: Confrontation',
    narrativeBeat: '4. External Antagonism & Sovereign Stakes',
    premise: 'An official from the National Museum of Natural History in Paris arrives with a requisition order to seize the seeds for archival storage in the capital.',
    characters: ['Geneviève Laurent', 'Inspector Delacroix'],
    location: 'Conservatory Office',
    time: 'December 4, 1948',
    pov: 'Geneviève Laurent (Third Limited)',
    status: 'complete',
    wordCount: 650,
    notes: 'The institutional arrogance of Paris vs. the tactile stewardship of the local maritime conservator.',
    editorialStatus: 'in-review',
    proseContent: `Inspector Delacroix did not remove his lambskin driving gloves as he stepped into the damp conservatory. He was a creature of ministerial corridors—crisp charcoal overcoat, polished calfskin shoes that clicked haughtily on the mossy flagstones.

"Mademoiselle Laurent," he said, producing a stamped folded parchment from his breast pocket. "By decree of the Ministry of Agriculture and the Directorate of the Muséum National, all botanical antiquities discovered on state property are subject to immediate federal custody."

Geneviève did not take the paper. Her hands were wet with river sand and sifted leaf mold.

"The conservatory belongs to the Commune of Saint-Malo, Monsieur Delacroix. We answered the bombs while your ministry sat in Vichy."

"The Commune has no facilities to safeguard an eighteenth-century genetic relic," Delacroix replied coldly, his gaze sweeping over the cracked glass overhead and the dripping gutters. "A single frost will burst these pipes. In Paris, the specimen will rest in climate-regulated steel cabinets at the Jardin des Plantes."

"It will rest in a drawer until it dies of boredom," she retorted. "Seeds were not made for cabinets. They were made to grow."`,
    editorialBaseline: `Inspector Delacroix did not remove his lambskin driving gloves as he stepped into the damp conservatory. He was a creature of ministerial corridors—crisp charcoal overcoat, polished calfskin shoes that clicked haughtily on the mossy flagstones.

"Mademoiselle Laurent," he said, producing a stamped folded parchment from his breast pocket. "By decree of the Ministry of Agriculture and the Directorate of the Muséum National, all botanical antiquities discovered on state property are subject to immediate federal custody."

Geneviève did not take the paper. Her hands were wet with river sand and sifted leaf mold.

"The conservatory belongs to the Commune of Saint-Malo, Monsieur Delacroix. We answered the bombs while your ministry sat in Vichy."

"The Commune has no facilities to safeguard an eighteenth-century genetic relic," Delacroix replied coldly, his gaze sweeping over the cracked glass overhead and the dripping gutters. "A single frost will burst these pipes. In Paris, the specimen will rest in climate-regulated steel cabinets at the Jardin des Plantes."

"It will rest in a drawer until it dies of boredom," she retorted. "Seeds were not made for cabinets. They were made to grow."`,
    editorialProseContent: `Inspector Delacroix kept his lambskin motoring gloves on as he entered the humid conservatory. He carried the unmistakable aura of Parisian ministries—a double-breasted woolen overcoat and calfskin oxfords that clicked impatiently against the mossy flagstones.

"Mademoiselle Laurent," he began, drawing a tri-fold parchment embossed with the seal of the Muséum National from his breast pocket. "Under the decree of November 1946, all historical flora and heritage germplasm recovered on public property fall under immediate ministerial jurisdiction."

Geneviève kept both hands planted firmly in a wooden flat of sterilized river sand. She did not reach for the paper.

"The municipal glasshouses belong to the Commune of Saint-Malo, Monsieur Delacroix. We salvaged these collections under mortar fire while your directors retreated to the provinces."

"The Commune lacks the basic utilities to maintain an eighteenth-century genetic holotype," Delacroix countered, his eyes flicking disdainfully toward the caulked glass overhead and the rusted iron rainwater downspout. "One severe blizzard will shatter these panes. In Paris, the specimen will reside in temperature-controlled vaults at the Rue Cuvier."

"It will sit in a metal drawer until its breath fails," she retorted, stepping forward until the earthy smell of wet loam between them eclipsed his cologne. "A seed is not an antique coin, Inspector. It is an argument with winter."`,
    editorialQueries: [
      {
        id: 'eq-6',
        sceneId: 'novella-scene-4',
        selectionExcerpt: 'A seed is not an antique coin, Inspector. It is an argument with winter.',
        comment: 'Stunning thematic anchor sentence. Retain verbatim in the final galley pass.',
        category: 'line-edit',
        severity: 'note',
        resolved: true,
        author: 'Senior Editor (Julian S.)',
        createdAt: '2026-09-04T16:00:00Z'
      }
    ],
    comments: []
  },
  {
    id: 'novella-scene-5',
    title: '5. The Cryptographic Herbarium',
    order: 5,
    chapterId: 'n-chap-3',
    chapterNumber: 3,
    chapterTitle: 'The Linnaean Margin Notes',
    actOrPhase: 'Act II: The Climax Approaches',
    narrativeBeat: '5. Technical Discovery & Solution',
    premise: 'Geneviève decodes Brother Anselm’s hidden notes on the germination trigger: the seeds require exposure to glacial meltwater and crushed granite quartz.',
    characters: ['Geneviève Laurent'],
    location: 'Conservatory Herbarium Annex',
    time: 'Night, December 14, 1948',
    pov: 'Geneviève Laurent (Third Limited)',
    status: 'complete',
    wordCount: 620,
    notes: 'The technical mechanics of botanical vernalization explained with literary elegance.',
    editorialStatus: 'in-review',
    proseContent: `In the margins of the 1788 Linnaean Folio, beneath the woodcut illustration of alpine gentians, Brother Anselm had written in tiny, crabbed Latin shorthand:

Ignis sub nive. Fire beneath the snow.

Geneviève adjusted her magnifying glass. Between the ink strokes lay microscopic indentations, pressed with a dry stylus before the book had been bound. By holding the page at an acute angle to the candle flame, the shadow lines revealed the true recipe for breaking the embryo's two-century slumber.

They did not require warmth. They required shock.

First, sixty hours in frozen sea-fog at minus four degrees. Then, an immersion in snowmelt mixed with crushed feldspar and granite dust from the sea-walls, replicating the torrential glacial wash of high alpine springs.`,
    editorialBaseline: `In the margins of the 1788 Linnaean Folio, beneath the woodcut illustration of alpine gentians, Brother Anselm had written in tiny, crabbed Latin shorthand:

Ignis sub nive. Fire beneath the snow.

Geneviève adjusted her magnifying glass. Between the ink strokes lay microscopic indentations, pressed with a dry stylus before the book had been bound. By holding the page at an acute angle to the candle flame, the shadow lines revealed the true recipe for breaking the embryo's two-century slumber.

They did not require warmth. They required shock.

First, sixty hours in frozen sea-fog at minus four degrees. Then, an immersion in snowmelt mixed with crushed feldspar and granite dust from the sea-walls, replicating the torrential glacial wash of high alpine springs.`,
    editorialProseContent: `In the lower margin of the 1788 Linnaean Folio, beneath a woodcut of the gentian's sapphire corolla, Brother Anselm had inscribed four words in crabbed monastic script:

Ignis sub glacie ardet.

Geneviève leaned over the desk, tilting the rag-paper folio so the candle flame raked across the fibers. Beneath the ink lay blind stylus impressions—a secret cipher pressed into the wet paper two centuries ago before the signatures were stitched.

She traced the indentations with the tip of an ivory bone-folder. The formula for waking the seed was the inverse of everything standard horticulture prescribed.

They did not require gentle heat. They demanded a deliberate baptism of ice.

First, seventy-two hours of sustained freezing within Atlantic sea-fog. Then, a sudden drenching in snowmelt enriched with pulverized granite feldspar, mimicking the roaring spring thaw of Savoyard glacial moraines.`,
    editorialQueries: [],
    comments: []
  },
  {
    id: 'novella-scene-6',
    title: '6. The Solstice Blossom',
    order: 6,
    chapterId: 'n-chap-4',
    chapterNumber: 4,
    chapterTitle: 'The Solstice Germination',
    actOrPhase: 'Act III: Climax & Resolution',
    narrativeBeat: '6. Climactic Miracle & Transmutation',
    premise: 'On the longest night of the year, while a gale rages outside, the glass cloches reveal the incandescent midnight-blue unfolding of the Gentiana hiberna.',
    characters: ['Geneviève Laurent', 'Henri Vasseur'],
    location: 'Conservatory Inner Bell-Cloche Station',
    time: 'Midnight, Winter Solstice, December 21, 1948',
    pov: 'Geneviève Laurent (Third Limited)',
    status: 'complete',
    wordCount: 710,
    notes: 'The triumphant visual and emotional climax: science, patience, and devotion vindicated.',
    editorialStatus: 'line-edited',
    proseContent: `The blizzard struck the ramparts of Saint-Malo with the roar of an artillery barrage. Sleet rattled against the iron glasshouse like buckets of thrown shrapnel. Inside the propagation chamber, Geneviève and Henri sat on low stools, watching the row of three heavy Victorian glass cloches.

Under the central bell jar, seated in a bed of crushed granite and damp peat, a pale shoot had pushed through the black soil at noon. Now, as the grandfather clock in the potting shed struck midnight, the shoot uncurled.

Two slender emerald cotyledons parted. From between them rose a single spear-shaped bud, frosted in microscopic silver down.

Before their eyes, fed by the faint steam of the kerosene burner, the petals parted.

It was not the pale violet of ordinary meadow gentians. It was a blue so intense it seemed to generate its own luminescence—the deep, velvet indigo of the Atlantic abyss at midnight.

Henri took off his spectacles. Tears traced the deep creases of his weathered cheeks.

"She has kept her word," the old man whispered. "The earth remembers."`,
    editorialBaseline: `The blizzard struck the ramparts of Saint-Malo with the roar of an artillery barrage. Sleet rattled against the iron glasshouse like buckets of thrown shrapnel. Inside the propagation chamber, Geneviève and Henri sat on low stools, watching the row of three heavy Victorian glass cloches.

Under the central bell jar, seated in a bed of crushed granite and damp peat, a pale shoot had pushed through the black soil at noon. Now, as the grandfather clock in the potting shed struck midnight, the shoot uncurled.

Two slender emerald cotyledons parted. From between them rose a single spear-shaped bud, frosted in microscopic silver down.

Before their eyes, fed by the faint steam of the kerosene burner, the petals parted.

It was not the pale violet of ordinary meadow gentians. It was a blue so intense it seemed to generate its own luminescence—the deep, velvet indigo of the Atlantic abyss at midnight.

Henri took off his spectacles. Tears traced the deep creases of his weathered cheeks.

"She has kept her word," the old man whispered. "The earth remembers."`,
    editorialProseContent: `The solstice gale hammered the outer ramparts with the sustained fury of naval guns. Sleet hurled against the high glass dome like sprays of buckshot, but inside the sealed propagation bay, the air held motionless and warm.

Geneviève and Henri sat beside the zinc bench, their eyes locked on the central bell-cloche.

Beneath the curved glass, rooted in a mixture of powdered granite and alpine peat, a pale green filament had broken the surface at dusk. Now, as the bell tower of Saint-Vincent tolled midnight across the storm-tossed roofs, the stalk straightened.

Two lanceolate leaves unfurled, glistening with beads of condensation. From their clasp rose a slender corolla wrapped in silver filaments.

With an almost perceptible sigh of tension releasing, the five petals parted.

The color defied the dim lantern light. It was not the wan purple of common field gentians; it was an incandescent, bottomless indigo—the precise hue of Atlantic sea-depths beneath winter ice.

Henri slowly lowered his loupes. A tear slipped into the stubble of his chin.

"She kept her counsel," the old botanist murmured, resting his trembling hand on Geneviève's shoulder. "Two hundred winters in the dark, and she remembered how to bloom."`,
    editorialQueries: [
      {
        id: 'eq-7',
        sceneId: 'novella-scene-6',
        selectionExcerpt: 'Two hundred winters in the dark, and she remembered how to bloom.',
        comment: 'Final line approval: Pristine emotional and thematic closure for the novella.',
        category: 'developmental',
        severity: 'note',
        resolved: true,
        author: 'Senior Editor (Julian S.)',
        createdAt: '2026-09-05T12:00:00Z'
      }
    ],
    comments: []
  }
];

export const NOVELLA_ENTITIES: Entity[] = [
  {
    id: 'ent-genevieve',
    name: 'Geneviève Laurent',
    type: 'character',
    status: 'confirmed',
    description: 'A 29-year-old botanical conservator and herbal archivist who returned to liberated Saint-Malo to salvage the ruined municipal collections.',
    canonicalFacts: [
      'Appointed Chief Conservator of the Municipal Glasshouses in October 1945.',
      'Daughter of a Saint-Malo sailmaker; intimately understands Channel weather patterns.',
      'Refuses to surrender local botanical collections to central Parisian ministries.'
    ],
    linkedSceneIds: ['novella-scene-1', 'novella-scene-2', 'novella-scene-3', 'novella-scene-4', 'novella-scene-5', 'novella-scene-6'],
    characterPlanning: {
      role: 'protagonist',
      want: 'To successfully germinate the lost Gentiana hiberna before winter freezes the glasshouses.',
      need: 'To trust that life can renew itself after devastating destruction, matching her own recovery from the war.',
      flaw: 'Prone to fierce territorial stubbornness that alienates allies.',
      voiceNotes: 'Precise, calm, rich in sensory observations of soil, glass, and tides.'
    }
  },
  {
    id: 'ent-henri',
    name: 'Henri Vasseur',
    type: 'character',
    status: 'confirmed',
    description: 'Elder botanist, retired professor of Linnaean taxonomy, and Geneviève’s longtime mentor living in the salt marshes of Paramé.',
    canonicalFacts: [
      'Born in 1872; author of the definitive Flora of the Emerald Coast (1911).',
      'Loss of his grandson during the Normandy campaign made him wary of fragile hopes.',
      'Possesses the only surviving set of 18th-century botanical loupes in Brittany.'
    ],
    linkedSceneIds: ['novella-scene-3', 'novella-scene-6'],
    characterPlanning: {
      role: 'mentor',
      want: 'To preserve rare specimens safely in dormancy rather than risk extinction in failed attempts.',
      need: 'To witness a living miracle and rekindle his faith in botanical continuity.',
      flaw: 'Over-cautious to the point of paralysis.'
    }
  },
  {
    id: 'ent-conservatory',
    name: 'The Rampart Conservatory',
    type: 'place',
    status: 'confirmed',
    description: 'An 1860s wrought-iron and granite municipal greenhouse clinging to the inner sea-wall of Saint-Malo.',
    canonicalFacts: [
      'Designed by maritime architect Eugène Belvaux with ballast granite and forged naval iron.',
      'Sustained direct blast damage in August 1944, leaving over four hundred cracked clerestory panes.',
      'Conceals an unmapped 18th-century Benedictine seed vault beneath its boiler flue.'
    ],
    linkedSceneIds: ['novella-scene-1', 'novella-scene-2', 'novella-scene-4', 'novella-scene-5', 'novella-scene-6'],
    worldPlanning: {
      category: 'Geography & Historic Architecture',
      sensoryAtmosphere: 'Salty brine on the outside, humid moss, damp cedar, coal smoke, and iron rust on the inside.'
    }
  },
  {
    id: 'ent-gentiana',
    name: 'Gentiana hiberna (Scribe’s Gentian)',
    type: 'object',
    status: 'confirmed',
    description: 'An extinct high-alpine gentian famed for blooming exclusively during sub-zero winter temperatures, yielding an ink-like cobalt pigment.',
    canonicalFacts: [
      'Gathered by Savoyard monks in the 1790s before alpine sheep-grazing wiped out wild colonies.',
      'Requires prolonged exposure to sub-zero sea-fog followed by glacial mineral drenching to break seed dormancy.',
      'Its petals produce an incandescent midnight-blue coloration prized by medieval illuminators.'
    ],
    linkedSceneIds: ['novella-scene-1', 'novella-scene-2', 'novella-scene-3', 'novella-scene-5', 'novella-scene-6']
  },
  {
    id: 'ent-guild',
    name: 'The Granite Herbarium Guild',
    type: 'organization',
    status: 'confirmed',
    description: 'The informal maritime society of Breton gardeners, seed-savers, and apothecaries defending local plant heritage.',
    canonicalFacts: [
      'Founded in 1782 by seafaring merchant captains bringing seeds from South America and the Levant.',
      'Refuses to register heirloom germplasm with the central ministerial registry in Paris.'
    ],
    linkedSceneIds: ['novella-scene-2', 'novella-scene-4']
  }
];

export const NOVELLA_THREADS: Thread[] = [
  {
    id: 'th-germination',
    title: 'The Solstice Germination Window',
    description: 'The ticking clock: The dormant seed embryos lose vitality each day, and winter freeze will soon drop the glasshouse temperature below freezing.',
    status: 'active',
    color: '#35505F',
    linkedSceneIds: ['novella-scene-1', 'novella-scene-3', 'novella-scene-5', 'novella-scene-6']
  },
  {
    id: 'th-paris',
    title: 'Parisian Ministerial Requisition',
    description: 'Inspector Delacroix’s looming deadline to confiscate the Benedictine seed cylinder for the national archives.',
    status: 'active',
    color: '#B54B32',
    linkedSceneIds: ['novella-scene-4']
  },
  {
    id: 'th-cipher',
    title: 'Brother Anselm’s Alpine Cipher',
    description: 'Deciphering the cryptic margin notes in the 1788 Linnaean folio before attempting to plant the seeds.',
    status: 'resolved',
    color: '#3A7D6E',
    linkedSceneIds: ['novella-scene-2', 'novella-scene-5']
  }
];

export const NOVELLA_EVENTS: StoryEvent[] = [
  {
    id: 'ne-1',
    title: 'Discovery of the Benedictine Sub-Vault',
    time: 'Nov 28, 1948',
    participants: ['Geneviève Laurent'],
    consequences: 'Reveals the existence of uncataloged 18th-century alpine seed stock.',
    linkedSceneId: 'novella-scene-2'
  },
  {
    id: 'ne-2',
    title: 'The Solstice Bloom of Gentiana hiberna',
    time: 'Dec 21, 1948',
    participants: ['Geneviève Laurent', 'Henri Vasseur'],
    consequences: 'Proves the botanical survival of the extinct alpine species.',
    linkedSceneId: 'novella-scene-6'
  }
];

export const NOVELLA_CONTINUITY_ISSUES: ContinuityIssue[] = [
  {
    id: 'nci-1',
    title: 'Number of Seed Pods vs. Individual Seeds',
    question: 'Scene 3 mentions twelve seed pods containing forty seeds, while Scene 2 mentions thirty seeds. Standardize to twelve pods containing approximately forty seeds.',
    passageA: {
      sceneTitle: '2. The Crypt of the Apothecary',
      sceneId: 'novella-scene-2',
      excerpt: 'You have thirty seeds. If you place them in soil...'
    },
    passageB: {
      sceneTitle: '3. The Elder Botanist of Paramé',
      sceneId: 'novella-scene-3',
      excerpt: 'He sealed each pod inside a glass ampoule... forty seeds in total.'
    },
    status: 'resolved',
    severity: 'medium'
  }
];

export const NOVELLA_REVISION_PASSES: RevisionPass[] = [
  {
    id: 'nrp-1',
    name: 'Post-Draft Editorial Pass',
    description: 'Complete developmental and line edit of all 6 scenes prior to galley publication.',
    checklist: [
      { id: 'nc-1', label: 'Verify botanical nomenclature for Gentiana hiberna', done: true, sceneId: 'novella-scene-1' },
      { id: 'nc-2', label: 'Harmonize seed count continuity between scenes 2 and 3', done: true, sceneId: 'novella-scene-2' },
      { id: 'nc-3', label: 'Check sensory pacing during Delacroix confrontation', done: true, sceneId: 'novella-scene-4' },
      { id: 'nc-4', label: 'Confirm Linnaean Latin grammar in Brother Anselm cipher', done: true, sceneId: 'novella-scene-5' },
      { id: 'nc-5', label: 'Final polish of the solstice bloom climactic sensory prose', done: true, sceneId: 'novella-scene-6' }
    ]
  }
];

export const NOVELLA_PROJECT_BUNDLE: ProjectBundle = {
  project: NOVELLA_PROJECT,
  chapters: NOVELLA_CHAPTERS,
  scenes: NOVELLA_SCENES,
  activeSceneId: 'novella-scene-1',
  entities: NOVELLA_ENTITIES,
  threads: NOVELLA_THREADS,
  events: NOVELLA_EVENTS,
  continuityIssues: NOVELLA_CONTINUITY_ISSUES,
  revisionPasses: NOVELLA_REVISION_PASSES,
  cuttingRoom: [],
  notes: [
    {
      id: 'nn-1',
      title: 'Historical Maritime Glazing Note',
      content: 'In 1948 Saint-Malo, zinc sprigs were favored over copper due to post-war copper shortages.',
      category: 'research',
      resolved: true
    },
    {
      id: 'nn-2',
      title: 'Line Edit Query for Scene 2',
      content: 'Check whether the phrase "argued with winter" should appear as foreshadowing in Scene 1.',
      category: 'idea',
      resolved: false
    }
  ],
  snapshots: [
    {
      id: 'snap-novella-draft1',
      name: 'Draft 1 Milestone - Complete Manuscript',
      timestamp: '2026-08-30T16:00:00.000Z',
      scenesSummary: NOVELLA_SCENES.map((s) => ({
        id: s.id,
        title: s.title,
        wordCount: s.wordCount,
        proseContent: s.proseContent
      }))
    }
  ],
  aiAuditLogs: [],
  editorialStyleSheet: NOVELLA_STYLE_SHEET,
  editorialPasses: NOVELLA_EDITORIAL_PASSES
};
