import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'

export const registry_id = Cooperative.Registry.GenerationPropertyInvestAct.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.GenerationPropertyInvestAct.Action

// Модель данных
export type Model = Cooperative.Registry.GenerationPropertyInvestAct.Model

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
  title: Cooperative.Registry.GenerationPropertyInvestAct.title,
  description: Cooperative.Registry.GenerationPropertyInvestAct.description,
  model: Schema,
  context: Cooperative.Registry.GenerationPropertyInvestAct.context,
  translations: Cooperative.Registry.GenerationPropertyInvestAct.translations,
}
