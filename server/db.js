// Node's built-in SQLite driver: zero native npm dependencies, so deploys
// can never break on prebuilt-binary/ABI mismatches (requires Node >= 22.5).
import { DatabaseSync } from 'node:sqlite'
import fs from 'node:fs'
import path from 'node:path'
import { hashPassword } from './auth.js'
import { seed, seedPublicContent } from './seed.js'

export const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data')
fs.mkdirSync(DATA_DIR, { recursive: true })
fs.mkdirSync(path.join(DATA_DIR, 'uploads'), { recursive: true })

export const db = new DatabaseSync(path.join(DATA_DIR, 'reform.db'))
db.exec('PRAGMA journal_mode = WAL')
db.exec('PRAGMA foreign_keys = ON')

// transaction helper (node:sqlite has no .transaction like better-sqlite3)
export function tx(fn) {
  db.exec('BEGIN')
  try {
    const result = fn()
    db.exec('COMMIT')
    return result
  } catch (err) {
    db.exec('ROLLBACK')
    throw err
  }
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS members (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  pass_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'member',
  photo TEXT,
  membership_number TEXT UNIQUE,
  referral_code TEXT UNIQUE,
  prefs TEXT NOT NULL DEFAULT '{}',
  guest_passes INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT
);
CREATE TABLE IF NOT EXISTS auth_tokens (
  token TEXT PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS reset_tokens (
  token TEXT PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id),
  expires_at TEXT NOT NULL,
  used_at TEXT
);
CREATE TABLE IF NOT EXISTS instructors (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT DEFAULT '',
  photo TEXT,
  specialties TEXT DEFAULT '',
  active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS class_types (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  level TEXT NOT NULL DEFAULT 'All levels',
  category TEXT NOT NULL DEFAULT 'Full Body',
  duration_min INTEGER NOT NULL DEFAULT 50,
  image TEXT,
  active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS studios (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  cols INTEGER NOT NULL DEFAULT 4,
  entrance TEXT NOT NULL DEFAULT 'bottom'
);
CREATE TABLE IF NOT EXISTS reformers (
  id INTEGER PRIMARY KEY,
  studio_id INTEGER NOT NULL REFERENCES studios(id),
  number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'ok'
);
CREATE TABLE IF NOT EXISTS class_sessions (
  id INTEGER PRIMARY KEY,
  class_type_id INTEGER NOT NULL REFERENCES class_types(id),
  instructor_id INTEGER NOT NULL REFERENCES instructors(id),
  studio_id INTEGER NOT NULL REFERENCES studios(id),
  starts_at TEXT NOT NULL,
  duration_min INTEGER NOT NULL,
  capacity INTEGER NOT NULL,
  cutoff_min INTEGER NOT NULL DEFAULT 60,
  playlist_id INTEGER,
  status TEXT NOT NULL DEFAULT 'scheduled'
);
CREATE INDEX IF NOT EXISTS idx_sessions_start ON class_sessions(starts_at);
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES class_sessions(id),
  member_id INTEGER NOT NULL REFERENCES members(id),
  reformer_id INTEGER REFERENCES reformers(id),
  status TEXT NOT NULL DEFAULT 'booked',
  booked_at TEXT NOT NULL DEFAULT (datetime('now')),
  cancelled_at TEXT,
  attended INTEGER NOT NULL DEFAULT 0,
  rating INTEGER,
  notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_bookings_member ON bookings(member_id);
CREATE INDEX IF NOT EXISTS idx_bookings_session ON bookings(session_id);
CREATE TABLE IF NOT EXISTS waitlist (
  id INTEGER PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES class_sessions(id),
  member_id INTEGER NOT NULL REFERENCES members(id),
  joined_at TEXT NOT NULL DEFAULT (datetime('now')),
  promoted_at TEXT,
  UNIQUE(session_id, member_id)
);
CREATE TABLE IF NOT EXISTS packages (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'pack',
  price_cents INTEGER NOT NULL,
  classes INTEGER,
  validity_days INTEGER NOT NULL DEFAULT 90,
  description TEXT DEFAULT '',
  terms TEXT DEFAULT '',
  popular INTEGER NOT NULL DEFAULT 0,
  intro INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  sort INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS member_packages (
  id INTEGER PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id),
  package_id INTEGER NOT NULL REFERENCES packages(id),
  purchased_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  credits_total INTEGER,
  credits_left INTEGER,
  status TEXT NOT NULL DEFAULT 'active',
  receipt_no TEXT
);
CREATE TABLE IF NOT EXISTS purchases (
  id INTEGER PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id),
  package_id INTEGER REFERENCES packages(id),
  amount_cents INTEGER NOT NULL,
  method TEXT NOT NULL DEFAULT 'demo',
  receipt_no TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS point_rules (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  points INTEGER NOT NULL,
  active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS points_ledger (
  id INTEGER PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id),
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  ref TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_points_member ON points_ledger(member_id);
CREATE TABLE IF NOT EXISTS rewards (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  cost_points INTEGER NOT NULL,
  kind TEXT NOT NULL DEFAULT 'perk',
  expiry_days INTEGER,
  active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS reward_redemptions (
  id INTEGER PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id),
  reward_id INTEGER NOT NULL REFERENCES rewards(id),
  code TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT,
  status TEXT NOT NULL DEFAULT 'issued'
);
CREATE TABLE IF NOT EXISTS badges (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '✦',
  description TEXT DEFAULT ''
);
CREATE TABLE IF NOT EXISTS member_badges (
  member_id INTEGER NOT NULL REFERENCES members(id),
  badge_id INTEGER NOT NULL REFERENCES badges(id),
  earned_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY(member_id, badge_id)
);
CREATE TABLE IF NOT EXISTS challenges (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  rules TEXT DEFAULT '',
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  goal_type TEXT NOT NULL DEFAULT 'classes',
  goal_count INTEGER NOT NULL DEFAULT 10,
  reward_points INTEGER NOT NULL DEFAULT 100,
  badge_id INTEGER REFERENCES badges(id),
  leaderboard INTEGER NOT NULL DEFAULT 1,
  active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS challenge_members (
  challenge_id INTEGER NOT NULL REFERENCES challenges(id),
  member_id INTEGER NOT NULL REFERENCES members(id),
  joined_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT,
  PRIMARY KEY(challenge_id, member_id)
);
CREATE TABLE IF NOT EXISTS wellness_checkins (
  id INTEGER PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id),
  date TEXT NOT NULL,
  mood INTEGER NOT NULL,
  energy INTEGER NOT NULL,
  sleep INTEGER NOT NULL,
  stress INTEGER NOT NULL,
  soreness INTEGER NOT NULL,
  water INTEGER NOT NULL,
  wellbeing INTEGER NOT NULL,
  note TEXT,
  score INTEGER NOT NULL,
  UNIQUE(member_id, date)
);
CREATE TABLE IF NOT EXISTS goals (
  id INTEGER PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id),
  title TEXT NOT NULL,
  target_date TEXT,
  done INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS measurements (
  id INTEGER PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id),
  date TEXT NOT NULL,
  weight_kg REAL,
  chest_cm REAL,
  waist_cm REAL,
  hips_cm REAL,
  arm_cm REAL,
  thigh_cm REAL,
  note TEXT
);
CREATE TABLE IF NOT EXISTS progress_photos (
  id INTEGER PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id),
  taken_at TEXT NOT NULL DEFAULT (datetime('now')),
  file TEXT NOT NULL,
  caption TEXT
);
CREATE TABLE IF NOT EXISTS library_items (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'exercise',
  category TEXT NOT NULL DEFAULT 'Full Body',
  level TEXT NOT NULL DEFAULT 'All levels',
  duration_min INTEGER NOT NULL DEFAULT 10,
  image TEXT,
  video_url TEXT,
  summary TEXT DEFAULT '',
  content TEXT NOT NULL DEFAULT '{}',
  muscles TEXT DEFAULT '',
  instructor_id INTEGER REFERENCES instructors(id),
  published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS library_member (
  member_id INTEGER NOT NULL REFERENCES members(id),
  item_id INTEGER NOT NULL REFERENCES library_items(id),
  fav INTEGER NOT NULL DEFAULT 0,
  completed INTEGER NOT NULL DEFAULT 0,
  in_routine INTEGER NOT NULL DEFAULT 0,
  viewed_at TEXT,
  PRIMARY KEY(member_id, item_id)
);
CREATE TABLE IF NOT EXISTS playlists (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  cover TEXT,
  platform TEXT NOT NULL DEFAULT 'spotify',
  url TEXT NOT NULL,
  instructor_id INTEGER REFERENCES instructors(id)
);
CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  pinned INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id),
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT DEFAULT '',
  link TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  read_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_notifications_member ON notifications(member_id);
CREATE TABLE IF NOT EXISTS push_subs (
  id INTEGER PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id),
  endpoint TEXT UNIQUE NOT NULL,
  keys_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS motivations (
  id INTEGER PRIMARY KEY,
  text TEXT NOT NULL,
  author TEXT DEFAULT ''
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS testimonials (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  text TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS faqs (
  id INTEGER PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES members(id),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  detail TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`

db.exec(SCHEMA)

// lightweight migrations for databases created before these columns existed
try { db.exec(`ALTER TABLE instructors ADD COLUMN quals TEXT DEFAULT ''`) } catch { /* exists */ }

const isEmpty = !db.prepare('SELECT id FROM members LIMIT 1').get()
if (isEmpty) {
  seed(db, hashPassword)
  console.log('[db] seeded fresh database at', DATA_DIR)
}
seedPublicContent(db) // idempotent: fills testimonials/faqs/quals on older databases too

export function getSetting(key) {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key)
  return row ? row.value : null
}
export function setSetting(key, value) {
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(key, value)
}
