import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { CooperativeSchema } from '../Schema'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { VarsSchema } from '../Schema/VarsSchema'
import { CommonUserSchema } from '../Schema/CommonUserSchema'

export const registry_id = Cooperative.Registry.ProjectGenerationAgreement.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.ProjectGenerationAgreement.Action

// Модель данных
export type Model = Cooperative.Registry.ProjectGenerationAgreement.Model

// Схема для сверки
export const Schema: JSONSchemaType<Model> = {
  type: 'object',
  properties: {
    meta: IMetaJSONSchema,
    coop: CooperativeSchema,
    vars: VarsSchema,
    user: CommonUserSchema,
    appendix_hash: { type: 'string' },
    short_appendix_hash: { type: 'string' },
    contributor_hash: { type: 'string' },
    short_contributor_hash: { type: 'string' },
    contributor_created_at: { type: 'string' },
    project_name: { type: 'string' },
    project_id: { type: 'string' },
  },
  required: ['meta', 'coop', 'vars', 'user', 'appendix_hash', 'short_appendix_hash', 'contributor_hash', 'short_contributor_hash', 'contributor_created_at', 'project_name', 'project_id'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.ProjectGenerationAgreement.title,
  description: Cooperative.Registry.ProjectGenerationAgreement.description,
  model: Schema,
  context: Cooperative.Registry.ProjectGenerationAgreement.context,
  translations: Cooperative.Registry.ProjectGenerationAgreement.translations,
}
