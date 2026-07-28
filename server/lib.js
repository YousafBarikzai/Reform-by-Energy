import { db, getSetting, setSetting } from './db.js'
import { safeParse } from './auth.js'
import webpush from 'web-push'

// ── web push (VAPID keys generated once and stored) ──
let vapidReady = false
export function ensureVapid() {
  if (vapidReady) return
  let pub = getSetting('vapid_public')
  let priv = getSetting('vapid_private')
  if (!pub || !priv) {
    const keys = webpush.generateVAPIDKeys()
    pub = keys.publicKey
    priv = keys.privateKey
    setSetting('vapid_public', pub)
    setSetting('vapid_private', priv)
  }
  webpush.setVapidDetails('mailto:hello@reformbyenergym.com', pub, priv)
  vapidReady = true
}
export const vapidPublicKey = () => { ensureVapid(); return getSetting('vapid_public') }

async function sendPush(memberId, payload) {
  ensureVapid()
  const subs = db.prepare('SELECT * FROM push_subs WHERE member_id = ?').all(memberId)
  for (const sub of subs) {
    try {
      await webpush.sendNotification({ endpoint: sub.endpoint, keys: JSON.parse(sub.keys_json) }, JSON.stringify(payload))
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 410) {
        db.prepare('DELETE FROM push_subs WHERE id = ?').run(sub.id)
      }
    }
  }
}

// ── notifications (rule-based; respects member category preferences) ──
export function notify(memberId, kind, title, body = '', link = null) {
  const member = db.prepare('SELECT prefs FROM members WHERE id = ?').get(memberId)
  if (!member) return
  const prefs = safeParse(member.prefs)
  const cats = prefs.notifications || {}
  const catKey = { reminder: 'reminders', booking: 'bookings', waitlist: 'waitlist', rewards: 'rewards', challenge: 'challenges', announcement: 'announcements', library: 'library', favourite: 'favourites', payment: 'bookings', membership: 'bookings' }[kind] || kind
  if (cats[catKey] === false) return
  db.prepare('INSERT INTO notifications (member_id, kind, title, body, link) VALUES (?, ?, ?, ?, ?)').run(memberId, kind, title, body, link)
  sendPush(memberId, { title, body, link }).catch(() => {})
}

// ── points ──
export function addPoints(memberId, ruleKey, ref = null) {
  const rule = db.prepare('SELECT * FROM point_rules WHERE key = ? AND active = 1').get(ruleKey)
  if (!rule) return 0
  db.prepare('INSERT INTO points_ledger (member_id, delta, reason, ref) VALUES (?, ?, ?, ?)').run(memberId, rule.points, ruleKey, ref)
  return rule.points
}
export function pointsBalance(memberId) {
  return db.prepare('SELECT COALESCE(SUM(delta),0) AS n FROM points_ledger WHERE member_id = ?').get(memberId).n
}
export function pointsLifetime(memberId) {
  return db.prepare('SELECT COALESCE(SUM(delta),0) AS n FROM points_ledger WHERE member_id = ? AND delta > 0').get(memberId).n
}
export function tierFor(lifetime) {
  if (lifetime >= 2500) return 'Ruby'
  if (lifetime >= 1000) return 'Rose'
  return 'Blush'
}

// ── availability ──
export function bookedCount(sessionId) {
  return db.prepare(`SELECT COUNT(*) AS n FROM bookings WHERE session_id = ? AND status = 'booked'`).get(sessionId).n
}
export function availability(session) {
  const booked = bookedCount(session.id)
  const spaces = Math.max(0, session.capacity - booked)
  const waitlistCount = db.prepare('SELECT COUNT(*) AS n FROM waitlist WHERE session_id = ? AND promoted_at IS NULL').get(session.id).n
  const cutoffAt = new Date(new Date(session.starts_at).getTime() - session.cutoff_min * 60000)
  const now = new Date()
  const started = now >= new Date(session.starts_at)
  const pastCutoff = now >= cutoffAt
  let status = 'available'
  if (spaces === 0) status = 'full'
  else if (spaces === 1) status = 'almost_full'
  else if (spaces <= 3) status = 'limited'
  return { booked, spaces, waitlistCount, status, pastCutoff, started, cutoffAt: cutoffAt.toISOString() }
}

export const SESSION_SELECT = `
  SELECT s.*, ct.name AS class_name, ct.level, ct.category, ct.image, ct.description AS class_description,
         i.name AS instructor_name, i.photo AS instructor_photo, st.name AS studio_name
  FROM class_sessions s
  JOIN class_types ct ON ct.id = s.class_type_id
  JOIN instructors i ON i.id = s.instructor_id
  JOIN studios st ON st.id = s.studio_id`

export function sessionView(row, memberId) {
  const avail = availability(row)
  const view = {
    id: row.id, startsAt: row.starts_at, durationMin: row.duration_min, capacity: row.capacity,
    cutoffMin: row.cutoff_min, playlistId: row.playlist_id, status: row.status,
    className: row.class_name, level: row.level, category: row.category, image: row.image,
    description: row.class_description,
    instructor: { id: row.instructor_id, name: row.instructor_name, photo: row.instructor_photo },
    studio: { id: row.studio_id, name: row.studio_name },
    ...avail,
  }
  if (memberId) {
    const mine = db.prepare(`SELECT * FROM bookings WHERE session_id = ? AND member_id = ? AND status = 'booked'`).get(row.id, memberId)
    const onWaitlist = db.prepare('SELECT id FROM waitlist WHERE session_id = ? AND member_id = ? AND promoted_at IS NULL').get(row.id, memberId)
    view.myBookingId = mine?.id || null
    if (mine?.reformer_id) {
      const r = db.prepare('SELECT number, studio_id FROM reformers WHERE id = ?').get(mine.reformer_id)
      view.myReformer = r?.number || null
    }
    view.onWaitlist = !!onWaitlist
  }
  return view
}

// ── credits ──
export function activePackage(memberId) {
  return db.prepare(`
    SELECT mp.*, p.name AS package_name, p.kind, p.classes
    FROM member_packages mp JOIN packages p ON p.id = mp.package_id
    WHERE mp.member_id = ? AND mp.status = 'active' AND datetime(mp.expires_at) > datetime('now')
      AND (mp.credits_left IS NULL OR mp.credits_left > 0)
    ORDER BY mp.expires_at ASC LIMIT 1`).get(memberId)
}
export function consumeCredit(memberId) {
  const pack = activePackage(memberId)
  if (!pack) return null
  if (pack.credits_left !== null) {
    db.prepare('UPDATE member_packages SET credits_left = credits_left - 1 WHERE id = ?').run(pack.id)
    if (pack.credits_left - 1 === 2) {
      notify(memberId, 'membership', 'Package running low', `Only 2 classes left on your ${pack.package_name}.`, '/packages')
    }
  }
  return pack
}
export function refundCredit(memberId, packId) {
  if (!packId) return
  const pack = db.prepare('SELECT * FROM member_packages WHERE id = ?').get(packId)
  if (pack && pack.credits_left !== null) {
    db.prepare('UPDATE member_packages SET credits_left = credits_left + 1 WHERE id = ?').run(packId)
  }
}

// ── attendance stats & streaks (ISO week based) ──
export function attendedBookings(memberId) {
  return db.prepare(`
    ${SESSION_SELECT.replace('SELECT s.*', 'SELECT b.id AS booking_id, b.rating, b.notes, b.reformer_id, s.*')}
    JOIN bookings b ON b.session_id = s.id
    WHERE b.member_id = ? AND b.attended = 1 AND b.status = 'booked'
    ORDER BY s.starts_at DESC`).all(memberId)
}
const weekKey = (d) => {
  const date = new Date(d)
  const day = (date.getDay() + 6) % 7
  const monday = new Date(date.getTime() - day * 864e5)
  return monday.toISOString().slice(0, 10)
}
export function streaks(memberId) {
  const rows = db.prepare(`
    SELECT s.starts_at FROM bookings b JOIN class_sessions s ON s.id = b.session_id
    WHERE b.member_id = ? AND b.attended = 1 AND b.status = 'booked' ORDER BY s.starts_at`).all(memberId)
  const weeks = [...new Set(rows.map((r) => weekKey(r.starts_at)))].sort()
  if (!weeks.length) return { current: 0, longest: 0 }
  let longest = 1, current = 1, run = 1
  for (let i = 1; i < weeks.length; i++) {
    const diff = (new Date(weeks[i]) - new Date(weeks[i - 1])) / (7 * 864e5)
    run = diff === 1 ? run + 1 : 1
    longest = Math.max(longest, run)
  }
  const thisWeek = weekKey(new Date())
  const lastWeek = weekKey(new Date(Date.now() - 7 * 864e5))
  const last = weeks[weeks.length - 1]
  current = last === thisWeek || last === lastWeek ? run : 0
  return { current, longest }
}

// ── badges (rule-based awards, called after attendance changes) ──
export function evaluateBadges(memberId) {
  const attended = db.prepare(`SELECT COUNT(*) AS n FROM bookings WHERE member_id = ? AND attended = 1 AND status='booked'`).get(memberId).n
  const morning = db.prepare(`
    SELECT COUNT(*) AS n FROM bookings b JOIN class_sessions s ON s.id = b.session_id
    WHERE b.member_id = ? AND b.attended = 1 AND b.status='booked' AND CAST(strftime('%H', s.starts_at) AS INT) < 9`).get(memberId).n
  const core = db.prepare(`
    SELECT COUNT(*) AS n FROM bookings b JOIN class_sessions s ON s.id = b.session_id
    JOIN class_types ct ON ct.id = s.class_type_id
    WHERE b.member_id = ? AND b.attended = 1 AND b.status='booked' AND ct.category = 'Core'`).get(memberId).n
  const { longest } = streaks(memberId)
  const rules = [
    [1, attended >= 1], [2, attended >= 10], [5, attended >= 25],
    [3, morning >= 5], [6, core >= 10], [4, longest >= 4], [8, longest >= 8],
  ]
  for (const [badgeId, earned] of rules) {
    if (!earned) continue
    const has = db.prepare('SELECT 1 FROM member_badges WHERE member_id = ? AND badge_id = ?').get(memberId, badgeId)
    if (!has) {
      db.prepare('INSERT INTO member_badges (member_id, badge_id) VALUES (?, ?)').run(memberId, badgeId)
      const badge = db.prepare('SELECT name FROM badges WHERE id = ?').get(badgeId)
      addPoints(memberId, 'milestone', `badge:${badgeId}`)
      notify(memberId, 'rewards', 'New badge earned', `${badge.name} — see it in your progress.`, '/profile/progress')
    }
  }
}

// ── challenges ──
export function challengeProgress(challenge, memberId, joinedAt) {
  const base = `
    SELECT COUNT(*) AS n FROM bookings b JOIN class_sessions s ON s.id = b.session_id
    ${challenge.goal_type === 'core_classes' ? 'JOIN class_types ct ON ct.id = s.class_type_id' : ''}
    WHERE b.member_id = ? AND b.attended = 1 AND b.status='booked'
      AND datetime(s.starts_at) >= datetime(?) AND datetime(s.starts_at) <= datetime(?)`
  const from = joinedAt > challenge.starts_at ? joinedAt : challenge.starts_at
  if (challenge.goal_type === 'classes') return db.prepare(base).get(memberId, from, challenge.ends_at).n
  if (challenge.goal_type === 'morning_classes') {
    return db.prepare(`${base} AND CAST(strftime('%H', s.starts_at) AS INT) < 9`).get(memberId, from, challenge.ends_at).n
  }
  if (challenge.goal_type === 'core_classes') {
    return db.prepare(`${base} AND ct.category = 'Core'`).get(memberId, from, challenge.ends_at).n
  }
  if (challenge.goal_type === 'referrals') {
    const me = db.prepare('SELECT referral_code FROM members WHERE id = ?').get(memberId)
    return db.prepare(`SELECT COUNT(*) AS n FROM members WHERE json_extract(prefs, '$.referredBy') = ? AND created_at >= ?`).get(me.referral_code, from).n
  }
  return 0
}
export function evaluateChallenges(memberId) {
  const joined = db.prepare(`
    SELECT c.*, cm.joined_at, cm.completed_at FROM challenge_members cm
    JOIN challenges c ON c.id = cm.challenge_id
    WHERE cm.member_id = ? AND cm.completed_at IS NULL AND c.active = 1`).all(memberId)
  for (const ch of joined) {
    const progress = challengeProgress(ch, memberId, ch.joined_at)
    if (progress >= ch.goal_count) {
      db.prepare(`UPDATE challenge_members SET completed_at = datetime('now') WHERE challenge_id = ? AND member_id = ?`).run(ch.id, memberId)
      db.prepare('INSERT INTO points_ledger (member_id, delta, reason, ref) VALUES (?, ?, ?, ?)').run(memberId, ch.reward_points, 'complete_challenge', `challenge:${ch.id}`)
      if (ch.badge_id) {
        db.prepare('INSERT OR IGNORE INTO member_badges (member_id, badge_id) VALUES (?, ?)').run(memberId, ch.badge_id)
      }
      notify(memberId, 'challenge', 'Challenge completed!', `${ch.title} — +${ch.reward_points} points.`, '/profile/challenges')
    }
  }
}

// ── waitlist promotion when a space opens ──
export function promoteWaitlist(sessionId) {
  const session = db.prepare(`${SESSION_SELECT} WHERE s.id = ?`).get(sessionId)
  if (!session) return
  const { spaces } = availability(session)
  if (spaces <= 0) return
  const queue = db.prepare('SELECT * FROM waitlist WHERE session_id = ? AND promoted_at IS NULL ORDER BY joined_at').all(sessionId)
  for (const entry of queue) {
    const pack = activePackage(entry.member_id)
    if (!pack) {
      notify(entry.member_id, 'waitlist', 'A space opened up', `${session.class_name} has a free spot, but you have no class credits. Top up to book.`, '/packages')
      continue
    }
    consumeCredit(entry.member_id)
    db.prepare(`INSERT INTO bookings (session_id, member_id, status) VALUES (?, ?, 'booked')`).run(sessionId, entry.member_id)
    db.prepare(`UPDATE waitlist SET promoted_at = datetime('now') WHERE id = ?`).run(entry.id)
    notify(entry.member_id, 'waitlist', "You're off the waiting list!", `A space opened in ${session.class_name} — you're booked in.`, `/class/${sessionId}`)
    break
  }
}

export function audit(adminId, action, entity, entityId, detail = '') {
  db.prepare('INSERT INTO audit_log (admin_id, action, entity, entity_id, detail) VALUES (?, ?, ?, ?, ?)').run(adminId, action, entity, String(entityId ?? ''), detail)
}
