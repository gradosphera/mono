// Копирует содержимое каталога ai/ в ~/.claude/skills/blago/ (без вложенной папки ai).

import * as fsp from 'node:fs/promises'
import * as os from 'node:os'
import * as path from 'node:path'

import { bundledAiDir } from '../ai-bundled-dir.js'
import { installBundledBlagoConfigAssets } from '../config/global-config.js'

export async function runSkillsInstall(): Promise<{ source: string, dest: string }> {
  const source = bundledAiDir()
  const dest = path.join(os.homedir(), '.claude', 'skills', 'blago')
  const skillsRoot = path.join(os.homedir(), '.claude', 'skills')
  await fsp.mkdir(skillsRoot, { recursive: true })
  await fsp.mkdir(dest, { recursive: true })

  const entries = await fsp.readdir(source, { withFileTypes: true })
  for (const ent of entries) {
    const from = path.join(source, ent.name)
    const to = path.join(dest, ent.name)
    await fsp.rm(to, { recursive: true, force: true })
    await fsp.cp(from, to, { recursive: true })
  }
  await installBundledBlagoConfigAssets()
  return { source, dest }
}
