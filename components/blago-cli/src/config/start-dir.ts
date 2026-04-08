// Базовый каталог для поиска .blago/: активная копия из ~/.claude/config/blago/config.yaml, иначе cwd.

import * as fs from 'node:fs'
import * as path from 'node:path'

import { readGlobalBlagoConfigSync, resolveActiveWorkspaceRoot } from './global-config.js'
import { configPath } from './paths.js'

function isBlagoWorkspaceReady(resolvedRoot: string): boolean {
  try {
    return fs.existsSync(configPath(path.resolve(resolvedRoot)))
  }
  catch {
    return false
  }
}

export function resolveBlagoStartDir(): string {
  const global = readGlobalBlagoConfigSync()
  if (global) {
    const fromGlobal = resolveActiveWorkspaceRoot(global)
    if (fromGlobal !== null && isBlagoWorkspaceReady(fromGlobal)) {
      return fromGlobal
    }
  }
  return process.cwd()
}
