import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
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
  },
  required: ['meta'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.GenerationMoneyInvestStatement.title,
  description: Cooperative.Registry.GenerationMoneyInvestStatement.description,
  model: Schema,
  context: Cooperative.Registry.GenerationMoneyInvestStatement.context,
  translations: Cooperative.Registry.GenerationMoneyInvestStatement.translations,
}
