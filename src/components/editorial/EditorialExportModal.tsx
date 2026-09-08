import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  FileText,
  Sliders,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { Scene, Project } from '../../types';
import { computeWordDiff } from '../../utils/editorialDiff';

interface EditorialExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  scenes: Scene[];
  activeScene: Scene;
}

export const EditorialExportModal: React.FC<EditorialExportModalProps> = ({
  isOpen,
  onClose,
  project,
  scenes = [],
  activeScene
}) => {
  const [exportScope, setExportScope] = useState<'active' | 'manuscript'>('active');
  const [exportFormat, setExportFormat] = useState<'clean' | 'annotated' | 'queries'>('clean');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const targetScenes = exportScope === 'active' ? [activeScene] : scenes;

  // Generate exported text
  const generateExportText = (): string => {
    if (exportFormat === 'queries') {
      let output = `# EDITORIAL QUERIES & MARGINALIA LOG\n**Manuscript:** ${project.title}\n\n`;
      targetScenes.forEach((sc) => {
        const queries = sc.editorialQueries || [];
        if (queries.length > 0) {
          output += `## ${sc.title}\n`;
          queries.forEach((q, idx) => {
            output += `### Query ${idx + 1}: ${q.category.toUpperCase()} (${q.severity}) ${q.resolved ? '[RESOLVED]' : '[OPEN]'}\n`;
            output += `> "${q.selectionExcerpt}"\n\n`;
            output += `**Editorial Note:** ${q.comment}\n`;
            if (q.authorReply) {
              output += `**Author Reply:** ${q.authorReply}\n`;
            }
            output += `\n---\n\n`;
          });
        }
      });
      return output;
    }

    if (exportFormat === 'annotated') {
      let output = `# ANNOTATED EDITORIAL DRAFT (TRACK CHANGES)\n**Manuscript:** ${project.title}\n\n`;
      targetScenes.forEach((sc) => {
        const baseline = sc.editorialBaseline || sc.proseContent || '';
        const edited = sc.editorialProseContent !== undefined ? sc.editorialProseContent : sc.proseContent || '';
        const diffTokens = computeWordDiff(baseline, edited);

        output += `## ${sc.title}\n\n`;
        diffTokens.forEach((t) => {
          if (t.type === 'insert') {
            output += `[+${t.value}+]`;
          } else if (t.type === 'delete') {
            output += `[-${t.value}-]`;
          } else {
            output += t.value;
          }
        });
        output += `\n\n---\n\n`;
      });
      return output;
    }

    // Clean edited prose
    let output = `# ${project.title}\n`;
    if (project.author) output += `**By ${project.author}**\n\n`;
    output += `_Polished Editorial Working Copy_\n\n---\n\n`;

    targetScenes.forEach((sc) => {
      const edited = sc.editorialProseContent !== undefined ? sc.editorialProseContent : sc.proseContent || '';
      output += `## ${sc.title}\n\n${edited}\n\n`;
    });

    return output;
  };

  const exportText = generateExportText();

  const handleCopy = () => {
    navigator.clipboard.writeText(exportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([exportText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const scopeLabel = exportScope === 'active' ? activeScene.title.toLowerCase().replace(/\s+/g, '_') : 'manuscript';
    link.download = `${project.title.toLowerCase().replace(/\s+/g, '_')}_${scopeLabel}_${exportFormat}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#FAF6EE] text-[#221E18] rounded-[10px] border border-[rgba(34,30,24,0.18)] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[rgba(34,30,24,0.12)] bg-[#F1EAD9] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[5px] bg-[#221E18] text-[#DE6346] flex items-center justify-center shadow-xs">
              <Download size={15} />
            </div>
            <div>
              <h2 className="font-serif font-bold text-sm text-[#221E18] leading-tight">
                Export Editorial Working Copy
              </h2>
              <p className="text-[11px] text-[#7A705F] font-sans">
                Exports the editorial working branch without mutating original project files
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#7A705F] hover:text-[#221E18] hover:bg-[#ECE5D6] rounded-[5px] transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs text-[#221E18]">
          {/* Controls: Scope & Format */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Scope */}
            <div className="bg-[#F3EDE0] border border-[rgba(34,30,24,0.1)] rounded-[8px] p-3 space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-[#7A705F] font-semibold">
                Export Scope
              </span>
              <div className="flex items-center gap-1 bg-[#FAF6EE] p-0.5 rounded-[5px] border border-[rgba(34,30,24,0.08)]">
                <button
                  onClick={() => setExportScope('active')}
                  className={`flex-1 py-1 text-xs rounded-[4px] font-medium transition-colors cursor-pointer ${
                    exportScope === 'active' ? 'bg-[#221E18] text-[#FAF6EE]' : 'text-[#7A705F] hover:text-[#221E18]'
                  }`}
                >
                  Active Scene Only
                </button>
                <button
                  onClick={() => setExportScope('manuscript')}
                  className={`flex-1 py-1 text-xs rounded-[4px] font-medium transition-colors cursor-pointer ${
                    exportScope === 'manuscript' ? 'bg-[#221E18] text-[#FAF6EE]' : 'text-[#7A705F] hover:text-[#221E18]'
                  }`}
                >
                  Full Manuscript ({scenes.length} Scenes)
                </button>
              </div>
            </div>

            {/* Format */}
            <div className="bg-[#F3EDE0] border border-[rgba(34,30,24,0.1)] rounded-[8px] p-3 space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-[#7A705F] font-semibold">
                Export Variety
              </span>
              <div className="flex items-center gap-1 bg-[#FAF6EE] p-0.5 rounded-[5px] border border-[rgba(34,30,24,0.08)]">
                <button
                  onClick={() => setExportFormat('clean')}
                  className={`flex-1 py-1 text-xs rounded-[4px] font-medium transition-colors cursor-pointer ${
                    exportFormat === 'clean' ? 'bg-[#221E18] text-[#FAF6EE]' : 'text-[#7A705F] hover:text-[#221E18]'
                  }`}
                >
                  Clean Prose
                </button>
                <button
                  onClick={() => setExportFormat('annotated')}
                  className={`flex-1 py-1 text-xs rounded-[4px] font-medium transition-colors cursor-pointer ${
                    exportFormat === 'annotated' ? 'bg-[#221E18] text-[#FAF6EE]' : 'text-[#7A705F] hover:text-[#221E18]'
                  }`}
                >
                  Track Changes
                </button>
                <button
                  onClick={() => setExportFormat('queries')}
                  className={`flex-1 py-1 text-xs rounded-[4px] font-medium transition-colors cursor-pointer ${
                    exportFormat === 'queries' ? 'bg-[#221E18] text-[#FAF6EE]' : 'text-[#7A705F] hover:text-[#221E18]'
                  }`}
                >
                  Query Sheet
                </button>
              </div>
            </div>
          </div>

          {/* Preview Box */}
          <div>
            <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#7A705F] mb-1.5 flex items-center justify-between">
              <span>Export Content Preview</span>
              <span className="text-[10px] text-[#9E9484]">Markdown format (.md)</span>
            </div>
            <pre className="bg-[#F5F0E4] border border-[rgba(34,30,24,0.12)] rounded-[8px] p-4 text-[11px] font-mono text-[#3E382E] leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-72 select-text">
              {exportText}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[rgba(34,30,24,0.12)] bg-[#F1EAD9] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-[#FAF6EE] hover:bg-[#ECE5D6] text-[#221E18] text-xs font-semibold rounded-[5px] border border-[rgba(34,30,24,0.14)] transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              {copied ? <Check size={13} className="text-[#3A7D6E]" /> : <Copy size={13} />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy All'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-[#7A705F] hover:text-[#221E18] rounded-[5px] hover:bg-[#ECE5D6] cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-1.5 bg-[#B54B32] hover:bg-[#9E3E27] text-[#FAF6EE] text-xs font-semibold rounded-[5px] transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Download size={13} />
              <span>Download File (.md)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
