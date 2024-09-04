import type { JSONSchemaType } from 'ajv'
import type { Cooperative } from 'cooptypes'
import type { DocumentsMappingByActionAndCode } from '../Templates/registry'
import type { CooperativeData } from '../Models/Cooperative'
import type { ExternalEntrepreneurData, ExternalIndividualData, ExternalOrganizationData } from '../Models'

// Определение базового интерфейса для мета-информации
export type IMetaDocument = Cooperative.Documents.IMetaDocument

export interface IDecisionData {
  id: number
  date: string
  time: string
  votes_for: number
  votes_against: number
  votes_abstained: number
  voters_percent: number
}

export interface IGeneratedDocument {
  full_title?: string
  html: string
  hash: string
  meta: IMetaDocument
  binary: Uint8Array
}

export interface NestedRecord {
  [key: string]: any
}

export type ITranslations = Record<string, NestedRecord>

export interface ITemplate<T> {
  title: string
  description: string
  model: JSONSchemaType<T> // Схема данных для шаблона
  context: string
  translations: ITranslations // Схема переводов
}

export interface ICombinedData {
  individual?: ExternalIndividualData
  organization?: ExternalOrganizationData
  entrepreneur?: ExternalEntrepreneurData
  coop?: CooperativeData
  meta: IMetaDocument
}

export type Actions = keyof DocumentsMappingByActionAndCode
export type LangType = 'ru'

export interface IMetaDocumentPartial extends Partial<IMetaDocument> {
  username: string
  coopname: string
  registry_id: number
  title: string
}

export interface IGenerate extends Omit<Partial<IMetaDocument>, 'registry_id' | 'title'> {
  code: string
  action: string
  coopname: string
  username: string
  [key: string]: any
}
