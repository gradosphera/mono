// Копирует каталог ai/ (skills/cli/SKILL.md, commands/, …) в ~/.claude/skills/blago/ai/ целиком.

import * as fs from 'node:fs'
import * as fsp from 'node:fs/promises'
import * as os from 'node:os'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

/** dist/index.mjs → ../ai; dist/cmd/*.mjs → ../../ai; src/cmd/*.ts (stub) → ../../../ai */
const AI_DIR_REL_TO_META = ['../ai', '../../ai', '../../../ai'] as const

function bundledAiDir(): string {
  for (const rel of AI_DIR_REL_TO_META) {
    const dir = fileURLToPath(new URL(rel, import.meta.url))
    const skillMd = path.join(dir, 'skills', 'cli', 'SKILL.md')
    try {
      fs.accessSync(skillMd)
      return dir
    }
    catch {
      /* следующий кандидат */
    }
  }
  const tried = AI_DIR_REL_TO_META.map(rel => fileURLToPath(new URL(rel, import.meta.url))).join('; ')
  throw new Error(
    `Не найден каталог ai/ пакета blago-cli (ожидается skills/cli/SKILL.md). Проверены пути: ${tried}`,
  )
}

export async function runSkillsInstall(): Promise<{ source: string, dest: string }> {
  const source = bundledAiDir()
  const dest = path.join(os.homedir(), '.claude', 'skills', 'blago', 'ai')
  await fsp.rm(dest, { recursive: true, force: true })
  await fsp.mkdir(path.dirname(dest), { recursive: true })
  await fsp.cp(source, dest, { recursive: true })
  return { source, dest }
}
