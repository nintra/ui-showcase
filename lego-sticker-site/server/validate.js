import { packageIds, styleIds, occasionIds, priceRangeIds } from '../shared/site.config.js'

const EMAIL_RE = /^[^\s@"<>()[\]\\,;:]+@[^\s@"<>()[\]\\,;:]+\.[a-z]{2,}$/i

export const CLIENT_EVENTS = new Set([
  'pageview',
  'cta_click',
  'preview_upload',
  'style_select',
  'pricing_click',
  'form_start',
  'faq_open',
])

// Allowed meta keys per event payload and their max length.
const META_KEYS = {
  path: 80,
  location: 32,
  pkg: 16,
  style: 16,
  faq: 8,
  utm_source: 64,
  utm_medium: 64,
  utm_campaign: 64,
  ref: 64,
}

function cleanText(value, max) {
  if (typeof value !== 'string') return ''
  // Strip control characters and angle brackets, collapse whitespace.
  return value
    .replace(/[\u0000-\u001f\u007f<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
}

function oneOf(value, allowed) {
  return allowed.includes(value) ? value : ''
}

export function cleanMeta(input) {
  const meta = {}
  if (!input || typeof input !== 'object') return meta
  for (const [key, max] of Object.entries(META_KEYS)) {
    const value = cleanText(input[key], max)
    if (value) meta[key] = value
  }
  return meta
}

export function validateEvent(body) {
  if (!body || typeof body !== 'object' || !CLIENT_EVENTS.has(body.type)) return null
  return { type: body.type, ...cleanMeta(body.meta) }
}

/**
 * Returns { data } for a valid signup, { errors } otherwise, or { spam: true }
 * when the honeypot field was filled in.
 */
export function validateSignup(body) {
  if (!body || typeof body !== 'object') return { errors: { form: 'Ungültige Anfrage.' } }
  if (cleanText(body.website, 200)) return { spam: true }

  const errors = {}
  const email = cleanText(body.email, 254).toLowerCase()
  if (!EMAIL_RE.test(email)) errors.email = 'Bitte gib eine gültige E-Mail-Adresse ein.'
  if (body.consent !== true) errors.consent = 'Bitte bestätige, dass wir dir schreiben dürfen.'

  if (Object.keys(errors).length) return { errors }

  return {
    data: {
      email,
      firstName: cleanText(body.firstName, 50),
      package: oneOf(body.package, packageIds),
      occasion: oneOf(body.occasion, occasionIds),
      priceRange: oneOf(body.priceRange, priceRangeIds),
      style: oneOf(body.style, styleIds),
      source: cleanMeta(body.source),
    },
  }
}
