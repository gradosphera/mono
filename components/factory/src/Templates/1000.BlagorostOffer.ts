import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { IMetaDocument, ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { CommonUserSchema, CooperativeSchema, VarsSchema } from '../Schema'

export const registry_id = Cooperative.Registry.BlagorostOffer.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.BlagorostOffer.Action

// Модель данных - используем полную модель с дополнительными полями
export type Model = Cooperative.Registry.BlagorostOffer.Model

// Схема для сверки - используем расширенную схему для дополнительных данных
export const Schema: JSONSchemaType<Model> = {
  type: 'object',
  properties: {
    meta: IMetaJSONSchema,
    coop: CooperativeSchema,
    vars: VarsSchema,
    common_user: CommonUserSchema,
    blagorost_agreement_number: { type: 'string' },
    blagorost_agreement_created_at: { type: 'string' },
  },
  required: ['meta', 'coop', 'vars', 'common_user', 'blagorost_agreement_number', 'blagorost_agreement_created_at'],
  additionalProperties: true,
} as any

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.BlagorostOffer.title,
  description: Cooperative.Registry.BlagorostOffer.description,
  model: Schema,
  context: Cooperative.Registry.BlagorostOffer.context,
  translations: Cooperative.Registry.BlagorostOffer.translations,
}
