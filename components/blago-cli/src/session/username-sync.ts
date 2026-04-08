// Синхронное чтение username из .blago/session.<env>.json (без зависимости от status-text).

import * as fs from 'node:fs'

import { sessionPath } from '../config/paths.js'

interface SessionFileShape {
  username?: string
}

function readJsonIfExists<T>(filePath: string): T | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(raw) as T
  }
  catch {
    return null
  }
}

export function readSessionUsernameSync(root: string, envName: string): string | null {
  const session = readJsonIfExists<SessionFileShape>(sessionPath(root, envName))
  const u = session?.username?.trim()
  return u && u.length > 0 ? u : null
}
