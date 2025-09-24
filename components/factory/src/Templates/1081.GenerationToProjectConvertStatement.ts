import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'

export const registry_id = Cooperative.Registry.GenerationToProjectConvertStatement.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.GenerationToProjectConvertStatement.Action

// Модель данных
export type Model = Cooperative.Registry.GenerationToProjectConvertStatement.Model

// Схема для сверки
export const Schema: JSONSchemaType<Model> = {
  type: 'object',
  properties: {
    meta: IMetaJSONSchema,
  },
  required: ['meta'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.GenerationToProjectConvertStatement.title,
  description: Cooperative.Registry.GenerationToProjectConvertStatement.description,
  model: Schema,
  context: Cooperative.Registry.GenerationToProjectConvertStatement.context,
  translations: Cooperative.Registry.GenerationToProjectConvertStatement.translations,
}
