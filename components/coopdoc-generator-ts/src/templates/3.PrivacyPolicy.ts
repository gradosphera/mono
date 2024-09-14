import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { IGenerate, IMetaDocument, ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { CooperativeSchema, CovarsSchema } from '../Schema'

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
    covars: CovarsSchema,
  },
  required: ['meta', 'coop', 'covars'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.PrivacyPolicy.title,
  description: Cooperative.Registry.PrivacyPolicy.description,
  model: Schema,
  context: Cooperative.Registry.PrivacyPolicy.context,
  translations: Cooperative.Registry.PrivacyPolicy.translations,
}
