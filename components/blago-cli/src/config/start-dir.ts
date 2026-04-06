// Базовый каталог для поиска .blago/ и относительных путей: --dir (в любом месте argv) > BLAGO_WORKSPACE > cwd.

import * as path from 'node:path'

let explicitDirFromArgv: string | null = null

/** Вызывается из runCli: снять --dir с argv до parse, чтобы подкоманды не падали на «unknown option». */
export function peelBlagoDirFromArgv(argv: readonly string[]): { argv: string[], dir: string | null } {
  let dir: string | null = null
  const out: string[] = []
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === undefined) {
      continue
    }
    if (a === '--dir') {
      const next = argv[i + 1]
      if (next !== undefined && !next.startsWith('-')) {
        dir = next
        i++
      }
      continue
    }
    if (a.startsWith('--dir=')) {
      const v = a.slice('--dir='.length).trim()
      dir = v.length > 0 ? v : null
      continue
    }
    out.push(a)
  }
  return { argv: out, dir }
}

export function setBlagoCliExplicitStartDir(dir: string | null): void {
  explicitDirFromArgv = dir !== null && dir.trim().length > 0 ? path.resolve(dir.trim()) : null
}

export function resolveBlagoStartDir(): string {
  if (explicitDirFromArgv !== null) {
    return explicitDirFromArgv
  }
  if (process.env.BLAGO_WORKSPACE) {
    return path.resolve(process.env.BLAGO_WORKSPACE)
  }
  return process.cwd()
}
