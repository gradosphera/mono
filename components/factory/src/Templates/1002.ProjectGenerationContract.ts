import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { CooperativeSchema } from '../Schema'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { VarsSchema } from '../Schema/VarsSchema'
import { CommonUserSchema } from '../Schema/CommonUserSchema'

export const registry_id = Cooperative.Registry.ProjectGenerationContract.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.ProjectGenerationContract.Action

// Модель данных
export type Model = Cooperative.Registry.ProjectGenerationContract.Model

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
    contributor_short_hash: { type: 'string' },
    contributor_created_at: { type: 'string' },
    project_name: { type: 'string' },
    project_hash: { type: 'string' },
    generator_agreement_short_hash: { type: 'string' },
    generator_agreement_created_at: { type: 'string' },
  },
  required: ['meta', 'coop', 'vars', 'user', 'appendix_hash', 'short_appendix_hash', 'contributor_hash', 'contributor_short_hash', 'contributor_created_at', 'project_name', 'project_hash', 'generator_agreement_short_hash', 'generator_agreement_created_at'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.ProjectGenerationContract.title,
  description: Cooperative.Registry.ProjectGenerationContract.description,
  model: Schema,
  context: Cooperative.Registry.ProjectGenerationContract.context,
  translations: Cooperative.Registry.ProjectGenerationContract.translations,
}
