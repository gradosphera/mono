import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { CooperativeSchema, VarsSchema } from '../Schema'
import { CommonRequestSchema } from '../Schema/CommonRequestSchema'
import { CommonUserSchema } from '../Schema/CommonUserSchema'

export const registry_id = Cooperative.Registry.AssetContributionStatement.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.AssetContributionStatement.Action

// Модель данных
export type Model = Cooperative.Registry.AssetContributionStatement.Model

// Схема для сверки
export const Schema: JSONSchemaType<Model> = {
  type: 'object',
  properties: {
    meta: IMetaJSONSchema,
    coop: CooperativeSchema,
    vars: VarsSchema,
    request: CommonRequestSchema,
    user: CommonUserSchema,
  },
  required: ['meta', 'coop', 'vars', 'request', 'user'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.AssetContributionStatement.title,
  description: Cooperative.Registry.AssetContributionStatement.description,
  model: Schema,
  context: Cooperative.Registry.AssetContributionStatement.context,
  translations: Cooperative.Registry.AssetContributionStatement.translations,
}
