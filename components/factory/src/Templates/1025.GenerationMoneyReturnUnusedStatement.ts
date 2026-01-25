import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { CooperativeSchema } from '../Schema'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { VarsSchema } from '../Schema/VarsSchema'
import { CommonUserSchema } from '../Schema/CommonUserSchema'

export const registry_id = Cooperative.Registry.GenerationMoneyReturnUnusedStatement.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.GenerationMoneyReturnUnusedStatement.Action

// Модель данных
export type Model = Cooperative.Registry.GenerationMoneyReturnUnusedStatement.Model

// Схема для сверки
export const Schema: JSONSchemaType<Model> = {
  type: 'object',
  properties: {
    meta: IMetaJSONSchema,
    vars: VarsSchema,
    common_user: CommonUserSchema,
    contributor_contract_number: { type: 'string' },
    contributor_contract_created_at: { type: 'string' },
    generator_agreement_number: { type: 'string' },
    generator_agreement_created_at: { type: 'string' },
    project_hash: { type: 'string' },
    amount: { type: 'string' },
  },
  required: ['meta', 'vars', 'common_user', 'contributor_contract_number', 'contributor_contract_created_at', 'generator_agreement_number', 'generator_agreement_created_at', 'project_hash', 'amount'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.GenerationMoneyReturnUnusedStatement.title,
  description: Cooperative.Registry.GenerationMoneyReturnUnusedStatement.description,
  model: Schema,
  context: Cooperative.Registry.GenerationMoneyReturnUnusedStatement.context,
  translations: Cooperative.Registry.GenerationMoneyReturnUnusedStatement.translations,
}
