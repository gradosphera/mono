import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'

export const registry_id = Cooperative.Registry.CapitalizationToMainWalletConvertStatement.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.CapitalizationToMainWalletConvertStatement.Action

// Модель данных
export type Model = Cooperative.Registry.CapitalizationToMainWalletConvertStatement.Model

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
  title: Cooperative.Registry.CapitalizationToMainWalletConvertStatement.title,
  description: Cooperative.Registry.CapitalizationToMainWalletConvertStatement.description,
  model: Schema,
  context: Cooperative.Registry.CapitalizationToMainWalletConvertStatement.context,
  translations: Cooperative.Registry.CapitalizationToMainWalletConvertStatement.translations,
}
