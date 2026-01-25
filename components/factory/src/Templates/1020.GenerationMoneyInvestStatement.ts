import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { CommonUserSchema, CooperativeSchema, VarsSchema } from '../Schema'
import { IMetaJSONSchema } from '../Schema/MetaSchema'

export const registry_id = Cooperative.Registry.GenerationMoneyInvestStatement.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.GenerationMoneyInvestStatement.Action

// Модель данных
export type Model = Cooperative.Registry.GenerationMoneyInvestStatement.Model

// Схема для сверки
export const Schema: JSONSchemaType<Model> = {
  type: 'object',
  properties: {
    meta: IMetaJSONSchema,
    coop: CooperativeSchema,
    vars: VarsSchema,
    user: CommonUserSchema,
    appendix_hash: { type: 'string' },
    short_appendix_hash: { type: 'string' },
    contributor_hash: { type: 'string' },
    contributor_short_hash: { type: 'string' },
    contributor_created_at: { type: 'string' },
    appendix_created_at: { type: 'string' },
    project_hash: { type: 'string' },
    amount: { type: 'string' },
  },
  required: [
    'meta',
    'coop',
    'vars',
    'user',
    'appendix_hash',
    'short_appendix_hash',
    'contributor_hash',
    'contributor_short_hash',
    'contributor_created_at',
    'appendix_created_at',
    'project_hash',
    'amount',
  ],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.GenerationMoneyInvestStatement.title,
  description: Cooperative.Registry.GenerationMoneyInvestStatement.description,
  model: Schema,
  context: Cooperative.Registry.GenerationMoneyInvestStatement.context,
  translations: Cooperative.Registry.GenerationMoneyInvestStatement.translations,
}
