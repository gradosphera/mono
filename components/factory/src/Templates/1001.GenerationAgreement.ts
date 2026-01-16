import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { CooperativeSchema } from '../Schema'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { VarsSchema } from '../Schema/VarsSchema'
import { CommonUserSchema } from '../Schema/CommonUserSchema'

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
    coop: CooperativeSchema,
    vars: VarsSchema,
    user: CommonUserSchema,
    short_contributor_hash: { type: 'string' },
  },
  required: ['meta', 'coop', 'vars', 'user', 'short_contributor_hash'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.GenerationAgreement.title,
  description: Cooperative.Registry.GenerationAgreement.description,
  model: Schema,
  context: Cooperative.Registry.GenerationAgreement.context,
  translations: Cooperative.Registry.GenerationAgreement.translations,
}
