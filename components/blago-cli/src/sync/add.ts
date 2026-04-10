// add: только .md, с учётом .blagoignore; в staging — только файлы, изменённые относительно индекса (или без записи в индексе).

import * as fs from 'node:fs/promises'
import * as path from 'node:path'

import { sha256Hex } from '../lib/hash.js'
import { expandBlagoUserTargetsToRelativePaths } from './capital-target-expand.js'
import { isIgnoredRelativePath, loadBlagoIgnoreRules } from './ignore.js'
import { findByRelativePath, loadIndex, loadStaging, normalizeRelativePath, saveStaging } from './index-store.js'
import { isPullOnlyCommunicationRelativePath } from './pull-only-paths.js'

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

/** true — файл стоит поставить в staging: нет в индексе или SHA256 на диске ≠ content_etag_local. */
async function isDirtyVsIndex(root: string, rel: string, index: Awaited<ReturnType<typeof loadIndex>>): Promise<boolean> {
  const entry = findByRelativePath(index, rel)
  if (!entry) {
    return true
  }
  try {
    const raw = await fs.readFile(path.join(root, rel), 'utf8')
    return sha256Hex(raw) !== entry.content_etag_local
  }
  catch {
    return true
  }
}

export interface RunAddResult {
  /** Пути, прошедшие фильтр и попавшие в объединённый staging */
  stagedPaths: string[]
  skippedUnchanged: number
  skippedIgnored: number
  /** messages/ и meetings/ — только синхронизация с сервера, в push не идут */
  skippedPullOnlyArtifacts: number
}

export async function runAdd(root: string, targets: string[]): Promise<RunAddResult> {
  if (targets.length === 0) {
    throw new Error('Укажите файлы, каталоги или id: blago add <путь|id проекта|projectId-issueId> …')
  }
  const rules = await loadBlagoIgnoreRules(root)
  const index = await loadIndex(root)
  const expanded = await expandBlagoUserTargetsToRelativePaths(root, targets, index)
  const staging = await loadStaging(root)
  const set = new Set(staging.paths.map(p => normalizeRelativePath(p)))

  let skippedUnchanged = 0
  let skippedIgnored = 0
  let skippedPullOnlyArtifacts = 0

  for (const t of expanded) {
    const abs = path.resolve(root, t)
    const st = await fs.stat(abs)
    const files: string[] = []
    if (st.isDirectory()) {
      files.push(...(await collectMarkdownFiles(abs)))
    }
    else if (st.isFile()) {
      files.push(abs)
    }
    for (const file of files) {
      const rel = normalizeRelativePath(path.relative(root, file))
      if (isIgnoredRelativePath(rel, rules)) {
        skippedIgnored += 1
        continue
      }
      if (isPullOnlyCommunicationRelativePath(rel)) {
        skippedPullOnlyArtifacts += 1
        continue
      }
      if (!(await isDirtyVsIndex(root, rel, index))) {
        skippedUnchanged += 1
        continue
      }
      set.add(rel)
    }
  }

  const stagedPaths = [...set].sort()
  await saveStaging(root, { paths: stagedPaths })
  return { stagedPaths, skippedUnchanged, skippedIgnored, skippedPullOnlyArtifacts }
}
