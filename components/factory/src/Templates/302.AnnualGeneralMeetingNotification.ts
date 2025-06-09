import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { CommonUserSchema, CooperativeSchema, MeetPointSchema, MeetSchema, VarsSchema } from '../Schema'

export const registry_id = Cooperative.Registry.AnnualGeneralMeetingNotification.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.AnnualGeneralMeetingNotification.Action

// Модель данных
export type Model = Cooperative.Registry.AnnualGeneralMeetingNotification.Model

// Схема для сверки
export const Schema: JSONSchemaType<Model> = {
  type: 'object',
  properties: {
    meta: IMetaJSONSchema,
    coop: CooperativeSchema,
    vars: VarsSchema,
    user: CommonUserSchema,
    meet: MeetSchema,
    questions: {
      type: 'array',
      items: MeetPointSchema,
    },
  },
  required: ['meta', 'coop', 'vars', 'meet', 'questions', 'user'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.AnnualGeneralMeetingNotification.title,
  description: Cooperative.Registry.AnnualGeneralMeetingNotification.description,
  model: Schema,
  context: Cooperative.Registry.AnnualGeneralMeetingNotification.context,
  translations: Cooperative.Registry.AnnualGeneralMeetingNotification.translations,
}
