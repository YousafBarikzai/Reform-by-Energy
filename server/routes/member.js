import { Router } from 'express'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import QRCode from 'qrcode'
import { db, DATA_DIR } from '../db.js'
import { safeParse } from '../auth.js'
import { publicMember } from './auth.js'
import {
  SESSION_SELECT, sessionView, activePackage, attendedBookings, streaks,
  pointsBalance, pointsLifetime, tierFor, addPoints, notify, challengeProgress,
  vapidPublicKey,
} from '../lib.js'

const monthKey = (d) => new Date(d).toISOString().slice(0, 7)
const weekAgo = () => new Date(Date.now() - 7 * 864e5).toISOString()

function favouriteStats(memberId) {
  const type = db.prepare(`
    SELECT ct.name, COUNT(*) AS n FROM bookings b
    JOIN class_sessions s ON s.id = b.session_id JOIN class_types ct ON ct.id = s.class_type_id
    WHERE b.member_id = ? AND b.attended = 1 AND b.status='booked'
    GROUP BY ct.id ORDER BY n DESC LIMIT 1`).get(memberId)
  const instructor = db.prepare(`
    SELECT i.id, i.name, i.photo, COUNT(*) AS n FROM bookings b
    JOIN class_sessions s ON s.id = b.session_id JOIN instructors i ON i.id = s.instructor_id
    WHERE b.member_id = ? AND b.attended = 1 AND b.status='booked'
    GROUP BY i.id ORDER BY n DESC LIMIT 1`).get(memberId)
  const hour = db.prepare(`
    SELECT strftime('%H:%M', s.starts_at, 'localtime') AS t, COUNT(*) AS n FROM bookings b
    JOIN class_sessions s ON s.id = b.session_id
    WHERE b.member_id = ? AND b.attended = 1 AND b.status='booked'
    GROUP BY t ORDER BY n DESC LIMIT 1`).get(memberId)
  return { type, instructor, time: hour }
}

// Rule-based class recommendations: preferences + attendance history. No AI.
function recommendations(member, prefs, limit = 4) {
  const upcoming = db.prepare(`${SESSION_SELECT}
    WHERE s.status = 'scheduled' AND datetime(s.starts_at) > datetime('now') AND datetime(s.starts_at) < datetime('now', '+7 days')
    ORDER BY s.starts_at`).all()
  const booked = new Set(db.prepare(`SELECT session_id FROM bookings WHERE member_id = ? AND status='booked'`).all(member.id).map((r) => r.session_id))
  const historyTypes = db.prepare(`
    SELECT ct.name, COUNT(*) AS n FROM bookings b
    JOIN class_sessions s ON s.id = b.session_id JOIN class_types ct ON ct.id = s.class_type_id
    WHERE b.member_id = ? AND b.attended = 1 GROUP BY ct.id`).all(member.id)
  const typeScore = Object.fromEntries(historyTypes.map((t) => [t.name, t.n]))
  const scored = upcoming
    .filter((s) => !booked.has(s.id))
    .map((s) => {
      let score = 0
      const reasons = []
      if (prefs.favouriteClassType === s.class_name) { score += 5; reasons.push('Your favourite class') }
      if (prefs.favouriteInstructorId === s.instructor_id) { score += 4; reasons.push(`With ${s.instructor_name.split(' ')[0]}`) }
      if (typeScore[s.class_name]) { score += Math.min(3, typeScore[s.class_name]); if (!reasons.length) reasons.push('You attend this often') }
      if (prefs.level && s.level === prefs.level) { score += 2; reasons.push(`${s.level} level`) }
      const hour = new Date(s.starts_at).getHours()
      const slot = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening'
      if (prefs.preferredTime === slot) { score += 2; reasons.push(`${slot} — your usual time`) }
      const dow = new Date(s.starts_at).toLocaleDateString('en-GB', { weekday: 'short' })
      if ((prefs.preferredDays || []).includes(dow)) score += 1
      return { session: s, score, reason: reasons[0] || 'New for you' }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => a.score === b.score ? new Date(a.session.starts_at) - new Date(b.session.starts_at) : b.score - a.score)
  // one suggestion per class type keeps the row varied
  const seen = new Set()
  const unique = scored.filter((r) => !seen.has(r.session.class_name) && seen.add(r.session.class_name)).slice(0, limit)
  return unique.map((r) => ({ ...sessionView(r.session, member.id), reason: r.reason }))
}

export default function memberRoutes({ requireAuth }) {
  const router = Router()

  router.get('/me', requireAuth, (req, res) => {
    res.json({ member: publicMember(req.member) })
  })

  router.patch('/me', requireAuth, (req, res) => {
    const { firstName, lastName, photo, prefs } = req.body || {}
    const current = safeParse(req.member.prefs)
    const merged = prefs ? { ...current, ...prefs } : current
    db.prepare('UPDATE members SET first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name), photo = COALESCE(?, photo), prefs = ? WHERE id = ?')
      .run(firstName?.trim() || null, lastName !== undefined ? String(lastName).trim() : null, photo || null, JSON.stringify(merged), req.member.id)
    const updated = db.prepare('SELECT * FROM members WHERE id = ?').get(req.member.id)
    res.json({ member: publicMember(updated) })
  })

  // photo upload as data URL (profile or progress)
  router.post('/me/photo', requireAuth, (req, res) => {
    const { dataUrl, kind = 'profile', caption } = req.body || {}
    const match = String(dataUrl || '').match(/^data:image\/(jpeg|png|webp);base64,(.+)$/)
    if (!match) return res.status(400).json({ error: 'Send a JPEG, PNG, or WebP image' })
    const buf = Buffer.from(match[2], 'base64')
    if (buf.length > 8 * 1024 * 1024) return res.status(413).json({ error: 'Image too large (max 8 MB)' })
    const name = `${req.member.id}-${crypto.randomBytes(8).toString('hex')}.${match[1] === 'jpeg' ? 'jpg' : match[1]}`
    fs.writeFileSync(path.join(DATA_DIR, 'uploads', name), buf)
    if (kind === 'progress') {
      const info = db.prepare('INSERT INTO progress_photos (member_id, file, caption) VALUES (?, ?, ?)').run(req.member.id, name, caption || null)
      return res.json({ ok: true, id: info.lastInsertRowid, url: `/api/uploads/${name}` })
    }
    db.prepare('UPDATE members SET photo = ? WHERE id = ?').run(`/api/uploads/${name}`, req.member.id)
    res.json({ ok: true, url: `/api/uploads/${name}` })
  })

  // ── dashboard (home) ──
  router.get('/dashboard', requireAuth, (req, res) => {
    const m = req.member
    const prefs = req.prefs
    const next = db.prepare(`${SESSION_SELECT}
      JOIN bookings b ON b.session_id = s.id
      WHERE b.member_id = ? AND b.status = 'booked' AND b.attended = 0 AND datetime(s.starts_at) > datetime('now')
      ORDER BY s.starts_at LIMIT 4`).all(m.id)
    const pack = activePackage(m.id)
    const attendedThisWeek = db.prepare(`
      SELECT COUNT(*) AS n FROM bookings b JOIN class_sessions s ON s.id = b.session_id
      WHERE b.member_id = ? AND b.attended = 1 AND s.starts_at >= ?`).get(m.id, weekAgo()).n
    const streak = streaks(m.id)
    const fav = favouriteStats(m.id)
    const badges = db.prepare(`
      SELECT b.*, mb.earned_at FROM member_badges mb JOIN badges b ON b.id = mb.badge_id
      WHERE mb.member_id = ? ORDER BY mb.earned_at DESC LIMIT 3`).all(m.id)
    const balance = pointsBalance(m.id)
    const challenges = db.prepare(`
      SELECT c.*, cm.joined_at, cm.completed_at FROM challenge_members cm
      JOIN challenges c ON c.id = cm.challenge_id
      WHERE cm.member_id = ? AND c.active = 1 AND datetime(c.ends_at) > datetime('now')`).all(m.id)
      .map((c) => ({ id: c.id, title: c.title, goal: c.goal_count, endsAt: c.ends_at, completedAt: c.completed_at, progress: Math.min(c.goal_count, challengeProgress(c, m.id, c.joined_at)) }))
    const announcements = db.prepare('SELECT * FROM announcements WHERE active = 1 ORDER BY pinned DESC, created_at DESC LIMIT 3').all()
    const weeklyGoal = prefs.weeklyGoal || 4
    res.json({
      member: publicMember(m),
      nextClass: next[0] ? sessionView(db.prepare(`${SESSION_SELECT} WHERE s.id = ?`).get(next[0].id), m.id) : null,
      upcoming: next.slice(1).map((s) => sessionView(db.prepare(`${SESSION_SELECT} WHERE s.id = ?`).get(s.id), m.id)),
      package: pack ? { name: pack.package_name, creditsLeft: pack.credits_left, creditsTotal: pack.credits_total, expiresAt: pack.expires_at, unlimited: pack.credits_left === null } : null,
      weekly: { attended: attendedThisWeek, goal: weeklyGoal },
      streak, favourite: fav, badges, points: balance, tier: tierFor(pointsLifetime(m.id)),
      challenges, announcements,
      recommended: recommendations(m, prefs),
      unreadNotifications: db.prepare('SELECT COUNT(*) AS n FROM notifications WHERE member_id = ? AND read_at IS NULL').get(m.id).n,
    })
  })

  // ── progress dashboard ──
  router.get('/progress', requireAuth, (req, res) => {
    const m = req.member
    const attended = attendedBookings(m.id)
    const total = attended.length
    const now = new Date()
    const thisWeek = attended.filter((a) => new Date(a.starts_at) >= new Date(Date.now() - 7 * 864e5)).length
    const thisMonth = attended.filter((a) => monthKey(a.starts_at) === monthKey(now)).length
    const lastMonthKey = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 15))
    const lastMonth = attended.filter((a) => monthKey(a.starts_at) === lastMonthKey).length
    const minutes = attended.reduce((sum, a) => sum + a.duration_min, 0)
    const streak = streaks(m.id)
    const fav = favouriteStats(m.id)
    // monthly counts for the last 6 months
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 15)
      const key = monthKey(d)
      months.push({ label: d.toLocaleDateString('en-GB', { month: 'short' }), count: attended.filter((a) => monthKey(a.starts_at) === key).length })
    }
    // weekday distribution
    const weekdays = [0, 0, 0, 0, 0, 0, 0]
    attended.forEach((a) => { weekdays[(new Date(a.starts_at).getDay() + 6) % 7]++ })
    const badges = db.prepare('SELECT b.*, mb.earned_at FROM badges b LEFT JOIN member_badges mb ON mb.badge_id = b.id AND mb.member_id = ? ORDER BY mb.earned_at IS NULL, mb.earned_at DESC').all(m.id)
    const completedChallenges = db.prepare(`
      SELECT c.title, cm.completed_at FROM challenge_members cm JOIN challenges c ON c.id = cm.challenge_id
      WHERE cm.member_id = ? AND cm.completed_at IS NOT NULL ORDER BY cm.completed_at DESC`).all(m.id)
    const milestones = db.prepare('SELECT * FROM goals WHERE member_id = ? ORDER BY done, target_date').all(m.id)
    res.json({
      totals: { classes: total, thisWeek, thisMonth, lastMonth, minutes },
      streak, favourite: fav, months, weekdays, badges, completedChallenges, milestones,
    })
  })

  // ── wellness ──
  router.get('/wellness', requireAuth, (req, res) => {
    const entries = db.prepare('SELECT * FROM wellness_checkins WHERE member_id = ? ORDER BY date DESC LIMIT 60').all(req.member.id)
    res.json({ entries, today: entries.find((e) => e.date === new Date().toISOString().slice(0, 10)) || null })
  })

  router.post('/wellness', requireAuth, (req, res) => {
    const fields = ['mood', 'energy', 'sleep', 'stress', 'soreness', 'wellbeing']
    const vals = {}
    for (const f of fields) {
      const v = Number(req.body?.[f])
      if (!Number.isInteger(v) || v < 1 || v > 5) return res.status(400).json({ error: `${f} must be 1–5` })
      vals[f] = v
    }
    const water = Math.max(0, Math.min(12, Number(req.body?.water) || 0))
    const note = req.body?.note ? String(req.body.note).slice(0, 500) : null
    // fixed formula: positive metrics up, stress/soreness inverted, scaled to 100
    const score = Math.round(((vals.mood + vals.energy + vals.sleep + vals.wellbeing + (6 - vals.stress) + (6 - vals.soreness)) / 30) * 100)
    const date = new Date().toISOString().slice(0, 10)
    db.prepare(`INSERT INTO wellness_checkins (member_id, date, mood, energy, sleep, stress, soreness, water, wellbeing, note, score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(member_id, date) DO UPDATE SET mood=excluded.mood, energy=excluded.energy, sleep=excluded.sleep,
        stress=excluded.stress, soreness=excluded.soreness, water=excluded.water, wellbeing=excluded.wellbeing,
        note=excluded.note, score=excluded.score`)
      .run(req.member.id, date, vals.mood, vals.energy, vals.sleep, vals.stress, vals.soreness, water, vals.wellbeing, note, score)
    res.json({ ok: true, score })
  })

  // ── transformation journey ──
  router.get('/journey', requireAuth, (req, res) => {
    res.json({
      goals: db.prepare('SELECT * FROM goals WHERE member_id = ? ORDER BY done, target_date').all(req.member.id),
      measurements: db.prepare('SELECT * FROM measurements WHERE member_id = ? ORDER BY date DESC').all(req.member.id),
      photos: db.prepare('SELECT * FROM progress_photos WHERE member_id = ? ORDER BY taken_at DESC').all(req.member.id)
        .map((p) => ({ ...p, url: `/api/uploads/${p.file}`, file: undefined })),
    })
  })
  router.post('/journey/goals', requireAuth, (req, res) => {
    const title = String(req.body?.title || '').trim().slice(0, 200)
    if (!title) return res.status(400).json({ error: 'Goal title is required' })
    const info = db.prepare('INSERT INTO goals (member_id, title, target_date) VALUES (?, ?, ?)').run(req.member.id, title, req.body?.targetDate || null)
    res.json({ ok: true, id: info.lastInsertRowid })
  })
  router.patch('/journey/goals/:id', requireAuth, (req, res) => {
    const goal = db.prepare('SELECT * FROM goals WHERE id = ? AND member_id = ?').get(req.params.id, req.member.id)
    if (!goal) return res.status(404).json({ error: 'Goal not found' })
    db.prepare('UPDATE goals SET done = ?, title = COALESCE(?, title), target_date = COALESCE(?, target_date) WHERE id = ?')
      .run(req.body?.done !== undefined ? (req.body.done ? 1 : 0) : goal.done, req.body?.title || null, req.body?.targetDate || null, goal.id)
    if (req.body?.done && !goal.done) addPoints(req.member.id, 'milestone', `goal:${goal.id}`)
    res.json({ ok: true })
  })
  router.delete('/journey/goals/:id', requireAuth, (req, res) => {
    db.prepare('DELETE FROM goals WHERE id = ? AND member_id = ?').run(req.params.id, req.member.id)
    res.json({ ok: true })
  })
  router.post('/journey/measurements', requireAuth, (req, res) => {
    const num = (v) => (v === '' || v == null ? null : Number(v))
    db.prepare(`INSERT INTO measurements (member_id, date, weight_kg, chest_cm, waist_cm, hips_cm, arm_cm, thigh_cm, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(req.member.id, req.body?.date || new Date().toISOString().slice(0, 10),
        num(req.body?.weightKg), num(req.body?.chestCm), num(req.body?.waistCm),
        num(req.body?.hipsCm), num(req.body?.armCm), num(req.body?.thighCm),
        req.body?.note ? String(req.body.note).slice(0, 300) : null)
    res.json({ ok: true })
  })
  router.delete('/journey/photos/:id', requireAuth, (req, res) => {
    const photo = db.prepare('SELECT * FROM progress_photos WHERE id = ? AND member_id = ?').get(req.params.id, req.member.id)
    if (photo) {
      try { fs.unlinkSync(path.join(DATA_DIR, 'uploads', photo.file)) } catch { /* already gone */ }
      db.prepare('DELETE FROM progress_photos WHERE id = ?').run(photo.id)
    }
    res.json({ ok: true })
  })

  // ── class history ──
  router.get('/history', requireAuth, (req, res) => {
    const { from, to, instructor, type } = req.query
    let rows = attendedBookings(req.member.id)
    if (from) rows = rows.filter((r) => r.starts_at >= from)
    if (to) rows = rows.filter((r) => r.starts_at <= to + 'T23:59')
    if (instructor) rows = rows.filter((r) => r.instructor_id === Number(instructor))
    if (type) rows = rows.filter((r) => r.class_name === type)
    const refNums = Object.fromEntries(db.prepare('SELECT id, number FROM reformers').all().map((r) => [r.id, r.number]))
    const history = rows.map((r) => ({
      bookingId: r.booking_id, sessionId: r.id, startsAt: r.starts_at, className: r.class_name,
      instructor: r.instructor_name, durationMin: r.duration_min, studio: r.studio_name,
      reformer: r.reformer_id ? refNums[r.reformer_id] : null, rating: r.rating, notes: r.notes,
      image: r.image, category: r.category, classTypeId: r.class_type_id,
    }))
    const summary = {}
    for (const h of history) {
      const key = monthKey(h.startsAt)
      summary[key] = (summary[key] || 0) + 1
    }
    res.json({ history, monthly: summary })
  })

  // ── rewards wallet ──
  router.get('/rewards', requireAuth, (req, res) => {
    const balance = pointsBalance(req.member.id)
    const lifetime = pointsLifetime(req.member.id)
    res.json({
      balance, lifetime, tier: tierFor(lifetime),
      nextTier: lifetime >= 2500 ? null : lifetime >= 1000 ? { name: 'Ruby', at: 2500 } : { name: 'Rose', at: 1000 },
      earned: db.prepare('SELECT COALESCE(SUM(delta),0) AS n FROM points_ledger WHERE member_id = ? AND delta > 0').get(req.member.id).n,
      redeemed: -db.prepare('SELECT COALESCE(SUM(delta),0) AS n FROM points_ledger WHERE member_id = ? AND delta < 0').get(req.member.id).n,
      ledger: db.prepare('SELECT * FROM points_ledger WHERE member_id = ? ORDER BY created_at DESC LIMIT 50').all(req.member.id),
      rewards: db.prepare('SELECT * FROM rewards WHERE active = 1 ORDER BY cost_points').all(),
      redemptions: db.prepare(`SELECT rr.*, r.name FROM reward_redemptions rr JOIN rewards r ON r.id = rr.reward_id
        WHERE rr.member_id = ? ORDER BY rr.created_at DESC`).all(req.member.id),
      rules: db.prepare('SELECT key, label, points FROM point_rules WHERE active = 1').all(),
    })
  })

  router.post('/rewards/:id/redeem', requireAuth, (req, res) => {
    const reward = db.prepare('SELECT * FROM rewards WHERE id = ? AND active = 1').get(req.params.id)
    if (!reward) return res.status(404).json({ error: 'Reward not found' })
    const balance = pointsBalance(req.member.id)
    if (balance < reward.cost_points) return res.status(400).json({ error: `You need ${reward.cost_points - balance} more points for this reward` })
    const code = reward.name.split(' ')[0].toUpperCase().slice(0, 5) + '-' + crypto.randomBytes(2).toString('hex').toUpperCase()
    const expires = reward.expiry_days ? new Date(Date.now() + reward.expiry_days * 864e5).toISOString() : null
    db.transaction(() => {
      db.prepare('INSERT INTO points_ledger (member_id, delta, reason, ref) VALUES (?, ?, ?, ?)').run(req.member.id, -reward.cost_points, 'redeem', reward.name)
      db.prepare('INSERT INTO reward_redemptions (member_id, reward_id, code, expires_at) VALUES (?, ?, ?, ?)').run(req.member.id, reward.id, code, expires)
    })()
    notify(req.member.id, 'rewards', 'Reward redeemed', `${reward.name} — show code ${code} at the studio.`, '/profile/rewards')
    res.json({ ok: true, code, expires })
  })

  // ── challenges ──
  router.get('/challenges', requireAuth, (req, res) => {
    const all = db.prepare(`SELECT c.*, b.name AS badge_name, b.icon AS badge_icon FROM challenges c
      LEFT JOIN badges b ON b.id = c.badge_id WHERE c.active = 1 ORDER BY c.ends_at`).all()
    const mine = db.prepare('SELECT * FROM challenge_members WHERE member_id = ?').all(req.member.id)
    const mineMap = Object.fromEntries(mine.map((m) => [m.challenge_id, m]))
    const challenges = all.map((c) => {
      const my = mineMap[c.id]
      const progress = my ? Math.min(c.goal_count, challengeProgress(c, req.member.id, my.joined_at)) : 0
      let leaderboard = null
      if (c.leaderboard) {
        const rows = db.prepare(`SELECT cm.member_id, cm.joined_at, m.first_name, m.last_name, m.prefs
          FROM challenge_members cm JOIN members m ON m.id = cm.member_id WHERE cm.challenge_id = ?`).all(c.id)
        leaderboard = rows.map((r) => {
          const visible = safeParse(r.prefs).leaderboardVisible !== false
          return {
            name: r.member_id === req.member.id ? 'You' : visible ? `${r.first_name} ${(r.last_name || '').slice(0, 1)}.`.trim() : 'Private member',
            progress: Math.min(c.goal_count, challengeProgress(c, r.member_id, r.joined_at)),
            you: r.member_id === req.member.id,
          }
        }).sort((a, b) => b.progress - a.progress).slice(0, 10)
      }
      return { ...c, joined: !!my, completedAt: my?.completed_at || null, progress, leaderboard, participants: db.prepare('SELECT COUNT(*) AS n FROM challenge_members WHERE challenge_id = ?').get(c.id).n }
    })
    res.json({ challenges })
  })

  router.post('/challenges/:id/join', requireAuth, (req, res) => {
    const c = db.prepare(`SELECT * FROM challenges WHERE id = ? AND active = 1 AND datetime(ends_at) > datetime('now')`).get(req.params.id)
    if (!c) return res.status(404).json({ error: 'Challenge not found or has ended' })
    try {
      db.prepare('INSERT INTO challenge_members (challenge_id, member_id) VALUES (?, ?)').run(c.id, req.member.id)
    } catch {
      return res.status(409).json({ error: 'You have already joined this challenge' })
    }
    notify(req.member.id, 'challenge', 'Challenge joined', `${c.title} — good luck!`, '/profile/challenges')
    res.json({ ok: true })
  })

  // ── Reform Mirror (aggregate journal) ──
  router.get('/mirror', requireAuth, (req, res) => {
    const m = req.member
    const attended = attendedBookings(m.id)
    const week = attended.filter((a) => new Date(a.starts_at) >= new Date(Date.now() - 7 * 864e5))
    const month = attended.filter((a) => monthKey(a.starts_at) === monthKey(new Date()))
    const wellness = db.prepare('SELECT * FROM wellness_checkins WHERE member_id = ? ORDER BY date DESC LIMIT 7').all(m.id)
    const streak = streaks(m.id)
    const balance = pointsBalance(m.id)
    // deterministic quote of the day from the managed content library
    const quotes = db.prepare('SELECT * FROM motivations').all()
    const dayNum = Math.floor(Date.now() / 864e5)
    const quote = quotes.length ? quotes[dayNum % quotes.length] : null
    const totalClasses = attended.length
    const nextMilestone = [10, 25, 50, 75, 100, 150, 200].find((n) => n > totalClasses) || totalClasses + 50
    res.json({
      week: { classes: week.length, minutes: week.reduce((s, a) => s + a.duration_min, 0) },
      month: { classes: month.length, minutes: month.reduce((s, a) => s + a.duration_min, 0) },
      totalClasses, streak, points: balance, tier: tierFor(pointsLifetime(m.id)),
      wellness, quote,
      goals: db.prepare('SELECT * FROM goals WHERE member_id = ? AND done = 0 ORDER BY target_date LIMIT 3').all(m.id),
      measurements: db.prepare('SELECT * FROM measurements WHERE member_id = ? ORDER BY date DESC LIMIT 2').all(m.id),
      photos: db.prepare('SELECT id, taken_at, caption, file FROM progress_photos WHERE member_id = ? ORDER BY taken_at DESC LIMIT 2').all(m.id)
        .map((p) => ({ ...p, url: `/api/uploads/${p.file}`, file: undefined })),
      badges: db.prepare(`SELECT b.*, mb.earned_at FROM member_badges mb JOIN badges b ON b.id = mb.badge_id
        WHERE mb.member_id = ? ORDER BY mb.earned_at DESC LIMIT 4`).all(m.id),
      challenges: db.prepare(`SELECT c.*, cm.joined_at FROM challenge_members cm JOIN challenges c ON c.id = cm.challenge_id
        WHERE cm.member_id = ? AND cm.completed_at IS NULL AND c.active = 1`).all(m.id)
        .map((c) => ({ id: c.id, title: c.title, goal: c.goal_count, progress: Math.min(c.goal_count, challengeProgress(c, m.id, c.joined_at)) })),
      favouriteClasses: db.prepare(`
        SELECT ct.name, COUNT(*) AS n FROM bookings b JOIN class_sessions s ON s.id = b.session_id
        JOIN class_types ct ON ct.id = s.class_type_id
        WHERE b.member_id = ? AND b.attended = 1 GROUP BY ct.id ORDER BY n DESC LIMIT 3`).all(m.id),
      nextMilestone: { at: nextMilestone, toGo: nextMilestone - totalClasses },
      recentNotes: db.prepare(`
        SELECT b.notes, b.rating, s.starts_at, ct.name FROM bookings b
        JOIN class_sessions s ON s.id = b.session_id JOIN class_types ct ON ct.id = s.class_type_id
        WHERE b.member_id = ? AND b.notes IS NOT NULL ORDER BY s.starts_at DESC LIMIT 3`).all(m.id),
    })
  })

  // ── digital membership card ──
  router.get('/card', requireAuth, async (req, res) => {
    const m = req.member
    const pack = activePackage(m.id)
    const lifetime = pointsLifetime(m.id)
    const payload = JSON.stringify({ t: 'reform-checkin', member: m.membership_number, id: m.id })
    const qrDataUrl = await QRCode.toDataURL(payload, { margin: 1, width: 400, color: { dark: '#38262E', light: '#FFFFFF' } })
    res.json({
      name: `${m.first_name} ${m.last_name}`.trim(), photo: m.photo,
      membershipNumber: m.membership_number,
      type: pack ? pack.package_name : 'No active package',
      status: pack ? 'Active' : 'Inactive',
      expiresAt: pack?.expires_at || null,
      creditsLeft: pack ? (pack.credits_left === null ? 'Unlimited' : pack.credits_left) : 0,
      points: pointsBalance(m.id), tier: tierFor(lifetime),
      guestPasses: m.guest_passes, referralCode: m.referral_code,
      qrDataUrl,
    })
  })

  // ── notifications ──
  router.get('/notifications', requireAuth, (req, res) => {
    res.json({ notifications: db.prepare('SELECT * FROM notifications WHERE member_id = ? ORDER BY created_at DESC LIMIT 50').all(req.member.id) })
  })
  router.post('/notifications/read', requireAuth, (req, res) => {
    db.prepare(`UPDATE notifications SET read_at = datetime('now') WHERE member_id = ? AND read_at IS NULL`).run(req.member.id)
    res.json({ ok: true })
  })

  // web push
  router.get('/push/key', requireAuth, (_req, res) => res.json({ key: vapidPublicKey() }))
  router.post('/push/subscribe', requireAuth, (req, res) => {
    const { endpoint, keys } = req.body || {}
    if (!endpoint || !keys) return res.status(400).json({ error: 'Invalid subscription' })
    db.prepare(`INSERT INTO push_subs (member_id, endpoint, keys_json) VALUES (?, ?, ?)
      ON CONFLICT(endpoint) DO UPDATE SET member_id = excluded.member_id, keys_json = excluded.keys_json`)
      .run(req.member.id, endpoint, JSON.stringify(keys))
    res.json({ ok: true })
  })
  router.post('/push/unsubscribe', requireAuth, (req, res) => {
    if (req.body?.endpoint) db.prepare('DELETE FROM push_subs WHERE endpoint = ? AND member_id = ?').run(req.body.endpoint, req.member.id)
    res.json({ ok: true })
  })

  // ── connected services (consent-based; PWA constraint stated in UI) ──
  router.post('/connections/:service', requireAuth, (req, res) => {
    const service = String(req.params.service)
    if (!['apple-health', 'google-health', 'fitbit', 'garmin'].includes(service)) return res.status(400).json({ error: 'Unknown service' })
    const prefs = safeParse(req.member.prefs)
    prefs.connections = prefs.connections || {}
    if (req.body?.connect) {
      prefs.connections[service] = { consentedAt: new Date().toISOString(), status: 'pending_native' }
    } else {
      delete prefs.connections[service]
    }
    db.prepare('UPDATE members SET prefs = ? WHERE id = ?').run(JSON.stringify(prefs), req.member.id)
    res.json({ ok: true, connections: prefs.connections })
  })

  // ── privacy: data export + account deletion ──
  router.get('/me/export', requireAuth, (req, res) => {
    const id = req.member.id
    const data = {
      member: publicMember(req.member),
      bookings: db.prepare('SELECT * FROM bookings WHERE member_id = ?').all(id),
      wellness: db.prepare('SELECT * FROM wellness_checkins WHERE member_id = ?').all(id),
      measurements: db.prepare('SELECT * FROM measurements WHERE member_id = ?').all(id),
      goals: db.prepare('SELECT * FROM goals WHERE member_id = ?').all(id),
      points: db.prepare('SELECT * FROM points_ledger WHERE member_id = ?').all(id),
      purchases: db.prepare('SELECT * FROM purchases WHERE member_id = ?').all(id),
      notifications: db.prepare('SELECT * FROM notifications WHERE member_id = ?').all(id),
    }
    res.setHeader('Content-Disposition', 'attachment; filename="reform-my-data.json"')
    res.json(data)
  })
  router.post('/me/delete', requireAuth, (req, res) => {
    if (req.member.role === 'admin') return res.status(400).json({ error: 'Admin accounts cannot self-delete' })
    db.transaction(() => {
      db.prepare(`UPDATE members SET deleted_at = datetime('now'), email = 'deleted-' || id || '@removed', first_name = 'Deleted', last_name = 'Member', photo = NULL, prefs = '{}' WHERE id = ?`).run(req.member.id)
      db.prepare('DELETE FROM auth_tokens WHERE member_id = ?').run(req.member.id)
      db.prepare('DELETE FROM push_subs WHERE member_id = ?').run(req.member.id)
      for (const p of db.prepare('SELECT * FROM progress_photos WHERE member_id = ?').all(req.member.id)) {
        try { fs.unlinkSync(path.join(DATA_DIR, 'uploads', p.file)) } catch { /* gone */ }
      }
      db.prepare('DELETE FROM progress_photos WHERE member_id = ?').run(req.member.id)
    })()
    res.setHeader('Set-Cookie', 'reform_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly')
    res.json({ ok: true })
  })

  return router
}
