import { Router } from 'express'
import { db } from '../db.js'
import { audit, SESSION_SELECT, availability, notify } from '../lib.js'

// Generic CRUD over whitelisted tables keeps the CMS consistent and safe.
const ENTITIES = {
  class_types: ['name', 'description', 'level', 'category', 'duration_min', 'image', 'active'],
  instructors: ['name', 'bio', 'photo', 'specialties', 'active'],
  studios: ['name', 'cols', 'entrance'],
  reformers: ['studio_id', 'number', 'status'],
  packages: ['name', 'kind', 'price_cents', 'classes', 'validity_days', 'description', 'terms', 'popular', 'intro', 'active', 'sort'],
  rewards: ['name', 'description', 'cost_points', 'kind', 'expiry_days', 'active'],
  challenges: ['title', 'description', 'rules', 'starts_at', 'ends_at', 'goal_type', 'goal_count', 'reward_points', 'badge_id', 'leaderboard', 'active'],
  badges: ['name', 'icon', 'description'],
  library_items: ['title', 'kind', 'category', 'level', 'duration_min', 'image', 'video_url', 'summary', 'content', 'muscles', 'instructor_id', 'published'],
  playlists: ['title', 'cover', 'platform', 'url', 'instructor_id'],
  announcements: ['title', 'body', 'pinned', 'active'],
  motivations: ['text', 'author'],
  class_sessions: ['class_type_id', 'instructor_id', 'studio_id', 'starts_at', 'duration_min', 'capacity', 'cutoff_min', 'playlist_id', 'status'],
}

export default function adminRoutes({ requireAdmin }) {
  const router = Router()
  router.use(requireAdmin)

  router.get('/overview', (req, res) => {
    const count = (sql, ...args) => db.prepare(sql).get(...args).n
    res.json({
      members: count(`SELECT COUNT(*) AS n FROM members WHERE role = 'member' AND deleted_at IS NULL`),
      bookingsToday: count(`SELECT COUNT(*) AS n FROM bookings b JOIN class_sessions s ON s.id = b.session_id
        WHERE b.status = 'booked' AND date(s.starts_at, 'localtime') = date('now', 'localtime')`),
      sessionsToday: count(`SELECT COUNT(*) AS n FROM class_sessions WHERE date(starts_at, 'localtime') = date('now', 'localtime')`),
      waitlisted: count('SELECT COUNT(*) AS n FROM waitlist WHERE promoted_at IS NULL'),
      revenue30d: db.prepare(`SELECT COALESCE(SUM(amount_cents),0) AS n FROM purchases WHERE created_at > datetime('now', '-30 days')`).get().n,
      activeChallenges: count(`SELECT COUNT(*) AS n FROM challenges WHERE active = 1 AND datetime(ends_at) > datetime('now')`),
      recentAudit: db.prepare(`SELECT a.*, m.first_name FROM audit_log a JOIN members m ON m.id = a.admin_id ORDER BY a.created_at DESC LIMIT 8`).all(),
    })
  })

  // upcoming sessions with occupancy for the schedule manager
  router.get('/sessions', (req, res) => {
    const date = req.query.date || new Date().toISOString().slice(0, 10)
    const rows = db.prepare(`${SESSION_SELECT} WHERE date(s.starts_at, 'localtime') = ? ORDER BY s.starts_at`).all(date)
    res.json({
      sessions: rows.map((r) => ({
        ...r, ...availability(r),
        attendees: db.prepare(`SELECT b.id AS booking_id, b.attended, b.reformer_id, m.first_name, m.last_name, m.membership_number
          FROM bookings b JOIN members m ON m.id = b.member_id WHERE b.session_id = ? AND b.status = 'booked'`).all(r.id),
        waitlist: db.prepare(`SELECT w.id, m.first_name, m.last_name FROM waitlist w JOIN members m ON m.id = w.member_id
          WHERE w.session_id = ? AND w.promoted_at IS NULL ORDER BY w.joined_at`).all(r.id),
      })),
    })
  })

  // mark attendance from the front desk
  router.post('/bookings/:id/attended', (req, res) => {
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id)
    if (!booking) return res.status(404).json({ error: 'Booking not found' })
    db.prepare('UPDATE bookings SET attended = ? WHERE id = ?').run(req.body?.attended ? 1 : 0, booking.id)
    audit(req.member.id, 'attendance', 'booking', booking.id, `attended=${!!req.body?.attended}`)
    res.json({ ok: true })
  })

  router.get('/members', (req, res) => {
    const q = req.query.q ? `%${req.query.q}%` : '%'
    res.json({
      members: db.prepare(`SELECT id, email, first_name, last_name, role, membership_number, guest_passes, created_at
        FROM members WHERE deleted_at IS NULL AND (email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)
        ORDER BY created_at DESC LIMIT 100`).all(q, q, q),
    })
  })
  router.get('/members/:id', (req, res) => {
    const m = db.prepare('SELECT id, email, first_name, last_name, role, membership_number, guest_passes, created_at FROM members WHERE id = ?').get(req.params.id)
    if (!m) return res.status(404).json({ error: 'Member not found' })
    res.json({
      member: m,
      packages: db.prepare(`SELECT mp.*, p.name FROM member_packages mp JOIN packages p ON p.id = mp.package_id WHERE mp.member_id = ? ORDER BY purchased_at DESC`).all(m.id),
      attendance: db.prepare(`SELECT COUNT(*) AS n FROM bookings WHERE member_id = ? AND attended = 1`).get(m.id).n,
      points: db.prepare('SELECT COALESCE(SUM(delta),0) AS n FROM points_ledger WHERE member_id = ?').get(m.id).n,
    })
  })
  router.post('/members/:id/credits', (req, res) => {
    const delta = Number(req.body?.delta || 0)
    const pack = db.prepare(`SELECT * FROM member_packages WHERE member_id = ? AND status = 'active' AND credits_left IS NOT NULL ORDER BY expires_at DESC LIMIT 1`).get(req.params.id)
    if (!pack) return res.status(404).json({ error: 'No adjustable package found for this member' })
    db.prepare('UPDATE member_packages SET credits_left = MAX(0, credits_left + ?) WHERE id = ?').run(delta, pack.id)
    audit(req.member.id, 'adjust_credits', 'member', req.params.id, `delta=${delta}`)
    notify(Number(req.params.id), 'membership', 'Credits adjusted', `${delta > 0 ? '+' : ''}${delta} class credit${Math.abs(delta) === 1 ? '' : 's'} applied by the studio.`, '/packages')
    res.json({ ok: true })
  })

  router.get('/point-rules', (_req, res) => {
    res.json({ rules: db.prepare('SELECT * FROM point_rules').all() })
  })
  router.patch('/point-rules/:key', (req, res) => {
    db.prepare('UPDATE point_rules SET points = COALESCE(?, points), active = COALESCE(?, active) WHERE key = ?')
      .run(req.body?.points != null ? Number(req.body.points) : null,
        req.body?.active != null ? (req.body.active ? 1 : 0) : null, req.params.key)
    audit(req.member.id, 'update', 'point_rule', req.params.key, JSON.stringify(req.body))
    res.json({ ok: true })
  })

  // broadcast an announcement notification to all members
  router.post('/announce', (req, res) => {
    const { title, body } = req.body || {}
    if (!title) return res.status(400).json({ error: 'Title required' })
    const info = db.prepare('INSERT INTO announcements (title, body, pinned) VALUES (?, ?, ?)').run(title, body || '', req.body?.pinned ? 1 : 0)
    const members = db.prepare(`SELECT id FROM members WHERE role = 'member' AND deleted_at IS NULL`).all()
    for (const m of members) notify(m.id, 'announcement', title, body || '', '/')
    audit(req.member.id, 'create', 'announcement', info.lastInsertRowid, title)
    res.json({ ok: true })
  })

  router.get('/audit', (req, res) => {
    res.json({ log: db.prepare(`SELECT a.*, m.first_name, m.email FROM audit_log a JOIN members m ON m.id = a.admin_id ORDER BY a.created_at DESC LIMIT 200`).all() })
  })

  // ── generic whitelisted CRUD ──
  router.get('/entities/:table', (req, res) => {
    const cols = ENTITIES[req.params.table]
    if (!cols) return res.status(404).json({ error: 'Unknown entity' })
    res.json({ rows: db.prepare(`SELECT * FROM ${req.params.table} ORDER BY id DESC LIMIT 300`).all(), columns: cols })
  })
  router.post('/entities/:table', (req, res) => {
    const cols = ENTITIES[req.params.table]
    if (!cols) return res.status(404).json({ error: 'Unknown entity' })
    const provided = cols.filter((c) => req.body?.[c] !== undefined)
    if (!provided.length) return res.status(400).json({ error: 'No fields provided' })
    const info = db.prepare(`INSERT INTO ${req.params.table} (${provided.join(',')}) VALUES (${provided.map(() => '?').join(',')})`)
      .run(...provided.map((c) => req.body[c]))
    audit(req.member.id, 'create', req.params.table, info.lastInsertRowid)
    res.json({ ok: true, id: info.lastInsertRowid })
  })
  router.patch('/entities/:table/:id', (req, res) => {
    const cols = ENTITIES[req.params.table]
    if (!cols) return res.status(404).json({ error: 'Unknown entity' })
    const provided = cols.filter((c) => req.body?.[c] !== undefined)
    if (!provided.length) return res.status(400).json({ error: 'No fields provided' })
    db.prepare(`UPDATE ${req.params.table} SET ${provided.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`)
      .run(...provided.map((c) => req.body[c]), req.params.id)
    audit(req.member.id, 'update', req.params.table, req.params.id)
    res.json({ ok: true })
  })
  router.delete('/entities/:table/:id', (req, res) => {
    const cols = ENTITIES[req.params.table]
    if (!cols) return res.status(404).json({ error: 'Unknown entity' })
    try {
      db.prepare(`DELETE FROM ${req.params.table} WHERE id = ?`).run(req.params.id)
    } catch {
      // referenced elsewhere — soft-disable instead of hard delete
      if (cols.includes('active')) db.prepare(`UPDATE ${req.params.table} SET active = 0 WHERE id = ?`).run(req.params.id)
      else if (cols.includes('published')) db.prepare(`UPDATE ${req.params.table} SET published = 0 WHERE id = ?`).run(req.params.id)
      else return res.status(409).json({ error: 'In use — cannot delete' })
    }
    audit(req.member.id, 'delete', req.params.table, req.params.id)
    res.json({ ok: true })
  })

  return router
}
