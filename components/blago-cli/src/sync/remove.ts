// remove: убрать пути из staging.json (аналог git restore --staged для .md).

import * as fs from 'node:fs/promises'
import * as path from 'node:path'

import { loadStaging, normalizeRelativePath, saveStaging } from './index-store.js'

async function collectMarkdownFiles(absDir: string): Promise<string[]> {
  const out: string[] = []
  const entries = await fs.readdir(absDir, { withFileTypes: true })
  for (const e of entries) {
    const abs = path.join(absDir, e.name)
    if (e.isDirectory()) {
      const nested = await collectMarkdownFiles(abs)
      out.push(...nested)
    }
    else if (e.isFile() && e.name.endsWith('.md')) {
      out.push(abs)
    }
  }
  return out
}

export interface RunRemoveResult {
  readonly removedCount: number
  readonly remainingPaths: string[]
  readonly notStagedCount: number
}

/** Полностью очистить staging. */
export async function runClearStaging(root: string): Promise<void> {
  await saveStaging(root, { paths: [] })
}

/**
 * Убрать из staging указанные файлы или все .md под каталогом (пути относительно root).
 * Пути, которых нет в staging, пропускаются (счётчик notStaged).
 */
export async function runRemove(root: string, targets: string[]): Promise<RunRemoveResult> {
  if (targets.length === 0) {
    throw new Error('Укажите файлы или каталоги: blago remove <путь> … либо blago remove --all')
  }
  const staging = await loadStaging(root)
  const stagedSet = new Set(staging.paths.map(p => normalizeRelativePath(p)))

  const toRemove = new Set<string>()
  for (const t of targets) {
    const abs = path.resolve(root, t)
    let st: Awaited<ReturnType<typeof fs.stat>>
    try {
      st = await fs.stat(abs)
    }
    catch {
      continue
    }
    const files: string[] = []
    if (st.isDirectory()) {
      files.push(...(await collectMarkdownFiles(abs)))
    }
    else if (st.isFile() && path.extname(abs).toLowerCase() === '.md') {
      files.push(abs)
    }
    for (const file of files) {
      toRemove.add(normalizeRelativePath(path.relative(root, file)))
    }
  }

  let removedCount = 0
  let notStagedCount = 0
  for (const rel of toRemove) {
    if (stagedSet.has(rel)) {
      stagedSet.delete(rel)
      removedCount += 1
    }
    else {
      notStagedCount += 1
    }
  }

  const remainingPaths = [...stagedSet].sort()
  await saveStaging(root, { paths: remainingPaths })
  return { removedCount, remainingPaths, notStagedCount }
}
