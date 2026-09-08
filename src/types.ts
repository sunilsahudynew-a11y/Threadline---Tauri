export type ProjectType = 'Novel' | 'Screenplay' | 'Novella' | 'Short Story' | 'Screenplay Experiment' | 'Worldbuilding Bible';
export type WritingFramework = 'three-act' | 'save-the-cat' | 'heros-journey' | 'story-circle' | 'blank';

export interface Chapter {
  id: string;
  number: number;
  title: string;
  actOrPhase?: string;
  description?: string;
  sceneIds: string[];
}

export type EntityType = 'character' | 'place' | 'object' | 'organization' | 'concept';
export type EntityStatus = 'confirmed' | 'tentative' | 'contradicted' | 'retired';

export interface VisualDetails {
  imageUrl?: string;
  appearance?: string; // Physical traits, distinctive marks, silhouette, posture
  appearanceNotes?: string;
  sensoryAtmosphere?: string;
  colorPalette?: string[]; // Signature colors (hex codes or names)
  attireOrArchitecture?: string; // Clothing, costume, materials, architectural style
  moodKeywords?: string[]; // Aesthetic tags, e.g., "steampunk", "gothic", "neon"
  galleryUrls?: string[]; // Extra visual reference links or base64 images
  bannerUrl?: string; // Header or landscape art
}

export type CharacterRole = 'protagonist' | 'antagonist' | 'deuteragonist' | 'mentor' | 'ally' | 'rival' | 'foil' | 'supporting';

export interface CharacterPlanning {
  role?: CharacterRole;
  want?: string; // External goal
  need?: string; // Internal/spiritual need
  wound?: string; // Backstory trauma or ghost
  ghostOrWound?: string;
  flaw?: string; // Fatal character flaw
  fatalFlaw?: string;
  secret?: string;
  secrets?: string; // Hidden truths
  voiceNotes?: string; // Speech cadence, favorite phrases, dialect
}

export interface WorldPlanning {
  category?: string; // Geography, Magic/Tech, Government, Cultural, Relic
  sensoryAtmosphere?: string; // Smells, ambient sounds, temperature, light
  culturalRules?: string | string[]; // Taboos, traditions, laws
  dangerLevel?: string;
  influenceOrDangerLevel?: string; // Low, Moderate, Treacherous
}

export interface ResearchEntry {
  id: string;
  topic: string;
  notes?: string;
  sourceUrl?: string;
  sources?: string[];
  status?: 'inquiry' | 'in-progress' | 'verified' | 'canon' | 'debunked';
  verified?: boolean;
}

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  status: EntityStatus;
  description: string;
  canonicalFacts: string[];
  linkedSceneIds: string[];
  imageUrl?: string;
  visualDetails?: VisualDetails;
  characterPlanning?: CharacterPlanning;
  worldPlanning?: WorldPlanning;
  researchEntries?: ResearchEntry[];
}

export interface StoryEvent {
  id: string;
  title: string;
  time: string;
  participants: string[];
  consequences: string;
  linkedSceneId?: string;
}

export interface Thread {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'resolved' | 'dormant';
  color: string;
  linkedSceneIds: string[];
}

export interface SceneComment {
  id: string;
  selection: string;
  note: string;
  author: string;
  timestamp: string;
}

export interface SceneVersion {
  id: string;
  timestamp: string;
  title: string;
  proseContent: string;
  wordCount: number;
  label?: string; // e.g., "Manual snapshot", "Auto-saved revision", "Pre-restore backup"
}

export interface Scene {
  id: string;
  title: string;
  order: number;
  chapterId?: string;
  chapterNumber?: number;
  chapterTitle?: string;
  actOrPhase?: string;
  narrativeBeat?: string;
  proseContent: string;
  premise: string;
  characters: string[];
  location: string;
  time: string;
  pov: string;
  status: 'draft' | 'revised' | 'complete';
  wordCount: number;
  notes: string;
  comments: SceneComment[];
  versions?: SceneVersion[];
  editorialProseContent?: string;
  editorialBaseline?: string;
  editorialQueries?: EditorialQuery[];
  editorialStatus?: 'unedited' | 'in-review' | 'line-edited' | 'copyedited' | 'clean-approved';
}

export type EditorialCategory = 'developmental' | 'line-edit' | 'continuity' | 'pacing' | 'author-query' | 'grammar';

export interface EditorialQuery {
  id: string;
  sceneId: string;
  selectionExcerpt: string;
  comment: string;
  category: EditorialCategory;
  severity: 'note' | 'suggestion' | 'critical';
  resolved: boolean;
  author: string;
  createdAt: string;
  authorReply?: string;
}

export interface EditorialPassDef {
  id: string;
  name: string;
  stage: 'developmental' | 'line' | 'copy' | 'proof';
  description: string;
  focus: string;
  completed: boolean;
  totalChecks: number;
  completedChecks: number;
}

export interface ManuscriptStyleSheet {
  oxfordComma: boolean;
  dialogueQuoteStyle: 'double' | 'single';
  emDashSpacing: 'closed' | 'spaced';
  numbersSpelledUnder: number;
  customTerms: { term: string; note: string }[];
  flaggedEchoes: string[];
}

export interface ContinuityIssue {
  id: string;
  title: string;
  question: string;
  passageA: { sceneTitle: string; sceneId: string; excerpt: string };
  passageB: { sceneTitle: string; sceneId: string; excerpt: string };
  status: 'open' | 'intentional' | 'dismissed' | 'resolved';
  severity: 'high' | 'medium' | 'low';
}

export interface RevisionCheckItem {
  id: string;
  label: string;
  done: boolean;
  sceneId?: string;
}

export interface RevisionPass {
  id: string;
  name: string;
  description: string;
  checklist: RevisionCheckItem[];
}

export interface SnapshotSceneSummary {
  id: string;
  title: string;
  wordCount: number;
  proseContent: string;
}

export interface Snapshot {
  id: string;
  name: string;
  timestamp: string;
  scenesSummary: SnapshotSceneSummary[];
}

export interface CuttingRoomItem {
  id: string;
  text: string;
  originalSceneTitle: string;
  deletedAt: string;
  contextNote: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: 'question' | 'research' | 'idea' | 'feedback';
  sceneId?: string;
  resolved: boolean;
}

export interface AIAuditLog {
  id: string;
  timestamp: string;
  action: string;
  scopeSnippet: string;
  output: string;
  status: 'accepted' | 'discarded' | 'pending';
}

export type IdeaStatus = 'spark' | 'in-progress' | 'fleshed-out' | 'incorporated';
export type IdeaCategory = 'plot' | 'character' | 'world' | 'dialogue' | 'theme' | 'twist' | 'research';
export type IdeaPriority = 'high' | 'medium' | 'low';

export interface RoughIdea {
  id: string;
  title: string;
  description: string;
  category: IdeaCategory;
  status: IdeaStatus;
  priority: IdeaPriority;
  tags: string[];
  linkedBeatKey?: string;
  linkedEntityIds?: string[];
  linkedSceneId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FrameworkPointer {
  id: string;
  framework: WritingFramework | 'three-act' | 'heros-journey' | 'story-circle' | 'save-the-cat';
  beatKey: string;
  title: string;
  notes?: string;
  color?: string;
  linkedSceneId?: string;
  order?: number;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  type: ProjectType;
  author?: string;
  protagonist?: string;
  situation?: string;
  desiredSessionGoal?: string;
  genre?: string;
  targetWordCount?: number;
  status?: 'drafting' | 'revising' | 'in-progress' | 'completed' | 'archived';
  framework?: WritingFramework;
  lastActiveSceneId: string;
  createdAt?: string;
  updatedAt: string;
}

export interface ProjectBundle {
  project: Project;
  chapters?: Chapter[];
  scenes: Scene[];
  activeSceneId?: string;
  entities: Entity[];
  threads: Thread[];
  events: StoryEvent[];
  continuityIssues: ContinuityIssue[];
  revisionPasses: RevisionPass[];
  cuttingRoom: CuttingRoomItem[];
  notes: NoteItem[];
  snapshots: Snapshot[];
  aiAuditLogs: AIAuditLog[];
  roughIdeas?: RoughIdea[];
  frameworkPointers?: FrameworkPointer[];
  editorialStyleSheet?: ManuscriptStyleSheet;
  editorialPasses?: EditorialPassDef[];
}
