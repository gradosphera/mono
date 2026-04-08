// Синхронное описание активной среды и сессии (для help Commander и «blago env»).

import * as fs from 'node:fs'

import { refreshGlobalAgentMirrorSync } from '../config/agent-mirror.js'
import { resolveCoopname, type BlagoConfigFile } from '../config/index.js'
import { blagoDir, configPath, findBlagoRoot } from '../config/paths.js'
import { resolveBlagoStartDir } from '../config/start-dir.js'

import { readSessionUsernameSync } from './username-sync.js'

function readJsonIfExists<T>(filePath: string): T | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(raw) as T
  }
  catch {
    return null
  }
}

export { readSessionUsernameSync } from './username-sync.js'

/** Одна строка: активная среда, coopname, пользователь (или «вход не выполнен»). */
export function describeBlagoSessionLine(
  cfg: BlagoConfigFile,
  username: string | null,
  coopname?: string | undefined,
): string {
  const envName = cfg.activeEnv
  const profile = cfg.environments[envName]
  const label = profile?.label?.trim()
  const envHuman = label ? `«${envName}» (${label})` : `«${envName}»`
  const coop = coopname?.trim()
  const coopHuman = coop ? `кооператив: ${coop}; ` : ''
  const userHuman = username
    ? `пользователь: ${username}`
    : 'вход не выполнен (blago login)'
  return `Сессия: среда ${envHuman}; ${coopHuman}${userHuman}.`
}

/** Текст в конец blago --help и blago <cmd> --help (синхронно). */
export function formatBlagoSessionStatusHelpExtra(): string {
  const root = findBlagoRoot(resolveBlagoStartDir())
  if (!root) {
    return `

Копия blago не найдена: нет .blago/config.json вверх от базового каталога (активная копия из ~/.claude/config/blago/config.yaml при готовой .blago, иначе cwd).`
  }

  const cfg = readJsonIfExists<BlagoConfigFile>(configPath(root))
  if (!cfg?.activeEnv || typeof cfg.environments !== 'object') {
    return `

Корень: ${root}
Файл .blago/config.json некорректен (нужны activeEnv и environments).`
  }

  refreshGlobalAgentMirrorSync(root, cfg)
  const coop = resolveCoopname(cfg)
  const line = describeBlagoSessionLine(
    cfg,
    readSessionUsernameSync(root, cfg.activeEnv),
    coop,
  )
  return `

Рабочая копия: ${root}
Метаданные и сессии: ${blagoDir(root)}
${line}`
}
