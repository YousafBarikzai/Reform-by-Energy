# Reform by Energym — Pilates Studio PWA

The Reform by Energym member app: a mobile-first, installable PWA built with
Vite + React, in the studio's baby-pink brand.

## Pages

- **Home** — greeting, next class, weekly progress ring, quick actions, upcoming classes
- **Schedule** — week strip and daily class list with booking states
- **Packages** — class packs and membership tabs
- **Library** — exercise library subscription, categories, popular workouts
- **Profile** — account and support settings

A floating bottom navigation bar keeps all five sections one tap away.
On desktop the app renders inside an iOS device frame; at phone widths
(≤ 520 px) it fills the viewport like a native app, and can be installed to
the home screen on iOS and Android.

## Development

```bash
npm install
npm run dev      # start dev server
npm run build    # production build to dist/
npm start        # serve the production build (Railway-compatible, binds $PORT)
```

Fonts (Albert Sans, Marcellus) and imagery are self-hosted in `src/assets/`.
The brand marks live in `src/components/Logo.jsx`.
