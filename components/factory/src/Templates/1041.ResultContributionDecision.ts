import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'

export const registry_id = Cooperative.Registry.ResultContributionDecision.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.ResultContributionDecision.Action

// Модель данных
export type Model = Cooperative.Registry.ResultContributionDecision.Model

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
  title: Cooperative.Registry.ResultContributionDecision.title,
  description: Cooperative.Registry.ResultContributionDecision.description,
  model: Schema,
  context: Cooperative.Registry.ResultContributionDecision.context,
  translations: Cooperative.Registry.ResultContributionDecision.translations,
}
