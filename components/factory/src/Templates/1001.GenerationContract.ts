import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { CooperativeSchema } from '../Schema'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { VarsSchema } from '../Schema/VarsSchema'
import { CommonUserSchema } from '../Schema/CommonUserSchema'

export const registry_id = Cooperative.Registry.GenerationContract.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.GenerationContract.Action

// Модель данных
export type Model = Cooperative.Registry.GenerationContract.Model

// Схема для сверки
export const Schema: JSONSchemaType<Model> = {
  type: 'object',
  properties: {
    meta: IMetaJSONSchema,
    coop: CooperativeSchema,
    vars: VarsSchema,
    user: CommonUserSchema,
    contributor_contract_number: { type: 'string' },
  },
  required: ['meta', 'coop', 'vars', 'user', 'contributor_contract_number'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.GenerationContract.title,
  description: Cooperative.Registry.GenerationContract.description,
  model: Schema,
  context: Cooperative.Registry.GenerationContract.context,
  translations: Cooperative.Registry.GenerationContract.translations,
}
