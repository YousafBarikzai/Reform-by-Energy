import crypto from 'node:crypto'

// scrypt password hashing — zero native deps, format: salt:hash (hex)
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password, stored) {
  const [salt, hash] = String(stored).split(':')
  if (!salt || !hash) return false
  const candidate = crypto.scryptSync(password, salt, 64)
  const expected = Buffer.from(hash, 'hex')
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected)
}

export const newToken = () => crypto.randomBytes(32).toString('hex')

const SESSION_DAYS = 30

export function issueSession(db, memberId) {
  const token = newToken()
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5).toISOString()
  db.prepare('INSERT INTO auth_tokens (token, member_id, expires_at) VALUES (?, ?, ?)').run(token, memberId, expires)
  return { token, expires }
}

export function sessionCookie(token, expires) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `reform_session=${token}; Path=/; Expires=${new Date(expires).toUTCString()}; HttpOnly; SameSite=Lax${secure}`
}

export function clearCookie() {
  return 'reform_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax'
}

export function readSession(db, req) {
  const cookies = req.headers.cookie || ''
  const match = cookies.match(/(?:^|;\s*)reform_session=([a-f0-9]{64})/)
  if (!match) return null
  const row = db.prepare(`
    SELECT m.* FROM auth_tokens t JOIN members m ON m.id = t.member_id
    WHERE t.token = ? AND datetime(t.expires_at) > datetime('now') AND m.deleted_at IS NULL
  `).get(match[1])
  return row || null
}

export function makeAuthMiddleware(db) {
  const requireAuth = (req, res, next) => {
    const member = readSession(db, req)
    if (!member) return res.status(401).json({ error: 'Not signed in' })
    req.member = member
    req.prefs = safeParse(member.prefs)
    next()
  }
  const requireAdmin = (req, res, next) => {
    requireAuth(req, res, () => {
      if (req.member.role !== 'admin') return res.status(403).json({ error: 'Admin access required' })
      next()
    })
  }
  return { requireAuth, requireAdmin }
}

export function safeParse(json, fallback = {}) {
  try { return JSON.parse(json) ?? fallback } catch { return fallback }
}
