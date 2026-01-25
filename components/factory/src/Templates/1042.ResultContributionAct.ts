import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { CooperativeSchema } from '../Schema'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { VarsSchema } from '../Schema/VarsSchema'
import { CommonUserSchema } from '../Schema/CommonUserSchema'
import { decisionSchema } from '../Schema/DecisionSchema'

export const registry_id = Cooperative.Registry.ResultContributionAct.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.ResultContributionAct.Action

// Модель данных
export type Model = Cooperative.Registry.ResultContributionAct.Model

// Схема для сверки
export const Schema: JSONSchemaType<Model> = {
  type: 'object',
  properties: {
    meta: IMetaJSONSchema,
    coop: CooperativeSchema,
    vars: VarsSchema,
    decision: decisionSchema,
    common_user: CommonUserSchema,
    contributor_contract_number: { type: 'string' },
    contributor_contract_created_at: { type: 'string' },
    blagorost_agreement_number: { type: 'string' },
    blagorost_agreement_created_at: { type: 'string' },
    result_act_hash: { type: 'string' },
    result_act_short_hash: { type: 'string' },
    result_hash: { type: 'string' },
    percent_of_result: { type: 'string' },
    total_amount: { type: 'string' },
  },
  required: ['meta', 'coop', 'vars', 'decision', 'common_user', 'contributor_contract_number', 'contributor_contract_created_at', 'blagorost_agreement_number', 'blagorost_agreement_created_at', 'result_act_hash', 'result_act_short_hash', 'result_hash', 'percent_of_result', 'total_amount'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.ResultContributionAct.title,
  description: Cooperative.Registry.ResultContributionAct.description,
  model: Schema,
  context: Cooperative.Registry.ResultContributionAct.context,
  translations: Cooperative.Registry.ResultContributionAct.translations,
}
