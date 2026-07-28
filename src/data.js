import heroReformer from './assets/images/hero-reformer.jpg'
import challenge from './assets/images/challenge.jpg'
import wellnessHero from './assets/images/wellness-hero.jpg'
import instructorHero from './assets/images/instructor-hero.jpg'
import maraFeatured from './assets/images/mara-featured.jpg'
import profile from './assets/images/profile.jpg'
import avatarMara from './assets/images/avatar-mara.jpg'
import avatarSofia from './assets/images/avatar-sofia.jpg'
import avatarJonas from './assets/images/avatar-jonas.jpg'
import avatarAva from './assets/images/avatar-ava.jpg'
import classReformer from './assets/images/class-reformer.jpg'
import classBeginnerFlow from './assets/images/class-beginner-flow.jpg'
import classPower from './assets/images/class-power.jpg'
import classCore from './assets/images/class-core.jpg'
import classStretch from './assets/images/class-stretch.jpg'
import classBarre from './assets/images/class-barre.jpg'
import classYoga from './assets/images/class-yoga.jpg'
import classPregnancy from './assets/images/class-pregnancy.jpg'
import story1 from './assets/images/story-1.jpg'
import story2 from './assets/images/story-2.jpg'

export const IMAGES = {
  heroReformer, challenge, wellnessHero, instructorHero, maraFeatured, profile,
  avatarMara, avatarSofia, avatarJonas, avatarAva,
  story1, story2,
}

export const AVATARS = { Mara: avatarMara, Sofia: avatarSofia, Jonas: avatarJonas, Ava: avatarAva }

export const CLASSES = [
  { name: 'Reformer Pilates', dur: 50, level: 'Intermediate', cal: 320, coach: 'Mara Ellison', a: AVATARS.Mara, equip: 'Reformer', spots: 3, cat: 'Reformer', img: classReformer, desc: 'Precision work on the reformer. Slow, controlled resistance builds long, balanced strength — expect focused footwork, carriage flow, and deep core sequences.' },
  { name: 'Beginner Flow', dur: 40, level: 'Beginner', cal: 210, coach: 'Sofia Lind', a: AVATARS.Sofia, equip: 'Mat', spots: 6, cat: 'Mat', img: classBeginnerFlow, desc: 'A gentle introduction to Pilates principles — breath, alignment, and control. Perfect first class, no experience needed.' },
  { name: 'Power Pilates', dur: 45, level: 'Advanced', cal: 400, coach: 'Jonas Verde', a: AVATARS.Jonas, equip: 'Reformer', spots: 2, cat: 'Reformer', img: classPower, desc: 'Athletic tempo on the reformer. Heavier springs, dynamic transitions, and endurance holds for experienced movers.' },
  { name: 'Core Strength', dur: 30, level: 'All levels', cal: 260, coach: 'Mara Ellison', a: AVATARS.Mara, equip: 'Mat + ring', spots: 5, cat: 'Mat', img: classCore, desc: 'Thirty focused minutes on the centre. Ring-assisted work targeting deep abdominals, obliques, and lower back.' },
  { name: 'Stretch & Recover', dur: 35, level: 'Beginner', cal: 140, coach: 'Sofia Lind', a: AVATARS.Sofia, equip: 'Mat', spots: 8, cat: 'Mat', img: classStretch, desc: 'Slow myofascial release and assisted stretching. The class your body asks for after a heavy week.' },
  { name: 'Barre Fusion', dur: 45, level: 'Intermediate', cal: 330, coach: 'Ava Chen', a: AVATARS.Ava, equip: 'Barre', spots: 4, cat: 'Barre', img: classBarre, desc: 'Ballet-inspired sculpt at the barre. Small pulses, long lines, and a playlist that carries you through the burn.' },
  { name: 'Yoga Mobility', dur: 40, level: 'All levels', cal: 180, coach: 'Jonas Verde', a: AVATARS.Jonas, equip: 'Mat', spots: 7, cat: 'Mat', img: classYoga, desc: 'Joint-by-joint mobility flow blending yoga and functional range work. Move better everywhere else.' },
  { name: 'Pregnancy Pilates', dur: 40, level: 'Beginner', cal: 150, coach: 'Sofia Lind', a: AVATARS.Sofia, equip: 'Mat', spots: 6, cat: 'Prenatal', img: classPregnancy, desc: 'Safe, supportive movement for every trimester. Pelvic floor focus, gentle strength, and space to breathe.' },
]

export const TIMES = ['7:00 AM', '9:30 AM', '12:15 PM', '4:45 PM', '6:30 PM', '8:00 PM']
export const SLOT_NOTES = ['Sunrise', '4 spots', 'Lunch', '2 spots', 'Prime', 'Wind down']
export const DOWS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
export const FILTERS = ['All', 'Reformer', 'Mat', 'Barre', 'Prenatal']
export const SESSION_ORDER = [0, 3, 1, 5, 2, 4]
export const SESSION_ROOMS = ['A', 'B', 'A', 'B', 'A', 'C']

export const dayNum = (i) => (27 + i > 31 ? i - 4 : 27 + i)

export const NAV_ITEMS = [
  { id: 'home', label: 'Home', d: 'M3 10.5 12 3l9 7.5V21h-6v-6h-6v6H3z' },
  { id: 'classes', label: 'Classes', d: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z' },
  { id: 'schedule', label: 'Schedule', d: 'M7 3v3M17 3v3M4 6h16v14H4zM4 10h16' },
  { id: 'community', label: 'Community', d: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2 20c0-3.3 3.1-5 7-5s7 1.7 7 5M16.5 10.8A3.2 3.2 0 1 0 15 4.6M17.5 15.2c2.6.5 4.5 2 4.5 4.8' },
  { id: 'profile', label: 'Profile', d: 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 3.6-6 8-6s8 2 8 6' },
]

export const LEADERS = [
  { rank: 1, name: 'Amelie R.', n: 18, avatar: AVATARS.Sofia, rankColor: 'var(--gold)' },
  { rank: 2, name: 'You', n: 16, avatar: AVATARS.Ava, rankColor: 'var(--sage)' },
  { rank: 3, name: 'Daniel K.', n: 14, avatar: AVATARS.Jonas, rankColor: 'var(--sub)' },
]

export const STORIES = [
  { title: 'Six months of mornings', text: '“I came for posture. I stayed for the calm.” — Amelie, member since January.', img: story1 },
  { title: 'Back from injury', text: 'How reformer work brought Daniel back to running after ACL surgery.', img: story2 },
]

export const STATS = [
  { k: 'Classes attended', v: '42', color: 'var(--sage)' },
  { k: 'Hours trained', v: '31.5', color: 'var(--gold)' },
  { k: 'Calories burned', v: '12.4k', color: 'var(--sage)' },
  { k: 'Goals completed', v: '8', color: 'var(--gold)' },
]

export const BAR_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
export const BAR_HEIGHTS = [55, 0, 80, 40, 100, 0, 30]

export const BADGES = [
  { icon: '✦', name: 'First 50', sub: '8 to go', bg: 'var(--goldsoft)', color: 'var(--gold)', op: 1 },
  { icon: '☀', name: 'Early bird', sub: '10 sunrise classes', bg: 'var(--sagesoft)', color: 'var(--sage)', op: 1 },
  { icon: '◈', name: 'Reformer pro', sub: '25 sessions', bg: 'var(--sagesoft)', color: 'var(--sage)', op: 1 },
  { icon: '♾', name: '12-week streak', sub: '3 weeks away', bg: 'var(--stone)', color: 'var(--sub)', op: 0.5 },
]

export const PLANS = [
  { name: '20-Class Pack', tag: 'Best value', sub: 'Valid 6 months · share with family', price: '£340', per: '£17 / class', border: 'var(--gold)' },
  { name: 'Unlimited', tag: '', sub: 'All classes, priority booking', price: '£165', per: 'per month', border: 'var(--line)' },
  { name: 'Student 10-Pack', tag: '', sub: 'Verified students save 20%', price: '£152', per: '£15.20 / class', border: 'var(--line)' },
]

export const RITUALS = [
  { icon: '◠', name: 'Breathing', sub: '4-7-8 · 3 min', bg: 'var(--sagesoft)', color: 'var(--sage)' },
  { icon: '✦', name: 'Stretch library', sub: '24 routines', bg: 'var(--goldsoft)', color: 'var(--gold)' },
  { icon: '☾', name: 'Sleep tips', sub: 'Wind-down guide', bg: 'var(--sagesoft)', color: 'var(--sage)' },
  { icon: '❋', name: 'Nutrition', sub: 'Weekly recipes', bg: 'var(--goldsoft)', color: 'var(--gold)' },
]
