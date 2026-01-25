import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { CooperativeSchema } from '../Schema'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { VarsSchema } from '../Schema/VarsSchema'
import { CommonUserSchema } from '../Schema/CommonUserSchema'

export const registry_id = Cooperative.Registry.ResultContributionStatement.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.ResultContributionStatement.Action

// Модель данных
export type Model = Cooperative.Registry.ResultContributionStatement.Model

// Схема для сверки
export const Schema: JSONSchemaType<Model> = {
  type: 'object',
  properties: {
    meta: IMetaJSONSchema,
    coop: CooperativeSchema,
    vars: VarsSchema,
    common_user: CommonUserSchema,
    contributor_contract_number: { type: 'string' },
    contributor_contract_created_at: { type: 'string' },
    blagorost_agreement_number: { type: 'string' },
    blagorost_agreement_created_at: { type: 'string' },
    project_name: { type: 'string' },
    component_name: { type: 'string' },
    result_hash: { type: 'string' },
    result_short_hash: { type: 'string' },
    percent_of_result: { type: 'string' },
    total_amount: { type: 'string' },
  },
  required: ['meta', 'coop', 'vars', 'common_user', 'contributor_contract_number', 'contributor_contract_created_at', 'blagorost_agreement_number', 'blagorost_agreement_created_at', 'project_name', 'component_name', 'result_hash', 'result_short_hash', 'percent_of_result', 'total_amount'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.ResultContributionStatement.title,
  description: Cooperative.Registry.ResultContributionStatement.description,
  model: Schema,
  context: Cooperative.Registry.ResultContributionStatement.context,
  translations: Cooperative.Registry.ResultContributionStatement.translations,
}
