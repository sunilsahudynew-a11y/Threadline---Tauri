import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FileText,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Layers,
  Sliders,
  Bookmark
} from 'lucide-react';
import { TypesetBookModel, TypesetPage, TypesetBlock } from '../../services/pdf/bookTypesetter';

interface BookLivePreviewProps {
  book: TypesetBookModel;
  className?: string;
}

export const BookLivePreview: React.FC<BookLivePreviewProps> = ({ book, className = '' }) => {
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [spreadMode, setSpreadMode] = useState<'spread' | 'single'>('spread');
  const [zoomLevel, setZoomLevel] = useState<number>(100); // 75, 100, 125
  const [paperTint, setPaperTint] = useState<'cream' | 'white' | 'antique'>(book.options.paperTint || 'cream');

  const totalPages = book.pages.length;

  // Ensure active page is within bounds when totalPages changes
  useEffect(() => {
    if (activePageIndex >= totalPages && totalPages > 0) {
      setActivePageIndex(totalPages - 1);
    }
  }, [totalPages, activePageIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePageIndex, spreadMode, totalPages]);

  // Turn to next page (advances 2 pages in spread mode if not on page 0)
  const goToNext = () => {
    if (spreadMode === 'spread') {
      // If we are on cover (page 0), next is pages 1 & 2
      if (activePageIndex === 0) {
        setActivePageIndex(Math.min(totalPages - 1, 1));
      } else {
        setActivePageIndex((prev) => Math.min(totalPages - 1, prev + 2));
      }
    } else {
      setActivePageIndex((prev) => Math.min(totalPages - 1, prev + 1));
    }
  };

  const goToPrev = () => {
    if (spreadMode === 'spread') {
      if (activePageIndex <= 2) {
        setActivePageIndex(0);
      } else {
        setActivePageIndex((prev) => Math.max(0, prev - 2));
      }
    } else {
      setActivePageIndex((prev) => Math.max(0, prev - 1));
    }
  };

  // Compute displayed pages for spread mode
  // Cover page (page 0) is displayed alone on the right (recto) side
  // Subsequent pages are paired: Left (even index) & Right (odd index)
  const { leftPage, rightPage } = useMemo(() => {
    if (spreadMode === 'single') {
      return { leftPage: undefined, rightPage: book.pages[activePageIndex] };
    }

    if (activePageIndex === 0) {
      return { leftPage: undefined, rightPage: book.pages[0] };
    }

    // Even page on left, odd on right
    const leftIdx = activePageIndex % 2 === 1 ? activePageIndex : activePageIndex - 1;
    const rightIdx = leftIdx + 1;

    return {
      leftPage: book.pages[leftIdx],
      rightPage: rightIdx < totalPages ? book.pages[rightIdx] : undefined
    };
  }, [activePageIndex, spreadMode, book.pages, totalPages]);

  // Jump to chapter
  const handleChapterJump = (targetPage: number) => {
    const idx = Math.max(0, Math.min(totalPages - 1, targetPage - 1));
    setActivePageIndex(idx);
  };

  // Paper background classes
  const paperBgClass =
    paperTint === 'cream'
      ? 'bg-[#FAF6EE] text-[#1C1917]'
      : paperTint === 'antique'
      ? 'bg-[#F5EEDB] text-[#241F1A]'
      : 'bg-white text-[#11100E]';

  // Typography font class
  const fontClass =
    book.options.fontStyle === 'courier'
      ? 'font-mono'
      : book.options.fontStyle === 'helvetica'
      ? 'font-sans'
      : 'font-serif';

  // Aspect ratio calculation from dimensions
  const aspectRatio = book.dimensions.heightPt / book.dimensions.widthPt;

  return (
    <div className={`flex flex-col bg-[#383431] rounded-[8px] overflow-hidden shadow-warm-modal border border-stone-600/40 text-stone-200 ${className}`}>
      {/* TOOLBAR CONTROLS */}
      <div className="px-4 py-2.5 bg-[#2B2725] border-b border-stone-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: View Mode & Chapter Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#1F1C1A] p-0.5 rounded-[5px] border border-stone-700/50">
            <button
              type="button"
              onClick={() => setSpreadMode('spread')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                spreadMode === 'spread'
                  ? 'bg-[#3D3835] text-stone-100 shadow-2xs font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Two-page book spread (verso / recto facing pages)"
            >
              <BookOpen size={12} className="text-[#DE6346]" />
              <span className="hidden sm:inline">Book Spread</span>
              <span className="sm:hidden">Spread</span>
            </button>
            <button
              type="button"
              onClick={() => setSpreadMode('single')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                spreadMode === 'single'
                  ? 'bg-[#3D3835] text-stone-100 shadow-2xs font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Single page inspection view"
            >
              <FileText size={12} />
              <span>Single</span>
            </button>
          </div>

          {/* Quick Chapter Jump */}
          {book.tocEntries.length > 0 && (
            <select
              value={book.pages[activePageIndex]?.chapterNumber || ''}
              onChange={(e) => {
                const chapNum = Number(e.target.value);
                const entry = book.tocEntries.find((t) => t.number === chapNum);
                if (entry) handleChapterJump(entry.page);
              }}
              className="px-2 py-1 bg-[#1F1C1A] border border-stone-700/50 rounded-[5px] text-stone-300 text-[11px] cursor-pointer focus:outline-none"
            >
              <option value="">Jump to Chapter...</option>
              {book.options.includeCoverPage && <option value="cover">Title Page</option>}
              {book.options.includeTableOfContents && <option value="toc">Contents (TOC)</option>}
              {book.tocEntries.map((c) => (
                <option key={c.number} value={c.number}>
                  Ch. {c.number}: {c.title.slice(0, 24)} (p. {c.page})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Center: Pagination & Turner */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={activePageIndex <= 0}
            onClick={goToPrev}
            className="p-1 rounded bg-[#1F1C1A] hover:bg-[#3D3835] disabled:opacity-30 text-stone-200 cursor-pointer disabled:cursor-not-allowed border border-stone-700/40"
            title="Previous page (Left arrow)"
          >
            <ChevronLeft size={15} />
          </button>

          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="text-stone-400">Page</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={activePageIndex + 1}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) {
                  setActivePageIndex(Math.max(0, Math.min(totalPages - 1, val - 1)));
                }
              }}
              className="w-11 text-center bg-[#1F1C1A] border border-stone-700/50 rounded py-0.5 text-stone-100 font-bold focus:outline-none focus:border-[#DE6346]"
            />
            <span className="text-stone-400">of {totalPages || 1}</span>
          </div>

          <button
            type="button"
            disabled={activePageIndex >= totalPages - 1}
            onClick={goToNext}
            className="p-1 rounded bg-[#1F1C1A] hover:bg-[#3D3835] disabled:opacity-30 text-stone-200 cursor-pointer disabled:cursor-not-allowed border border-stone-700/40"
            title="Next page (Right arrow)"
          >
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Right: Paper Tint & Zoom Controls */}
        <div className="flex items-center gap-2.5">
          {/* Paper Tint selector */}
          <div className="flex items-center gap-1 text-[11px] text-stone-400">
            <span className="hidden md:inline">Paper:</span>
            <div className="flex items-center gap-1 bg-[#1F1C1A] p-0.5 rounded-[5px] border border-stone-700/50">
              <button
                type="button"
                onClick={() => setPaperTint('cream')}
                className={`w-4 h-4 rounded-full bg-[#FAF6EE] border transition-transform cursor-pointer ${
                  paperTint === 'cream' ? 'border-[#DE6346] scale-110 shadow-2xs' : 'border-stone-400/40 opacity-70'
                }`}
                title="Archival Book Cream"
              />
              <button
                type="button"
                onClick={() => setPaperTint('antique')}
                className={`w-4 h-4 rounded-full bg-[#F5EEDB] border transition-transform cursor-pointer ${
                  paperTint === 'antique' ? 'border-[#DE6346] scale-110 shadow-2xs' : 'border-stone-400/40 opacity-70'
                }`}
                title="Soft Antique Linen"
              />
              <button
                type="button"
                onClick={() => setPaperTint('white')}
                className={`w-4 h-4 rounded-full bg-white border transition-transform cursor-pointer ${
                  paperTint === 'white' ? 'border-[#DE6346] scale-110 shadow-2xs' : 'border-stone-400/40 opacity-70'
                }`}
                title="Crisp White"
              />
            </div>
          </div>

          {/* Zoom Level */}
          <div className="flex items-center gap-1 bg-[#1F1C1A] p-0.5 rounded-[5px] border border-stone-700/50">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(75, z - 25))}
              className="p-1 hover:text-white text-stone-400 cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut size={12} />
            </button>
            <span className="text-[10px] font-mono px-1 text-stone-300">{zoomLevel}%</span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(150, z + 25))}
              className="p-1 hover:text-white text-stone-400 cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* STAGE: SIMULATED BOOK SPREAD / PAGE VIEW */}
      <div className="flex-1 min-h-[560px] max-h-[720px] overflow-auto p-4 sm:p-8 flex items-center justify-center bg-[#24201E] relative select-none">
        {/* Zoom Transform Wrapper */}
        <div
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
          className="transition-transform duration-150 flex items-center justify-center"
        >
          {spreadMode === 'spread' ? (
            /* TWO-PAGE SPREAD VIEW */
            <div className="flex items-stretch shadow-2xl rounded-[4px] overflow-hidden border border-black/40 relative">
              {/* Left Page (Verso) */}
              {leftPage ? (
                <RenderBookPage
                  page={leftPage}
                  paperBgClass={paperBgClass}
                  fontClass={fontClass}
                  options={book.options}
                  isVerso={true}
                />
              ) : (
                /* Blank / Inside Cover Placeholder when on Page 1 */
                <div className="w-[340px] sm:w-[410px] min-h-[580px] bg-[#1C1816] flex flex-col items-center justify-center text-stone-600 p-8 border-r border-black/50">
                  <Bookmark size={24} className="opacity-30 mb-2" />
                  <span className="text-[11px] font-mono uppercase tracking-widest opacity-40">
                    [ Inside Front Cover ]
                  </span>
                </div>
              )}

              {/* Central Spine Fold Shadow Effect */}
              <div className="w-6 pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 z-10 bg-gradient-to-r from-black/25 via-black/10 to-black/25 shadow-inner" />

              {/* Right Page (Recto) */}
              {rightPage ? (
                <RenderBookPage
                  page={rightPage}
                  paperBgClass={paperBgClass}
                  fontClass={fontClass}
                  options={book.options}
                  isVerso={false}
                />
              ) : (
                /* Blank / End of Book */
                <div className="w-[340px] sm:w-[410px] min-h-[580px] bg-[#1C1816] flex flex-col items-center justify-center text-stone-600 p-8 border-l border-black/50">
                  <span className="text-[11px] font-mono uppercase tracking-widest opacity-40">
                    [ End of Manuscript ]
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* SINGLE PAGE VIEW */
            <div className="shadow-2xl rounded-[4px] overflow-hidden border border-black/40">
              {rightPage && (
                <RenderBookPage
                  page={rightPage}
                  paperBgClass={paperBgClass}
                  fontClass={fontClass}
                  options={book.options}
                  isVerso={rightPage.isVerso}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER METRICS STRIP */}
      <div className="px-5 py-2 bg-[#2B2725] border-t border-stone-700/60 flex flex-wrap items-center justify-between text-xs text-stone-400">
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span>
            Trim: <strong className="text-stone-200 capitalize">{book.options.pageSize}</strong>
          </span>
          <span>•</span>
          <span>
            Total: <strong className="text-stone-200">{book.stats.totalPages} pages</strong>
          </span>
          <span>•</span>
          <span>
            Words: <strong className="text-stone-200">{book.stats.totalWords.toLocaleString()}</strong>
          </span>
          <span>•</span>
          <span>
            Chapters: <strong className="text-stone-200">{book.stats.totalChapters}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-stone-400">
            Use <kbd className="px-1 py-0.5 bg-[#1F1C1A] border border-stone-700 rounded text-[10px]">←</kbd>{' '}
            <kbd className="px-1 py-0.5 bg-[#1F1C1A] border border-stone-700 rounded text-[10px]">→</kbd> to turn pages
          </span>
          <span className="text-[#DE6346] font-semibold">Live Typeset Preview</span>
        </div>
      </div>
    </div>
  );
};

// Internal Page Renderer
interface RenderBookPageProps {
  page: TypesetPage;
  paperBgClass: string;
  fontClass: string;
  options: TypesetBookModel['options'];
  isVerso: boolean;
}

const RenderBookPage: React.FC<RenderBookPageProps> = ({
  page,
  paperBgClass,
  fontClass,
  options,
  isVerso
}) => {
  const isCover = page.type === 'cover';
  const isCopyright = page.type === 'copyright';
  const isDedication = page.type === 'dedication';
  const isToc = page.type === 'toc';
  const isChapterOpener = page.type === 'chapter-opener';

  return (
    <div
      className={`w-[340px] sm:w-[410px] min-h-[580px] p-8 sm:p-10 flex flex-col justify-between relative transition-colors ${paperBgClass} ${fontClass} ${
        isVerso ? 'pr-9 pl-11' : 'pl-9 pr-11'
      }`}
    >
      {/* RUNNING HEADER */}
      <div className="h-6 flex flex-col justify-end text-[10px] font-serif italic text-stone-500 tracking-wider">
        {page.type === 'body' && page.headerText && options.runningHeaders !== 'none' && (
          <>
            <div className="text-center truncate uppercase tracking-widest">{page.headerText}</div>
            {options.headerDividerRule && <div className="w-full h-px bg-stone-300 mt-1" />}
          </>
        )}
      </div>

      {/* PAGE CONTENT BLOCKS */}
      <div className="flex-1 flex flex-col justify-start my-2">
        {page.blocks.map((block, bIdx) => (
          <RenderBlock key={bIdx} block={block} options={options} />
        ))}
      </div>

      {/* RUNNING FOOTER / PAGE NUMBER */}
      <div className="h-6 flex items-center justify-center text-[10px] font-mono text-stone-500">
        {options.pageNumberPlacement !== 'none' && !isCover && !isCopyright && (
          <span className={options.pageNumberPlacement === 'bottom-outer' ? (isVerso ? 'mr-auto' : 'ml-auto') : 'mx-auto'}>
            {options.pageNumberPlacement === 'bottom-outer' ? page.pageNumber : `— ${page.pageNumber} —`}
          </span>
        )}
      </div>
    </div>
  );
};

// Render Individual Typeset Block
const RenderBlock: React.FC<{ block: TypesetBlock; options: TypesetBookModel['options'] }> = ({
  block,
  options
}) => {
  switch (block.type) {
    case 'title-block':
      return (
        <div className="flex-1 flex flex-col items-center justify-between text-center py-6">
          <div />
          <div className="space-y-4 my-auto">
            <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-wider text-stone-900 leading-tight">
              {block.title}
            </h1>
            <div className="w-12 h-0.5 bg-[#B54B32] mx-auto my-2" />
            <p className="text-xs italic text-stone-600">{block.text || 'A Novel Manuscript'}</p>
            {block.author && (
              <p className="text-xs uppercase tracking-widest font-semibold text-stone-800 pt-6">
                BY {block.author.toUpperCase()}
              </p>
            )}
          </div>
          <div className="space-y-1 text-stone-500 text-[10px] uppercase tracking-widest">
            <div>{block.imprint || 'Threadline Press'}</div>
            <div>{block.year}</div>
          </div>
        </div>
      );

    case 'copyright-block':
      return (
        <div className="flex-1 flex flex-col justify-end text-[9px] text-stone-600 space-y-3 leading-relaxed pb-4">
          <p className="font-semibold text-stone-800">
            Published by {block.imprint || 'Threadline Press'}
          </p>
          <p>First Edition: {block.year || new Date().getFullYear()}</p>
          <p>Copyright © {block.year || new Date().getFullYear()} by {block.author}</p>
          <p>{block.text}</p>
          <p className="italic">
            This is a work of fiction. Names, characters, places, and incidents either are the product of the author’s imagination or are used fictitiously.
          </p>
          <p className="text-stone-400">Composed in Threadline Manuscript Studio.</p>
        </div>
      );

    case 'dedication-block':
      return (
        <div className="flex-1 flex items-center justify-center text-center px-4">
          <p className="font-serif italic text-sm text-stone-800 leading-loose">
            {block.text}
          </p>
        </div>
      );

    case 'toc-block':
      return (
        <div className="space-y-4 pt-4">
          <div className="text-center">
            <h2 className="text-sm font-bold uppercase tracking-widest text-stone-900">Contents</h2>
            <div className="text-[#DE6346] text-xs mt-1">✦</div>
          </div>
          <div className="space-y-2 pt-2 text-xs">
            {(block.tocItems || []).map((item) => (
              <div key={item.number} className="flex items-baseline justify-between gap-2 text-stone-800">
                <span className="truncate">
                  Chapter {item.number}: {item.title}
                </span>
                <span className="flex-1 border-b border-dotted border-stone-400 mx-1 mb-1" />
                <span className="font-mono text-[11px] text-[#B54B32] font-semibold">{item.page}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'chapter-heading':
      return (
        <div className="text-center mb-6 pt-4 space-y-1.5">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#B54B32] font-bold">
            C H A P T E R &nbsp; {block.numeralStr}
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
            {block.title}
          </h2>
          {block.actOrPhase && (
            <p className="text-[11px] italic text-stone-600">{block.actOrPhase}</p>
          )}
          {block.ornament && (
            <div className="text-[#B54B32] text-xs pt-1">{block.ornament}</div>
          )}
        </div>
      );

    case 'scene-heading':
      return (
        <div className="text-xs font-bold uppercase tracking-wider text-stone-800 my-2">
          {block.title}
        </div>
      );

    case 'ornament':
      return (
        <div className="text-center text-[#B54B32] text-xs my-3 select-none">
          {block.text || '*   *   *'}
        </div>
      );

    case 'paragraph': {
      const isIndented = !block.isFirstParagraph && options.firstLineIndent;
      const isJustified = options.textAlign === 'justified';

      return (
        <p
          className={`text-xs text-stone-900 mb-2.5 leading-relaxed ${
            isJustified ? 'text-justify' : 'text-left'
          } ${isIndented ? 'indent-5' : ''}`}
        >
          {block.dropCap && options.dropCaps ? (
            <span className="float-left text-3xl font-bold text-[#B54B32] leading-none pr-1.5 pt-0.5 font-serif select-none">
              {block.dropCap}
            </span>
          ) : null}
          {block.restOfFirstWord ? (
            <span className="font-semibold text-stone-900 uppercase text-[0.85em] tracking-wider pr-1">
              {block.restOfFirstWord}
            </span>
          ) : null}
          {(block.lines || [block.text]).join(' ')}
        </p>
      );
    }

    case 'acknowledgments-block':
      return (
        <div className="space-y-4 pt-4">
          <div className="text-center">
            <h2 className="text-sm font-bold uppercase tracking-widest text-stone-900">
              {block.title}
            </h2>
            <div className="text-[#DE6346] text-xs mt-1">✦</div>
          </div>
          <p className="text-xs text-stone-800 leading-relaxed text-justify">
            {block.text}
          </p>
        </div>
      );

    default:
      return null;
  }
};
