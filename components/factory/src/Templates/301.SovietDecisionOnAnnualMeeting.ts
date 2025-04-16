import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { CooperativeSchema, VarsSchema } from '../Schema'

export const registry_id = Cooperative.Registry.SovietDecisionOnAnnualMeeting.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.SovietDecisionOnAnnualMeeting.Action

// Модель данных
export type Model = Cooperative.Registry.SovietDecisionOnAnnualMeeting.Model

// Схема для сверки
export const Schema: JSONSchemaType<Model> = {
  type: 'object',
  properties: {
    meta: IMetaJSONSchema,
    coop: CooperativeSchema,
    vars: VarsSchema,
  },
  required: ['meta', 'coop', 'vars'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.SovietDecisionOnAnnualMeeting.title,
  description: Cooperative.Registry.SovietDecisionOnAnnualMeeting.description,
  model: Schema,
  context: Cooperative.Registry.SovietDecisionOnAnnualMeeting.context,
  translations: Cooperative.Registry.SovietDecisionOnAnnualMeeting.translations,
}
