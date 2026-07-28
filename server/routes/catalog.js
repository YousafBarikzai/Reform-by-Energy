import { Router } from 'express'
import crypto from 'node:crypto'
import { db, tx } from '../db.js'
import { addPoints, notify, activePackage } from '../lib.js'

export default function catalogRoutes({ requireAuth, attachMember }) {
  const router = Router()

  // ── packages ──
  router.get('/packages', attachMember, (req, res) => {
    const packages = db.prepare('SELECT * FROM packages WHERE active = 1 ORDER BY sort').all()
    if (!req.member) return res.json({ packages, current: null, history: [], receipts: [] })
    const current = activePackage(req.member.id)
    const history = db.prepare(`
      SELECT mp.*, p.name AS package_name, p.kind FROM member_packages mp
      JOIN packages p ON p.id = mp.package_id WHERE mp.member_id = ? ORDER BY mp.purchased_at DESC`).all(req.member.id)
    const receipts = db.prepare(`
      SELECT pu.*, p.name AS package_name FROM purchases pu
      LEFT JOIN packages p ON p.id = pu.package_id WHERE pu.member_id = ? ORDER BY pu.created_at DESC`).all(req.member.id)
    res.json({ packages, current, history, receipts })
  })

  // Simulated checkout: records the purchase and issues credits. A real
  // payment provider slots in here once keys are configured.
  router.post('/packages/:id/purchase', requireAuth, (req, res) => {
    const pack = db.prepare('SELECT * FROM packages WHERE id = ? AND active = 1').get(req.params.id)
    if (!pack) return res.status(404).json({ error: 'Package not found' })
    if (pack.intro) {
      const had = db.prepare('SELECT COUNT(*) AS n FROM member_packages WHERE member_id = ?').get(req.member.id).n
      if (had > 0) return res.status(400).json({ error: 'The intro offer is for new members only' })
    }
    const receipt = 'RCP-' + crypto.randomBytes(3).toString('hex').toUpperCase()
    const expires = new Date(Date.now() + pack.validity_days * 864e5).toISOString()
    const renewal = db.prepare(`SELECT 1 FROM member_packages WHERE member_id = ? AND package_id = ?`).get(req.member.id, pack.id)
    tx(() => {
      db.prepare(`INSERT INTO member_packages (member_id, package_id, expires_at, credits_total, credits_left, receipt_no)
        VALUES (?, ?, ?, ?, ?, ?)`).run(req.member.id, pack.id, expires, pack.classes, pack.classes, receipt)
      db.prepare(`INSERT INTO purchases (member_id, package_id, amount_cents, method, receipt_no) VALUES (?, ?, ?, 'demo', ?)`)
        .run(req.member.id, pack.id, pack.price_cents, receipt)
    })
    addPoints(req.member.id, renewal ? 'renewal' : 'purchase', receipt)
    notify(req.member.id, 'payment', 'Purchase confirmed', `${pack.name} — receipt ${receipt}. ${pack.classes ? pack.classes + ' classes added.' : 'Unlimited classes activated.'}`, '/packages')
    res.json({ ok: true, receipt })
  })

  // ── library ──
  router.get('/library', attachMember, (req, res) => {
    const { q, category, level, kind } = req.query
    let sql = `SELECT li.*, i.name AS instructor_name FROM library_items li
               LEFT JOIN instructors i ON i.id = li.instructor_id WHERE li.published = 1`
    const args = []
    if (q) { sql += ' AND (li.title LIKE ? OR li.summary LIKE ? OR li.muscles LIKE ?)'; args.push(`%${q}%`, `%${q}%`, `%${q}%`) }
    if (category) { sql += ' AND li.category = ?'; args.push(category) }
    if (level) { sql += ' AND li.level = ?'; args.push(level) }
    if (kind) { sql += ' AND li.kind = ?'; args.push(kind) }
    sql += ' ORDER BY li.created_at DESC'
    const items = db.prepare(sql).all(...args)
    const mine = req.member ? db.prepare('SELECT * FROM library_member WHERE member_id = ?').all(req.member.id) : []
    const mineMap = Object.fromEntries(mine.map((m) => [m.item_id, m]))
    res.json({
      items: items.map((i) => ({ ...i, content: undefined, my: mineMap[i.id] || null })),
      categories: db.prepare('SELECT DISTINCT category FROM library_items WHERE published = 1').all().map((r) => r.category),
      levels: db.prepare('SELECT DISTINCT level FROM library_items WHERE published = 1').all().map((r) => r.level),
      kinds: db.prepare('SELECT DISTINCT kind FROM library_items WHERE published = 1').all().map((r) => r.kind),
      recentlyViewed: req.member ? db.prepare(`
        SELECT li.id, li.title, li.image, li.duration_min, lm.viewed_at FROM library_member lm
        JOIN library_items li ON li.id = lm.item_id
        WHERE lm.member_id = ? AND lm.viewed_at IS NOT NULL ORDER BY lm.viewed_at DESC LIMIT 6`).all(req.member.id) : [],
    })
  })

  router.get('/library/:id', attachMember, (req, res) => {
    const item = db.prepare(`SELECT li.*, i.name AS instructor_name, i.photo AS instructor_photo
      FROM library_items li LEFT JOIN instructors i ON i.id = li.instructor_id
      WHERE li.id = ? AND li.published = 1`).get(req.params.id)
    if (!item) return res.status(404).json({ error: 'Content not found' })
    const content = JSON.parse(item.content || '{}')
    if (!req.member) {
      // guests preview the first step; full guidance unlocks with an account
      const preview = content.start ? { start: content.start } : {}
      return res.json({ item: { ...item, content: preview, locked: true, my: null } })
    }
    db.prepare(`INSERT INTO library_member (member_id, item_id, viewed_at) VALUES (?, ?, datetime('now'))
      ON CONFLICT(member_id, item_id) DO UPDATE SET viewed_at = datetime('now')`).run(req.member.id, item.id)
    const my = db.prepare('SELECT * FROM library_member WHERE member_id = ? AND item_id = ?').get(req.member.id, item.id)
    res.json({ item: { ...item, content, my } })
  })

  router.post('/library/:id/flags', requireAuth, (req, res) => {
    const item = db.prepare('SELECT id, title FROM library_items WHERE id = ?').get(req.params.id)
    if (!item) return res.status(404).json({ error: 'Content not found' })
    const { fav, completed, inRoutine } = req.body || {}
    db.prepare(`INSERT INTO library_member (member_id, item_id) VALUES (?, ?)
      ON CONFLICT(member_id, item_id) DO NOTHING`).run(req.member.id, item.id)
    if (fav !== undefined) db.prepare('UPDATE library_member SET fav = ? WHERE member_id = ? AND item_id = ?').run(fav ? 1 : 0, req.member.id, item.id)
    if (completed !== undefined) db.prepare('UPDATE library_member SET completed = ? WHERE member_id = ? AND item_id = ?').run(completed ? 1 : 0, req.member.id, item.id)
    if (inRoutine !== undefined) db.prepare('UPDATE library_member SET in_routine = ? WHERE member_id = ? AND item_id = ?').run(inRoutine ? 1 : 0, req.member.id, item.id)
    res.json({ ok: true, my: db.prepare('SELECT * FROM library_member WHERE member_id = ? AND item_id = ?').get(req.member.id, item.id) })
  })

  // ── playlists ──
  router.get('/playlists', attachMember, (req, res) => {
    const playlists = db.prepare(`SELECT p.*, i.name AS instructor_name FROM playlists p
      LEFT JOIN instructors i ON i.id = p.instructor_id`).all()
    const recent = !req.member ? [] : db.prepare(`
      SELECT DISTINCT p.*, i.name AS instructor_name, s.starts_at FROM bookings b
      JOIN class_sessions s ON s.id = b.session_id
      JOIN playlists p ON p.id = s.playlist_id
      LEFT JOIN instructors i ON i.id = p.instructor_id
      WHERE b.member_id = ? AND b.attended = 1 ORDER BY s.starts_at DESC LIMIT 5`).all(req.member.id)
    res.json({ playlists, recent })
  })

  // ── announcements ──
  router.get('/announcements', attachMember, (_req, res) => {
    res.json({ announcements: db.prepare('SELECT * FROM announcements WHERE active = 1 ORDER BY pinned DESC, created_at DESC LIMIT 10').all() })
  })

  return router
}
