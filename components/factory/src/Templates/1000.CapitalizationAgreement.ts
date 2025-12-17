import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { IMetaDocument, ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { CommonUserSchema, CooperativeSchema, VarsSchema } from '../Schema'

export const registry_id = Cooperative.Registry.CapitalizationAgreement.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.CapitalizationAgreement.Action

// Модель данных - используем полную модель с дополнительными полями
export interface Model {
  meta: IMetaDocument
  coop: Cooperative.Model.ICooperativeData
  vars: Cooperative.Model.IVars
  common_user: Cooperative.Model.ICommonUser
  blagorost_provision: {
    protocol_number: string
    protocol_date: string
  }
  blagorost_offer_template: {
    protocol_number: string
    protocol_date: string
  }
}

// Схема для сверки - используем расширенную схему для дополнительных данных
export const Schema: JSONSchemaType<Model> = {
  type: 'object',
  properties: {
    meta: IMetaJSONSchema,
    coop: CooperativeSchema,
    vars: VarsSchema,
    common_user: CommonUserSchema,
    blagorost_provision: {
      type: 'object',
      properties: {
        protocol_number: { type: 'string' },
        protocol_date: { type: 'string' },
      },
      required: ['protocol_number', 'protocol_date'],
    },
    blagorost_offer_template: {
      type: 'object',
      properties: {
        protocol_number: { type: 'string' },
        protocol_date: { type: 'string' },
      },
      required: ['protocol_number', 'protocol_date'],
    },
  },
  required: ['meta'],
  additionalProperties: true,
} as any

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.CapitalizationAgreement.title,
  description: Cooperative.Registry.CapitalizationAgreement.description,
  model: Schema,
  context: Cooperative.Registry.CapitalizationAgreement.context,
  translations: Cooperative.Registry.CapitalizationAgreement.translations,
}
