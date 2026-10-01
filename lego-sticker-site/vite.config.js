import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { site } from './shared/site.config.js'

// Fills %BRAND%, %TAGLINE% and %DISCOUNT% in index.html from the shared site config.
const siteConfigHtml = {
  name: 'site-config-html',
  transformIndexHtml: (html) =>
    html
      .replaceAll('%BRAND%', site.brand)
      .replaceAll('%TAGLINE%', site.tagline)
      .replaceAll('%DISCOUNT%', String(site.earlyBirdDiscount)),
}

export default defineConfig({
  plugins: [vue(), siteConfigHtml],
  server: {
    port: 5173,
    // The Express API runs separately during development (npm run dev starts both).
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
