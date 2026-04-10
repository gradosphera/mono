// ai/skills → ~/.*/skills/blago/; ai/bmad/.{claude,cursor}/skills → ~/.*/skills/blago/bmad; ai/commands → ~/.*/commands/blago/commands.

import * as fsp from 'node:fs/promises'
import * as os from 'node:os'
import * as path from 'node:path'

import { bundledAiDir } from '../ai-bundled-dir.js'

function cpExcludeJunk(source: string): boolean {
  const base = path.basename(source)
  return base !== '.DS_Store' && !base.startsWith('._')
}

/** Сегмент под ai/ и хвост пути под ~/.claude и ~/.cursor (одинаковый). */
async function copyBundledAiSegmentToAgentHomes(
  aiSegment: string,
  homeTail: readonly string[],
): Promise<void> {
  let aiDir: string
  try {
    aiDir = bundledAiDir()
  }
  catch {
    return
  }
  const src = path.join(aiDir, aiSegment)
  try {
    const st = await fsp.stat(src)
    if (!st.isDirectory()) {
      return
    }
  }
  catch {
    return
  }

  for (const root of ['.claude', '.cursor'] as const) {
    const dest = path.join(os.homedir(), root, ...homeTail)
    await fsp.mkdir(path.dirname(dest), { recursive: true })
    await fsp.rm(dest, { recursive: true, force: true })
    await fsp.cp(src, dest, {
      recursive: true,
      filter: s => cpExcludeJunk(s),
    })
  }
}

/**
 * BMAD-скиллы из пакета: отдельно для Claude и Cursor (разные деревья в `ai/bmad/`).
 */
async function copyBundledBmadSkillsToAgentHomes(): Promise<void> {
  let aiDir: string
  try {
    aiDir = bundledAiDir()
  }
  catch {
    return
  }
  const agentRoots = ['.claude', '.cursor'] as const
  for (const root of agentRoots) {
    const src = path.join(aiDir, 'bmad', root, 'skills')
    try {
      const st = await fsp.stat(src)
      if (!st.isDirectory()) {
        continue
      }
    }
    catch {
      continue
    }
    const dest = path.join(os.homedir(), root, 'skills', 'blago', 'bmad')
    await fsp.mkdir(path.dirname(dest), { recursive: true })
    await fsp.rm(dest, { recursive: true, force: true })
    await fsp.cp(src, dest, {
      recursive: true,
      filter: s => cpExcludeJunk(s),
    })
  }
}

/**
 * Копирует `ai/skills`, `ai/commands` и BMAD-скиллы в домашние каталоги Claude и Cursor (если есть в пакете).
 * Не падает при отсутствии каталогов или ошибке `bundledAiDir`.
 */
export async function copyBundledBlagoAgentHomeBundles(): Promise<void> {
  await copyBundledAiSegmentToAgentHomes('skills', ['skills', 'blago'])
  await copyBundledAiSegmentToAgentHomes('commands', ['commands', 'blago', 'commands'])
  await copyBundledBmadSkillsToAgentHomes()
}
