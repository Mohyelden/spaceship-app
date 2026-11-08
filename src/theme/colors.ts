/**
 * Kid-friendly space palette: deep friendly night sky + bright, high-contrast
 * play colors. Game boards sit on light "paper" cards for easy reading.
 */
export const colors = {
  // Sky
  sky0: '#0F0B2E',
  sky1: '#1D1556',
  sky2: '#2E2284',
  skyGlow: '#5B4BD6',

  // Surfaces
  paper: '#FFFFFF',
  paperSoft: '#F5F3FF',
  paperLine: '#E4E0FA',
  glass: 'rgba(255,255,255,0.10)',
  glassLine: 'rgba(255,255,255,0.18)',

  // Text
  ink: '#1E1A4D',
  inkSoft: '#5D5893',
  inkMuted: '#8F8AB8',
  onDark: '#FFFFFF',
  onDarkSoft: '#C9C3F5',

  // Play colors
  sun: '#FFC83D',
  sunDeep: '#F0A500',
  sunSoft: '#FFF4D1',
  mint: '#22C55E',
  mintDeep: '#15803D',
  mintSoft: '#DCFCE7',
  coral: '#F25F5C',
  coralSoft: '#FFE3E2',
  sea: '#38BDF8',
  seaDeep: '#0284C7',
  seaSoft: '#E0F4FE',
  grape: '#8B5CF6',
  grapeDeep: '#6D28D9',
  grapeSoft: '#EDE6FF',
  peach: '#FB923C',
  pink: '#EC4899',

  locked: '#6B6894',
  black: '#000000',
  white: '#FFFFFF',
  scrim: 'rgba(10, 7, 35, 0.72)',
};

/** Alternating colors used to paint "groups" on rulers (5s, 23s, ...) */
export const groupColors = ['#38BDF8', '#FB923C', '#8B5CF6', '#22C55E', '#EC4899', '#FFC83D'];

export const radii = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 30,
  pill: 999,
};

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

/** Content max width so tablets / desktop browsers don't stretch the UI */
export const MAX_WIDTH = 560;
export const MAX_WIDTH_WIDE = 980;
