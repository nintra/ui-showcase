import { config } from './config.js'
import { createStore } from './store.js'
import { createBrevo } from './brevo.js'
import { createApp } from './app.js'

const store = createStore(config.dataDir)
const brevo = createBrevo(config.brevo)
const app = createApp({ config, store, brevo })

app.listen(config.port, () => {
  console.log(`API läuft auf http://localhost:${config.port}  (öffentliche URL: ${config.publicUrl})`)
  if (!brevo.enabled) {
    console.warn('Brevo ist nicht vollständig konfiguriert (BREVO_API_KEY, BREVO_LIST_ID, BREVO_SENDER_EMAIL).')
    console.warn(config.isProduction ? 'Anmeldungen werden abgelehnt.' : 'Dev-Modus: Bestätigungslinks werden hier im Log ausgegeben.')
  }
  if (!config.statsToken) console.warn('STATS_TOKEN ist nicht gesetzt – die Auswertung unter /stats ist deaktiviert.')
})
