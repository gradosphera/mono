// FR-010: отличие рабочих файлов от эталона в индексе (SHA256 + превью; не патч к серверу).

import * as fs from 'node:fs/promises'
import * as path from 'node:path'

import { sha256Hex } from '../lib/hash.js'
import { info } from '../ui/output.js'

import { loadIndex } from './index-store.js'
import { loadProjectMapsFromIndex } from './project-index-map.js'
import { suffixCapitalIdsForMarkdownPath } from './status-format.js'

const PREVIEW_LINES = 24

export async function runDiff(contentRoot: string, stateDir: string): Promise<void> {
  const index = await loadIndex(stateDir)
  const { projectByHash } = await loadProjectMapsFromIndex(contentRoot, index)
  let shown = false
  for (const e of index.entries) {
    const abs = path.join(contentRoot, e.relative_path)
    try {
      const raw = await fs.readFile(abs, 'utf8')
      const h = sha256Hex(raw)
      if (h === e.content_etag_local) {
        continue
      }
      shown = true
      const suf = await suffixCapitalIdsForMarkdownPath(contentRoot, e.relative_path, projectByHash)
      info(`${e.relative_path}${suf}  [${e.entity_type} ${e.entity_hash}]`)
      info(`  индекс sha256: ${e.content_etag_local}`)
      info(`  сейчас sha256:  ${h}`)
      const lines = raw.split('\n')
      info('  превью:')
      for (let i = 0; i < Math.min(PREVIEW_LINES, lines.length); i++) {
        info(`  | ${lines[i]}`)
      }
      if (lines.length > PREVIEW_LINES) {
        info(`  … ещё ${lines.length - PREVIEW_LINES} строк`)
      }
      info('')
    }
    catch {
      shown = true
      const suf = await suffixCapitalIdsForMarkdownPath(contentRoot, e.relative_path, projectByHash)
      info(`${e.relative_path}${suf} — файл отсутствует на диске [${e.entity_type} ${e.entity_hash}]`)
      info('')
    }
  }
  if (!shown) {
    info('Нет расхождений с индексом по содержимому.')
  }
}
