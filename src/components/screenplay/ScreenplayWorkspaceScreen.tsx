import React from 'react';
import { Scene, Chapter, Project } from '../../types';
import { ScreenplayStudio } from '../editor/ScreenplayStudio';
import { ScreenType } from '../Navigation';

export interface ScreenplayWorkspaceScreenProps {
  scene: Scene;
  allScenes: Scene[];
  chapters?: Chapter[];
  project: Project;
  projectTitle: string;
  authorName: string;
  onUpdateScene: (updatedFields: Partial<Scene>) => void;
  onNavigateToScene: (sceneId: string) => void;
  onAddScene: () => void;
  onDuplicateScene?: (sceneId: string) => void;
  onDeleteScene?: (sceneId: string) => void;
  onReorderScenes?: (reordered: Scene[]) => void;
  onOpenStoryBible?: () => void;
  onOpenResearchVault?: () => void;

  isSidebarOpen?: boolean;
  onToggleSidebarNav?: () => void;
  onOpenMobileDrawer?: () => void;
  onNavigate?: (screen: ScreenType) => void;
  onOpenSearch?: () => void;
  userRole?: 'author' | 'editor';
  onToggleRole?: () => void;
  lastSavedText?: string;
}

export const ScreenplayWorkspaceScreen: React.FC<ScreenplayWorkspaceScreenProps> = ({
  scene,
  allScenes,
  project,
  projectTitle,
  authorName,
  onUpdateScene,
  onNavigateToScene,
  isSidebarOpen,
  onToggleSidebarNav,
  onOpenMobileDrawer,
  onNavigate,
  onOpenSearch,
  userRole,
  onToggleRole,
  lastSavedText
}) => {
  return (
    <div id="screenplay-workspace-root" className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[#FAF6EE]">
      <ScreenplayStudio
        scene={scene}
        allScenes={allScenes}
        onUpdateScene={onUpdateScene}
        projectTitle={projectTitle || project.title || 'Untitled Screenplay'}
        authorName={authorName || project.author || 'Screenwriter'}
        onNavigateToScene={onNavigateToScene}
        studioTheme="light"
        isSidebarOpen={isSidebarOpen}
        onToggleSidebarNav={onToggleSidebarNav}
        onOpenMobileDrawer={onOpenMobileDrawer}
        onNavigate={onNavigate}
        onOpenSearch={onOpenSearch}
        userRole={userRole}
        onToggleRole={onToggleRole}
        lastSavedText={lastSavedText}
      />
    </div>
  );
};

