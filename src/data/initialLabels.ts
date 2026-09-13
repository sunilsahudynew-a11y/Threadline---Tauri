import { LabelDefinition } from '../types';

export const INITIAL_PROJECT_LABELS: LabelDefinition[] = [
  {
    id: 'label-pov-silas',
    name: 'POV: Silas Vance',
    color: '#DE6346',
    description: 'Primary protagonist perspective'
  },
  {
    id: 'label-pov-maren',
    name: 'POV: Courier Maren',
    color: '#2B6CB0',
    description: 'Secondary ally / courier perspective'
  },
  {
    id: 'label-plot-clock',
    name: 'Plot: Reverse Escapement',
    color: '#7C3AED',
    description: 'Main temporal conspiracy mystery'
  },
  {
    id: 'label-plot-guild',
    name: 'Subplot: Guild Secrets',
    color: '#059669',
    description: 'Imperial foundry and clandestine guild'
  },
  {
    id: 'label-lore',
    name: 'Codex & Historical Lore',
    color: '#D97706',
    description: 'Metallurgy, astrology, Prague geography'
  },
  {
    id: 'label-urgent',
    name: 'Needs Polish / Revision',
    color: '#E11D48',
    description: 'High priority prose refinement'
  }
];

export const STATUS_TINTS = [
  { id: 'idea', label: 'Idea / Outline', color: '#94A3B8' },
  { id: 'first-draft', label: 'First Draft', color: '#3B82F6' },
  { id: 'revised', label: 'Revised', color: '#F59E0B' },
  { id: 'final-polish', label: 'Final Polish', color: '#10B981' },
  { id: 'locked', label: 'Locked / Approved', color: '#6366F1' }
];
