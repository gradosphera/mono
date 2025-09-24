import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'

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
  },
  required: ['meta'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.CapitalizationMoneyInvestStatement.title,
  description: Cooperative.Registry.CapitalizationMoneyInvestStatement.description,
  model: Schema,
  context: Cooperative.Registry.CapitalizationMoneyInvestStatement.context,
  translations: Cooperative.Registry.CapitalizationMoneyInvestStatement.translations,
}
