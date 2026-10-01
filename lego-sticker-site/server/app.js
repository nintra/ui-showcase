import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import express from 'express'
import { validateEvent, validateSignup } from './validate.js'
import { createToken, verifyToken, hashEmail } from './token.js'
import { confirmationMail, welcomeMail, notifyMail } from './mails.js'
import { describeError } from './brevo.js'
import { rateLimit } from './rate-limit.js'

const BOT_UA = /bot|crawl|spider|slurp|preview|headless|lighthouse|monitor/i

function safeEqual(a, b) {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && crypto.timingSafeEqual(x, y)
}

export function createApp({ config, store, brevo }) {
  const app = express()
  app.disable('x-powered-by')
  app.set('trust proxy', config.trustProxy)

  app.use((req, res, next) => {
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Frame-Options': 'DENY',
    })
    next()
  })

  const api = express.Router()
  // sendBeacon may arrive as text/plain – parse both.
  api.use(express.json({ limit: '8kb', type: ['application/json', 'text/plain'] }))

  api.get('/health', (req, res) => {
    res.json({ ok: true, brevo: brevo.enabled })
  })

  api.post('/event', rateLimit({ windowMs: 60_000, max: 120 }), (req, res) => {
    const event = validateEvent(req.body)
    if (event && !BOT_UA.test(req.get('user-agent') || '')) store.addEvent(event)
    res.status(204).end()
  })

  api.post('/signup', rateLimit({ windowMs: 10 * 60_000, max: 8 }), async (req, res) => {
    const result = validateSignup(req.body)
    // Bots that fill the honeypot get a normal-looking answer and nothing else.
    if (result.spam) return res.json({ ok: true })
    if (result.errors) return res.status(422).json({ ok: false, errors: result.errors })

    const signup = result.data
    const token = createToken(
      {
        e: signup.email,
        n: signup.firstName,
        p: signup.package,
        o: signup.occasion,
        r: signup.priceRange,
        s: signup.style,
        src: signup.source,
      },
      config.appSecret,
    )
    const confirmUrl = `${config.publicUrl}/api/confirm?token=${token}`
    const record = {
      status: 'requested',
      id: hashEmail(signup.email, config.appSecret),
      package: signup.package,
      occasion: signup.occasion,
      priceRange: signup.priceRange,
      style: signup.style,
      source: signup.source,
    }

    if (!brevo.enabled) {
      if (config.isProduction) {
        console.error('[signup] Brevo ist nicht konfiguriert – Anmeldung verworfen.')
        return res.status(503).json({ ok: false, error: 'Die Anmeldung ist gerade nicht möglich. Bitte versuch es später noch einmal.' })
      }
      store.addSignup(record)
      console.log(`[dev] Brevo nicht konfiguriert. Bestätigungslink für ${signup.email}:\n      ${confirmUrl}`)
      return res.json({ ok: true, devConfirmUrl: confirmUrl })
    }

    try {
      const mail = confirmationMail({ firstName: signup.firstName, confirmUrl, publicUrl: config.publicUrl })
      await brevo.sendMail({ to: { email: signup.email }, ...mail, tags: ['doi'] })
    } catch (err) {
      console.error('[signup] Bestätigungsmail fehlgeschlagen:', describeError(err))
      return res.status(502).json({ ok: false, error: 'Wir konnten dir gerade keine E-Mail schicken. Bitte prüfe die Adresse oder versuch es später.' })
    }
    store.addSignup(record)
    res.json({ ok: true })
  })

  api.get('/confirm', async (req, res) => {
    const payload = verifyToken(req.query.token, config.appSecret)
    if (!payload) return res.redirect(303, '/bestaetigt?status=ungueltig')

    const signup = {
      email: payload.e,
      firstName: payload.n || '',
      package: payload.p || '',
      occasion: payload.o || '',
      priceRange: payload.r || '',
      style: payload.s || '',
      source: payload.src || {},
    }
    const id = hashEmail(signup.email, config.appSecret)
    const alreadyConfirmed = store.isConfirmed(id)

    if (brevo.enabled) {
      try {
        await brevo.upsertContact({
          email: signup.email,
          attributes: {
            FIRSTNAME: signup.firstName || undefined,
            PAKET: signup.package || undefined,
            ANLASS: signup.occasion || undefined,
            PREIS_SOLO: signup.priceRange || undefined,
            STIL: signup.style || undefined,
            QUELLE: signup.source.utm_source || signup.source.ref || 'direkt',
            KAMPAGNE: signup.source.utm_campaign || undefined,
            OPT_IN_AM: new Date().toISOString().slice(0, 10),
          },
        })
      } catch (err) {
        console.error('[confirm] Kontakt konnte nicht gespeichert werden:', describeError(err))
        return res.redirect(303, '/bestaetigt?status=fehler')
      }
    }

    if (!alreadyConfirmed) {
      // Only the keyed hash and survey answers end up on disk – the address lives in Brevo.
      const { email, firstName, ...answers } = signup
      store.addSignup({ status: 'confirmed', id, ...answers })

      if (brevo.enabled) {
        const publicUrl = config.publicUrl
        const mails = [brevo.sendMail({ to: { email, name: firstName || undefined }, ...welcomeMail({ firstName, publicUrl }), tags: ['welcome'] })]
        if (config.brevo.notifyEmail) {
          mails.push(brevo.sendMail({ to: { email: config.brevo.notifyEmail }, ...notifyMail({ signup, publicUrl }), tags: ['notify'] }))
        }
        for (const result of await Promise.allSettled(mails)) {
          if (result.status === 'rejected') console.error('[confirm] Mailversand fehlgeschlagen:', describeError(result.reason))
        }
      }
    }

    res.redirect(303, '/bestaetigt')
  })

  api.get('/stats', (req, res) => {
    if (!config.statsToken) {
      return res.status(503).json({ ok: false, error: 'STATS_TOKEN ist auf dem Server nicht gesetzt.' })
    }
    const token = (req.get('authorization') || '').replace(/^Bearer\s+/i, '')
    if (!token || !safeEqual(token, config.statsToken)) {
      return res.status(401).json({ ok: false, error: 'Falscher Zugangscode.' })
    }
    const days = Math.min(Math.max(Number.parseInt(req.query.days, 10) || 30, 1), 365)
    res.set('Cache-Control', 'no-store').json({ ok: true, ...store.stats({ days }) })
  })

  api.use((req, res) => res.status(404).json({ ok: false, error: 'Not found' }))
  // Malformed JSON and similar client errors.
  api.use((err, req, res, next) => {
    if (err.status && err.status < 500) return res.status(err.status).json({ ok: false, error: 'Ungültige Anfrage.' })
    next(err)
  })

  app.use('/api', api)

  // Production: serve the Vite build and let the Vue router handle all other paths.
  const indexHtml = path.join(config.distDir, 'index.html')
  if (fs.existsSync(indexHtml)) {
    app.use((req, res, next) => {
      res.set(
        'Content-Security-Policy',
        "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
      )
      next()
    })
    app.use('/assets', express.static(path.join(config.distDir, 'assets'), { immutable: true, maxAge: '1y' }))
    app.use(express.static(config.distDir, { index: false }))
    app.get('/{*path}', (req, res) => res.sendFile(indexHtml))
  }

  return app
}
