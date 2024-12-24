import type { JSONSchemaType } from 'ajv'

import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { CooperativeSchema } from '../Schema/CooperativeSchema'
import { decisionSchema } from '../Schema/DecisionSchema'

export const registry_id = Cooperative.Registry.FreeDecision.registry_id

/**
 * Интерфейс генерации решения совета
 */
export type Action = Cooperative.Registry.FreeDecision.Action

export type Model = Cooperative.Registry.FreeDecision.Model

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
    project: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        question: { type: 'string' },
        decision: { type: 'string' },
      },
      required: ['id', 'question', 'decision'],
      additionalProperties: true,
    },
  },
  required: ['meta', 'coop', 'decision', 'project'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.FreeDecision.title,
  description: Cooperative.Registry.FreeDecision.description,
  model: Schema,
  context: Cooperative.Registry.FreeDecision.context,
  translations: Cooperative.Registry.FreeDecision.translations,
}
