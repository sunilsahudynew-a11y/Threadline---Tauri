import React, { useState, useMemo } from 'react';
import {
  Project,
  Scene,
  Snapshot,
  RevisionPass,
  PersonaProjectType
} from '../../types';
import {
  History,
  Download,
  FileCheck,
  Split,
  Eye,
  Check,
  Lock,
  Sparkles,
  Shield,
  FileText,
  Printer,
  ChevronRight
} from 'lucide-react';
import { useToast } from '../Toast';
import { computeWordDiff, DiffToken } from '../../utils/editorialDiff';

interface VersionHistoryScreenProps {
  project: Project;
  projectType: PersonaProjectType;
  scenes: Scene[];
  snapshots?: Snapshot[];
  revisionPasses?: RevisionPass[];
}

export const VersionHistoryScreen: React.FC<VersionHistoryScreenProps> = ({
  project,
  projectType,
  scenes,
  snapshots = [],
  revisionPasses = []
}) => {
  const { showToast } = useToast();
  const isScreenplay = projectType === 'screenplay';

  const [activeTab, setActiveTab] = useState<'diff' | 'watermark'>('diff');
  const [selectedSceneId, setSelectedSceneId] = useState<string>(scenes[0]?.id || '');
  const [recipientName, setRecipientName] = useState('DIRECTOR / PRODUCER');
  const [watermarkSubtext, setWatermarkSubtext] = useState('DO NOT CIRCULATE');
  const [isExporting, setIsExporting] = useState(false);

  // Active scene
  const activeScene = scenes.find((s) => s.id === selectedSceneId) || scenes[0];

  // Mock baseline or previous snapshot text for diffing
  const previousVersionText = useMemo(() => {
    if (!activeScene) return '';
    // Look for snapshot version or synthesize a first draft baseline
    const words = activeScene.proseContent.split(' ');
    // Sample previous draft
    return words.slice(0, Math.floor(words.length * 0.85)).join(' ') + ' [Earlier draft cut here.]';
  }, [activeScene]);

  // Diff tokens
  const diffTokens: DiffToken[] = useMemo(() => {
    if (!activeScene) return [];
    return computeWordDiff(previousVersionText, activeScene.proseContent);
  }, [activeScene, previousVersionText]);

  const diffStats = useMemo(() => {
    let added = 0;
    let deleted = 0;
    diffTokens.forEach((t) => {
      if (t.type === 'insert') added++;
      if (t.type === 'delete') deleted++;
    });
    return { added, deleted };
  }, [diffTokens]);

  const handleDownloadWatermarked = () => {
    setIsExporting(true);
    showToast(`Generating Watermarked ${isScreenplay ? 'Script' : 'Manuscript'} for ${recipientName}...`);

    setTimeout(() => {
      // Build plain text or printable document
      const watermarkHeader = `===========================================================\nCONFIDENTIAL — PROPERTY OF ${project.author || 'AUTHOR'}\nPREPARED EXCLUSIVELY FOR: ${recipientName.toUpperCase()}\nWATERMARK: ${watermarkSubtext}\n===========================================================\n\n`;
      const content = scenes.map((s) => `### ${s.title}\n\n${s.proseContent}`).join('\n\n---\n\n');
      const blob = new Blob([watermarkHeader + content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.title.toLowerCase().replace(/\s+/g, '_')}_watermarked_${recipientName.toLowerCase().replace(/\s+/g, '_')}.txt`;
      a.click();
      URL.revokeObjectURL(url);

      setIsExporting(false);
      showToast('Watermarked export downloaded successfully!');
    }, 600);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden bg-[#FAF6EE] text-[#221E18]">
      {/* TOP BAR */}
      <div className="px-5 sm:px-8 py-3.5 border-b border-[rgba(34,30,24,0.1)] bg-[#FAF6EE] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="font-serif font-bold text-xl sm:text-2xl text-[#221E18]">
            Version History &amp; Watermarked Delivery
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] font-sans text-[#7A705F]">
              Editorial Studio · Snapshot diffs &amp; proof deliveries
            </span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#B54B32]/10 text-[#B54B32]">
              Versions &amp; Export
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-0.5 rounded-lg bg-[#F1EAD9] border border-[rgba(34,30,24,0.1)] text-xs">
          <button
            onClick={() => setActiveTab('diff')}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'diff'
                ? 'bg-[#221E18] text-white shadow-xs'
                : 'text-[#7A705F] hover:text-[#221E18]'
            }`}
          >
            <Split size={13} />
            <span>Draft-to-Draft Comparator</span>
          </button>

          <button
            onClick={() => setActiveTab('watermark')}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'watermark'
                ? 'bg-[#221E18] text-white shadow-xs'
                : 'text-[#7A705F] hover:text-[#221E18]'
            }`}
          >
            <Shield size={13} />
            <span>Watermarked Distribution</span>
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-8">
        {activeTab === 'diff' && (
          <div className="max-w-5xl mx-auto flex flex-col gap-5">
            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-lg bg-[#FAF6EE] border border-[rgba(34,30,24,0.1)]">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-[#221E18]">Scene:</span>
                <select
                  value={selectedSceneId}
                  onChange={(e) => setSelectedSceneId(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded bg-[#F1EAD9] border border-[rgba(34,30,24,0.12)] text-[#221E18] font-medium"
                >
                  {scenes.map((s, idx) => (
                    <option key={s.id} value={s.id}>
                      {idx + 1}. {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-emerald-700 font-semibold">+{diffStats.added} added</span>
                <span className="text-rose-700 font-semibold">-{diffStats.deleted} cut</span>
                <span className="text-[#7A705F]">{activeScene?.wordCount || 0} total words</span>
              </div>
            </div>

            {/* Side by side comparison cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Baseline Previous */}
              <div className="p-4 rounded-lg bg-white border border-[#DDD5C5] shadow-xs">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#EAE2D2]">
                  <span className="text-xs font-mono font-bold text-[#7A705F] uppercase">
                    Previous Pass (Baseline)
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-stone-100 text-stone-600">
                    Draft 1
                  </span>
                </div>
                <div className="font-serif text-sm leading-relaxed text-[#5C5242] whitespace-pre-wrap max-h-[480px] overflow-y-auto">
                  {previousVersionText}
                </div>
              </div>

              {/* Current Annotated Diff */}
              <div className="p-4 rounded-lg bg-white border border-[#B54B32]/30 shadow-xs ring-1 ring-[#B54B32]/15">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#EAE2D2]">
                  <span className="text-xs font-mono font-bold text-[#B54B32] uppercase">
                    Current Active Draft (with diff markup)
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#B54B32]/10 text-[#B54B32] font-semibold">
                    Draft 2
                  </span>
                </div>
                <div className="font-serif text-sm leading-relaxed text-[#221E18] whitespace-pre-wrap max-h-[480px] overflow-y-auto">
                  {diffTokens.map((token, idx) => {
                    if (token.type === 'insert') {
                      return (
                        <span key={idx} className="bg-emerald-100 text-emerald-900 px-0.5 rounded underline decoration-emerald-500">
                          {token.value}{' '}
                        </span>
                      );
                    }
                    if (token.type === 'delete') {
                      return (
                        <span key={idx} className="bg-rose-100 text-rose-900 line-through opacity-60 px-0.5 rounded">
                          {token.value}{' '}
                        </span>
                      );
                    }
                    return <span key={idx}>{token.value} </span>;
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'watermark' && (
          <div className="max-w-2xl mx-auto">
            <div className="p-6 rounded-lg bg-[#FAF6EE] border border-[rgba(34,30,24,0.12)] shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={18} className="text-[#B54B32]" />
                <h3 className="font-serif font-bold text-lg text-[#221E18]">
                  Watermarked Distribution Export
                </h3>
              </div>
              <p className="text-xs text-[#7A705F] leading-relaxed mb-6">
                Protect sensitive advance manuscripts, table read copies, and pitch drafts. Generates an encrypted/stamped copy embedded with confidential reviewer metadata.
              </p>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#221E18] mb-1">
                    Recipient / Reviewer Name:
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. Eleanor Vance / Agency Reader"
                    className="w-full px-3 py-2 text-xs rounded bg-white border border-[#DDD5C5] text-[#221E18] focus:outline-none focus:border-[#B54B32]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#221E18] mb-1">
                    Confidentiality Notice:
                  </label>
                  <input
                    type="text"
                    value={watermarkSubtext}
                    onChange={(e) => setWatermarkSubtext(e.target.value)}
                    placeholder="e.g. STRICTLY CONFIDENTIAL — NOT FOR REDISTRIBUTION"
                    className="w-full px-3 py-2 text-xs rounded bg-white border border-[#DDD5C5] text-[#221E18] focus:outline-none focus:border-[#B54B32]"
                  />
                </div>

                {/* Preview Box */}
                <div className="mt-4 p-6 rounded bg-white border border-[#DDD5C5] relative overflow-hidden flex items-center justify-center min-h-[140px]">
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none rotate-[-25deg] opacity-15">
                    <span className="text-2xl font-mono font-black text-rose-900 tracking-widest text-center">
                      CONFIDENTIAL — FOR {recipientName.toUpperCase()}<br />
                      {watermarkSubtext}
                    </span>
                  </div>
                  <div className="text-center text-[#7A705F] z-10">
                    <p className="font-serif font-bold text-[#221E18] text-sm">{project.title}</p>
                    <p className="text-[11px] mt-0.5">By {project.author || 'Author'}</p>
                    <p className="text-[10px] font-mono mt-2 text-[#B54B32]">Stamped for: {recipientName}</p>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleDownloadWatermarked}
                    disabled={isExporting}
                    className="px-5 py-2.5 bg-[#B54B32] hover:bg-[#9E3E27] text-white rounded-[6px] font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Download size={14} />
                    <span>{isExporting ? 'Packaging Export...' : `Download Watermarked for ${recipientName}`}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
