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
  { code: 'draft', table: 'drafts' },
  { code: 'draft', table: 'translations' },

  // meet
  { code: 'meet', table: 'meets' },
  { code: 'meet', table: 'questions' },

  // совет
  { code: 'soviet', table: 'decisions' },
  { code: 'soviet', table: 'approvals' },
  { code: 'soviet', table: 'boards' },
  { code: 'soviet', table: 'participants' },
  { code: 'soviet', table: 'agreements' },

  // registrator.joincoop
  { code: 'soviet', table: 'joincoops' },

  // регистратор
  { code: 'registrator', table: 'accounts' },
  { code: 'registrator', table: 'coops' },

  { code: 'eosio.token', table: 'accounts' },
  { code: 'capital', table: 'projects' },
  { code: 'capital', table: 'contributors' },
  { code: 'capital', table: 'appendixes' },
  { code: 'capital', table: 'segments' },
]

export const subsribedActions: IActionConfig[] = [
  { code: 'eosio.token', action: 'transfer' },
  { code: 'registrator', action: '*' },

  { code: 'meet', action: '*' },
  { code: 'wallet', action: '*' },
  { code: 'ledger', action: '*' },
  { code: 'soviet', action: '*' },
  { code: 'capital', action: '*' },
]

// --------------------------
