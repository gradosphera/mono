import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { CooperativeSchema } from '../Schema'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { VarsSchema } from '../Schema/VarsSchema'
import { CommonUserSchema } from '../Schema/CommonUserSchema'

export const registry_id = Cooperative.Registry.ComponentGenerationContract.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.ComponentGenerationContract.Action

// Модель данных
export type Model = Cooperative.Registry.ComponentGenerationContract.Model

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
    parent_appendix_hash: { type: 'string' },
    short_parent_appendix_hash: { type: 'string' },
    contributor_hash: { type: 'string' },
    contributor_short_hash: { type: 'string' },
    contributor_created_at: { type: 'string' },
    component_name: { type: 'string' },
    component_hash: { type: 'string' },
    project_name: { type: 'string' },
    project_hash: { type: 'string' },
    generator_agreement_short_hash: { type: 'string' },
    generator_agreement_created_at: { type: 'string' },
  },
  required: ['meta', 'coop', 'vars', 'user', 'appendix_hash', 'short_appendix_hash', 'parent_appendix_hash', 'short_parent_appendix_hash', 'contributor_hash', 'contributor_short_hash', 'contributor_created_at', 'component_name', 'component_hash', 'project_name', 'project_hash', 'generator_agreement_short_hash', 'generator_agreement_created_at'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.ComponentGenerationContract.title,
  description: Cooperative.Registry.ComponentGenerationContract.description,
  model: Schema,
  context: Cooperative.Registry.ComponentGenerationContract.context,
  translations: Cooperative.Registry.ComponentGenerationContract.translations,
}
