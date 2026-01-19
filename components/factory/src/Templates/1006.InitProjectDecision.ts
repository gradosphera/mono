import type { JSONSchemaType } from 'ajv'

import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { CooperativeSchema } from '../Schema/CooperativeSchema'
import { decisionSchema } from '../Schema/DecisionSchema'
import { VarsSchema } from '../Schema'

export const registry_id = Cooperative.Registry.InitProjectDecision.registry_id

/**
 * Интерфейс генерации решения совета по инициализации проекта
 */
export type Action = Cooperative.Registry.InitProjectDecision.Action

export type Model = Cooperative.Registry.InitProjectDecision.Model

// Схема для сверки
export const Schema: JSONSchemaType<Model> = {
  type: 'object',
  properties: {
    coop: {
      type: 'object',
      properties: {
        ...CooperativeSchema.properties,
      },
      required: [...CooperativeSchema.required],
      additionalProperties: true,
    },
    decision: {
      type: 'object',
      properties: {
        ...decisionSchema.properties,
      },
      required: [...decisionSchema.required],
      additionalProperties: true,
    },
    meta: {
      type: 'object',
      properties: {
        ...IMetaJSONSchema.properties,
      },
      required: [...IMetaJSONSchema.required],
      additionalProperties: true,
    },
    vars: VarsSchema,
    project_name: { type: 'string' },
    project_id: { type: 'string' },
    component_name: { type: 'string' },
    component_id: { type: 'string' },
    is_component: { type: 'boolean' },
  },
  required: ['meta', 'coop', 'decision', 'project_name', 'project_id', 'component_name', 'component_id', 'is_component'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.InitProjectDecision.title,
  description: Cooperative.Registry.InitProjectDecision.description,
  model: Schema,
  context: Cooperative.Registry.InitProjectDecision.context,
  translations: Cooperative.Registry.InitProjectDecision.translations,
}
