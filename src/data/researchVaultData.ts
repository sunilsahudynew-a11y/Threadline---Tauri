import { ResearchVaultItem } from '../types';

export const INITIAL_RESEARCH_VAULT: ResearchVaultItem[] = [
  {
    id: 'vault-audio-1',
    title: 'Clocktower Escapement Field Recording & Bell Resonances',
    type: 'audio',
    url: 'https://actions.google.com/sounds/v1/ambiences/clock_ticking.ogg',
    description: 'Acoustic field recording of 70-beat/min escapement mechanism and reverberation through wet timber joists.',
    tags: ['Acoustics', 'Sensory', 'Atmosphere', 'Soundscape'],
    notes: 'Use this recording to gauge rhythm in Scene 1 and Scene 4. Notice the heavy brass vibration right after the fifth tick.',
    fileSize: '3.4 MB',
    createdAt: '2026-08-10T14:40:00.000Z',
    linkedSceneIds: ['scene-1', 'scene-4'],
    linkedEntityIds: ['char-silas', 'loc-workshop'],
    transcriptions: [
      { time: 2, note: 'Crown wheel escapement cycle begins; steady 70 beats/min meter.' },
      { time: 14, note: 'Tallow lubrication squeak across cedar joist bearing.' },
      { time: 28, note: 'Distant river foghorn through Old Town canal vents.' },
      { time: 42, note: 'Courier footfall vibration along wet granite flags.' },
      { time: 58, note: 'Heavy brass cough into chimney flue reverberation.' }
    ]
  },
  {
    id: 'vault-pdf-1',
    title: 'Imperial Metallurgical Vaults - Guild Assay Charter (1892)',
    type: 'pdf',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    description: 'Archival documentation detailing forbidden ternary copper-antimony alloys and astronomical clock tolerances.',
    tags: ['Metallurgy', 'Imperial Law', 'Bohemia', 'Historical Archive'],
    notes: 'Reference Section 4: "No smith shall cast an escapement tooth with negative lead without direct seal of the Astronomer Royal."',
    fileSize: '1.8 MB',
    createdAt: '2026-08-11T10:15:00.000Z',
    linkedSceneIds: ['scene-2', 'scene-3'],
    linkedEntityIds: ['char-julian', 'loc-vaults']
  },
  {
    id: 'vault-img-1',
    title: 'Astronomical Clock Reverse Gear Train Schematic',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    description: 'High-resolution archival mechanical diagram showing retrograde planetary gearing and dual escapement crown wheels.',
    tags: ['Schematic', 'Horology', 'Clockwork', 'Visual Reference'],
    notes: 'Pay attention to the center arbor: the counter-weight prevents the escapement from stalling when the mercury bath expands.',
    fileSize: '2.9 MB',
    createdAt: '2026-08-12T16:30:00.000Z',
    linkedSceneIds: ['scene-1', 'scene-5'],
    linkedEntityIds: ['item-sphere']
  },
  {
    id: 'vault-img-2',
    title: 'Quay 4 & Prague Canal Basin in Autumn Mist',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=1200&q=80',
    description: 'Atmospheric visual reference for Scene 3: river reeds, iron moorings, and lantern flare through coal smoke.',
    tags: ['Atmosphere', 'Location', 'Prague', 'Moodboard'],
    notes: 'Notice the cold greenish tone of the river water near the salt barges. Smells like sulfur, wet dog, and coal slag.',
    fileSize: '4.1 MB',
    createdAt: '2026-08-13T09:00:00.000Z',
    linkedSceneIds: ['scene-3'],
    linkedEntityIds: ['loc-quay4']
  },
  {
    id: 'vault-web-1',
    title: '1894 Prague Weather Annals: The Great November Frost',
    type: 'web-link',
    url: 'https://en.wikipedia.org/wiki/Prague_astronomical_clock',
    description: 'Meteorological registry and historical clippings regarding the freezing of the Vltava river in late autumn.',
    tags: ['Climate', 'Historical Accuracy', 'Timeline', 'Web Archive'],
    notes: 'Recorded temperature dropped to -6°C at dusk. River salt barges had to be cleared before midnight to prevent hull crushing.',
    fileSize: '142 KB',
    createdAt: '2026-08-14T11:20:00.000Z',
    linkedSceneIds: ['scene-3'],
    linkedEntityIds: ['loc-quay4']
  }
];
