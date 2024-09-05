import type { SovietContract } from '../../contracts'
import type { IAction, IExtendedAction } from '../blockchain'

export type LangType = 'ru'

export interface IChainDocument {
  hash: string
  public_key: string
  signature: string
  meta: string
}

// Определение базового интерфейса для мета-информации
export interface IMetaDocument {
  title: string
  registry_id: number
  lang: LangType
  generator: string
  version: string
  coopname: string
  username: string
  created_at: string
  block_num: number
  timezone: string
}

export interface IGeneratedDocument {
  full_title?: string
  html: string
  hash: string
  meta: IMetaDocument
  binary: Uint8Array
}

export interface IComplexStatement {
  action: IExtendedAction
  document: IGeneratedDocument
}

export interface IComplexDecision {
  action: IExtendedAction
  document: IGeneratedDocument
  votes_for: IExtendedAction[]
  votes_against: IExtendedAction[]
}

export interface IComplexAct {
  action?: IExtendedAction
  document?: IGeneratedDocument
}

export interface IComplexDocument {
  statement: IComplexStatement
  decision: IComplexDecision
  acts: IComplexAct[]
}

export interface IGetComplexDocuments {
  results: IComplexDocument[]
  page: number
  limit: number
}

export interface IAgenda {
  table: SovietContract.Tables.Decisions.IDecision
  action: IAction
}

export interface IComplexAgenda extends IAgenda {
  documents: IComplexDocument
}

export interface IGetResponse<T> {
  results: T[]
  page: number
  limit: number
  totalResults: number
  totalPages: number
}

/**
 * Общий интерфейс для генерации/регенерации документа
 */
export interface IGenerate extends Omit<Partial<IMetaDocument>, 'title'> {
  registry_id: number
  coopname: string
  username: string
  [key: string]: any
}

/**
 * Интерфейс генерации заявления на вступление в кооператив
 */
export interface IGenerateJoinCoop extends IGenerate {
  signature: string
  skip_save: boolean
}

/**
 * Интерфейс генерации решения совета
 */
export interface IGenerateJoinCoopDecision extends IGenerate {
  decision_id: number
}

/**
 * Интерфейс генерации соглашения
 */
export interface IGenerateWalletAgreement extends IGenerate {
  registry_id: number
}
