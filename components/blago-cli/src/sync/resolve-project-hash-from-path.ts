// Определить hash проекта/компонента Capital по пути к файлу под деревом blago.

import * as fs from 'node:fs/promises'
import * as path from 'node:path'

import { parseBlagoMarkdown } from '../format/index.js'

async function readUtf8IfExists(abs: string): Promise<string | null> {
  try {
    return await fs.readFile(abs, 'utf8')
  }
  catch {
    return null
  }
}

export interface ResolvedProjectMarker {
  readonly hash: string
  readonly title: string
}

/** Ищем ближайший `project.md` / `component.md` вверх от каталога файла. */
export async function resolveProjectMarkerFromRelativePath(
  root: string,
  fileRel: string,
): Promise<ResolvedProjectMarker | null> {
  let dir = path.dirname(fileRel)
  for (let depth = 0; depth < 500; depth += 1) {
    for (const name of ['component.md', 'project.md'] as const) {
      const candidateRel = path.join(dir, name)
      const abs = path.join(root, candidateRel)
      const raw = await readUtf8IfExists(abs)
      if (!raw) {
        continue
      }
      const parsed = parseBlagoMarkdown(raw)
      if (parsed.type !== 'project') {
        continue
      }
      const h = String(parsed.data.hash ?? '').trim()
      if (h) {
        const title = String(parsed.data.title ?? '').trim() || 'unnamed'
        return { hash: h, title }
      }
    }
    const parent = path.dirname(dir)
    if (parent === dir) {
      return null
    }
    dir = parent
  }
  return null
}

export async function resolveProjectHashFromRelativePath(root: string, fileRel: string): Promise<string | null> {
  const m = await resolveProjectMarkerFromRelativePath(root, fileRel)
  return m?.hash ?? null
}
