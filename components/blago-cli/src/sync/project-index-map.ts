// Карта проектов из индекса + файлов project.md / component.md (для layout после create).

import * as fs from 'node:fs/promises'
import * as path from 'node:path'

import { parseBlagoMarkdown } from '../format/index.js'

import type { IndexFile } from './index-store.js'
import type { ProjectPathModel } from './layout.js'

export interface ProjectRowLite {
  readonly title: string
  readonly parent_hash?: string | null
}

export async function loadProjectMapsFromIndex(
  root: string,
  index: IndexFile,
): Promise<{
  projectByHash: Map<string, ProjectPathModel>
  projectRowByHash: Map<string, ProjectRowLite>
}> {
  const projectByHash = new Map<string, ProjectPathModel>()
  const projectRowByHash = new Map<string, ProjectRowLite>()

  for (const e of index.entries) {
    if (e.entity_type !== 'project') {
      continue
    }
    const abs = path.join(root, e.relative_path)
    let raw: string
    try {
      raw = await fs.readFile(abs, 'utf8')
    }
    catch {
      continue
    }
    const parsed = parseBlagoMarkdown(raw)
    if (parsed.type !== 'project') {
      continue
    }
    const h = String(parsed.data.hash ?? '').trim()
    if (!h) {
      continue
    }
    const idRaw = parsed.data.id
    const capital_id
      = typeof idRaw === 'number' && Number.isFinite(idRaw)
        ? idRaw
        : Number(idRaw) || 0
    projectByHash.set(h, {
      project_hash: h,
      title: String(parsed.data.title ?? ''),
      parent_hash: parsed.data.parent_hash as string | null | undefined,
      capital_id,
    })
    projectRowByHash.set(h, {
      title: String(parsed.data.title ?? ''),
      parent_hash: parsed.data.parent_hash as string | null | undefined,
    })
  }

  return { projectByHash, projectRowByHash }
}
