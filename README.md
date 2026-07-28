# Reform by Energy — Pilates Studio App

A boutique Pilates studio companion app, implemented from the
[Claude Design](https://claude.ai/design) project **Pilates Studio App** as a
Vite + React single-page app.

## Features

- **Home** — today's booked class, popular classes, programme progress, featured instructor, daily intention
- **Classes** — browsable catalogue with category filters (Reformer, Mat, Barre, Prenatal)
- **Schedule** — day picker and session list with Book / Waitlist / Booked states
- **Booking flow** — choose a day and time, confirm in a bottom sheet, animated success screen; studio credits are deducted and the class is marked booked
- **Community** — monthly challenge, leaderboard, member stories, events
- **Profile** — membership credits, progress stats, settings, and a dark-mode toggle
- **Detail screens** — class detail, instructor profile, progress, membership plans, wellness (with hydration tracker)

On desktop the app renders inside an iOS device frame, matching the design.
At phone widths (≤ 520 px) it fills the viewport like a native app.

## Development

```bash
npm install
npm run dev      # start dev server
npm run build    # production build to dist/
npm run preview  # serve the production build
```

All images and fonts (Albert Sans, Marcellus) are self-hosted in `src/assets/`.
