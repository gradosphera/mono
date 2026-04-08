// Согласование blago env use с ~/.claude/config/blago/config.yaml (active_workspace_env).

import * as fs from 'node:fs'
import * as path from 'node:path'

import { warn } from '../ui/output.js'
import { refreshGlobalAgentMirrorAsync } from './agent-mirror.js'
import { readGlobalBlagoConfig, writeGlobalBlagoConfig } from './global-config.js'
import { type BlagoConfigFile, loadConfig, saveConfig } from './index.js'
import { configPath } from './paths.js'

export interface SyncWorkspaceEnvUseResult {
  /** Каталог рабочей копии, с которой дальше работает CLI (после смены global). */
  readonly effectiveRoot: string
  /** Обновлён ли global active_workspace_env под имя среды. */
  readonly globalSynced: boolean
}

/**
 * После `blago env use <name>`: при наличии глобального config и пути `workspaces[name]`
 * с готовым `.blago/config.json` — выставить `active_workspace_env`, выровнять `activeEnv`
 * в config.json этой копии, обновить зеркало coopname/username.
 */
export async function syncGlobalActiveWorkspaceAfterEnvUse(
  envName: string,
  currentRoot: string,
  nextCfg: BlagoConfigFile,
): Promise<SyncWorkspaceEnvUseResult> {
  const rootResolved = path.resolve(currentRoot)
  const global = await readGlobalBlagoConfig()
  if (!global) {
    await refreshGlobalAgentMirrorAsync(rootResolved, nextCfg)
    return { effectiveRoot: rootResolved, globalSynced: false }
  }

  const raw = global.workspaces[envName]
  const targetRoot = typeof raw === 'string' && raw.trim().length > 0
    ? path.resolve(raw.trim())
    : null

  const targetHasConfig = targetRoot !== null && fs.existsSync(configPath(targetRoot))

  if (!targetRoot || !targetHasConfig) {
    warn(
      `В глобальном config.yaml нет готовой копии для «${envName}» (workspaces.${envName}) — active_workspace_env не менялся.`,
    )
    await refreshGlobalAgentMirrorAsync(rootResolved, nextCfg)
    return { effectiveRoot: rootResolved, globalSynced: false }
  }

  if (targetRoot !== rootResolved) {
    const targetCfg = await loadConfig(targetRoot)
    if (targetCfg.activeEnv !== envName) {
      await saveConfig(targetRoot, { ...targetCfg, activeEnv: envName })
    }
  }

  await writeGlobalBlagoConfig({ ...global, active_workspace_env: envName })

  const mirrorCfg = await loadConfig(targetRoot)
  await refreshGlobalAgentMirrorAsync(targetRoot, mirrorCfg)

  return { effectiveRoot: targetRoot, globalSynced: true }
}
