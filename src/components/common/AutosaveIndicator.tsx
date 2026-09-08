import React from 'react';
import { Check, RefreshCw, CloudCheck, HardDrive } from 'lucide-react';

interface AutosaveIndicatorProps {
  lastSavedText?: string;
  isSaving?: boolean;
  className?: string;
  compact?: boolean;
}

export const AutosaveIndicator: React.FC<AutosaveIndicatorProps> = ({
  lastSavedText = 'Saved locally',
  isSaving: explicitSaving,
  className = '',
  compact = false
}) => {
  const isSaving =
    explicitSaving !== undefined
      ? explicitSaving
      : lastSavedText.toLowerCase().includes('saving');

  return (
    <div
      className={`inline-flex items-center gap-1.5 transition-all duration-200 select-none ${className}`}
      title={isSaving ? 'Saving manuscript changes...' : lastSavedText}
    >
      {isSaving ? (
        <span className="flex items-center gap-1.5 text-[#B54B32] font-mono text-[11px] font-medium animate-pulse">
          <RefreshCw
            size={12}
            className="animate-spin text-[#B54B32] shrink-0"
            style={{ animationDuration: '0.85s' }}
          />
          {!compact && <span>Saving...</span>}
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-[#3A7D6E] font-mono text-[11px] font-medium transition-all duration-300">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3A7D6E] opacity-40 duration-1000" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3A7D6E]" />
          </span>
          <Check size={12} className="text-[#3A7D6E] shrink-0 stroke-[2.5]" />
          {!compact && (
            <span className="text-[#554D40] truncate max-w-[140px]">
              {lastSavedText.includes('Saved') ? lastSavedText : `Saved (${lastSavedText})`}
            </span>
          )}
        </span>
      )}
    </div>
  );
};
