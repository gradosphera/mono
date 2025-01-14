import type { EosioReaderAction as IAction, EosioReaderTableRowsStreamData as IDelta, createEosioShipReader } from '@blockmatic/eosio-ship-reader'
import type { Database } from '../Database'

export { EosioReaderTableRowsStreamData as IDelta } from '@blockmatic/eosio-ship-reader'
export { EosioReaderBlock as IBlock } from '@blockmatic/eosio-ship-reader'
export { EosioReaderAction as IAction } from '@blockmatic/eosio-ship-reader'

export type EosioShipReader = ReturnType<typeof createEosioShipReader>
export type EosioShipReaderResolved = Awaited<EosioShipReader>

export interface IDeltaConfig {
  code: string
  table: string
  scope?: string
  notify?: boolean
}

export interface IActionConfig {
  code: string
  action: string
  notify?: boolean
}

export interface IParserDelta {
  process: (db: Database, delta: IDelta) => Promise<void>
}

export interface IParserAction {
  process: (db: Database, action: IAction) => Promise<void>
}

export interface ITableResult {
  results: IDelta[]
  page: number
  limit: number
}

export interface IActionResult {
  results: IAction[]
  page: number
  limit: number
}
