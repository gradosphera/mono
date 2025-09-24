import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'

export const registry_id = Cooperative.Registry.GetLoanStatement.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.GetLoanStatement.Action

// Модель данных
export type Model = Cooperative.Registry.GetLoanStatement.Model

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
  title: Cooperative.Registry.GetLoanStatement.title,
  description: Cooperative.Registry.GetLoanStatement.description,
  model: Schema,
  context: Cooperative.Registry.GetLoanStatement.context,
  translations: Cooperative.Registry.GetLoanStatement.translations,
}
