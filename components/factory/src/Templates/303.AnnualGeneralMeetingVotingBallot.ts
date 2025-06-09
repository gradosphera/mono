import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { CommonUserSchema, CooperativeSchema, MeetSchema, VarsSchema } from '../Schema'

// Расширенная схема для объекта ответа с голосованием
const AnswerSchema: JSONSchemaType<Cooperative.Registry.AnnualGeneralMeetingVotingBallot.IAnswer> = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    number: { type: 'string' },
    title: { type: 'string' },
    context: { type: 'string' },
    decision: { type: 'string' },
    vote: { type: 'string', enum: ['for', 'against', 'abstained'] }
  },
  required: ['id', 'number', 'title', 'context', 'decision', 'vote'],
  additionalProperties: true,
}

export const registry_id = Cooperative.Registry.AnnualGeneralMeetingVotingBallot.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.AnnualGeneralMeetingVotingBallot.Action

// Модель данных
export type Model = Cooperative.Registry.AnnualGeneralMeetingVotingBallot.Model

// Схема для сверки
export const Schema: JSONSchemaType<Model> = {
  type: 'object',
  properties: {
    meta: IMetaJSONSchema,
    coop: CooperativeSchema,
    vars: VarsSchema,
    meet: MeetSchema,
    user: CommonUserSchema,
    answers: {
      type: 'array',
      items: AnswerSchema,
    },
  },
  required: ['meta', 'coop', 'vars', 'meet', 'user', 'answers'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.AnnualGeneralMeetingVotingBallot.title,
  description: Cooperative.Registry.AnnualGeneralMeetingVotingBallot.description,
  model: Schema,
  context: Cooperative.Registry.AnnualGeneralMeetingVotingBallot.context,
  translations: Cooperative.Registry.AnnualGeneralMeetingVotingBallot.translations,
}
