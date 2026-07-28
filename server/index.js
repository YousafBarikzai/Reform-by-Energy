import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { db, DATA_DIR } from './db.js'
import { makeAuthMiddleware } from './auth.js'
import { ensureVapid, notify } from './lib.js'
import authRoutes from './routes/auth.js'
import scheduleRoutes from './routes/schedule.js'
import catalogRoutes from './routes/catalog.js'
import memberRoutes from './routes/member.js'
import adminRoutes from './routes/admin.js'

// surface fatal errors in platform logs instead of dying silently
process.on('uncaughtException', (err) => { console.error('[reform] fatal:', err); process.exit(1) })
process.on('unhandledRejection', (err) => { console.error('[reform] unhandled rejection:', err) })

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.join(__dirname, '..', 'dist')
const app = express()
app.disable('x-powered-by')
app.use(express.json({ limit: '12mb' }))

// modest rate limit on auth endpoints (in-memory window)
const hits = new Map()
app.use('/api/auth', (req, res, next) => {
  const key = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '') + ':' + req.path
  const now = Date.now()
  const windowHits = (hits.get(key) || []).filter((t) => now - t < 60000)
  if (windowHits.length >= 20) return res.status(429).json({ error: 'Too many attempts — try again in a minute' })
  windowHits.push(now)
  hits.set(key, windowHits)
  next()
})

app.get('/api/health', (_req, res) => res.json({ ok: true, dist: fs.existsSync(path.join(DIST, 'index.html')) }))

const { requireAuth, requireAdmin } = makeAuthMiddleware(db)

app.use('/api/auth', authRoutes)
app.use('/api', scheduleRoutes({ requireAuth }))
app.use('/api', catalogRoutes({ requireAuth }))
app.use('/api', memberRoutes({ requireAuth }))
app.use('/api/admin', adminRoutes({ requireAdmin }))

// uploaded files: auth required; progress photos only visible to their owner
app.get('/api/uploads/:file', requireAuth, (req, res) => {
  const name = path.basename(req.params.file)
  const owner = db.prepare('SELECT member_id FROM progress_photos WHERE file = ?').get(name)
  if (owner && owner.member_id !== req.member.id && req.member.role !== 'admin') {
    return res.status(403).json({ error: 'Private' })
  }
  const full = path.join(DATA_DIR, 'uploads', name)
  if (!fs.existsSync(full)) return res.status(404).json({ error: 'Not found' })
  res.sendFile(full)
})

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }))

// class reminder sweep: notify members ~2h before their booked class
function reminderSweep() {
  const rows = db.prepare(`
    SELECT b.id, b.member_id, s.starts_at, ct.name AS class_name, st.name AS studio_name
    FROM bookings b
    JOIN class_sessions s ON s.id = b.session_id
    JOIN class_types ct ON ct.id = s.class_type_id
    JOIN studios st ON st.id = s.studio_id
    WHERE b.status = 'booked' AND b.attended = 0
      AND datetime(s.starts_at) BETWEEN datetime('now', '+110 minutes') AND datetime('now', '+130 minutes')`).all()
  for (const r of rows) {
    const already = db.prepare(`SELECT 1 FROM notifications WHERE member_id = ? AND kind = 'reminder' AND link = ?`).get(r.member_id, `/reminder/${r.id}`)
    if (already) continue
    const when = new Date(r.starts_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    notify(r.member_id, 'reminder', `Class at ${when}`, `${r.class_name} in ${r.studio_name} — see you soon.`, `/reminder/${r.id}`)
  }
}
setInterval(reminderSweep, 10 * 60000)

// static frontend + SPA fallback (deep links and refreshes never 404).
// Paths with a file extension that missed the static handler are genuinely
// missing assets — 404 them rather than serving HTML with the wrong MIME.
app.use(express.static(DIST, { maxAge: '1h', index: false }))
app.use((req, res) => {
  if (req.method !== 'GET' || path.extname(req.path)) return res.status(404).end()
  res.sendFile(path.join(DIST, 'index.html'))
})

ensureVapid()
const port = Number(process.env.PORT || 4173)
app.listen(port, '0.0.0.0', () => {
  console.log(`[reform] serving app + API on http://0.0.0.0:${port} (data: ${DATA_DIR})`)
})
