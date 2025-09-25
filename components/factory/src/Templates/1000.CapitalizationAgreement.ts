import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { CooperativeSchema } from '../Schema'

export const registry_id = Cooperative.Registry.CapitalizationAgreement.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.CapitalizationAgreement.Action

// Модель данных
export type Model = Cooperative.Registry.CapitalizationAgreement.Model

// Схема для сверки
export const Schema: JSONSchemaType<Model> = {
  type: 'object',
  properties: {
    meta: IMetaJSONSchema,
  },
  required: ['meta'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.CapitalizationAgreement.title,
  description: Cooperative.Registry.CapitalizationAgreement.description,
  model: Schema,
  context: Cooperative.Registry.CapitalizationAgreement.context,
  translations: Cooperative.Registry.CapitalizationAgreement.translations,
}
