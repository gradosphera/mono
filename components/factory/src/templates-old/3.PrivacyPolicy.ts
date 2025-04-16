import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { CooperativeSchema, VarsSchema } from '../Schema'

export const registry_id = Cooperative.Registry.PrivacyPolicy.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.PrivacyPolicy.Action

// Модель данных
export type Model = Cooperative.Registry.PrivacyPolicy.Model

// Схема для сверки
export const Schema: JSONSchemaType<Model> = {
  type: 'object',
  properties: {
    meta: IMetaJSONSchema,
    coop: CooperativeSchema,
    vars: VarsSchema,
  },
  required: ['meta', 'coop', 'vars'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.PrivacyPolicy.title,
  description: Cooperative.Registry.PrivacyPolicy.description,
  model: Schema,
  context: Cooperative.Registry.PrivacyPolicy.context,
  translations: Cooperative.Registry.PrivacyPolicy.translations,
}
