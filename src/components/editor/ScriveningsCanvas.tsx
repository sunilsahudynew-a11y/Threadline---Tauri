import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Scene, ScriveningsMode } from '../../types';
import {
  Layers,
  FileText,
  Bookmark,
  Maximize2,
  ChevronRight,
  ChevronDown,
  Check,
  Plus,
  Copy,
  BookOpen,
  Edit3,
  AlignLeft,
  ListOrdered,
  Eye,
  ArrowDownCircle,
  Hash,
  Sparkles
} from 'lucide-react';
import { EditorFontFamily, EditorFontSize } from './EditorFormatBar';

interface ScriveningsCanvasProps {
  activeSceneId: string;
  scenes: Scene[];
  fontFamily: EditorFontFamily;
  fontSize: EditorFontSize;
  scriveningsMode?: ScriveningsMode;
  onChangeScriveningsMode?: (mode: ScriveningsMode) => void;
  onUpdateScene: (sceneId: string, updatedFields: Partial<Scene>) => void;
  onFocusSingleScene: (sceneId: string) => void;
  onExitScrivenings: () => void;
  scopeTitle: string;
  onAddScene?: () => void;
}

export const ScriveningsCanvas: React.FC<ScriveningsCanvasProps> = ({
  activeSceneId,
  scenes,
  fontFamily: initialFontFamily,
  fontSize: initialFontSize,
  scriveningsMode = 'chapter',
  onChangeScriveningsMode,
  onUpdateScene,
  onFocusSingleScene,
  onExitScrivenings,
  scopeTitle,
  onAddScene
}) => {
  const [viewStyle, setViewStyle] = useState<'draft' | 'book'>('draft');
  const [showJumpRail, setShowJumpRail] = useState(true);
  const [fontFamily, setFontFamily] = useState<EditorFontFamily>(initialFontFamily);
  const [fontSize, setFontSize] = useState<EditorFontSize>(initialFontSize);
  const [copiedSceneId, setCopiedSceneId] = useState<string | null>(null);
  const [currentActiveSceneId, setCurrentActiveSceneId] = useState<string>(activeSceneId);

  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRefs = useRef<Map<string, HTMLTextAreaElement>>(new Map());

  const totalWords = scenes.reduce((acc, s) => acc + (s.wordCount || 0), 0);
  const estimatedReadMinutes = Math.max(1, Math.round(totalWords / 250));

  // Dynamic font and size styling
  const fontClass =
    fontFamily === 'sans'
      ? 'font-sans'
      : fontFamily === 'mono'
      ? 'font-mono'
      : 'font-serif';

  const sizeClass =
    fontSize === 'compact'
      ? 'text-sm leading-relaxed'
      : fontSize === 'large'
      ? 'text-lg leading-loose'
      : 'text-base leading-relaxed';

  // Helper to adjust textarea height automatically to prevent inner scrollbars
  const adjustHeight = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    const newHeight = Math.max(120, el.scrollHeight);
    el.style.height = `${newHeight}px`;
  }, []);

  // Recalculate heights for all textareas when scenes or typography change
  useEffect(() => {
    textareaRefs.current.forEach((el) => {
      adjustHeight(el);
    });
  }, [scenes, fontSize, fontFamily, viewStyle, adjustHeight]);

  // Smooth scroll to the active scene on mount
  useEffect(() => {
    if (activeSceneId) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`scrivenings-scene-${activeSceneId}`);
        if (el && containerRef.current) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [activeSceneId]);

  // Handle typing inside a scene's prose
  const handleProseChange = (sceneId: string, value: string, el: HTMLTextAreaElement) => {
    adjustHeight(el);
    const words = value.trim() ? value.trim().split(/\s+/).filter(Boolean).length : 0;
    onUpdateScene(sceneId, { proseContent: value, wordCount: words });
  };

  // Scroll to a specific scene from the Jump Rail
  const scrollToScene = (sceneId: string) => {
    setCurrentActiveSceneId(sceneId);
    const el = document.getElementById(`scrivenings-scene-${sceneId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Focus textarea if in draft view
      const textarea = textareaRefs.current.get(sceneId);
      if (textarea) {
        setTimeout(() => textarea.focus(), 300);
      }
    }
  };

  // Copy scene prose to clipboard
  const handleCopyProse = (scene: Scene) => {
    navigator.clipboard.writeText(scene.proseContent || '');
    setCopiedSceneId(scene.id);
    setTimeout(() => setCopiedSceneId(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#FAF8F5] text-[#221E18]">
      {/* CONTINUOUS VIEW HERO CONTROL BAR */}
      <header className="px-4 sm:px-6 py-2.5 bg-[#F4EFE6] border-b border-[rgba(34,30,24,0.1)] flex flex-wrap items-center justify-between gap-3 shrink-0 select-none shadow-2xs z-10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-[5px] bg-[#B54B32] text-white flex items-center justify-center shadow-xs shrink-0">
            <Layers size={13} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-serif font-bold text-[#221E18] truncate">
                {scopeTitle}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#E8DEC8] text-[#5A4F3E]">
                Continuous
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#7A705F] font-mono">
              <span>{scenes.length} {scenes.length === 1 ? 'scene' : 'scenes'}</span>
              <span>•</span>
              <span>{totalWords.toLocaleString()} words</span>
              <span>•</span>
              <span>~{estimatedReadMinutes} min read</span>
            </div>
          </div>
        </div>

        {/* Action Controls & Format Switchers */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Scope Switcher (Chapter vs All) */}
          {onChangeScriveningsMode && (
            <div className="flex items-center bg-[#EAE2D1] p-0.5 rounded-[6px] border border-[rgba(34,30,24,0.08)]">
              <button
                type="button"
                onClick={() => onChangeScriveningsMode('chapter')}
                className={`px-2 py-1 rounded-[4px] text-[11px] font-medium transition-colors cursor-pointer ${
                  scriveningsMode === 'chapter'
                    ? 'bg-white text-[#221E18] shadow-2xs font-semibold'
                    : 'text-[#6B6152] hover:text-[#221E18]'
                }`}
                title="Continuous View of Current Chapter"
              >
                Chapter
              </button>
              <button
                type="button"
                onClick={() => onChangeScriveningsMode('all')}
                className={`px-2 py-1 rounded-[4px] text-[11px] font-medium transition-colors cursor-pointer ${
                  scriveningsMode === 'all'
                    ? 'bg-white text-[#221E18] shadow-2xs font-semibold'
                    : 'text-[#6B6152] hover:text-[#221E18]'
                }`}
                title="Continuous View of Full Manuscript"
              >
                All Scenes
              </button>
            </div>
          )}

          {/* View Mode Toggle: Drafting vs Book Reading */}
          <div className="flex items-center bg-[#EAE2D1] p-0.5 rounded-[6px] border border-[rgba(34,30,24,0.08)]">
            <button
              type="button"
              onClick={() => setViewStyle('draft')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[11px] font-medium transition-colors cursor-pointer ${
                viewStyle === 'draft'
                  ? 'bg-white text-[#221E18] shadow-2xs font-semibold'
                  : 'text-[#6B6152] hover:text-[#221E18]'
              }`}
              title="Continuous Interactive Drafting Canvas"
            >
              <Edit3 size={11} className={viewStyle === 'draft' ? 'text-[#B54B32]' : ''} />
              <span>Drafting</span>
            </button>
            <button
              type="button"
              onClick={() => setViewStyle('book')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[11px] font-medium transition-colors cursor-pointer ${
                viewStyle === 'book'
                  ? 'bg-white text-[#221E18] shadow-2xs font-semibold'
                  : 'text-[#6B6152] hover:text-[#221E18]'
              }`}
              title="Clean Book Reading & Proofing Flow"
            >
              <BookOpen size={11} className={viewStyle === 'book' ? 'text-[#B54B32]' : ''} />
              <span>Book Read</span>
            </button>
          </div>

          {/* Typography Controls */}
          <div className="hidden lg:flex items-center gap-1 bg-[#EAE2D1] p-0.5 rounded-[6px] border border-[rgba(34,30,24,0.08)]">
            <button
              type="button"
              onClick={() => setFontFamily('serif')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-serif cursor-pointer ${
                fontFamily === 'serif' ? 'bg-white font-bold text-[#221E18] shadow-2xs' : 'text-[#7A705F]'
              }`}
              title="Serif Typography (Classical Book)"
            >
              Serif
            </button>
            <button
              type="button"
              onClick={() => setFontFamily('sans')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-sans cursor-pointer ${
                fontFamily === 'sans' ? 'bg-white font-bold text-[#221E18] shadow-2xs' : 'text-[#7A705F]'
              }`}
              title="Sans Typography (Modern Clean)"
            >
              Sans
            </button>
            <button
              type="button"
              onClick={() => setFontFamily('mono')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer ${
                fontFamily === 'mono' ? 'bg-white font-bold text-[#221E18] shadow-2xs' : 'text-[#7A705F]'
              }`}
              title="Mono Typography (Typewriter)"
            >
              Mono
            </button>
          </div>

          {/* Jump Rail Toggle Button */}
          <button
            type="button"
            onClick={() => setShowJumpRail(!showJumpRail)}
            className={`px-2.5 py-1 text-xs font-medium rounded-[5px] border cursor-pointer transition-colors flex items-center gap-1.5 ${
              showJumpRail
                ? 'bg-[#EAE2D1] text-[#221E18] border-[rgba(34,30,24,0.16)] font-semibold'
                : 'bg-white hover:bg-[#FAF6EE] text-[#6B6152] border-[rgba(34,30,24,0.12)]'
            }`}
            title="Toggle Continuous Scene Jump Rail"
          >
            <ListOrdered size={12} />
            <span className="hidden sm:inline">Jump Rail</span>
          </button>

          {/* Return to Single Scene Editor */}
          <button
            type="button"
            onClick={onExitScrivenings}
            className="px-3 py-1 text-xs font-semibold rounded-[5px] bg-[#221E18] hover:bg-black text-[#FAF6EE] cursor-pointer transition-all shadow-warm-xs"
          >
            Done
          </button>
        </div>
      </header>

      {/* WORKSPACE BODY: Jump Rail + Continuous Manuscript Canvas */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* SCENE JUMP RAIL / OUTLINE DOCK (Collapsible) */}
        {showJumpRail && (
          <aside className="w-64 border-r border-[rgba(34,30,24,0.08)] bg-[#F8F4EC] flex flex-col shrink-0 overflow-hidden select-none transition-all">
            <div className="px-3.5 py-2.5 border-b border-[rgba(34,30,24,0.06)] flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-[#7A705F]">
                Scenes in View ({scenes.length})
              </span>
              {onAddScene && (
                <button
                  type="button"
                  onClick={onAddScene}
                  className="p-1 hover:bg-[#ECE4D4] text-[#7A705F] hover:text-[#221E18] rounded cursor-pointer transition-colors"
                  title="Add new scene beat"
                >
                  <Plus size={13} />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {scenes.map((sc, idx) => {
                const isSelected = sc.id === currentActiveSceneId;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => scrollToScene(sc.id)}
                    className={`w-full flex items-start gap-2.5 px-2.5 py-2 rounded-[5px] text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white shadow-2xs text-[#221E18] font-medium border border-[rgba(34,30,24,0.08)]'
                        : 'text-[#6B6152] hover:text-[#221E18] hover:bg-[#EFE8D8]'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-[#EAE2D1] text-[#5C5346] text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {sc.order || idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-serif truncate leading-tight">
                        {sc.title}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#8C8271] mt-1">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            sc.status === 'complete'
                              ? 'bg-emerald-500'
                              : sc.status === 'revised'
                              ? 'bg-sky-500'
                              : 'bg-amber-400'
                          }`}
                        />
                        <span>{sc.wordCount || 0} words</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Jump Rail Bottom Footer */}
            <div className="p-2.5 border-t border-[rgba(34,30,24,0.06)] bg-[#F3ECE0] text-[11px] text-[#7A705F] flex items-center justify-between font-mono">
              <span>Total Word Count</span>
              <span className="font-bold text-[#221E18]">{totalWords.toLocaleString()}</span>
            </div>
          </aside>
        )}

        {/* CONTINUOUS MANUSCRIPT FLOW */}
        <main
          ref={containerRef}
          className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-12 py-8 space-y-10 scroll-smooth"
        >
          <div
            style={{ maxWidth: 'var(--editor-page-width, 720px)', width: '100%' }}
            className="manuscript-page-sheet min-w-0 mx-auto space-y-8"
          >
            {/* MANUSCRIPT INTRODUCTORY BANNER */}
            <div className="text-center pb-6 border-b border-[rgba(34,30,24,0.08)]">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#9E9484]">
                Continuous Stream
              </span>
              <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#221E18] mt-1">
                {scopeTitle}
              </h1>
              <p className="text-xs text-[#7A705F] mt-1 font-serif italic">
                A continuous, uninterrupted manuscript stream spanning {scenes.length} {scenes.length === 1 ? 'scene' : 'scenes'}.
              </p>
            </div>

            {/* SCENES CONTINUOUS RENDERING */}
            {scenes.map((sc, idx) => {
              const isActive = sc.id === currentActiveSceneId;

              return (
                <article
                  key={sc.id}
                  id={`scrivenings-scene-${sc.id}`}
                  onClick={() => setCurrentActiveSceneId(sc.id)}
                  className={`transition-all rounded-[8px] bg-white border border-[rgba(34,30,24,0.08)] shadow-warm-xs ${
                    isActive ? 'ring-1 ring-[#B54B32]/30 border-[#B54B32]/30' : ''
                  }`}
                >
                  {/* SCENE BANNER SLUG (Clean Literary Header) */}
                  <header className="flex items-center justify-between px-5 py-2.5 rounded-t-[7px] bg-[#F7F3EB] border-b border-[rgba(34,30,24,0.07)] select-none">
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="w-5 h-5 rounded-[4px] bg-[#221E18] text-[#FAF6EE] text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                        {sc.order || idx + 1}
                      </span>
                      <h2 className="font-serif font-bold text-sm text-[#221E18] truncate">
                        {sc.title}
                      </h2>

                      {/* Label Pill if defined */}
                      {sc.labelName && (
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-medium text-white shadow-2xs shrink-0"
                          style={{ backgroundColor: sc.labelColor || '#7A705F' }}
                        >
                          {sc.labelName}
                        </span>
                      )}

                      {/* Status Tint Pill */}
                      {sc.statusTint && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#FAF6EE] text-[#4A4031] border border-[rgba(34,30,24,0.1)] shrink-0">
                          {sc.statusTint}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-[11px] text-[#7A705F]">
                        {sc.wordCount || 0} words
                      </span>

                      {/* Copy Scene Prose Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyProse(sc);
                        }}
                        className="p-1 hover:bg-[#EAE2D1] rounded text-[#7A705F] hover:text-[#221E18] cursor-pointer transition-colors"
                        title="Copy scene prose to clipboard"
                      >
                        {copiedSceneId === sc.id ? (
                          <Check size={12} className="text-emerald-600" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>

                      {/* Focus Single Scene in Dedicated Editor */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFocusSingleScene(sc.id);
                        }}
                        className="px-2.5 py-1 text-[11px] font-medium rounded bg-white hover:bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] text-[#4A4031] hover:text-[#221E18] flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                        title="Focus on this single scene in standard editor"
                      >
                        <Maximize2 size={11} />
                        <span>Focus</span>
                      </button>
                    </div>
                  </header>

                  {/* SCENE BODY: Drafting mode (auto-growing textarea) vs Book Read Mode */}
                  <div className="p-6 sm:p-8">
                    {viewStyle === 'draft' ? (
                      <textarea
                        ref={(el) => {
                          if (el) {
                            textareaRefs.current.set(sc.id, el);
                            adjustHeight(el);
                          } else {
                            textareaRefs.current.delete(sc.id);
                          }
                        }}
                        value={sc.proseContent || ''}
                        onChange={(e) => handleProseChange(sc.id, e.target.value, e.target)}
                        onFocus={() => setCurrentActiveSceneId(sc.id)}
                        placeholder={`Drafting ${sc.title}... Start writing continuous prose here.`}
                        className={`w-full overflow-hidden resize-none border-none outline-none bg-transparent text-[#221E18] placeholder-[#7A705F]/40 transition-none break-words ${fontClass} ${sizeClass}`}
                        style={{
                          minHeight: '120px',
                          lineHeight: 'var(--editor-line-height, 1.75)',
                          wordSpacing: 'var(--editor-word-spacing, normal)',
                          textAlign: 'var(--editor-text-align, left)' as any,
                          hyphens: 'auto'
                        }}
                      />
                    ) : (
                      <div
                        className={`text-[#221E18] whitespace-pre-wrap selection:bg-[#EAE2D1] break-words ${fontClass} ${sizeClass}`}
                        style={{
                          lineHeight: 'var(--editor-line-height, 1.75)',
                          wordSpacing: 'var(--editor-word-spacing, normal)',
                          textAlign: 'var(--editor-text-align, left)' as any,
                          hyphens: 'auto'
                        }}
                        onDoubleClick={() => setViewStyle('draft')}
                        title="Double-click to edit prose"
                      >
                        {sc.proseContent ? (
                          sc.proseContent
                        ) : (
                          <p className="italic text-[#8C8271] text-sm">
                            [Empty scene beat. Double-click or switch to Drafting mode to begin writing.]
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* FOOTER METADATA BAR FOR SCENE */}
                  {sc.location || sc.pov || sc.time ? (
                    <footer className="px-6 py-2 bg-[#FAF8F5] border-t border-[rgba(34,30,24,0.05)] rounded-b-[7px] flex items-center gap-4 text-[11px] font-mono text-[#8C8271] select-none">
                      {sc.pov && <span>POV: {sc.pov}</span>}
                      {sc.location && <span>Setting: {sc.location}</span>}
                      {sc.time && <span>Time: {sc.time}</span>}
                    </footer>
                  ) : null}

                  {/* LITERARY SCENE BOUNDARY SEPARATOR (Refined, Non-Intrusive) */}
                  {idx < scenes.length - 1 && (
                    <div className="relative my-8 flex items-center justify-center group/sep select-none">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[rgba(34,30,24,0.12)]" />
                      </div>
                      <div className="relative bg-[#FAF8F5] px-4 flex items-center gap-2">
                        {onAddScene ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddScene();
                            }}
                            className="px-2.5 py-0.5 rounded-full bg-white hover:bg-[#F4EFE6] border border-[rgba(34,30,24,0.14)] text-[10px] font-mono text-[#7A705F] hover:text-[#221E18] flex items-center gap-1 cursor-pointer transition-all shadow-2xs group-hover/sep:scale-105"
                            title="Insert a new scene beat here"
                          >
                            <Plus size={10} className="text-[#B54B32]" />
                            <span>Insert Scene Beat</span>
                          </button>
                        ) : (
                          <span className="text-xs font-serif text-[#8C8271] tracking-widest">
                            * * *
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}

            {/* END OF MANUSCRIPT STREAM FOOTER */}
            <div className="pt-6 pb-12 text-center text-[#8C8271] select-none border-t border-[rgba(34,30,24,0.08)]">
              <span className="font-serif italic text-sm">
                End of {scopeTitle}
              </span>
              <div className="mt-2 text-xs font-mono text-[#A89D8B]">
                {totalWords.toLocaleString()} total words across {scenes.length} scenes
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
