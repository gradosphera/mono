import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { CooperativeSchema, VarsSchema, decisionSchema, organizationSchema } from '../Schema'
import { CommonRequestSchema } from '../Schema/CommonRequestSchema'
import { CommonUserSchema } from '../Schema/CommonUserSchema'
import { FirstLastMiddleNameSchema } from '../Schema/FirstLastMiddleNameSchema'
import { CommonProgramSchema } from '../Schema/CommonProgramSchema'

export const registry_id = Cooperative.Registry.ReturnByAssetAct.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.ReturnByAssetAct.Action

// Модель данных
export type Model = Cooperative.Registry.ReturnByAssetAct.Model

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
    act_id: { type: 'string' },
    transmitter: FirstLastMiddleNameSchema,
    program: CommonProgramSchema,
    branch: { ...organizationSchema, nullable: true },
  },
  required: ['meta', 'coop', 'vars', 'request', 'user', 'decision', 'act_id', 'transmitter', 'program'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.ReturnByAssetAct.title,
  description: Cooperative.Registry.ReturnByAssetAct.description,
  model: Schema,
  context: Cooperative.Registry.ReturnByAssetAct.context,
  translations: Cooperative.Registry.ReturnByAssetAct.translations,
}
