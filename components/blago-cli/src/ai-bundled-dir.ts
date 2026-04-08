// Каталог `ai/` внутри установленного пакета blago-cli (рядом со skills/commands/config).

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

/** dist/index.mjs → ../ai; dist/cmd/*.mjs → ../../ai; src/*.ts (stub) → ../../ai */
const AI_DIR_REL_TO_META = ['../ai', '../../ai', '../../../ai'] as const

export function bundledAiDir(): string {
  for (const rel of AI_DIR_REL_TO_META) {
    const dir = fileURLToPath(new URL(rel, import.meta.url))
    const marker = path.join(dir, 'config', 'helpers.md')
    try {
      fs.accessSync(marker)
      return dir
    }
    catch {
      /* следующий кандидат */
    }
  }
  const tried = AI_DIR_REL_TO_META.map(rel => fileURLToPath(new URL(rel, import.meta.url))).join('; ')
  throw new Error(
    `Не найден каталог ai/ пакета blago-cli (ожидается config/helpers.md). Проверены пути: ${tried}`,
  )
}
