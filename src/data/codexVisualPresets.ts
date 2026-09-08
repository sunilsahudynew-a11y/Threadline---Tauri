// Curated visual preset assets and color palettes for Codex & Lore and Ideation
export interface VisualPreset {
  id: string;
  name: string;
  category: 'character' | 'world' | 'artifact';
  url: string;
  colorPalette: string[];
  moodKeywords: string[];
  attireOrArchitecture: string;
}

export const CHARACTER_AVATAR_PRESETS: VisualPreset[] = [
  {
    id: 'char-clockmaker',
    name: 'Horologist / Scholar',
    category: 'character',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    colorPalette: ['#3A3026', '#B54B32', '#D1A153'],
    moodKeywords: ['Methodical', 'Analytical', 'Watchmaker'],
    attireOrArchitecture: 'Tweed waistcoat, brass jeweler’s loupe, rolled linen sleeves stained with machine oil'
  },
  {
    id: 'char-courier',
    name: 'Courier / River Runner',
    category: 'character',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    colorPalette: ['#5A686D', '#2B4C7E', '#8C9A9E'],
    moodKeywords: ['Guarded', 'Agile', 'Vigilant'],
    attireOrArchitecture: 'Coarse grey Bohemian wool shawl, water-resistant oilcloth gaiters, iron lock-picks'
  },
  {
    id: 'char-archivist',
    name: 'Archivist / Bureaucrat',
    category: 'character',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    colorPalette: ['#2F3E46', '#52796F', '#84A98C'],
    moodKeywords: ['Meticulous', 'Myopic', 'Pedantic'],
    attireOrArchitecture: 'High-collared Prussian tunic with ink-black horn buttons and bone-handled micrometer'
  },
  {
    id: 'char-aristocrat',
    name: 'Guildmaster / Censor',
    category: 'character',
    url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
    colorPalette: ['#4A0E17', '#9381FF', '#C9A66B'],
    moodKeywords: ['Calculating', 'Formidable', 'Traditional'],
    attireOrArchitecture: 'Heavy velvet mantle trimmed in marten fur, signet ring with melted wax patina'
  },
  {
    id: 'char-scifi-surveyor',
    name: 'Surveyor / Specialist',
    category: 'character',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    colorPalette: ['#0B2545', '#134074', '#8DA9C4'],
    moodKeywords: ['Focused', 'Resolute', 'Pioneering'],
    attireOrArchitecture: 'Reinforced pressure jumpsuit with titanium telemetry harnesses and amber visor'
  }
];

export const WORLD_PRESET_IMAGES: VisualPreset[] = [
  {
    id: 'world-clocktower',
    name: 'Astronomical Clocktower',
    category: 'world',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
    colorPalette: ['#302924', '#C9A66B', '#8C6239'],
    moodKeywords: ['Ancient Cedar', 'Tallow Candles', 'Clockwork'],
    attireOrArchitecture: 'High-ribbed Gothic vaulting, giant exposed brass escapement wheels, dust motes in sulfurous light'
  },
  {
    id: 'world-vaults',
    name: 'Imperial Subterranean Vaults',
    category: 'world',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    colorPalette: ['#1C2526', '#3D5A5B', '#709775'],
    moodKeywords: ['Verdigris', 'Damp Granite', 'Secret Archives'],
    attireOrArchitecture: 'Subterranean limestone arcades, green oxidized copper filing cabinets, damp ledger felt'
  },
  {
    id: 'world-quay',
    name: 'Foggy River Moorings (Quay 4)',
    category: 'world',
    url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&auto=format&fit=crop&q=80',
    colorPalette: ['#2B3A42', '#4F6D7A', '#C0D6DF'],
    moodKeywords: ['Chilly Mist', 'Coal Smoke', 'River Reeds'],
    attireOrArchitecture: 'Rotted cedar pylons, black pitch caulking, low-sitting iron barges shrouded in river fog'
  },
  {
    id: 'world-automaton',
    name: 'The Backward Automaton & Sphere',
    category: 'artifact',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    colorPalette: ['#B87333', '#C5A059', '#1E1E24'],
    moodKeywords: ['Chronological Coil', 'Forbidden Metallurgy', 'Equinox'],
    attireOrArchitecture: 'Unstamped copper sphere, micro-toothed brass gears with Latin radial incisions'
  }
];
