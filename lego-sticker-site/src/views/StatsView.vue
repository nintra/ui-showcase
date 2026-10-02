<script setup>
import { ref, computed, watch } from 'vue'
import { RefreshCw, LogOut } from 'lucide-vue-next'
import BarList from '../components/stats/BarList.vue'
import DailyColumns from '../components/stats/DailyColumns.vue'
import { packages, occasions, priceRanges, styles, styleGroups } from '../../shared/site.config.js'

const TOKEN_KEY = 'stats-token'

function readToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

const token = ref(readToken())
const tokenInput = ref('')
const days = ref(30)
const stats = ref(null)
const error = ref('')
const loading = ref(false)

async function load() {
  if (!token.value) return
  loading.value = true
  error.value = ''
  try {
    const res = await fetch(`/api/stats?days=${days.value}`, { headers: { Authorization: `Bearer ${token.value}` } })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      error.value = data.error || `Fehler ${res.status}`
      if (res.status === 401) logout()
      return
    }
    stats.value = data
  } catch {
    error.value = 'Server nicht erreichbar.'
  } finally {
    loading.value = false
  }
}

function login() {
  token.value = tokenInput.value.trim()
  try {
    sessionStorage.setItem(TOKEN_KEY, token.value)
  } catch {
    // storage blocked – token lives only in memory then
  }
  load()
}

function logout() {
  token.value = ''
  stats.value = null
  try {
    sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    // ignore
  }
}

watch(days, load)
load()

// --- labels -------------------------------------------------------------
const labelMaps = {
  package: { ...Object.fromEntries(packages.map((p) => [p.id, p.name])), unsicher: 'Weiß noch nicht' },
  occasion: Object.fromEntries(occasions.map((o) => [o.id, o.label])),
  price: Object.fromEntries(priceRanges.map((r) => [r.id, r.label])),
  style: Object.fromEntries(styles.map((s) => [s.id, s.name])),
  location: { header: 'Header', hero: 'Hero', 'hero-preview': 'Hero → Vorschau', preview: 'Vorschau', pricing: 'Preise', final: 'Abschluss' },
}

function toItems(counts, map = {}) {
  return Object.entries(counts || {}).map(([key, value]) => ({ label: map[key] || key, value }))
}

// Real photo vs. illustration, summed over the individual styles.
const groupOfStyle = Object.fromEntries(styles.map((s) => [s.id, styleGroups.find((g) => g.id === s.group)?.name]))
function byLook(counts) {
  const sums = {}
  for (const [id, value] of Object.entries(counts || {})) {
    const look = groupOfStyle[id] || 'k. A.'
    sums[look] = (sums[look] || 0) + value
  }
  return Object.entries(sums)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value }))
}

const fmt = (n) => (n ?? 0).toLocaleString('de-DE')
const pct = (n) => `${(n ?? 0).toLocaleString('de-DE', { maximumFractionDigits: 1 })} %`

const t = computed(() => stats.value?.totals ?? {})
const funnel = computed(() => [
  { label: 'Seitenaufrufe', value: t.value.pageviews ?? 0 },
  { label: 'Formular begonnen', value: t.value.formStarts ?? 0 },
  { label: 'Anmeldung abgeschickt', value: t.value.signupsRequested ?? 0 },
  { label: 'E-Mail bestätigt', value: t.value.signupsConfirmed ?? 0 },
])
const dailyViews = computed(() => (stats.value?.daily ?? []).map((d) => ({ date: d.date, value: d.pageviews })))
const dailySignups = computed(() => (stats.value?.daily ?? []).map((d) => ({ date: d.date, value: d.signups })))
</script>

<template>
  <section class="section stats">
    <div class="container">
      <header class="head">
        <div>
          <p class="eyebrow">Smoke-Test</p>
          <h1>Auswertung</h1>
        </div>
        <div v-if="token" class="controls">
          <label>
            <span class="visually-hidden">Zeitraum</span>
            <select v-model.number="days">
              <option :value="7">Letzte 7 Tage</option>
              <option :value="30">Letzte 30 Tage</option>
              <option :value="90">Letzte 90 Tage</option>
              <option :value="365">Letzte 365 Tage</option>
            </select>
          </label>
          <button type="button" class="icon-btn" aria-label="Aktualisieren" :disabled="loading" @click="load">
            <RefreshCw :size="18" aria-hidden="true" />
          </button>
          <button type="button" class="icon-btn" aria-label="Abmelden" @click="logout">
            <LogOut :size="18" aria-hidden="true" />
          </button>
        </div>
      </header>

      <form v-if="!token" class="card login" @submit.prevent="login">
        <label for="stats-token">Zugangscode (STATS_TOKEN aus der .env)</label>
        <div class="login-row">
          <input id="stats-token" v-model="tokenInput" type="password" autocomplete="current-password" required />
          <button type="submit" class="btn btn-small">Anzeigen</button>
        </div>
        <p v-if="error" class="error" role="alert">{{ error }}</p>
      </form>

      <template v-else>
        <p v-if="error" class="error" role="alert">{{ error }}</p>

        <div v-if="stats" class="dashboard" :class="{ loading }">
          <div class="kpis">
            <article class="card kpi hero">
              <h2>Bestätigte Anmeldungen</h2>
              <p class="value">{{ fmt(t.signupsConfirmed) }}</p>
              <p class="sub">
                {{ fmt(t.signupsRequested) }} abgeschickt · {{ pct(stats.rates.doiConfirmation) }} haben die E-Mail bestätigt
              </p>
            </article>
            <article class="card kpi">
              <h2>Anmeldequote</h2>
              <p class="value">{{ pct(stats.rates.signupConfirmed) }}</p>
              <p class="sub">bestätigte Anmeldungen je Seitenaufruf</p>
            </article>
            <article class="card kpi">
              <h2>Seitenaufrufe</h2>
              <p class="value">{{ fmt(t.pageviews) }}</p>
              <p class="sub">Startseite, ohne Bots</p>
            </article>
            <article class="card kpi">
              <h2>Klicks auf „Vorbestellen“</h2>
              <p class="value">{{ fmt(t.pricingClicks) }}</p>
              <p class="sub">im Preisbereich</p>
            </article>
            <article class="card kpi">
              <h2>Vorschau genutzt</h2>
              <p class="value">{{ fmt(t.previewUploads) }}</p>
              <p class="sub">Foto hochgeladen</p>
            </article>
          </div>

          <div class="card panel">
            <BarList title="Trichter" :items="funnel" :total="t.pageviews" />
          </div>

          <div class="card panel">
            <h2 class="panel-title">Verlauf</h2>
            <div class="multiples">
              <DailyColumns title="Seitenaufrufe pro Tag" :data="dailyViews" />
              <DailyColumns title="Bestätigte Anmeldungen pro Tag" :data="dailySignups" />
            </div>
            <details class="table-view">
              <summary>Als Tabelle anzeigen</summary>
              <table>
                <thead>
                  <tr><th>Datum</th><th>Seitenaufrufe</th><th>Anmeldungen</th></tr>
                </thead>
                <tbody>
                  <tr v-for="d in stats.daily" :key="d.date">
                    <td>{{ d.date.split('-').reverse().join('.') }}</td>
                    <td>{{ fmt(d.pageviews) }}</td>
                    <td>{{ fmt(d.signups) }}</td>
                  </tr>
                </tbody>
              </table>
            </details>
          </div>

          <h2 class="group-title">Was wollen die Interessent:innen?</h2>
          <p class="group-note">Angaben aus bestätigten Anmeldungen</p>
          <div class="grid-2">
            <div class="card panel"><BarList title="Gewähltes Paket" :items="toItems(stats.signups.byPackage, labelMaps.package)" /></div>
            <div class="card panel"><BarList title="Preisbereitschaft (1 Gesicht, 6 Sticker)" :items="toItems(stats.signups.byPriceRange, labelMaps.price)" /></div>
            <div class="card panel"><BarList title="Anlass" :items="toItems(stats.signups.byOccasion, labelMaps.occasion)" /></div>
            <div class="card panel"><BarList title="Look: echtes Foto oder illustriert" :items="byLook(stats.signups.byStyle)" /></div>
          </div>

          <h2 class="group-title">Woher kommen sie, was klicken sie?</h2>
          <div class="grid-2">
            <div class="card panel"><BarList title="Seitenaufrufe nach Quelle" :items="toItems(stats.pageviewsBySource)" /></div>
            <div class="card panel"><BarList title="Anmeldungen nach Quelle" :items="toItems(stats.signups.bySource)" /></div>
            <div class="card panel"><BarList title="„Vorbestellen“-Klicks nach Paket" :items="toItems(stats.pricingClicksByPackage, labelMaps.package)" /></div>
            <div class="card panel"><BarList title="CTA-Klicks nach Position" :items="toItems(stats.ctaClicksByLocation, labelMaps.location)" /></div>
            <div class="card panel"><BarList title="Filter / Stil bei Anmeldungen" :items="toItems(stats.signups.byStyle, labelMaps.style)" /></div>
            <div class="card panel"><BarList title="Filter / Stil in der Vorschau angeklickt" :items="toItems(stats.styleSelections, labelMaps.style)" /></div>
            <div class="card panel"><BarList title="Geöffnete FAQ (Nr.)" :items="toItems(stats.faqOpens)" /></div>
          </div>

          <p class="generated">Stand: {{ new Date(stats.generatedAt).toLocaleString('de-DE') }}</p>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.stats {
  padding-top: 48px;
}

.head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 24px;
}

.head h1 {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3rem);
}

.controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

select,
input {
  min-height: 42px;
  padding: 8px 12px;
  border: 2px solid var(--ink);
  border-radius: 10px;
  background: #fff;
  font: inherit;
}

.icon-btn {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border: 2px solid var(--ink);
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
}

.login {
  max-width: 460px;
  padding: 24px;
}

.login label {
  display: block;
  margin-bottom: 8px;
  font-weight: 800;
}

.login-row {
  display: flex;
  gap: 10px;
}

.login-row input {
  flex: 1;
  min-width: 0;
}

.error {
  margin: 12px 0;
  padding: 10px 14px;
  border-radius: 12px;
  background: var(--pink-soft);
  font-weight: 700;
}

.dashboard {
  display: grid;
  gap: 20px;
  transition: opacity 0.2s ease;
}

.dashboard.loading {
  opacity: 0.55;
}

.kpis {
  display: grid;
  grid-template-columns: 1.6fr repeat(4, 1fr);
  gap: 16px;
}

.kpi {
  padding: 18px 20px;
  box-shadow: 3px 3px 0 var(--ink);
}

.kpi h2 {
  margin: 0 0 6px;
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--ink-soft);
  letter-spacing: 0;
}

.kpi .value {
  margin: 0;
  font-size: 2rem;
  font-weight: 800;
  line-height: 1.1;
}

.kpi.hero {
  background: var(--yellow);
}

.kpi.hero .value {
  font-size: 3.5rem;
}

.kpi .sub {
  margin: 6px 0 0;
  font-size: 0.85rem;
  color: var(--muted);
}

.kpi.hero .sub {
  color: var(--ink-soft);
}

.panel {
  padding: 20px 22px;
  box-shadow: 3px 3px 0 var(--ink);
}

.panel-title {
  margin: 0 0 14px;
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 800;
}

.multiples {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
}

.table-view {
  margin-top: 16px;
}

.table-view summary {
  font-weight: 700;
  cursor: pointer;
}

table {
  width: 100%;
  margin-top: 10px;
  border-collapse: collapse;
  font-size: 0.9rem;
  font-variant-numeric: tabular-nums;
}

th,
td {
  padding: 6px 8px;
  border-bottom: 1px solid #e9e7ef;
  text-align: right;
}

th:first-child,
td:first-child {
  text-align: left;
}

.group-title {
  margin: 20px 0 0;
  font-size: 1.5rem;
}

.group-note {
  margin: -14px 0 0;
  color: var(--muted);
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.generated {
  color: var(--muted);
  font-size: 0.85rem;
}

@media (max-width: 1000px) {
  .kpis {
    grid-template-columns: repeat(2, 1fr);
  }

  .kpi.hero {
    grid-column: 1 / -1;
  }
}

@media (max-width: 760px) {
  .multiples,
  .grid-2 {
    grid-template-columns: 1fr;
  }
}
</style>
