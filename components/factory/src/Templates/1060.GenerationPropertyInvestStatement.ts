import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'

export const registry_id = Cooperative.Registry.GenerationPropertyInvestStatement.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.GenerationPropertyInvestStatement.Action

// Модель данных
export type Model = Cooperative.Registry.GenerationPropertyInvestStatement.Model

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
  title: Cooperative.Registry.GenerationPropertyInvestStatement.title,
  description: Cooperative.Registry.GenerationPropertyInvestStatement.description,
  model: Schema,
  context: Cooperative.Registry.GenerationPropertyInvestStatement.context,
  translations: Cooperative.Registry.GenerationPropertyInvestStatement.translations,
}
