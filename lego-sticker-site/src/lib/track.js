// Cookie-free event tracking: no IDs, no storage, nothing that identifies a person.
// Events are counted on our own server (see server/store.js) and shown on /stats.

const source = readSource()
const seenPaths = new Set()

function readSource() {
  const params = new URLSearchParams(window.location.search)
  const result = {}
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign']) {
    const value = params.get(key)
    if (value) result[key] = value.slice(0, 64)
  }
  if (!result.utm_source && document.referrer) {
    try {
      const host = new URL(document.referrer).hostname.replace(/^www\./, '')
      if (host && host !== window.location.hostname) result.ref = host
    } catch {
      // ignore malformed referrers
    }
  }
  return result
}

/** UTM parameters / referrer of this visit, sent along with the signup. */
export function getSource() {
  return source
}

export function track(type, meta = {}) {
  const body = JSON.stringify({ type, meta: { ...source, ...meta } })
  try {
    // A string body is sent as text/plain, which every browser accepts for beacons.
    if (navigator.sendBeacon?.('/api/event', body)) return
  } catch {
    // fall through to fetch
  }
  fetch('/api/event', { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'text/plain' } }).catch(() => {})
}

/** Counts each path once per page load, so going back and forth is not inflated. */
export function trackPageview(path) {
  if (seenPaths.has(path)) return
  seenPaths.add(path)
  track('pageview', { path })
}
