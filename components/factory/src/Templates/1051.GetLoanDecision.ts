import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'

export const registry_id = Cooperative.Registry.GetLoanDecision.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.GetLoanDecision.Action

// Модель данных
export type Model = Cooperative.Registry.GetLoanDecision.Model

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
  title: Cooperative.Registry.GetLoanDecision.title,
  description: Cooperative.Registry.GetLoanDecision.description,
  model: Schema,
  context: Cooperative.Registry.GetLoanDecision.context,
  translations: Cooperative.Registry.GetLoanDecision.translations,
}
