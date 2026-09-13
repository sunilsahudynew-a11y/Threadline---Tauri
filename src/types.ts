export type ProjectType = 'Novel' | 'Screenplay' | 'Novella' | 'Short Story' | 'Screenplay Experiment' | 'Worldbuilding Bible';
export type PersonaProjectType = 'novel' | 'screenplay';
export type UserRole = 'author' | 'editor';
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
  targetWordCount?: number;
  notes: string;
  comments: SceneComment[];
  versions?: SceneVersion[];
  editorialProseContent?: string;
  editorialBaseline?: string;
  editorialQueries?: EditorialQuery[];
  editorialStatus?: 'unedited' | 'in-review' | 'line-edited' | 'copyedited' | 'clean-approved';
  // Binder & metadata features
  labelColor?: string; // Hex color code or label identifier
  labelName?: string;  // Label title (e.g. "POV: Silas Vance", "Main Plotline")
  statusTint?: string; // e.g. "Draft", "First Polish", "Final Lock"
  bookmarks?: DocumentBookmark[]; // Pinned scene references and bookmarks
  editorMode?: 'prose' | 'screenplay';
  // Screenplay script features
  sceneNumber?: string;
  isLocked?: boolean;
  revisionColor?: ScreenplayRevisionColor;
  revisionAsterisks?: number[]; // Line indices with revision marks
  productionTags?: ProductionTag[];
}

export type ScreenplayRevisionColor =
  | 'white'
  | 'blue'
  | 'pink'
  | 'yellow'
  | 'green'
  | 'goldenrod'
  | 'buff'
  | 'salmon'
  | 'cherry';

export type ProductionTagCategory =
  | 'cast'
  | 'prop'
  | 'wardrobe'
  | 'vehicle'
  | 'sfx'
  | 'stunt'
  | 'sound'
  | 'extras';

export interface ProductionTag {
  id: string;
  category: ProductionTagCategory;
  name: string;
  notes?: string;
  color?: string;
  sceneId?: string;
}

export interface ScreenplaySettings {
  isLocked?: boolean;
  activeRevisionColor?: ScreenplayRevisionColor;
  showSceneNumbers?: boolean;
  sceneNumberLocation?: 'both' | 'left' | 'right';
  watermarkText?: string;
  moreContdEnabled?: boolean;
  scriptHeader?: string;
}

export type ScriveningsMode = 'single' | 'chapter' | 'all' | 'manuscript';

export type ScreenplayElementType =
  | 'scene_heading'
  | 'scene-heading'
  | 'action'
  | 'character'
  | 'parenthetical'
  | 'dialogue'
  | 'dual_dialogue'
  | 'transition'
  | 'shot';

export interface DocumentBookmark {
  id: string;
  type: 'scene' | 'entity' | 'research' | 'external';
  targetId: string;
  title: string;
  note?: string;
  pinnedAt: string;
}

export interface LabelDefinition {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface ResearchVaultItem {
  id: string;
  title: string;
  type: 'image' | 'audio' | 'pdf' | 'web-link' | 'text-note';
  url?: string;
  description?: string;
  tags: string[];
  notes?: string;
  transcriptions?: { time: number; note: string; author?: string }[];
  linkedSceneIds?: string[];
  linkedEntityIds?: string[];
  createdAt: string;
  fileSize?: string;
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

export type ContinuityIssueCategory =
  | 'canon'
  | 'timeline'
  | 'pov'
  | 'pacing'
  | 'formatting'
  | 'passive-voice'
  | 'filter-words'
  | 'logic';

export interface ContinuityIssue {
  id: string;
  title: string;
  question: string;
  passageA: { sceneTitle: string; sceneId: string; excerpt: string };
  passageB: { sceneTitle: string; sceneId: string; excerpt: string };
  status: 'open' | 'intentional' | 'dismissed' | 'resolved';
  severity: 'high' | 'medium' | 'low';
  category?: ContinuityIssueCategory;
  suggestion?: string;
}

export interface RevisionCheckItem {
  id: string;
  label: string;
  done: boolean;
  sceneId?: string;
}

export type SidebarTodoCategory = 'writing' | 'revision' | 'character' | 'worldbuilding' | 'general';

export interface SidebarTodoItem {
  id: string;
  projectId?: string;
  text: string;
  completed: boolean;
  category?: SidebarTodoCategory;
  priority?: 'normal' | 'high';
  sceneId?: string;
  createdAt: number;
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

export type LineEditColorCode = 'pacing' | 'voice' | 'tighten' | 'continuity' | 'theme' | 'query';

export interface LineEditItem {
  id: string;
  code: LineEditColorCode;
  text: string;
  note?: string;
  sceneId?: string;
  sceneTitle?: string;
}

export type BookCoverTheme =
  | 'antique-linen'
  | 'leather-gilt'
  | 'victorian-botanical'
  | 'noir-minimal'
  | 'crimson-velvet'
  | 'celestial-ink'
  | 'forest-moss'
  | 'parchment-gold'
  | 'custom-art';

export type BookCoverLayout =
  | 'classical-frame'
  | 'full-bleed'
  | 'minimalist-centered'
  | 'split-band'
  | 'ornamental-crest';

export interface BookCoverConfig {
  imageUrl?: string;
  titleOverride?: string;
  subtitle?: string;
  authorOverride?: string;
  imprint?: string;
  theme: BookCoverTheme;
  layout: BookCoverLayout;
  accentColor?: string;
  textColor?: string;
  overlayOpacity?: number;
}

export interface Project {
  id: string;
  title: string;
  type: ProjectType;
  projectType?: PersonaProjectType;
  role?: UserRole;
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
  // Book Cover configuration
  coverImage?: string;
  coverTitle?: string;
  coverSubtitle?: string;
  coverAuthor?: string;
  coverImprint?: string;
  coverTheme?: BookCoverTheme;
  coverLayout?: BookCoverLayout;
  coverAccentColor?: string;
  coverOverlayOpacity?: number;
  // Screenplay settings
  screenplaySettings?: ScreenplaySettings;
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
  researchVault?: ResearchVaultItem[];
  projectLabels?: LabelDefinition[];
}
