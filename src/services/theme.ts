import { TemaWarnaId } from '../types';

export interface ThemeConfig {
  id: TemaWarnaId;
  name: string;
  category: string;
  tagline: string;
  hex: string;
  secondaryHex: string;
  cssVars: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    bannerGradientStart: string;
    bannerGradientEnd: string;
  };
  classes: {
    // Sidebar
    activeNav: string;
    activeNavCetak: string;
    sidebarBadge: string;
    // Buttons
    buttonPrimary: string;
    buttonLight: string;
    // Banners & Cards
    bannerGradient: string;
    bannerBadge: string;
    cardBorderHover: string;
    // Badges & Accents
    badge: string;
    iconBox: string;
    iconText: string;
    accentText: string;
    accentBorder: string;
    accentBgLight: string;
    focusRing: string;
    // Quick Action button in Dashboard
    quickActionBorderHover: string;
    quickActionBg: string;
    // App background
    appBg: string;
  };
}

export const THEME_LIST: ThemeConfig[] = [
  {
    id: 'blue',
    name: 'Biru Edukasi',
    category: 'Resmi Kedinasan',
    tagline: 'Nuansa biru resmi standar kedinasan pendidikan nasional',
    hex: '#2563eb',
    secondaryHex: '#1d4ed8',
    cssVars: {
      primary: '#2563eb',
      primaryLight: '#eff6ff',
      primaryDark: '#1e40af',
      bannerGradientStart: '#1e3a8a',
      bannerGradientEnd: '#0f172a',
    },
    classes: {
      activeNav: 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30',
      activeNavCetak: 'bg-blue-600/30 text-blue-300 font-semibold border border-blue-500/30',
      sidebarBadge: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
      buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs',
      buttonLight: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200',
      bannerGradient: 'from-blue-900 via-indigo-900 to-slate-900',
      bannerBadge: 'bg-blue-500/20 text-blue-200 border-blue-400/30',
      cardBorderHover: 'hover:border-blue-400',
      badge: 'bg-blue-50 text-blue-700 border border-blue-200',
      iconBox: 'bg-blue-50 text-blue-600 border border-blue-100',
      iconText: 'text-blue-600',
      accentText: 'text-blue-600',
      accentBorder: 'border-blue-500',
      accentBgLight: 'bg-blue-50/50',
      focusRing: 'focus:ring-blue-500',
      quickActionBorderHover: 'hover:border-blue-400 hover:bg-blue-50/50',
      quickActionBg: 'bg-blue-100 text-blue-700',
      appBg: 'bg-slate-100',
    },
  },
  {
    id: 'emerald',
    name: 'Hijau Zamrud',
    category: 'Religi & Asri',
    tagline: 'Nuansa segar, asri, menyejukkan mata, dan bernuansa madrasah/religi',
    hex: '#059669',
    secondaryHex: '#047857',
    cssVars: {
      primary: '#059669',
      primaryLight: '#ecfdf5',
      primaryDark: '#065f46',
      bannerGradientStart: '#064e3b',
      bannerGradientEnd: '#0f172a',
    },
    classes: {
      activeNav: 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/30',
      activeNavCetak: 'bg-emerald-600/30 text-emerald-300 font-semibold border border-emerald-500/30',
      sidebarBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
      buttonPrimary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs',
      buttonLight: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200',
      bannerGradient: 'from-emerald-950 via-teal-900 to-slate-900',
      bannerBadge: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
      cardBorderHover: 'hover:border-emerald-400',
      badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      iconBox: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      iconText: 'text-emerald-600',
      accentText: 'text-emerald-600',
      accentBorder: 'border-emerald-500',
      accentBgLight: 'bg-emerald-50/50',
      focusRing: 'focus:ring-emerald-500',
      quickActionBorderHover: 'hover:border-emerald-400 hover:bg-emerald-50/50',
      quickActionBg: 'bg-emerald-100 text-emerald-700',
      appBg: 'bg-slate-100',
    },
  },
  {
    id: 'indigo',
    name: 'Nila Nusantara',
    category: 'Akademik Modern',
    tagline: 'Perpaduan biru tua dan ungu gelap yang anggun, bijaksana, dan prestisius',
    hex: '#4f46e5',
    secondaryHex: '#4338ca',
    cssVars: {
      primary: '#4f46e5',
      primaryLight: '#eef2ff',
      primaryDark: '#3730a3',
      bannerGradientStart: '#312e81',
      bannerGradientEnd: '#0f172a',
    },
    classes: {
      activeNav: 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30',
      activeNavCetak: 'bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/30',
      sidebarBadge: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30',
      buttonPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs',
      buttonLight: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200',
      bannerGradient: 'from-indigo-950 via-slate-900 to-slate-900',
      bannerBadge: 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30',
      cardBorderHover: 'hover:border-indigo-400',
      badge: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
      iconBox: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
      iconText: 'text-indigo-600',
      accentText: 'text-indigo-600',
      accentBorder: 'border-indigo-500',
      accentBgLight: 'bg-indigo-50/50',
      focusRing: 'focus:ring-indigo-500',
      quickActionBorderHover: 'hover:border-indigo-400 hover:bg-indigo-50/50',
      quickActionBg: 'bg-indigo-100 text-indigo-700',
      appBg: 'bg-slate-100',
    },
  },
  {
    id: 'violet',
    name: 'Ungu Royal',
    category: 'Kreatif & Inspiratif',
    tagline: 'Warna ungu megah yang mendorong kreativitas, inovasi, dan suasana elegan',
    hex: '#7c3aed',
    secondaryHex: '#6d28d9',
    cssVars: {
      primary: '#7c3aed',
      primaryLight: '#f5f3ff',
      primaryDark: '#5b21b6',
      bannerGradientStart: '#4c1d95',
      bannerGradientEnd: '#0f172a',
    },
    classes: {
      activeNav: 'bg-violet-600 text-white font-semibold shadow-md shadow-violet-600/30',
      activeNavCetak: 'bg-violet-600/30 text-violet-300 font-semibold border border-violet-500/30',
      sidebarBadge: 'bg-violet-500/20 text-violet-300 border-violet-400/30',
      buttonPrimary: 'bg-violet-600 hover:bg-violet-700 text-white shadow-xs',
      buttonLight: 'bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200',
      bannerGradient: 'from-purple-950 via-violet-900 to-slate-900',
      bannerBadge: 'bg-violet-500/20 text-violet-200 border-violet-400/30',
      cardBorderHover: 'hover:border-violet-400',
      badge: 'bg-violet-50 text-violet-700 border border-violet-200',
      iconBox: 'bg-violet-50 text-violet-600 border border-violet-100',
      iconText: 'text-violet-600',
      accentText: 'text-violet-600',
      accentBorder: 'border-violet-500',
      accentBgLight: 'bg-violet-50/50',
      focusRing: 'focus:ring-violet-500',
      quickActionBorderHover: 'hover:border-violet-400 hover:bg-violet-50/50',
      quickActionBg: 'bg-violet-100 text-violet-700',
      appBg: 'bg-slate-100',
    },
  },
  {
    id: 'rose',
    name: 'Merah Marun',
    category: 'Semangat Patriotik',
    tagline: 'Nuansa Merah Putih penuh energi, ketegasan, dan semangat mendidik anak bangsa',
    hex: '#e11d48',
    secondaryHex: '#be123c',
    cssVars: {
      primary: '#e11d48',
      primaryLight: '#fff1f2',
      primaryDark: '#9f1239',
      bannerGradientStart: '#881337',
      bannerGradientEnd: '#0f172a',
    },
    classes: {
      activeNav: 'bg-rose-600 text-white font-semibold shadow-md shadow-rose-600/30',
      activeNavCetak: 'bg-rose-600/30 text-rose-300 font-semibold border border-rose-500/30',
      sidebarBadge: 'bg-rose-500/20 text-rose-300 border-rose-400/30',
      buttonPrimary: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs',
      buttonLight: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200',
      bannerGradient: 'from-rose-950 via-red-950 to-slate-900',
      bannerBadge: 'bg-rose-500/20 text-rose-200 border-rose-400/30',
      cardBorderHover: 'hover:border-rose-400',
      badge: 'bg-rose-50 text-rose-700 border border-rose-200',
      iconBox: 'bg-rose-50 text-rose-600 border border-rose-100',
      iconText: 'text-rose-600',
      accentText: 'text-rose-600',
      accentBorder: 'border-rose-500',
      accentBgLight: 'bg-rose-50/50',
      focusRing: 'focus:ring-rose-500',
      quickActionBorderHover: 'hover:border-rose-400 hover:bg-rose-50/50',
      quickActionBg: 'bg-rose-100 text-rose-700',
      appBg: 'bg-slate-100',
    },
  },
  {
    id: 'amber',
    name: 'Jingga Senja',
    category: 'Hangat & Ceria',
    tagline: 'Warna hangat keemasan yang ramah, bersahabat, optimis, dan penuh antusiasme',
    hex: '#d97706',
    secondaryHex: '#b45309',
    cssVars: {
      primary: '#d97706',
      primaryLight: '#fffbeb',
      primaryDark: '#92400e',
      bannerGradientStart: '#78350f',
      bannerGradientEnd: '#0f172a',
    },
    classes: {
      activeNav: 'bg-amber-600 text-white font-semibold shadow-md shadow-amber-600/30',
      activeNavCetak: 'bg-amber-600/30 text-amber-300 font-semibold border border-amber-500/30',
      sidebarBadge: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
      buttonPrimary: 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs',
      buttonLight: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200',
      bannerGradient: 'from-amber-950 via-orange-950 to-slate-900',
      bannerBadge: 'bg-amber-500/20 text-amber-200 border-amber-400/30',
      cardBorderHover: 'hover:border-amber-400',
      badge: 'bg-amber-50 text-amber-800 border border-amber-200',
      iconBox: 'bg-amber-50 text-amber-600 border border-amber-100',
      iconText: 'text-amber-600',
      accentText: 'text-amber-600',
      accentBorder: 'border-amber-500',
      accentBgLight: 'bg-amber-50/50',
      focusRing: 'focus:ring-amber-500',
      quickActionBorderHover: 'hover:border-amber-400 hover:bg-amber-50/50',
      quickActionBg: 'bg-amber-100 text-amber-800',
      appBg: 'bg-slate-100',
    },
  },
  {
    id: 'teal',
    name: 'Teal Pesisir',
    category: 'Bahari & Segar',
    tagline: 'Perpaduan biru laut dan hijau toska yang menenangkan pikiran dan modern',
    hex: '#0d9488',
    secondaryHex: '#0f766e',
    cssVars: {
      primary: '#0d9488',
      primaryLight: '#f0fdfa',
      primaryDark: '#115e59',
      bannerGradientStart: '#134e4a',
      bannerGradientEnd: '#0f172a',
    },
    classes: {
      activeNav: 'bg-teal-600 text-white font-semibold shadow-md shadow-teal-600/30',
      activeNavCetak: 'bg-teal-600/30 text-teal-300 font-semibold border border-teal-500/30',
      sidebarBadge: 'bg-teal-500/20 text-teal-300 border-teal-400/30',
      buttonPrimary: 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs',
      buttonLight: 'bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200',
      bannerGradient: 'from-teal-950 via-cyan-950 to-slate-900',
      bannerBadge: 'bg-teal-500/20 text-teal-200 border-teal-400/30',
      cardBorderHover: 'hover:border-teal-400',
      badge: 'bg-teal-50 text-teal-700 border border-teal-200',
      iconBox: 'bg-teal-50 text-teal-600 border border-teal-100',
      iconText: 'text-teal-600',
      accentText: 'text-teal-600',
      accentBorder: 'border-teal-500',
      accentBgLight: 'bg-teal-50/50',
      focusRing: 'focus:ring-teal-500',
      quickActionBorderHover: 'hover:border-teal-400 hover:bg-teal-50/50',
      quickActionBg: 'bg-teal-100 text-teal-700',
      appBg: 'bg-slate-100',
    },
  },
  {
    id: 'slate',
    name: 'Monokrom Slate',
    category: 'Minimalis & Teduh',
    tagline: 'Gaya monokrom profesional abu-abu netral, nyaman untuk konsentrasi tinggi',
    hex: '#475569',
    secondaryHex: '#334155',
    cssVars: {
      primary: '#475569',
      primaryLight: '#f8fafc',
      primaryDark: '#1e293b',
      bannerGradientStart: '#1e293b',
      bannerGradientEnd: '#0f172a',
    },
    classes: {
      activeNav: 'bg-slate-700 text-white font-semibold shadow-md shadow-slate-700/30',
      activeNavCetak: 'bg-slate-700/40 text-slate-200 font-semibold border border-slate-600/40',
      sidebarBadge: 'bg-slate-700 text-slate-300 border-slate-600',
      buttonPrimary: 'bg-slate-800 hover:bg-slate-900 text-white shadow-xs',
      buttonLight: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300',
      bannerGradient: 'from-slate-900 via-slate-800 to-zinc-900',
      bannerBadge: 'bg-slate-700 text-slate-200 border-slate-600',
      cardBorderHover: 'hover:border-slate-400',
      badge: 'bg-slate-100 text-slate-700 border border-slate-200',
      iconBox: 'bg-slate-100 text-slate-700 border border-slate-200',
      iconText: 'text-slate-700',
      accentText: 'text-slate-700',
      accentBorder: 'border-slate-600',
      accentBgLight: 'bg-slate-100/60',
      focusRing: 'focus:ring-slate-500',
      quickActionBorderHover: 'hover:border-slate-400 hover:bg-slate-100/50',
      quickActionBg: 'bg-slate-200 text-slate-800',
      appBg: 'bg-slate-100',
    },
  },
];

export function getThemeConfig(id?: TemaWarnaId | string | null): ThemeConfig {
  if (!id) return THEME_LIST[0];
  const found = THEME_LIST.find((t) => t.id === id);
  return found || THEME_LIST[0];
}

const THEME_STORAGE_PREFIX = 'sdn3_user_theme_';

export function getStoredUserTheme(
  userId?: string,
  userTema?: TemaWarnaId | string,
  defaultTema?: TemaWarnaId | string
): TemaWarnaId {
  // 1. Check direct user property
  if (userTema && THEME_LIST.some((t) => t.id === userTema)) {
    return userTema as TemaWarnaId;
  }
  // 2. Check local storage for this specific user
  if (userId) {
    const stored = localStorage.getItem(`${THEME_STORAGE_PREFIX}${userId}`);
    if (stored && THEME_LIST.some((t) => t.id === stored)) {
      return stored as TemaWarnaId;
    }
  }
  // 3. Check school-wide default from settings
  if (defaultTema && THEME_LIST.some((t) => t.id === defaultTema)) {
    return defaultTema as TemaWarnaId;
  }
  // 4. Default fallback
  return 'blue';
}

export function saveUserTheme(userId: string, themeId: TemaWarnaId | string): void {
  if (!userId) return;
  localStorage.setItem(`${THEME_STORAGE_PREFIX}${userId}`, themeId);
  localStorage.setItem('sdn3_active_theme', themeId);
}

export function applyThemeToDOM(theme: ThemeConfig): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', theme.id);
  root.style.setProperty('--color-primary', theme.cssVars.primary);
  root.style.setProperty('--color-primary-light', theme.cssVars.primaryLight);
  root.style.setProperty('--color-primary-dark', theme.cssVars.primaryDark);
  root.style.setProperty('--banner-start', theme.cssVars.bannerGradientStart);
  root.style.setProperty('--banner-end', theme.cssVars.bannerGradientEnd);

  // Update theme meta color for mobile browser tab
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', theme.hex);
  }
}
