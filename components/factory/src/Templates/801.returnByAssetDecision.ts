import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { CooperativeSchema, VarsSchema, decisionSchema } from '../Schema'
import { CommonRequestSchema } from '../Schema/CommonRequestSchema'
import { CommonUserSchema } from '../Schema/CommonUserSchema'

export const registry_id = Cooperative.Registry.ReturnByAssetDecision.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.ReturnByAssetDecision.Action

// Модель данных
export type Model = Cooperative.Registry.ReturnByAssetDecision.Model

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
  title: Cooperative.Registry.ReturnByAssetDecision.title,
  description: Cooperative.Registry.ReturnByAssetDecision.description,
  model: Schema,
  context: Cooperative.Registry.ReturnByAssetDecision.context,
  translations: Cooperative.Registry.ReturnByAssetDecision.translations,
}
