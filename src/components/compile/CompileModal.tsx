import React, { useState, useMemo, useEffect } from 'react';
import { Project, Chapter, Scene } from '../../types';
import {
  FileText,
  Printer,
  Download,
  BookOpen,
  Settings2,
  CheckSquare,
  Square,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  Sliders,
  Eye,
  Film,
  Code,
  Loader2
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useToast } from '../Toast';
import {
  calculateBookLayout,
  BookPdfOptions,
  DEFAULT_BOOK_PDF_OPTIONS,
  TrimSize,
  BookFontChoice,
  SceneBreakOrnament
} from '../../services/pdf/bookTypesetter';
import { generateBookPdf } from '../../services/pdf/bookPdfGenerator';
import { BookLivePreview } from '../export/BookLivePreview';

export type CompilePreset =
  | 'standard-manuscript'
  | 'print-paperback'
  | 'ebook-html'
  | 'screenplay-standard'
  | 'plain-markdown';

interface CompileModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  chapters: Chapter[];
  scenes: Scene[];
}

export const CompileModal: React.FC<CompileModalProps> = ({
  isOpen,
  onClose,
  project,
  chapters,
  scenes
}) => {
  const { showToast } = useToast();

  // Preset
  const [selectedPreset, setSelectedPreset] = useState<CompilePreset>('print-paperback');

  // Included Scene IDs
  const [includedSceneIds, setIncludedSceneIds] = useState<Set<string>>(() => {
    return new Set(scenes.map((s) => s.id));
  });

  // Front & Back matter toggles
  const [includeTitlePage, setIncludeTitlePage] = useState(true);
  const [includeCopyright, setIncludeCopyright] = useState(true);
  const [includeDedication, setIncludeDedication] = useState(false);
  const [dedicationText, setDedicationText] = useState('For those who listen to the gears turning in the dark.');
  const [includeToc, setIncludeToc] = useState(true);

  // Formatting options
  const [authorName, setAuthorName] = useState(project.protagonist ? `Author of ${project.title}` : 'Threadline Author');
  const [authorContact, setAuthorContact] = useState('silas.vance@guild.press\nLondon & Prague');
  const [sceneSeparator, setSceneSeparator] = useState<'hash' | 'asterisk' | 'ornament' | 'blank'>('ornament');
  const [showSceneTitles, setShowSceneTitles] = useState(false);
  const [smartQuotes, setSmartQuotes] = useState(true);
  const [dropCaps, setDropCaps] = useState(true);
  const [pageSize, setPageSize] = useState<TrimSize>('trade');
  const [fontStyle, setFontStyle] = useState<BookFontChoice>('times');
  const [isCompiling, setIsCompiling] = useState(false);

  // Preview Page navigation for standard manuscript mode
  const [previewPage, setPreviewPage] = useState(1);

  // Filter scenes in order
  const compiledScenes = useMemo(() => {
    return scenes.filter((s) => includedSceneIds.has(s.id));
  }, [scenes, includedSceneIds]);

  const totalCompiledWords = useMemo(() => {
    return compiledScenes.reduce((sum, s) => sum + (s.wordCount || 0), 0);
  }, [compiledScenes]);

  // Typeset book model for print-paperback mode
  const typesetBook = useMemo(() => {
    const opts: Partial<BookPdfOptions> = {
      pageSize,
      fontStyle,
      authorName,
      includeCoverPage: includeTitlePage,
      includeCopyright,
      includeDedication,
      dedicationText,
      includeTableOfContents: includeToc,
      includeSceneTitles: showSceneTitles,
      dropCaps,
      smartQuotes,
      sceneBreakOrnament: sceneSeparator === 'asterisk' ? 'asterism' : sceneSeparator === 'ornament' ? 'diamond' : sceneSeparator === 'blank' ? 'blank' : 'line'
    };
    return calculateBookLayout(project, compiledScenes, chapters, opts);
  }, [
    project,
    compiledScenes,
    chapters,
    pageSize,
    fontStyle,
    authorName,
    includeTitlePage,
    includeCopyright,
    includeDedication,
    dedicationText,
    includeToc,
    showSceneTitles,
    dropCaps,
    smartQuotes,
    sceneSeparator
  ]);

  const sceneSeparatorChar = useMemo(() => {
    switch (sceneSeparator) {
      case 'hash': return '#';
      case 'asterisk': return '* * *';
      case 'ornament': return '✦   ✧   ✦';
      case 'blank': return '\n';
    }
  }, [sceneSeparator]);

  // Convert quotes to smart quotes if enabled
  const applySmartQuotes = (text: string) => {
    if (!smartQuotes) return text;
    return text
      .replace(/---/g, '—')
      .replace(/--/g, '—')
      .replace(/(^|[-\u2014\s(\["])'/g, '$1‘')
      .replace(/'/g, '’')
      .replace(/(^|[-\u2014\s(\["])"/g, '$1“')
      .replace(/"/g, '”');
  };

  // Generate paginated preview text for standard manuscript preview
  const previewPages = useMemo(() => {
    const pages: { title: string; content: string; headerText?: string; pageNum: number }[] = [];
    let pageNum = 1;

    if (compiledScenes.length === 0) {
      return [{
        title: 'Empty',
        content: 'No scenes selected for compilation.\n\nCheck at least one scene in the left contents tree.',
        pageNum: 1
      }];
    }

    // 1. Title Page
    if (includeTitlePage) {
      if (selectedPreset === 'standard-manuscript') {
        pages.push({
          title: 'Title Page',
          content: `${authorContact}\n\n\n\n\n\n\n\n\n\n\t\t\t\t\t${project.title.toUpperCase()}\n\n\t\t\t\t\tby ${authorName}\n\n\t\t\t\t\tApprox. ${totalCompiledWords.toLocaleString()} words`,
          pageNum: 1
        });
      } else {
        pages.push({
          title: 'Title Page',
          content: `\n\n\n\n\n\n\n\n${project.title.toUpperCase()}\n\n\n\n${authorName}\n\n\n\n\n\n\nThreadline Editions`,
          pageNum: 1
        });
      }
      pageNum++;
    }

    // 2. Copyright page
    if (includeCopyright && selectedPreset !== 'standard-manuscript') {
      pages.push({
        title: 'Copyright',
        content: `\n\n\n\n\n\nCopyright © ${new Date().getFullYear()} by ${authorName}\nAll rights reserved.\n\nFirst Edition\nTypeset in Threadline Manuscript Studio\n\nThis is a work of fiction. Names, characters, businesses, places, events and incidents either are the product of the author’s imagination or are used in a fictitious manner.`,
        pageNum: pageNum++
      });
    }

    // 3. Dedication
    if (includeDedication && selectedPreset !== 'standard-manuscript') {
      pages.push({
        title: 'Dedication',
        content: `\n\n\n\n\n\n\n\n${dedicationText}`,
        pageNum: pageNum++
      });
    }

    // 4. Scenes divided into pages (approx 280 words per page for preview)
    let currentAccum: string[] = [];
    let currentWordCount = 0;

    compiledScenes.forEach((scene, sIdx) => {
      const heading = showSceneTitles
        ? `\n\n## Chapter ${scene.chapterNumber || 1}: ${scene.title}\n\n`
        : `\n\n${sceneSeparatorChar}\n\n`;

      const text = applySmartQuotes(scene.proseContent || '');
      const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim());

      if (currentWordCount > 250) {
        pages.push({
          title: `Page ${pageNum}`,
          content: currentAccum.join('\n\n'),
          headerText: selectedPreset === 'standard-manuscript'
            ? `${authorName.split(' ').pop()?.toUpperCase()} / ${project.title.toUpperCase()} / ${pageNum}`
            : `${project.title}`,
          pageNum: pageNum++
        });
        currentAccum = [];
        currentWordCount = 0;
      }

      currentAccum.push(heading);

      paragraphs.forEach((p) => {
        const words = p.split(/\s+/).length;
        if (currentWordCount + words > 300 && currentAccum.length > 0) {
          pages.push({
            title: `Page ${pageNum}`,
            content: currentAccum.join('\n\n'),
            headerText: selectedPreset === 'standard-manuscript'
              ? `${authorName.split(' ').pop()?.toUpperCase()} / ${project.title.toUpperCase()} / ${pageNum}`
              : `${project.title}`,
            pageNum: pageNum++
          });
          currentAccum = [p];
          currentWordCount = words;
        } else {
          currentAccum.push(p);
          currentWordCount += words;
        }
      });

      if (sIdx < compiledScenes.length - 1) {
        currentAccum.push(`\n${sceneSeparatorChar}\n`);
      }
    });

    if (currentAccum.length > 0) {
      pages.push({
        title: `Page ${pageNum}`,
        content: currentAccum.join('\n\n'),
        headerText: selectedPreset === 'standard-manuscript'
          ? `${authorName.split(' ').pop()?.toUpperCase()} / ${project.title.toUpperCase()} / ${pageNum}`
          : `${project.title}`,
        pageNum: pageNum
      });
    }

    return pages;
  }, [
    compiledScenes,
    includeTitlePage,
    includeCopyright,
    includeDedication,
    dedicationText,
    selectedPreset,
    authorName,
    authorContact,
    totalCompiledWords,
    project.title,
    showSceneTitles,
    sceneSeparatorChar,
    smartQuotes
  ]);

  // Clamp previewPage when previewPages length changes
  useEffect(() => {
    if (previewPage > previewPages.length && previewPages.length > 0) {
      setPreviewPage(previewPages.length);
    }
  }, [previewPages.length, previewPage]);

  if (!isOpen) return null;

  // Toggle single scene
  const toggleScene = (id: string) => {
    const next = new Set(includedSceneIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setIncludedSceneIds(next);
  };

  // Toggle chapter (all scenes in chapter)
  const toggleChapter = (chapterId: string) => {
    const chapScenes = scenes.filter((s) => s.chapterId === chapterId);
    const allIncluded = chapScenes.every((s) => includedSceneIds.has(s.id));
    const next = new Set(includedSceneIds);

    if (allIncluded) {
      chapScenes.forEach((s) => next.delete(s.id));
    } else {
      chapScenes.forEach((s) => next.add(s.id));
    }
    setIncludedSceneIds(next);
  };

  const selectAllScenes = () => {
    setIncludedSceneIds(new Set(scenes.map((s) => s.id)));
  };

  const deselectAllScenes = () => {
    setIncludedSceneIds(new Set());
  };

  // Export handlers
  const handleExportText = () => {
    let fullDoc = '';
    if (includeTitlePage) {
      fullDoc += `${project.title.toUpperCase()}\nby ${authorName}\nApprox. ${totalCompiledWords.toLocaleString()} words\n\n---\n\n`;
    }
    compiledScenes.forEach((s, idx) => {
      if (showSceneTitles) {
        fullDoc += `## ${s.title}\n\n`;
      }
      fullDoc += applySmartQuotes(s.proseContent || '') + '\n\n';
      if (idx < compiledScenes.length - 1) {
        fullDoc += `${sceneSeparatorChar}\n\n`;
      }
    });

    const blob = new Blob([fullDoc], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.toLowerCase().replace(/\s+/g, '-')}-compiled.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Compiled manuscript downloaded (.md)');
  };

  const handleExportPDF = async () => {
    try {
      setIsCompiling(true);
      if (selectedPreset === 'print-paperback') {
        showToast('Compiling print-ready typeset book PDF...');
        const doc = await generateBookPdf(project, compiledScenes, chapters, {
          pageSize,
          fontStyle,
          authorName,
          includeCoverPage: includeTitlePage,
          includeCopyright,
          includeDedication,
          dedicationText,
          includeTableOfContents: includeToc,
          includeSceneTitles: showSceneTitles,
          dropCaps,
          smartQuotes
        });
        doc.save(`${project.title.toLowerCase().replace(/\s+/g, '-')}-typeset.pdf`);
        showToast('Typeset Book PDF compiled successfully!');
      } else {
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'pt',
          format: 'letter'
        });

        previewPages.forEach((page, i) => {
          if (i > 0) doc.addPage();

          // Header slug
          if (page.headerText) {
            doc.setFont(selectedPreset === 'standard-manuscript' ? 'courier' : 'times', 'normal');
            doc.setFontSize(10);
            doc.text(page.headerText, 54, 36);
          }

          doc.setFont(
            selectedPreset === 'standard-manuscript' ? 'courier' : 'times',
            'normal'
          );
          doc.setFontSize(selectedPreset === 'standard-manuscript' ? 12 : 11);

          // Split text to fit page width (letter width 612pt - 2*54pt margins = 504pt)
          const lines = doc.splitTextToSize(page.content, 504);
          doc.text(lines, 54, 72);

          // Footer page number
          doc.setFontSize(10);
          doc.text(String(page.pageNum), 558, 750, { align: 'right' });
        });

        doc.save(`${project.title.toLowerCase().replace(/\s+/g, '-')}-manuscript.pdf`);
        showToast('PDF Manuscript generated successfully');
      }
    } catch (err) {
      console.error('PDF generation error:', err);
      showToast('Failed to compile PDF', 'error');
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-6xl h-[92vh] bg-[#FAF6EE] rounded-[10px] shadow-warm-modal border border-[rgba(34,30,24,0.14)] flex flex-col overflow-hidden text-[#221E18]">
        {/* HEADER */}
        <div className="px-6 py-3.5 border-b border-[rgba(34,30,24,0.12)] bg-[#F1EAD9] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[6px] bg-[#221E18] text-[#FAF6EE] flex items-center justify-center">
              <BookOpen size={16} />
            </div>
            <div>
              <h2 className="text-sm font-serif font-bold text-[#221E18]">
                Manuscript Compile Engine
              </h2>
              <p className="text-[11px] text-[#7A705F]">
                Holistic book typesetting, chapter selection, and print compilation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportText}
              className="px-3 py-1.5 text-xs bg-white border border-[rgba(34,30,24,0.14)] hover:bg-[#FAF6EE] text-[#221E18] rounded-[6px] font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Download size={13} />
              <span>Export Text (.md)</span>
            </button>

            <button
              onClick={handleExportPDF}
              disabled={isCompiling}
              className="px-3.5 py-1.5 text-xs bg-[#B54B32] hover:bg-[#9E3E27] text-[#FAF6EE] rounded-[6px] font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
            >
              {isCompiling ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Compiling PDF...</span>
                </>
              ) : (
                <>
                  <Printer size={13} />
                  <span>Compile &amp; Download PDF</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-[5px] text-[#7A705F] hover:text-[#221E18] hover:bg-[#E2D8C3] cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 3-COLUMN STUDIO LAYOUT */}
        <div className="flex-1 flex overflow-hidden">
          {/* COLUMN 1: PRESETS & CONTENTS TREE */}
          <div className="w-72 border-r border-[rgba(34,30,24,0.12)] bg-[#F8F4EC] flex flex-col shrink-0">
            {/* Presets Selector */}
            <div className="p-3 border-b border-[rgba(34,30,24,0.1)]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A705F] block mb-1.5 font-semibold">
                Format Presets
              </span>
              <div className="space-y-1 text-xs">
                {[
                  {
                    id: 'print-paperback' as CompilePreset,
                    label: 'Paperback / Book',
                    sub: 'Holistic typeset book layout with facing pages & drop caps',
                    icon: BookOpen
                  },
                  {
                    id: 'standard-manuscript' as CompilePreset,
                    label: 'Standard Manuscript',
                    sub: 'William Shunn format (Courier, 1" margins)',
                    icon: FileText
                  },
                  {
                    id: 'screenplay-standard' as CompilePreset,
                    label: 'Hollywood Script',
                    sub: 'Standard screenplay element margins',
                    icon: Film
                  },
                  {
                    id: 'plain-markdown' as CompilePreset,
                    label: 'Clean Markdown',
                    sub: 'Raw text with clean separators',
                    icon: Code
                  }
                ].map((p) => {
                  const Icon = p.icon;
                  const isSelected = selectedPreset === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPreset(p.id)}
                      className={`w-full text-left p-2 rounded-[6px] transition-colors cursor-pointer border ${
                        isSelected
                          ? 'bg-white border-[#B54B32] shadow-2xs'
                          : 'border-transparent hover:bg-white/60 text-[#4A4031]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={14} className={isSelected ? 'text-[#B54B32]' : 'text-[#7A705F]'} />
                        <span className={`font-semibold ${isSelected ? 'text-[#221E18]' : ''}`}>
                          {p.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#7A705F] mt-0.5 ml-5">{p.sub}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contents Selector Header */}
            <div className="p-3 border-b border-[rgba(34,30,24,0.08)] bg-[#F1EAD9] flex items-center justify-between text-xs">
              <span className="font-mono text-[11px] uppercase font-bold text-[#7A705F]">
                Included Scenes ({compiledScenes.length}/{scenes.length})
              </span>
              <div className="flex items-center gap-1.5 text-[11px]">
                <button
                  onClick={selectAllScenes}
                  className="text-[#B54B32] hover:underline cursor-pointer"
                >
                  All
                </button>
                <span className="text-[#7A705F]">·</span>
                <button
                  onClick={deselectAllScenes}
                  className="text-[#7A705F] hover:underline cursor-pointer"
                >
                  None
                </button>
              </div>
            </div>

            {/* Content Tree */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {chapters.map((chap) => {
                const chapScenes = scenes.filter((s) => s.chapterId === chap.id);
                const allIncluded = chapScenes.every((s) => includedSceneIds.has(s.id));
                const someIncluded = chapScenes.some((s) => includedSceneIds.has(s.id));

                return (
                  <div key={chap.id} className="rounded-[6px] bg-white/70 border border-[rgba(34,30,24,0.08)] p-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <button
                        onClick={() => toggleChapter(chap.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#221E18] hover:text-[#B54B32] cursor-pointer"
                      >
                        {allIncluded ? (
                          <CheckSquare size={14} className="text-[#B54B32]" />
                        ) : someIncluded ? (
                          <div className="w-3.5 h-3.5 rounded bg-[#B54B32]/30 flex items-center justify-center">
                            <div className="w-2 h-0.5 bg-[#B54B32]" />
                          </div>
                        ) : (
                          <Square size={14} className="text-[#7A705F]" />
                        )}
                        <span>Ch. {chap.number}: {chap.title}</span>
                      </button>
                      <span className="text-[10px] font-mono text-[#7A705F]">
                        {chapScenes.reduce((sum, s) => sum + (s.wordCount || 0), 0)}w
                      </span>
                    </div>

                    <div className="pl-4 space-y-1">
                      {chapScenes.map((scene) => {
                        const isInc = includedSceneIds.has(scene.id);
                        return (
                          <label
                            key={scene.id}
                            className="flex items-center justify-between text-[11px] hover:bg-black/5 p-1 rounded cursor-pointer"
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <input
                                type="checkbox"
                                checked={isInc}
                                onChange={() => toggleScene(scene.id)}
                                className="rounded text-[#B54B32] accent-[#B54B32]"
                              />
                              <span className={`truncate ${isInc ? 'text-[#221E18]' : 'text-[#7A705F] line-through'}`}>
                                {scene.title}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-[#7A705F]">
                              {scene.wordCount || 0}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total Word Count Footer */}
            <div className="p-3 bg-[#F1EAD9] border-t border-[rgba(34,30,24,0.1)] flex items-center justify-between font-mono text-xs">
              <span className="text-[#7A705F]">Total Compiled:</span>
              <span className="font-bold text-[#221E18]">
                {totalCompiledWords.toLocaleString()} words
              </span>
            </div>
          </div>

          {/* COLUMN 2: FORMATTING & FRONT MATTER CONTROLS */}
          <div className="w-80 border-r border-[rgba(34,30,24,0.12)] bg-[#FAF6EE] p-5 overflow-y-auto shrink-0 space-y-5 text-xs">
            <div>
              <h3 className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#7A705F] mb-3">
                Typesetting &amp; Geometry
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#7A705F] mb-1">
                    Book Trim Size
                  </label>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value as TrimSize)}
                    className="w-full p-2 bg-[#F1EAD9] border border-[rgba(34,30,24,0.14)] rounded-[4px] text-[#221E18] text-xs focus:outline-none focus:border-[#B54B32]"
                  >
                    <option value="trade">US Trade 6&quot; × 9&quot; (Standard Novel)</option>
                    <option value="digest">Digest 5.5&quot; × 8.5&quot; (Literary)</option>
                    <option value="mass-market">Mass Market 4.25&quot; × 6.87&quot;</option>
                    <option value="a5">A5 International</option>
                    <option value="letter">US Letter 8.5&quot; × 11&quot;</option>
                    <option value="royal">Royal Octavo 6.14&quot; × 9.21&quot;</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#7A705F] mb-1">
                    Typeface
                  </label>
                  <select
                    value={fontStyle}
                    onChange={(e) => setFontStyle(e.target.value as BookFontChoice)}
                    className="w-full p-2 bg-[#F1EAD9] border border-[rgba(34,30,24,0.14)] rounded-[4px] text-[#221E18] text-xs focus:outline-none focus:border-[#B54B32]"
                  >
                    <option value="times">Literary Serif (Times / Garamond)</option>
                    <option value="helvetica">Modern Clean (Helvetica / Sans)</option>
                    <option value="courier">Submission Courier (Monospace)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#7A705F] mb-1">
                    Scene Break Ornament
                  </label>
                  <select
                    value={sceneSeparator}
                    onChange={(e) => setSceneSeparator(e.target.value as any)}
                    className="w-full p-2 bg-[#F1EAD9] border border-[rgba(34,30,24,0.14)] rounded-[4px] text-[#221E18] text-xs focus:outline-none focus:border-[#B54B32]"
                  >
                    <option value="ornament">Geometric Diamonds (✦   ✧   ✦)</option>
                    <option value="asterisk">Asterism (*   *   *)</option>
                    <option value="hash">Traditional Hash (#)</option>
                    <option value="blank">Blank Line Pause</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Front & Back Matter */}
            <div className="pt-3 border-t border-[rgba(34,30,24,0.1)]">
              <h3 className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#7A705F] mb-3">
                Front &amp; Back Matter
              </h3>

              <div className="space-y-2.5">
                <label className="flex items-center gap-2 cursor-pointer text-[#221E18]">
                  <input
                    type="checkbox"
                    checked={includeTitlePage}
                    onChange={(e) => setIncludeTitlePage(e.target.checked)}
                    className="rounded text-[#B54B32] accent-[#B54B32]"
                  />
                  <span>Include Title &amp; Cover Page</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-[#221E18]">
                  <input
                    type="checkbox"
                    checked={includeToc}
                    onChange={(e) => setIncludeToc(e.target.checked)}
                    className="rounded text-[#B54B32] accent-[#B54B32]"
                  />
                  <span>Include Table of Contents</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-[#221E18]">
                  <input
                    type="checkbox"
                    checked={includeCopyright}
                    onChange={(e) => setIncludeCopyright(e.target.checked)}
                    className="rounded text-[#B54B32] accent-[#B54B32]"
                  />
                  <span>Include Copyright / Colophon</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-[#221E18]">
                  <input
                    type="checkbox"
                    checked={includeDedication}
                    onChange={(e) => setIncludeDedication(e.target.checked)}
                    className="rounded text-[#B54B32] accent-[#B54B32]"
                  />
                  <span>Include Dedication</span>
                </label>

                {includeDedication && (
                  <textarea
                    rows={2}
                    value={dedicationText}
                    onChange={(e) => setDedicationText(e.target.value)}
                    className="w-full p-2 bg-[#F1EAD9] border border-[rgba(34,30,24,0.14)] rounded-[4px] text-[11px] text-[#221E18] focus:outline-none"
                    placeholder="Dedication text..."
                  />
                )}
              </div>
            </div>

            {/* Author Byline */}
            <div className="pt-3 border-t border-[rgba(34,30,24,0.1)]">
              <h3 className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#7A705F] mb-3">
                Author &amp; Byline Info
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#7A705F] mb-1">
                    Author Byline
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full p-2 bg-[#F1EAD9] border border-[rgba(34,30,24,0.14)] rounded-[4px] text-[#221E18] text-xs focus:outline-none focus:border-[#B54B32]"
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-[#221E18]">
                    <input
                      type="checkbox"
                      checked={dropCaps}
                      onChange={(e) => setDropCaps(e.target.checked)}
                      className="rounded text-[#B54B32] accent-[#B54B32]"
                    />
                    <span>Illuminated Drop Cap on chapter openings</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-[#221E18]">
                    <input
                      type="checkbox"
                      checked={showSceneTitles}
                      onChange={(e) => setShowSceneTitles(e.target.checked)}
                      className="rounded text-[#B54B32] accent-[#B54B32]"
                    />
                    <span>Include Scene Subheadings</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-[#221E18]">
                    <input
                      type="checkbox"
                      checked={smartQuotes}
                      onChange={(e) => setSmartQuotes(e.target.checked)}
                      className="rounded text-[#B54B32] accent-[#B54B32]"
                    />
                    <span>Smart Quotes (“ ” ‘ ’) &amp; Em-dashes (—)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 3: LIVE PAGINATED PREVIEW */}
          <div className="flex-1 bg-[#292523] flex flex-col overflow-hidden">
            {selectedPreset === 'print-paperback' ? (
              /* High-Fidelity Typeset Book Live Preview */
              <div className="flex-1 flex flex-col overflow-hidden">
                <BookLivePreview book={typesetBook} className="h-full rounded-none border-none" />
              </div>
            ) : (
              /* Standard Manuscript Sheet Preview */
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Page Nav Bar */}
                <div className="px-6 py-2 bg-[#1F1C1A] text-[#FAF6EE] flex items-center justify-between text-xs shrink-0 border-b border-stone-800">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-stone-400">PREVIEW:</span>
                    <span className="text-[#DE6346] font-bold">
                      {previewPages[previewPage - 1]?.title || `Page ${previewPage}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      disabled={previewPage <= 1}
                      onClick={() => setPreviewPage((p) => Math.max(1, p - 1))}
                      className="p-1 rounded bg-[#383431] hover:bg-[#4A4541] disabled:opacity-30 cursor-pointer text-stone-200"
                    >
                      <ChevronLeft size={14} />
                    </button>

                    <span className="font-mono text-xs text-stone-300">
                      {previewPage} of {previewPages.length || 1}
                    </span>

                    <button
                      disabled={previewPage >= previewPages.length}
                      onClick={() => setPreviewPage((p) => Math.min(previewPages.length, p + 1))}
                      className="p-1 rounded bg-[#383431] hover:bg-[#4A4541] disabled:opacity-30 cursor-pointer text-stone-200"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Simulated Paper Sheet */}
                <div className="flex-1 overflow-y-auto flex items-center justify-center p-6">
                  <div
                    className={`w-full max-w-[580px] min-h-[720px] bg-white shadow-2xl p-12 text-[#1C1917] flex flex-col justify-between border border-stone-300 relative transition-all ${
                      selectedPreset === 'standard-manuscript' || selectedPreset === 'screenplay-standard'
                        ? 'font-mono text-[13px] leading-[1.8]'
                        : 'font-serif text-[14px] leading-[1.7]'
                    }`}
                  >
                    {/* Header Slug */}
                    {previewPages[previewPage - 1]?.headerText && (
                      <div className="text-[11px] font-mono text-[#7A705F] border-b border-stone-200 pb-2 mb-6">
                        {previewPages[previewPage - 1]?.headerText}
                      </div>
                    )}

                    {/* Main Body */}
                    <div className="flex-1 whitespace-pre-wrap">
                      {previewPages[previewPage - 1]?.content || 'No content in this compiled segment.'}
                    </div>

                    {/* Footer Page Number */}
                    <div className="text-center font-mono text-xs text-[#7A705F] pt-6 border-t border-stone-100">
                      {previewPages[previewPage - 1]?.pageNum || previewPage}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
