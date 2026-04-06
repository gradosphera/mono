// Синхронное описание активной среды и сессии (для help Commander и «blago env»).

import type { BlagoConfigFile } from '../config/index.js'
import * as fs from 'node:fs'

import { configPath, findBlagoRoot, sessionPath } from '../config/paths.js'
import { resolveBlagoStartDir } from '../config/start-dir.js'

interface SessionFileShape {
  username?: string
}

function readJsonIfExists<T>(filePath: string): T | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(raw) as T
  }
  catch {
    return null
  }
}

export function readSessionUsernameSync(root: string, envName: string): string | null {
  const session = readJsonIfExists<SessionFileShape>(sessionPath(root, envName))
  const u = session?.username?.trim()
  return u && u.length > 0 ? u : null
}

/** Одна строка: активная среда и пользователь (или «вход не выполнен»). */
export function describeBlagoSessionLine(cfg: BlagoConfigFile, username: string | null): string {
  const envName = cfg.activeEnv
  const profile = cfg.environments[envName]
  const label = profile?.label?.trim()
  const envHuman = label ? `«${envName}» (${label})` : `«${envName}»`
  const userHuman = username
    ? `пользователь: ${username}`
    : 'вход не выполнен (blago login)'
  return `Сессия: среда ${envHuman}; ${userHuman}.`
}

/** Текст в конец blago --help и blago <cmd> --help (синхронно). */
export function formatBlagoSessionStatusHelpExtra(): string {
  const root = findBlagoRoot(resolveBlagoStartDir())
  if (!root) {
    return `

Копия blago не найдена: нет .blago/config.json вверх от базового каталога (--dir, иначе BLAGO_WORKSPACE, иначе cwd).`
  }

  const cfg = readJsonIfExists<BlagoConfigFile>(configPath(root))
  if (!cfg?.activeEnv || typeof cfg.environments !== 'object') {
    return `

Корень: ${root}
Файл .blago/config.json некорректен (нужны activeEnv и environments).`
  }

  const line = describeBlagoSessionLine(cfg, readSessionUsernameSync(root, cfg.activeEnv))
  return `

${line}`
}
