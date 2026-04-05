// .blagoignore: простые префиксы/имена (не полный gitignore).

import * as fs from 'node:fs/promises'
import * as path from 'node:path'

const DEFAULT_IGNORE = ['.blago/', '.git/']

export async function loadBlagoIgnoreRules(root: string): Promise<string[]> {
  const rules: string[] = [...DEFAULT_IGNORE]
  try {
    const raw = await fs.readFile(path.join(root, '.blagoignore'), 'utf8')
    for (const line of raw.split('\n')) {
      const t = line.trim()
      if (!t || t.startsWith('#')) {
        continue
      }
      rules.push(t)
    }
  }
  catch {
    /* нет файла */
  }
  return rules
}

function matchesRule(relPosix: string, rule: string): boolean {
  const r = rule.replace(/\\/g, '/')
  const withSlash = r.endsWith('/') ? r.slice(0, -1) : r
  if (relPosix === withSlash) {
    return true
  }
  if (relPosix.startsWith(`${withSlash}/`)) {
    return true
  }
  if (!r.includes('/')) {
    const parts = relPosix.split('/')
    return parts.includes(withSlash)
  }
  return false
}

export function isIgnoredRelativePath(relPosix: string, rules: string[]): boolean {
  for (const rule of rules) {
    if (matchesRule(relPosix, rule)) {
      return true
    }
  }
  return false
}
