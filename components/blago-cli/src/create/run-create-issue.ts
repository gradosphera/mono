// Локальное создание черновика задачи (FR-016).

import * as fs from 'node:fs/promises'
import * as path from 'node:path'

import type { BlagoConfigFile } from '../config/index.js'
import { resolveCoopname } from '../config/index.js'
import { serializeBlagoMarkdown } from '../format/index.js'
import { generateEntityHashHex64 } from '../lib/generate-entity-hash.js'
import { loadSession } from '../session/index.js'
import { appendPendingItem } from '../sync/pending-create.js'
import { loadProjectMapsFromIndex } from '../sync/project-index-map.js'
import { appendPathsToStaging, loadIndex, normalizeRelativePath } from '../sync/index-store.js'
import { generateSlug, issueFileRelativePath, workspaceBasePath } from '../sync/layout.js'

import { resolveProjectMarker } from './resolve-base.js'
import { buildDraftIssueFrontmatterAndBody } from './templates.js'

async function fileExistsAbs(abs: string): Promise<boolean> {
  try {
    await fs.access(abs)
    return true
  }
  catch {
    return false
  }
}

function parseCreatorsCsv(v: string | undefined): string[] {
  if (v === undefined || v.trim() === '') {
    return []
  }
  return v.split(',').map(s => s.trim()).filter(Boolean)
}

async function pickIssueDraftRelativePath(
  root: string,
  title: string,
  basePath: string,
  pendingHash: string,
): Promise<string> {
  const primary = issueFileRelativePath(title, basePath, '0')
  const absPrimary = path.join(root, primary)
  if (!(await fileExistsAbs(absPrimary))) {
    return normalizeRelativePath(primary)
  }
  const slug = generateSlug(title) || 'issue'
  const dir = `${basePath.replace(/\\/g, '/')}/issues`
  const alt = `${dir}/0-${slug}-${pendingHash.slice(0, 8)}.md`
  const absAlt = path.join(root, alt)
  if (!(await fileExistsAbs(absAlt))) {
    return normalizeRelativePath(alt)
  }
  throw new Error(`Не удалось подобрать свободное имя файла в «${dir}»`)
}

export interface RunCreateIssueOptions {
  readonly setSelf?: boolean
  readonly creatorsCsv?: string
  readonly submaster?: string
}

export async function runCreateIssue(
  root: string,
  cfg: BlagoConfigFile,
  basePathArg: string,
  title: string,
  options: RunCreateIssueOptions,
): Promise<{ relativePath: string }> {
  const coopCfg = resolveCoopname(cfg)
  if (!coopCfg) {
    throw new Error('Задайте coopname в config активной среды (или «blago init --coopname»)')
  }

  const index = await loadIndex(root)
  const { projectByHash, projectRowByHash } = await loadProjectMapsFromIndex(root, index)
  const marker = await resolveProjectMarker(root, basePathArg)
  const proj = projectByHash.get(marker.project_hash)
  if (!proj) {
    throw new Error(
      `Проект «${marker.project_hash}» не найден в индексе. Выполните «blago pull» и повторите create.`,
    )
  }

  const fromCsv = parseCreatorsCsv(options.creatorsCsv)
  let creators: string[]
  if (options.setSelf) {
    const session = await loadSession(root, cfg.activeEnv)
    if (!session) {
      throw new Error(
        'Для --set-self нужна сохранённая сессия активной среды. Выполните «blago login».',
      )
    }
    const u = session.username.trim()
    creators = [u, ...fromCsv.filter(c => c !== u)]
  }
  else {
    creators = fromCsv
  }

  const pendingHash = generateEntityHashHex64()
  const { data, body } = buildDraftIssueFrontmatterAndBody({
    title,
    pendingHashHex64: pendingHash,
    project_hash: marker.project_hash,
    projectRowByHash,
    creators,
    submaster: options.submaster,
  })

  const wsBase = workspaceBasePath(proj, projectByHash)
  const rel = await pickIssueDraftRelativePath(root, title, wsBase, pendingHash)
  const abs = path.join(root, rel)
  await fs.mkdir(path.dirname(abs), { recursive: true })
  await fs.writeFile(abs, serializeBlagoMarkdown(data, body), 'utf8')

  const createdAt = new Date().toISOString()
  await appendPendingItem(root, {
    kind: 'issue',
    entity_hash: pendingHash,
    relative_path: rel,
    created_at: createdAt,
  })
  await appendPathsToStaging(root, [rel])
  return { relativePath: rel }
}
