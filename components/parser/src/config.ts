import dotenv from 'dotenv'
import type { IActionConfig, IDeltaConfig } from './Types'

dotenv.config()

function getEnvVar(key: string): string {
  const envVar = process.env[key]
  if (envVar === undefined)
    throw new Error(`Env variable ${key} is required`)

  return envVar
}
export const node_env = getEnvVar('NODE_ENV')
export const eosioApi = getEnvVar('API')
export const shipApi = getEnvVar('SHIP')
export const mongoUri = `${getEnvVar('MONGO_EXPLORER_URI')}${node_env === 'test' ? '-test' : ''}`
export const startBlock = getEnvVar('START_BLOCK')
export const finishBlock = getEnvVar('FINISH_BLOCK')
export const redisPort = getEnvVar('REDIS_PORT')
export const redisHost = getEnvVar('REDIS_HOST')
export const redisPassword = getEnvVar('REDIS_PASSWORD')
export const redisStreamLimit = Number(getEnvVar('REDIS_STREAM_LIMIT'))
// --------------------------
export const subsribedTables: IDeltaConfig[] = [
  // документы
  { code: 'draft', table: 'drafts', notify: true },
  { code: 'draft', table: 'translations', notify: true },

  // meet
  { code: 'meet', table: 'meets', notify: true },
  { code: 'meet', table: 'questions', notify: true },

  // совет
  { code: 'soviet', table: 'decisions', notify: true },
  { code: 'soviet', table: 'approvals', notify: true },
  { code: 'soviet', table: 'boards', notify: true },
  { code: 'soviet', table: 'participants', notify: true },

  // registrator.joincoop
  { code: 'soviet', table: 'joincoops', notify: true },

  // регистратор
  { code: 'registrator', table: 'accounts', notify: true },
  { code: 'registrator', table: 'coops', notify: true },

  { code: 'eosio.token', table: 'accounts', notify: true },
  { code: 'capital', table: 'projects', notify: true },
  { code: 'capital', table: 'contributors', notify: true },
]

export const subsribedActions: IActionConfig[] = [
  { code: 'eosio.token', action: 'transfer', notify: true },
  { code: 'registrator', action: '*', notify: true },

  { code: 'meet', action: '*', notify: true },
  { code: 'wallet', action: '*', notify: true },
  { code: 'ledger', action: '*', notify: true },
  { code: 'soviet', action: '*', notify: true },
  { code: 'capital', action: '*', notify: true },
]

// --------------------------
