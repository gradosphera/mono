import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { CooperativeSchema } from '../Schema'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { VarsSchema } from '../Schema/VarsSchema'
import { CommonUserSchema } from '../Schema/CommonUserSchema'

export const registry_id = Cooperative.Registry.CapitalizationMoneyInvestStatement.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.CapitalizationMoneyInvestStatement.Action

// Модель данных
export type Model = Cooperative.Registry.CapitalizationMoneyInvestStatement.Model

// Схема для сверки
export const Schema: JSONSchemaType<Model> = {
  type: 'object',
  properties: {
    meta: IMetaJSONSchema,
    vars: VarsSchema,
    common_user: CommonUserSchema,
    amount: { type: 'string' },
  },
  required: ['meta', 'vars', 'common_user', 'amount'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.CapitalizationMoneyInvestStatement.title,
  description: Cooperative.Registry.CapitalizationMoneyInvestStatement.description,
  model: Schema,
  context: Cooperative.Registry.CapitalizationMoneyInvestStatement.context,
  translations: Cooperative.Registry.CapitalizationMoneyInvestStatement.translations,
}
