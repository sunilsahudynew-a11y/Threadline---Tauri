import React from 'react';
import { WorldPlanning } from '../../types';
import { Globe, Shield, AlertTriangle, ScrollText, Sparkles } from 'lucide-react';

interface WorldPlanningDossierProps {
  planning?: WorldPlanning;
  onChange: (updated: WorldPlanning) => void;
}

export const WorldPlanningDossier: React.FC<WorldPlanningDossierProps> = ({
  planning = {},
  onChange
}) => {
  const categories: { id: NonNullable<WorldPlanning['category']>; label: string }[] = [
    { id: 'geography', label: 'Geography / Realm' },
    { id: 'faction', label: 'Faction / Guild' },
    { id: 'magic_tech', label: 'Arcane / Science' },
    { id: 'relic', label: 'Relic / Artifact' },
    { id: 'cultural', label: 'Cultural / Social' }
  ];

  return (
    <div className="space-y-4 bg-[#F1EAD9] p-3.5 sm:p-4 rounded-[8px] border border-[rgba(34,30,24,0.1)] text-xs select-none">
      <div className="flex items-center gap-2 border-b border-[rgba(34,30,24,0.08)] pb-2">
        <Globe size={15} className="text-[#3A7D6E]" />
        <h4 className="font-serif font-bold text-xs sm:text-sm text-[#221E18]">
          World Systems &amp; Environment Architecture
        </h4>
      </div>

      {/* World Category */}
      <div>
        <label className="text-[11px] font-mono text-[#7A705F] uppercase font-semibold block mb-1.5">
          Worldbuilding Domain
        </label>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => {
            const isSelected = planning.category === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onChange({ ...planning, category: c.id })}
                className={`px-2.5 py-1 rounded-[4px] text-xs font-medium transition-colors cursor-pointer border ${
                  isSelected
                    ? 'bg-[#3A7D6E] text-[#FAF6EE] border-[#3A7D6E] font-semibold'
                    : 'bg-[#FAF6EE] text-[#554D40] hover:text-[#221E18] border-[rgba(34,30,24,0.1)]'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cultural Rules & Taboos */}
      <div className="space-y-1">
        <label className="text-[11px] font-mono text-[#7A705F] uppercase font-semibold flex items-center gap-1">
          <ScrollText size={12} className="text-[#7A705F]" />
          <span>Cultural Laws, Guild Edicts &amp; Sacred Taboos</span>
        </label>
        <textarea
          value={
            Array.isArray(planning.culturalRules)
              ? planning.culturalRules.join('\n')
              : typeof planning.culturalRules === 'string'
              ? planning.culturalRules
              : ''
          }
          onChange={(e) =>
            onChange({
              ...planning,
              culturalRules: e.target.value.split('\n').filter(Boolean)
            })
          }
          placeholder="One rule per line:&#10;• No uninspected brass alloys permitted south of the Charles Bridge&#10;• Tierce curfew bell initiates shoot-on-sight river patrols&#10;• Guild seals must be pressed into hot pitch before notary transfer"
          rows={3}
          className="w-full text-xs p-2 rounded-[5px] border border-[rgba(34,30,24,0.12)] bg-[#FAF6EE] resize-none focus:outline-none focus:border-[#3A7D6E]"
        />
      </div>

      {/* Danger / Influence Level */}
      <div className="space-y-1">
        <label className="text-[11px] font-mono text-[#7A705F] uppercase font-semibold flex items-center gap-1">
          <AlertTriangle size={12} className="text-[#C44900]" />
          <span>Danger, Influence &amp; Environmental Hazard</span>
        </label>
        <input
          type="text"
          value={planning.dangerLevel || ''}
          onChange={(e) => onChange({ ...planning, dangerLevel: e.target.value })}
          placeholder="High: Toxic sulfur steam leaks, constant municipal patrol surveillance..."
          className="w-full text-xs px-2.5 py-1.5 rounded-[5px] border border-[rgba(34,30,24,0.12)] bg-[#FAF6EE] focus:outline-none focus:border-[#3A7D6E]"
        />
      </div>
    </div>
  );
};
