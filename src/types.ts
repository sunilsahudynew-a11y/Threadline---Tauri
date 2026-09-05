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

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  status: EntityStatus;
  description: string;
  canonicalFacts: string[];
  linkedSceneIds: string[];
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

export interface Scene {
  id: string;
  title: string;
  order: number;
  chapterId?: string;
  chapterNumber?: number;
  chapterTitle?: string;
  actOrPhase?: string;
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

export interface Project {
  id: string;
  title: string;
  type: ProjectType;
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
}
