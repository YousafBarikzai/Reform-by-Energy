import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../api.js'
import { CATEGORY_ICONS, ICONS, IMAGES } from '../data.js'
import Icon from '../components/Icon.jsx'
import { Card, Chip, EmptyState, ErrorState, PageSkeleton, SectionLabel, Tag, inputStyle } from '../ui.jsx'

export default function Library() {
  const nav = useNavigate()
  const [tab, setTab] = useState('library')
  const [q, setQ] = useState('')
  const [category, setCategory] = useState(null)
  const [level, setLevel] = useState(null)
  const [kind, setKind] = useState(null)

  const query = useMemo(() => {
    const p = new URLSearchParams()
    if (q.trim()) p.set('q', q.trim())
    if (category) p.set('category', category)
    if (level) p.set('level', level)
    if (kind) p.set('kind', kind)
    return p.toString()
  }, [q, category, level, kind])

  const { data, loading, error, refetch } = useApi(`/library?${query}`)

  if (loading && !data) return <PageSkeleton />
  if (error) return <ErrorState error={error} retry={refetch} />
  const d = data
  const favs = d.items.filter((i) => i.my?.fav || i.my?.in_routine)
  const shown = tab === 'library' ? d.items : favs
  const kindLabel = { exercise: 'Exercise', class: 'Recorded class', tutorial: 'Tutorial', guide: 'Guide', mobility: 'Mobility', recovery: 'Recovery', breathing: 'Breathing' }

  return (
    <div style={{ animation: 'plFade .3s' }}>
      <div style={{ fontFamily: 'Marcellus,serif', fontSize: 30, padding: '22px 24px 0' }}>Exercise Library</div>
      <div style={{ display: 'flex', gap: 26, padding: '16px 24px 0', borderBottom: '1px solid var(--line)' }}>
        {[['library', 'LIBRARY'], ['mylist', 'MY LIST']].map(([id, name]) => (
          <div key={id} onClick={() => setTab(id)} style={{ paddingBottom: 11, fontSize: 12, fontWeight: 700, letterSpacing: '.1em', color: tab === id ? 'var(--rose)' : 'var(--sub)', borderBottom: tab === id ? '2px solid var(--rose)' : '2px solid transparent', cursor: 'pointer' }}>{name}</div>
        ))}
      </div>

      {tab === 'library' && (
        <>
          {/* subscription hero */}
          <div style={{ margin: '18px 24px 0', background: 'linear-gradient(120deg,var(--pinksoft),var(--blush))', border: '1px solid var(--line)', borderRadius: 24, overflow: 'hidden', display: 'flex' }}>
            <div style={{ flex: 1.25, padding: '18px 4px 18px 20px' }}>
              <div style={{ fontFamily: 'Marcellus,serif', fontSize: 19, lineHeight: 1.25 }}>Technique, guided<br />and on demand</div>
              <div style={{ fontSize: 12, color: 'var(--sub)', lineHeight: 1.5, marginTop: 6 }}>Step-by-step reformer technique, recorded classes, and recovery rituals.</div>
              <div style={{ fontSize: 10.5, color: 'var(--sub)', marginTop: 9 }}>Included with every active package</div>
            </div>
            <img src={IMAGES.heroReformer} alt="" style={{ flex: 1, width: '38%', objectFit: 'cover' }} />
          </div>

          {/* search + filters */}
          <div style={{ padding: '16px 24px 0', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 40, top: '50%', marginTop: 6, transform: 'translateY(-50%)', color: 'var(--sub)' }}><Icon d={ICONS.search} size={16} /></div>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search exercises, muscles, technique" style={{ ...inputStyle, borderRadius: 100, paddingLeft: 44 }} />
          </div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '12px 24px 2px' }}>
            {d.kinds.map((k) => <Chip key={k} on={kind === k} onClick={() => setKind(kind === k ? null : k)}>{kindLabel[k] || k}</Chip>)}
            {d.levels.map((l) => <Chip key={l} on={level === l} onClick={() => setLevel(level === l ? null : l)}>{l}</Chip>)}
          </div>

          {/* categories */}
          <SectionLabel style={{ paddingBottom: 8 }}>Body focus</SectionLabel>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '0 24px 2px' }}>
            {d.categories.map((c) => {
              const on = category === c
              return (
                <div key={c} className="press" onClick={() => setCategory(on ? null : c)} style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, cursor: 'pointer', width: 66 }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: on ? 'var(--rose)' : 'var(--card)', boxShadow: 'var(--shadow)', color: on ? '#fff' : 'var(--rose)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .25s' }}>
                    <Icon d={CATEGORY_ICONS[c] || ICONS.fullBody} size={22} strokeWidth={1.5} />
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: on ? 'var(--rose)' : 'var(--sub)', textAlign: 'center' }}>{c}</div>
                </div>
              )
            })}
          </div>

          {/* recently viewed */}
          {d.recentlyViewed.length > 0 && !q && !category && !kind && !level && (
            <>
              <SectionLabel>Recently viewed</SectionLabel>
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '0 24px 2px' }}>
                {d.recentlyViewed.map((r) => (
                  <Card key={r.id} style={{ flex: '0 0 150px', overflow: 'hidden' }} onClick={() => nav(`/library/${r.id}`)}>
                    <img src={r.image} alt="" style={{ width: '100%', height: 72, objectFit: 'cover', display: 'block' }} />
                    <div style={{ padding: '8px 12px 11px' }}>
                      <div style={{ fontWeight: 600, fontSize: 12 }}>{r.title}</div>
                      <div style={{ fontSize: 10.5, color: 'var(--sub)', marginTop: 2 }}>{r.duration_min} min</div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* item list */}
      <SectionLabel>{tab === 'library' ? `${shown.length} item${shown.length === 1 ? '' : 's'}` : 'Saved & routine'}</SectionLabel>
      {shown.length === 0 && (
        tab === 'mylist'
          ? <EmptyState title="Nothing saved yet" text="Tap the heart on any exercise to build your personal list." />
          : <EmptyState icon={ICONS.search} title="No matches" text="Try a different search or clear the filters." />
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 24px 8px' }}>
        {shown.map((i) => (
          <Card key={i.id} style={{ padding: 10, display: 'flex', alignItems: 'center', gap: 13 }} onClick={() => nav(`/library/${i.id}`)}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img src={i.image} alt="" style={{ width: 66, height: 66, borderRadius: 14, objectFit: 'cover', display: 'block' }} />
              {i.my?.completed ? (
                <div style={{ position: 'absolute', inset: 0, borderRadius: 14, background: 'rgba(199,78,117,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <Icon d={ICONS.check} size={22} strokeWidth={2.6} />
                </div>
              ) : null}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{i.title}</div>
              <div style={{ fontSize: 11.5, color: 'var(--sub)', marginTop: 3 }}>{kindLabel[i.kind] || i.kind} · {i.duration_min} min · {i.level}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                <Tag tone="grey">{i.category}</Tag>
                {i.my?.fav ? <Tag>♥ Saved</Tag> : null}
                {i.my?.in_routine ? <Tag tone="amber">Routine</Tag> : null}
              </div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--pinksoft)', color: 'var(--rose)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 4, flexShrink: 0 }}>
              <svg width="13" height="13" viewBox="0 0 14 14"><path d="M4 2.5l8 4.5-8 4.5z" fill="currentColor" /></svg>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
