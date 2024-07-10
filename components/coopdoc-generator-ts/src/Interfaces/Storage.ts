import type { Document } from 'mongodb'
import type { IGeneratedDocument } from './Documents'

export interface IFilterDeltas {
  present: boolean
  code: string
  scope: string
  table: string
  primary_key: string
  value?: any
  block_num: number
  block_id: string
}

export interface IFilterActions {
  transaction_id: string
  account: string // < контракт действия, например, eosio.token
  name: string // < название действия, например, transfer
  authorization: Array<{
    actor: string
    permission: string
  }>
  data: any
}

export interface IBCState {
  key: string
  block_num: number
}

export interface IFilterDocuments extends Document, IGeneratedDocument {
}
