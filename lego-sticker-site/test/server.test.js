import { test, describe, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createToken, verifyToken, hashEmail } from '../server/token.js'
import { validateSignup, validateEvent } from '../server/validate.js'
import { computeStats } from '../server/store.js'
import { createStore } from '../server/store.js'
import { createApp } from '../server/app.js'

const SECRET = 'test-secret'

describe('token', () => {
  test('round-trips a payload', () => {
    const token = createToken({ e: 'a@b.de' }, SECRET)
    assert.equal(verifyToken(token, SECRET).e, 'a@b.de')
  })

  test('rejects tampered, foreign and expired tokens', () => {
    const token = createToken({ e: 'a@b.de' }, SECRET)
    const [data, sig] = token.split('.')
    const forged = Buffer.from(JSON.stringify({ e: 'evil@x.de', iat: Date.now() })).toString('base64url')
    assert.equal(verifyToken(`${forged}.${sig}`, SECRET), null)
    assert.equal(verifyToken(`${data}.${sig}x`, SECRET), null)
    assert.equal(verifyToken(token, 'other-secret'), null)
    assert.equal(verifyToken(token, SECRET, { now: Date.now() + 8 * 86_400_000 }), null)
    assert.equal(verifyToken('garbage', SECRET), null)
    assert.equal(verifyToken(undefined, SECRET), null)
  })

  test('email hash ignores case and whitespace', () => {
    assert.equal(hashEmail(' Max@Example.DE ', SECRET), hashEmail('max@example.de', SECRET))
  })
})

describe('validation', () => {
  test('accepts a valid signup and drops unknown option values', () => {
    const { data } = validateSignup({
      email: 'Max@Example.de',
      firstName: ' Max <b> ',
      consent: true,
      package: 'familie',
      occasion: 'nope',
      source: { utm_source: 'instagram', evil: 'x' },
    })
    assert.equal(data.email, 'max@example.de')
    assert.equal(data.firstName, 'Max b')
    assert.equal(data.package, 'familie')
    assert.equal(data.occasion, '')
    assert.deepEqual(data.source, { utm_source: 'instagram' })
  })

  test('requires email and consent', () => {
    const { errors } = validateSignup({ email: 'kein-mail', consent: false })
    assert.ok(errors.email)
    assert.ok(errors.consent)
  })

  test('flags the honeypot', () => {
    assert.deepEqual(validateSignup({ email: 'a@b.de', consent: true, website: 'http://spam' }), { spam: true })
  })

  test('only allows known event types', () => {
    assert.equal(validateEvent({ type: 'signup_confirmed' }), null)
    assert.deepEqual(validateEvent({ type: 'pricing_click', meta: { pkg: 'solo', foo: 1 } }), { type: 'pricing_click', pkg: 'solo' })
  })
})

describe('stats', () => {
  test('counts funnel, uniques and sources within the range', () => {
    const now = new Date('2026-10-10T12:00:00Z')
    const events = [
      { t: '2026-10-10T08:00:00Z', type: 'pageview', path: '/', utm_source: 'instagram' },
      { t: '2026-10-09T08:00:00Z', type: 'pageview', path: '/' },
      { t: '2026-10-09T08:00:00Z', type: 'pageview', path: '/impressum' },
      { t: '2026-08-01T08:00:00Z', type: 'pageview', path: '/' }, // outside 7 days
      { t: '2026-10-10T08:01:00Z', type: 'pricing_click', pkg: 'solo' },
    ]
    const signups = [
      { t: '2026-10-10T08:02:00Z', status: 'requested', id: 'a' },
      { t: '2026-10-10T08:03:00Z', status: 'requested', id: 'a' },
      { t: '2026-10-10T08:04:00Z', status: 'confirmed', id: 'a', package: 'solo', source: { utm_source: 'instagram' } },
    ]
    const stats = computeStats(events, signups, { days: 7, now })
    assert.equal(stats.totals.pageviews, 2)
    assert.equal(stats.totals.signupsRequested, 1)
    assert.equal(stats.totals.signupsConfirmed, 1)
    assert.equal(stats.rates.signupConfirmed, 50)
    assert.deepEqual(stats.pageviewsBySource, { instagram: 1, direkt: 1 })
    assert.deepEqual(stats.signups.byPackage, { solo: 1 })
    assert.equal(stats.daily.length, 7)
    assert.deepEqual(stats.daily.at(-1), { date: '2026-10-10', pageviews: 1, signups: 1 })
  })
})

describe('api', () => {
  let server
  let base
  let dataDir
  const sent = []
  const contacts = []

  before(async () => {
    dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sticker-test-'))
    const config = {
      isProduction: false,
      publicUrl: 'http://localhost:5173',
      trustProxy: false,
      distDir: path.join(dataDir, 'no-dist'),
      appSecret: SECRET,
      statsToken: 'stats-secret',
      brevo: { notifyEmail: 'owner@example.com' },
    }
    const brevo = {
      enabled: true,
      sendMail: async (mail) => sent.push(mail),
      upsertContact: async (contact) => contacts.push(contact),
    }
    const app = createApp({ config, store: createStore(dataDir), brevo })
    await new Promise((resolve) => {
      server = app.listen(0, resolve)
    })
    base = `http://127.0.0.1:${server.address().port}`
  })

  after(() => {
    server.close()
    fs.rmSync(dataDir, { recursive: true, force: true })
  })

  const post = (url, body, headers = {}) =>
    fetch(base + url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) })

  test('stores events but ignores bots and unknown types', async () => {
    assert.equal((await post('/api/event', { type: 'pageview', meta: { path: '/' } })).status, 204)
    await post('/api/event', { type: 'pageview', meta: { path: '/' } }, { 'User-Agent': 'Googlebot/2.1' })
    await post('/api/event', { type: 'hack' })
    const res = await fetch(base + '/api/event', { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ type: 'cta_click', meta: { location: 'hero' } }) })
    assert.equal(res.status, 204)
    const lines = fs.readFileSync(path.join(dataDir, 'events.jsonl'), 'utf8').trim().split('\n')
    assert.equal(lines.length, 2)
  })

  test('rejects invalid signups', async () => {
    const res = await post('/api/signup', { email: 'x', consent: true })
    assert.equal(res.status, 422)
    assert.ok((await res.json()).errors.email)
  })

  test('double opt-in: signup sends mail, confirm creates contact once', async () => {
    const res = await post('/api/signup', { email: 'Fan@Example.de', firstName: 'Fan', consent: true, package: 'party', priceRange: '5-10', source: { utm_source: 'tiktok' } })
    assert.equal(res.status, 200)
    assert.equal(sent.length, 1)
    assert.equal(sent[0].to.email, 'fan@example.de')
    const link = sent[0].text.match(/http:\/\/localhost:5173\/api\/confirm\?token=\S+/)[0]
    const confirmPath = new URL(link).pathname + new URL(link).search

    const confirm = await fetch(base + confirmPath, { redirect: 'manual' })
    assert.equal(confirm.status, 303)
    assert.equal(confirm.headers.get('location'), '/bestaetigt')
    assert.equal(contacts.length, 1)
    assert.equal(contacts[0].attributes.PAKET, 'party')
    assert.equal(contacts[0].attributes.QUELLE, 'tiktok')
    assert.equal(sent.length, 3) // + welcome + owner notification

    // Clicking the link again updates the contact but sends no new mails / counts.
    await fetch(base + confirmPath, { redirect: 'manual' })
    assert.equal(sent.length, 3)

    const signupsFile = fs.readFileSync(path.join(dataDir, 'signups.jsonl'), 'utf8')
    assert.ok(!signupsFile.includes('fan@example.de'), 'no plain e-mail addresses on disk')
  })

  test('confirm with a bad token redirects to the error state', async () => {
    const res = await fetch(base + '/api/confirm?token=abc.def', { redirect: 'manual' })
    assert.equal(res.headers.get('location'), '/bestaetigt?status=ungueltig')
  })

  test('honeypot signups look successful but send nothing', async () => {
    const before = sent.length
    const res = await post('/api/signup', { email: 'bot@example.de', consent: true, website: 'spam' })
    assert.equal(res.status, 200)
    assert.equal(sent.length, before)
  })

  test('stats need the token', async () => {
    assert.equal((await fetch(base + '/api/stats')).status, 401)
    const res = await fetch(base + '/api/stats', { headers: { Authorization: 'Bearer stats-secret' } })
    const stats = await res.json()
    assert.equal(stats.totals.pageviews, 1)
    assert.equal(stats.totals.signupsConfirmed, 1)
    assert.deepEqual(stats.signups.byPackage, { party: 1 })
  })
})
