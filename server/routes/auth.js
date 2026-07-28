import { Router } from 'express'
import crypto from 'node:crypto'
import { db } from '../db.js'
import { hashPassword, verifyPassword, issueSession, sessionCookie, clearCookie, newToken, safeParse } from '../auth.js'
import { addPoints, notify } from '../lib.js'

const router = Router()

const publicMember = (m) => ({
  id: m.id, email: m.email, firstName: m.first_name, lastName: m.last_name,
  role: m.role, photo: m.photo, membershipNumber: m.membership_number,
  referralCode: m.referral_code, guestPasses: m.guest_passes,
  prefs: safeParse(m.prefs), createdAt: m.created_at,
})

router.post('/register', (req, res) => {
  const { email, password, firstName, lastName = '', referralCode } = req.body || {}
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: 'A valid email is required' })
  if (!password || password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' })
  if (!firstName || !firstName.trim()) return res.status(400).json({ error: 'First name is required' })
  const exists = db.prepare('SELECT id FROM members WHERE email = ?').get(email.toLowerCase().trim())
  if (exists) return res.status(409).json({ error: 'An account with this email already exists' })

  const prefs = { notifications: { reminders: true, bookings: true, waitlist: true, rewards: true, challenges: true, announcements: true, library: true, favourites: true } }
  let referrer = null
  if (referralCode) {
    referrer = db.prepare('SELECT id, first_name FROM members WHERE referral_code = ?').get(referralCode.toUpperCase().trim())
    if (referrer) prefs.referredBy = referralCode.toUpperCase().trim()
  }
  const num = 'RE-' + String(1000 + db.prepare('SELECT COUNT(*) AS n FROM members').get().n * 7 + Math.floor(Math.random() * 7))
  const myCode = (firstName.slice(0, 5) + crypto.randomBytes(2).toString('hex')).toUpperCase()
  const info = db.prepare(`INSERT INTO members (email, pass_hash, first_name, last_name, membership_number, referral_code, prefs)
    VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run(email.toLowerCase().trim(), hashPassword(password), firstName.trim(), lastName.trim(), num, myCode, JSON.stringify(prefs))
  const memberId = info.lastInsertRowid

  if (referrer) {
    addPoints(referrer.id, 'referral', `member:${memberId}`)
    notify(referrer.id, 'rewards', 'Referral joined!', `${firstName.trim()} just joined Reform with your code — points added.`, '/profile/rewards')
  }
  notify(memberId, 'announcement', 'Welcome to Reform', 'Complete your profile and preferences to earn your first points.', '/profile/settings')

  const { token, expires } = issueSession(db, memberId)
  res.setHeader('Set-Cookie', sessionCookie(token, expires))
  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(memberId)
  res.json({ member: publicMember(member) })
})

router.post('/login', (req, res) => {
  const { email, password } = req.body || {}
  const member = db.prepare('SELECT * FROM members WHERE email = ? AND deleted_at IS NULL').get(String(email || '').toLowerCase().trim())
  if (!member || !verifyPassword(password || '', member.pass_hash)) {
    return res.status(401).json({ error: 'Incorrect email or password' })
  }
  const { token, expires } = issueSession(db, member.id)
  res.setHeader('Set-Cookie', sessionCookie(token, expires))
  res.json({ member: publicMember(member) })
})

router.post('/logout', (req, res) => {
  const match = (req.headers.cookie || '').match(/(?:^|;\s*)reform_session=([a-f0-9]{64})/)
  if (match) db.prepare('DELETE FROM auth_tokens WHERE token = ?').run(match[1])
  res.setHeader('Set-Cookie', clearCookie())
  res.json({ ok: true })
})

// Demo environment has no email service: the reset token is returned directly
// with a clear flag so the UI can explain the flow honestly.
router.post('/forgot', (req, res) => {
  const member = db.prepare('SELECT id FROM members WHERE email = ? AND deleted_at IS NULL').get(String(req.body?.email || '').toLowerCase().trim())
  if (!member) return res.json({ ok: true, demo: true }) // do not reveal accounts
  const token = newToken().slice(0, 8).toUpperCase()
  db.prepare('INSERT INTO reset_tokens (token, member_id, expires_at) VALUES (?, ?, ?)').run(token, member.id, new Date(Date.now() + 30 * 60000).toISOString())
  res.json({ ok: true, demo: true, resetCode: token })
})

router.post('/reset', (req, res) => {
  const { code, password } = req.body || {}
  if (!password || password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' })
  const row = db.prepare(`SELECT * FROM reset_tokens WHERE token = ? AND used_at IS NULL AND datetime(expires_at) > datetime('now')`).get(String(code || '').toUpperCase().trim())
  if (!row) return res.status(400).json({ error: 'Invalid or expired reset code' })
  db.prepare('UPDATE members SET pass_hash = ? WHERE id = ?').run(hashPassword(password), row.member_id)
  db.prepare(`UPDATE reset_tokens SET used_at = datetime('now') WHERE token = ?`).run(row.token)
  db.prepare('DELETE FROM auth_tokens WHERE member_id = ?').run(row.member_id)
  res.json({ ok: true })
})

export default router
export { publicMember }
