import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'

export const registry_id = Cooperative.Registry.GenerationToCapitalizationConvertStatement.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.GenerationToCapitalizationConvertStatement.Action

// Модель данных
export type Model = Cooperative.Registry.GenerationToCapitalizationConvertStatement.Model

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
  title: Cooperative.Registry.GenerationToCapitalizationConvertStatement.title,
  description: Cooperative.Registry.GenerationToCapitalizationConvertStatement.description,
  model: Schema,
  context: Cooperative.Registry.GenerationToCapitalizationConvertStatement.context,
  translations: Cooperative.Registry.GenerationToCapitalizationConvertStatement.translations,
}
