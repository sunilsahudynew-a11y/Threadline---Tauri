import React, { useState, useEffect } from 'react';
import {
  Project,
  Scene,
  Thread,
  NoteItem,
  Entity,
  Chapter,
  StoryEvent,
  PersonaProjectType
} from '../../types';
import { DashboardScreen } from '../DashboardScreen';
import { StoryBibleScreen } from '../StoryBibleScreen';

interface PlanAndLoreHubProps {
  project: Project;
  projectType: PersonaProjectType;
  scenes: Scene[];
  chapters?: Chapter[];
  threads: Thread[];
  notes: NoteItem[];
  entities: Entity[];
  events: StoryEvent[];
  initialSubView?: 'corkboard' | 'wiki';
  onNavigateToScene: (sceneId: string) => void;
  onReorderScenes: (scenes: Scene[]) => void;
  onAddScene: () => void;
  onAddSceneToChapter?: (chapterId: string) => void;
  onAddChapter?: (title?: string, actOrPhase?: string) => string | void;
  onUpdateChapter?: (chapterId: string, fields: Partial<Chapter>) => void;
  onDeleteChapter?: (chapterId: string) => void;
  onUpdateChapters?: (chapters: Chapter[]) => void;
  onUpdateScene?: (sceneId: string, updatedFields: Partial<Scene>) => void;
  onUpdateNote: (note: NoteItem) => void;
  onAddNote: () => void;
  onUpdateEntity: (entity: Entity) => void;
  onCreateEntity: (entity: Entity) => void;
  onDeleteEntity: (id: string) => void;
  onUpdateThread: (thread: Thread) => void;
  onCreateThread: (thread: Thread) => void;
  onDeleteThread: (id: string) => void;
  onUpdateEvent: (event: StoryEvent) => void;
  onCreateEvent: (event: StoryEvent) => void;
  onDeleteEvent?: (id: string) => void;
}

export const PlanAndLoreHub: React.FC<PlanAndLoreHubProps> = ({
  project,
  projectType,
  scenes,
  chapters,
  threads,
  notes,
  entities,
  events,
  initialSubView = 'corkboard',
  onNavigateToScene,
  onReorderScenes,
  onAddScene,
  onAddSceneToChapter,
  onAddChapter,
  onUpdateChapter,
  onDeleteChapter,
  onUpdateChapters,
  onUpdateScene,
  onUpdateNote,
  onAddNote,
  onUpdateEntity,
  onCreateEntity,
  onDeleteEntity,
  onUpdateThread,
  onCreateThread,
  onDeleteThread,
  onUpdateEvent,
  onCreateEvent,
  onDeleteEvent
}) => {
  const [activeSubView, setActiveSubView] = useState<'corkboard' | 'wiki'>(initialSubView);

  useEffect(() => {
    if (initialSubView) {
      setActiveSubView(initialSubView);
    }
  }, [initialSubView]);

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden bg-[#FAF6EE] text-[#221E18]">
      {/* SUBVIEW CONTENT */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeSubView === 'corkboard' ? (
          <DashboardScreen
            project={project}
            scenes={scenes}
            chapters={chapters}
            threads={threads}
            notes={notes}
            entities={entities}
            onNavigateToScene={onNavigateToScene}
            onReorderScenes={onReorderScenes}
            onAddScene={onAddScene}
            onAddSceneToChapter={onAddSceneToChapter}
            onAddChapter={onAddChapter}
            onUpdateChapter={onUpdateChapter}
            onDeleteChapter={onDeleteChapter}
            onUpdateChapters={onUpdateChapters}
            onUpdateScene={onUpdateScene}
            onUpdateNote={onUpdateNote}
            onAddNote={onAddNote}
          />
        ) : (
          <StoryBibleScreen
            entities={entities}
            threads={threads}
            events={events}
            scenes={scenes}
            onUpdateEntity={onUpdateEntity}
            onCreateEntity={onCreateEntity}
            onDeleteEntity={onDeleteEntity}
            onUpdateThread={onUpdateThread}
            onCreateThread={onCreateThread}
            onDeleteThread={onDeleteThread}
            onUpdateEvent={onUpdateEvent}
            onCreateEvent={onCreateEvent}
            onDeleteEvent={onDeleteEvent}
            onNavigateToScene={onNavigateToScene}
          />
        )}
      </div>
    </div>
  );
};
