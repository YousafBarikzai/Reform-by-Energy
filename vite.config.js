import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // absolute base: the SPA is served from the domain root, and nested routes
  // (/profile/wellness) must resolve assets from /assets, not ./assets
  base: '/',
  plugins: [react()],
  // vite preview is only used locally, but keep it host-agnostic so it also
  // works if a platform ever runs it behind a proxy domain
  preview: { allowedHosts: true },
  server: { proxy: { '/api': 'http://localhost:4631' } },
})
