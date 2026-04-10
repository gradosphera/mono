// Подписи путей в status/diff: id из frontmatter и составной ключ задачи.

import type { ProjectPathModel } from './layout.js'
import * as fs from 'node:fs/promises'

import * as path from 'node:path'

import { parseBlagoMarkdown } from '../format/index.js'

/** Строка в скобках для вывода рядом с путём; пустая если не удалось прочитать. */
export async function suffixCapitalIdsForMarkdownPath(
  root: string,
  rel: string,
  projectByHash: ReadonlyMap<string, ProjectPathModel>,
): Promise<string> {
  try {
    const raw = await fs.readFile(path.join(root, rel), 'utf8')
    const p = parseBlagoMarkdown(raw)
    if (p.type === 'project') {
      const id = p.data.id
      if (id !== undefined && id !== null && String(id).trim() !== '') {
        return ` [id=${String(id)}]`
      }
      return ''
    }
    if (p.type === 'issue') {
      const iidRaw = p.data.id
      const iid = iidRaw !== undefined && iidRaw !== null ? String(iidRaw).trim() : ''
      const ph = String(p.data.project_hash ?? '').trim()
      const proj = ph ? projectByHash.get(ph) : undefined
      const pid = proj !== undefined ? String(proj.capital_id) : ''
      if (pid !== '' && iid !== '' && /^\d+$/.test(iid)) {
        return ` [${pid}-${iid}]`
      }
      if (iid !== '') {
        return ` [issue id=${iid}]`
      }
      return ''
    }
    if (p.type === 'story') {
      const sid = p.data.id
      if (sid !== undefined && sid !== null && String(sid).trim() !== '') {
        return ` [story id=${String(sid)}]`
      }
      const ph = String(p.data.project_hash ?? '').trim()
      const proj = ph ? projectByHash.get(ph) : undefined
      if (proj !== undefined) {
        return ` [project id=${proj.capital_id} req]`
      }
      return ' [story]'
    }
  }
  catch {
    return ''
  }
  return ''
}
