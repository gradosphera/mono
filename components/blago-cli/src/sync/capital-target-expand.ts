// Разбор целей blago add/remove/restore/create: путь в копии или id из project.md / component.md / issue / story.

import type { Dirent } from 'node:fs'
import type { IndexFile } from './index-store.js'
import type { ProjectPathModel } from './layout.js'

import * as fs from 'node:fs/promises'

import * as path from 'node:path'
import { parseBlagoMarkdown } from '../format/index.js'
import { isBlagoSyncExcludedDirName } from './ignore.js'
import { normalizeRelativePath } from './index-store.js'
import { projectFileRelativePath, workspaceBasePath } from './layout.js'
import { loadProjectMapsFromIndex } from './project-index-map.js'

/** Путь к сущности в копии (содержит разделитель, .md и т.д.). */
export function isPathLikeBlagoTarget(t: string): boolean {
  const s = t.trim()
  if (s === '') {
    return true
  }
  if (s.includes('/') || s.includes('\\')) {
    return true
  }
  if (s.endsWith('.md')) {
    return true
  }
  if (s.startsWith('.')) {
    return true
  }
  return false
}

/** Только цифры — id проекта/компонента Capital (поле id в project.md / component.md). */
export function isBareProjectCapitalIdToken(t: string): boolean {
  return /^\d+$/.test(t.trim())
}

/** Формат «projectId-issueId» (оба целые) — одна задача по составному ключу. */
export function parseProjectIssueCompositeToken(t: string): { projectId: number, issueId: string } | null {
  const m = t.trim().match(/^(\d+)-(\d+)$/)
  if (!m) {
    return null
  }
  return { projectId: Number(m[1]), issueId: m[2] }
}

async function collectMarkdownFilesRecursive(absDir: string): Promise<string[]> {
  const out: string[] = []
  let entries: Dirent[]
  try {
    entries = await fs.readdir(absDir, { withFileTypes: true })
  }
  catch {
    return out
  }
  for (const e of entries) {
    const abs = path.join(absDir, e.name)
    if (e.isDirectory()) {
      if (isBlagoSyncExcludedDirName(e.name)) {
        continue
      }
      out.push(...(await collectMarkdownFilesRecursive(abs)))
    }
    else if (e.isFile() && e.name.endsWith('.md')) {
      out.push(abs)
    }
  }
  return out
}

function findProjectsByCapitalId(
  projectByHash: ReadonlyMap<string, ProjectPathModel>,
  idNum: number,
): ProjectPathModel[] {
  return [...projectByHash.values()].filter(p => p.capital_id === idNum)
}

/** resolveProjectMarker: проект/компонент по числовому id из индекса. */
export async function resolveProjectMarkerFromCapitalId(
  root: string,
  index: IndexFile,
  idStr: string,
): Promise<{
    project_hash: string
    coopnameFromFile: string
    markerRelDir: string
  }> {
  const idNum = Number(idStr.trim())
  if (!Number.isInteger(idNum) || idNum < 0) {
    throw new Error(`Некорректный id проекта/компонента: «${idStr}»`)
  }
  const { projectByHash } = await loadProjectMapsFromIndex(root, index)
  const matches = findProjectsByCapitalId(projectByHash, idNum)
  if (matches.length === 0) {
    throw new Error(
      `Проект/компонент с id «${idNum}» не найден в индексе. Выполните «blago pull» или укажите путь к project.md / component.md.`,
    )
  }
  if (matches.length > 1) {
    throw new Error(
      `Несколько сущностей с id «${idNum}» в индексе; укажите путь к каталогу с project.md / component.md.`,
    )
  }
  const proj = matches[0]
  const relFile = projectFileRelativePath(proj, projectByHash)
  const abs = path.join(root, relFile)
  const raw = await fs.readFile(abs, 'utf8')
  const parsed = parseBlagoMarkdown(raw)
  if (parsed.type !== 'project') {
    throw new Error(`Ожидался маркер проекта в «${relFile}»`)
  }
  const project_hash = String(parsed.data.hash ?? '').trim()
  if (!project_hash) {
    throw new Error(`В «${relFile}» отсутствует hash`)
  }
  const coopnameFromFile = String(parsed.data.coopname ?? '').trim()
  return {
    project_hash,
    coopnameFromFile,
    markerRelDir: normalizeRelativePath(path.dirname(relFile)),
  }
}

export async function markdownRelativePathsUnderProjectCapitalId(
  root: string,
  index: IndexFile,
  projectByHash: ReadonlyMap<string, ProjectPathModel>,
  idNum: number,
): Promise<string[]> {
  const matches = findProjectsByCapitalId(projectByHash, idNum)
  if (matches.length === 0) {
    throw new Error(
      `Проект/компонент с id «${idNum}» не найден в индексе. Выполните «blago pull».`,
    )
  }
  if (matches.length > 1) {
    throw new Error(
      `Несколько сущностей с id «${idNum}»; укажите путь к каталогу для add/remove.`,
    )
  }
  const proj = matches[0]
  const base = workspaceBasePath(proj, projectByHash)
  const abs = path.join(root, base)
  const files = await collectMarkdownFilesRecursive(abs)
  return files.map(f => normalizeRelativePath(path.relative(root, f))).sort()
}

function entityFrontmatterIdMatchesToken(expectedId: string, data: Record<string, unknown>): boolean {
  const idRaw = data.id
  if (idRaw === undefined || idRaw === null) {
    return false
  }
  const a = String(idRaw).trim()
  const b = expectedId.trim()
  if (a === b) {
    return true
  }
  const na = Number(a)
  const nb = Number(b)
  return Number.isFinite(na) && Number.isFinite(nb) && na === nb
}

/**
 * Все задачи (issue) и требования (story) из индекса, у которых во frontmatter поле id совпадает с токеном
 * (строка или оба конечные числа — как у projectId-issueId).
 */
export async function findIssueOrStoryRelativePathsByFrontmatterId(
  root: string,
  index: IndexFile,
  token: string,
): Promise<string[]> {
  const t = token.trim()
  if (t === '') {
    return []
  }
  const out: string[] = []
  for (const e of index.entries) {
    if (e.entity_type !== 'issue' && e.entity_type !== 'story') {
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
    let parsed: ReturnType<typeof parseBlagoMarkdown>
    try {
      parsed = parseBlagoMarkdown(raw)
    }
    catch {
      continue
    }
    if (e.entity_type === 'issue' && parsed.type !== 'issue') {
      continue
    }
    if (e.entity_type === 'story' && parsed.type !== 'story') {
      continue
    }
    if (entityFrontmatterIdMatchesToken(t, parsed.data)) {
      out.push(normalizeRelativePath(e.relative_path))
    }
  }
  return out
}

/** Относительный путь к .md задачи: project id + issue id (оба из frontmatter). */
export async function findIssueRelativePathByProjectAndIssueCapitalId(
  root: string,
  index: IndexFile,
  projectByHash: ReadonlyMap<string, ProjectPathModel>,
  projectCapitalId: number,
  issueId: string,
): Promise<string | null> {
  const projects = findProjectsByCapitalId(projectByHash, projectCapitalId)
  if (projects.length !== 1) {
    return null
  }
  const projectHash = projects[0].project_hash
  for (const e of index.entries) {
    if (e.entity_type !== 'issue') {
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
    let parsed: ReturnType<typeof parseBlagoMarkdown>
    try {
      parsed = parseBlagoMarkdown(raw)
    }
    catch {
      continue
    }
    if (parsed.type !== 'issue') {
      continue
    }
    const ph = String(parsed.data.project_hash ?? '').trim()
    if (ph !== projectHash) {
      continue
    }
    if (entityFrontmatterIdMatchesToken(issueId, parsed.data)) {
      return normalizeRelativePath(e.relative_path)
    }
  }
  return null
}

/**
 * Развернуть аргументы add/remove в список относительных путей.
 * Путь — как раньше; «12» — всё .md под workspace проекта 12;
 * уникальный id из frontmatter задачи или требования (562-16, UUID);
 * «12-34» — если ни одного файла с id «12-34», то проект Capital 12 / issue id 34 (как раньше).
 */
export async function expandBlagoUserTargetsToRelativePaths(
  root: string,
  targets: string[],
  index: IndexFile,
): Promise<string[]> {
  const { projectByHash } = await loadProjectMapsFromIndex(root, index)
  const out: string[] = []
  for (const t of targets) {
    const tr = t.trim()
    if (isPathLikeBlagoTarget(tr)) {
      out.push(normalizeRelativePath(tr))
      continue
    }
    if (isBareProjectCapitalIdToken(tr)) {
      const sub = await markdownRelativePathsUnderProjectCapitalId(root, index, projectByHash, Number(tr))
      out.push(...sub)
      continue
    }
    const byFrontmatterId = await findIssueOrStoryRelativePathsByFrontmatterId(root, index, tr)
    if (byFrontmatterId.length === 1) {
      out.push(byFrontmatterId[0])
      continue
    }
    if (byFrontmatterId.length > 1) {
      throw new Error(
        `Задача или требование с id «${tr}» неоднозначно: ${byFrontmatterId.length} файлов в индексе. Укажите относительный путь к нужному .md.`,
      )
    }
    const composite = parseProjectIssueCompositeToken(tr)
    if (composite) {
      const rel = await findIssueRelativePathByProjectAndIssueCapitalId(
        root,
        index,
        projectByHash,
        composite.projectId,
        composite.issueId,
      )
      if (!rel) {
        throw new Error(
          `Задача «${composite.projectId}-${composite.issueId}» не найдена в индексе или по полям id в .md.`,
        )
      }
      out.push(rel)
      continue
    }
    out.push(normalizeRelativePath(tr))
  }
  return out
}

/** Для restore: путь или id маркера / составной ключ задачи. */
export async function resolveRestoreUserPathToRelativeMarkdown(
  root: string,
  index: IndexFile,
  projectByHash: ReadonlyMap<string, ProjectPathModel>,
  userPath: string,
): Promise<string> {
  const tr = userPath.trim()
  if (isPathLikeBlagoTarget(tr)) {
    return normalizeRelativePath(tr)
  }
  if (isBareProjectCapitalIdToken(tr)) {
    const matches = findProjectsByCapitalId(projectByHash, Number(tr))
    if (matches.length !== 1) {
      throw new Error(
        matches.length === 0
          ? `Проект/компонент с id «${tr}» не найден в индексе.`
          : `Несколько сущностей с id «${tr}»; укажите путь к project.md / component.md.`,
      )
    }
    const rel = projectFileRelativePath(matches[0], projectByHash)
    return normalizeRelativePath(rel)
  }
  const byFrontmatterId = await findIssueOrStoryRelativePathsByFrontmatterId(root, index, tr)
  if (byFrontmatterId.length === 1) {
    return byFrontmatterId[0]
  }
  if (byFrontmatterId.length > 1) {
    throw new Error(
      `Задача или требование с id «${tr}» неоднозначно: ${byFrontmatterId.length} файлов в индексе. Укажите относительный путь к .md.`,
    )
  }
  const composite = parseProjectIssueCompositeToken(tr)
  if (composite) {
    const rel = await findIssueRelativePathByProjectAndIssueCapitalId(
      root,
      index,
      projectByHash,
      composite.projectId,
      composite.issueId,
    )
    if (!rel) {
      throw new Error(`Задача «${composite.projectId}-${composite.issueId}» не найдена.`)
    }
    return rel
  }
  return normalizeRelativePath(tr)
}
