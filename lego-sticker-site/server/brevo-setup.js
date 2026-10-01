// One-off setup for the Brevo account: creates the contact attributes the site
// writes, finds or creates the waitlist and checks the sender address.
// Usage: npm run brevo:setup

import './env.js'
import { BrevoClient, BrevoError } from '@getbrevo/brevo'
import { site } from '../shared/site.config.js'
import { describeError } from './brevo.js'

const { BREVO_API_KEY, BREVO_LIST_ID, BREVO_SENDER_EMAIL } = process.env
const LIST_NAME = `${site.brand} – Warteliste`

const ATTRIBUTES = [
  ['FIRSTNAME', 'text'],
  ['PAKET', 'text'],
  ['ANLASS', 'text'],
  ['PREIS_SOLO', 'text'],
  ['STIL', 'text'],
  ['QUELLE', 'text'],
  ['KAMPAGNE', 'text'],
  ['OPT_IN_AM', 'date'],
]

if (!BREVO_API_KEY) {
  console.error('BREVO_API_KEY fehlt. Lege eine .env an (siehe .env.example).')
  process.exit(1)
}

const brevo = new BrevoClient({ apiKey: BREVO_API_KEY })

async function ensureAttributes() {
  const { attributes = [] } = await brevo.contacts.getAttributes()
  const existing = new Set(attributes.filter((a) => a.category === 'normal').map((a) => a.name))
  for (const [name, type] of ATTRIBUTES) {
    if (existing.has(name)) {
      console.log(`  ✓ Attribut ${name} existiert`)
      continue
    }
    await brevo.contacts.createAttribute({ attributeCategory: 'normal', attributeName: name, type })
    console.log(`  + Attribut ${name} (${type}) angelegt`)
  }
}

async function ensureList() {
  if (BREVO_LIST_ID) {
    const list = await brevo.contacts.getList({ listId: Number(BREVO_LIST_ID) })
    console.log(`  ✓ Liste #${list.id} „${list.name}“ gefunden`)
    return
  }
  const { lists = [] } = await brevo.contacts.getLists({ limit: 50 })
  let list = lists.find((l) => l.name === LIST_NAME)
  if (!list) {
    const { folders = [] } = await brevo.contacts.getFolders({ limit: 10, offset: 0 })
    const folderId = folders[0]?.id ?? (await brevo.contacts.createFolder({ name: site.brand })).id
    list = { id: (await brevo.contacts.createList({ name: LIST_NAME, folderId })).id, name: LIST_NAME }
    console.log(`  + Liste „${LIST_NAME}“ angelegt`)
  }
  console.log(`  → Trage in deine .env ein:  BREVO_LIST_ID=${list.id}`)
}

async function checkSender() {
  if (!BREVO_SENDER_EMAIL) {
    console.log('  ! BREVO_SENDER_EMAIL ist nicht gesetzt.')
    return
  }
  const { senders = [] } = await brevo.senders.getSenders()
  const sender = senders.find((s) => s.email.toLowerCase() === BREVO_SENDER_EMAIL.toLowerCase())
  if (!sender) console.log(`  ! ${BREVO_SENDER_EMAIL} ist in Brevo kein Absender. Unter „Absender, Domains & IPs“ hinzufügen und verifizieren.`)
  else if (!sender.active) console.log(`  ! Absender ${BREVO_SENDER_EMAIL} ist noch nicht aktiv/verifiziert.`)
  else console.log(`  ✓ Absender ${BREVO_SENDER_EMAIL} ist aktiv`)
}

try {
  console.log('Kontakt-Attribute:')
  await ensureAttributes()
  console.log('Liste:')
  await ensureList()
  console.log('Absender:')
  await checkSender()
  console.log('\nFertig.')
} catch (err) {
  console.error('\nFehler:', err instanceof BrevoError ? describeError(err) : err)
  process.exit(1)
}
