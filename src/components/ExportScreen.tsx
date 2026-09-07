import React, { useState } from 'react';
import { Project, Scene, Entity, Thread, Chapter } from '../types';
import { Download, Printer, FileText, Code, Check, Eye, BookOpen, Sparkles, BookCheck, Loader2 } from 'lucide-react';
import { ensureChapters, getScenesForChapter } from '../utils/chapterUtils';
import { generateBookPdf, BookPdfOptions, DEFAULT_BOOK_PDF_OPTIONS } from '../services/pdf/bookPdfGenerator';
import { useToast } from './Toast';

interface ExportScreenProps {
  project: Project;
  scenes: Scene[];
  chapters?: Chapter[];
  entities: Entity[];
  threads: Thread[];
}

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

  // PDF Book Customization Options
  const [pdfOptions, setPdfOptions] = useState<BookPdfOptions>({
    ...DEFAULT_BOOK_PDF_OPTIONS,
    authorName: project.protagonist ? `Author of ${project.title}` : ''
  });

  const effectiveChapters = ensureChapters(scenes, chapters);

  // Handle PDF Generation
  const handleDownloadBookPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      showToast('Compiling manuscript chapters into print PDF...');
      const doc = await generateBookPdf(project, scenes, chapters, pdfOptions);
      const safeFilename = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_book.pdf`;
      doc.save(safeFilename);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
      showToast('Book PDF generated and downloaded successfully!');
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 text-[#221E18]">
      <div className="mb-6 sm:mb-8">
        <span className="section-label block mb-1">
          Manuscript Output &amp; Typesetting
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif text-[#221E18] font-semibold">
          Export &amp; Print Manuscript
        </h2>
        <p className="text-[#7A705F] text-xs sm:text-sm mt-1">
          Export your story in universal, future-proof plain text formats structured with chapters, acts, and scene beats.
        </p>
      </div>

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
            Real typeset book layout with chapter pages, running headers, and table of contents.
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
            Pristine, unformatted standard typewriter manuscript chapter layout.
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

      {/* Book PDF Configuration Box */}
      {format === 'book-pdf' && (
        <div className="bg-[#FAF6EE] p-5 sm:p-6 rounded-[6px] border border-[#B54B32]/30 shadow-warm-sm mb-6 sm:mb-8 space-y-4">
          <div className="flex items-center justify-between border-b border-[rgba(34,30,24,0.1)] pb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#B54B32]" />
              <h3 className="font-serif font-bold text-sm text-[#221E18]">
                Typeset Book PDF Formatting
              </h3>
            </div>
            <span className="text-[10px] font-mono uppercase bg-[#F1EAD9] text-[#7A705F] px-2 py-0.5 rounded">
              Print-Ready Book Engine
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-[#7A705F] text-[11px] font-medium mb-1">
                Trim Size
              </label>
              <select
                value={pdfOptions.pageSize}
                onChange={(e) => setPdfOptions({ ...pdfOptions, pageSize: e.target.value as BookPdfOptions['pageSize'] })}
                className="w-full p-2 bg-[#F1EAD9] border border-[rgba(34,30,24,0.14)] rounded-[4px] text-[#221E18] text-xs focus:outline-none"
              >
                <option value="trade">US Trade (6&quot; × 9&quot; standard novel)</option>
                <option value="a5">A5 International (148 × 210 mm)</option>
                <option value="letter">US Letter (8.5&quot; × 11&quot; manuscript)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#7A705F] text-[11px] font-medium mb-1">
                Book Font Style
              </label>
              <select
                value={pdfOptions.fontStyle}
                onChange={(e) => setPdfOptions({ ...pdfOptions, fontStyle: e.target.value as BookPdfOptions['fontStyle'] })}
                className="w-full p-2 bg-[#F1EAD9] border border-[rgba(34,30,24,0.14)] rounded-[4px] text-[#221E18] text-xs focus:outline-none"
              >
                <option value="times">Literary Serif (Times New Roman style)</option>
                <option value="helvetica">Modern Clean (Helvetica style)</option>
                <option value="courier">Classic Typewriter (Courier style)</option>
              </select>
            </div>

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
          </div>

          <div className="flex flex-wrap gap-4 pt-1 text-xs text-[#221E18]">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={pdfOptions.includeCoverPage}
                onChange={(e) => setPdfOptions({ ...pdfOptions, includeCoverPage: e.target.checked })}
                className="rounded text-[#B54B32] accent-[#B54B32]"
              />
              <span>Include Half-Title &amp; Cover Page</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={pdfOptions.includeTableOfContents}
                onChange={(e) => setPdfOptions({ ...pdfOptions, includeTableOfContents: e.target.checked })}
                className="rounded text-[#B54B32] accent-[#B54B32]"
              />
              <span>Include Table of Contents</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={pdfOptions.includeSceneTitles}
                onChange={(e) => setPdfOptions({ ...pdfOptions, includeSceneTitles: e.target.checked })}
                className="rounded text-[#B54B32] accent-[#B54B32]"
              />
              <span>Include Scene Headings (uncheck for traditional novel flow)</span>
            </label>
          </div>

          <div className="pt-2 border-t border-[rgba(34,30,24,0.1)] flex items-center justify-between">
            <span className="text-[11px] text-[#7A705F]">
              Each chapter opens on a new page with running headers, ornament glyphs, and authentic page numbers.
            </span>
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
                  <span>Download Book PDF</span>
                </>
              )}
            </button>
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

      {/* Live Manuscript Preview */}
      <div className="bg-[#FAF6EE] rounded-[6px] border border-[rgba(34,30,24,0.12)] p-6 sm:p-8 shadow-warm-sm">
        <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-[rgba(34,30,24,0.12)]">
          <span className="text-[10px] uppercase font-bold text-[#7A705F] font-mono flex items-center gap-1.5">
            <Eye size={12} /> Live Preview Output ({effectiveChapters.length} Chapters)
          </span>
          <span className="text-xs text-[#7A705F] font-mono">
            {scenes.reduce((a, s) => a + s.wordCount, 0).toLocaleString()} words
          </span>
        </div>

        <div className="max-h-[500px] overflow-y-auto p-4 bg-[#F1EAD9]/50 rounded-[5px] border border-[rgba(34,30,24,0.08)]">
          {format === 'book-pdf' ? (
            <div className="space-y-6 max-w-lg mx-auto py-4">
              {/* Simulated Book Page */}
              <div className="bg-[#FAF6EE] p-8 rounded border border-[rgba(34,30,24,0.15)] shadow-warm-sm text-center font-serif">
                <div className="text-[10px] uppercase font-mono tracking-widest text-[#7A705F] mb-6">
                  [ Book Title Page Preview ]
                </div>
                <h1 className="text-xl font-bold uppercase tracking-wider text-[#221E18] mb-2">
                  {project.title}
                </h1>
                <div className="w-12 h-0.5 bg-[#B54B32] mx-auto mb-3" />
                <p className="text-xs italic text-[#7A705F] mb-4">
                  {project.type ? `A ${project.type}` : 'A Novel Manuscript'}
                </p>
                {pdfOptions.authorName && (
                  <p className="text-xs uppercase tracking-widest text-[#221E18] mt-6">
                    BY {pdfOptions.authorName}
                  </p>
                )}
              </div>

              {/* Simulated Chapter Page */}
              <div className="bg-[#FAF6EE] p-8 rounded border border-[rgba(34,30,24,0.15)] shadow-warm-sm font-serif">
                <div className="text-center mb-6">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#B54B32] mb-1">
                    C H A P T E R &nbsp; 1
                  </div>
                  <h2 className="text-base font-bold text-[#221E18]">
                    {effectiveChapters[0]?.title || 'Opening'}
                  </h2>
                  <div className="text-[#B54B32] text-xs mt-2">• &nbsp; ✦ &nbsp; •</div>
                </div>

                <div className="text-xs text-[#221E18] leading-relaxed text-justify space-y-3">
                  {getScenesForChapter(scenes, effectiveChapters[0])[0]?.proseContent ? (
                    <p className="indent-6">
                      {getScenesForChapter(scenes, effectiveChapters[0])[0].proseContent.slice(0, 450)}...
                    </p>
                  ) : (
                    <p className="text-[#7A705F] italic text-center">
                      (Prose content will flow seamlessly across pages with running headers and authentic page numbering)
                    </p>
                  )}
                </div>

                <div className="text-center text-[10px] font-mono text-[#7A705F] mt-8 pt-4 border-t border-[rgba(34,30,24,0.06)]">
                  — 1 —
                </div>
              </div>
            </div>
          ) : format === 'json' ? (
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
      </div>
    </div>
  );
};
