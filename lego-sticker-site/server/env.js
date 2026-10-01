// Loads .env (if present) before anything reads process.env. Variables that are
// already set in the real environment win.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const envFile = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '.env')
if (fs.existsSync(envFile)) process.loadEnvFile(envFile)
