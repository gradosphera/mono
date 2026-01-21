import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { CooperativeSchema } from '../Schema'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { VarsSchema } from '../Schema/VarsSchema'
import { CommonUserSchema } from '../Schema/CommonUserSchema'

export const registry_id = Cooperative.Registry.ComponentGenerationAgreement.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.ComponentGenerationAgreement.Action

// Модель данных
export type Model = Cooperative.Registry.ComponentGenerationAgreement.Model

// Схема для сверки
export const Schema: JSONSchemaType<Model> = {
  type: 'object',
  properties: {
    meta: IMetaJSONSchema,
    coop: CooperativeSchema,
    vars: VarsSchema,
    user: CommonUserSchema,
    component_appendix_hash: { type: 'string' },
    short_component_appendix_hash: { type: 'string' },
    parent_appendix_hash: { type: 'string' },
    short_parent_appendix_hash: { type: 'string' },
    contributor_hash: { type: 'string' },
    short_contributor_hash: { type: 'string' },
    contributor_created_at: { type: 'string' },
    component_name: { type: 'string' },
    component_id: { type: 'string' },
    project_name: { type: 'string' },
    project_id: { type: 'string' },
  },
  required: ['meta', 'coop', 'vars', 'user', 'component_appendix_hash', 'short_component_appendix_hash', 'parent_appendix_hash', 'short_parent_appendix_hash', 'contributor_hash', 'short_contributor_hash', 'contributor_created_at', 'component_name', 'component_id', 'project_name', 'project_id'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.ComponentGenerationAgreement.title,
  description: Cooperative.Registry.ComponentGenerationAgreement.description,
  model: Schema,
  context: Cooperative.Registry.ComponentGenerationAgreement.context,
  translations: Cooperative.Registry.ComponentGenerationAgreement.translations,
}
