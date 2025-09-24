import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'

export const registry_id = Cooperative.Registry.ResultContributionStatement.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.ResultContributionStatement.Action

// Модель данных
export type Model = Cooperative.Registry.ResultContributionStatement.Model

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
  title: Cooperative.Registry.ResultContributionStatement.title,
  description: Cooperative.Registry.ResultContributionStatement.description,
  model: Schema,
  context: Cooperative.Registry.ResultContributionStatement.context,
  translations: Cooperative.Registry.ResultContributionStatement.translations,
}
