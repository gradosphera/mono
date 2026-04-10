// Зеркало coopname / username в ~/.claude/config/blago/config.yaml для активной рабочей копии.

import * as path from 'node:path'

import { readSessionUsernameSync } from '../session/username-sync.js'
import {
  readGlobalBlagoConfig,
  readGlobalBlagoConfigSync,
  resolveActiveWorkspaceRoot,
  writeGlobalBlagoConfig,
  writeGlobalBlagoConfigSync,
  type BlagoGlobalConfigFile,
} from './global-config.js'
import { type BlagoConfigFile, resolveCoopname } from './index.js'

export function isActiveGlobalWorkspace(global: BlagoGlobalConfigFile, workspaceRoot: string): boolean {
  const active = resolveActiveWorkspaceRoot(global)
  return active !== null && path.resolve(workspaceRoot) === active
}

function computeMirroredGlobal(
  global: BlagoGlobalConfigFile,
  workspaceRoot: string,
  cfg: BlagoConfigFile,
): BlagoGlobalConfigFile | null {
  if (!isActiveGlobalWorkspace(global, workspaceRoot)) {
    return null
  }
  const usernameRaw = readSessionUsernameSync(workspaceRoot, cfg.activeEnv)
  const coopname = resolveCoopname(cfg) ?? ''
  const username = usernameRaw ?? ''
  if (global.coopname === coopname && global.username === username) {
    return null
  }
  return { ...global, coopname, username }
}

export async function refreshGlobalAgentMirrorAsync(
  workspaceRoot: string,
  cfg: BlagoConfigFile,
): Promise<void> {
  const global = await readGlobalBlagoConfig()
  if (!global) {
    return
  }
  const next = computeMirroredGlobal(global, workspaceRoot, cfg)
  if (next) {
    await writeGlobalBlagoConfig(next)
  }
}

export function refreshGlobalAgentMirrorSync(workspaceRoot: string, cfg: BlagoConfigFile): void {
  const global = readGlobalBlagoConfigSync()
  if (!global) {
    return
  }
  const next = computeMirroredGlobal(global, workspaceRoot, cfg)
  if (next) {
    writeGlobalBlagoConfigSync(next)
  }
}
