import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import { site } from '../shared/site.config.js'
import { trackPageview } from './lib/track.js'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/bestaetigt', component: () => import('./views/ConfirmedView.vue'), meta: { title: 'Bestätigt' } },
    { path: '/impressum', component: () => import('./views/ImprintView.vue'), meta: { title: 'Impressum' } },
    { path: '/datenschutz', component: () => import('./views/PrivacyView.vue'), meta: { title: 'Datenschutz' } },
    { path: '/stats', component: () => import('./views/StatsView.vue'), meta: { title: 'Auswertung', noTrack: true } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})

const defaultTitle = document.title

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} – ${site.brand}` : defaultTitle
  if (!to.meta.noTrack) trackPageview(to.path)
})
