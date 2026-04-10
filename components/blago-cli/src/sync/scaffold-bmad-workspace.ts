// После pull: в каждом workspace Capital (каталог project.md / component.md) при отсутствии
// шаблонов копируются ai/bmad/{_bmad,_bmad-output,docs} из пакета (.claude/.cursor не трогаем).

import * as fs from 'node:fs/promises'
import * as path from 'node:path'

import { bundledAiDir } from '../ai-bundled-dir.js'
import { readGlobalBlagoConfig } from '../config/global-config.js'
import type { AuthenticatedContext } from '../session/index.js'
import { info, warn } from '../ui/output.js'
import {
  projectFileRelativePath,
  type ProjectPathModel,
} from './layout.js'

const BMAD_MARKER_REL_PARTS = ['_bmad', '_config', 'bmad-help.csv'] as const

function bundledBmadPackageRoot(): string {
  return path.join(bundledAiDir(), 'bmad')
}

async function pathExists(abs: string): Promise<boolean> {
  try {
    await fs.access(abs)
    return true
  }
  catch {
    return false
  }
}

function cpExcludeJunk(source: string): boolean {
  const base = path.basename(source)
  return base !== '.DS_Store' && !base.startsWith('._')
}

async function copyDirFiltered(src: string, dest: string): Promise<void> {
  await fs.cp(src, dest, {
    recursive: true,
    filter: (s) => cpExcludeJunk(s),
  })
}

function yamlScalarForUserName(userName: string): string {
  if (userName.length === 0) {
    return 'BMad'
  }
  if (/^[\w.-]+$/.test(userName)) {
    return userName
  }
  const escaped = userName.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  return `"${escaped}"`
}

function replaceUserNameLine(content: string, userName: string): string {
  const scalar = yamlScalarForUserName(userName)
  return content.replace(/^user_name:\s*.+$/m, `user_name: ${scalar}`)
}

const BMAD_CONFIG_RELS_WITH_USER_NAME = [
  path.join('core', 'config.yaml'),
  path.join('bmm', 'config.yaml'),
  path.join('bmb', 'config.yaml'),
] as const

async function patchBmadUserName(workspaceAbs: string, userName: string): Promise<void> {
  const bmadRoot = path.join(workspaceAbs, '_bmad')
  for (const rel of BMAD_CONFIG_RELS_WITH_USER_NAME) {
    const filePath = path.join(bmadRoot, rel)
    if (!(await pathExists(filePath))) {
      continue
    }
    const raw = await fs.readFile(filePath, 'utf8')
    if (!/^user_name:/m.test(raw)) {
      continue
    }
    await fs.writeFile(filePath, replaceUserNameLine(raw, userName), 'utf8')
  }
}

function resolveUserNameForScaffold(globalUser: string | undefined, sessionUser: string | undefined): string {
  const g = globalUser?.trim() ?? ''
  if (g.length > 0) {
    return g
  }
  const s = sessionUser?.trim() ?? ''
  if (s.length > 0) {
    return s
  }
  return 'BMad'
}

/**
 * Для каждого уникального workspace (родитель project.md / component.md): при отсутствии
 * `_bmad/_config/bmad-help.csv` копирует шаблон `_bmad` и подставляет `user_name` в module config.yaml.
 * Каталоги `_bmad-output` и `docs` создаются, если отсутствуют (копия из шаблона или пустая папка).
 */
export async function scaffoldBmadWorkspacesAfterPull(
  ctx: AuthenticatedContext,
  allProjects: ReadonlyArray<{ project_hash: string }>,
  projectByHash: ReadonlyMap<string, ProjectPathModel>,
): Promise<void> {
  const pkgRoot = bundledBmadPackageRoot()
  const templateBmad = path.join(pkgRoot, '_bmad')
  const templateOutput = path.join(pkgRoot, '_bmad-output')
  const templateDocs = path.join(pkgRoot, 'docs')
  const templateMarker = path.join(templateBmad, ...BMAD_MARKER_REL_PARTS.slice(1))

  if (!(await pathExists(templateMarker))) {
    warn('В пакете blago-cli нет шаблона ai/bmad/_bmad/_config/bmad-help.csv — scaffold BMAD пропущен.')
    return
  }

  const globalCfg = await readGlobalBlagoConfig()
  const userName = resolveUserNameForScaffold(globalCfg?.username, ctx.session.username)

  const seen = new Set<string>()
  let bmadCreated = 0

  for (const p of allProjects) {
    const model = projectByHash.get(p.project_hash)
    if (!model) {
      continue
    }
    const rel = path.dirname(projectFileRelativePath(model, projectByHash))
    if (seen.has(rel)) {
      continue
    }
    seen.add(rel)

    const workspaceAbs = path.join(ctx.root, rel)
    const markerAbs = path.join(workspaceAbs, ...BMAD_MARKER_REL_PARTS)

    if (!(await pathExists(markerAbs))) {
      const partialBmad = path.join(workspaceAbs, '_bmad')
      if (await pathExists(partialBmad)) {
        warn(`BMAD: в «${rel}» есть _bmad без _config/bmad-help.csv — не перезаписываю.`)
      }
      else {
        await fs.mkdir(workspaceAbs, { recursive: true })
        await copyDirFiltered(templateBmad, partialBmad)
        await patchBmadUserName(workspaceAbs, userName)
        bmadCreated += 1
      }
    }

    const outDir = path.join(workspaceAbs, '_bmad-output')
    if (!(await pathExists(outDir))) {
      if (await pathExists(templateOutput)) {
        await copyDirFiltered(templateOutput, outDir)
      }
      else {
        await fs.mkdir(outDir, { recursive: true })
      }
    }

    const docsDir = path.join(workspaceAbs, 'docs')
    if (!(await pathExists(docsDir))) {
      if (await pathExists(templateDocs)) {
        await copyDirFiltered(templateDocs, docsDir)
      }
      else {
        await fs.mkdir(docsDir, { recursive: true })
      }
    }
  }

  if (bmadCreated > 0) {
    info(
      `BMAD: добавлены шаблоны _bmad в ${bmadCreated} workspace (user_name=${userName}); при отсутствии созданы _bmad-output и docs.`,
    )
  }
}
