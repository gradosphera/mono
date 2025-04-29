import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { CooperativeSchema, VarsSchema } from '../Schema'

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
  },
  required: ['meta', 'coop', 'vars'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.AnnualGeneralMeetingVotingBallot.title,
  description: Cooperative.Registry.AnnualGeneralMeetingVotingBallot.description,
  model: Schema,
  context: Cooperative.Registry.AnnualGeneralMeetingVotingBallot.context,
  translations: Cooperative.Registry.AnnualGeneralMeetingVotingBallot.translations,
}
