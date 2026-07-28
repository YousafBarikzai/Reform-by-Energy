// Static frontend data: brand imagery for shell screens and the icon set.
// All member/studio content now comes from the API.
import heroReformer from './assets/images/hero-reformer.jpg'
import wellnessHero from './assets/images/wellness-hero.jpg'

export const IMAGES = { heroReformer, wellnessHero }

// Simple stroke icon paths (24×24 viewBox)
export const ICONS = {
  home: 'M3 10.5 12 3l9 7.5V21h-6v-6h-6v6H3z',
  calendar: 'M7 3v3M17 3v3M4 6h16v14H4zM4 10h16',
  tag: 'M4 4h7l9 9-7 7-9-9zM8.5 8.5h.01',
  play: 'M4 5h16v14H4zM10 9.5l5 2.5-5 2.5z',
  user: 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 3.6-6 8-6s8 2 8 6',
  bell: 'M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10.5 20a2 2 0 0 0 3 0',
  gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2-1.2L14.2 3h-4l-.4 2.7a7 7 0 0 0-2 1.2l-2.3-1-2 3.4 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2 1.2l.4 2.7h4l.4-2.7a7 7 0 0 0 2-1.2l2.3 1 2-3.4-2-1.5c.06-.4.1-.8.1-1.2z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3.5 2',
  pin: 'M12 21s-7-6-7-11a7 7 0 1 1 14 0c0 5-7 11-7 11zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  check: 'M5 12.5 10 17.5 19 7',
  chevron: 'M9 5l7 7-7 7',
  heart: 'M12 20s-7.5-4.6-9.3-9A5.2 5.2 0 0 1 12 6.6 5.2 5.2 0 0 1 21.3 11c-1.8 4.4-9.3 9-9.3 9z',
  card: 'M3 6h18v12H3zM3 10h18',
  help: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.5 9a2.5 2.5 0 0 1 4.9.8c0 1.6-2.4 2.2-2.4 3.7M12 17h.01',
  mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
  logout: 'M14 4h-9v16h9M10 12h11M18 8.5 21.5 12 18 15.5',
  booking: 'M6 3h12v18l-6-4-6 4z',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM16.5 16.5 21 21',
  plus: 'M12 5v14M5 12h14',
  camera: 'M4 7h3l2-2h6l2 2h3v12H4zM12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',
  ruler: 'M3 8h18v8H3zM7 8v3M11 8v4M15 8v3M19 8v4',
  flame: 'M12 3c1 3-1 4-1 6a2.5 2.5 0 0 0 5 .5C18 12 19 13.5 19 16a7 7 0 1 1-14 0c0-4 3-5.5 4-8 .8 1 1.2 1.8 1.2 3A9 9 0 0 1 12 3z',
  trophy: 'M7 4h10v5a5 5 0 0 1-10 0zM7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3M12 14v3M8 21h8M9 17h6',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.9 2.1L22 19l-2.1.9L19 22l-.9-2.1L16 19l2.1-.9z',
  mirror: 'M12 3a7 7 0 0 1 7 7c0 5-3 8-7 8s-7-3-7-8a7 7 0 0 1 7-7zM12 18v3M8 21h8',
  drop: 'M12 3c3.5 4.5 6 7.6 6 11a6 6 0 1 1-12 0c0-3.4 2.5-6.5 6-11z',
  moon: 'M20 14A8 8 0 1 1 10 4a7 7 0 0 0 10 10z',
  sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19',
  music: 'M9 18V6l10-2v12M9 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zM19 16a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z',
  watch: 'M8 8h8v8H8zM9 8l.7-4h4.6L15 8M9 16l.7 4h4.6l.7-4',
  qr: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h3v3h-3zM20 17v3h-3',
  shield: 'M12 3l8 3v6c0 5-3.5 7.7-8 9-4.5-1.3-8-4-8-9V6z',
  download: 'M12 3v11M7.5 10 12 14.5 16.5 10M4 18h16v3H4z',
  filter: 'M4 6h16M7 12h10M10 18h4',
  fullBody: 'M12 3a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM8 10h8l-1.5 4H14v7h-4v-7H9.5z',
  lowerBody: 'M9 3h6l-1 8 3 9h-3l-2.5-7L9 20H6l3-9z',
  core: 'M12 4c3 2.5 4.5 5 4.5 8s-1.5 5.5-4.5 8c-3-2.5-4.5-5-4.5-8s1.5-5.5 4.5-8zM12 9.5v5',
  arms: 'M4 15l4-4 3 1 4-6 5 2-2 4h-4l-3 6-5-1z',
  stretch: 'M5 19c3-1 5-3 6-6M13 5a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM8 11l4-1 4 3 3 6M12 10l-1 5',
}

export const CATEGORY_ICONS = {
  'Full Body': ICONS.fullBody,
  'Lower Body': ICONS.lowerBody,
  'Core': ICONS.core,
  'Arms': ICONS.arms,
  'Stretch': ICONS.stretch,
  'Prenatal': ICONS.heart,
}
