import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { CooperativeSchema } from '../Schema'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { VarsSchema } from '../Schema/VarsSchema'
import { CommonUserSchema } from '../Schema/CommonUserSchema'

export const registry_id = Cooperative.Registry.InitProjectStatement.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.InitProjectStatement.Action

// Модель данных
export type Model = Cooperative.Registry.InitProjectStatement.Model

// Схема для сверки
export const Schema: JSONSchemaType<Model> = {
  type: 'object',
  properties: {
    meta: IMetaJSONSchema,
    coop: CooperativeSchema,
    vars: VarsSchema,
    user: CommonUserSchema,
    project_name: { type: 'string' },
    project_id: { type: 'string' },
    component_name: { type: 'string' },
    component_id: { type: 'string' },
    is_component: { type: 'boolean' },
  },
  required: ['meta', 'coop', 'vars', 'user', 'project_name', 'project_id', 'component_name', 'component_id', 'is_component'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.InitProjectStatement.title,
  description: Cooperative.Registry.InitProjectStatement.description,
  model: Schema,
  context: Cooperative.Registry.InitProjectStatement.context,
  translations: Cooperative.Registry.InitProjectStatement.translations,
}
