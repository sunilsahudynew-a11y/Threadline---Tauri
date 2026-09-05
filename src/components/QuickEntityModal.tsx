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
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-stone-200">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Compass size={17} className="text-amber-800" />
            <h3 className="font-serif font-bold text-stone-900 text-lg">Add to Story Bible</h3>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-md transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleConfirm} className="space-y-4 text-xs">
          <div>
            <label className="block text-stone-500 font-semibold mb-1 uppercase tracking-wider text-[10px]">
              Entity Name (From Selection)
            </label>
            <input
              type="text"
              readOnly
              value={candidateName}
              className="w-full p-2.5 bg-stone-100 rounded-lg border border-stone-200 font-medium text-stone-900 font-serif"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-500 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Classification
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as EntityType)}
                className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 focus:bg-white focus:outline-none"
              >
                <option value="character">Character</option>
                <option value="place">Place / Location</option>
                <option value="object">Object / Contrivance</option>
                <option value="organization">Guild / Organization</option>
                <option value="concept">Concept / Rule</option>
              </select>
            </div>

            <div>
              <label className="block text-stone-500 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Canon Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EntityStatus)}
                className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 uppercase font-mono text-[11px] focus:bg-white focus:outline-none"
              >
                <option value="tentative">Tentative (Draft)</option>
                <option value="confirmed">Confirmed (Canon)</option>
                <option value="contradicted">Contradicted</option>
                <option value="retired">Retired</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-stone-500 font-semibold mb-1 uppercase tracking-wider text-[10px]">
              Summary / Context
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Who or what is this in the world?"
              rows={2}
              className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center gap-1 text-stone-600 font-semibold mb-1 uppercase tracking-wider text-[10px]">
              <Shield size={11} className="text-amber-800" />
              <span>Initial Canonical Fact (Hard Story Truth)</span>
            </div>
            <input
              type="text"
              value={canonicalFact}
              onChange={(e) => setCanonicalFact(e.target.value)}
              placeholder="e.g., Carries a forty-year-old brass alloy stamp from 1844."
              className="w-full p-2 bg-amber-50/40 border border-amber-200 rounded-lg text-stone-800 focus:bg-white focus:outline-none font-serif"
            />
            <span className="block text-[10px] text-stone-400 mt-1">
              Distinguishes hard story facts from speculative ideas and draft prose.
            </span>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-stone-600 hover:text-stone-900 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-stone-900 text-white rounded-lg font-medium hover:bg-stone-800 shadow-xs transition-colors"
            >
              Anchor in Story Bible
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
