import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'

export const registry_id = Cooperative.Registry.CapitalizationPropertyInvestStatement.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.CapitalizationPropertyInvestStatement.Action

// Модель данных
export type Model = Cooperative.Registry.CapitalizationPropertyInvestStatement.Model

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
  title: Cooperative.Registry.CapitalizationPropertyInvestStatement.title,
  description: Cooperative.Registry.CapitalizationPropertyInvestStatement.description,
  model: Schema,
  context: Cooperative.Registry.CapitalizationPropertyInvestStatement.context,
  translations: Cooperative.Registry.CapitalizationPropertyInvestStatement.translations,
}
