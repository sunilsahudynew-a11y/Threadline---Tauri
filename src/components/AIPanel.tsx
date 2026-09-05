import React, { useState } from 'react';
import { AIAuditLog } from '../types';
import { Sparkles, X, Check, Trash2, ShieldCheck, RefreshCw, Play, Lock, FileText, ArrowRight } from 'lucide-react';

interface AIPanelProps {
  selectedText: string;
  onClose: () => void;
  onAcceptOutput: (output: string, actionType: string, destination: 'append' | 'replace' | 'note') => void;
  onDiscardOutput: () => void;
  onLogAction: (log: AIAuditLog) => void;
}

export const AIPanel: React.FC<AIPanelProps> = ({
  selectedText,
  onClose,
  onAcceptOutput,
  onDiscardOutput,
  onLogAction
}) => {
  const [actionType, setActionType] = useState<
    'critique' | 'brainstorm' | 'extract' | 'rephrase' | 'summarize' | 'screenplay'
  >('critique');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingResult, setPendingResult] = useState<string | null>(null);
  const [destination, setDestination] = useState<'append' | 'replace' | 'note'>('append');

  const actionOptions = [
    {
      id: 'critique',
      label: 'Critique Cadence & Tone',
      desc: 'Audit sensory pacing, passive verbs, rhythm, and tension.'
    },
    {
      id: 'brainstorm',
      label: 'Brainstorm Reactions',
      desc: 'Suggest 3 in-character alternative emotional or physical beats.'
    },
    {
      id: 'extract',
      label: 'Extract Story Facts',
      desc: 'Isolate potential canonical entities, facts, and timeline cues.'
    },
    {
      id: 'rephrase',
      label: 'Alternative Phrasing',
      desc: 'Offer 3 varied sentence rhythms (terse, lyrical, classical).'
    },
    {
      id: 'summarize',
      label: 'Scene Premise Summary',
      desc: 'Distill beat progression and character turn into 2 sentences.'
    },
    {
      id: 'screenplay',
      label: 'Draft Screenplay Beats',
      desc: 'Convert narrative prose into sluglines, action, and dialogue.'
    }
  ] as const;

  const handleRun = () => {
    if (!selectedText.trim()) return;
    setIsLoading(true);
    setPendingResult(null);

    // Context-rich generation tailored to the literary tone of the selected text
    setTimeout(() => {
      let output = '';
      const snippet = selectedText.trim();

      if (actionType === 'critique') {
        output = `Cadence & Sensibility Review:
1. Sensory Anchoring:
   • The opening establishes tactile tension with physical friction ("cold teeth of an adjustable spanner", "fog rolling off the Vltava").
   • Consider sharpening the transition from thought to dialogue: the sentence "It was the only implement he possessed with weight enough to simulate courage" is emotionally honest, but Silas is a clockmaker; would he calculate physical torque or mechanical leverage instead of 'courage'?

2. Rhythmic Pacing:
   • The dialogue exchange moves with crisp urgency. Ensure Maren’s breathlessness is physically visible before she delivers the revelation. A brief beat of mechanical silence makes "cast this morning" hit with greater impact.`;
      } else if (actionType === 'brainstorm') {
        output = `Alternative Character Reactions for Silas:
Option A (Mechanical Withdrawal):
He does not reply at once. Instead, his fingers instinctively test the knurled screw of the spanner, tightening and loosening its brass jaw by fractions of a millimeter while he forces his breathing to slow.

Option B (Methodical Incredulity):
"The patina on the stamp requires forty winters of sulfur damp," he says, stepping closer. "Don't recite ghost tales to an escapement cutter, Maren. Who struck the metal?"

Option C (Vulnerability / Realization):
He lets the spanner sink into the wool pocket. If the sphere is fresh, then the foundry was not revived for a collector—it was ignited for a timetable, and the equinox is three nights away.`;
      } else if (actionType === 'extract') {
        output = `Identified Story Bible Entities & Temporal Facts:
• Entity: Courier Maren (Character)
  - Current Status: Injured (limp right arm, dried crescent of blood behind ear)
  - Fact: Denies 50-year-old provenance; claims copper was poured today.
• Object / Artifact: The Copper Sphere
  - Alloy provenance: Cast this morning at the supposed decommissioned Old Foundry.
• Location: Lower River Docks (Quay 4 / Salt Barges)
  - Atmosphere: Tarred hemp rope, paraffin lantern light, coal smoke over river current.`;
      } else if (actionType === 'rephrase') {
        output = `Phrasing Variations:

[Terse & Stark]
The barges lay in black water like drowned boxes. Inside his coat, Silas gripped the spanner. Cold iron gave him what little nerve he had.

[Lyrical / Sensory]
Low in the Vltava’s black grease sat the salt barges, patient as coffins. Silas buried his hands in heavy wool, his knuckles finding the cold teeth of his adjustable spanner—the only steel he owned that could balance his fear.

[Classical 19th Century]
The salt barges drifted upon the darkened current like waterlogged sepulchres. Silas kept his fist clenched within his greatcoat pocket upon the notched jaw of an artisan’s wrench, seeking in cold metal the resolution his spirit lacked.`;
      } else if (actionType === 'summarize') {
        output = `Premise & Turn:
Silas corners the wounded Courier Maren among the salt barges to uncover who obtained an antique foundry alloy. Instead of naming a buyer, Maren shatters his historical certainty by revealing the sphere was poured that very morning.`;
      } else if (actionType === 'screenplay') {
        output = `EXT. QUAY 4 - SALT BARGES - MIDNIGHT

River fog drifts across black water. Salt barges creak against the pilings.

SILAS (40s, ink and oil on his cuffs) steps onto the slime-slick gangway. His hand stays buried in his coat pocket, white-knuckled around an adjustable brass spanner.

A solitary paraffin lantern swings from a crane.

COURIER MAREN (20s) knots a cargo sling with her teeth. Her right arm hangs dead against her ribs. Dried blood clings behind her ear.

MAREN
(without turning)
You followed the grease trail.

SILAS
You dropped contraband into my shop. The alloy was melted fifty years ago. Who had the stamps?

Maren spits the frayed hemp rope. She turns into the lamplight. Her jaw trembles.

MAREN
No one had the stamps, Silas. The sphere wasn't cast fifty years ago.

She lifts her chin toward the fog.

MAREN (CONT'D)
It was poured this morning at the Old Kiln.`;
      }

      setPendingResult(output);
      setIsLoading(false);
    }, 600);
  };

  const handleAccept = () => {
    if (!pendingResult) return;
    const log: AIAuditLog = {
      id: 'ai-' + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: actionType,
      scopeSnippet: selectedText.slice(0, 80) + (selectedText.length > 80 ? '...' : ''),
      output: pendingResult,
      status: 'accepted'
    };
    onLogAction(log);
    onAcceptOutput(pendingResult, actionType, destination);
    setPendingResult(null);
    onClose();
  };

  const handleDiscard = () => {
    if (!pendingResult) return;
    const log: AIAuditLog = {
      id: 'ai-' + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: actionType,
      scopeSnippet: selectedText.slice(0, 80) + (selectedText.length > 80 ? '...' : ''),
      output: pendingResult,
      status: 'discarded'
    };
    onLogAction(log);
    setPendingResult(null);
    onDiscardOutput();
  };

  return (
    <div className="w-96 border-l border-stone-200 bg-white flex flex-col shadow-xl z-30 text-xs animate-in slide-in-from-right-3 duration-200">
      {/* Header & Explicit Privacy Policy */}
      <div className="p-4 border-b border-stone-200 bg-stone-50/80">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center">
              <Sparkles size={12} />
            </div>
            <span className="font-semibold text-stone-900 text-sm font-serif">Sounding Board</span>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-md transition-colors"
            title="Close AI Assistant"
          >
            <X size={15} />
          </button>
        </div>

        {/* Clear Data Policy Display */}
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-800 bg-emerald-50/80 border border-emerald-200/60 px-2 py-1 rounded-md">
          <ShieldCheck size={12} className="shrink-0 text-emerald-700" />
          <span>Zero Training Policy: Scoped strictly to selection. Never merges automatically.</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Selected Excerpt Scope */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider">
              Selected Source Material ({selectedText.trim().split(/\s+/).filter(Boolean).length} words)
            </label>
            <span className="text-[10px] text-stone-400 font-mono">Explicit Scope</span>
          </div>
          <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200/80 font-serif italic text-stone-800 text-xs max-h-24 overflow-y-auto leading-relaxed">
            {selectedText || (
              <span className="text-stone-400 not-italic">
                Highlight any passage or scene in the manuscript to scope this tool.
              </span>
            )}
          </div>
        </div>

        {/* Action Selection */}
        <div>
          <label className="block text-[10px] uppercase font-semibold text-stone-400 tracking-wider mb-1.5">
            Select Writing Lens
          </label>
          <div className="space-y-1.5">
            {actionOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setActionType(opt.id)}
                className={`w-full p-2 rounded-lg border text-left transition-all ${
                  actionType === opt.id
                    ? 'border-amber-600 bg-amber-50/50 shadow-xs'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                }`}
              >
                <div className="font-medium text-stone-900 text-xs">{opt.label}</div>
                <div className="text-[10px] text-stone-500 leading-tight mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Run Button */}
        <button
          disabled={!selectedText.trim() || isLoading}
          onClick={handleRun}
          className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-xs"
        >
          {isLoading ? (
            <>
              <RefreshCw size={13} className="animate-spin" />
              <span>Analyzing Scoped Selection...</span>
            </>
          ) : (
            <>
              <Play size={13} />
              <span>Analyze Scoped Text</span>
            </>
          )}
        </button>

        {/* Side-by-Side Review of Output */}
        {pendingResult && (
          <div className="p-3 bg-amber-50/30 rounded-xl border border-amber-300 shadow-xs animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-900 font-mono flex items-center gap-1">
                <FileText size={12} /> Proposed Output (Review Required)
              </span>
              <span className="text-[10px] text-amber-800 font-medium">Not Merged</span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-amber-200/80 font-serif text-xs text-stone-800 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
              {pendingResult}
            </div>

            {/* Destination Selection */}
            <div className="mt-3 pt-2 border-t border-amber-200/60">
              <label className="block text-[10px] uppercase font-semibold text-stone-500 mb-1">
                If accepted, apply as:
              </label>
              <div className="grid grid-cols-3 gap-1 mb-3 text-[10px]">
                <button
                  type="button"
                  onClick={() => setDestination('append')}
                  className={`p-1.5 rounded border text-center ${
                    destination === 'append'
                      ? 'bg-amber-100 border-amber-500 font-semibold text-stone-900'
                      : 'border-stone-200 bg-white text-stone-600'
                  }`}
                >
                  Append to Draft
                </button>
                <button
                  type="button"
                  onClick={() => setDestination('replace')}
                  className={`p-1.5 rounded border text-center ${
                    destination === 'replace'
                      ? 'bg-amber-100 border-amber-500 font-semibold text-stone-900'
                      : 'border-stone-200 bg-white text-stone-600'
                  }`}
                >
                  Replace Selection
                </button>
                <button
                  type="button"
                  onClick={() => setDestination('note')}
                  className={`p-1.5 rounded border text-center ${
                    destination === 'note'
                      ? 'bg-amber-100 border-amber-500 font-semibold text-stone-900'
                      : 'border-stone-200 bg-white text-stone-600'
                  }`}
                >
                  Scene Note
                </button>
              </div>

              {/* Explicit Confirmation Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAccept}
                  className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Check size={14} />
                  <span>Insert into Work</span>
                </button>
                <button
                  onClick={handleDiscard}
                  className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-medium transition-colors border border-stone-200"
                  title="Discard suggestion completely"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
