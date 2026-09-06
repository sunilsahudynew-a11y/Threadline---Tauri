import React, { useState } from 'react';
import { EntityType, EntityStatus } from '../types';
import { X, Compass, Shield } from 'lucide-react';

interface QuickEntityModalProps {
  candidateName: string;
  onClose: () => void;
  onSave: (type: EntityType, status: EntityStatus, description: string, canonicalFact: string) => void;
}

export const QuickEntityModal: React.FC<QuickEntityModalProps> = ({
  candidateName,
  onClose,
  onSave
}) => {
  const [type, setType] = useState<EntityType>('character');
  const [status, setStatus] = useState<EntityStatus>('tentative');
  const [description, setDescription] = useState('');
  const [canonicalFact, setCanonicalFact] = useState('');

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(
      type,
      status,
      description.trim() || `Entity introduced in manuscript: ${candidateName}`,
      canonicalFact.trim() || description.trim() || `Named in manuscript as ${candidateName}`
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-[#FAF6EE] rounded-[6px] max-w-md w-full p-5 sm:p-6 shadow-warm-modal border border-[rgba(34,30,24,0.16)] text-[#221E18]">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[rgba(34,30,24,0.12)]">
          <div className="flex items-center gap-2">
            <Compass size={17} className="text-[#B54B32]" />
            <h3 className="font-serif font-semibold text-[#221E18] text-lg">Add to Story Bible</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#7A705F] hover:text-[#221E18] p-1 rounded-[5px] hover:bg-[#F1EAD9] transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleConfirm} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#7A705F] font-semibold mb-1 uppercase tracking-wider text-[10px] font-mono">
              Entity Name (From Selection)
            </label>
            <input
              type="text"
              readOnly
              value={candidateName}
              className="w-full p-2.5 bg-[#F1EAD9] rounded-[6px] border border-[rgba(34,30,24,0.12)] font-medium text-[#221E18] font-serif"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#7A705F] font-semibold mb-1 uppercase tracking-wider text-[10px] font-mono">
                Classification
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as EntityType)}
                className="w-full p-2 bg-[#FAF6EE] border border-[rgba(34,30,24,0.14)] rounded-[6px] text-[#221E18] focus:bg-[#FAF6EE] focus:border-[#B54B32] focus:outline-none cursor-pointer"
              >
                <option value="character">Character</option>
                <option value="place">Place / Location</option>
                <option value="object">Object / Contrivance</option>
                <option value="organization">Guild / Organization</option>
                <option value="concept">Concept / Rule</option>
              </select>
            </div>

            <div>
              <label className="block text-[#7A705F] font-semibold mb-1 uppercase tracking-wider text-[10px] font-mono">
                Canon Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EntityStatus)}
                className="w-full p-2 bg-[#FAF6EE] border border-[rgba(34,30,24,0.14)] rounded-[6px] text-[#221E18] uppercase font-mono text-[11px] focus:bg-[#FAF6EE] focus:border-[#B54B32] focus:outline-none cursor-pointer"
              >
                <option value="tentative">Tentative (Draft)</option>
                <option value="confirmed">Confirmed (Canon)</option>
                <option value="contradicted">Contradicted</option>
                <option value="retired">Retired</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#7A705F] font-semibold mb-1 uppercase tracking-wider text-[10px] font-mono">
              Summary / Context
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Who or what is this in the world?"
              rows={2}
              className="w-full p-2.5 bg-[#FAF6EE] border border-[rgba(34,30,24,0.14)] rounded-[6px] text-[#221E18] focus:border-[#B54B32] focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center gap-1 text-[#221E18] font-semibold mb-1 uppercase tracking-wider text-[10px] font-mono">
              <Shield size={11} className="text-[#B54B32]" />
              <span>Initial Canonical Fact (Hard Story Truth)</span>
            </div>
            <input
              type="text"
              value={canonicalFact}
              onChange={(e) => setCanonicalFact(e.target.value)}
              placeholder="e.g., Carries a forty-year-old brass alloy stamp from 1844."
              className="w-full p-2.5 bg-[#F1EAD9]/60 border border-[rgba(34,30,24,0.14)] rounded-[6px] text-[#221E18] focus:border-[#B54B32] focus:outline-none font-serif"
            />
            <span className="block text-[10px] text-[#7A705F] mt-1">
              Distinguishes hard story facts from speculative ideas and draft prose.
            </span>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-[rgba(34,30,24,0.12)]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-[#7A705F] hover:text-[#221E18] rounded-[6px] transition-colors cursor-pointer min-h-[36px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#221E18] text-[#FAF6EE] rounded-[6px] font-semibold hover:bg-black shadow-warm-sm transition-colors cursor-pointer min-h-[36px]"
            >
              Anchor in Story Bible
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
