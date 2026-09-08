import React from 'react';
import { CharacterPlanning, CharacterRole } from '../../types';
import { User, Target, Heart, Skull, AlertCircle, EyeOff, MessageSquare } from 'lucide-react';

interface CharacterPlanningDossierProps {
  planning?: CharacterPlanning;
  onChange: (updated: CharacterPlanning) => void;
}

export const CharacterPlanningDossier: React.FC<CharacterPlanningDossierProps> = ({
  planning = {},
  onChange
}) => {
  const roles: { id: CharacterRole; label: string }[] = [
    { id: 'protagonist', label: 'Protagonist' },
    { id: 'antagonist', label: 'Antagonist' },
    { id: 'deuteragonist', label: 'Deuteragonist' },
    { id: 'mentor', label: 'Mentor' },
    { id: 'ally', label: 'Ally' },
    { id: 'rival', label: 'Rival' },
    { id: 'foil', label: 'Foil' },
    { id: 'supporting', label: 'Supporting' }
  ];

  return (
    <div className="space-y-4 bg-[#F1EAD9] p-3.5 sm:p-4 rounded-[8px] border border-[rgba(34,30,24,0.1)] text-xs select-none">
      <div className="flex items-center gap-2 border-b border-[rgba(34,30,24,0.08)] pb-2">
        <Target size={15} className="text-[#B54B32]" />
        <h4 className="font-serif font-bold text-xs sm:text-sm text-[#221E18]">
          Psychological &amp; Narrative Arc Planning
        </h4>
      </div>

      {/* Role Selector Pills */}
      <div>
        <label className="text-[11px] font-mono text-[#7A705F] uppercase font-semibold block mb-1.5">
          Narrative Role &amp; Archetype
        </label>
        <div className="flex flex-wrap gap-1.5">
          {roles.map((r) => {
            const isSelected = planning.role === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => onChange({ ...planning, role: r.id })}
                className={`px-2.5 py-1 rounded-[4px] text-xs font-medium transition-colors cursor-pointer border ${
                  isSelected
                    ? 'bg-[#B54B32] text-[#FAF6EE] border-[#B54B32] font-semibold'
                    : 'bg-[#FAF6EE] text-[#554D40] hover:text-[#221E18] border-[rgba(34,30,24,0.1)]'
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Want vs Need (The Golden Conflict) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="bg-[#FAF6EE] p-2.5 rounded-[6px] border border-[rgba(34,30,24,0.08)] space-y-1">
          <div className="flex items-center gap-1.5 text-[#B54B32]">
            <Target size={13} />
            <span className="text-[11px] font-mono font-bold uppercase">The External Want (Goal)</span>
          </div>
          <p className="text-[10px] text-[#7A705F]">
            What they consciously strive to achieve in the plot.
          </p>
          <textarea
            value={planning.want || ''}
            onChange={(e) => onChange({ ...planning, want: e.target.value })}
            placeholder="e.g. Prove his mentor wasn't mad and maintain clockmaster order..."
            rows={2}
            className="w-full text-xs p-2 rounded border border-[rgba(34,30,24,0.12)] bg-white resize-none focus:outline-none focus:border-[#B54B32]"
          />
        </div>

        <div className="bg-[#FAF6EE] p-2.5 rounded-[6px] border border-[rgba(34,30,24,0.08)] space-y-1">
          <div className="flex items-center gap-1.5 text-[#3A7D6E]">
            <Heart size={13} />
            <span className="text-[11px] font-mono font-bold uppercase">The Internal Need (Growth)</span>
          </div>
          <p className="text-[10px] text-[#7A705F]">
            The spiritual or moral truth they must embrace to evolve.
          </p>
          <textarea
            value={planning.need || ''}
            onChange={(e) => onChange({ ...planning, need: e.target.value })}
            placeholder="e.g. Step outside the safe mechanics of cold brass and take a human moral stand..."
            rows={2}
            className="w-full text-xs p-2 rounded border border-[rgba(34,30,24,0.12)] bg-white resize-none focus:outline-none focus:border-[#3A7D6E]"
          />
        </div>
      </div>

      {/* Ghost/Wound & Fatal Flaw */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="space-y-1">
          <label className="text-[11px] font-mono text-[#7A705F] uppercase font-semibold flex items-center gap-1">
            <Skull size={12} className="text-[#8E4A49]" />
            <span>Backstory Wound / The Ghost</span>
          </label>
          <textarea
            value={planning.ghostOrWound || ''}
            onChange={(e) => onChange({ ...planning, ghostOrWound: e.target.value })}
            placeholder="Past betrayal, failure, or traumatic loss that created their emotional armor..."
            rows={2}
            className="w-full text-xs p-2 rounded-[5px] border border-[rgba(34,30,24,0.12)] bg-[#FAF6EE] resize-none focus:outline-none focus:border-[#B54B32]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-mono text-[#7A705F] uppercase font-semibold flex items-center gap-1">
            <AlertCircle size={12} className="text-[#C44900]" />
            <span>Fatal Flaw / Blindspot</span>
          </label>
          <textarea
            value={planning.fatalFlaw || ''}
            onChange={(e) => onChange({ ...planning, fatalFlaw: e.target.value })}
            placeholder="Obsessive hyper-fixation on microscopic calibration; paralysis under social ambiguity..."
            rows={2}
            className="w-full text-xs p-2 rounded-[5px] border border-[rgba(34,30,24,0.12)] bg-[#FAF6EE] resize-none focus:outline-none focus:border-[#B54B32]"
          />
        </div>
      </div>

      {/* Secrets & Voice Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="space-y-1">
          <label className="text-[11px] font-mono text-[#7A705F] uppercase font-semibold flex items-center gap-1">
            <EyeOff size={12} />
            <span>Secrets &amp; Hidden Contradictions</span>
          </label>
          <input
            type="text"
            value={planning.secret || ''}
            onChange={(e) => onChange({ ...planning, secret: e.target.value })}
            placeholder="Keeps a melted 1844 guild coin hidden inside the floorboards..."
            className="w-full text-xs px-2.5 py-1.5 rounded-[5px] border border-[rgba(34,30,24,0.12)] bg-[#FAF6EE] focus:outline-none focus:border-[#B54B32]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-mono text-[#7A705F] uppercase font-semibold flex items-center gap-1">
            <MessageSquare size={12} />
            <span>Voice Cadence &amp; Dialogue Habits</span>
          </label>
          <input
            type="text"
            value={planning.voiceNotes || ''}
            onChange={(e) => onChange({ ...planning, voiceNotes: e.target.value })}
            placeholder="Terse, speaks in mechanical units, avoids contractions when nervous..."
            className="w-full text-xs px-2.5 py-1.5 rounded-[5px] border border-[rgba(34,30,24,0.12)] bg-[#FAF6EE] focus:outline-none focus:border-[#B54B32]"
          />
        </div>
      </div>
    </div>
  );
};
