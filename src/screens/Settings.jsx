import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../auth.jsx'
import { ICONS } from '../data.js'
import Icon from '../components/Icon.jsx'
import { Btn, Card, Field, SectionLabel, Sheet, Tag, TopBar, inputStyle, useToast, vibrate } from '../ui.jsx'

const NOTIF_CATS = [
  ['reminders', 'Class reminders'],
  ['bookings', 'Bookings & payments'],
  ['waitlist', 'Waiting list updates'],
  ['rewards', 'Rewards & points'],
  ['challenges', 'Challenges'],
  ['announcements', 'Studio announcements'],
  ['library', 'New library content'],
  ['favourites', 'Favourite instructor & classes'],
]

const SERVICES = [
  ['apple-health', 'Apple Health'],
  ['google-health', 'Google Health Connect'],
  ['fitbit', 'Fitbit'],
  ['garmin', 'Garmin'],
]

function Toggle({ on, onClick }) {
  return (
    <div className="press" onClick={() => { vibrate(4); onClick() }} style={{ width: 40, height: 24, borderRadius: 100, padding: 3, boxSizing: 'border-box', background: on ? 'var(--rose)' : 'var(--line)', transition: 'background .25s', cursor: 'pointer', flexShrink: 0 }}>
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', transform: `translateX(${on ? 16 : 0}px)`, transition: 'transform .25s' }} />
    </div>
  )
}

export default function Settings() {
  const { member, refresh, logout } = useAuth()
  const nav = useNavigate()
  const toast = useToast()
  const fileRef = useRef(null)
  const [form, setForm] = useState({ firstName: member.firstName, lastName: member.lastName })
  const [deleteSheet, setDeleteSheet] = useState(false)
  const [busy, setBusy] = useState(false)
  const prefs = member.prefs || {}
  const notifs = prefs.notifications || {}
  const connections = prefs.connections || {}

  async function save(patch, msg) {
    try { await api.patch('/me', patch); await refresh(); if (msg) toast(msg) }
    catch (err) { toast(err.message, 'err') }
  }

  function uploadPhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      try { await api.post('/me/photo', { dataUrl: reader.result }); await refresh(); toast('Photo updated') }
      catch (err) { toast(err.message, 'err') }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  async function togglePush() {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return toast('Push is not supported in this browser', 'err')
      const reg = await navigator.serviceWorker.ready
      const existing = await reg.pushManager.getSubscription()
      if (existing) {
        await api.post('/push/unsubscribe', { endpoint: existing.endpoint })
        await existing.unsubscribe()
        toast('Push notifications off')
      } else {
        const { key } = await api.get('/push/key')
        const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key })
        const json = sub.toJSON()
        await api.post('/push/subscribe', { endpoint: json.endpoint, keys: json.keys })
        toast('Push notifications on')
      }
    } catch {
      toast('Push needs the installed app and notification permission', 'err')
    }
  }

  async function connectService(id, name) {
    const isConnected = !!connections[id]
    try {
      await api.post(`/connections/${id}`, { connect: !isConnected })
      await refresh()
      toast(isConnected ? `${name} disconnected — imported data removed` : `${name} consent recorded`)
    } catch (err) { toast(err.message, 'err') }
  }

  return (
    <div style={{ animation: 'plFade .3s' }}>
      <TopBar title="Settings" />

      {/* personal details */}
      <SectionLabel>Personal details</SectionLabel>
      <Card style={{ margin: '0 24px', padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          {member.photo
            ? <img src={member.photo} alt="" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }} />
            : <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--pinksoft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Marcellus,serif', fontSize: 22, color: 'var(--rose)' }}>{member.firstName[0]}</div>}
          <div className="press" onClick={() => fileRef.current?.click()} style={{ fontSize: 12, fontWeight: 700, color: 'var(--rose)', cursor: 'pointer' }}>CHANGE PHOTO</div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadPhoto} style={{ display: 'none' }} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}><Field label="First name"><input style={inputStyle} value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} /></Field></div>
          <div style={{ flex: 1 }}><Field label="Last name"><input style={inputStyle} value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} /></Field></div>
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--sub)', margin: '10px 2px 0' }}>Email · {member.email} · member no. {member.membershipNumber}</div>
        <Btn small kind="soft" style={{ marginTop: 12 }} onClick={() => save({ firstName: form.firstName, lastName: form.lastName }, 'Details saved')}>SAVE DETAILS</Btn>
      </Card>

      {/* class preferences (drives rule-based recommendations) */}
      <SectionLabel>Class preferences</SectionLabel>
      <Card style={{ margin: '0 24px', padding: '16px 18px' }}>
        <div style={{ fontSize: 11.5, color: 'var(--sub)', marginBottom: 12, lineHeight: 1.5 }}>These preferences drive your recommendations — simple rules, no AI.</div>
        <Field label="Goal">
          <select style={inputStyle} value={prefs.goal || ''} onChange={(e) => save({ prefs: { goal: e.target.value } }, 'Preference saved')}>
            <option value="">Choose…</option>
            {['Tone & strength', 'Flexibility', 'Posture', 'Recovery', 'Pre/post-natal', 'General fitness'].map((g) => <option key={g}>{g}</option>)}
          </select>
        </Field>
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <div style={{ flex: 1 }}>
            <Field label="Level">
              <select style={inputStyle} value={prefs.level || ''} onChange={(e) => save({ prefs: { level: e.target.value } }, 'Preference saved')}>
                <option value="">Any</option>
                {['Beginner', 'Intermediate', 'Advanced', 'All levels'].map((l) => <option key={l}>{l}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ flex: 1 }}>
            <Field label="Preferred time">
              <select style={inputStyle} value={prefs.preferredTime || ''} onChange={(e) => save({ prefs: { preferredTime: e.target.value } }, 'Preference saved')}>
                <option value="">Any</option>
                {['Morning', 'Afternoon', 'Evening'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--sub)', marginBottom: 8 }}>Preferred days</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
              const on = (prefs.preferredDays || []).includes(day)
              return (
                <div key={day} className="press" onClick={() => {
                  const next = on ? (prefs.preferredDays || []).filter((x) => x !== day) : [...(prefs.preferredDays || []), day]
                  save({ prefs: { preferredDays: next } })
                }} style={{ flex: 1, textAlign: 'center', padding: '9px 0', borderRadius: 12, fontSize: 11.5, fontWeight: 700, cursor: 'pointer', background: on ? 'var(--rose)' : 'var(--blush)', color: on ? '#fff' : 'var(--sub)', transition: 'all .2s' }}>{day[0]}</div>
              )
            })}
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <Field label="Weekly class goal">
            <select style={inputStyle} value={prefs.weeklyGoal || 4} onChange={(e) => save({ prefs: { weeklyGoal: Number(e.target.value) } }, 'Goal updated')}>
              {[2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} classes a week</option>)}
            </select>
          </Field>
        </div>
      </Card>

      {/* notifications */}
      <SectionLabel>Notifications</SectionLabel>
      <Card style={{ margin: '0 24px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: '1px solid var(--line)', background: 'var(--blush)' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>Push notifications</div>
            <div style={{ fontSize: 11.5, color: 'var(--sub)', marginTop: 2 }}>Delivered to this device (installed app)</div>
          </div>
          <Btn small kind="soft" onClick={togglePush}>TOGGLE</Btn>
        </div>
        {NOTIF_CATS.map(([key, name], i) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: i === NOTIF_CATS.length - 1 ? 'none' : '1px solid var(--line)' }}>
            <div style={{ flex: 1, fontSize: 13.5 }}>{name}</div>
            <Toggle on={notifs[key] !== false} onClick={() => save({ prefs: { notifications: { ...notifs, [key]: notifs[key] === false } } })} />
          </div>
        ))}
      </Card>

      {/* privacy */}
      <SectionLabel>Privacy</SectionLabel>
      <Card style={{ margin: '0 24px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: '1px solid var(--line)' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5 }}>Show my name on leaderboards</div>
            <div style={{ fontSize: 11.5, color: 'var(--sub)', marginTop: 2 }}>Off = you appear as “Private member”</div>
          </div>
          <Toggle on={prefs.leaderboardVisible !== false} onClick={() => save({ prefs: { leaderboardVisible: prefs.leaderboardVisible === false } })} />
        </div>
        <a href="/api/me/export" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: '1px solid var(--line)', color: 'var(--ink)' }}>
          <Icon d={ICONS.download} size={16} color="var(--rose)" />
          <div style={{ flex: 1, fontSize: 13.5 }}>Download my data (JSON)</div>
        </a>
        <div className="press" onClick={() => setDeleteSheet(true)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', cursor: 'pointer' }}>
          <Icon d={ICONS.logout} size={16} color="#B03A3A" />
          <div style={{ flex: 1, fontSize: 13.5, color: '#B03A3A' }}>Delete my account</div>
        </div>
      </Card>

      {/* connected services */}
      <SectionLabel>Connected services</SectionLabel>
      <Card style={{ margin: '0 24px', overflow: 'hidden' }}>
        <div style={{ padding: '12px 18px', fontSize: 11.5, color: 'var(--sub)', lineHeight: 1.55, borderBottom: '1px solid var(--line)', background: 'var(--blush)' }}>
          Health platforms can't share data directly with a browser app — connecting records your consent now, and syncing activates with the native companion app. Disconnect any time to remove imported data.
        </div>
        {SERVICES.map(([id, name], i) => {
          const c = connections[id]
          return (
            <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: i === SERVICES.length - 1 ? 'none' : '1px solid var(--line)' }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--pinksoft)', color: 'var(--rose)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon d={ICONS.watch} size={15} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{name}</div>
                {c && <div style={{ fontSize: 10.5, color: 'var(--sub)', marginTop: 1 }}>Consent given · awaiting native app</div>}
              </div>
              {c ? <Tag tone="amber">Pending</Tag> : null}
              <Btn small kind={c ? 'outline' : 'soft'} onClick={() => connectService(id, name)}>{c ? 'DISCONNECT' : 'CONNECT'}</Btn>
            </div>
          )
        })}
      </Card>

      {/* policies */}
      <SectionLabel>Terms & policies</SectionLabel>
      <Card style={{ margin: '0 24px 10px', padding: '14px 18px', fontSize: 12.5, color: 'var(--sub)', lineHeight: 1.7 }}>
        Bookings use one credit and refund automatically when cancelled before the cut-off. Progress photos and wellness data are private to your account, encrypted in transit, and deletable at any time. Points have no cash value. Full studio terms are available at the front desk.
      </Card>

      <div style={{ padding: '4px 24px 14px' }}>
        <Btn kind="ghost" onClick={async () => { await logout(); nav('/') }}>SIGN OUT</Btn>
      </div>

      {/* delete account sheet */}
      <Sheet open={deleteSheet} onClose={() => setDeleteSheet(false)}>
        <div style={{ fontFamily: 'Marcellus,serif', fontSize: 21, marginBottom: 8 }}>Delete your account?</div>
        <div style={{ fontSize: 13.5, color: 'var(--sub)', lineHeight: 1.65 }}>
          This anonymises your account, signs you out everywhere, and permanently deletes your progress photos. Attendance records are retained in anonymised form. This cannot be undone.
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <Btn kind="soft" style={{ flex: 1 }} onClick={() => setDeleteSheet(false)}>KEEP MY ACCOUNT</Btn>
          <Btn style={{ flex: 1, background: '#B03A3A' }} disabled={busy} onClick={async () => {
            setBusy(true)
            try { await api.post('/me/delete'); await logout(); nav('/auth') }
            catch (err) { toast(err.message, 'err'); setBusy(false) }
          }}>{busy ? 'DELETING…' : 'DELETE'}</Btn>
        </div>
      </Sheet>
    </div>
  )
}
