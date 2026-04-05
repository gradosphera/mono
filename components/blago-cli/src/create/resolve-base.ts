// Поиск project.md / component.md относительно базового пути (архитектура §13.2).

import * as fs from 'node:fs/promises'
import * as path from 'node:path'

import { parseBlagoMarkdown } from '../format/index.js'
import { normalizeRelativePath } from '../sync/index-store.js'

async function fileExists(abs: string): Promise<boolean> {
  try {
    await fs.access(abs)
    return true
  }
  catch {
    return false
  }
}

export interface ResolvedProjectMarker {
  /** hash проекта/компонента из frontmarker. */
  readonly project_hash: string
  /** coopname из файла маркера (может быть пустым). */
  readonly coopnameFromFile: string
  /** Каталог с project.md или component.md, относительно корня копии. */
  readonly markerRelDir: string
}

export async function resolveProjectMarker(root: string, basePathInput: string): Promise<ResolvedProjectMarker> {
  const normalized = normalizeRelativePath(basePathInput)
  const absInput = path.resolve(root, normalized)
  const rootAbs = path.resolve(root)

  const stat = await fs.stat(absInput).catch(() => null)
  let searchDir = absInput
  if (stat?.isFile()) {
    const base = path.basename(absInput)
    if (base !== 'project.md' && base !== 'component.md') {
      throw new Error(
        `Ожидался каталог или файл project.md / component.md, получено: «${basePathInput}»`,
      )
    }
    searchDir = path.dirname(absInput)
  }
  else if (!stat?.isDirectory()) {
    throw new Error(`Путь не найден: «${basePathInput}»`)
  }

  if (
    !(path.resolve(searchDir) === rootAbs
      || path.resolve(searchDir).startsWith(rootAbs + path.sep))
  ) {
    throw new Error('Базовый путь должен быть внутри корня рабочей копии blago')
  }

  let current: string | null = searchDir
  for (let depth = 0; depth < 500 && current; depth += 1) {
    for (const name of ['component.md', 'project.md'] as const) {
      const f = path.join(current, name)
      if (await fileExists(f)) {
        const raw = await fs.readFile(f, 'utf8')
        const parsed = parseBlagoMarkdown(raw)
        if (parsed.type !== 'project') {
          continue
        }
        const project_hash = String(parsed.data.hash ?? '').trim()
        if (!project_hash) {
          throw new Error(`В «${path.relative(root, f)}» отсутствует hash проекта/компонента`)
        }
        const coopnameFromFile = String(parsed.data.coopname ?? '').trim()
        return {
          project_hash,
          coopnameFromFile,
          markerRelDir: normalizeRelativePath(path.relative(root, current)),
        }
      }
    }

    if (path.resolve(current) === rootAbs) {
      break
    }
    const parent = path.dirname(current)
    if (parent === current) {
      break
    }
    const parentRes = path.resolve(parent)
    if (!(parentRes === rootAbs || parentRes.startsWith(rootAbs + path.sep))) {
      break
    }
    current = parent
  }

  throw new Error(
    'Не найден project.md или component.md. Укажите каталог проекта/компонента или выполните «blago pull».',
  )
}
