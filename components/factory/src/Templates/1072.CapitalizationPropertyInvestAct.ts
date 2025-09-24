import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'

export const registry_id = Cooperative.Registry.CapitalizationPropertyInvestAct.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.CapitalizationPropertyInvestAct.Action

// Модель данных
export type Model = Cooperative.Registry.CapitalizationPropertyInvestAct.Model

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
  title: Cooperative.Registry.CapitalizationPropertyInvestAct.title,
  description: Cooperative.Registry.CapitalizationPropertyInvestAct.description,
  model: Schema,
  context: Cooperative.Registry.CapitalizationPropertyInvestAct.context,
  translations: Cooperative.Registry.CapitalizationPropertyInvestAct.translations,
}
