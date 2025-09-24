import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'

export const registry_id = Cooperative.Registry.GenerationPropertyInvestDecision.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.GenerationPropertyInvestDecision.Action

// Модель данных
export type Model = Cooperative.Registry.GenerationPropertyInvestDecision.Model

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
  title: Cooperative.Registry.GenerationPropertyInvestDecision.title,
  description: Cooperative.Registry.GenerationPropertyInvestDecision.description,
  model: Schema,
  context: Cooperative.Registry.GenerationPropertyInvestDecision.context,
  translations: Cooperative.Registry.GenerationPropertyInvestDecision.translations,
}
