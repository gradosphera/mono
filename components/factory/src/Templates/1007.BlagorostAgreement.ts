import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { CooperativeSchema } from '../Schema'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { VarsSchema } from '../Schema/VarsSchema'
import { CommonUserSchema } from '../Schema/CommonUserSchema'

export const registry_id = Cooperative.Registry.BlagorostAgreement.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.BlagorostAgreement.Action

// Модель данных
export type Model = Cooperative.Registry.BlagorostAgreement.Model

// Схема для сверки
export const Schema: JSONSchemaType<Model> = {
  type: 'object',
  properties: {
    meta: IMetaJSONSchema,
    coop: CooperativeSchema,
    vars: VarsSchema,
    common_user: CommonUserSchema,
    blagorost_agreement_hash: { type: 'string' },
    blagorost_agreement_short_hash: { type: 'string' },
    contributor_hash: { type: 'string' },
    contributor_short_hash: { type: 'string' },
    contributor_created_at: { type: 'string' },
  },
  required: ['meta', 'coop', 'vars', 'common_user', 'blagorost_agreement_hash', 'blagorost_agreement_short_hash', 'contributor_hash', 'contributor_short_hash', 'contributor_created_at'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.BlagorostAgreement.title,
  description: Cooperative.Registry.BlagorostAgreement.description,
  model: Schema,
  context: Cooperative.Registry.BlagorostAgreement.context,
  translations: Cooperative.Registry.BlagorostAgreement.translations,
}
