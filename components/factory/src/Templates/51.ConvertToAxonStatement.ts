import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { CommonUserSchema, CooperativeSchema, VarsSchema } from '../Schema'

export const registry_id = Cooperative.Registry.ConvertToAxonStatement.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.ConvertToAxonStatement.Action

// Модель данных
export type Model = Cooperative.Registry.ConvertToAxonStatement.Model

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
    vars: VarsSchema,
    coop: CooperativeSchema,
    commonUser: {
      type: 'object',
      properties: {
        ...CommonUserSchema.properties,
      },
      required: [...CommonUserSchema.required],
      additionalProperties: true,
    },
  },
  required: ['meta', 'vars', 'coop', 'commonUser'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.ConvertToAxonStatement.title,
  description: Cooperative.Registry.ConvertToAxonStatement.description,
  model: Schema,
  context: Cooperative.Registry.ConvertToAxonStatement.context,
  translations: Cooperative.Registry.ConvertToAxonStatement.translations,
}
