import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { CooperativeSchema } from '../Schema'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { VarsSchema } from '../Schema/VarsSchema'
import { CommonUserSchema } from '../Schema/CommonUserSchema'

export const registry_id = Cooperative.Registry.StorageAgreement.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.StorageAgreement.Action

// Модель данных
export type Model = Cooperative.Registry.StorageAgreement.Model

// Схема для сверки
export const Schema: JSONSchemaType<Model> = {
  type: 'object',
  properties: {
    meta: IMetaJSONSchema,
    coop: CooperativeSchema,
    vars: VarsSchema,
    common_user: CommonUserSchema,
    storage_agreement_hash: { type: 'string' },
    contributor_hash: { type: 'string' },
    contributor_short_hash: { type: 'string' },
    generator_agreement_hash: { type: 'string' },
    generator_agreement_short_hash: { type: 'string' },
    generator_agreement_created_at: { type: 'string' },
  },
  required: ['meta', 'coop', 'vars', 'common_user', 'storage_agreement_hash', 'contributor_hash', 'contributor_short_hash', 'generator_agreement_hash', 'generator_agreement_short_hash', 'generator_agreement_created_at'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.StorageAgreement.title,
  description: Cooperative.Registry.StorageAgreement.description,
  model: Schema,
  context: Cooperative.Registry.StorageAgreement.context,
  translations: Cooperative.Registry.StorageAgreement.translations,
}
