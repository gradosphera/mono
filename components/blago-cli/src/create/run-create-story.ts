// Локальное создание черновика требования (story) (FR-016).

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
import { storyRequirementIdPrefix2 } from '../lib/capital-id-path.js'
import { generateSlug, storyFileRelativePath, workspaceBasePath } from '../sync/layout.js'

import { resolveProjectMarker } from './resolve-base.js'
import { storyContentFormatFromCliOption } from './story-format.js'
import { buildDraftStoryFrontmatterAndBody } from './templates.js'

async function fileExistsAbs(abs: string): Promise<boolean> {
  try {
    await fs.access(abs)
    return true
  }
  catch {
    return false
  }
}

async function pickStoryDraftRelativePath(
  root: string,
  title: string,
  basePath: string,
  storyHash: string,
): Promise<string> {
  const primary = storyFileRelativePath(title, basePath, '', storyHash, undefined)
  const absPrimary = path.join(root, primary)
  if (!(await fileExistsAbs(absPrimary))) {
    return normalizeRelativePath(primary)
  }
  const slug = generateSlug(title) || 'requirement'
  const p2 = storyRequirementIdPrefix2('', storyHash)
  const dir = `${basePath.replace(/\\/g, '/')}/requirements`
  const alt = `${dir}/${p2}-${slug}-${storyHash.slice(0, 6)}.md`
  const absAlt = path.join(root, alt)
  if (!(await fileExistsAbs(absAlt))) {
    return normalizeRelativePath(alt)
  }
  throw new Error(`Не удалось подобрать свободное имя файла в «${dir}»`)
}

export interface RunCreateStoryOptions {
  readonly setSelf?: boolean
  /** markdown | mermaid | drawio | bpmn */
  readonly format?: string
}

export async function runCreateStory(
  root: string,
  cfg: BlagoConfigFile,
  basePathArg: string,
  title: string,
  options: RunCreateStoryOptions,
): Promise<{ relativePath: string }> {
  const coopCfg = resolveCoopname(cfg)
  if (!coopCfg) {
    throw new Error('Задайте coopname в config активной среды (или «blago init --coopname»)')
  }

  const index = await loadIndex(root)
  const { projectByHash } = await loadProjectMapsFromIndex(root, index)
  const marker = await resolveProjectMarker(root, basePathArg)
  const proj = projectByHash.get(marker.project_hash)
  if (!proj) {
    throw new Error(
      `Проект «${marker.project_hash}» не найден в индексе. Выполните «blago pull» и повторите create.`,
    )
  }

  let created_by: string | undefined
  if (options.setSelf) {
    const session = await loadSession(root, cfg.activeEnv)
    if (!session) {
      throw new Error(
        'Для --set-self нужна сохранённая сессия активной среды. Выполните «blago login».',
      )
    }
    created_by = session.username
  }

  const content_format = storyContentFormatFromCliOption(options.format ?? 'markdown')
  const storyHash = generateEntityHashHex64()
  const { data, body } = buildDraftStoryFrontmatterAndBody({
    title,
    story_hash: storyHash,
    project_hash: marker.project_hash,
    content_format,
    created_by,
  })

  const wsBase = workspaceBasePath(proj, projectByHash)
  const rel = await pickStoryDraftRelativePath(root, title, wsBase, storyHash)
  const abs = path.join(root, rel)
  await fs.mkdir(path.dirname(abs), { recursive: true })
  await fs.writeFile(abs, serializeBlagoMarkdown(data, body), 'utf8')

  const createdAt = new Date().toISOString()
  await appendPendingItem(root, {
    kind: 'story',
    entity_hash: storyHash,
    relative_path: rel,
    created_at: createdAt,
  })
  await appendPathsToStaging(root, [rel])
  return { relativePath: rel }
}
