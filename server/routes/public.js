import { Router } from 'express'
import { db } from '../db.js'
import { SESSION_SELECT, sessionView } from '../lib.js'

// Public website content. attachMember personalises where a session exists,
// but nothing here requires one and nothing member-specific leaks to guests.
export default function publicRoutes({ attachMember }) {
  const router = Router()

  router.get('/instructors', attachMember, (_req, res) => {
    const instructors = db.prepare('SELECT id, name, bio, photo, specialties, quals FROM instructors WHERE active = 1').all()
    const teaches = db.prepare(`
      SELECT DISTINCT s.instructor_id, ct.id AS type_id, ct.name, ct.level, ct.image
      FROM class_sessions s JOIN class_types ct ON ct.id = s.class_type_id
      WHERE s.status = 'scheduled' AND datetime(s.starts_at) > datetime('now') AND ct.active = 1`).all()
    res.json({
      instructors: instructors.map((i) => ({
        ...i,
        teaches: teaches.filter((t) => t.instructor_id === i.id).map(({ type_id, name, level, image }) => ({ id: type_id, name, level, image })),
      })),
    })
  })

  router.get('/instructors/:id', attachMember, (req, res) => {
    const instructor = db.prepare('SELECT id, name, bio, photo, specialties, quals FROM instructors WHERE id = ? AND active = 1').get(req.params.id)
    if (!instructor) return res.status(404).json({ error: 'Instructor not found' })
    const upcoming = db.prepare(`${SESSION_SELECT}
      WHERE s.instructor_id = ? AND s.status = 'scheduled' AND datetime(s.starts_at) > datetime('now')
      ORDER BY s.starts_at LIMIT 6`).all(instructor.id)
      .map((r) => sessionView(r, req.member?.id))
    const teaches = db.prepare(`
      SELECT DISTINCT ct.id, ct.name, ct.level, ct.duration_min, ct.image
      FROM class_sessions s JOIN class_types ct ON ct.id = s.class_type_id
      WHERE s.instructor_id = ? AND ct.active = 1`).all(instructor.id)
    res.json({ instructor, upcoming, teaches })
  })

  // studio bundle: testimonials, FAQs, and headline stats for the homepage
  router.get('/studio', attachMember, (_req, res) => {
    res.json({
      testimonials: db.prepare('SELECT id, name, text, rating FROM testimonials WHERE active = 1 ORDER BY id LIMIT 8').all(),
      faqs: db.prepare('SELECT id, question, answer FROM faqs WHERE active = 1 ORDER BY sort').all(),
      stats: {
        weeklyClasses: db.prepare(`SELECT COUNT(*) AS n FROM class_sessions WHERE status = 'scheduled' AND datetime(starts_at) BETWEEN datetime('now') AND datetime('now', '+7 days')`).get().n,
        instructors: db.prepare('SELECT COUNT(*) AS n FROM instructors WHERE active = 1').get().n,
        maxClassSize: db.prepare('SELECT MAX(capacity) AS n FROM class_sessions').get().n || 8,
        classTypes: db.prepare('SELECT COUNT(*) AS n FROM class_types WHERE active = 1').get().n,
      },
    })
  })

  // featured upcoming classes for the homepage (next few days, not full)
  router.get('/featured', attachMember, (req, res) => {
    const rows = db.prepare(`${SESSION_SELECT}
      WHERE s.status = 'scheduled' AND datetime(s.starts_at) > datetime('now')
      ORDER BY s.starts_at LIMIT 30`).all()
    const seen = new Set()
    const featured = []
    for (const r of rows) {
      if (seen.has(r.class_type_id)) continue
      const view = sessionView(r, req.member?.id)
      if (view.status === 'full') continue
      seen.add(r.class_type_id)
      featured.push(view)
      if (featured.length >= 5) break
    }
    res.json({ featured })
  })

  return router
}
