import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  // vite preview is only used locally, but keep it host-agnostic so it also
  // works if a platform ever runs it behind a proxy domain
  preview: { allowedHosts: true },
})
