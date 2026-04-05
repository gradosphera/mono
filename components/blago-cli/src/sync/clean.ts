// Сброс копии: удалить верхнеуровневые каталоги проектов (всё от pull лежит внутри них) + обнулить index/staging.
// Не поднимаемся по дереву от файлов — только rm одного уровня под корнём копии. .blago не трогаем.

import * as fs from 'node:fs/promises'
import * as path from 'node:path'

import { loadIndex, normalizeRelativePath, saveIndex, saveStaging } from './index-store.js'

function isInsideRoot(rootAbs: string, absPath: string): boolean {
  const rel = path.relative(rootAbs, absPath)
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel))
}

/** Запись индекса: без «..», без абсолютного пути и NUL. */
function isSafeIndexRelativePath(rel: string): boolean {
  if (!rel || rel.includes('\0')) {
    return false
  }
  const posix = rel.replace(/\\/g, '/')
  if (posix.startsWith('/') || /^[a-z]:\//i.test(posix)) {
    return false
  }
  const segments = posix.split('/').filter(Boolean)
  return !segments.includes('..')
}

function assertCleanRootIsNotFilesystemRoot(rootAbs: string): void {
  const n = path.normalize(rootAbs)
  if (n === '/' || n === '\\') {
    throw new Error('blago clean: корень копии совпадает с корнем файловой системы — операция запрещена.')
  }
  if (process.platform === 'win32' && /^[a-z]:[\\/]?$/i.test(n)) {
    throw new Error('blago clean: корень копии — корень диска Windows — операция запрещена.')
  }
}

/**
 * По индексу собираем имена верхних каталогов (первый сегмент пути) и удаляем каждый целиком через fs.rm recursive.
 * Конфиг и сессии в .blago/ не затрагиваются.
 */
export async function runClean(root: string): Promise<void> {
  let rootAbs = path.resolve(root)
  try {
    rootAbs = await fs.realpath(rootAbs)
  }
  catch {
    /* каталога нет */
  }
  assertCleanRootIsNotFilesystemRoot(rootAbs)

  const index = await loadIndex(root)
  const topNames = new Set<string>()
  const blagoName = '.blago'

  for (const e of index.entries) {
    const rel = normalizeRelativePath(e.relative_path)
    if (!isSafeIndexRelativePath(rel)) {
      continue
    }
    const first = rel.split('/').filter(Boolean)[0]
    if (!first || first === blagoName || first === '.' || first === '..') {
      continue
    }
    topNames.add(first)
  }

  for (const name of topNames) {
    const target = path.join(rootAbs, name)
    if (!isInsideRoot(rootAbs, target)) {
      continue
    }
    const blagoDir = path.join(rootAbs, blagoName)
    if (target === blagoDir || target.startsWith(`${blagoDir}${path.sep}`)) {
      continue
    }
    try {
      await fs.rm(target, { recursive: true, force: true })
    }
    catch {
      /* нет или нет прав */
    }
  }

  await saveIndex(root, { entries: [] })
  await saveStaging(root, { paths: [] })
}
