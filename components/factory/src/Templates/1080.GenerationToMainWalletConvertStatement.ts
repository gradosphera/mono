import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'

export const registry_id = Cooperative.Registry.GenerationToMainWalletConvertStatement.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.GenerationToMainWalletConvertStatement.Action

// Модель данных
export type Model = Cooperative.Registry.GenerationToMainWalletConvertStatement.Model

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
  title: Cooperative.Registry.GenerationToMainWalletConvertStatement.title,
  description: Cooperative.Registry.GenerationToMainWalletConvertStatement.description,
  model: Schema,
  context: Cooperative.Registry.GenerationToMainWalletConvertStatement.context,
  translations: Cooperative.Registry.GenerationToMainWalletConvertStatement.translations,
}
