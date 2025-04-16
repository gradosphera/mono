import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { CooperativeSchema, VarsSchema, decisionSchema, organizationSchema } from '../Schema'
import { CommonRequestSchema } from '../Schema/CommonRequestSchema'
import { CommonUserSchema } from '../Schema/CommonUserSchema'
import { FirstLastMiddleNameSchema } from '../Schema/FirstLastMiddleNameSchema'
import { CommonProgramSchema } from '../Schema/CommonProgramSchema'

export const registry_id = Cooperative.Registry.AssetContributionAct.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.AssetContributionAct.Action

// Модель данных
export type Model = Cooperative.Registry.AssetContributionAct.Model

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
    receiver: FirstLastMiddleNameSchema,
    program: CommonProgramSchema,
    branch: { ...organizationSchema, nullable: true },
  },
  required: ['meta', 'coop', 'vars', 'request', 'user', 'decision', 'act_id', 'receiver', 'program'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.AssetContributionAct.title,
  description: Cooperative.Registry.AssetContributionAct.description,
  model: Schema,
  context: Cooperative.Registry.AssetContributionAct.context,
  translations: Cooperative.Registry.AssetContributionAct.translations,
}
