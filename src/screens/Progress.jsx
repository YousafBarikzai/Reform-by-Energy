import { useApi } from '../api.js'
import { ICONS } from '../data.js'
import Icon from '../components/Icon.jsx'
import { Bars, Card, ErrorState, PageSkeleton, SectionLabel, TopBar, fmtDate } from '../ui.jsx'

export default function Progress() {
  const { data, loading, error, refetch } = useApi('/progress')
  if (loading) return <PageSkeleton />
  if (error) return <ErrorState error={error} retry={refetch} />
  const d = data
  const delta = d.totals.thisMonth - d.totals.lastMonth

  return (
    <div style={{ animation: 'plFade .3s' }}>
      <TopBar title="Progress" />

      {/* stat tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '18px 24px 0' }}>
        {[
          [d.totals.classes, 'Classes attended'],
          [`${(d.totals.minutes / 60).toFixed(1)}h`, 'Time on the reformer'],
          [d.totals.thisWeek, 'This week'],
          [d.totals.thisMonth, 'This month'],
        ].map(([v, k]) => (
          <Card key={k} style={{ padding: '15px 18px' }}>
            <div style={{ fontFamily: 'Marcellus,serif', fontSize: 26, color: 'var(--rose)' }}>{v}</div>
            <div style={{ fontSize: 11.5, color: 'var(--sub)', marginTop: 3 }}>{k}</div>
          </Card>
        ))}
      </div>

      {/* streaks */}
      <Card style={{ margin: '12px 24px 0', padding: '16px 20px', display: 'flex', gap: 18, alignItems: 'center', background: 'linear-gradient(120deg,var(--pinksoft),var(--card))' }}>
        <Icon d={ICONS.flame} size={34} color="var(--rose)" />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{d.streak.current}-week streak</div>
          <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>Longest ever: {d.streak.longest} weeks{d.streak.current >= d.streak.longest && d.streak.current > 0 ? ' — this is it!' : ''}</div>
        </div>
      </Card>

      {/* monthly comparison */}
      <SectionLabel right={<span style={{ fontSize: 11.5, fontWeight: 700, color: delta >= 0 ? '#3E7A48' : 'var(--rose)' }}>{delta >= 0 ? `+${delta}` : delta} vs last month</span>}>Monthly classes</SectionLabel>
      <Card style={{ margin: '0 24px', padding: '16px 18px 12px' }}>
        <Bars values={d.months.map((mo) => mo.count)} labels={d.months.map((mo) => mo.label)} highlight={5} />
      </Card>

      {/* weekday pattern */}
      <SectionLabel>Your rhythm</SectionLabel>
      <Card style={{ margin: '0 24px', padding: '16px 18px 12px' }}>
        <Bars values={d.weekdays} labels={['M', 'T', 'W', 'T', 'F', 'S', 'S']} height={76} />
        <div style={{ display: 'flex', gap: 16, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line)', fontSize: 12, color: 'var(--sub)' }}>
          {d.favourite.type && <div>Favourite class<br /><b style={{ color: 'var(--ink)' }}>{d.favourite.type.name}</b></div>}
          {d.favourite.instructor && <div>Favourite instructor<br /><b style={{ color: 'var(--ink)' }}>{d.favourite.instructor.name.split(' ')[0]}</b></div>}
          {d.favourite.time && <div>Usual time<br /><b style={{ color: 'var(--ink)' }}>{d.favourite.time.t}</b></div>}
        </div>
      </Card>

      {/* badges */}
      <SectionLabel>Badges</SectionLabel>
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 24px 4px' }}>
        {d.badges.map((b) => (
          <div key={b.id} style={{ flex: '0 0 108px', background: 'var(--card)', borderRadius: 20, padding: '15px 10px', textAlign: 'center', boxShadow: 'var(--shadow)', opacity: b.earned_at ? 1 : 0.45 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', margin: '0 auto', background: b.earned_at ? 'var(--pinksoft)' : 'var(--blush)', color: b.earned_at ? 'var(--rose)' : 'var(--sub)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>{b.icon}</div>
            <div style={{ fontSize: 11.5, fontWeight: 600, marginTop: 8 }}>{b.name}</div>
            <div style={{ fontSize: 9.5, color: 'var(--sub)', marginTop: 2 }}>{b.earned_at ? fmtDate(b.earned_at) : b.description}</div>
          </div>
        ))}
      </div>

      {/* completed challenges + milestones */}
      {d.completedChallenges.length > 0 && (
        <>
          <SectionLabel>Completed challenges</SectionLabel>
          <Card style={{ margin: '0 24px', overflow: 'hidden' }}>
            {d.completedChallenges.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: i === d.completedChallenges.length - 1 ? 'none' : '1px solid var(--line)' }}>
                <div style={{ width: 30, height: 30, borderRadius: 10, background: 'var(--pinksoft)', color: 'var(--rose)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon d={ICONS.trophy} size={15} /></div>
                <div style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>{c.title}</div>
                <div style={{ fontSize: 11.5, color: 'var(--sub)' }}>{fmtDate(c.completed_at)}</div>
              </div>
            ))}
          </Card>
        </>
      )}

      <SectionLabel>Personal milestones</SectionLabel>
      <Card style={{ margin: '0 24px 10px', overflow: 'hidden' }}>
        {d.milestones.length === 0 && <div style={{ padding: '16px 18px', fontSize: 13, color: 'var(--sub)' }}>Set goals in your Transformation Journey to track milestones here.</div>}
        {d.milestones.map((g, i) => (
          <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: i === d.milestones.length - 1 ? 'none' : '1px solid var(--line)' }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${g.done ? 'var(--rose)' : 'var(--line)'}`, background: g.done ? 'var(--rose)' : 'transparent', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {g.done ? <Icon d={ICONS.check} size={12} strokeWidth={3} /> : null}
            </div>
            <div style={{ flex: 1, fontSize: 13.5, fontWeight: 500, textDecoration: g.done ? 'line-through' : 'none', color: g.done ? 'var(--sub)' : 'var(--ink)' }}>{g.title}</div>
            {g.target_date && <div style={{ fontSize: 11.5, color: 'var(--sub)' }}>{fmtDate(g.target_date)}</div>}
          </div>
        ))}
      </Card>
    </div>
  )
}
