import crypto from 'node:crypto'

// Stateless double-opt-in token: base64url(JSON payload) + "." + HMAC signature.
// The signup data travels inside the confirmation link, so nothing personal has
// to be stored on our server before the address is confirmed.

const DEFAULT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

function sign(data, secret) {
  return crypto.createHmac('sha256', secret).update(data).digest('base64url')
}

export function createToken(payload, secret, now = Date.now()) {
  const data = Buffer.from(JSON.stringify({ ...payload, iat: now })).toString('base64url')
  return `${data}.${sign(data, secret)}`
}

export function verifyToken(token, secret, { now = Date.now(), maxAgeMs = DEFAULT_MAX_AGE_MS } = {}) {
  if (typeof token !== 'string' || token.length > 4000) return null
  const [data, signature, ...rest] = token.split('.')
  if (!data || !signature || rest.length) return null

  const expected = Buffer.from(sign(data, secret))
  const actual = Buffer.from(signature)
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) return null

  let payload
  try {
    payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'))
  } catch {
    return null
  }
  if (!payload || typeof payload.iat !== 'number' || now - payload.iat > maxAgeMs || payload.iat > now + 60_000) {
    return null
  }
  return payload
}

// Keyed hash so we can count unique signups without keeping e-mail addresses on disk.
export function hashEmail(email, secret) {
  return crypto.createHmac('sha256', secret).update(email.trim().toLowerCase()).digest('hex').slice(0, 32)
}
