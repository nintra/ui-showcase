<script setup>
import BrandMark from './BrandMark.vue'
import { openSignup } from '../lib/interest.js'
import { track } from '../lib/track.js'

const links = [
  { hash: '#so-gehts', label: "So geht's" },
  { hash: '#ausprobieren', label: 'Ausprobieren' },
  { hash: '#preise', label: 'Preise' },
  { hash: '#faq', label: 'FAQ' },
]

function signup() {
  track('cta_click', { location: 'header' })
  openSignup({ location: 'header' })
}
</script>

<template>
  <header class="site-header">
    <div class="container inner">
      <RouterLink to="/" class="home-link" aria-label="Zur Startseite">
        <BrandMark />
      </RouterLink>
      <nav aria-label="Hauptnavigation">
        <ul>
          <li v-for="link in links" :key="link.hash">
            <RouterLink :to="{ path: '/', hash: link.hash }">{{ link.label }}</RouterLink>
          </li>
        </ul>
      </nav>
      <button type="button" class="btn btn-small" @click="signup">Vormerken</button>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  height: var(--header-h);
  background: rgb(255 247 230 / 0.88);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 2px solid var(--ink);
}

.inner {
  display: flex;
  align-items: center;
  gap: 24px;
  height: 100%;
}

.home-link {
  text-decoration: none;
  margin-right: auto;
}

nav ul {
  display: flex;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}

nav a {
  display: block;
  padding: 8px 12px;
  border-radius: 10px;
  font-weight: 700;
  text-decoration: none;
  transition: background-color 0.15s ease;
}

nav a:hover {
  background: var(--yellow-soft);
}

@media (max-width: 760px) {
  nav {
    display: none;
  }
}
</style>
