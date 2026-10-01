import fs from 'node:fs'
import path from 'node:path'

// Append-only JSON-lines storage. Plenty for a smoke test with a few thousand
// visitors; no database to set up or operate.

export function createStore(dataDir) {
  const eventsFile = path.join(dataDir, 'events.jsonl')
  const signupsFile = path.join(dataDir, 'signups.jsonl')
  fs.mkdirSync(dataDir, { recursive: true })

  function append(file, record) {
    fs.appendFileSync(file, JSON.stringify({ t: new Date().toISOString(), ...record }) + '\n')
  }

  function readLines(file) {
    if (!fs.existsSync(file)) return []
    return fs
      .readFileSync(file, 'utf8')
      .split('\n')
      .filter(Boolean)
      .flatMap((line) => {
        try {
          return [JSON.parse(line)]
        } catch {
          return []
        }
      })
  }

  return {
    addEvent: (event) => append(eventsFile, event),
    addSignup: (signup) => append(signupsFile, signup),
    isConfirmed: (id) => readLines(signupsFile).some((s) => s.status === 'confirmed' && s.id === id),
    stats: (options) => computeStats(readLines(eventsFile), readLines(signupsFile), options),
  }
}

function countBy(items, key) {
  const counts = {}
  for (const item of items) {
    const value = (typeof key === 'function' ? key(item) : item[key]) || 'k. A.'
    counts[value] = (counts[value] || 0) + 1
  }
  return Object.fromEntries(Object.entries(counts).sort((a, b) => b[1] - a[1]))
}

function sourceOf(record) {
  return record.utm_source || record.source?.utm_source || record.ref || record.source?.ref || 'direkt'
}

function uniqueById(signups, status) {
  const byId = new Map()
  for (const s of signups) if (s.status === status && !byId.has(s.id)) byId.set(s.id, s)
  return [...byId.values()]
}

function rate(part, total) {
  return total ? Math.round((part / total) * 1000) / 10 : 0
}

export function computeStats(allEvents, allSignups, { days = 30, now = new Date() } = {}) {
  // Everything is scoped to the last `days` days (UTC), including today.
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (days - 1)))
  const since = start.toISOString()
  const events = allEvents.filter((e) => e.t >= since)
  const signups = allSignups.filter((s) => s.t >= since)

  const pageviews = events.filter((e) => e.type === 'pageview' && (e.path ?? '/') === '/')
  const requested = uniqueById(signups, 'requested')
  const confirmed = uniqueById(signups, 'confirmed')
  const ofType = (type) => events.filter((e) => e.type === type)

  const daily = []
  for (let i = 0; i < days; i++) {
    const date = new Date(start.getTime() + i * 86_400_000).toISOString().slice(0, 10)
    daily.push({ date, pageviews: 0, signups: 0 })
  }
  const dayIndex = new Map(daily.map((d, i) => [d.date, i]))
  for (const e of pageviews) {
    const i = dayIndex.get(e.t?.slice(0, 10))
    if (i !== undefined) daily[i].pageviews++
  }
  for (const s of confirmed) {
    const i = dayIndex.get(s.t?.slice(0, 10))
    if (i !== undefined) daily[i].signups++
  }

  return {
    generatedAt: now.toISOString(),
    since,
    days,
    totals: {
      pageviews: pageviews.length,
      previewUploads: ofType('preview_upload').length,
      pricingClicks: ofType('pricing_click').length,
      formStarts: ofType('form_start').length,
      signupsRequested: requested.length,
      signupsConfirmed: confirmed.length,
    },
    rates: {
      signupRequested: rate(requested.length, pageviews.length),
      signupConfirmed: rate(confirmed.length, pageviews.length),
      doiConfirmation: rate(confirmed.length, requested.length),
    },
    pageviewsBySource: countBy(pageviews, sourceOf),
    ctaClicksByLocation: countBy(ofType('cta_click'), 'location'),
    pricingClicksByPackage: countBy(ofType('pricing_click'), 'pkg'),
    styleSelections: countBy(ofType('style_select'), 'style'),
    faqOpens: countBy(ofType('faq_open'), 'faq'),
    signups: {
      byPackage: countBy(confirmed, 'package'),
      byOccasion: countBy(confirmed, 'occasion'),
      byPriceRange: countBy(confirmed, 'priceRange'),
      byStyle: countBy(confirmed, 'style'),
      bySource: countBy(confirmed, sourceOf),
    },
    daily,
  }
}
