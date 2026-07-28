import { Router } from 'express'
import { db } from '../db.js'
import {
  SESSION_SELECT, sessionView, availability, activePackage, consumeCredit, refundCredit,
  addPoints, notify, promoteWaitlist, evaluateBadges, evaluateChallenges,
} from '../lib.js'

export default function scheduleRoutes({ requireAuth }) {
  const router = Router()

  // GET /api/schedule?date=YYYY-MM-DD&instructor=&level=&category=&availability=&q=
  router.get('/schedule', requireAuth, (req, res) => {
    const { date, instructor, level, category, q } = req.query
    let sql = `${SESSION_SELECT} WHERE s.status = 'scheduled'`
    const args = []
    if (date) { sql += ` AND date(s.starts_at, 'localtime') = ?`; args.push(date) }
    else { sql += ` AND datetime(s.starts_at) >= datetime('now', '-12 hours')` }
    if (instructor) { sql += ' AND s.instructor_id = ?'; args.push(Number(instructor)) }
    if (level) { sql += ' AND ct.level = ?'; args.push(level) }
    if (category) { sql += ' AND ct.category = ?'; args.push(category) }
    if (q) { sql += ' AND (ct.name LIKE ? OR i.name LIKE ?)'; args.push(`%${q}%`, `%${q}%`) }
    sql += ' ORDER BY s.starts_at LIMIT 200'
    let sessions = db.prepare(sql).all(...args).map((r) => sessionView(r, req.member.id))
    if (req.query.availability === 'available') sessions = sessions.filter((s) => s.status !== 'full')
    res.json({ sessions })
  })

  router.get('/schedule/filters', requireAuth, (_req, res) => {
    res.json({
      instructors: db.prepare('SELECT id, name, photo FROM instructors WHERE active = 1').all(),
      levels: db.prepare('SELECT DISTINCT level FROM class_types WHERE active = 1').all().map((r) => r.level),
      categories: db.prepare('SELECT DISTINCT category FROM class_types WHERE active = 1').all().map((r) => r.category),
    })
  })

  router.get('/sessions/:id', requireAuth, (req, res) => {
    const row = db.prepare(`${SESSION_SELECT} WHERE s.id = ?`).get(req.params.id)
    if (!row) return res.status(404).json({ error: 'Class not found' })
    const view = sessionView(row, req.member.id)
    // reformer map: layout + live occupancy
    const reformers = db.prepare('SELECT * FROM reformers WHERE studio_id = ? ORDER BY number').all(row.studio_id)
    const taken = db.prepare(`SELECT reformer_id, member_id FROM bookings WHERE session_id = ? AND status = 'booked' AND reformer_id IS NOT NULL`).all(row.id)
    const takenMap = Object.fromEntries(taken.map((t) => [t.reformer_id, t.member_id]))
    const studio = db.prepare('SELECT * FROM studios WHERE id = ?').get(row.studio_id)
    view.playlist = row.playlist_id ? db.prepare('SELECT * FROM playlists WHERE id = ?').get(row.playlist_id) : null
    view.studioLayout = {
      cols: studio.cols, entrance: studio.entrance,
      reformers: reformers.map((r) => ({
        id: r.id, number: r.number,
        state: r.status !== 'ok' ? 'maintenance' : takenMap[r.id] ? (takenMap[r.id] === req.member.id ? 'mine' : 'taken') : 'free',
      })),
    }
    view.favouriteReformer = req.prefs.favouriteReformer || null
    res.json({ session: view })
  })

  router.post('/sessions/:id/book', requireAuth, (req, res) => {
    const row = db.prepare(`${SESSION_SELECT} WHERE s.id = ?`).get(req.params.id)
    if (!row) return res.status(404).json({ error: 'Class not found' })
    const avail = availability(row)
    if (avail.started) return res.status(400).json({ error: 'This class has already started' })
    if (avail.pastCutoff) return res.status(400).json({ error: 'Booking closed — the cut-off time has passed' })
    const dup = db.prepare(`SELECT id FROM bookings WHERE session_id = ? AND member_id = ? AND status = 'booked'`).get(row.id, req.member.id)
    if (dup) return res.status(409).json({ error: 'You are already booked into this class' })
    if (avail.spaces <= 0) return res.status(409).json({ error: 'Class is full — join the waiting list instead', full: true })

    const reformerId = req.body?.reformerId ? Number(req.body.reformerId) : null
    if (reformerId) {
      const ref = db.prepare('SELECT * FROM reformers WHERE id = ?').get(reformerId)
      if (!ref || ref.studio_id !== row.studio_id) return res.status(400).json({ error: 'That reformer is not in this studio' })
      if (ref.status !== 'ok') return res.status(409).json({ error: 'That reformer is unavailable' })
      const taken = db.prepare(`SELECT id FROM bookings WHERE session_id = ? AND reformer_id = ? AND status = 'booked'`).get(row.id, reformerId)
      if (taken) return res.status(409).json({ error: 'That reformer was just taken — pick another' })
    }

    const pack = activePackage(req.member.id)
    if (!pack) return res.status(402).json({ error: 'No class credits available — purchase a package to book', needsPackage: true })

    const doBook = db.transaction(() => {
      consumeCredit(req.member.id)
      const info = db.prepare(`INSERT INTO bookings (session_id, member_id, reformer_id, status) VALUES (?, ?, ?, 'booked')`)
        .run(row.id, req.member.id, reformerId)
      // leaving any waitlist entry for this session
      db.prepare('DELETE FROM waitlist WHERE session_id = ? AND member_id = ? AND promoted_at IS NULL').run(row.id, req.member.id)
      return info.lastInsertRowid
    })
    const bookingId = doBook()
    addPoints(req.member.id, 'book_class', `booking:${bookingId}`)

    const when = new Date(row.starts_at).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    const refText = reformerId ? ` · Reformer ${db.prepare('SELECT number FROM reformers WHERE id = ?').get(reformerId).number}` : ''
    notify(req.member.id, 'booking', 'Booking confirmed', `${row.class_name} — ${when} · ${row.studio_name}${refText}`, `/class/${row.id}`)

    const after = availability(row)
    if (after.spaces === 1) {
      // favourite-class fans could be notified here; kept to the booker's own flows
    }
    res.json({ ok: true, bookingId, session: sessionView(db.prepare(`${SESSION_SELECT} WHERE s.id = ?`).get(row.id), req.member.id) })
  })

  router.post('/sessions/:id/cancel', requireAuth, (req, res) => {
    const row = db.prepare(`${SESSION_SELECT} WHERE s.id = ?`).get(req.params.id)
    if (!row) return res.status(404).json({ error: 'Class not found' })
    const booking = db.prepare(`SELECT * FROM bookings WHERE session_id = ? AND member_id = ? AND status = 'booked'`).get(row.id, req.member.id)
    if (!booking) return res.status(404).json({ error: 'You are not booked into this class' })
    if (new Date(row.starts_at) <= new Date()) return res.status(400).json({ error: 'This class has already started' })

    const avail = availability(row)
    const refundable = !avail.pastCutoff
    db.transaction(() => {
      db.prepare(`UPDATE bookings SET status = 'cancelled', cancelled_at = datetime('now') WHERE id = ?`).run(booking.id)
      if (refundable) {
        const pack = activePackage(req.member.id) || db.prepare(`SELECT * FROM member_packages WHERE member_id = ? ORDER BY expires_at DESC LIMIT 1`).get(req.member.id)
        if (pack) refundCredit(req.member.id, pack.id)
      }
    })()
    notify(req.member.id, 'booking', 'Booking cancelled', refundable
      ? `${row.class_name} cancelled — your class credit has been returned.`
      : `${row.class_name} cancelled after the cut-off — the credit was not returned (see booking policy).`,
      '/schedule')
    promoteWaitlist(row.id)
    res.json({ ok: true, refunded: refundable, session: sessionView(db.prepare(`${SESSION_SELECT} WHERE s.id = ?`).get(row.id), req.member.id) })
  })

  router.post('/sessions/:id/reformer', requireAuth, (req, res) => {
    const row = db.prepare(`${SESSION_SELECT} WHERE s.id = ?`).get(req.params.id)
    if (!row) return res.status(404).json({ error: 'Class not found' })
    const booking = db.prepare(`SELECT * FROM bookings WHERE session_id = ? AND member_id = ? AND status = 'booked'`).get(row.id, req.member.id)
    if (!booking) return res.status(404).json({ error: 'You are not booked into this class' })
    if (availability(row).pastCutoff) return res.status(400).json({ error: 'Reformer changes close at the booking cut-off' })
    const reformerId = Number(req.body?.reformerId)
    const ref = db.prepare('SELECT * FROM reformers WHERE id = ?').get(reformerId)
    if (!ref || ref.studio_id !== row.studio_id || ref.status !== 'ok') return res.status(400).json({ error: 'That reformer is unavailable' })
    const taken = db.prepare(`SELECT id FROM bookings WHERE session_id = ? AND reformer_id = ? AND status = 'booked' AND member_id != ?`).get(row.id, reformerId, req.member.id)
    if (taken) return res.status(409).json({ error: 'That reformer was just taken' })
    db.prepare('UPDATE bookings SET reformer_id = ? WHERE id = ?').run(reformerId, booking.id)
    res.json({ ok: true, reformer: ref.number })
  })

  router.post('/sessions/:id/waitlist', requireAuth, (req, res) => {
    const row = db.prepare(`${SESSION_SELECT} WHERE s.id = ?`).get(req.params.id)
    if (!row) return res.status(404).json({ error: 'Class not found' })
    const avail = availability(row)
    if (avail.spaces > 0) return res.status(400).json({ error: 'This class still has spaces — book directly' })
    if (avail.started) return res.status(400).json({ error: 'This class has already started' })
    try {
      db.prepare('INSERT INTO waitlist (session_id, member_id) VALUES (?, ?)').run(row.id, req.member.id)
    } catch {
      return res.status(409).json({ error: 'You are already on this waiting list' })
    }
    const pos = db.prepare('SELECT COUNT(*) AS n FROM waitlist WHERE session_id = ? AND promoted_at IS NULL').get(row.id).n
    notify(req.member.id, 'waitlist', 'Added to waiting list', `${row.class_name} — you are number ${pos} in the queue. We'll book you in automatically if a space opens.`, `/class/${row.id}`)
    res.json({ ok: true, position: pos })
  })

  router.post('/sessions/:id/waitlist/leave', requireAuth, (req, res) => {
    db.prepare('DELETE FROM waitlist WHERE session_id = ? AND member_id = ? AND promoted_at IS NULL').run(req.params.id, req.member.id)
    res.json({ ok: true })
  })

  // rate + note an attended class
  router.post('/bookings/:id/feedback', requireAuth, (req, res) => {
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ? AND member_id = ?').get(req.params.id, req.member.id)
    if (!booking) return res.status(404).json({ error: 'Booking not found' })
    const rating = req.body?.rating != null ? Math.max(1, Math.min(5, Number(req.body.rating))) : booking.rating
    const notes = req.body?.notes !== undefined ? String(req.body.notes).slice(0, 1000) : booking.notes
    db.prepare('UPDATE bookings SET rating = ?, notes = ? WHERE id = ?').run(rating, notes, booking.id)
    res.json({ ok: true })
  })

  // demo check-in: marks the member attended via the QR code flow
  router.post('/checkin', requireAuth, (req, res) => {
    const booking = db.prepare(`
      SELECT b.*, s.starts_at FROM bookings b JOIN class_sessions s ON s.id = b.session_id
      WHERE b.member_id = ? AND b.status = 'booked' AND b.attended = 0
        AND datetime(s.starts_at) <= datetime('now', '+30 minutes') AND datetime(s.starts_at) >= datetime('now', '-2 hours')
      ORDER BY s.starts_at LIMIT 1`).get(req.member.id)
    if (!booking) return res.status(404).json({ error: 'No class within the check-in window (30 min before to 2 h after start)' })
    db.prepare('UPDATE bookings SET attended = 1 WHERE id = ?').run(booking.id)
    addPoints(req.member.id, 'attend_class', `booking:${booking.id}`)
    evaluateBadges(req.member.id)
    evaluateChallenges(req.member.id)
    notify(req.member.id, 'booking', 'Checked in — enjoy class!', '+25 points for attending.', '/profile/rewards')
    res.json({ ok: true })
  })

  // .ics download for a booked class
  router.get('/sessions/:id/calendar.ics', requireAuth, (req, res) => {
    const row = db.prepare(`${SESSION_SELECT} WHERE s.id = ?`).get(req.params.id)
    if (!row) return res.status(404).send('Not found')
    const dt = (d) => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
    const end = new Date(new Date(row.starts_at).getTime() + row.duration_min * 60000)
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Reform by Energym//PWA//EN', 'BEGIN:VEVENT',
      `UID:reform-${row.id}@reformbyenergym.com`,
      `DTSTAMP:${dt(new Date())}`, `DTSTART:${dt(row.starts_at)}`, `DTEND:${dt(end)}`,
      `SUMMARY:${row.class_name} — Reform by Energym`,
      `DESCRIPTION:${row.class_name} with ${row.instructor_name} in ${row.studio_name}`,
      `LOCATION:Reform by Energym · ${row.studio_name}`,
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n')
    res.setHeader('Content-Type', 'text/calendar')
    res.setHeader('Content-Disposition', `attachment; filename="reform-class-${row.id}.ics"`)
    res.send(ics)
  })

  return router
}
