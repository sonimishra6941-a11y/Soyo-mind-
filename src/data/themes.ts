// 10 Curated AI Front Themes Based on User's Color Palette Images
// 1. Royal Midnight Purple (IMG-20261019-WA4073.jpg)
// 2. Champagne Silk Ivory (IMG-20261019-WA1849.jpg)
// 3. Peach Blossom Sunset (IMG-20261019-WA7856.jpg)
// 4. Aqua Cyan Horizon (IMG-20261019-WA7672.jpg)
// 5. Cosmic Blue Nebula (IMG-20261019-WA4755.jpg)
// 6. Minimal Silver Frost (IMG-20261019-WA0427.jpg)
// 7. Mint Matcha Breeze (IMG-20261019-WA8970.jpg)
// 8. Lilac Lavender Twilight (IMG-20261019-WA5394.jpg)
// 9. Arctic Cloud Ethereal (IMG-20261019-WA9552.jpg)
// 10. Deep Midnight Navy (IMG-20261019-WA2533.jpg)

export type ThemeId =
  | 'royal-midnight-purple'
  | 'champagne-silk-ivory'
  | 'peach-blossom-sunset'
  | 'aqua-cyan-horizon'
  | 'cosmic-blue-nebula'
  | 'minimal-silver-frost'
  | 'mint-matcha-breeze'
  | 'lilac-lavender-twilight'
  | 'arctic-cloud-ethereal'
  | 'deep-midnight-navy';

export interface ThemeDefinition {
  id: ThemeId;
  name: string; // The official color name
  tagline: string;
  mode: 'dark' | 'light';
  primaryColor: string; // Hex for borders/accents
  secondaryColor: string;
  bgGradient: string; // Full app background style
  previewGradient: string; // Swatch preview gradient
  cardBg: string; // Surface container background
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  headerBg: string;
  inputBg: string;
  orb: {
    outerGlow: string;
    membrane1: string;
    membrane2: string;
    coreGradient: string;
    coreShadow: string;
    particles: [string, string];
  };
}

export const TEN_THEMES: ThemeDefinition[] = [
  {
    id: 'royal-midnight-purple',
    name: 'Royal Midnight Purple',
    tagline: 'Deep obsidian violet fading to black',
    mode: 'dark',
    primaryColor: '#a855f7',
    secondaryColor: '#3b0764',
    bgGradient: 'linear-gradient(180deg, #4c1d95 0%, #2e1065 28%, #17072b 62%, #05010a 100%)',
    previewGradient: 'from-purple-800 via-purple-950 to-black',
    cardBg: 'bg-purple-950/40 backdrop-blur-md',
    cardBorder: 'border-purple-500/30',
    textPrimary: 'text-purple-50',
    textSecondary: 'text-purple-200/70',
    headerBg: 'bg-purple-950/60 backdrop-blur-md border-purple-800/40',
    inputBg: 'bg-purple-950/70 border-purple-700/50 text-white',
    orb: {
      outerGlow: 'bg-purple-600/40',
      membrane1: 'bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-indigo-900',
      membrane2: 'bg-gradient-to-br from-fuchsia-500 via-purple-600 to-slate-900',
      coreGradient: 'from-purple-200 via-purple-100 to-white',
      coreShadow: 'rgba(168, 85, 247, 0.7)',
      particles: ['#c084fc', '#e879f9'],
    },
  },
  {
    id: 'champagne-silk-ivory',
    name: 'Champagne Silk Ivory',
    tagline: 'Warm toasted cream and golden almond sand',
    mode: 'light',
    primaryColor: '#b45309',
    secondaryColor: '#fef3c7',
    bgGradient: 'linear-gradient(135deg, #fffdfa 0%, #fbf6ee 30%, #f3e6d3 70%, #e0caa8 100%)',
    previewGradient: 'from-amber-50 via-amber-100 to-amber-300',
    cardBg: 'bg-amber-50/80 backdrop-blur-md',
    cardBorder: 'border-amber-200/80',
    textPrimary: 'text-amber-950',
    textSecondary: 'text-amber-800/80',
    headerBg: 'bg-amber-50/75 backdrop-blur-md border-amber-200/60',
    inputBg: 'bg-white/90 border-amber-300/60 text-amber-950',
    orb: {
      outerGlow: 'bg-amber-400/30',
      membrane1: 'bg-gradient-to-tr from-amber-400 via-orange-300 to-yellow-200',
      membrane2: 'bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-400',
      coreGradient: 'from-amber-100 via-white to-yellow-50',
      coreShadow: 'rgba(217, 119, 6, 0.5)',
      particles: ['#f59e0b', '#fbbf24'],
    },
  },
  {
    id: 'peach-blossom-sunset',
    name: 'Peach Blossom Sunset',
    tagline: 'Radiant apricot peach to strawberry rose pink',
    mode: 'light',
    primaryColor: '#ec4899',
    secondaryColor: '#f43f5e',
    bgGradient: 'linear-gradient(180deg, #ffedd5 0%, #fed7aa 25%, #fce7f3 65%, #f472b6 100%)',
    previewGradient: 'from-orange-200 via-pink-200 to-rose-400',
    cardBg: 'bg-pink-50/80 backdrop-blur-md',
    cardBorder: 'border-pink-200/80',
    textPrimary: 'text-rose-950',
    textSecondary: 'text-rose-800/80',
    headerBg: 'bg-pink-50/75 backdrop-blur-md border-pink-200/60',
    inputBg: 'bg-white/90 border-rose-300/60 text-rose-950',
    orb: {
      outerGlow: 'bg-pink-500/35',
      membrane1: 'bg-gradient-to-tr from-rose-400 via-pink-500 to-orange-400',
      membrane2: 'bg-gradient-to-br from-pink-400 via-rose-400 to-amber-300',
      coreGradient: 'from-rose-100 via-white to-orange-50',
      coreShadow: 'rgba(244, 114, 182, 0.6)',
      particles: ['#fb7185', '#f472b6'],
    },
  },
  {
    id: 'aqua-cyan-horizon',
    name: 'Aqua Cyan Horizon',
    tagline: 'Crystal clear sky turquoise and Caribbean water',
    mode: 'light',
    primaryColor: '#06b6d4',
    secondaryColor: '#0284c7',
    bgGradient: 'linear-gradient(180deg, #ecfeff 0%, #cffafe 30%, #67e8f9 70%, #06b6d4 100%)',
    previewGradient: 'from-cyan-100 via-cyan-300 to-teal-500',
    cardBg: 'bg-cyan-50/80 backdrop-blur-md',
    cardBorder: 'border-cyan-200/80',
    textPrimary: 'text-cyan-950',
    textSecondary: 'text-cyan-800/80',
    headerBg: 'bg-cyan-50/75 backdrop-blur-md border-cyan-200/60',
    inputBg: 'bg-white/90 border-cyan-300/60 text-cyan-950',
    orb: {
      outerGlow: 'bg-cyan-400/40',
      membrane1: 'bg-gradient-to-tr from-cyan-400 via-teal-400 to-blue-500',
      membrane2: 'bg-gradient-to-br from-teal-300 via-cyan-500 to-sky-500',
      coreGradient: 'from-cyan-100 via-white to-teal-50',
      coreShadow: 'rgba(6, 182, 212, 0.6)',
      particles: ['#22d3ee', '#38bdf8'],
    },
  },
  {
    id: 'cosmic-blue-nebula',
    name: 'Cosmic Blue Nebula',
    tagline: 'Deep space void with glowing neon AI core',
    mode: 'dark',
    primaryColor: '#38bdf8',
    secondaryColor: '#1d4ed8',
    bgGradient: 'radial-gradient(circle at 50% 45%, #0369a1 0%, #0c2340 32%, #020712 68%, #000000 100%)',
    previewGradient: 'from-sky-500 via-blue-950 to-black',
    cardBg: 'bg-slate-900/60 backdrop-blur-md',
    cardBorder: 'border-sky-500/30',
    textPrimary: 'text-sky-50',
    textSecondary: 'text-sky-200/70',
    headerBg: 'bg-slate-950/70 backdrop-blur-md border-sky-900/40',
    inputBg: 'bg-slate-900/80 border-sky-700/50 text-white',
    orb: {
      outerGlow: 'bg-sky-500/50',
      membrane1: 'bg-gradient-to-tr from-sky-400 via-blue-600 to-indigo-900',
      membrane2: 'bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-700',
      coreGradient: 'from-sky-200 via-cyan-100 to-white',
      coreShadow: 'rgba(56, 189, 248, 0.8)',
      particles: ['#38bdf8', '#60a5fa'],
    },
  },
  {
    id: 'minimal-silver-frost',
    name: 'Minimal Silver Frost',
    tagline: 'Clean studio pure white to light silver mist',
    mode: 'light',
    primaryColor: '#475569',
    secondaryColor: '#0f172a',
    bgGradient: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 40%, #e2e8f0 82%, #cbd5e1 100%)',
    previewGradient: 'from-white via-slate-100 to-slate-300',
    cardBg: 'bg-white/85 backdrop-blur-md',
    cardBorder: 'border-slate-200/90',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-600',
    headerBg: 'bg-white/80 backdrop-blur-md border-slate-200/80',
    inputBg: 'bg-white border-slate-300 text-slate-900',
    orb: {
      outerGlow: 'bg-slate-400/25',
      membrane1: 'bg-gradient-to-tr from-slate-400 via-slate-300 to-slate-500',
      membrane2: 'bg-gradient-to-br from-slate-300 via-slate-400 to-slate-200',
      coreGradient: 'from-white via-slate-50 to-slate-100',
      coreShadow: 'rgba(100, 116, 139, 0.4)',
      particles: ['#94a3b8', '#64748b'],
    },
  },
  {
    id: 'mint-matcha-breeze',
    name: 'Mint Matcha Breeze',
    tagline: 'Organic fresh mint to soft herbal sage green',
    mode: 'light',
    primaryColor: '#10b981',
    secondaryColor: '#059669',
    bgGradient: 'linear-gradient(145deg, #f0fdf4 0%, #dcfce7 35%, #a7f3d0 70%, #4ade80 100%)',
    previewGradient: 'from-emerald-100 via-green-200 to-emerald-400',
    cardBg: 'bg-emerald-50/80 backdrop-blur-md',
    cardBorder: 'border-emerald-200/80',
    textPrimary: 'text-emerald-950',
    textSecondary: 'text-emerald-800/80',
    headerBg: 'bg-emerald-50/75 backdrop-blur-md border-emerald-200/60',
    inputBg: 'bg-white/90 border-emerald-300/60 text-emerald-950',
    orb: {
      outerGlow: 'bg-emerald-400/35',
      membrane1: 'bg-gradient-to-tr from-emerald-400 via-teal-400 to-green-500',
      membrane2: 'bg-gradient-to-br from-green-300 via-emerald-400 to-teal-400',
      coreGradient: 'from-emerald-100 via-white to-green-50',
      coreShadow: 'rgba(16, 185, 129, 0.6)',
      particles: ['#34d399', '#6ee7b7'],
    },
  },
  {
    id: 'lilac-lavender-twilight',
    name: 'Lilac Lavender Twilight',
    tagline: 'Dreamy soft lavender mist and violet twilight clouds',
    mode: 'light',
    primaryColor: '#8b5cf6',
    secondaryColor: '#7c3aed',
    bgGradient: 'linear-gradient(180deg, #faf5ff 0%, #f3e8ff 30%, #e9d5ff 65%, #c084fc 100%)',
    previewGradient: 'from-purple-100 via-fuchsia-200 to-purple-400',
    cardBg: 'bg-purple-50/80 backdrop-blur-md',
    cardBorder: 'border-purple-200/80',
    textPrimary: 'text-purple-950',
    textSecondary: 'text-purple-800/80',
    headerBg: 'bg-purple-50/75 backdrop-blur-md border-purple-200/60',
    inputBg: 'bg-white/90 border-purple-300/60 text-purple-950',
    orb: {
      outerGlow: 'bg-purple-400/35',
      membrane1: 'bg-gradient-to-tr from-purple-400 via-fuchsia-400 to-violet-500',
      membrane2: 'bg-gradient-to-br from-violet-300 via-purple-400 to-fuchsia-400',
      coreGradient: 'from-purple-100 via-white to-fuchsia-50',
      coreShadow: 'rgba(139, 92, 246, 0.6)',
      particles: ['#a855f7', '#c084fc'],
    },
  },
  {
    id: 'arctic-cloud-ethereal',
    name: 'Arctic Cloud Ethereal',
    tagline: 'Gossamer pale white and serene powder blue sky',
    mode: 'light',
    primaryColor: '#0284c7',
    secondaryColor: '#0369a1',
    bgGradient: 'linear-gradient(180deg, #ffffff 0%, #f0f9ff 35%, #e0f2fe 70%, #bae6fd 100%)',
    previewGradient: 'from-white via-sky-100 to-sky-300',
    cardBg: 'bg-sky-50/80 backdrop-blur-md',
    cardBorder: 'border-sky-200/80',
    textPrimary: 'text-sky-950',
    textSecondary: 'text-sky-800/80',
    headerBg: 'bg-sky-50/75 backdrop-blur-md border-sky-200/60',
    inputBg: 'bg-white/90 border-sky-300/60 text-sky-950',
    orb: {
      outerGlow: 'bg-sky-400/35',
      membrane1: 'bg-gradient-to-tr from-sky-400 via-cyan-400 to-blue-400',
      membrane2: 'bg-gradient-to-br from-blue-300 via-sky-400 to-cyan-300',
      coreGradient: 'from-sky-100 via-white to-blue-50',
      coreShadow: 'rgba(2, 132, 199, 0.5)',
      particles: ['#38bdf8', '#7dd3fc'],
    },
  },
  {
    id: 'deep-midnight-navy',
    name: 'Deep Midnight Navy',
    tagline: 'Deep sapphire navy blue descending into pitch obsidian',
    mode: 'dark',
    primaryColor: '#60a5fa',
    secondaryColor: '#1e3a8a',
    bgGradient: 'linear-gradient(180deg, #1e293b 0%, #0f172a 30%, #060d1d 65%, #020617 100%)',
    previewGradient: 'from-slate-800 via-blue-950 to-black',
    cardBg: 'bg-slate-900/60 backdrop-blur-md',
    cardBorder: 'border-blue-500/30',
    textPrimary: 'text-blue-50',
    textSecondary: 'text-blue-200/70',
    headerBg: 'bg-slate-950/70 backdrop-blur-md border-blue-900/40',
    inputBg: 'bg-slate-900/80 border-blue-700/50 text-white',
    orb: {
      outerGlow: 'bg-blue-600/40',
      membrane1: 'bg-gradient-to-tr from-blue-600 via-indigo-700 to-slate-900',
      membrane2: 'bg-gradient-to-br from-indigo-500 via-blue-600 to-slate-950',
      coreGradient: 'from-blue-200 via-blue-100 to-white',
      coreShadow: 'rgba(96, 165, 250, 0.7)',
      particles: ['#60a5fa', '#93c5fd'],
    },
  },
];

export function getThemeById(id?: string): ThemeDefinition {
  if (!id) return TEN_THEMES[0];
  const found = TEN_THEMES.find((t) => t.id === id);
  if (found) return found;

  // Legacy mappings
  if (id === 'royal-violet') return TEN_THEMES[0];
  if (id === 'electric-cyan') return TEN_THEMES[3];
  if (id === 'emerald-glow') return TEN_THEMES[6];
  if (id === 'blue-purple') return TEN_THEMES[4];

  return TEN_THEMES[0];
}
