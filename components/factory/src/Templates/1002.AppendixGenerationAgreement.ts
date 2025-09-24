import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'

export const registry_id = Cooperative.Registry.AppendixGenerationAgreement.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.AppendixGenerationAgreement.Action

// Модель данных
export type Model = Cooperative.Registry.AppendixGenerationAgreement.Model

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
  title: Cooperative.Registry.AppendixGenerationAgreement.title,
  description: Cooperative.Registry.AppendixGenerationAgreement.description,
  model: Schema,
  context: Cooperative.Registry.AppendixGenerationAgreement.context,
  translations: Cooperative.Registry.AppendixGenerationAgreement.translations,
}
