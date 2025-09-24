import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'

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
  },
  required: ['meta'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.GenerationMoneyReturnUnusedStatement.title,
  description: Cooperative.Registry.GenerationMoneyReturnUnusedStatement.description,
  model: Schema,
  context: Cooperative.Registry.GenerationMoneyReturnUnusedStatement.context,
  translations: Cooperative.Registry.GenerationMoneyReturnUnusedStatement.translations,
}
