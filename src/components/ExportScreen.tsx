import React, { useState, useMemo } from 'react';
import { Project, Scene, Entity, Thread, Chapter } from '../types';
import {
  Download,
  Printer,
  FileText,
  Code,
  Check,
  Eye,
  BookOpen,
  Sparkles,
  BookCheck,
  Loader2,
  Sliders,
  Type,
  Layout,
  Bookmark,
  AlignLeft,
  ChevronDown
} from 'lucide-react';
import { ensureChapters, getScenesForChapter } from '../utils/chapterUtils';
import {
  generateBookPdf,
  BookPdfOptions,
  DEFAULT_BOOK_PDF_OPTIONS
} from '../services/pdf/bookPdfGenerator';
import {
  calculateBookLayout,
  TrimSize,
  BookFontChoice,
  SceneBreakOrnament,
  NumberingPlacement,
  RunningHeaderStyle,
  LineSpacingChoice,
  FontSizeChoice,
  MarginChoice
} from '../services/pdf/bookTypesetter';
import { BookLivePreview } from './export/BookLivePreview';
import { useToast } from './Toast';

interface ExportScreenProps {
  project: Project;
  scenes: Scene[];
  chapters?: Chapter[];
  entities: Entity[];
  threads: Thread[];
}

type SettingTab = 'geometry' | 'typography' | 'chapters' | 'matter' | 'headers';

export const ExportScreen: React.FC<ExportScreenProps> = ({
  project,
  scenes,
  chapters,
  entities,
  threads
}) => {
  const { showToast } = useToast();
  const [format, setFormat] = useState<'book-pdf' | 'markdown' | 'text' | 'json' | 'print'>('book-pdf');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Active settings category tab
  const [activeTab, setActiveTab] = useState<SettingTab>('geometry');

  // PDF Book Customization Options
  const [pdfOptions, setPdfOptions] = useState<BookPdfOptions>({
    ...DEFAULT_BOOK_PDF_OPTIONS,
    authorName: project.protagonist ? `Author of ${project.title}` : 'Threadline Author'
  });

  const effectiveChapters = ensureChapters(scenes, chapters);

  // Calculate live typeset book model for the preview
  const typesetBook = useMemo(() => {
    return calculateBookLayout(project, scenes, chapters, pdfOptions);
  }, [project, scenes, chapters, pdfOptions]);

  // Handle PDF Generation
  const handleDownloadBookPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      showToast('Compiling manuscript into print-ready typeset PDF...');
      const doc = await generateBookPdf(project, scenes, chapters, pdfOptions);
      const safeFilename = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_typeset_book.pdf`;
      doc.save(safeFilename);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
      showToast('Typeset Book PDF downloaded successfully!');
    } catch (err) {
      console.error('Failed to generate Book PDF:', err);
      showToast('Failed to compile Book PDF', 'error');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Generate Markdown
  const generateMarkdown = () => {
    let md = `# ${project.title}\n\n`;
    if (includeMetadata) {
      md += `*Format: ${project.type}*\n`;
      if (project.protagonist) md += `*Protagonist: ${project.protagonist}*\n`;
      if (project.genre) md += `*Genre: ${project.genre}*\n`;
      if (project.situation) md += `*Premise: ${project.situation}*\n`;
      md += `*Exported from Threadline on ${new Date().toLocaleDateString()}*\n\n---\n\n`;
    }

    effectiveChapters.forEach((chap) => {
      const chapScenes = getScenesForChapter(scenes, chap);
      md += `## Chapter ${chap.number}: ${chap.title}\n`;
      if (chap.actOrPhase) {
        md += `*${chap.actOrPhase}*\n`;
      }
      if (chap.description) {
        md += `> ${chap.description}\n`;
      }
      md += `\n`;

      chapScenes.forEach((s) => {
        md += `### ${s.title}\n\n`;
        if (includeMetadata && s.premise) {
          md += `> **Premise:** ${s.premise}\n`;
          if (s.pov || s.time || s.location) {
            md += `> **POV:** ${s.pov || 'Unset'} | **Time:** ${s.time || 'Unset'} | **Location:** ${s.location || 'Unset'}\n`;
          }
          md += `\n`;
        }
        md += `${s.proseContent}\n\n* * *\n\n`;
      });
    });

    return md;
  };

  // Generate Plain Text
  const generatePlainText = () => {
    let txt = `${project.title.toUpperCase()}\n`;
    txt += `=========================================\n\n`;

    effectiveChapters.forEach((chap) => {
      const chapScenes = getScenesForChapter(scenes, chap);
      txt += `\nCHAPTER ${chap.number}: ${chap.title.toUpperCase()}\n`;
      if (chap.actOrPhase) {
        txt += `[${chap.actOrPhase}]\n`;
      }
      txt += `=========================================\n\n`;

      chapScenes.forEach((s) => {
        txt += `${s.title.toUpperCase()}\n`;
        txt += `-----------------------------------------\n\n`;
        txt += `${s.proseContent}\n\n\n`;
      });
    });

    return txt;
  };

  // Generate JSON Archive
  const generateJSON = () => {
    const archive = {
      project,
      chapters: effectiveChapters,
      scenes,
      entities,
      threads,
      exportDate: new Date().toISOString(),
      version: '2.0'
    };
    return JSON.stringify(archive, null, 2);
  };

  // Download File trigger
  const handleDownload = () => {
    let content = '';
    let filename = `${project.title.toLowerCase().replace(/\s+/g, '_')}`;
    let mimeType = 'text/plain';

    if (format === 'markdown') {
      content = generateMarkdown();
      filename += '.md';
      mimeType = 'text/markdown';
    } else if (format === 'text') {
      content = generatePlainText();
      filename += '.txt';
      mimeType = 'text/plain';
    } else if (format === 'json') {
      content = generateJSON();
      filename += '_archive.json';
      mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 text-[#221E18]">
      {/* HEADER */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-serif text-[#221E18] font-semibold">
          Export &amp; Typeset Manuscript
        </h2>
        <p className="text-[#7A705F] text-xs sm:text-sm mt-1.5">
          Manuscript output &amp; typesetting: produce publication-ready typeset books with authentic trim sizes, drop caps, running headers, and dot-leader tables of contents.
        </p>
      </div>

      {/* FORMAT SELECTOR TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-6 sm:mb-8">
        <button
          type="button"
          onClick={() => setFormat('book-pdf')}
          className={`p-4 rounded-[6px] border text-left transition-all cursor-pointer min-h-[44px] ${
            format === 'book-pdf'
              ? 'border-[#B54B32] bg-[#FAF6EE] shadow-warm-sm ring-1 ring-[#B54B32]/20'
              : 'border-[rgba(34,30,24,0.12)] bg-[#F1EAD9]/40 hover:bg-[#F1EAD9]'
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <BookCheck size={16} className={format === 'book-pdf' ? 'text-[#B54B32]' : 'text-[#7A705F]'} />
            <span className="font-semibold text-xs text-[#221E18]">Book PDF (.pdf)</span>
          </div>
          <p className="text-[11px] text-[#7A705F] leading-snug">
            Holistic typeset book with facing pages, drop caps, and front matter.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setFormat('markdown')}
          className={`p-4 rounded-[6px] border text-left transition-all cursor-pointer min-h-[44px] ${
            format === 'markdown'
              ? 'border-[#B54B32] bg-[#FAF6EE] shadow-warm-sm ring-1 ring-[#B54B32]/20'
              : 'border-[rgba(34,30,24,0.12)] bg-[#F1EAD9]/40 hover:bg-[#F1EAD9]'
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <FileText size={16} className={format === 'markdown' ? 'text-[#B54B32]' : 'text-[#7A705F]'} />
            <span className="font-semibold text-xs text-[#221E18]">Markdown (.md)</span>
          </div>
          <p className="text-[11px] text-[#7A705F] leading-snug">
            Organized with Chapter headings, act indicators, and scene breaks.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setFormat('text')}
          className={`p-4 rounded-[6px] border text-left transition-all cursor-pointer min-h-[44px] ${
            format === 'text'
              ? 'border-[#B54B32] bg-[#FAF6EE] shadow-warm-sm ring-1 ring-[#B54B32]/20'
              : 'border-[rgba(34,30,24,0.12)] bg-[#F1EAD9]/40 hover:bg-[#F1EAD9]'
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <FileText size={16} className={format === 'text' ? 'text-[#B54B32]' : 'text-[#7A705F]'} />
            <span className="font-semibold text-xs text-[#221E18]">Plain Text (.txt)</span>
          </div>
          <p className="text-[11px] text-[#7A705F] leading-snug">
            Standard typewriter submission manuscript chapter layout.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setFormat('json')}
          className={`p-4 rounded-[6px] border text-left transition-all cursor-pointer min-h-[44px] ${
            format === 'json'
              ? 'border-[#B54B32] bg-[#FAF6EE] shadow-warm-sm ring-1 ring-[#B54B32]/20'
              : 'border-[rgba(34,30,24,0.12)] bg-[#F1EAD9]/40 hover:bg-[#F1EAD9]'
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Code size={16} className={format === 'json' ? 'text-[#B54B32]' : 'text-[#7A705F]'} />
            <span className="font-semibold text-xs text-[#221E18]">Full Archive (JSON)</span>
          </div>
          <p className="text-[11px] text-[#7A705F] leading-snug">
            Complete backup including chapters, scenes, bible canon, and threads.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setFormat('print')}
          className={`p-4 rounded-[6px] border text-left transition-all cursor-pointer min-h-[44px] ${
            format === 'print'
              ? 'border-[#B54B32] bg-[#FAF6EE] shadow-warm-sm ring-1 ring-[#B54B32]/20'
              : 'border-[rgba(34,30,24,0.12)] bg-[#F1EAD9]/40 hover:bg-[#F1EAD9]'
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Printer size={16} className={format === 'print' ? 'text-[#B54B32]' : 'text-[#7A705F]'} />
            <span className="font-semibold text-xs text-[#221E18]">Browser Print</span>
          </div>
          <p className="text-[11px] text-[#7A705F] leading-snug">
            Print proof view ready for physical printer or browser save dialog.
          </p>
        </button>
      </div>

      {/* HOLISTIC TYPESET BOOK CONFIGURATION SUITE */}
      {format === 'book-pdf' && (
        <div className="bg-[#FAF6EE] rounded-[8px] border border-[#B54B32]/30 shadow-warm-sm mb-6 sm:mb-8 overflow-hidden">
          {/* Top Bar */}
          <div className="px-5 sm:px-6 py-4 bg-[#F1EAD9] border-b border-[rgba(34,30,24,0.1)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Sparkles size={18} className="text-[#B54B32]" />
              <div>
                <h3 className="font-serif font-bold text-base text-[#221E18]">
                  Holistic Book Typesetting Studio
                </h3>
                <p className="text-[11px] text-[#7A705F]">
                  Configure book geometry, classical typography, drop caps, and front matter with instant live preview.
                </p>
              </div>
            </div>

            <button
              onClick={handleDownloadBookPdf}
              disabled={isGeneratingPdf}
              className="px-5 py-2.5 bg-[#B54B32] hover:bg-[#9E3E27] text-[#FAF6EE] rounded-[6px] text-xs font-semibold flex items-center gap-2 shadow-warm-sm transition-colors cursor-pointer min-h-[40px] disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Compiling Book PDF...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <Check size={15} className="text-[#FAF6EE]" />
                  <span>PDF Downloaded!</span>
                </>
              ) : (
                <>
                  <Download size={15} />
                  <span>Compile &amp; Download Book PDF</span>
                </>
              )}
            </button>
          </div>

          {/* Navigation Category Tabs */}
          <div className="px-5 sm:px-6 pt-3 border-b border-[rgba(34,30,24,0.1)] flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('geometry')}
              className={`px-3 py-2 rounded-t-[5px] font-medium border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'geometry'
                  ? 'border-[#B54B32] text-[#B54B32] font-semibold bg-[#FAF6EE]'
                  : 'border-transparent text-[#7A705F] hover:text-[#221E18]'
              }`}
            >
              <Layout size={13} />
              <span>Trim &amp; Geometry</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('typography')}
              className={`px-3 py-2 rounded-t-[5px] font-medium border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'typography'
                  ? 'border-[#B54B32] text-[#B54B32] font-semibold bg-[#FAF6EE]'
                  : 'border-transparent text-[#7A705F] hover:text-[#221E18]'
              }`}
            >
              <Type size={13} />
              <span>Typography &amp; Spacing</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('chapters')}
              className={`px-3 py-2 rounded-t-[5px] font-medium border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'chapters'
                  ? 'border-[#B54B32] text-[#B54B32] font-semibold bg-[#FAF6EE]'
                  : 'border-transparent text-[#7A705F] hover:text-[#221E18]'
              }`}
            >
              <BookOpen size={13} />
              <span>Chapters &amp; Ornaments</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('matter')}
              className={`px-3 py-2 rounded-t-[5px] font-medium border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'matter'
                  ? 'border-[#B54B32] text-[#B54B32] font-semibold bg-[#FAF6EE]'
                  : 'border-transparent text-[#7A705F] hover:text-[#221E18]'
              }`}
            >
              <Bookmark size={13} />
              <span>Front &amp; Back Matter</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('headers')}
              className={`px-3 py-2 rounded-t-[5px] font-medium border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'headers'
                  ? 'border-[#B54B32] text-[#B54B32] font-semibold bg-[#FAF6EE]'
                  : 'border-transparent text-[#7A705F] hover:text-[#221E18]'
              }`}
            >
              <Sliders size={13} />
              <span>Headers &amp; Pagination</span>
            </button>
          </div>

          {/* Active Tab Configuration Panels */}
          <div className="p-5 sm:p-6">
            {/* TAB 1: GEOMETRY & TRIM */}
            {activeTab === 'geometry' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
                <div>
                  <label className="block text-[#7A705F] text-[11px] font-medium mb-1.5">
                    Book Trim Size
                  </label>
                  <select
                    value={pdfOptions.pageSize}
                    onChange={(e) =>
                      setPdfOptions({ ...pdfOptions, pageSize: e.target.value as TrimSize })
                    }
                    className="w-full p-2 bg-[#F1EAD9] border border-[rgba(34,30,24,0.14)] rounded-[4px] text-[#221E18] text-xs focus:outline-none focus:border-[#B54B32]"
                  >
                    <option value="trade">US Trade 6&quot; × 9&quot; (Standard Fiction &amp; Non-Fiction)</option>
                    <option value="digest">Digest 5.5&quot; × 8.5&quot; (Literary Fiction &amp; Memoirs)</option>
                    <option value="mass-market">Mass Market 4.25&quot; × 6.87&quot; (Pocket Paperback)</option>
                    <option value="a5">A5 International (148 × 210 mm)</option>
                    <option value="letter">US Letter 8.5&quot; × 11&quot; (Manuscript &amp; Binder)</option>
                    <option value="royal">Royal Octavo 6.14&quot; × 9.21&quot; (Deluxe Hardcover)</option>
                  </select>
                  <p className="text-[10px] text-[#7A705F] mt-1">
                    Standardizes exact physical page aspect ratio and printable area.
                  </p>
                </div>

                <div>
                  <label className="block text-[#7A705F] text-[11px] font-medium mb-1.5">
                    Page Margins
                  </label>
                  <select
                    value={pdfOptions.marginSize}
                    onChange={(e) =>
                      setPdfOptions({ ...pdfOptions, marginSize: e.target.value as MarginChoice })
                    }
                    className="w-full p-2 bg-[#F1EAD9] border border-[rgba(34,30,24,0.14)] rounded-[4px] text-[#221E18] text-xs focus:outline-none focus:border-[#B54B32]"
                  >
                    <option value="compact">Compact Margins (0.50&quot; / 36pt — dense)</option>
                    <option value="standard">Standard Book Margins (0.65&quot; / 46pt — classical)</option>
                    <option value="generous">Generous Deluxe Margins (0.85&quot; / 58pt — airy)</option>
                  </select>
                  <p className="text-[10px] text-[#7A705F] mt-1">
                    Controls breathing room around prose text block.
                  </p>
                </div>

                <div>
                  <label className="block text-[#7A705F] text-[11px] font-medium mb-1.5">
                    Binding Spine Gutter
                  </label>
                  <div className="pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={pdfOptions.bindingGutter}
                        onChange={(e) =>
                          setPdfOptions({ ...pdfOptions, bindingGutter: e.target.checked })
                        }
                        className="rounded text-[#B54B32] accent-[#B54B32]"
                      />
                      <span className="text-xs text-[#221E18] font-medium">
                        Inside Gutter (+12pt shift for spine binding)
                      </span>
                    </label>
                    <p className="text-[10px] text-[#7A705F] mt-1.5">
                      Offsets recto pages right and verso pages left so bound paper doesn&apos;t hide words.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TYPOGRAPHY & SPACING */}
            {activeTab === 'typography' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[#7A705F] text-[11px] font-medium mb-1">
                      Typeface Family
                    </label>
                    <select
                      value={pdfOptions.fontStyle}
                      onChange={(e) =>
                        setPdfOptions({ ...pdfOptions, fontStyle: e.target.value as BookFontChoice })
                      }
                      className="w-full p-2 bg-[#F1EAD9] border border-[rgba(34,30,24,0.14)] rounded-[4px] text-[#221E18] text-xs focus:outline-none"
                    >
                      <option value="times">Literary Serif (Times / Garamond style)</option>
                      <option value="helvetica">Modern Clean (Helvetica / Sans style)</option>
                      <option value="courier">Standard Typewriter (Courier manuscript)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#7A705F] text-[11px] font-medium mb-1">
                      Body Font Size
                    </label>
                    <select
                      value={pdfOptions.fontSize}
                      onChange={(e) =>
                        setPdfOptions({ ...pdfOptions, fontSize: e.target.value as FontSizeChoice })
                      }
                      className="w-full p-2 bg-[#F1EAD9] border border-[rgba(34,30,24,0.14)] rounded-[4px] text-[#221E18] text-xs focus:outline-none"
                    >
                      <option value="compact">Compact (9.5pt body)</option>
                      <option value="standard">Standard Trade (10.5pt body)</option>
                      <option value="large">Comfortable (11.5pt body)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#7A705F] text-[11px] font-medium mb-1">
                      Line Leading / Spacing
                    </label>
                    <select
                      value={pdfOptions.lineSpacing}
                      onChange={(e) =>
                        setPdfOptions({ ...pdfOptions, lineSpacing: e.target.value as LineSpacingChoice })
                      }
                      className="w-full p-2 bg-[#F1EAD9] border border-[rgba(34,30,24,0.14)] rounded-[4px] text-[#221E18] text-xs focus:outline-none"
                    >
                      <option value="compact">Compact (1.25x leading)</option>
                      <option value="standard">Standard Book (1.50x leading)</option>
                      <option value="generous">Generous (1.75x leading)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-5 pt-2 border-t border-[rgba(34,30,24,0.08)]">
                  <div>
                    <label className="block text-[#7A705F] text-[11px] font-medium mb-1">
                      Text Alignment
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="textAlign"
                          checked={pdfOptions.textAlign === 'justified'}
                          onChange={() => setPdfOptions({ ...pdfOptions, textAlign: 'justified' })}
                          className="accent-[#B54B32]"
                        />
                        <span>Fully Justified (Book Standard)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer ml-3">
                        <input
                          type="radio"
                          name="textAlign"
                          checked={pdfOptions.textAlign === 'left'}
                          onChange={() => setPdfOptions({ ...pdfOptions, textAlign: 'left' })}
                          className="accent-[#B54B32]"
                        />
                        <span>Flush Left (Ragged Right)</span>
                      </label>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer select-none mt-4 sm:mt-0">
                    <input
                      type="checkbox"
                      checked={pdfOptions.firstLineIndent}
                      onChange={(e) =>
                        setPdfOptions({ ...pdfOptions, firstLineIndent: e.target.checked })
                      }
                      className="rounded text-[#B54B32] accent-[#B54B32]"
                    />
                    <span>First-Line Indent on paragraphs</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none mt-4 sm:mt-0">
                    <input
                      type="checkbox"
                      checked={pdfOptions.smartQuotes}
                      onChange={(e) =>
                        setPdfOptions({ ...pdfOptions, smartQuotes: e.target.checked })
                      }
                      className="rounded text-[#B54B32] accent-[#B54B32]"
                    />
                    <span>Smart curly quotes (“ ” ‘ ’) &amp; Em-dashes (—)</span>
                  </label>
                </div>
              </div>
            )}

            {/* TAB 3: CHAPTERS & ORNAMENTS */}
            {activeTab === 'chapters' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-[#7A705F] text-[11px] font-medium mb-1">
                    Chapter Numeral Format
                  </label>
                  <select
                    value={pdfOptions.numeralStyle}
                    onChange={(e) =>
                      setPdfOptions({
                        ...pdfOptions,
                        numeralStyle: e.target.value as BookPdfOptions['numeralStyle']
                      })
                    }
                    className="w-full p-2 bg-[#F1EAD9] border border-[rgba(34,30,24,0.14)] rounded-[4px] text-[#221E18] text-xs focus:outline-none"
                  >
                    <option value="words">Spelled Out (CHAPTER ONE, TWO...)</option>
                    <option value="roman">Roman Numerals (CHAPTER I, II, III...)</option>
                    <option value="arabic">Arabic Numbers (CHAPTER 1, 2, 3...)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#7A705F] text-[11px] font-medium mb-1">
                    Scene Break Ornament
                  </label>
                  <select
                    value={pdfOptions.sceneBreakOrnament}
                    onChange={(e) =>
                      setPdfOptions({
                        ...pdfOptions,
                        sceneBreakOrnament: e.target.value as SceneBreakOrnament
                      })
                    }
                    className="w-full p-2 bg-[#F1EAD9] border border-[rgba(34,30,24,0.14)] rounded-[4px] text-[#221E18] text-xs focus:outline-none"
                  >
                    <option value="asterism">Classic Asterism (*   *   *)</option>
                    <option value="fleuron">Literary Fleuron (❦)</option>
                    <option value="diamond">Geometric Diamonds (✦   ✧   ✦)</option>
                    <option value="line">Subtle Hair-rule (— — —)</option>
                    <option value="blank">Blank line spacing only</option>
                  </select>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={pdfOptions.dropCaps}
                      onChange={(e) =>
                        setPdfOptions({ ...pdfOptions, dropCaps: e.target.checked })
                      }
                      className="rounded text-[#B54B32] accent-[#B54B32]"
                    />
                    <span className="font-medium">Illuminated Drop Cap on chapter openings</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={pdfOptions.includeSceneTitles}
                      onChange={(e) =>
                        setPdfOptions({ ...pdfOptions, includeSceneTitles: e.target.checked })
                      }
                      className="rounded text-[#B54B32] accent-[#B54B32]"
                    />
                    <span>Include Scene Headings (uncheck for seamless fiction flow)</span>
                  </label>
                </div>
              </div>
            )}

            {/* TAB 4: FRONT & BACK MATTER */}
            {activeTab === 'matter' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[#7A705F] text-[11px] font-medium mb-1">
                      Author Byline
                    </label>
                    <input
                      type="text"
                      placeholder="Author Name"
                      value={pdfOptions.authorName || ''}
                      onChange={(e) => setPdfOptions({ ...pdfOptions, authorName: e.target.value })}
                      className="w-full p-2 bg-[#F1EAD9] border border-[rgba(34,30,24,0.14)] rounded-[4px] text-[#221E18] text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#7A705F] text-[11px] font-medium mb-1">
                      Imprint / Publisher Name
                    </label>
                    <input
                      type="text"
                      placeholder="Threadline Press"
                      value={pdfOptions.imprintName || ''}
                      onChange={(e) => setPdfOptions({ ...pdfOptions, imprintName: e.target.value })}
                      className="w-full p-2 bg-[#F1EAD9] border border-[rgba(34,30,24,0.14)] rounded-[4px] text-[#221E18] text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#7A705F] text-[11px] font-medium mb-1">
                      Publication Year
                    </label>
                    <input
                      type="text"
                      placeholder="2025"
                      value={pdfOptions.publicationYear || ''}
                      onChange={(e) =>
                        setPdfOptions({ ...pdfOptions, publicationYear: e.target.value })
                      }
                      className="w-full p-2 bg-[#F1EAD9] border border-[rgba(34,30,24,0.14)] rounded-[4px] text-[#221E18] text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[rgba(34,30,24,0.08)]">
                  {/* Front matter toggles */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={pdfOptions.includeCoverPage}
                        onChange={(e) =>
                          setPdfOptions({ ...pdfOptions, includeCoverPage: e.target.checked })
                        }
                        className="rounded text-[#B54B32] accent-[#B54B32]"
                      />
                      <span className="font-medium">Include Title &amp; Half-Title Page</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={pdfOptions.includeTableOfContents}
                        onChange={(e) =>
                          setPdfOptions({ ...pdfOptions, includeTableOfContents: e.target.checked })
                        }
                        className="rounded text-[#B54B32] accent-[#B54B32]"
                      />
                      <span className="font-medium">Include Table of Contents (with dot leaders)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={pdfOptions.includeCopyright}
                        onChange={(e) =>
                          setPdfOptions({ ...pdfOptions, includeCopyright: e.target.checked })
                        }
                        className="rounded text-[#B54B32] accent-[#B54B32]"
                      />
                      <span className="font-medium">Include Copyright / Colophon Page</span>
                    </label>
                  </div>

                  {/* Dedication and Back matter toggles */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={pdfOptions.includeDedication}
                        onChange={(e) =>
                          setPdfOptions({ ...pdfOptions, includeDedication: e.target.checked })
                        }
                        className="rounded text-[#B54B32] accent-[#B54B32]"
                      />
                      <span className="font-medium">Include Dedication / Epigraph</span>
                    </label>
                    {pdfOptions.includeDedication && (
                      <input
                        type="text"
                        value={pdfOptions.dedicationText || ''}
                        onChange={(e) =>
                          setPdfOptions({ ...pdfOptions, dedicationText: e.target.value })
                        }
                        placeholder="For all who build worlds out of quiet rooms."
                        className="w-full p-1.5 text-[11px] bg-[#F1EAD9] border border-[rgba(34,30,24,0.14)] rounded"
                      />
                    )}

                    <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                      <input
                        type="checkbox"
                        checked={pdfOptions.includeAcknowledgments}
                        onChange={(e) =>
                          setPdfOptions({ ...pdfOptions, includeAcknowledgments: e.target.checked })
                        }
                        className="rounded text-[#B54B32] accent-[#B54B32]"
                      />
                      <span className="font-medium">Include Back Matter Acknowledgments</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: HEADERS & NUMBERS */}
            {activeTab === 'headers' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-[#7A705F] text-[11px] font-medium mb-1">
                    Running Headers Style
                  </label>
                  <select
                    value={pdfOptions.runningHeaders}
                    onChange={(e) =>
                      setPdfOptions({
                        ...pdfOptions,
                        runningHeaders: e.target.value as RunningHeaderStyle
                      })
                    }
                    className="w-full p-2 bg-[#F1EAD9] border border-[rgba(34,30,24,0.14)] rounded-[4px] text-[#221E18] text-xs focus:outline-none"
                  >
                    <option value="alternating">Alternating Recto/Verso (Title on Left, Chapter on Right)</option>
                    <option value="author-title">Author (Left) &amp; Book Title (Right)</option>
                    <option value="chapter-only">Chapter Title Only (All Body Pages)</option>
                    <option value="none">No Running Headers</option>
                  </select>
                  <p className="text-[10px] text-[#7A705F] mt-1">
                    Headers are automatically suppressed on chapter opener pages per Chicago Manual of Style.
                  </p>
                </div>

                <div>
                  <label className="block text-[#7A705F] text-[11px] font-medium mb-1">
                    Page Number Placement
                  </label>
                  <select
                    value={pdfOptions.pageNumberPlacement}
                    onChange={(e) =>
                      setPdfOptions({
                        ...pdfOptions,
                        pageNumberPlacement: e.target.value as NumberingPlacement
                      })
                    }
                    className="w-full p-2 bg-[#F1EAD9] border border-[rgba(34,30,24,0.14)] rounded-[4px] text-[#221E18] text-xs focus:outline-none"
                  >
                    <option value="bottom-center">Bottom Center (— 12 —)</option>
                    <option value="bottom-outer">Bottom Outer (Mirroring Left/Right)</option>
                    <option value="top-outer">Top Outer (Alongside Header)</option>
                    <option value="none">No Page Numbers</option>
                  </select>
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={pdfOptions.headerDividerRule}
                      onChange={(e) =>
                        setPdfOptions({ ...pdfOptions, headerDividerRule: e.target.checked })
                      }
                      className="rounded text-[#B54B32] accent-[#B54B32]"
                    />
                    <span className="font-medium">Subtle hairline divider rule below headers</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Export Options & Actions for Other Formats */}
      {format !== 'book-pdf' && (
        <div className="bg-[#FAF6EE] p-5 sm:p-6 rounded-[6px] border border-[rgba(34,30,24,0.12)] shadow-warm-sm mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <label className="flex items-center gap-2.5 text-xs text-[#221E18] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeMetadata}
              onChange={(e) => setIncludeMetadata(e.target.checked)}
              className="rounded border-[rgba(34,30,24,0.2)] text-[#B54B32] focus:ring-0 accent-[#B54B32]"
            />
            <span className="font-medium">Include scene metadata (premise, POV, time) as editorial headers</span>
          </label>

          <div className="flex items-center gap-3">
            {format === 'print' ? (
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-[#221E18] hover:bg-black text-[#FAF6EE] rounded-[6px] text-xs font-semibold flex items-center gap-2 shadow-warm-sm transition-colors cursor-pointer min-h-[40px]"
              >
                <Printer size={14} />
                <span>Print / Save PDF</span>
              </button>
            ) : (
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-[#B54B32] hover:bg-[#9E3E27] text-[#FAF6EE] rounded-[6px] text-xs font-semibold flex items-center gap-2 shadow-warm-sm transition-colors cursor-pointer min-h-[40px]"
              >
                {downloadSuccess ? (
                  <>
                    <Check size={14} className="text-[#FAF6EE]" />
                    <span>File Downloaded</span>
                  </>
                ) : (
                  <>
                    <Download size={14} />
                    <span>Download {format.toUpperCase()}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* LIVE MANUSCRIPT & BOOK PREVIEW STAGE */}
      <div className="bg-[#FAF6EE] rounded-[8px] border border-[rgba(34,30,24,0.12)] p-4 sm:p-6 shadow-warm-sm">
        <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-[rgba(34,30,24,0.12)]">
          <span className="text-xs uppercase font-bold text-[#7A705F] font-mono flex items-center gap-2">
            <Eye size={14} className="text-[#B54B32]" />
            Live Preview Output ({effectiveChapters.length} Chapters · {scenes.length} Scenes)
          </span>
          <span className="text-xs text-[#7A705F] font-mono">
            Total Manuscript: {scenes.reduce((a, s) => a + (s.wordCount || 0), 0).toLocaleString()} words
          </span>
        </div>

        {format === 'book-pdf' ? (
          /* High-Fidelity Interactive Typeset Book Live Preview */
          <BookLivePreview book={typesetBook} />
        ) : (
          /* Plain Text, Markdown, or JSON Preview */
          <div className="max-h-[520px] overflow-y-auto p-4 bg-[#F1EAD9]/50 rounded-[5px] border border-[rgba(34,30,24,0.08)]">
            {format === 'json' ? (
              <pre className="text-[11px] font-mono text-[#221E18] whitespace-pre-wrap">
                {generateJSON()}
              </pre>
            ) : format === 'text' ? (
              <pre className="text-xs font-mono text-[#221E18] whitespace-pre-wrap leading-relaxed">
                {generatePlainText()}
              </pre>
            ) : (
              <div className="font-serif text-sm text-[#221E18] whitespace-pre-wrap leading-loose">
                {generateMarkdown()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
