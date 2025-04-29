import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { CooperativeSchema, VarsSchema } from '../Schema'
import { CommonUserSchema } from '../Schema/CommonUserSchema'
import { CommonRequestSchema } from '../Schema/CommonRequestSchema'

export const registry_id = Cooperative.Registry.ReturnByAssetStatement.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.ReturnByAssetStatement.Action

// Модель данных
export type Model = Cooperative.Registry.ReturnByAssetStatement.Model

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
  title: Cooperative.Registry.ReturnByAssetStatement.title,
  description: Cooperative.Registry.ReturnByAssetStatement.description,
  model: Schema,
  context: Cooperative.Registry.ReturnByAssetStatement.context,
  translations: Cooperative.Registry.ReturnByAssetStatement.translations,
}
