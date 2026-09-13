import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Project,
  ProjectBundle,
  Scene,
  Entity,
  Thread,
  StoryEvent,
  ContinuityIssue,
  RevisionPass,
  Snapshot,
  CuttingRoomItem,
  NoteItem,
  AIAuditLog,
  Chapter,
  RoughIdea,
  FrameworkPointer,
  ResearchVaultItem
} from './types';
import {
  INITIAL_PROJECT,
  INITIAL_CHAPTERS,
  INITIAL_SCENES,
  INITIAL_ENTITIES,
  INITIAL_THREADS,
  INITIAL_EVENTS,
  INITIAL_CONTINUITY_ISSUES,
  INITIAL_REVISION_PASSES,
  INITIAL_CUTTING_ROOM,
  INITIAL_NOTES,
  INITIAL_SNAPSHOTS,
  INITIAL_PROJECTS,
  SECOND_PROJECT_BUNDLE,
  NOVELLA_PROJECT_BUNDLE,
  INITIAL_RESEARCH_VAULT
} from './data/initialData';
import {
  INITIAL_ROUGH_IDEAS,
  INITIAL_FRAMEWORK_POINTERS
} from './data/ideationFrameworks';
import { Navigation, ScreenType, NotionSidebar, NotionTopBar } from './components/Navigation';
import { AppTourModal } from './components/AppTourModal';
import { hasCompletedTour } from './utils/cookieUtils';
import { motion, AnimatePresence } from 'motion/react';
import {
  ThemeConfig,
  ThemeFamily,
  ThemeMode,
  AVAILABLE_THEMES,
  getSavedTheme,
  applyThemeToDOM,
  ColorBlindMode,
  AVAILABLE_COLORBLIND_MODES,
  EditorLineSpacing,
  EditorWordSpacing,
  EditorTextAlign,
  EditorPageWidth,
  ManuscriptTypographySettings,
  getSavedTypographySettings,
  applyTypographySettingsToDOM
} from './services/theme/themeConfig';
import {
  FileText,
  Layers,
  Compass,
  Sparkles,
  MoreHorizontal,
  FolderKanban,
  BookOpen,
  Sliders,
  Download,
  Settings,
  HardDrive,
  Moon,
  Sun,
  X,
  Lightbulb,
  Film,
  Feather,
  ArrowRight
} from 'lucide-react';
import { HomeScreen } from './components/HomeScreen';
import { EditorScreen } from './components/EditorScreen';
import { ScreenplayWorkspaceScreen } from './components/screenplay/ScreenplayWorkspaceScreen';
import { EditorialDeskScreen } from './components/editorial/EditorialDeskScreen';
import { PlanAndLoreHub } from './components/planlore/PlanAndLoreHub';
import { EditorReviewScreen } from './components/editorial/EditorReviewScreen';
import { VersionHistoryScreen } from './components/editorial/VersionHistoryScreen';
import { InsightsView } from './components/diagnostics/InsightsView';
import { StoryBibleScreen } from './components/StoryBibleScreen';
import { IdeationScreen } from './components/ideation/IdeationScreen';
import { QuickIdeationModal } from './components/ideation/QuickIdeationModal';
import { DashboardScreen } from './components/DashboardScreen';
import { ContinuityInboxScreen } from './components/ContinuityInboxScreen';
import { RevisionsScreen } from './components/RevisionsScreen';
import { ExportScreen } from './components/ExportScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { NewProjectWizard } from './components/NewProjectWizard';
import { ProjectsRootScreen } from './components/ProjectsRootScreen';
import { LandingPage } from './components/LandingPage';
import { ResearchVaultScreen } from './components/vault/ResearchVaultScreen';
import { ToastProvider, useToast } from './components/Toast';
import { CommandPalette } from './components/CommandPalette';
import { VaultManagerModal } from './components/VaultManagerModal';
import { VaultInfo } from './services/storage/vaultTypes';
import { getVaultInfo, writeBundleToVault } from './services/storage/vaultStorage';
import { ensureChapters } from './utils/chapterUtils';
import { safeSetItem, safeGetItem, safeJsonParse } from './utils/storageUtils';

// Helper to retrieve a project bundle from local storage or defaults
function loadProjectBundle(projId: string): ProjectBundle {
  const saved = safeGetItem(`threadline_project_data_${projId}`);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.project) {
        return {
          ...parsed,
          entities: Array.isArray(parsed.entities) && parsed.entities.length > 0 ? parsed.entities : INITIAL_ENTITIES,
          threads: Array.isArray(parsed.threads) && parsed.threads.length > 0 ? parsed.threads : INITIAL_THREADS,
          events: Array.isArray(parsed.events) ? parsed.events : INITIAL_EVENTS,
          chapters: ensureChapters(parsed.scenes || [], parsed.chapters),
          roughIdeas: Array.isArray(parsed.roughIdeas) ? parsed.roughIdeas : INITIAL_ROUGH_IDEAS,
          frameworkPointers: Array.isArray(parsed.frameworkPointers) ? parsed.frameworkPointers : INITIAL_FRAMEWORK_POINTERS
        };
      }
    } catch (e) {
      console.error('Error parsing stored project bundle for ' + projId, e);
    }
  }

  // Check if it's the novella sample project
  if (projId === NOVELLA_PROJECT_BUNDLE.project.id) {
    return {
      ...NOVELLA_PROJECT_BUNDLE,
      chapters: ensureChapters(NOVELLA_PROJECT_BUNDLE.scenes, NOVELLA_PROJECT_BUNDLE.chapters),
      roughIdeas: NOVELLA_PROJECT_BUNDLE.roughIdeas || INITIAL_ROUGH_IDEAS,
      frameworkPointers: NOVELLA_PROJECT_BUNDLE.frameworkPointers || INITIAL_FRAMEWORK_POINTERS
    };
  }

  // Check if it's the second sample project
  if (projId === SECOND_PROJECT_BUNDLE.project.id) {
    return {
      ...SECOND_PROJECT_BUNDLE,
      chapters: ensureChapters(SECOND_PROJECT_BUNDLE.scenes, SECOND_PROJECT_BUNDLE.chapters),
      roughIdeas: SECOND_PROJECT_BUNDLE.roughIdeas || INITIAL_ROUGH_IDEAS,
      frameworkPointers: SECOND_PROJECT_BUNDLE.frameworkPointers || INITIAL_FRAMEWORK_POINTERS
    };
  }

  // Default to Initial Project bundle with legacy fallback wrapped safely
  try {
    const legacyProj = safeGetItem('threadline_project');
    const legacyScenes = safeGetItem('threadline_scenes');
    const legacyChapters = safeGetItem('threadline_chapters');

    const resolvedScenes: Scene[] = safeJsonParse(legacyScenes, INITIAL_SCENES);
    const resolvedChapters: Chapter[] = safeJsonParse(legacyChapters, INITIAL_CHAPTERS);

    return {
      project: safeJsonParse(legacyProj, INITIAL_PROJECT),
      chapters: ensureChapters(resolvedScenes, resolvedChapters),
      scenes: resolvedScenes,
      entities: safeJsonParse(safeGetItem('threadline_entities'), INITIAL_ENTITIES),
      threads: safeJsonParse(safeGetItem('threadline_threads'), INITIAL_THREADS),
      events: safeJsonParse(safeGetItem('threadline_events'), INITIAL_EVENTS),
      continuityIssues: safeJsonParse(safeGetItem('threadline_continuity'), INITIAL_CONTINUITY_ISSUES),
      revisionPasses: safeJsonParse(safeGetItem('threadline_revision_passes'), INITIAL_REVISION_PASSES),
      cuttingRoom: safeJsonParse(safeGetItem('threadline_cutting_room'), INITIAL_CUTTING_ROOM),
      notes: safeJsonParse(safeGetItem('threadline_notes'), INITIAL_NOTES),
      snapshots: safeJsonParse(safeGetItem('threadline_snapshots'), INITIAL_SNAPSHOTS),
      aiAuditLogs: safeJsonParse(safeGetItem('threadline_ai_logs'), []),
      roughIdeas: safeJsonParse(safeGetItem('threadline_rough_ideas'), INITIAL_ROUGH_IDEAS),
      frameworkPointers: safeJsonParse(safeGetItem('threadline_framework_pointers'), INITIAL_FRAMEWORK_POINTERS),
      activeSceneId: safeGetItem('threadline_active_scene_id') || 'scene-3'
    };
  } catch (err) {
    console.error('Failed to load legacy project bundle, using defaults:', err);
    return {
      project: INITIAL_PROJECT,
      chapters: INITIAL_CHAPTERS,
      scenes: INITIAL_SCENES,
      entities: INITIAL_ENTITIES,
      threads: INITIAL_THREADS,
      events: INITIAL_EVENTS,
      continuityIssues: INITIAL_CONTINUITY_ISSUES,
      revisionPasses: INITIAL_REVISION_PASSES,
      cuttingRoom: INITIAL_CUTTING_ROOM,
      notes: INITIAL_NOTES,
      snapshots: INITIAL_SNAPSHOTS,
      aiAuditLogs: [],
      roughIdeas: INITIAL_ROUGH_IDEAS,
      frameworkPointers: INITIAL_FRAMEWORK_POINTERS,
      activeSceneId: INITIAL_SCENES[0]?.id || 'scene-1'
    };
  }
}

export default function App() {
  return (
    <ToastProvider>
      <ThreadlineApp />
    </ToastProvider>
  );
}

function ThreadlineApp() {
  const { showToast } = useToast();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isQuickIdeationOpen, setIsQuickIdeationOpen] = useState(false);

  // Navigation State (supports /landing URL route or in-app navigation)
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (
        path === '/landing' ||
        path.startsWith('/landing/') ||
        hash === '#landing' ||
        search.includes('page=landing')
      ) {
        return 'landing';
      }
    }
    return 'home';
  });

  // Notion-style Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('threadline_sidebar_open');
      if (saved !== null) {
        return saved === 'true';
      }
      return window.innerWidth >= 1024;
    }
    return true;
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showMobileMoreSheet, setShowMobileMoreSheet] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(() => !hasCompletedTour());

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const next = !prev;
      safeSetItem('threadline_sidebar_open', String(next));
      return next;
    });
  };

  // Keyboard shortcut: Cmd+K / Ctrl+K for search, Cmd+\ or Ctrl+\ to toggle Notion sidebar, Cmd+I / Ctrl+I for quick ideation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isK = e.key === 'k' || e.key === 'K' || e.key?.toLowerCase() === 'k' || e.code === 'KeyK';
      if ((e.metaKey || e.ctrlKey) && isK) {
        e.preventDefault();
        e.stopPropagation();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }
      const isI = e.key === 'i' || e.key === 'I' || e.key?.toLowerCase() === 'i' || e.code === 'KeyI';
      if ((e.metaKey || e.ctrlKey) && isI) {
        e.preventDefault();
        e.stopPropagation();
        setIsQuickIdeationOpen((prev) => !prev);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === '\\' || e.code === 'Backslash')) {
        e.preventDefault();
        e.stopPropagation();
        handleToggleSidebar();
        return;
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  // Full Theme System State (Threadline, Notion, Obsidian, Ubuntu x Light/Dark)
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(() => getSavedTheme());

  // Apply theme to DOM on mount and on changes
  useEffect(() => {
    applyThemeToDOM(themeConfig);
  }, [themeConfig]);

  // Derived legacy theme mode for backward compatibility with child components
  const theme = themeConfig.mode === 'dark' ? 'lamplight' : 'paper';

  const handleToggleTheme = () => {
    const nextMode: ThemeMode = themeConfig.mode === 'light' ? 'dark' : 'light';
    const nextConfig: ThemeConfig = { ...themeConfig, mode: nextMode };
    setThemeConfig(nextConfig);
    applyThemeToDOM(nextConfig);
    showToast(nextMode === 'dark' ? 'Switched to Dark Mode' : 'Switched to Light Mode');
  };

  const handleSelectThemeFamily = (family: ThemeFamily) => {
    const nextConfig: ThemeConfig = { ...themeConfig, family };
    setThemeConfig(nextConfig);
    applyThemeToDOM(nextConfig);
    const themeName = AVAILABLE_THEMES.find((t) => t.id === family)?.name || family;
    showToast(`Applied ${themeName} Theme`);
  };

  const handleSelectThemeMode = (mode: ThemeMode) => {
    const nextConfig: ThemeConfig = { ...themeConfig, mode };
    setThemeConfig(nextConfig);
    applyThemeToDOM(nextConfig);
    showToast(mode === 'dark' ? 'Switched to Dark Mode' : 'Switched to Light Mode');
  };

  const handleSelectColorBlindMode = (colorBlindMode: ColorBlindMode) => {
    const nextConfig: ThemeConfig = { ...themeConfig, colorBlindMode };
    setThemeConfig(nextConfig);
    applyThemeToDOM(nextConfig);
    const modeName = AVAILABLE_COLORBLIND_MODES.find((m) => m.id === colorBlindMode)?.name || colorBlindMode;
    showToast(`Color Vision Mode: ${modeName}`);
  };

  const handleToggleColorBlind = () => {
    const cycle: ColorBlindMode[] = ['none', 'deuteranopia', 'protanopia', 'tritanopia', 'high-contrast'];
    const currentIdx = cycle.indexOf(themeConfig.colorBlindMode || 'none');
    const nextIdx = (currentIdx + 1) % cycle.length;
    const nextMode = cycle[nextIdx];
    handleSelectColorBlindMode(nextMode);
  };

  // Manuscript Typography Settings State (Line Spacing, Word Spacing, Alignment)
  const [typographySettings, setTypographySettings] = useState<ManuscriptTypographySettings>(() => getSavedTypographySettings());

  useEffect(() => {
    applyTypographySettingsToDOM(typographySettings);
  }, [typographySettings]);

  const handleSelectLineSpacing = (lineSpacing: EditorLineSpacing) => {
    const next: ManuscriptTypographySettings = { ...typographySettings, lineSpacing };
    setTypographySettings(next);
    applyTypographySettingsToDOM(next);
    showToast(`Manuscript Line Spacing: ${lineSpacing}`);
  };

  const handleSelectWordSpacing = (wordSpacing: EditorWordSpacing) => {
    const next: ManuscriptTypographySettings = { ...typographySettings, wordSpacing };
    setTypographySettings(next);
    applyTypographySettingsToDOM(next);
    showToast(`Manuscript Word Spacing: ${wordSpacing}`);
  };

  const handleSelectTextAlign = (textAlign: EditorTextAlign) => {
    const next: ManuscriptTypographySettings = { ...typographySettings, textAlign };
    setTypographySettings(next);
    applyTypographySettingsToDOM(next);
    showToast(`Manuscript Alignment: ${textAlign === 'justify' ? 'Justified' : 'Left'}`);
  };

  const handleSelectPageWidth = (pageWidth: EditorPageWidth) => {
    const next: ManuscriptTypographySettings = { ...typographySettings, pageWidth };
    setTypographySettings(next);
    applyTypographySettingsToDOM(next);
    showToast(`Manuscript Width: ${pageWidth.charAt(0).toUpperCase() + pageWidth.slice(1)}`);
  };

  // Persona & Role State (Author vs Editor)
  const [userRole, setUserRole] = useState<'author' | 'editor'>('author');

  // Role Switch Confirmation Modal state for "Continue Writing" flow
  const [showRoleSwitchModal, setShowRoleSwitchModal] = useState(false);
  const [pendingSceneId, setPendingSceneId] = useState<string | null>(null);

  const handleContinueWritingFlow = (targetSceneId?: string) => {
    if (userRole === 'editor') {
      // In Editor mode: open confirmation dialogue mentioning the switch to Author mode
      setPendingSceneId(targetSceneId || null);
      setShowRoleSwitchModal(true);
    } else {
      // In Author mode: directly navigate to editor
      if (targetSceneId) {
        setActiveSceneId(targetSceneId);
      }
      setCurrentScreen(project.type === 'Screenplay' ? 'screenplay' : 'editor');
    }
  };

  const handleConfirmRoleSwitchToAuthor = () => {
    setUserRole('author');
    if (pendingSceneId) {
      setActiveSceneId(pendingSceneId);
    }
    setCurrentScreen(project.type === 'Screenplay' ? 'screenplay' : 'editor');
    setShowRoleSwitchModal(false);
    setPendingSceneId(null);
    showToast('Switched to Author Mode — Manuscript drafting active');
  };

  const handleContinueInEditorReview = () => {
    if (pendingSceneId) {
      setActiveSceneId(pendingSceneId);
    }
    setCurrentScreen('editor-review');
    setShowRoleSwitchModal(false);
    setPendingSceneId(null);
    showToast('Opened scene in Editor Review Mode');
  };

  const handleCancelRoleSwitch = () => {
    setShowRoleSwitchModal(false);
    setPendingSceneId(null);
  };

  const handleToggleRole = () => {
    setUserRole((prev) => {
      const next = prev === 'author' ? 'editor' : 'author';
      if (next === 'editor') {
        setCurrentScreen('editor-review');
      } else {
        setCurrentScreen(project.type === 'Screenplay' ? 'screenplay' : 'editor');
      }
      showToast(`Switched to ${next === 'editor' ? 'Editor Desk' : 'Author Mode'}`);
      return next;
    });
  };

  // Synchronize browser history / URL with /landing and reset scroll to top smoothly
  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    if (currentScreen === 'landing') {
      if (window.location.pathname !== '/landing') {
        window.history.pushState({ screen: 'landing' }, '', '/landing');
      }
    } else {
      if (window.location.pathname === '/landing') {
        window.history.pushState({ screen: currentScreen }, '', '/');
      }
    }
  }, [currentScreen]);

  // Listen to popstate (back / forward navigation)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (
        path === '/landing' ||
        path.startsWith('/landing/') ||
        hash === '#landing' ||
        search.includes('page=landing')
      ) {
        setCurrentScreen('landing');
      } else {
        setCurrentScreen((prev) => (prev === 'landing' ? 'home' : prev));
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Multi-Project Catalog
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('threadline_projects_list_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    // Check if legacy single project was saved
    const legacy = localStorage.getItem('threadline_project');
    if (legacy) {
      try {
        const parsedLegacy = JSON.parse(legacy);
        return [parsedLegacy];
      } catch (e) {}
    }
    return INITIAL_PROJECTS;
  });

  // Active Project ID
  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    const saved = localStorage.getItem('threadline_active_project_id');
    if (saved) return saved;
    return INITIAL_PROJECT.id;
  });

  // Initial Bundle for active project
  const initialBundle = useMemo(() => {
    return loadProjectBundle(activeProjectId);
  }, []);

  // Active Project Data States
  const [project, setProject] = useState<Project>(initialBundle.project);
  const [chapters, setChapters] = useState<Chapter[]>(() =>
    ensureChapters(initialBundle.scenes, initialBundle.chapters)
  );
  const [scenes, setScenes] = useState<Scene[]>(initialBundle.scenes);
  const [activeSceneId, setActiveSceneId] = useState<string>(
    initialBundle.activeSceneId || project.lastActiveSceneId || scenes[0]?.id || 'scene-1'
  );
  const [entities, setEntities] = useState<Entity[]>(initialBundle.entities);
  const [threads, setThreads] = useState<Thread[]>(initialBundle.threads);
  const [events, setEvents] = useState<StoryEvent[]>(initialBundle.events);
  const [continuityIssues, setContinuityIssues] = useState<ContinuityIssue[]>(initialBundle.continuityIssues);
  const [revisionPasses, setRevisionPasses] = useState<RevisionPass[]>(initialBundle.revisionPasses);
  const [cuttingRoom, setCuttingRoom] = useState<CuttingRoomItem[]>(initialBundle.cuttingRoom);
  const [notes, setNotes] = useState<NoteItem[]>(initialBundle.notes);
  const [snapshots, setSnapshots] = useState<Snapshot[]>(initialBundle.snapshots);
  const [aiAuditLogs, setAiAuditLogs] = useState<AIAuditLog[]>(initialBundle.aiAuditLogs);
  const [roughIdeas, setRoughIdeas] = useState<RoughIdea[]>(() => {
    return Array.isArray(initialBundle.roughIdeas) && initialBundle.roughIdeas.length > 0
      ? initialBundle.roughIdeas
      : INITIAL_ROUGH_IDEAS;
  });
  const [frameworkPointers, setFrameworkPointers] = useState<FrameworkPointer[]>(() => {
    return Array.isArray(initialBundle.frameworkPointers) && initialBundle.frameworkPointers.length > 0
      ? initialBundle.frameworkPointers
      : INITIAL_FRAMEWORK_POINTERS;
  });

  // Multi-Media Research Vault State
  const [researchVault, setResearchVault] = useState<ResearchVaultItem[]>(() => {
    const saved = safeGetItem(`threadline_research_vault_${activeProjectId}`);
    return safeJsonParse(saved, INITIAL_RESEARCH_VAULT);
  });

  useEffect(() => {
    if (activeProjectId) {
      safeSetItem(`threadline_research_vault_${activeProjectId}`, JSON.stringify(researchVault));
    }
  }, [activeProjectId, researchVault]);

  // Strict format locking enforcement: Novel projects only show Novel format (cannot switch to screenplay),
  // Screenplay projects only show Screenplay format (cannot switch to novel)
  useEffect(() => {
    const isScreenplay = project.type === 'Screenplay' || project.type === 'Screenplay Experiment';
    if (userRole === 'author') {
      if (currentScreen === 'screenplay' && !isScreenplay) {
        setCurrentScreen('editor');
      } else if (currentScreen === 'editor' && isScreenplay) {
        setCurrentScreen('screenplay');
      }
    }
  }, [project.type, currentScreen, userRole]);

  const [lastSavedText, setLastSavedText] = useState('Saved locally');
  const saveTimerRef = useRef<any>(null);

  // Dedicated Folder Vault Storage State (Obsidian-Style)
  const [vaultInfo, setVaultInfo] = useState<VaultInfo | null>(null);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);

  // Load vault connection status when switching project
  useEffect(() => {
    if (!activeProjectId) return;
    getVaultInfo(activeProjectId).then((info) => {
      setVaultInfo(info);
      if (info && info.mode !== 'browser-cached') {
        setLastSavedText(`Vault: ${info.folderName}`);
      }
    });
  }, [activeProjectId]);

  // Debounced auto-sync to local folder vault (if connected)
  useEffect(() => {
    if (!activeProjectId || !vaultInfo || vaultInfo.mode === 'browser-cached') return;

    const timer = setTimeout(async () => {
      try {
        const currentActiveBundle: ProjectBundle = {
          project,
          chapters,
          scenes,
          entities,
          threads,
          events,
          continuityIssues,
          revisionPasses,
          cuttingRoom,
          notes,
          snapshots,
          aiAuditLogs,
          roughIdeas,
          frameworkPointers,
          activeSceneId
        };
        const res = await writeBundleToVault(currentActiveBundle);
        if (res.success) {
          setLastSavedText(`Vault synced (${res.timestamp})`);
        }
      } catch (err) {
        console.warn('Auto-sync to vault skipped:', err);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [
    activeProjectId,
    vaultInfo,
    project,
    chapters,
    scenes,
    activeSceneId,
    entities,
    threads,
    events,
    continuityIssues,
    revisionPasses,
    cuttingRoom,
    notes,
    snapshots,
    aiAuditLogs,
    roughIdeas,
    frameworkPointers
  ]);

  // Persist Projects List and Active ID
  useEffect(() => {
    safeSetItem('threadline_projects_list_v2', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    safeSetItem('threadline_active_project_id', activeProjectId);
  }, [activeProjectId]);

  // Persist active project bundle
  useEffect(() => {
    if (!activeProjectId) return;
    const bundle: ProjectBundle = {
      project,
      chapters,
      scenes,
      entities,
      threads,
      events,
      continuityIssues,
      revisionPasses,
      cuttingRoom,
      notes,
      snapshots,
      aiAuditLogs,
      roughIdeas,
      frameworkPointers,
      activeSceneId
    };
    safeSetItem(`threadline_project_data_${activeProjectId}`, JSON.stringify(bundle));

    // Also sync legacy keys safely
    safeSetItem('threadline_project', JSON.stringify(project));
    safeSetItem('threadline_chapters', JSON.stringify(chapters));
    safeSetItem('threadline_scenes', JSON.stringify(scenes));
    safeSetItem('threadline_active_scene_id', activeSceneId);
    safeSetItem('threadline_entities', JSON.stringify(entities));
    safeSetItem('threadline_threads', JSON.stringify(threads));
    safeSetItem('threadline_events', JSON.stringify(events));
    safeSetItem('threadline_continuity', JSON.stringify(continuityIssues));
    safeSetItem('threadline_revision_passes', JSON.stringify(revisionPasses));
    safeSetItem('threadline_cutting_room', JSON.stringify(cuttingRoom));
    safeSetItem('threadline_notes', JSON.stringify(notes));
    safeSetItem('threadline_snapshots', JSON.stringify(snapshots));
    safeSetItem('threadline_ai_logs', JSON.stringify(aiAuditLogs));
    safeSetItem('threadline_rough_ideas', JSON.stringify(roughIdeas));
    safeSetItem('threadline_framework_pointers', JSON.stringify(frameworkPointers));

    // Keep metadata in projects list synced
    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProjectId
          ? {
              ...p,
              title: project.title,
              type: project.type,
              protagonist: project.protagonist,
              genre: project.genre,
              situation: project.situation,
              targetWordCount: project.targetWordCount,
              status: project.status,
              lastActiveSceneId: activeSceneId,
              updatedAt: project.updatedAt
            }
          : p
      )
    );
  }, [
    activeProjectId,
    project,
    chapters,
    scenes,
    activeSceneId,
    entities,
    threads,
    events,
    continuityIssues,
    revisionPasses,
    cuttingRoom,
    notes,
    snapshots,
    aiAuditLogs,
    roughIdeas,
    frameworkPointers
  ]);

  // Compute Word & Scene counts for all projects
  const projectStatsMap = useMemo(() => {
    const map: Record<string, { wordCount: number; sceneCount: number; lastSceneTitle?: string }> = {};

    projects.forEach((p) => {
      if (p.id === activeProjectId) {
        const words = scenes.reduce((acc, s) => acc + (s.wordCount || 0), 0);
        map[p.id] = {
          wordCount: words,
          sceneCount: scenes.length,
          lastSceneTitle: scenes.find((s) => s.id === activeSceneId)?.title || scenes[0]?.title
        };
      } else {
        const bundle = loadProjectBundle(p.id);
        if (bundle && Array.isArray(bundle.scenes)) {
          const words = bundle.scenes.reduce((acc, s) => acc + (s.wordCount || 0), 0);
          map[p.id] = {
            wordCount: words,
            sceneCount: bundle.scenes.length,
            lastSceneTitle: bundle.scenes[0]?.title
          };
        } else {
          map[p.id] = { wordCount: 0, sceneCount: 0 };
        }
      }
    });

    return map;
  }, [projects, activeProjectId, scenes, activeSceneId]);

  // Handler: Switch between projects
  const handleSwitchProject = (targetProjectId: string, targetScreen: ScreenType = 'home') => {
    const resolveFormatScreen = (projType: Project['type'] | undefined, screen: ScreenType): ScreenType => {
      const isScreenplay = projType === 'Screenplay' || projType === 'Screenplay Experiment';
      if (screen === 'editor' && isScreenplay) return 'screenplay';
      if (screen === 'screenplay' && !isScreenplay) return 'editor';
      return screen;
    };

    if (targetProjectId === activeProjectId) {
      setCurrentScreen(resolveFormatScreen(project.type, targetScreen));
      return;
    }

    // Explicitly snapshot current active project state before switching
    const currentBundle: ProjectBundle = {
      project,
      chapters,
      scenes,
      entities,
      threads,
      events,
      continuityIssues,
      revisionPasses,
      cuttingRoom,
      notes,
      snapshots,
      aiAuditLogs,
      roughIdeas,
      frameworkPointers,
      activeSceneId
    };
    safeSetItem(`threadline_project_data_${activeProjectId}`, JSON.stringify(currentBundle));

    // Load bundle for new project
    const newBundle = loadProjectBundle(targetProjectId);

    setActiveProjectId(targetProjectId);
    setProject(newBundle.project);
    setChapters(ensureChapters(newBundle.scenes, newBundle.chapters));
    setScenes(
      newBundle.scenes.length > 0
        ? newBundle.scenes
        : [
            {
              id: 'scene-1',
              title: '1. Opening Scene',
              order: 1,
              proseContent: '',
              premise: 'Opening scene.',
              characters: [],
              location: '',
              time: '',
              pov: 'Third Limited',
              notes: '',
              status: 'draft',
              wordCount: 0,
              comments: [],
              editorMode: (newBundle.project.type === 'Screenplay' || newBundle.project.type === 'Screenplay Experiment') ? 'screenplay' : 'prose'
            }
          ]
    );
    setActiveSceneId(
      newBundle.activeSceneId || newBundle.project.lastActiveSceneId || newBundle.scenes[0]?.id || 'scene-1'
    );
    setEntities(newBundle.entities || []);
    setThreads(newBundle.threads || []);
    setEvents(newBundle.events || []);
    setContinuityIssues(newBundle.continuityIssues || []);
    setRevisionPasses(newBundle.revisionPasses || []);
    setCuttingRoom(newBundle.cuttingRoom || []);
    setNotes(newBundle.notes || []);
    setSnapshots(newBundle.snapshots || []);
    setAiAuditLogs(newBundle.aiAuditLogs || []);
    setRoughIdeas(newBundle.roughIdeas || INITIAL_ROUGH_IDEAS);
    setFrameworkPointers(newBundle.frameworkPointers || INITIAL_FRAMEWORK_POINTERS);

    const targetVault = safeGetItem(`threadline_research_vault_${targetProjectId}`);
    setResearchVault(safeJsonParse(targetVault, INITIAL_RESEARCH_VAULT));

    setCurrentScreen(resolveFormatScreen(newBundle.project.type, targetScreen));
  };

  // Handler: Edit Project Metadata
  const handleEditProject = (updated: Project) => {
    setProjects((prev) => {
      const exists = prev.some((p) => p.id === updated.id);
      if (exists) {
        return prev.map((p) => (p.id === updated.id ? updated : p));
      } else {
        return [...prev, updated];
      }
    });

    if (updated.id === activeProjectId) {
      setProject(updated);
    } else {
      const bundle = loadProjectBundle(updated.id);
      bundle.project = updated;
      safeSetItem(`threadline_project_data_${updated.id}`, JSON.stringify(bundle));
    }
  };

  // Handler: Duplicate Project
  const handleDuplicateProject = (projId: string) => {
    const sourceBundle =
      projId === activeProjectId
        ? {
            project,
            chapters,
            scenes,
            entities,
            threads,
            events,
            continuityIssues,
            revisionPasses,
            cuttingRoom,
            notes,
            snapshots,
            aiAuditLogs,
            roughIdeas,
            frameworkPointers,
            activeSceneId
          }
        : loadProjectBundle(projId);

    if (!sourceBundle) return;

    const newId = 'proj-' + Date.now();
    const clonedProject: Project = {
      ...sourceBundle.project,
      id: newId,
      title: `${sourceBundle.project.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const clonedBundle: ProjectBundle = {
      ...sourceBundle,
      project: clonedProject
    };

    safeSetItem(`threadline_project_data_${newId}`, JSON.stringify(clonedBundle));
    setProjects((prev) => [...prev, clonedProject]);
  };

  // Handler: Delete Project
  const handleDeleteProject = (projId: string) => {
    if (projects.length <= 1) {
      showToast('You must maintain at least one manuscript in Threadline.', 'warning');
      return;
    }

    try {
      localStorage.removeItem(`threadline_project_data_${projId}`);
    } catch (e) {
      console.warn('Failed to remove project data:', e);
    }
    const remaining = projects.filter((p) => p.id !== projId);
    setProjects(remaining);
    showToast('Project deleted');

    if (projId === activeProjectId) {
      handleSwitchProject(remaining[0].id, 'projects');
    }
  };

  // Handler: Import Archive (.json)
  const handleImportProject = (importedData: any) => {
    if (!importedData) return;

    const newId = 'proj-' + Date.now();
    const baseProj = importedData.project || importedData;

    const finalProject: Project = {
      id: newId,
      title: baseProj.title || 'Imported Manuscript',
      type: baseProj.type || 'Novel',
      genre: baseProj.genre,
      protagonist: baseProj.protagonist,
      situation: baseProj.situation,
      targetWordCount: baseProj.targetWordCount || 75000,
      status: baseProj.status || 'drafting',
      lastActiveSceneId: importedData.scenes?.[0]?.id || 'scene-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newBundle: ProjectBundle = {
      project: finalProject,
      chapters: ensureChapters(
        Array.isArray(importedData.scenes) ? importedData.scenes : [],
        importedData.chapters
      ),
      scenes: Array.isArray(importedData.scenes) && importedData.scenes.length > 0
        ? importedData.scenes
        : [
            {
              id: 'scene-1',
              title: '1. Opening Scene',
              order: 1,
              proseContent: '',
              premise: 'Opening scene.',
              characters: [],
              status: 'draft',
              wordCount: 0,
              comments: []
            }
          ],
      entities: Array.isArray(importedData.entities) ? importedData.entities : [],
      threads: Array.isArray(importedData.threads) ? importedData.threads : [],
      events: Array.isArray(importedData.events) ? importedData.events : [],
      continuityIssues: Array.isArray(importedData.continuityIssues) ? importedData.continuityIssues : [],
      revisionPasses: Array.isArray(importedData.revisionPasses) ? importedData.revisionPasses : [],
      cuttingRoom: Array.isArray(importedData.cuttingRoom) ? importedData.cuttingRoom : [],
      notes: Array.isArray(importedData.notes) ? importedData.notes : [],
      snapshots: Array.isArray(importedData.snapshots) ? importedData.snapshots : [],
      aiAuditLogs: Array.isArray(importedData.aiAuditLogs) ? importedData.aiAuditLogs : [],
      roughIdeas: Array.isArray(importedData.roughIdeas) ? importedData.roughIdeas : INITIAL_ROUGH_IDEAS,
      frameworkPointers: Array.isArray(importedData.frameworkPointers) ? importedData.frameworkPointers : INITIAL_FRAMEWORK_POINTERS,
      activeSceneId: importedData.scenes?.[0]?.id || 'scene-1'
    };

    safeSetItem(`threadline_project_data_${newId}`, JSON.stringify(newBundle));
    setProjects((prev) => [...prev, finalProject]);
    handleSwitchProject(newId, 'editor');
  };

  // Handler: Export Single Project Archive
  const handleExportSingleProject = (projId: string) => {
    const bundle =
      projId === activeProjectId
        ? {
            project,
            chapters,
            scenes,
            entities,
            threads,
            events,
            continuityIssues,
            revisionPasses,
            cuttingRoom,
            notes,
            snapshots,
            aiAuditLogs,
            roughIdeas,
            frameworkPointers,
            activeSceneId
          }
        : loadProjectBundle(projId);

    if (!bundle) return;

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `${bundle.project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_archive.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Find active scene object
  const activeScene = scenes.find((s) => s.id === activeSceneId) || scenes[0] || {
    id: 'scene-1',
    title: '1. Opening Scene',
    order: 1,
    proseContent: '',
    premise: '',
    characters: [],
    location: '',
    time: '',
    pov: '',
    status: 'draft',
    wordCount: 0,
    notes: '',
    comments: []
  };

  // Scene Update Handler with automatic Word Count Calculation and atomic chapter synchronization
  const handleUpdateActiveScene = (updatedFields: Partial<Scene>, targetSceneId?: string) => {
    const targetId = targetSceneId || activeScene.id;
    setLastSavedText('Saving...');

    // Synchronize chapter fields to prevent scene duplication or orphan states
    if ('chapterId' in updatedFields) {
      const newChapId = updatedFields.chapterId;
      if (newChapId) {
        const targetChap = chapters.find((c) => c.id === newChapId);
        if (targetChap) {
          if (updatedFields.chapterNumber === undefined) {
            updatedFields.chapterNumber = targetChap.number;
          }
          if (updatedFields.chapterTitle === undefined) {
            updatedFields.chapterTitle = targetChap.title;
          }
          if (updatedFields.actOrPhase === undefined && targetChap.actOrPhase) {
            updatedFields.actOrPhase = targetChap.actOrPhase;
          }
        }
      } else {
        updatedFields.chapterNumber = undefined;
        updatedFields.chapterTitle = undefined;
      }

      // Atomically remove scene from all other chapters and add only to target chapter
      setChapters((prev) =>
        prev.map((c) => {
          const filteredIds = (c.sceneIds || []).filter((id) => id !== targetId);
          if (newChapId && c.id === newChapId) {
            return {
              ...c,
              sceneIds: [...filteredIds, targetId]
            };
          }
          return {
            ...c,
            sceneIds: filteredIds
          };
        })
      );
    } else if (updatedFields.chapterNumber !== undefined) {
      const targetChap = chapters.find((c) => c.number === updatedFields.chapterNumber);
      if (targetChap) {
        updatedFields.chapterId = targetChap.id;
        if (updatedFields.chapterTitle === undefined) {
          updatedFields.chapterTitle = targetChap.title;
        }
        setChapters((prev) =>
          prev.map((c) => {
            const filteredIds = (c.sceneIds || []).filter((id) => id !== targetId);
            if (c.id === targetChap.id) {
              return {
                ...c,
                sceneIds: [...filteredIds, targetId]
              };
            }
            return {
              ...c,
              sceneIds: filteredIds
            };
          })
        );
      }
    }

    setScenes((prev) =>
      prev.map((s) => {
        if (s.id !== targetId) return s;
        const merged = { ...s, ...updatedFields };
        if (updatedFields.proseContent !== undefined) {
          const words = updatedFields.proseContent.trim()
            ? updatedFields.proseContent.trim().split(/\s+/).filter(Boolean).length
            : 0;
          merged.wordCount = words;
        }
        return merged;
      })
    );

    // Update project timestamp
    setProject((prev) => ({
      ...prev,
      lastActiveSceneId: targetId,
      updatedAt: new Date().toISOString()
    }));

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      setLastSavedText('Saved locally');
    }, 400);
  };

  // Merge Editorial Working Copy into Manuscript Draft with Automatic Pre-Merge Snapshot
  const handleMergeSceneToManuscript = (sceneId: string, finalProse: string) => {
    setLastSavedText('Saving merge...');
    setScenes((prev) =>
      prev.map((s) => {
        if (s.id !== sceneId) return s;
        // Create backup revision snapshot of author's original draft
        const snapshot = {
          id: 'ver-premerge-' + Date.now(),
          timestamp: new Date().toISOString(),
          title: s.title,
          proseContent: s.proseContent,
          wordCount: s.wordCount,
          label: 'Pre-Editorial Merge Snapshot (Original Manuscript)'
        };
        const words = finalProse.trim()
          ? finalProse.trim().split(/\s+/).filter(Boolean).length
          : 0;

        return {
          ...s,
          proseContent: finalProse,
          editorialBaseline: finalProse,
          editorialProseContent: finalProse,
          wordCount: words,
          editorialStatus: 'clean-approved',
          versions: [snapshot, ...(s.versions || [])]
        };
      })
    );
    showToast('Merged editorial copy into manuscript draft (backup snapshot preserved)');
    setLastSavedText('Saved locally');
  };

  // Quick Ideation Handler
  const handleSaveQuickIdea = (ideaData: Omit<RoughIdea, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newIdea: RoughIdea = {
      ...ideaData,
      id: 'idea-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setRoughIdeas((prev) => [newIdea, ...prev]);
    showToast(`Rough idea captured: "${newIdea.title}"`);
    setIsQuickIdeationOpen(false);
  };

  // Add a new scene
  const handleAddScene = () => {
    const nextOrder = scenes.length + 1;
    const newId = 'scene-' + Date.now();
    const activeChap = chapters.find(
      (c) => c.id === activeScene.chapterId || c.number === activeScene.chapterNumber || c.sceneIds.includes(activeScene.id)
    ) || chapters[chapters.length - 1];

    const isScreenplay = project.type === 'Screenplay' || project.type === 'Screenplay Experiment';

    const newScene: Scene = {
      id: newId,
      title: `${nextOrder}. Next Chapter Beat`,
      order: nextOrder,
      chapterId: activeChap?.id,
      chapterNumber: activeChap?.number,
      chapterTitle: activeChap?.title,
      actOrPhase: activeChap?.actOrPhase,
      proseContent: '',
      premise: 'Objective and dramatic tension for this beat.',
      characters: project.protagonist ? [project.protagonist] : [],
      location: 'Primary Setting',
      time: 'Next Day',
      pov: project.protagonist ? `${project.protagonist} (Third Limited)` : 'Third Limited',
      status: 'draft',
      wordCount: 0,
      notes: '',
      comments: [],
      editorMode: isScreenplay ? 'screenplay' : 'prose'
    };

    setScenes((prev) => [...prev, newScene]);
    if (activeChap) {
      setChapters((prev) =>
        prev.map((c) =>
          c.id === activeChap.id
            ? { ...c, sceneIds: [...(c.sceneIds || []), newId] }
            : c
        )
      );
    }
    setActiveSceneId(newId);
    setCurrentScreen(isScreenplay ? 'screenplay' : 'editor');
    showToast(`Scene created: "${newScene.title}"`);
  };

  // Chapter management handlers
  const handleAddChapter = (title?: string, actOrPhase?: string) => {
    const nextNum = chapters.length + 1;
    const newChapId = 'chap-' + Date.now();
    const newChapter: Chapter = {
      id: newChapId,
      number: nextNum,
      title: title || `Chapter ${nextNum}`,
      actOrPhase: actOrPhase || (scenes[0]?.actOrPhase || 'Act I'),
      sceneIds: []
    };
    setChapters((prev) => [...prev, newChapter]);
    showToast(`Created Chapter ${nextNum}: "${newChapter.title}"`);
    return newChapId;
  };

  const handleUpdateChapter = (chapterId: string, fields: Partial<Chapter>) => {
    setChapters((prev) =>
      prev.map((c) => (c.id === chapterId ? { ...c, ...fields } : c))
    );
    if (fields.title || fields.actOrPhase || fields.number !== undefined) {
      setScenes((prev) =>
        prev.map((s) => {
          if (s.chapterId === chapterId) {
            return {
              ...s,
              ...(fields.title ? { chapterTitle: fields.title } : {}),
              ...(fields.actOrPhase ? { actOrPhase: fields.actOrPhase } : {}),
              ...(fields.number !== undefined ? { chapterNumber: fields.number } : {})
            };
          }
          return s;
        })
      );
    }
  };

  const handleDeleteChapter = (chapterId: string) => {
    const chapToDelete = chapters.find((c) => c.id === chapterId);
    if (!chapToDelete) return;
    setScenes((prev) =>
      prev.map((s) =>
        s.chapterId === chapterId
          ? { ...s, chapterId: undefined, chapterTitle: undefined, chapterNumber: undefined }
          : s
      )
    );
    setChapters((prev) => {
      const remaining = prev.filter((c) => c.id !== chapterId);
      return remaining.map((c, idx) => ({ ...c, number: idx + 1 }));
    });
    showToast(`Deleted Chapter: "${chapToDelete.title}"`);
  };

  const handleAddSceneToChapter = (chapterId: string, customTitle?: string) => {
    const targetChapter = chapters.find((c) => c.id === chapterId);
    const nextOrder = scenes.length + 1;
    const newSceneId = 'scene-' + Date.now();
    const sceneTitle = customTitle || `${nextOrder}. New Scene`;
    const isScreenplay = project.type === 'Screenplay' || project.type === 'Screenplay Experiment';

    const newScene: Scene = {
      id: newSceneId,
      title: sceneTitle,
      order: nextOrder,
      chapterId,
      chapterNumber: targetChapter?.number,
      chapterTitle: targetChapter?.title,
      actOrPhase: targetChapter?.actOrPhase,
      proseContent: '',
      premise: `Drafting in Chapter ${targetChapter?.number || ''}: ${targetChapter?.title || ''}`,
      characters: project.protagonist ? [project.protagonist] : [],
      location: 'Primary Setting',
      time: 'Day 1',
      pov: project.protagonist ? `${project.protagonist} (Third Limited)` : 'Third Limited',
      status: 'draft',
      wordCount: 0,
      notes: '',
      comments: [],
      editorMode: isScreenplay ? 'screenplay' : 'prose'
    };

    setScenes((prev) => [...prev, newScene]);
    setChapters((prev) =>
      prev.map((c) =>
        c.id === chapterId
          ? { ...c, sceneIds: [...(c.sceneIds || []), newSceneId] }
          : c
      )
    );
    setActiveSceneId(newSceneId);
    setCurrentScreen(isScreenplay ? 'screenplay' : 'editor');
    showToast(`Added scene to Chapter ${targetChapter?.number || ''}`);
  };

  // Duplicate an existing scene
  const handleDuplicateScene = (sceneId: string) => {
    const target = scenes.find((s) => s.id === sceneId);
    if (!target) return;
    const nextOrder = scenes.length + 1;
    const newId = 'scene-' + Date.now();
    const dup: Scene = {
      ...target,
      id: newId,
      title: `${target.title} (Copy)`,
      order: nextOrder
    };
    setScenes((prev) => [...prev, dup]);
    setActiveSceneId(newId);
    showToast('Scene duplicated');
  };

  // Delete a scene safely
  const handleDeleteScene = (sceneId: string) => {
    if (scenes.length <= 1) {
      showToast('Cannot delete the only scene in manuscript', 'warning');
      return;
    }
    const remaining = scenes.filter((s) => s.id !== sceneId);
    const reindexed = remaining.map((s, idx) => ({ ...s, order: idx + 1 }));
    setScenes(reindexed);
    setActiveSceneId(reindexed[0].id);
    showToast('Scene deleted');
  };

  // Snapshots Handlers
  const handleTakeSnapshot = (name: string) => {
    const newSnapshot: Snapshot = {
      id: 'snap-' + Date.now(),
      name,
      timestamp: new Date().toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      scenesSummary: scenes.map((s) => ({
        id: s.id,
        title: s.title,
        wordCount: s.wordCount,
        proseContent: s.proseContent
      }))
    };
    setSnapshots((prev) => [newSnapshot, ...prev]);
  };

  const handleRestoreSnapshot = (snapshot: Snapshot) => {
    // 1. Take safety backup snapshot of current state
    handleTakeSnapshot(`Auto-backup before restoring "${snapshot.name}"`);

    // 2. Restore scenes from snapshot
    const restoredScenes: Scene[] = snapshot.scenesSummary.map((sum, idx) => {
      const existing = scenes.find((s) => s.id === sum.id);
      return {
        id: sum.id,
        title: sum.title,
        order: idx + 1,
        proseContent: sum.proseContent,
        premise: existing?.premise || '',
        characters: existing?.characters || [],
        location: existing?.location || '',
        time: existing?.time || '',
        pov: existing?.pov || '',
        status: existing?.status || 'revised',
        wordCount: sum.wordCount,
        notes: existing?.notes || '',
        comments: existing?.comments || []
      };
    });

    setScenes(restoredScenes);
    setActiveSceneId(restoredScenes[0]?.id || 'scene-1');
    setCurrentScreen(project.type === 'Screenplay' ? 'screenplay' : 'editor');
  };

  // Restore Cutting Room Item directly to active scene
  const handleRestoreCuttingRoomItem = (item: CuttingRoomItem) => {
    setScenes((prev) =>
      prev.map((s) => {
        if (s.id !== activeScene.id) return s;
        const restoredProse = s.proseContent + '\n\n' + item.text;
        return {
          ...s,
          proseContent: restoredProse,
          wordCount: restoredProse.trim().split(/\s+/).filter(Boolean).length
        };
      })
    );
    // Remove from cutting room
    setCuttingRoom((prev) => prev.filter((c) => c.id !== item.id));
    setCurrentScreen(project.type === 'Screenplay' ? 'screenplay' : 'editor');
  };

  // Convert Cutting Room Item to Scratchpad Note
  const handleConvertCutToNote = (item: CuttingRoomItem) => {
    const newNote: NoteItem = {
      id: 'note-' + Date.now(),
      title: `Clipped from ${item.originalSceneTitle}`,
      content: item.text,
      category: 'idea',
      sceneId: activeScene.id,
      resolved: false
    };
    setNotes((prev) => [newNote, ...prev]);
    setCuttingRoom((prev) => prev.filter((c) => c.id !== item.id));
  };

  // Create Note from Continuity issue
  const handleCreateNoteFromIssue = (issue: ContinuityIssue) => {
    const newNote: NoteItem = {
      id: 'note-' + Date.now(),
      title: `Continuity: ${issue.title}`,
      content: `${issue.question}\n\nPassage 1: "${issue.passageA.excerpt}"\nPassage 2: "${issue.passageB.excerpt}"`,
      category: 'question',
      sceneId: issue.passageA.sceneId,
      resolved: false
    };
    setNotes((prev) => [newNote, ...prev]);
    showToast('Inquiry added as a private note in your Scratchpad');
  };

  // Reset demo project
  const handleResetToDemo = () => {
    setProject(INITIAL_PROJECT);
    setChapters(INITIAL_CHAPTERS);
    setScenes(INITIAL_SCENES);
    setActiveSceneId('scene-3');
    setEntities(INITIAL_ENTITIES);
    setThreads(INITIAL_THREADS);
    setEvents(INITIAL_EVENTS);
    setContinuityIssues(INITIAL_CONTINUITY_ISSUES);
    setRevisionPasses(INITIAL_REVISION_PASSES);
    setCuttingRoom(INITIAL_CUTTING_ROOM);
    setNotes(INITIAL_NOTES);
    setSnapshots(INITIAL_SNAPSHOTS);
    setAiAuditLogs([]);
    setRoughIdeas(INITIAL_ROUGH_IDEAS);
    setFrameworkPointers(INITIAL_FRAMEWORK_POINTERS);
    setCurrentScreen('home');
    showToast('Demo project restored');
  };

  const handleClearAllData = () => {
    localStorage.clear();
    const blankProj: Project = {
      id: 'proj-new',
      title: 'Untitled Story',
      type: 'Novel',
      targetWordCount: 50000,
      status: 'drafting',
      lastActiveSceneId: 'scene-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setProjects([blankProj]);
    setActiveProjectId(blankProj.id);
    setProject(blankProj);
    setChapters([
      {
        id: 'chap-1',
        number: 1,
        title: 'Chapter 1: The Beginning',
        actOrPhase: 'Act I',
        sceneIds: ['scene-1']
      }
    ]);
    setScenes([
      {
        id: 'scene-1',
        title: '1. Opening Beat',
        order: 1,
        proseContent: '',
        premise: 'Opening scene.',
        characters: [],
        location: 'Primary Setting',
        time: 'Day 1',
        pov: 'Third Person',
        status: 'draft',
        wordCount: 0,
        notes: '',
        comments: []
      }
    ]);
    setActiveSceneId('scene-1');
    setEntities([]);
    setThreads([]);
    setEvents([]);
    setContinuityIssues([]);
    setRevisionPasses([]);
    setCuttingRoom([]);
    setNotes([]);
    setSnapshots([]);
    setAiAuditLogs([]);
    setRoughIdeas([]);
    setFrameworkPointers([]);
    setCurrentScreen(project.type === 'Screenplay' ? 'screenplay' : 'editor');
    showToast('Workspace reset to blank state');
  };

  const handleExportFullArchive = () => {
    const archive = {
      project,
      chapters,
      scenes,
      entities,
      threads,
      events,
      continuityIssues,
      revisionPasses,
      cuttingRoom,
      notes,
      snapshots,
      aiAuditLogs,
      roughIdeas,
      frameworkPointers,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(archive, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.toLowerCase().replace(/\s+/g, '_')}_full_archive.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const openContinuityCount = continuityIssues.filter((i) => i.status === 'open').length;

  const currentBundleForVault: ProjectBundle = {
    project,
    chapters,
    scenes,
    entities,
    threads,
    events,
    continuityIssues,
    revisionPasses,
    cuttingRoom,
    notes,
    snapshots,
    aiAuditLogs,
    roughIdeas,
    frameworkPointers,
    activeSceneId
  };

  const handleReloadBundleFromVault = (newBundle: ProjectBundle) => {
    setProject(newBundle.project);
    const normalizedChapters = ensureChapters(newBundle.scenes, newBundle.chapters);
    setChapters(normalizedChapters);
    setScenes(newBundle.scenes);
    setEntities(newBundle.entities || []);
    setThreads(newBundle.threads || []);
    setEvents(newBundle.events || []);
    setContinuityIssues(newBundle.continuityIssues || []);
    setRevisionPasses(newBundle.revisionPasses || []);
    setCuttingRoom(newBundle.cuttingRoom || []);
    setNotes(newBundle.notes || []);
    setSnapshots(newBundle.snapshots || []);
    setRoughIdeas(newBundle.roughIdeas || INITIAL_ROUGH_IDEAS);
    setFrameworkPointers(newBundle.frameworkPointers || INITIAL_FRAMEWORK_POINTERS);
    setActiveSceneId(newBundle.activeSceneId || newBundle.scenes[0]?.id || 'scene-1');
    showToast(`Reloaded manuscript from ${vaultInfo?.folderName || 'folder'}!`);
  };

  const isFullScreenPage = currentScreen === 'new-project' || currentScreen === 'landing';

  return (
    <div
      className={`bg-[#FAF6EE] text-[#221E18] font-sans ${
        isFullScreenPage
          ? 'min-h-screen flex flex-col'
          : 'h-screen w-screen flex flex-row overflow-hidden'
      }`}
    >
      {/* 1. NOTION SIDEBAR (Desktop - Collapsible) */}
      {!isFullScreenPage && isSidebarOpen && (
        <div className="hidden md:flex h-full shrink-0">
          <NotionSidebar
            currentScreen={currentScreen}
            onNavigate={(screen) => setCurrentScreen(screen)}
            openContinuityCount={openContinuityCount}
            projectTitle={project.title}
            allProjects={projects}
            activeProjectId={activeProjectId}
            onSelectProject={(id) => handleSwitchProject(id, userRole === 'editor' ? 'editor-review' : project.type === 'Screenplay' ? 'screenplay' : 'editor')}
            onStartNewProject={() => setCurrentScreen('new-project')}
            onOpenSearch={() => setIsCommandPaletteOpen(true)}
            vaultInfo={vaultInfo}
            onOpenVaultManager={() => setIsVaultModalOpen(true)}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            chapters={chapters}
            scenes={scenes}
            activeSceneId={activeSceneId}
            onSelectScene={(sceneId) => {
              setActiveSceneId(sceneId);
              setCurrentScreen(userRole === 'editor' ? 'editor-review' : project.type === 'Screenplay' ? 'screenplay' : 'editor');
            }}
            onAddScene={handleAddScene}
            onAddChapter={() => handleAddChapter()}
            isOpen={isSidebarOpen}
            onClose={handleToggleSidebar}
            isMobile={false}
            userRole={userRole}
            onToggleRole={handleToggleRole}
            projectType={project.type === 'Screenplay' ? 'screenplay' : 'novel'}
          />
        </div>
      )}

      {/* 2. NOTION SIDEBAR (Mobile Slide-out Drawer) */}
      {!isFullScreenPage && isMobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          {/* Drawer Panel */}
          <div className="relative z-10 animate-in slide-in-from-left duration-200 h-full">
            <NotionSidebar
              currentScreen={currentScreen}
              onNavigate={(screen) => setCurrentScreen(screen)}
              openContinuityCount={openContinuityCount}
              projectTitle={project.title}
              allProjects={projects}
              activeProjectId={activeProjectId}
              onSelectProject={(id) => handleSwitchProject(id, userRole === 'editor' ? 'editor-review' : project.type === 'Screenplay' ? 'screenplay' : 'editor')}
              onStartNewProject={() => setCurrentScreen('new-project')}
              onOpenSearch={() => setIsCommandPaletteOpen(true)}
              vaultInfo={vaultInfo}
              onOpenVaultManager={() => setIsVaultModalOpen(true)}
              theme={theme}
              onToggleTheme={handleToggleTheme}
              chapters={chapters}
              scenes={scenes}
              activeSceneId={activeSceneId}
              onSelectScene={(sceneId) => {
                setActiveSceneId(sceneId);
                setCurrentScreen(userRole === 'editor' ? 'editor-review' : project.type === 'Screenplay' ? 'screenplay' : 'editor');
              }}
              onAddScene={handleAddScene}
              onAddChapter={() => handleAddChapter()}
              isOpen={true}
              onClose={() => setIsMobileSidebarOpen(false)}
              isMobile={true}
              userRole={userRole}
              onToggleRole={handleToggleRole}
              projectType={project.type === 'Screenplay' ? 'screenplay' : 'novel'}
            />
          </div>
        </div>
      )}

      {/* 3. MAIN WORKSPACE / CONTENT COLUMN */}
      <div className={`flex-1 flex flex-col min-w-0 h-full overflow-hidden relative ${isFullScreenPage ? 'min-h-screen' : ''}`}>
        {/* Notion Top Breadcrumb Bar (rendered for all views except editor and screenplay, which use the single consolidated adaptive header) */}
        {!isFullScreenPage && currentScreen !== 'editor' && currentScreen !== 'screenplay' && (
          <NotionTopBar
            currentScreen={currentScreen}
            onNavigate={(screen) => setCurrentScreen(screen)}
            projectTitle={project.title}
            activeScene={activeScene}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={handleToggleSidebar}
            onOpenMobileDrawer={() => setIsMobileSidebarOpen(true)}
            onOpenSearch={() => setIsCommandPaletteOpen(true)}
            vaultInfo={vaultInfo}
            onOpenVaultManager={() => setIsVaultModalOpen(true)}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            lastSavedText={lastSavedText}
            colorBlindMode={themeConfig.colorBlindMode || 'none'}
            onToggleColorBlind={handleToggleColorBlind}
            userRole={userRole}
            onToggleRole={handleToggleRole}
            projectType={project.type === 'Screenplay' ? 'screenplay' : 'novel'}
            openContinuityCount={openContinuityCount}
          />
        )}

        {/* Screen Routing */}
        <main className={`flex-1 min-h-0 w-full max-w-full overflow-x-hidden flex flex-col ${(currentScreen === 'editor' || currentScreen === 'screenplay') ? 'overflow-hidden' : 'overflow-y-auto'} ${!isFullScreenPage ? 'pb-20 md:pb-0' : ''}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScreen}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="flex-1 flex flex-col min-h-0 w-full max-w-full overflow-x-hidden"
            >
        {currentScreen === 'projects' && (
          <ProjectsRootScreen
            projects={projects}
            activeProjectId={activeProjectId}
            projectStatsMap={projectStatsMap}
            onSelectProject={(id, target) => handleSwitchProject(id, target || 'editor')}
            onCreateNewProject={() => setCurrentScreen('new-project')}
            onEditProject={handleEditProject}
            onDuplicateProject={handleDuplicateProject}
            onDeleteProject={handleDeleteProject}
            onImportProject={handleImportProject}
            onExportProject={handleExportSingleProject}
            onOpenVaultManager={() => setIsVaultModalOpen(true)}
          />
        )}

        {currentScreen === 'home' && (
          <HomeScreen
            project={project}
            scenes={scenes}
            chapters={chapters}
            activeScene={activeScene}
            revisionPasses={revisionPasses}
            continuityIssues={continuityIssues}
            notes={notes}
            entities={entities}
            onContinueWriting={() => handleContinueWritingFlow()}
            onNavigateToScene={(sceneId) => handleContinueWritingFlow(sceneId)}
            onNavigateToRevisions={() => setCurrentScreen('revisions')}
            onNavigateToContinuity={() => setCurrentScreen('continuity')}
            onNavigateToBible={() => setCurrentScreen('codex')}
            onStartNewProject={() => setCurrentScreen('new-project')}
            onNavigateToProjects={() => setCurrentScreen('projects')}
            onAddScene={handleAddScene}
            onNavigateToEditorial={() => setCurrentScreen('editorial')}
          />
        )}

        {currentScreen === 'editor' && (
          <EditorScreen
            scene={activeScene}
            allScenes={scenes}
            chapters={chapters}
            entities={entities}
            threads={threads}
            lastSavedText={lastSavedText}
            onUpdateScene={handleUpdateActiveScene}
            onNavigateToScene={(sceneId) => setActiveSceneId(sceneId)}
            onSendToCuttingRoom={(item) => {
              setCuttingRoom((prev) => [item, ...prev]);
              showToast('Excerpt moved to Cutting Room');
            }}
            onAddEntity={(entity) => {
              setEntities((prev) => [...prev, entity]);
              showToast(`Added "${entity.name}" to Story Bible`);
            }}
            onLogAiAction={(log) => setAiAuditLogs((prev) => [log, ...prev])}
            onOpenStoryBible={() => setCurrentScreen('codex')}
            onDuplicateScene={handleDuplicateScene}
            onDeleteScene={handleDeleteScene}
            onAddChapter={handleAddChapter}
            onUpdateChapter={handleUpdateChapter}
            onDeleteChapter={handleDeleteChapter}
            onAddSceneToChapter={handleAddSceneToChapter}
            researchVault={researchVault}
            onUpdateSceneById={(sceneId, fields) => handleUpdateActiveScene(fields, sceneId)}
            onOpenResearchItem={() => setCurrentScreen('research-vault')}
            onOpenCodexEntity={() => setCurrentScreen('codex')}
            project={project}
            projectTitle={project.title}
            authorName={project.protagonist ? `${project.protagonist} & Author` : 'Author'}
            lineSpacing={typographySettings.lineSpacing}
            wordSpacing={typographySettings.wordSpacing}
            textAlign={typographySettings.textAlign}
            pageWidth={typographySettings.pageWidth || 'standard'}
            onChangeLineSpacing={handleSelectLineSpacing}
            onChangeWordSpacing={handleSelectWordSpacing}
            onChangeTextAlign={handleSelectTextAlign}
            onChangePageWidth={handleSelectPageWidth}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebarNav={handleToggleSidebar}
            onOpenMobileDrawer={() => setIsMobileSidebarOpen(true)}
            onNavigate={(screen) => setCurrentScreen(screen)}
            onOpenSearch={() => setIsCommandPaletteOpen(true)}
            userRole={userRole}
            onToggleRole={handleToggleRole}
            openContinuityCount={openContinuityCount}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            colorBlindMode={themeConfig.colorBlindMode || 'none'}
            onToggleColorBlind={handleToggleColorBlind}
            vaultInfo={vaultInfo}
            onOpenVaultManager={() => setIsVaultModalOpen(true)}
          />
        )}

        {currentScreen === 'screenplay' && (
          <ScreenplayWorkspaceScreen
            scene={activeScene}
            allScenes={scenes}
            chapters={chapters}
            project={project}
            projectTitle={project.title}
            authorName={project.author || (project.protagonist ? `${project.protagonist} & Author` : 'Screenwriter')}
            onUpdateScene={handleUpdateActiveScene}
            onNavigateToScene={(sceneId) => setActiveSceneId(sceneId)}
            onAddScene={handleAddScene}
            onDuplicateScene={handleDuplicateScene}
            onDeleteScene={handleDeleteScene}
            onOpenStoryBible={() => setCurrentScreen('codex')}
            onOpenResearchVault={() => setCurrentScreen('research-vault')}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebarNav={handleToggleSidebar}
            onOpenMobileDrawer={() => setIsMobileSidebarOpen(true)}
            onNavigate={(screen) => setCurrentScreen(screen)}
            onOpenSearch={() => setIsCommandPaletteOpen(true)}
            userRole={userRole}
            onToggleRole={handleToggleRole}
            lastSavedText={lastSavedText}
          />
        )}

        {currentScreen === 'research-vault' && (
          <ResearchVaultScreen
            vaultItems={researchVault}
            activeScene={activeScene}
            allScenes={scenes}
            entities={entities}
            onUpdateVaultItems={(items) => setResearchVault(items)}
            onPinToScene={(sceneId, bookmark) => {
              setScenes((prev) =>
                prev.map((s) => {
                  if (s.id !== sceneId) return s;
                  const existing = s.bookmarks || [];
                  return { ...s, bookmarks: [...existing, bookmark] };
                })
              );
              showToast(`Pinned bookmark to "${scenes.find((s) => s.id === sceneId)?.title || 'Scene'}"`);
            }}
            onNavigateToScene={(sceneId) => {
              setActiveSceneId(sceneId);
              setCurrentScreen('editor');
            }}
          />
        )}

        {(currentScreen === 'editor-review' || currentScreen === 'editorial') && (
          <EditorReviewScreen
            project={project}
            projectType={project.type === 'Screenplay' ? 'screenplay' : 'novel'}
            scenes={scenes}
            entities={entities}
            issues={continuityIssues}
            activeSceneId={activeSceneId}
            onSelectScene={(sceneId) => setActiveSceneId(sceneId)}
            onUpdateScene={(sceneId, fields) => handleUpdateActiveScene(fields, sceneId)}
          />
        )}

        {currentScreen === 'version-history' && (
          <VersionHistoryScreen
            project={project}
            projectType={project.type === 'Screenplay' ? 'screenplay' : 'novel'}
            scenes={scenes}
            snapshots={snapshots}
            revisionPasses={revisionPasses}
          />
        )}

        {currentScreen === 'ideation' && (
          <IdeationScreen
            roughIdeas={roughIdeas}
            frameworkPointers={frameworkPointers}
            scenes={scenes}
            entities={entities}
            onAddRoughIdea={(ideaData) => {
              const newIdea: RoughIdea = {
                ...ideaData,
                id: 'idea-' + Date.now(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              setRoughIdeas((prev) => [newIdea, ...prev]);
              showToast(`Idea "${newIdea.title}" captured`);
            }}
            onUpdateRoughIdea={(updated) => {
              setRoughIdeas((prev) =>
                prev.map((i) =>
                  i.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : i
                )
              );
            }}
            onDeleteRoughIdea={(id) => {
              setRoughIdeas((prev) => prev.filter((i) => i.id !== id));
              showToast('Idea removed');
            }}
            onAddFrameworkPointer={(ptrData) => {
              const newPtr: FrameworkPointer = {
                ...ptrData,
                id: 'ptr-' + Date.now(),
                createdAt: new Date().toISOString()
              };
              setFrameworkPointers((prev) => [...prev, newPtr]);
              showToast('Pointer attached to framework beat');
            }}
            onDeleteFrameworkPointer={(id) => {
              setFrameworkPointers((prev) => prev.filter((p) => p.id !== id));
              showToast('Pointer removed');
            }}
            onConvertToScene={(idea) => {
              const nextOrder = scenes.length + 1;
              const newSceneId = 'scene-' + Date.now();
              const newScene: Scene = {
                id: newSceneId,
                title: idea.title,
                order: nextOrder,
                premise: idea.description,
                characters: project.protagonist ? [project.protagonist] : [],
                location: '',
                time: '',
                pov: 'Third Limited',
                status: 'draft',
                wordCount: 0,
                notes: `Promoted from rough idea (${idea.category})`,
                comments: [],
                proseContent: ''
              };
              setScenes((prev) => [...prev, newScene]);
              setRoughIdeas((prev) =>
                prev.map((i) => (i.id === idea.id ? { ...i, status: 'in-progress' } : i))
              );
              setActiveSceneId(newSceneId);
              setCurrentScreen(userRole === 'editor' ? 'editor-review' : project.type === 'Screenplay' ? 'screenplay' : 'editor');
              showToast(`Idea converted into scene "${newScene.title}"`);
            }}
            onConvertToEntity={(idea) => {
              const newEnt: Entity = {
                id: 'ent-' + Date.now(),
                name: idea.title,
                type: idea.category === 'character' ? 'character' : idea.category === 'world' ? 'place' : 'concept',
                status: 'tentative',
                description: idea.description,
                canonicalFacts: [`Origin rough idea: ${idea.title}`],
                linkedSceneIds: []
              };
              setEntities((prev) => [...prev, newEnt]);
              setRoughIdeas((prev) =>
                prev.map((i) => (i.id === idea.id ? { ...i, status: 'incorporated' } : i))
              );
              setCurrentScreen('plan-lore');
              showToast(`Idea converted into Lore entity "${newEnt.name}"`);
            }}
            onNavigateToScene={(sceneId) => {
              setActiveSceneId(sceneId);
              setCurrentScreen(userRole === 'editor' ? 'editor-review' : project.type === 'Screenplay' ? 'screenplay' : 'editor');
            }}
          />
        )}

        {(currentScreen === 'plan-lore' || currentScreen === 'dashboard' || currentScreen === 'codex' || currentScreen === 'bible') && (
          <PlanAndLoreHub
            project={project}
            projectType={project.type === 'Screenplay' ? 'screenplay' : 'novel'}
            scenes={scenes}
            chapters={chapters}
            threads={threads}
            notes={notes}
            entities={entities}
            events={events}
            initialSubView={currentScreen === 'codex' || currentScreen === 'bible' ? 'wiki' : 'corkboard'}
            onNavigateToScene={(sceneId) => {
              setActiveSceneId(sceneId);
              setCurrentScreen(userRole === 'editor' ? 'editor-review' : project.type === 'Screenplay' ? 'screenplay' : 'editor');
            }}
            onReorderScenes={(reordered) => setScenes(reordered)}
            onAddScene={handleAddScene}
            onAddSceneToChapter={handleAddSceneToChapter}
            onAddChapter={handleAddChapter}
            onUpdateChapter={handleUpdateChapter}
            onDeleteChapter={handleDeleteChapter}
            onUpdateChapters={setChapters}
            onUpdateScene={(targetSceneId, updatedFields) => {
              handleUpdateActiveScene(updatedFields, targetSceneId);
            }}
            onUpdateNote={(updated) =>
              setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)))
            }
            onAddNote={() => {
              const newN: NoteItem = {
                id: 'note-' + Date.now(),
                title: 'New Research Inquiry',
                content: 'Notes, questions, or historical details to explore...',
                category: 'question',
                resolved: false
              };
              setNotes((prev) => [...prev, newN]);
              showToast('Research inquiry added');
            }}
            onUpdateEntity={(updated) =>
              setEntities((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
            }
            onCreateEntity={(newEnt) => {
              setEntities((prev) => [...prev, newEnt]);
              showToast(`Created entity "${newEnt.name}"`);
            }}
            onDeleteEntity={(id) => {
              setEntities((prev) => prev.filter((e) => e.id !== id));
              showToast('Entity removed');
            }}
            onUpdateThread={(updated) =>
              setThreads((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
            }
            onCreateThread={(newTh) => {
              setThreads((prev) => [...prev, newTh]);
              showToast('Thread created');
            }}
            onDeleteThread={(id) => {
              setThreads((prev) => prev.filter((t) => t.id !== id));
              showToast('Thread deleted');
            }}
            onUpdateEvent={(updated) =>
              setEvents((prev) => prev.map((ev) => (ev.id === updated.id ? updated : ev)))
            }
            onCreateEvent={(newEv) => {
              setEvents((prev) => [...prev, newEv]);
              showToast('Event recorded');
            }}
            onDeleteEvent={(id) => {
              setEvents((prev) => prev.filter((ev) => ev.id !== id));
              showToast('Event removed');
            }}
          />
        )}

        {(currentScreen === 'diagnostics' || currentScreen === 'continuity') && (
          <InsightsView
            project={project}
            projectType={project.type === 'Screenplay' ? 'screenplay' : 'novel'}
            issues={continuityIssues}
            scenes={scenes}
            chapters={chapters}
            entities={entities}
            onUpdateIssue={(updated) => {
              setContinuityIssues((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
              showToast(`Inquiry marked as ${updated.status}`);
            }}
            onSetIssues={(newIssues) => {
              setContinuityIssues(newIssues);
            }}
            onNavigateToScene={(sceneId) => {
              setActiveSceneId(sceneId);
              setCurrentScreen(userRole === 'editor' ? 'editor-review' : project.type === 'Screenplay' ? 'screenplay' : 'editor');
            }}
            onCreateNoteFromIssue={handleCreateNoteFromIssue}
            onCreateIssue={(issue) => {
              setContinuityIssues((prev) => [issue, ...prev]);
              showToast('Continuity inquiry logged');
            }}
          />
        )}

        {currentScreen === 'revisions' && (
          <RevisionsScreen
            revisionPasses={revisionPasses}
            snapshots={snapshots}
            cuttingRoom={cuttingRoom}
            scenes={scenes}
            onUpdatePasses={(passes) => setRevisionPasses(passes)}
            onTakeSnapshot={handleTakeSnapshot}
            onRestoreSnapshot={handleRestoreSnapshot}
            onRestoreCuttingRoomItem={handleRestoreCuttingRoomItem}
            onDeleteCuttingRoomItem={(id) =>
              setCuttingRoom((prev) => prev.filter((c) => c.id !== id))
            }
            onConvertCutToNote={handleConvertCutToNote}
            onNavigateToScene={(sceneId) => {
              setActiveSceneId(sceneId);
              setCurrentScreen(project.type === 'Screenplay' ? 'screenplay' : 'editor');
            }}
            onUpdateScene={(sceneId, fields) => {
              handleUpdateActiveScene(fields, sceneId);
            }}
          />
        )}

        {currentScreen === 'export' && (
          <ExportScreen
            project={project}
            scenes={scenes}
            chapters={chapters}
            entities={entities}
            threads={threads}
          />
        )}

        {currentScreen === 'settings' && (
          <SettingsScreen
            aiAuditLogs={aiAuditLogs}
            onResetToDemo={handleResetToDemo}
            onClearAllData={handleClearAllData}
            onExportFullArchive={handleExportFullArchive}
            vaultInfo={vaultInfo}
            onOpenVaultManager={() => setIsVaultModalOpen(true)}
            onOpenTour={() => setIsTourOpen(true)}
            themeConfig={themeConfig}
            onSelectThemeFamily={handleSelectThemeFamily}
            onSelectThemeMode={handleSelectThemeMode}
            onToggleTheme={handleToggleTheme}
            colorBlindMode={themeConfig.colorBlindMode || 'none'}
            onSelectColorBlindMode={handleSelectColorBlindMode}
            typographySettings={typographySettings}
            onSelectLineSpacing={handleSelectLineSpacing}
            onSelectWordSpacing={handleSelectWordSpacing}
            onSelectTextAlign={handleSelectTextAlign}
            onSelectPageWidth={handleSelectPageWidth}
          />
        )}

        {currentScreen === 'new-project' && (
          <NewProjectWizard
            onCancel={() => setCurrentScreen('projects')}
            onCreateProject={(newBundle) => {
              // Flush current project bundle
              const oldBundle: ProjectBundle = {
                project,
                chapters,
                scenes,
                entities,
                threads,
                events,
                continuityIssues,
                revisionPasses,
                cuttingRoom,
                notes,
                snapshots,
                aiAuditLogs,
                activeSceneId
              };
              safeSetItem(`threadline_project_data_${activeProjectId}`, JSON.stringify(oldBundle));

              const normalizedNewChapters = ensureChapters(newBundle.scenes, newBundle.chapters);
              const projectBundleToStore: ProjectBundle = {
                ...newBundle,
                chapters: normalizedNewChapters
              };

              // Register new project in state and bundle storage
              safeSetItem(`threadline_project_data_${newBundle.project.id}`, JSON.stringify(projectBundleToStore));

              setProjects((prev) => [...prev, newBundle.project]);
              setActiveProjectId(newBundle.project.id);
              setProject(newBundle.project);
              setChapters(normalizedNewChapters);
              setScenes(newBundle.scenes);
              setActiveSceneId(newBundle.activeSceneId || newBundle.scenes[0]?.id || 'scene-1');
              setEntities(newBundle.entities);
              setThreads(newBundle.threads);
              setEvents(newBundle.events);
              setContinuityIssues(newBundle.continuityIssues);
              setRevisionPasses(newBundle.revisionPasses);
              setCuttingRoom(newBundle.cuttingRoom);
              setNotes(newBundle.notes);
              setSnapshots(newBundle.snapshots);
              setAiAuditLogs(newBundle.aiAuditLogs);
              const isNewScreenplay = newBundle.project.type === 'Screenplay' || newBundle.project.type === 'Screenplay Experiment';
              setCurrentScreen(isNewScreenplay ? 'screenplay' : 'editor');
              showToast(`Created project with ${newBundle.scenes.length} framework beats: "${newBundle.project.title}"`);
            }}
          />
        )}
        {currentScreen === 'landing' && (
          <LandingPage
            onEnterStudio={(targetScreen = 'home') => setCurrentScreen(targetScreen)}
            onOpenSampleProject={(projId) => handleSwitchProject(projId, 'home')}
          />
        )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Command Palette (⌘K / Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        scenes={scenes}
        entities={entities}
        threads={threads}
        onNavigateToScreen={(screen) => setCurrentScreen(screen)}
        onNavigateToScene={(sceneId) => {
          setActiveSceneId(sceneId);
          setCurrentScreen(project.type === 'Screenplay' ? 'screenplay' : 'editor');
        }}
        onAddScene={handleAddScene}
        onOpenTour={() => setIsTourOpen(true)}
        onOpenQuickIdeation={() => setIsQuickIdeationOpen(true)}
        projectType={project.type === 'Screenplay' ? 'screenplay' : 'novel'}
      />

      {/* Quick Ideation Shortcut Modal (⌘I / Ctrl+I) */}
      <QuickIdeationModal
        isOpen={isQuickIdeationOpen}
        onClose={() => setIsQuickIdeationOpen(false)}
        onSaveIdea={handleSaveQuickIdea}
        currentSceneTitle={activeScene?.title}
      />

      {/* Dedicated Local Project Folder / Vault Manager Modal */}
      <VaultManagerModal
        isOpen={isVaultModalOpen}
        onClose={() => setIsVaultModalOpen(false)}
        currentBundle={currentBundleForVault}
        onReloadBundleFromVault={handleReloadBundleFromVault}
        onVaultStatusChange={(info) => setVaultInfo(info)}
      />

      {/* 4. MOBILE BOTTOM NAVIGATION BAR (md:hidden) */}
      {!isFullScreenPage && (
        <>
          <nav
            id="mobile-bottom-navigation-bar"
            className="md:hidden fixed bottom-3 inset-x-3 z-40 bg-[#FAF6EE]/95 backdrop-blur-md border border-[rgba(34,30,24,0.16)] rounded-[14px] flex items-center justify-around h-14 px-1 select-none shadow-warm-lg"
          >
            <button
              id="mobile-nav-editor"
              onClick={() => {
                setShowMobileMoreSheet(false);
                setCurrentScreen(project.type === 'Screenplay' ? 'screenplay' : 'editor');
              }}
              className={`flex flex-col items-center justify-center flex-1 py-1 rounded-[5px] transition-colors cursor-pointer min-h-[44px] ${
                currentScreen === 'editor' || currentScreen === 'screenplay' ? 'text-[#B54B32]' : 'text-[#7A705F] hover:text-[#221E18]'
              }`}
            >
              {project.type === 'Screenplay' ? <Film size={18} /> : <FileText size={18} />}
              <span className="text-[10px] font-medium mt-0.5">{project.type === 'Screenplay' ? 'Script' : 'Write'}</span>
            </button>

            <button
              id="mobile-nav-corkboard"
              onClick={() => {
                setShowMobileMoreSheet(false);
                setCurrentScreen('dashboard');
              }}
              className={`flex flex-col items-center justify-center flex-1 py-1 rounded-[5px] transition-colors cursor-pointer min-h-[44px] ${
                currentScreen === 'dashboard' ? 'text-[#B54B32]' : 'text-[#7A705F] hover:text-[#221E18]'
              }`}
            >
              <Layers size={18} />
              <span className="text-[10px] font-medium mt-0.5">Corkboard</span>
            </button>

            <button
              id="mobile-nav-codex"
              onClick={() => {
                setShowMobileMoreSheet(false);
                setCurrentScreen('codex');
              }}
              className={`flex flex-col items-center justify-center flex-1 py-1 rounded-[5px] transition-colors cursor-pointer min-h-[44px] ${
                currentScreen === 'codex' || currentScreen === 'bible' ? 'text-[#B54B32]' : 'text-[#7A705F] hover:text-[#221E18]'
              }`}
            >
              <Compass size={18} />
              <span className="text-[10px] font-medium mt-0.5">Codex</span>
            </button>

            <button
              id="mobile-nav-continuity"
              onClick={() => {
                setShowMobileMoreSheet(false);
                setCurrentScreen('continuity');
              }}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 rounded-[5px] transition-colors cursor-pointer min-h-[44px] ${
                currentScreen === 'continuity' ? 'text-[#B54B32]' : 'text-[#7A705F] hover:text-[#221E18]'
              }`}
            >
              <Sparkles size={18} />
              <span className="text-[10px] font-medium mt-0.5">Continuity</span>
              {openContinuityCount > 0 && (
                <span className="absolute top-1 right-3 px-1.5 py-0.2 rounded-full bg-[#B54B32] text-[#FAF6EE] text-[9px] font-mono font-bold leading-none">
                  {openContinuityCount}
                </span>
              )}
            </button>

            <button
              id="mobile-nav-more"
              onClick={() => setShowMobileMoreSheet((prev) => !prev)}
              className={`flex flex-col items-center justify-center flex-1 py-1 rounded-[5px] transition-colors cursor-pointer min-h-[44px] ${
                showMobileMoreSheet ? 'text-[#B54B32]' : 'text-[#7A705F] hover:text-[#221E18]'
              }`}
            >
              <MoreHorizontal size={18} />
              <span className="text-[10px] font-medium mt-0.5">More</span>
            </button>
          </nav>

          {/* Mobile More Sheet */}
          {showMobileMoreSheet && (
            <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/40 backdrop-blur-xs animate-fade-in">
              <div
                className="fixed inset-0"
                onClick={() => setShowMobileMoreSheet(false)}
              />
              <div className="relative bg-[#FAF6EE] border-t border-[rgba(34,30,24,0.16)] rounded-t-[12px] p-5 pb-8 space-y-4 shadow-warm-modal z-10 animate-in slide-in-from-bottom duration-200">
                <div className="flex items-center justify-between border-b border-[rgba(34,30,24,0.1)] pb-3">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#7A705F]">
                    Threadline Workspace
                  </span>
                  <button
                    onClick={() => setShowMobileMoreSheet(false)}
                    className="p-1 text-[#7A705F] hover:text-[#221E18] rounded cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => {
                      setCurrentScreen('projects');
                      setShowMobileMoreSheet(false);
                    }}
                    className="flex items-center gap-2 p-2.5 rounded-[6px] border border-[rgba(34,30,24,0.12)] bg-[#F1EAD9] hover:bg-[#FAF6EE] text-[#221E18] text-left cursor-pointer"
                  >
                    <FolderKanban size={15} className="text-[#B54B32]" />
                    <span className="font-medium">Manuscripts</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentScreen('home');
                      setShowMobileMoreSheet(false);
                    }}
                    className="flex items-center gap-2 p-2.5 rounded-[6px] border border-[rgba(34,30,24,0.12)] bg-[#F1EAD9] hover:bg-[#FAF6EE] text-[#221E18] text-left cursor-pointer"
                  >
                    <BookOpen size={15} className="text-[#35505F]" />
                    <span className="font-medium">Overview</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentScreen('screenplay');
                      setShowMobileMoreSheet(false);
                    }}
                    className="flex items-center gap-2 p-2.5 rounded-[6px] border border-[rgba(34,30,24,0.12)] bg-[#F1EAD9] hover:bg-[#FAF6EE] text-[#221E18] text-left cursor-pointer"
                  >
                    <Film size={15} className="text-[#E05238]" />
                    <span className="font-medium">Screenplay</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentScreen('revisions');
                      setShowMobileMoreSheet(false);
                    }}
                    className="flex items-center gap-2 p-2.5 rounded-[6px] border border-[rgba(34,30,24,0.12)] bg-[#F1EAD9] hover:bg-[#FAF6EE] text-[#221E18] text-left cursor-pointer"
                  >
                    <Sliders size={15} className="text-[#7A705F]" />
                    <span className="font-medium">Snapshots</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentScreen('export');
                      setShowMobileMoreSheet(false);
                    }}
                    className="flex items-center gap-2 p-2.5 rounded-[6px] border border-[rgba(34,30,24,0.12)] bg-[#F1EAD9] hover:bg-[#FAF6EE] text-[#221E18] text-left cursor-pointer"
                  >
                    <Download size={15} className="text-[#7A705F]" />
                    <span className="font-medium">Export</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentScreen('settings');
                      setShowMobileMoreSheet(false);
                    }}
                    className="flex items-center gap-2 p-2.5 rounded-[6px] border border-[rgba(34,30,24,0.12)] bg-[#F1EAD9] hover:bg-[#FAF6EE] text-[#221E18] text-left cursor-pointer"
                  >
                    <Settings size={15} className="text-[#7A705F]" />
                    <span className="font-medium">Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsVaultModalOpen(true);
                      setShowMobileMoreSheet(false);
                    }}
                    className="flex items-center gap-2 p-2.5 rounded-[6px] border border-[rgba(34,30,24,0.12)] bg-[#F1EAD9] hover:bg-[#FAF6EE] text-[#221E18] text-left cursor-pointer"
                  >
                    <HardDrive size={15} className="text-[#221E18]" />
                    <span className="font-medium">Vault Storage</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-[rgba(34,30,24,0.1)] flex items-center justify-between">
                  <button
                    onClick={() => {
                      setIsTourOpen(true);
                      setShowMobileMoreSheet(false);
                    }}
                    className="text-xs text-[#B54B32] hover:underline font-medium cursor-pointer"
                  >
                    Take Studio Tour
                  </button>
                  <button
                    onClick={handleToggleTheme}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-[5px] border border-[rgba(34,30,24,0.12)] text-[#221E18] hover:bg-[#F1EAD9] cursor-pointer"
                  >
                    {theme === 'lamplight' ? <Sun size={13} /> : <Moon size={13} />}
                    <span>{theme === 'lamplight' ? 'Daylight Paper' : 'Lamplight'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* DIALOGUE: SWITCH FROM EDITOR TO AUTHOR MODE CONFIRMATION */}
      {showRoleSwitchModal && (
        <div
          id="role-switch-dialog-backdrop"
          className="fixed inset-0 bg-black/45 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCancelRoleSwitch();
          }}
        >
          <div
            id="role-switch-dialog-card"
            className="bg-[#FAF6EE] rounded-[8px] border border-[rgba(34,30,24,0.14)] shadow-warm-modal max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150 space-y-4"
          >
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-[6px] bg-[#F1EAD9] text-[#B54B32] border border-[rgba(34,30,24,0.1)] shrink-0">
                <Feather size={20} />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A705F] block mb-0.5">
                  Role Transition Required
                </span>
                <h3 className="text-base sm:text-lg font-serif font-bold text-[#221E18]">
                  Switch to Author Mode?
                </h3>
                <p className="text-xs text-[#5A5143] mt-1.5 leading-relaxed">
                  You are currently in <strong className="text-[#221E18]">Editor Mode</strong>. Continuing to write will switch your active role to <strong className="text-[#221E18]">Author Mode</strong> so you can draft and compose scenes directly in the manuscript canvas.
                </p>
              </div>
            </div>

            {/* Role comparison preview */}
            <div className="bg-[#F1EAD9]/70 rounded-[6px] border border-[rgba(34,30,24,0.1)] p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#7A705F]">Current Active Role:</span>
                <span className="font-mono text-[11px] font-semibold text-[#35505F] bg-[#FAF6EE] px-2 py-0.5 rounded border border-[rgba(34,30,24,0.08)]">
                  Editor (Review &amp; Line Edits)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#7A705F]">New Role upon Continuing:</span>
                <span className="font-mono text-[11px] font-semibold text-[#B54B32] bg-[#B54B32]/10 px-2 py-0.5 rounded border border-[#B54B32]/20">
                  Author (Drafting &amp; Composition)
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2 border-t border-[rgba(34,30,24,0.1)]">
              <button
                type="button"
                id="cancel-role-switch-btn"
                onClick={handleCancelRoleSwitch}
                className="px-3.5 py-2 rounded-[6px] text-xs font-medium text-[#7A705F] hover:text-[#221E18] hover:bg-[#F1EAD9] transition-colors cursor-pointer min-h-[38px] text-center"
              >
                Cancel
              </button>

              <button
                type="button"
                id="review-in-editor-btn"
                onClick={handleContinueInEditorReview}
                className="px-3.5 py-2 rounded-[6px] text-xs font-medium text-[#35505F] bg-[#F1EAD9] hover:bg-[#EAE4D6] border border-[rgba(34,30,24,0.12)] transition-colors cursor-pointer min-h-[38px] text-center"
                title="Open scene in Editor Review without changing role"
              >
                Open in Editor Review
              </button>

              <button
                type="button"
                id="confirm-role-switch-btn"
                onClick={handleConfirmRoleSwitchToAuthor}
                className="px-4 py-2 bg-[#B54B32] hover:bg-[#9E3E27] text-[#FAF6EE] rounded-[6px] text-xs font-bold transition-all shadow-warm-sm cursor-pointer min-h-[38px] flex items-center justify-center gap-1.5"
              >
                <span>Switch to Author &amp; Write</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* First-Time User Onboarding Studio Tour Modal */}
      <AppTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onNavigateToScreen={(screen) => setCurrentScreen(screen)}
      />
    </div>
  );
}
