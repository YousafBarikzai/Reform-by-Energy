// Seeds a fresh database with realistic studio data. All dates are relative
// to "now" so history, streaks, and the bookable schedule stay meaningful.

const DAY = 864e5
const iso = (d) => new Date(d).toISOString()
const dayAt = (offsetDays, h, m = 0) => {
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return new Date(d.getTime() + offsetDays * DAY)
}
const dateOnly = (offsetDays) => new Date(Date.now() + offsetDays * DAY).toISOString().slice(0, 10)

export function seed(db, hashPassword) {
  const run = (sql, ...args) => db.prepare(sql).run(...args)

  // ── members ──
  run(`INSERT INTO members (id, email, pass_hash, first_name, last_name, role, photo, membership_number, referral_code, guest_passes, prefs) VALUES
    (1, 'admin@reformbyenergym.com', ?, 'Reform', 'Admin', 'admin', NULL, 'RE-0001', 'ADMIN01', 0, '{}'),
    (2, 'sophie@email.com', ?, 'Sophie', 'Smith', 'member', '/media/profile.jpg', 'RE-1024', 'SOPHIE24', 2, ?)`,
    hashPassword('admin123'), hashPassword('reform123'),
    JSON.stringify({
      goal: 'Tone & strength', level: 'Intermediate',
      preferredDays: ['Tue', 'Thu', 'Sat'], preferredTime: 'Morning',
      favouriteClassType: 'Reformer Flow', favouriteInstructorId: 1, favouriteReformer: 5,
      leaderboardVisible: true,
      notifications: { reminders: true, bookings: true, waitlist: true, rewards: true, challenges: true, announcements: true, library: true, favourites: true },
    }))

  // ── instructors ──
  run(`INSERT INTO instructors (id, name, bio, photo, specialties) VALUES
    (1, 'Nikki Hart', 'Lead reformer instructor. Precise, calm, and quietly demanding — Nikki blends classical technique with breath-led sequencing.', '/media/avatar-mara.jpg', 'Reformer · Sculpt'),
    (2, 'Laura Bell', 'Laura''s classes are a gentle doorway into Pilates — perfect alignment, zero intimidation.', '/media/avatar-sofia.jpg', 'Basics · Stretch'),
    (3, 'Chloe West', 'Core specialist with a dancer''s eye for long lines and control.', '/media/avatar-ava.jpg', 'Core · Barre')`)

  // ── class types ──
  run(`INSERT INTO class_types (id, name, description, level, category, duration_min, image) VALUES
    (1, 'Reformer Flow', 'Continuous, breath-led reformer sequences that build long, balanced strength.', 'Intermediate', 'Full Body', 50, '/media/class-reformer.jpg'),
    (2, 'Reformer Basics', 'The foundations: footwork, alignment, and control. Perfect first class.', 'Beginner', 'Full Body', 45, '/media/class-beginner-flow.jpg'),
    (3, 'Reformer Sculpt', 'Heavier springs, slower tempo, deeper burn.', 'Advanced', 'Lower Body', 50, '/media/class-power.jpg'),
    (4, 'Core & More', 'Thirty focused minutes on the centre, ring-assisted.', 'All levels', 'Core', 30, '/media/class-core.jpg'),
    (5, 'Stretch & Reset', 'Slow myofascial release and assisted stretching.', 'Beginner', 'Stretch', 40, '/media/class-stretch.jpg'),
    (6, 'Morning Glow', 'Sunrise reformer flow to start the day tall and calm.', 'All levels', 'Full Body', 45, '/media/hero-reformer.jpg'),
    (7, 'Arms & Posture', 'Upper-body series for strong shoulders and elegant posture.', 'Intermediate', 'Arms', 40, '/media/class-barre.jpg'),
    (8, 'Prenatal Reformer', 'Safe, supportive movement for every trimester.', 'Beginner', 'Prenatal', 40, '/media/class-pregnancy.jpg')`)

  // ── studios & reformers (Studio One: 8, #3 in maintenance · Studio Two: 6) ──
  run(`INSERT INTO studios (id, name, cols, entrance) VALUES (1, 'Studio One', 4, 'bottom'), (2, 'Studio Two', 3, 'bottom')`)
  const refIns = db.prepare('INSERT INTO reformers (studio_id, number, status) VALUES (?, ?, ?)')
  for (let n = 1; n <= 8; n++) refIns.run(1, n, n === 3 ? 'maintenance' : 'ok')
  for (let n = 1; n <= 6; n++) refIns.run(2, n, 'ok')

  // ── playlists (search links only — nothing plays in-app) ──
  run(`INSERT INTO playlists (id, title, cover, platform, url, instructor_id) VALUES
    (1, 'Flow State', '/media/class-reformer.jpg', 'spotify', 'https://open.spotify.com/search/reformer%20pilates%20flow', 1),
    (2, 'Slow Burn', '/media/class-power.jpg', 'spotify', 'https://open.spotify.com/search/pilates%20sculpt%20slow%20burn', 1),
    (3, 'Soft Morning', '/media/hero-reformer.jpg', 'spotify', 'https://open.spotify.com/search/calm%20morning%20pilates', 2),
    (4, 'Deep Stretch', '/media/class-stretch.jpg', 'spotify', 'https://open.spotify.com/search/deep%20stretch%20ambient', 2),
    (5, 'Core Focus', '/media/class-core.jpg', 'spotify', 'https://open.spotify.com/search/pilates%20core%20beats', 3)`)

  // ── schedule: daily template, generated from 6 weeks back to 2 weeks ahead ──
  // [hour, minute, class_type, instructor, studio, playlist]
  const template = [
    [6, 30, 6, 2, 2, 3],
    [8, 0, 2, 2, 1, 3],
    [10, 0, 1, 1, 1, 1],
    [12, 15, 4, 3, 2, 5],
    [17, 30, 3, 1, 1, 2],
    [18, 30, 5, 2, 2, 4],
  ]
  const sunday = [[9, 0, 1, 1, 1, 1], [10, 30, 5, 2, 2, 4], [12, 0, 8, 2, 2, 3]]
  const sessIns = db.prepare(`INSERT INTO class_sessions
    (class_type_id, instructor_id, studio_id, starts_at, duration_min, capacity, cutoff_min, playlist_id)
    VALUES (?, ?, ?, ?, ?, ?, 60, ?)`)
  const typeDur = Object.fromEntries(db.prepare('SELECT id, duration_min FROM class_types').all().map((r) => [r.id, r.duration_min]))
  const capacityFor = (studioId) => (studioId === 1 ? 7 : 6) // Studio One has one reformer in maintenance
  const sessionsByDay = {}
  for (let off = -42; off <= 14; off++) {
    const dow = new Date(Date.now() + off * DAY).getDay()
    const slots = dow === 0 ? sunday : template
    sessionsByDay[off] = []
    for (const [h, m, ct, ins, st, pl] of slots) {
      const r = sessIns.run(ct, ins, st, iso(dayAt(off, h, m)), typeDur[ct], capacityFor(st), pl)
      sessionsByDay[off].push({ id: r.lastInsertRowid, ct, h })
    }
  }

  // ── Sophie's attendance history: Tue/Thu/Sat pattern for 6 weeks (streak) ──
  const bookIns = db.prepare(`INSERT INTO bookings (session_id, member_id, reformer_id, status, booked_at, attended, rating, notes) VALUES (?, ?, ?, 'booked', ?, ?, ?, ?)`)
  const reformer5 = db.prepare('SELECT id FROM reformers WHERE studio_id = 1 AND number = 5').get().id
  const reformer2s2 = db.prepare('SELECT id FROM reformers WHERE studio_id = 2 AND number = 2').get().id
  const noteBank = ['Felt strong on footwork today.', 'Springs up on leg circles — progress!', 'Shoulders finally relaxed in teaser.', null, 'Best hundred yet.', null]
  let attendedCount = 0
  for (let off = -42; off <= -1; off++) {
    const dow = new Date(Date.now() + off * DAY).getDay()
    if (![2, 4, 6].includes(dow)) continue // Tue, Thu, Sat
    const day = sessionsByDay[off] || []
    const pick = day.find((s) => (dow === 6 ? s.h === 10 : s.h === 10)) || day[2] || day[0]
    if (!pick) continue
    const inStudioOne = [1, 2, 3].includes(pick.ct)
    const rating = [5, 4, 5, 5, 4][attendedCount % 5]
    bookIns.run(pick.id, 2, inStudioOne ? reformer5 : reformer2s2, iso(dayAt(off - 2, 9, 0)), 1, rating, noteBank[attendedCount % noteBank.length])
    attendedCount++
  }

  // upcoming bookings: next Flow (tomorrow-ish 10:00) + one later
  const up1 = (sessionsByDay[1] || []).find((s) => s.h === 10) || (sessionsByDay[2] || [])[2]
  const up2 = (sessionsByDay[3] || []).find((s) => s.h === 17) || (sessionsByDay[4] || [])[4]
  if (up1) bookIns.run(up1.id, 2, reformer5, iso(dayAt(-1, 18, 0)), 0, null, null)
  if (up2) bookIns.run(up2.id, 2, null, iso(dayAt(0, 8, 0)), 0, null, null)

  // ── packages ──
  run(`INSERT INTO packages (id, name, kind, price_cents, classes, validity_days, description, terms, popular, intro, sort) VALUES
    (1, 'Intro Offer · 3 Classes', 'pack', 6000, 3, 30, 'New to Reform? Three classes to fall in love with the reformer.', 'New members only. One per person.', 0, 1, 0),
    (2, 'Single Class', 'pack', 3200, 1, 30, 'One reformer class, whenever you need it.', 'Valid 1 month from purchase.', 0, 0, 1),
    (3, '5 Class Pack', 'pack', 14000, 5, 60, 'Five reformer classes at your own pace.', 'Valid 2 months from purchase.', 0, 0, 2),
    (4, '10 Class Pack', 'pack', 26000, 10, 90, 'Our most popular pack — ten reformer classes.', 'Valid 3 months from purchase.', 1, 0, 3),
    (5, '20 Class Pack', 'pack', 48000, 20, 180, 'Twenty classes for the dedicated.', 'Valid 6 months from purchase.', 0, 0, 4),
    (6, 'Unlimited Monthly', 'membership', 16500, NULL, 30, 'All classes, priority booking, guest pass each month.', 'Rolling monthly. Cancel anytime with 30 days notice.', 0, 0, 5)`)

  // Sophie's active pack: bought 3 weeks ago, 6 of 10 left
  run(`INSERT INTO member_packages (member_id, package_id, purchased_at, expires_at, credits_total, credits_left, status, receipt_no)
       VALUES (2, 4, ?, ?, 10, 6, 'active', 'RCP-2093')`, iso(dayAt(-21, 11, 0)), iso(dayAt(69, 23, 59)))
  run(`INSERT INTO purchases (member_id, package_id, amount_cents, method, receipt_no, created_at) VALUES
       (2, 4, 26000, 'demo', 'RCP-2093', ?), (2, 1, 6000, 'demo', 'RCP-1740', ?)`, iso(dayAt(-21, 11, 0)), iso(dayAt(-63, 10, 0)))

  // ── points ──
  run(`INSERT INTO point_rules (key, label, points) VALUES
    ('book_class', 'Booking a class', 10),
    ('attend_class', 'Attending a class', 25),
    ('complete_challenge', 'Completing a challenge', 100),
    ('streak_week', 'Weekly attendance streak', 30),
    ('referral', 'Referring a friend', 200),
    ('purchase', 'Purchasing a package', 50),
    ('renewal', 'Renewing a membership', 75),
    ('complete_profile', 'Completing your profile', 40),
    ('milestone', 'Reaching a milestone', 60),
    ('special_event', 'Attending a special event', 80)`)
  const pIns = db.prepare('INSERT INTO points_ledger (member_id, delta, reason, ref, created_at) VALUES (2, ?, ?, ?, ?)')
  pIns.run(40, 'complete_profile', null, iso(dayAt(-60, 12, 0)))
  pIns.run(50, 'purchase', 'RCP-1740', iso(dayAt(-63, 10, 0)))
  pIns.run(50, 'purchase', 'RCP-2093', iso(dayAt(-21, 11, 0)))
  let earned = 140
  for (let i = 0; i < attendedCount; i++) { pIns.run(35, 'attend_class', null, iso(dayAt(-40 + i * 2, 12, 0))); earned += 35 }
  for (let w = 0; w < 6; w++) { pIns.run(30, 'streak_week', null, iso(dayAt(-35 + w * 7, 20, 0))); earned += 30 }
  pIns.run(-500, 'redeem', 'Free class', iso(dayAt(-10, 9, 0)))

  // ── rewards ──
  run(`INSERT INTO rewards (id, name, description, cost_points, kind, expiry_days) VALUES
    (1, 'Free Class', 'One reformer class on us.', 500, 'class', 60),
    (2, '£10 Off Any Pack', 'Discount applied at checkout.', 400, 'discount', 90),
    (3, 'Guest Pass', 'Bring a friend to any class.', 350, 'guest', 60),
    (4, 'Reform Grip Socks', 'Signature blush grip socks.', 600, 'merch', NULL),
    (5, 'Early Booking Access', 'Book 48h before general release for a month.', 250, 'perk', 30),
    (6, 'Priority Waiting List', 'Front of the queue for a month.', 200, 'perk', 30)`)
  run(`INSERT INTO reward_redemptions (member_id, reward_id, code, created_at, expires_at, status)
       VALUES (2, 1, 'FREE-7GK2', ?, ?, 'used')`, iso(dayAt(-10, 9, 0)), iso(dayAt(50, 0, 0)))

  // ── badges ──
  run(`INSERT INTO badges (id, name, icon, description) VALUES
    (1, 'First Class', '✦', 'Attended your first Reform class'),
    (2, '10 Classes', '◈', 'Ten classes attended'),
    (3, 'Early Bird', '☀', 'Five morning classes'),
    (4, '4-Week Streak', '♾', 'Four consecutive weeks of classes'),
    (5, '25 Classes', '❖', 'Twenty-five classes attended'),
    (6, 'Core Devotee', '◉', 'Ten core classes'),
    (7, 'Challenge Champion', '♛', 'Completed a studio challenge'),
    (8, '8-Week Streak', '∞', 'Eight consecutive weeks of classes')`)
  run(`INSERT INTO member_badges (member_id, badge_id, earned_at) VALUES
    (2, 1, ?), (2, 2, ?), (2, 3, ?), (2, 4, ?)`,
    iso(dayAt(-60, 12, 0)), iso(dayAt(-25, 12, 0)), iso(dayAt(-20, 12, 0)), iso(dayAt(-14, 12, 0)))

  // ── challenges ──
  run(`INSERT INTO challenges (id, title, description, rules, starts_at, ends_at, goal_type, goal_count, reward_points, badge_id, leaderboard) VALUES
    (1, '12 Classes in 30 Days', 'Our monthly consistency challenge. Twelve classes, thirty days, one stronger you.', 'Attended classes count from the day you join. All class types included.', ?, ?, 'classes', 12, 150, 7, 1),
    (2, 'Morning Glow', 'Five sunrise classes this month. The best light in the studio.', 'Classes starting before 9 AM count.', ?, ?, 'morning_classes', 5, 100, 3, 1),
    (3, 'Core Focus', 'Four Core & More classes to find your centre.', 'Only Core category classes count.', ?, ?, 'core_classes', 4, 80, 6, 0),
    (4, 'Bring a Friend', 'Refer one friend who attends their first class.', 'Your referral code must be used at sign-up.', ?, ?, 'referrals', 1, 200, NULL, 0)`,
    iso(dayAt(-15, 0, 0)), iso(dayAt(15, 23, 59)),
    iso(dayAt(-10, 0, 0)), iso(dayAt(20, 23, 59)),
    iso(dayAt(-20, 0, 0)), iso(dayAt(10, 23, 59)),
    iso(dayAt(-30, 0, 0)), iso(dayAt(30, 23, 59)))
  run(`INSERT INTO challenge_members (challenge_id, member_id, joined_at) VALUES (1, 2, ?), (2, 2, ?)`,
    iso(dayAt(-15, 8, 0)), iso(dayAt(-10, 8, 0)))

  // ── wellness history (12 days) ──
  const wIns = db.prepare(`INSERT INTO wellness_checkins (member_id, date, mood, energy, sleep, stress, soreness, water, wellbeing, note, score) VALUES (2, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  const wData = [
    [4, 4, 3, 2, 2, 6, 4], [3, 3, 3, 3, 3, 5, 3], [5, 4, 4, 2, 1, 7, 5], [4, 3, 4, 2, 2, 6, 4],
    [4, 5, 4, 1, 2, 8, 5], [3, 2, 2, 4, 3, 4, 3], [4, 4, 4, 2, 1, 6, 4], [5, 5, 4, 1, 1, 7, 5],
    [4, 4, 3, 2, 2, 6, 4], [3, 3, 3, 3, 2, 5, 4], [5, 4, 5, 1, 1, 8, 5], [4, 4, 4, 2, 2, 7, 4],
  ]
  wData.forEach((w, i) => {
    const [mood, energy, sleep, stress, soreness, water, wellbeing] = w
    const score = Math.round(((mood + energy + sleep + wellbeing + (6 - stress) + (6 - soreness)) / 30) * 100)
    wIns.run(dateOnly(-13 + i), mood, energy, sleep, stress, soreness, water, wellbeing, i === 10 ? 'Slept 8 hours — it shows.' : null, score)
  })

  // ── goals + measurements ──
  run(`INSERT INTO goals (member_id, title, target_date, done, created_at) VALUES
    (2, 'Hold a 60-second teaser', ?, 0, ?),
    (2, 'Attend 4 classes every week', ?, 0, ?),
    (2, 'Full push-through on short spine', ?, 1, ?)`,
    dateOnly(30), iso(dayAt(-30, 9, 0)), dateOnly(60), iso(dayAt(-21, 9, 0)), dateOnly(-5), iso(dayAt(-45, 9, 0)))
  run(`INSERT INTO measurements (member_id, date, weight_kg, chest_cm, waist_cm, hips_cm, arm_cm, thigh_cm, note) VALUES
    (2, ?, 63.4, 88, 71, 96, 26.5, 55, 'Starting point'),
    (2, ?, 62.8, 88, 70, 95.5, 26.8, 54.5, NULL),
    (2, ?, 62.1, 87.5, 69, 95, 27.2, 54, 'Waist down 2cm since week one')`,
    dateOnly(-42), dateOnly(-21), dateOnly(-3))

  // ── library ──
  const lib = db.prepare(`INSERT INTO library_items (title, kind, category, level, duration_min, image, summary, content, muscles, instructor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  const c = (start, movement, breathing, mistakes, safety, mods, advanced, tips) =>
    JSON.stringify({ start, movement, breathing, mistakes, safety, mods, advanced, tips })
  lib.run('The Hundred', 'exercise', 'Core', 'Beginner', 6, '/media/class-core.jpg',
    'The classic Pilates warm-up: a breathing exercise that wakes the deep core.',
    c('Lie supine, legs in tabletop, arms long by your sides, head and shoulders curled off the carriage.',
      'Pump straight arms in small beats while holding the curl. Five beats in, five beats out, ten cycles — one hundred beats.',
      'Inhale through the nose for five beats, exhale fully through pursed lips for five.',
      'Neck strain from pulling the chin; arms pumping from the shoulders instead of the back.',
      'Keep the lower back gently imprinted. If the neck tires, lower the head.',
      'Head down, knees bent, or feet on the bar.',
      'Legs extended to 45°, or lower for more load.',
      'Nikki: think of pressing the air down like water.'),
    'Transverse abdominis · Rectus abdominis · Hip flexors', 1)
  lib.run('Footwork Series', 'exercise', 'Lower Body', 'Beginner', 8, '/media/class-beginner-flow.jpg',
    'The foundation of every reformer class — precise leg work against the springs.',
    c('Lie supine, spine neutral, toes on the bar hip-width, heels lifted.',
      'Press to straight legs without locking, resist the return. Repeat on heels, then in Pilates V.',
      'Exhale to press, inhale to return.',
      'Slamming the carriage home; gripping the toes; ribs flaring.',
      'Neutral pelvis throughout. Knees track over second toes.',
      'Lighter springs; smaller range.',
      'Single-leg footwork; add a two-second pause at full extension.',
      'Laura: the return is the exercise.'),
    'Quadriceps · Hamstrings · Glutes · Calves', 2)
  lib.run('Short Spine Massage', 'exercise', 'Full Body', 'Advanced', 7, '/media/class-reformer.jpg',
    'A luxurious articulation of the spine through overhead flexion.',
    c('Feet in straps, legs at 90°, arms pressing gently into the carriage.',
      'Fold the legs over the torso, roll up through the spine, bend the knees toward the shoulders, then roll down bone by bone.',
      'Inhale to fold, exhale to roll up, inhale to bend, exhale to melt down.',
      'Throwing the legs; landing on the neck; skipping vertebrae on the way down.',
      'Avoid with neck injuries or during pregnancy. Weight stays on shoulders, never the head.',
      'Bend the knees throughout; reduce the rollover height.',
      'Slow the descent to eight counts.',
      'Nikki: imagine unrolling a ribbon of silk.'),
    'Spinal articulation · Hamstrings · Core', 1)
  lib.run('Elephant', 'exercise', 'Full Body', 'Intermediate', 5, '/media/class-power.jpg',
    'A standing stretch-and-strength shape that teaches core-led movement.',
    c('Stand on the carriage, heels against the shoulder blocks, hands on the bar, spine rounded high.',
      'Press the carriage out an inch at a time with the abdominals, then draw it home.',
      'Exhale to press out, inhale to return.',
      'Moving from the arms; sinking into the shoulders; flattening the spine.',
      'Keep the press small — this is a core exercise, not a leg press.',
      'Soft knees; smaller range.',
      'Single-leg elephant.',
      'Chloe: pull the carriage home with your waist, not your feet.'),
    'Core · Hamstrings · Shoulders', 3)
  lib.run('Teaser Progression', 'exercise', 'Core', 'Advanced', 9, '/media/class-yoga.jpg',
    'Build to the most iconic shape in Pilates, stage by stage.',
    c('Lie back on the long box, legs at 45°, arms reaching past the ears.',
      'Roll up to a V-sit with control, balancing behind the sit bones, then roll down with the same patience.',
      'Inhale to prepare, exhale to roll up, inhale at the top, exhale to descend.',
      'Swinging up with momentum; gripping hip flexors; collapsing the chest at the top.',
      'Bend the knees at any stage. Never yank the neck.',
      'One leg bent, or hold behind the thighs.',
      'Arms overhead at the top; add rotation.',
      'Nikki: the teaser starts at the exhale, not the shoulders.'),
    'Rectus abdominis · Hip flexors · Balance', 1)
  lib.run('Mermaid Stretch', 'exercise', 'Stretch', 'All levels', 4, '/media/class-stretch.jpg',
    'A side-bending breath into the waist and ribs.',
    c('Sit sideways on the carriage, one hand on the bar, legs folded.',
      'Press the carriage away as you arc overhead, breathe into the open side, then lift home.',
      'Inhale to reach, exhale to deepen, inhale to return.',
      'Collapsing into the bottom shoulder; lifting the hip.',
      'Keep both sit bones heavy.',
      'Smaller arc; hand on a block.',
      'Add a spiral of the chest toward the ceiling.',
      'Laura: grow taller before you bend.'),
    'Obliques · Lats · Intercostals', 2)
  lib.run('Arm Series with Straps', 'exercise', 'Arms', 'Intermediate', 8, '/media/class-barre.jpg',
    'Biceps, triceps, and posture — the supine strap series.',
    c('Lie supine, hands in straps, arms reaching to the ceiling, legs in tabletop.',
      'Draw the straps to a T, then sweep low past the hips; bend and press for triceps.',
      'Exhale on the effort, inhale to return.',
      'Shrugging shoulders toward the ears; wrists breaking.',
      'Keep ribs knitted; wrists long and straight.',
      'Feet down; lighter spring.',
      'Add leg extension on each press.',
      'Chloe: your collarbones stay wide the whole series.'),
    'Triceps · Biceps · Lats · Rear delts', 3)
  lib.run('Glute Bridge Series', 'exercise', 'Lower Body', 'All levels', 6, '/media/class-power.jpg',
    'Articulated bridging for strong glutes and a supple spine.',
    c('Supine, heels on the bar hip-width, arms long.',
      'Peel the spine up bone by bone to a long diagonal, pulse or press out, then melt down.',
      'Exhale to peel up, breathe naturally at the top, exhale to lower.',
      'Pushing into the neck; ribs popping at the top.',
      'Stop at the shoulder blades — weight never on the neck.',
      'Smaller lift; both feet down throughout.',
      'Single-leg bridge; carriage presses at the top.',
      'Nikki: lead with the tail, finish with the heart.'),
    'Glutes · Hamstrings · Spinal articulation', 1)
  lib.run("Beginner's Guide to the Reformer", 'guide', 'Full Body', 'Beginner', 12, '/media/class-beginner-flow.jpg',
    'Everything to know before your first class: springs, straps, and studio etiquette.',
    c('Arrive ten minutes early; grip socks on; phone away.',
      'Your instructor sets the springs for every exercise — never change them mid-move without asking.',
      'When in doubt, exhale on the effort.',
      'Comparing yourself to the reformer next door.',
      'Tell your instructor about injuries before class, not after.',
      'Every exercise has a gentler version — just ask.',
      'Come back within 48 hours; the second class is where it clicks.',
      'Laura: the reformer looks like a machine but moves like water.'),
    'Whole body', 2)
  lib.run('Morning Mobility Routine', 'mobility', 'Full Body', 'All levels', 10, '/media/hero-reformer.jpg',
    'Ten minutes of gentle joint-by-joint mobility for before class or before coffee.',
    c('Standing tall, feet hip-width, soft knees.',
      'Neck circles, shoulder rolls, thoracic rotations, hip circles, ankle rocks — ninety seconds each, both directions.',
      'Slow nasal breathing throughout; exhale into any stiffness.',
      'Rushing; bouncing at end range.',
      'Move within comfortable range — mobility grows with patience.',
      'Seated versions of every move.',
      'Add a deep squat hold and thread-the-needle.',
      'Chloe: your first class of the day is the one you teach your joints.'),
    'Spine · Hips · Shoulders · Ankles', 3)
  lib.run('Evening Recovery & Breath', 'recovery', 'Stretch', 'All levels', 12, '/media/wellness-hero.jpg',
    'Down-regulate after a heavy day: long stretches and slower breath.',
    c('Lying or seated somewhere quiet, warm, and dim.',
      "Child's pose, supine twist, legs up the wall — two minutes each — then six minutes of breathing.",
      '4-7-8 breathing: inhale 4, hold 7, exhale 8. Six rounds.',
      'Checking your phone between shapes.',
      'Skip inversions late in pregnancy; keep the hold gentle.',
      'Shorten holds to one minute.',
      'Add box breathing (4-4-4-4) before sleep.',
      'Laura: recovery is training. Schedule it like a class.'),
    'Nervous system · Hips · Spine', 2)
  lib.run('Breathing 101', 'breathing', 'Core', 'Beginner', 5, '/media/story-1.jpg',
    'Lateral thoracic breathing — the engine of every Pilates movement.',
    c('Seated tall or lying supine, hands on the sides of the ribcage.',
      'Breathe wide into the hands, keeping shoulders quiet; feel the ribs close on the exhale as the deep core wraps.',
      'In through the nose, out through softly pursed lips.',
      'Belly-only breathing; shoulders rising; forcing the exhale.',
      'Stop if lightheaded; return to natural breath.',
      'One hand on chest, one on ribs to feel the difference.',
      'Add a count: in for 4, out for 6.',
      'Nikki: exhale like fogging a mirror — warm and unhurried.'),
    'Diaphragm · Transverse abdominis', 1)
  lib.run('Recorded Class: Sunrise Flow', 'class', 'Full Body', 'Intermediate', 45, '/media/class-reformer.jpg',
    'A full 45-minute reformer flow recorded in Studio One.',
    c('Reformer with light-to-medium springs; grip socks.',
      'Footwork → hundred → frogs & circles → short spine → elephant → arm series → mermaid.',
      'Cued throughout the recording.',
      'Skipping the warm-up section.',
      'Follow the on-screen modifications if anything pinches.',
      'Take the basics options offered in every block.',
      'Repeat weekly and note where the flow smooths out.',
      'Recorded with Nikki Hart.'),
    'Whole body', 1)
  lib.run('Tutorial: Setting Your Springs', 'tutorial', 'Full Body', 'Beginner', 4, '/media/class-power.jpg',
    'Reds, blues, and yellows — what each spring means and when to change them.',
    c('Standing beside your reformer before class.',
      'Identify each spring weight, practise the safe two-hand change, and learn the instructor hand signals.',
      'n/a — technique tutorial.',
      'Changing springs mid-exercise; letting the bar snap back.',
      'Always control the carriage home before touching springs.',
      'Ask your instructor to demo before class.',
      'Learn the spring settings of your five most common exercises.',
      'Laura: springs are seasoning — the recipe is your form.'),
    'Studio knowledge', 2)

  // ── announcements ──
  run(`INSERT INTO announcements (title, body, pinned, created_at) VALUES
    ('Sunrise Rooftop Session', 'Saturday 7 AM — a one-off rooftop reformer flow with Nikki. Twelve mats only; book via the front desk.', 1, ?),
    ('New: Arms & Posture', 'Chloe''s new upper-body series joins the schedule this month. Intermediate level, 40 minutes.', 0, ?)`,
    iso(dayAt(-2, 9, 0)), iso(dayAt(-6, 9, 0)))

  // ── motivational content library (rule-selected, not generated) ──
  const quotes = [
    ['Movement is a conversation between body and breath.', 'Studio wall'],
    ['Strength is built one controlled inch at a time.', 'Nikki Hart'],
    ["You don't have to be advanced. You have to be here.", 'Laura Bell'],
    ['The reformer looks like a machine but moves like water.', 'Laura Bell'],
    ['Consistency is the most advanced exercise we teach.', 'Reform'],
    ['Long spine, long day.', 'Chloe West'],
    ["Your streak isn't pressure — it's proof.", 'Reform'],
    ['Slow is smooth. Smooth is strong.', 'Nikki Hart'],
    ["Every class is a vote for the person you're becoming.", 'Reform'],
    ['Breathe wide. Stand tall. Begin again.', 'Studio wall'],
    ['Progress hides in the return, not the press.', 'Laura Bell'],
    ['Show up soft. Leave strong.', 'Reform'],
  ]
  const qIns = db.prepare('INSERT INTO motivations (text, author) VALUES (?, ?)')
  for (const [t, a] of quotes) qIns.run(t, a)

  // ── in-app notifications (recent) ──
  run(`INSERT INTO notifications (member_id, kind, title, body, link, created_at, read_at) VALUES
    (2, 'reminder', 'Class tomorrow at 10:00', 'Reformer Flow with Nikki Hart — Studio One, reformer 5.', '/schedule', ?, NULL),
    (2, 'rewards', 'Streak bonus earned', '+30 points for your weekly attendance streak.', '/profile/rewards', ?, NULL),
    (2, 'announcement', 'Sunrise Rooftop Session', 'Saturday 7 AM with Nikki — twelve places only.', '/', ?, ?)`,
    iso(dayAt(0, 8, 0)), iso(dayAt(-1, 20, 0)), iso(dayAt(-2, 9, 5)), iso(dayAt(-1, 9, 0)))
}
