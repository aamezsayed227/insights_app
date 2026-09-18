import path from 'node:path'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
    // Precaches the built app shell (HTML/JS/CSS) so a hard refresh while
    // offline still loads the page. This is the layer above the app's own
    // IndexedDB-based data offline support (see docs/superpowers/specs) —
    // that layer keeps the app usable once it's already running; this one
    // lets it start running in the first place with no network at all.
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: { enabled: true },
      manifest: {
        name: 'Insight',
        short_name: 'Insight',
        description: 'Insight pharmacy management — offline capture demo',
        theme_color: '#0f6b5c',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
