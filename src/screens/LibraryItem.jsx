import { useNavigate, useParams } from 'react-router-dom'
import { api, useApi } from '../api.js'
import { useAuth } from '../auth.jsx'
import { ICONS } from '../data.js'
import Icon from '../components/Icon.jsx'
import { Btn, Card, ErrorState, PageSkeleton, Tag, TopBar, useToast } from '../ui.jsx'

const SECTIONS = [
  ['start', 'Starting position', ICONS.user],
  ['movement', 'The movement', ICONS.stretch],
  ['breathing', 'Breathing', ICONS.core],
  ['mistakes', 'Common mistakes', ICONS.help],
  ['safety', 'Safety', ICONS.shield],
  ['mods', 'Beginner modifications', ICONS.heart],
  ['advanced', 'Advanced variation', ICONS.flame],
  ['tips', 'Instructor tip', ICONS.sparkle],
]

export default function LibraryItem() {
  const { id } = useParams()
  const nav = useNavigate()
  const { member } = useAuth()
  const { data, loading, error, refetch } = useApi(`/library/${id}`)
  const toast = useToast()
  if (loading) return <PageSkeleton />
  if (error) return <ErrorState error={error} retry={refetch} />
  const i = data.item
  const my = i.my || {}

  async function flag(patch, msg) {
    try {
      await api.post(`/library/${id}/flags`, patch)
      if (msg) toast(msg)
      refetch()
    } catch (err) { toast(err.message, 'err') }
  }

  return (
    <div style={{ animation: 'plFade .3s' }}>
      <TopBar title="" right={member &&
        <div className="press" onClick={() => flag({ fav: !my.fav }, my.fav ? 'Removed from favourites' : 'Saved to favourites ♥')}
          style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--card)', boxShadow: 'var(--shadow)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: my.fav ? 'var(--rose)' : 'var(--sub)' }}>
          <Icon d={ICONS.heart} size={19} strokeWidth={my.fav ? 2.4 : 1.7} />
        </div>
      } />

      <div style={{ position: 'relative', margin: '14px 24px 0' }}>
        <img src={i.image} alt="" style={{ width: '100%', height: 190, objectFit: 'cover', display: 'block', borderRadius: 22 }} />
        <div style={{ position: 'absolute', inset: 0, borderRadius: 22, background: 'linear-gradient(180deg, rgba(56,38,46,0) 40%, rgba(56,38,46,.55))' }} />
        <div style={{ position: 'absolute', left: 16, bottom: 14, color: '#fff' }}>
          <div style={{ fontFamily: 'Marcellus,serif', fontSize: 23 }}>{i.title}</div>
          <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>{i.duration_min} min · {i.level} · {i.category}</div>
        </div>
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          {i.video_url
            ? <Tag style={{ background: 'rgba(255,255,255,.9)' }}>▶ Video</Tag>
            : <Tag style={{ background: 'rgba(255,255,255,.9)' }}>Demo video coming soon</Tag>}
        </div>
      </div>

      <div style={{ padding: '16px 24px 0' }}>
        <div style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--sub)' }}>{i.summary}</div>
        {i.muscles && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
            {i.muscles.split('·').map((mch) => <Tag key={mch} tone="grey">{mch.trim()}</Tag>)}
          </div>
        )}
        {i.instructor_name && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 14 }}>
            {i.instructor_photo && <img src={i.instructor_photo} alt="" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }} />}
            <div style={{ fontSize: 12.5, color: 'var(--sub)' }}>with <b style={{ color: 'var(--ink)' }}>{i.instructor_name}</b></div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 18 }}>
          {SECTIONS.map(([key, title, icon]) => i.content[key] && (
            <Card key={key} style={{ padding: '14px 17px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 6 }}>
                <div style={{ width: 28, height: 28, borderRadius: 9, background: 'var(--pinksoft)', color: 'var(--rose)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon d={icon} size={14} /></div>
                <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: '.02em' }}>{title}</div>
              </div>
              <div style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--sub)' }}>{i.content[key]}</div>
            </Card>
          ))}
        </div>

        {i.locked && (
          <Card style={{ marginTop: 16, padding: '22px 20px', textAlign: 'center', background: 'linear-gradient(135deg, var(--pinksoft), var(--card))' }}>
            <div style={{ fontFamily: 'Marcellus,serif', fontSize: 19 }}>Unlock the full guide</div>
            <div style={{ fontSize: 12.5, color: 'var(--sub)', lineHeight: 1.6, marginTop: 6 }}>
              The complete movement breakdown, breathing, modifications, and instructor tips are free with a Reform account.
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <Btn style={{ flex: 1 }} onClick={() => nav('/auth', { state: { from: `/library/${id}`, register: true } })}>CREATE ACCOUNT</Btn>
              <Btn kind="outline" style={{ flex: 1 }} onClick={() => nav('/auth', { state: { from: `/library/${id}` } })}>LOG IN</Btn>
            </div>
          </Card>
        )}
        {member && <div style={{ display: 'flex', gap: 10, margin: '18px 0 8px' }}>
          <Btn kind={my.completed ? 'soft' : 'primary'} style={{ flex: 1 }}
            onClick={() => flag({ completed: !my.completed }, my.completed ? 'Marked as not done' : 'Marked complete ✓')}>
            {my.completed ? 'COMPLETED ✓' : 'MARK COMPLETE'}
          </Btn>
          <Btn kind={my.in_routine ? 'outline' : 'soft'} style={{ flex: 1 }}
            onClick={() => flag({ inRoutine: !my.in_routine }, my.in_routine ? 'Removed from your routine' : 'Added to your routine')}>
            {my.in_routine ? 'IN ROUTINE ✓' : 'ADD TO ROUTINE'}
          </Btn>
        </div>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'center', padding: '6px 0 26px', fontSize: 11.5, color: 'var(--sub)' }}>
          <Icon d={ICONS.download} size={13} /> Viewed guides stay available offline in the installed app
        </div>
      </div>
    </div>
  )
}
