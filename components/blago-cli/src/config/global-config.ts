// Глобальный конфиг для агентов: ~/.claude/config/blago/config.yaml

import * as fsSync from 'node:fs'
import * as fs from 'node:fs/promises'
import * as os from 'node:os'
import * as path from 'node:path'

import YAML from 'yaml'

export const GLOBAL_CONFIG_REL_PARTS = ['.claude', 'config', 'blago'] as const
export const GLOBAL_CONFIG_FILENAME = 'config.yaml'
/** Копия из пакета; лежит рядом с config.yaml (как у BMAD: config и helpers в одном каталоге). */
export const GLOBAL_HELPERS_FILENAME = 'helpers.md'
/** Подкаталог в `globalBlagoConfigDir()`: шаблоны документов (копия из пакета `ai/templates/`). */
export const GLOBAL_TEMPLATES_SUBDIR = 'templates'

const CONFIG_VERSION = 1 as const

export interface BlagoGlobalConfigFile {
  readonly version: typeof CONFIG_VERSION
  /** Абсолютный путь: родитель каталогов dev / testnet / production. */
  workspace_base: string
  /**
   * Имя подкаталога под workspace_base (и ключ в workspaces), с которым по умолчанию работает агент.
   * Совпадает с именем «физической» копии; API-профиль в .blago/config.json этой копии обычно тот же.
   */
  active_workspace_env: string
  /** Абсолютные пути рабочих копий синхронизации. */
  workspaces: Record<string, string>
  /**
   * Зеркало resolveCoopname(локальный config) для активной рабочей копии — для агентов без чтения .blago/config.json.
   */
  coopname: string
  /**
   * Зеркало username из сессии активной среды; пусто если вход не выполнен.
   */
  username: string
}

export function globalBlagoConfigDir(): string {
  return path.join(os.homedir(), ...GLOBAL_CONFIG_REL_PARTS)
}

export function globalBlagoConfigPath(): string {
  return path.join(globalBlagoConfigDir(), GLOBAL_CONFIG_FILENAME)
}

export function globalBlagoHelpersPath(): string {
  return path.join(globalBlagoConfigDir(), GLOBAL_HELPERS_FILENAME)
}

export function globalBlagoTemplatesDir(): string {
  return path.join(globalBlagoConfigDir(), GLOBAL_TEMPLATES_SUBDIR)
}

export function defaultBlagoHomeDataRoot(): string {
  return path.join(os.homedir(), 'blago')
}

const STANDARD_WORKSPACE_NAMES = ['dev', 'testnet', 'production'] as const

export function defaultWorkspacePaths(workspaceBase: string): Record<string, string> {
  const base = path.resolve(workspaceBase)
  return Object.fromEntries(
    STANDARD_WORKSPACE_NAMES.map(name => [name, path.join(base, name)]),
  ) as Record<string, string>
}

export function buildDefaultGlobalConfig(workspaceBase?: string): BlagoGlobalConfigFile {
  const resolvedBase = path.resolve(workspaceBase ?? defaultBlagoHomeDataRoot())
  return {
    version: CONFIG_VERSION,
    workspace_base: resolvedBase,
    active_workspace_env: 'dev',
    workspaces: defaultWorkspacePaths(resolvedBase),
    coopname: '',
    username: '',
  }
}

function normalizeGlobalParsed(parsed: Partial<BlagoGlobalConfigFile> | null): BlagoGlobalConfigFile | null {
  if (!parsed || typeof parsed !== 'object') {
    return null
  }
  if (parsed.version !== CONFIG_VERSION) {
    return null
  }
  if (
    typeof parsed.workspace_base !== 'string'
    || typeof parsed.active_workspace_env !== 'string'
    || typeof parsed.workspaces !== 'object'
    || parsed.workspaces === null
  ) {
    return null
  }
  const coopname = typeof parsed.coopname === 'string' ? parsed.coopname : ''
  const username = typeof parsed.username === 'string' ? parsed.username : ''
  return {
    version: CONFIG_VERSION,
    workspace_base: parsed.workspace_base,
    active_workspace_env: parsed.active_workspace_env,
    workspaces: parsed.workspaces as Record<string, string>,
    coopname,
    username,
  }
}

function parseGlobalYamlText(raw: string): BlagoGlobalConfigFile | null {
  const parsed = YAML.parse(raw) as Partial<BlagoGlobalConfigFile> | null
  return normalizeGlobalParsed(parsed)
}

export async function readGlobalBlagoConfig(): Promise<BlagoGlobalConfigFile | null> {
  const p = globalBlagoConfigPath()
  let raw: string
  try {
    raw = await fs.readFile(p, 'utf8')
  }
  catch {
    return null
  }
  return parseGlobalYamlText(raw)
}

/** Синхронное чтение (для help и зеркала перед выводом). */
export function readGlobalBlagoConfigSync(): BlagoGlobalConfigFile | null {
  try {
    const raw = fsSync.readFileSync(globalBlagoConfigPath(), 'utf8')
    return parseGlobalYamlText(raw)
  }
  catch {
    return null
  }
}

function stringifyGlobalYaml(cfg: BlagoGlobalConfigFile): string {
  return `${YAML.stringify(cfg, { lineWidth: 0, indent: 2 }).trimEnd()}\n`
}

export async function writeGlobalBlagoConfig(cfg: BlagoGlobalConfigFile): Promise<void> {
  const dir = globalBlagoConfigDir()
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(globalBlagoConfigPath(), stringifyGlobalYaml(cfg), 'utf8')
}

export function writeGlobalBlagoConfigSync(cfg: BlagoGlobalConfigFile): void {
  const dir = globalBlagoConfigDir()
  fsSync.mkdirSync(dir, { recursive: true })
  fsSync.writeFileSync(globalBlagoConfigPath(), stringifyGlobalYaml(cfg), 'utf8')
}

/**
 * Создаёт config.yaml при отсутствии. Существующий файл не перезаписывает.
 */
export async function ensureGlobalBlagoConfigFile(
  workspaceBase?: string,
): Promise<BlagoGlobalConfigFile> {
  const existing = await readGlobalBlagoConfig()
  if (existing) {
    return existing
  }
  const next = buildDefaultGlobalConfig(workspaceBase)
  await writeGlobalBlagoConfig(next)
  return next
}

export async function mkdirWorkspaceDirs(cfg: BlagoGlobalConfigFile): Promise<void> {
  await Promise.all(
    Object.values(cfg.workspaces).map(dir => fs.mkdir(dir, { recursive: true })),
  )
}

/** Абсолютный путь активной рабочей копии по глобальному конфигу; null если ключ отсутствует. */
export function resolveActiveWorkspaceRoot(cfg: BlagoGlobalConfigFile): string | null {
  const key = cfg.active_workspace_env.trim()
  if (!key) {
    return null
  }
  const dir = cfg.workspaces[key]
  if (typeof dir !== 'string' || !dir.trim()) {
    return null
  }
  return path.resolve(dir.trim())
}
