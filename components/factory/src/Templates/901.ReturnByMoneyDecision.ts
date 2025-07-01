import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { CooperativeSchema, VarsSchema } from '../Schema'
import { decisionSchema } from '../Schema/DecisionSchema'
import { CommonUserSchema } from '../Schema/CommonUserSchema'

export const registry_id = Cooperative.Registry.ReturnByMoneyDecision.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.ReturnByMoneyDecision.Action

// Модель данных
export type Model = Cooperative.Registry.ReturnByMoneyDecision.Model

// Схема для сверки
export const Schema: JSONSchemaType<Model> = {
  type: 'object',
  properties: {
    meta: {
      type: 'object',
      properties: {
        ...IMetaJSONSchema.properties,
      },
      required: [...IMetaJSONSchema.required],
      additionalProperties: true,
    },
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
    user: CommonUserSchema,
    quantity: { type: 'string' },
    currency: { type: 'string' },
    vars: VarsSchema,
  },
  required: ['meta', 'coop', 'decision', 'user', 'quantity', 'currency', 'vars'],
  additionalProperties: false,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.ReturnByMoneyDecision.title,
  description: Cooperative.Registry.ReturnByMoneyDecision.description,
  model: Schema,
  context: Cooperative.Registry.ReturnByMoneyDecision.context,
  translations: Cooperative.Registry.ReturnByMoneyDecision.translations,
}
