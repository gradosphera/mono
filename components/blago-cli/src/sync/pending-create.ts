// Очередь локально созданных сущностей до первого push (FR-016).

import * as fs from 'node:fs/promises'

import { pendingCreatePath } from '../config/paths.js'

import type { BlagoEntityType } from './index-store.js'
import { normalizeRelativePath } from './index-store.js'

export type PendingCreateKind = 'issue' | 'story'

export interface PendingCreateItem {
  readonly kind: PendingCreateKind
  /** Для issue — временный hash в frontmatter до ответа API; для story — тот же story_hash, что уйдёт в CreateStory. */
  readonly entity_hash: string
  readonly relative_path: string
  readonly created_at: string
}

export interface PendingCreateFile {
  items: PendingCreateItem[]
}

export async function loadPendingCreate(root: string): Promise<PendingCreateFile> {
  try {
    const raw = await fs.readFile(pendingCreatePath(root), 'utf8')
    const parsed = JSON.parse(raw) as PendingCreateFile
    if (!Array.isArray(parsed.items)) {
      return { items: [] }
    }
    return parsed
  }
  catch {
    return { items: [] }
  }
}

export async function savePendingCreate(root: string, data: PendingCreateFile): Promise<void> {
  await fs.writeFile(pendingCreatePath(root), `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

export function findPendingItem(
  data: PendingCreateFile,
  kind: PendingCreateKind,
  entityHash: string,
): PendingCreateItem | undefined {
  return data.items.find(
    i => i.kind === kind && i.entity_hash === entityHash,
  )
}

export async function appendPendingItem(root: string, item: PendingCreateItem): Promise<void> {
  const data = await loadPendingCreate(root)
  if (findPendingItem(data, item.kind, item.entity_hash)) {
    throw new Error(`Запись pending-create уже есть: ${item.kind} ${item.entity_hash}`)
  }
  const rel = normalizeRelativePath(item.relative_path)
  if (data.items.some(i => normalizeRelativePath(i.relative_path) === rel)) {
    throw new Error(`Файл уже в pending-create: ${rel}`)
  }
  data.items.push(item)
  await savePendingCreate(root, data)
}

export async function removePendingItem(
  root: string,
  kind: PendingCreateKind,
  entityHash: string,
): Promise<void> {
  const data = await loadPendingCreate(root)
  const next = data.items.filter(i => !(i.kind === kind && i.entity_hash === entityHash))
  if (next.length === data.items.length) {
    throw new Error(`Не найдена запись pending-create: ${kind} ${entityHash}`)
  }
  await savePendingCreate(root, { items: next })
}

/** Соответствие типа сущности и kind в pending. */
export function pendingKindForEntityType(type: BlagoEntityType): PendingCreateKind | undefined {
  if (type === 'issue' || type === 'story') {
    return type
  }
  return undefined
}
