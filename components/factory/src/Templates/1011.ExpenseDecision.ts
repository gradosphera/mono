import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'

export const registry_id = Cooperative.Registry.ExpenseDecision.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.ExpenseDecision.Action

// Модель данных
export type Model = Cooperative.Registry.ExpenseDecision.Model

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
  title: Cooperative.Registry.ExpenseDecision.title,
  description: Cooperative.Registry.ExpenseDecision.description,
  model: Schema,
  context: Cooperative.Registry.ExpenseDecision.context,
  translations: Cooperative.Registry.ExpenseDecision.translations,
}
