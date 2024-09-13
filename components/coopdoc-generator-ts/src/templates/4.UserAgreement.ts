import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { IGenerate, IMetaDocument, ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'

export const registry_id = Cooperative.Registry.UserAgreement.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.UserAgreement.Action

// Модель данных
export type Model = Cooperative.Registry.UserAgreement.Model

// Схема для сверки
export const Schema: JSONSchemaType<Model> = {
  type: 'object',
  properties: {
    meta: IMetaJSONSchema,
    // {
    //   type: 'object',
    //   properties: {
    //     ...IMetaJSONSchema.properties,
    //   },
    //   required: [...IMetaJSONSchema.required],
    //   additionalProperties: true,
    // },

  },
  required: ['meta'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.UserAgreement.title,
  description: Cooperative.Registry.UserAgreement.description,
  model: Schema,
  context: Cooperative.Registry.UserAgreement.context,
  translations: Cooperative.Registry.UserAgreement.translations,
}
