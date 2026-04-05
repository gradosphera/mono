// pull: SDK → файлы; индекс по hash; смена slug → перенос (FR-014).

import type { AuthenticatedContext } from '../session/index.js'
import type { BlagoEntityType, IndexFile } from './index-store.js'

import * as fs from 'node:fs/promises'
import * as path from 'node:path'

import { Queries } from '@coopenomics/sdk'

import { type BlagoConfigFile, resolveCoopname } from '../config/index.js'
import {
  issueToFrontmatterAndBody,
  issueWorkspaceTitlesFromProjects,
  projectToFrontmatterAndBody,
  serializeBlagoMarkdown,
  storyToFrontmatterAndBody,
} from '../format/index.js'
import { sha256Hex } from '../lib/hash.js'

import { warn } from '../ui/output.js'
import { findByHash, loadIndex, normalizeRelativePath, saveIndex, upsertEntry } from './index-store.js'
import {
  generateSlug,
  issueFileRelativePath,
  projectFileRelativePath,
  type ProjectPathModel,
  storyFileRelativePath,
  workspaceBasePath,
} from './layout.js'

interface CapitalProjectRow {
  id?: number | null
  project_hash: string
  title?: string | null
  description?: string | null
  coopname: string
  parent_hash?: string | null
  parent_title?: string | null
  status?: string | null
  created_at?: Date | string | null
  _updated_at?: Date | string | null
  components?: CapitalProjectRow[] | null
}

interface CapitalIssueRow {
  id?: string | null
  issue_hash: string
  title: string
  description?: string | null
  project_hash: string
  cycle_id?: string | null
  status?: string | null
  priority?: string | null
  estimate?: number | null
  created_by?: string | null
  submaster?: string | null
  creators?: string[] | null
  metadata?: unknown
  sort_order?: number | null
  _created_at?: Date | string | null
  _updated_at?: Date | string | null
}

interface CapitalStoryRow {
  _id?: string | null
  story_hash: string
  title: string
  description?: string | null
  content_format?: string | null
  status?: string | null
  created_by?: string | null
  sort_order?: number | null
  project_hash?: string | null
  issue_hash?: string | null
  _created_at?: Date | string | null
  _updated_at?: Date | string | null
}

function flattenProjects(roots: CapitalProjectRow[]): CapitalProjectRow[] {
  const out: CapitalProjectRow[] = []
  const walk = (p: CapitalProjectRow): void => {
    out.push(p)
    for (const c of p.components ?? []) {
      walk(c)
    }
  }
  for (const r of roots) {
    walk(r)
  }
  return out
}

function toUpdatedIso(v: Date | string | null | undefined): string {
  if (v === undefined || v === null) {
    return ''
  }
  if (v instanceof Date) {
    return v.toISOString()
  }
  return new Date(v).toISOString()
}

function asProjectPathModel(p: CapitalProjectRow): ProjectPathModel {
  const n = p.id
  const capital_id = typeof n === 'number' && Number.isFinite(n) ? n : 0
  return {
    project_hash: p.project_hash,
    title: p.title ?? '',
    parent_hash: p.parent_hash,
    capital_id,
  }
}

async function ensureDirForFile(absFile: string): Promise<void> {
  await fs.mkdir(path.dirname(absFile), { recursive: true })
}

async function fileExists(abs: string): Promise<boolean> {
  try {
    await fs.access(abs)
    return true
  }
  catch {
    return false
  }
}

async function readFileIfExists(abs: string): Promise<string | null> {
  try {
    return await fs.readFile(abs, 'utf8')
  }
  catch {
    return null
  }
}

// Один файл сущности: новый путь с сервера vs индекс; «грязный» локально → не затирать без явного сценария.
async function syncEntityFile(params: {
  root: string
  index: IndexFile
  entityType: BlagoEntityType
  entityHash: string
  relativePath: string
  content: string
  remoteUpdatedAt: string
  label: string
}): Promise<void> {
  const { root, index, entityType, entityHash, relativePath, content, remoteUpdatedAt, label } = params
  const rel = normalizeRelativePath(relativePath)
  const absNew = path.join(root, rel)
  const prev = findByHash(index, entityType, entityHash)

  if (!prev) {
    await ensureDirForFile(absNew)
    await fs.writeFile(absNew, content, 'utf8')
    const etag = sha256Hex(await fs.readFile(absNew, 'utf8'))
    upsertEntry(index, {
      entity_type: entityType,
      entity_hash: entityHash,
      relative_path: rel,
      remote_updated_at: remoteUpdatedAt,
      content_etag_local: etag,
    })
    return
  }

  const absOld = path.join(root, prev.relative_path)

  if (prev.relative_path !== rel) {
    const oldContent = await readFileIfExists(absOld)
    const dirty
      = oldContent !== null && oldContent !== undefined && sha256Hex(oldContent) !== prev.content_etag_local

    if (dirty) {
      await ensureDirForFile(absNew)
      if (await fileExists(absOld)) {
        await fs.rename(absOld, absNew)
      }
      else {
        await fs.writeFile(absNew, content, 'utf8')
      }
      upsertEntry(index, {
        entity_type: entityType,
        entity_hash: entityHash,
        relative_path: rel,
        remote_updated_at: remoteUpdatedAt,
        content_etag_local: sha256Hex((await readFileIfExists(absNew)) ?? ''),
      })
      warn(
        `Переименование на сервере: ${label} перенесён на «${rel}» с сохранением локальных правок; проверьте frontmatter (title / updated_at).`,
      )
      return
    }

    await ensureDirForFile(absNew)
    await fs.writeFile(absNew, content, 'utf8')
    if ((await fileExists(absOld)) && path.resolve(absOld) !== path.resolve(absNew)) {
      await fs.unlink(absOld)
    }
    const etagAfterRename = sha256Hex(await fs.readFile(absNew, 'utf8'))
    upsertEntry(index, {
      entity_type: entityType,
      entity_hash: entityHash,
      relative_path: rel,
      remote_updated_at: remoteUpdatedAt,
      content_etag_local: etagAfterRename,
    })
    return
  }

  const current = await readFileIfExists(absNew)
  const dirty
    = current !== null && current !== undefined && sha256Hex(current) !== prev.content_etag_local
  if (dirty && remoteUpdatedAt !== prev.remote_updated_at) {
    warn(
      `Пропуск перезаписи ${label}: есть локальные правки, на сервере новая версия. Смержите вручную или откатите файл, затем снова «blago pull».`,
    )
    return
  }

  await ensureDirForFile(absNew)
  await fs.writeFile(absNew, content, 'utf8')
  const etagOnDisk = sha256Hex(await fs.readFile(absNew, 'utf8'))
  upsertEntry(index, {
    entity_type: entityType,
    entity_hash: entityHash,
    relative_path: rel,
    remote_updated_at: remoteUpdatedAt,
    content_etag_local: etagOnDisk,
  })
}

function requireCoopname(cfg: BlagoConfigFile): string {
  const c = resolveCoopname(cfg)
  if (!c) {
    throw new Error(
      'Укажите coopname в .blago/config.json в environments.<активнаяСреда> (или запасной «coopname» сверху), либо: blago init --coopname <имя>',
    )
  }
  return c
}

export async function runPull(ctx: AuthenticatedContext): Promise<void> {
  const coopname = requireCoopname(ctx.config)
  const index = await loadIndex(ctx.root)
  const projectByHash = new Map<string, ProjectPathModel>()

  const allProjects: CapitalProjectRow[] = []
  const seen = new Set<string>()
  let page = 1
  for (;;) {
    const { [Queries.Capital.GetProjects.name]: pageResult } = await ctx.client.Query(
      Queries.Capital.GetProjects.query,
      {
        variables: {
          filter: { coopname },
          options: { limit: 100, page, sortOrder: 'DESC' },
        },
      },
    )
    const chunk = pageResult.items as CapitalProjectRow[]
    for (const item of chunk) {
      for (const p of flattenProjects([item])) {
        if (!seen.has(p.project_hash)) {
          seen.add(p.project_hash)
          allProjects.push(p)
        }
      }
    }
    if (page >= pageResult.totalPages) {
      break
    }
    page += 1
  }

  page = 1
  for (;;) {
    const { [Queries.Capital.GetProjects.name]: pageResult } = await ctx.client.Query(
      Queries.Capital.GetProjects.query,
      {
        variables: {
          filter: { coopname, is_component: true },
          options: { limit: 100, page, sortOrder: 'DESC' },
        },
      },
    )
    const chunk = pageResult.items as CapitalProjectRow[]
    for (const item of chunk) {
      for (const p of flattenProjects([item])) {
        if (!seen.has(p.project_hash)) {
          seen.add(p.project_hash)
          allProjects.push(p)
        }
      }
    }
    if (page >= pageResult.totalPages) {
      break
    }
    page += 1
  }

  for (const p of allProjects) {
    projectByHash.set(p.project_hash, asProjectPathModel(p))
  }

  const projectRowByHash = new Map<string, CapitalProjectRow>()
  for (const p of allProjects) {
    projectRowByHash.set(p.project_hash, p)
  }

  for (const p of allProjects) {
    const { data, body } = projectToFrontmatterAndBody(p)
    const content = serializeBlagoMarkdown(data, body)
    const rel = projectFileRelativePath(asProjectPathModel(p), projectByHash)
    await syncEntityFile({
      root: ctx.root,
      index,
      entityType: 'project',
      entityHash: p.project_hash,
      relativePath: rel,
      content,
      remoteUpdatedAt: toUpdatedIso(p._updated_at),
      label: `проект ${p.project_hash}`,
    })
  }

  const issues: CapitalIssueRow[] = []
  page = 1
  for (;;) {
    const { [Queries.Capital.GetIssues.name]: pageResult } = await ctx.client.Query(
      Queries.Capital.GetIssues.query,
      {
        variables: {
          filter: { coopname },
          options: { limit: 200, page, sortOrder: 'DESC' },
        },
      },
    )
    const chunk = pageResult.items as CapitalIssueRow[]
    issues.push(...chunk)
    if (page >= pageResult.totalPages) {
      break
    }
    page += 1
  }

  const issueByHash = new Map<string, CapitalIssueRow>()
  for (const i of issues) {
    issueByHash.set(i.issue_hash, i)
  }

  for (const i of issues) {
    const proj = projectByHash.get(i.project_hash)
    if (!proj) {
      warn(`Задача ${i.issue_hash}: проект ${i.project_hash} не найден в выборке, пропуск`)
      continue
    }
    const basePath = workspaceBasePath(proj, projectByHash)
    const issueCapitalId = i.id !== undefined && i.id !== null && String(i.id).trim() !== '' ? String(i.id) : i.issue_hash
    const rel = issueFileRelativePath(i.title, basePath, issueCapitalId)
    const workspace = issueWorkspaceTitlesFromProjects(i.project_hash, projectRowByHash)
    const { data, body } = issueToFrontmatterAndBody(i, workspace)
    const content = serializeBlagoMarkdown(data, body)
    await syncEntityFile({
      root: ctx.root,
      index,
      entityType: 'issue',
      entityHash: i.issue_hash,
      relativePath: rel,
      content,
      remoteUpdatedAt: toUpdatedIso(i._updated_at),
      label: `задача ${i.issue_hash}`,
    })
  }

  const stories: CapitalStoryRow[] = []
  page = 1
  for (;;) {
    const { [Queries.Capital.GetStories.name]: pageResult } = await ctx.client.Query(
      Queries.Capital.GetStories.query,
      {
        variables: {
          filter: {
            coopname,
            show_issues_requirements: true,
            show_components_requirements: true,
          },
          options: { limit: 200, page, sortOrder: 'DESC' },
        },
      },
    )
    const chunk = pageResult.items as CapitalStoryRow[]
    stories.push(...chunk)
    if (page >= pageResult.totalPages) {
      break
    }
    page += 1
  }

  for (const s of stories) {
    if (!s.project_hash) {
      warn(`Требование ${s.story_hash}: нет project_hash, пропуск`)
      continue
    }
    const proj = projectByHash.get(s.project_hash)
    if (!proj) {
      warn(`Требование ${s.story_hash}: проект ${s.project_hash} не найден, пропуск`)
      continue
    }
    const basePath = workspaceBasePath(proj, projectByHash)
    let issueArg: { id: string, titleSlug: string } | undefined
    if (s.issue_hash) {
      const iss = issueByHash.get(s.issue_hash)
      if (iss) {
        const issueId = iss.id !== undefined && iss.id !== null && String(iss.id).trim() !== '' ? String(iss.id) : iss.issue_hash
        issueArg = {
          id: issueId,
          titleSlug: generateSlug(iss.title) || 'issue',
        }
      }
    }
    const storyRecordId
      = s._id !== undefined && s._id !== null && String(s._id).trim() !== '' ? String(s._id) : s.story_hash
    const rel = storyFileRelativePath(s.title, basePath, storyRecordId, s.story_hash, issueArg)
    const { data, body } = storyToFrontmatterAndBody(s)
    const content = serializeBlagoMarkdown(data, body)
    await syncEntityFile({
      root: ctx.root,
      index,
      entityType: 'story',
      entityHash: s.story_hash,
      relativePath: rel,
      content,
      remoteUpdatedAt: toUpdatedIso(s._updated_at),
      label: `требование ${s.story_hash}`,
    })
  }

  await saveIndex(ctx.root, index)
}
