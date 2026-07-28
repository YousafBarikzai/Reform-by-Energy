import heroReformer from './assets/images/hero-reformer.jpg'
import classReformer from './assets/images/class-reformer.jpg'
import classCore from './assets/images/class-core.jpg'
import classBarre from './assets/images/class-barre.jpg'
import classYoga from './assets/images/class-yoga.jpg'
import avatarMara from './assets/images/avatar-mara.jpg'
import avatarSofia from './assets/images/avatar-sofia.jpg'
import avatarAva from './assets/images/avatar-ava.jpg'
import profile from './assets/images/profile.jpg'

export const IMAGES = { heroReformer, classReformer, profile }

export const MEMBER = { first: 'Sophie', name: 'Sophie Smith', email: 'sophie@email.com', avatar: profile }

export const INSTRUCTORS = {
  Nikki: avatarMara,
  Laura: avatarSofia,
  Chloe: avatarAva,
}

export const STUDIO = 'Reform Studio'

// Schedule week (per reference: Mon 20 – Sun 26, Wednesday selected)
export const DOWS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
export const dayNum = (i) => 20 + i

export const SESSIONS = [
  { id: 0, time: '8:00', ampm: 'AM', name: 'Reformer Basics', coach: 'Laura' },
  { id: 1, time: '10:00', ampm: 'AM', name: 'Reformer Flow', coach: 'Nikki' },
  { id: 2, time: '12:00', ampm: 'PM', name: 'Core & More', coach: 'Chloe' },
  { id: 3, time: '5:30', ampm: 'PM', name: 'Reformer Sculpt', coach: 'Nikki' },
  { id: 4, time: '6:30', ampm: 'PM', name: 'Stretch & Reset', coach: 'Laura' },
]

export const NEXT_CLASS = {
  name: 'Reformer Flow', focus: 'Full Body', when: 'Today, 10:00 AM',
  studio: STUDIO, coach: 'Nikki', img: classReformer,
}

export const UPCOMING = [
  { id: 2, name: 'Core & More', when: 'May 24, 12:00 PM', coach: 'Nikki' },
  { id: 3, name: 'Reformer Sculpt', when: 'May 25, 5:30 PM', coach: 'Chloe' },
]

export const PACKAGES = [
  { id: '10', name: '10 Class Pack', price: '$260', per: '$26 / class', perks: ['10 Reformer classes', 'Valid for 3 months'], popular: true },
  { id: '5', name: '5 Class Pack', price: '$140', per: '$28 / class', perks: ['5 Reformer classes', 'Valid for 2 months'] },
  { id: '20', name: '20 Class Pack', price: '$480', per: '$24 / class', perks: ['20 Reformer classes', 'Valid for 6 months'] },
  { id: '1', name: 'Single Class', price: '$32', per: '', perks: ['1 Reformer class', 'Valid for 1 month'], compact: true },
]

export const CATEGORIES = ['Full Body', 'Lower Body', 'Core', 'Arms', 'Stretch']

export const WORKOUTS = [
  { name: 'Full Body Flow', dur: '30 min', img: classYoga },
  { name: 'Core Connection', dur: '25 min', img: classCore },
  { name: 'Lower Body Burn', dur: '20 min', img: classBarre },
]

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
  // library categories
  fullBody: 'M12 3a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM8 10h8l-1.5 4H14v7h-4v-7H9.5z',
  lowerBody: 'M9 3h6l-1 8 3 9h-3l-2.5-7L9 20H6l3-9z',
  core: 'M12 4c3 2.5 4.5 5 4.5 8s-1.5 5.5-4.5 8c-3-2.5-4.5-5-4.5-8s1.5-5.5 4.5-8zM12 9.5v5',
  arms: 'M4 15l4-4 3 1 4-6 5 2-2 4h-4l-3 6-5-1z',
  stretch: 'M5 19c3-1 5-3 6-6M13 5a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM8 11l4-1 4 3 3 6M12 10l-1 5',
}
