import './env.js'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import crypto from 'node:crypto'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const env = process.env
const isProduction = env.NODE_ENV === 'production'

function int(value) {
  const n = Number.parseInt(value ?? '', 10)
  return Number.isFinite(n) ? n : undefined
}

function secret(name) {
  if (env[name]) return env[name]
  if (isProduction) throw new Error(`${name} muss in Produktion gesetzt sein (siehe .env.example).`)
  // Dev fallback: random per process, so tokens from a previous run become invalid.
  return crypto.randomBytes(32).toString('hex')
}

export const config = {
  root,
  isProduction,
  port: int(env.PORT) ?? 3001,
  publicUrl: (env.PUBLIC_URL || 'http://localhost:5173').replace(/\/+$/, ''),
  trustProxy: env.TRUST_PROXY ? (int(env.TRUST_PROXY) ?? env.TRUST_PROXY) : false,
  dataDir: path.resolve(root, env.DATA_DIR || 'data'),
  distDir: path.join(root, 'dist'),
  appSecret: secret('APP_SECRET'),
  statsToken: env.STATS_TOKEN || '',
  brevo: {
    apiKey: env.BREVO_API_KEY || '',
    listId: int(env.BREVO_LIST_ID),
    senderEmail: env.BREVO_SENDER_EMAIL || '',
    senderName: env.BREVO_SENDER_NAME || '',
    notifyEmail: env.NOTIFY_EMAIL || '',
  },
}
