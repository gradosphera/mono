import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'

export const registry_id = Cooperative.Registry.GenerationAgreement.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.GenerationAgreement.Action

// Модель данных
export type Model = Cooperative.Registry.GenerationAgreement.Model

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
  title: Cooperative.Registry.GenerationAgreement.title,
  description: Cooperative.Registry.GenerationAgreement.description,
  model: Schema,
  context: Cooperative.Registry.GenerationAgreement.context,
  translations: Cooperative.Registry.GenerationAgreement.translations,
}
