// Minimal fixed-window rate limiter (in memory, per IP). Good enough to keep
// bots from flooding the waitlist or the event log of a single-instance server.

export function rateLimit({ windowMs, max }) {
  const hits = new Map()

  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of hits) if (entry.reset <= now) hits.delete(key)
  }, windowMs).unref()

  return (req, res, next) => {
    const now = Date.now()
    const key = req.ip
    let entry = hits.get(key)
    if (!entry || entry.reset <= now) {
      entry = { count: 0, reset: now + windowMs }
      hits.set(key, entry)
    }
    entry.count++
    if (entry.count > max) {
      res.set('Retry-After', String(Math.ceil((entry.reset - now) / 1000)))
      return res.status(429).json({ ok: false, error: 'Zu viele Anfragen – bitte versuch es gleich noch einmal.' })
    }
    next()
  }
}
