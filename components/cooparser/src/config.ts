import dotenv from 'dotenv'
import type { IActionConfig, IDeltaConfig } from './Types'

dotenv.config()

function getEnvVar(key: string): string {
  const envVar = process.env[key]
  if (envVar === undefined)
    throw new Error(`Env variable ${key} is required`)

  return envVar
}

export const eosioApi = getEnvVar('API')
export const shipApi = getEnvVar('SHIP')
export const mongoUri = getEnvVar('MONGO_EXPLORER_URI')
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

  // совет
  { code: 'soviet', table: 'decisions' },
  { code: 'soviet', table: 'boards' },
  { code: 'soviet', table: 'participants' },

  // registrator.joincoop
  { code: 'soviet', table: 'joincoops' },

  // регистратор
  { code: 'registrator', table: 'accounts' },
  { code: 'registrator', table: 'orgs' },
]

export const subsribedActions: IActionConfig[] = [
  { code: 'eosio.token', action: 'transfer', notify: true },
  { code: 'registrator', action: 'confirmreg', notify: true },

  { code: 'soviet', action: 'votefor' },
  { code: 'soviet', action: 'voteagainst' },
  { code: 'soviet', action: 'newsubmitted' },
  { code: 'soviet', action: 'newresolved' },

  { code: 'soviet', action: 'newdecision' },

  // // registrator.joincoop
  { code: 'soviet', action: 'joincoop' },
  { code: 'soviet', action: 'joincoopdec' },

]

// --------------------------
