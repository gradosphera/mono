import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'

export const registry_id = Cooperative.Registry.CapitalizationPropertyInvestDecision.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.CapitalizationPropertyInvestDecision.Action

// Модель данных
export type Model = Cooperative.Registry.CapitalizationPropertyInvestDecision.Model

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
  title: Cooperative.Registry.CapitalizationPropertyInvestDecision.title,
  description: Cooperative.Registry.CapitalizationPropertyInvestDecision.description,
  model: Schema,
  context: Cooperative.Registry.CapitalizationPropertyInvestDecision.context,
  translations: Cooperative.Registry.CapitalizationPropertyInvestDecision.translations,
}
