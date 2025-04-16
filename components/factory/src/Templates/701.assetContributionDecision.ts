import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { CooperativeSchema, VarsSchema, decisionSchema } from '../Schema'
import { CommonRequestSchema } from '../Schema/CommonRequestSchema'
import { CommonUserSchema } from '../Schema/CommonUserSchema'

export const registry_id = Cooperative.Registry.AssetContributionDecision.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.AssetContributionDecision.Action

// Модель данных
export type Model = Cooperative.Registry.AssetContributionDecision.Model

// Схема для сверки
export const Schema: JSONSchemaType<Model> = {
  type: 'object',
  properties: {
    meta: IMetaJSONSchema,
    coop: CooperativeSchema,
    vars: VarsSchema,
    request: CommonRequestSchema,
    user: CommonUserSchema,
    decision: decisionSchema,
  },
  required: ['meta', 'coop', 'vars', 'request', 'user', 'decision'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.AssetContributionDecision.title,
  description: Cooperative.Registry.AssetContributionDecision.description,
  model: Schema,
  context: Cooperative.Registry.AssetContributionDecision.context,
  translations: Cooperative.Registry.AssetContributionDecision.translations,
}
