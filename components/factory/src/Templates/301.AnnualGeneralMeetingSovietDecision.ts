import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { CooperativeSchema, MeetPointSchema, MeetSchema, VarsSchema, decisionSchema } from '../Schema'

export const registry_id = Cooperative.Registry.AnnualGeneralMeetingSovietDecision.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.AnnualGeneralMeetingSovietDecision.Action

// Модель данных
export type Model = Cooperative.Registry.AnnualGeneralMeetingSovietDecision.Model

// Схема для сверки
export const Schema: JSONSchemaType<Model> = {
  type: 'object',
  properties: {
    meta: IMetaJSONSchema,
    coop: CooperativeSchema,
    vars: VarsSchema,
    decision: decisionSchema,
    meet: MeetSchema,
    questions: {
      type: 'array',
      items: MeetPointSchema,
    },
    is_repeated: { type: 'boolean' },
  },
  required: ['meta', 'coop', 'vars', 'decision', 'meet', 'questions', 'is_repeated'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.AnnualGeneralMeetingSovietDecision.title,
  description: Cooperative.Registry.AnnualGeneralMeetingSovietDecision.description,
  model: Schema,
  context: Cooperative.Registry.AnnualGeneralMeetingSovietDecision.context,
  translations: Cooperative.Registry.AnnualGeneralMeetingSovietDecision.translations,
}
