// staging + список путей, у которых sha256 ≠ content_etag_local в индексе.

import * as fs from 'node:fs/promises'
import * as path from 'node:path'

import { sha256Hex } from '../lib/hash.js'
import { info } from '../ui/output.js'

import { loadIndex, loadStaging, normalizeRelativePath } from './index-store.js'

export async function runStatus(root: string): Promise<void> {
  const staging = await loadStaging(root)
  const index = await loadIndex(root)

  info('В индексе для отправки (staging):')
  if (staging.paths.length === 0) {
    info('  (пусто)')
  }
  else {
    for (const p of staging.paths) {
      info(`  + ${normalizeRelativePath(p)}`)
    }
  }

  info('Изменённые относительно последней синхронизации (по содержимому):')
  let any = false
  for (const e of index.entries) {
    const abs = path.join(root, e.relative_path)
    try {
      const raw = await fs.readFile(abs, 'utf8')
      const h = sha256Hex(raw)
      if (h !== e.content_etag_local) {
        info(`  M ${e.relative_path}  [${e.entity_type} ${e.entity_hash}]`)
        any = true
      }
    }
    catch {
      info(`  ? ${e.relative_path}  (файл отсутствует)`)
      any = true
    }
  }
  if (!any) {
    info('  (нет расхождений)')
  }
}
