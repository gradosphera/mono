import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { CooperativeSchema, VarsSchema } from '../Schema'

export const registry_id = Cooperative.Registry.SosediAgreement.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.SosediAgreement.Action

// Модель данных
export type Model = Cooperative.Registry.SosediAgreement.Model

// Схема для сверки
export const Schema: JSONSchemaType<Model> = {
  type: 'object',
  properties: {
    meta: IMetaJSONSchema,
    coop: CooperativeSchema,
    vars: VarsSchema,
  },
  required: ['meta', 'coop', 'vars'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.SosediAgreement.title,
  description: Cooperative.Registry.SosediAgreement.description,
  model: Schema,
  context: Cooperative.Registry.SosediAgreement.context,
  translations: Cooperative.Registry.SosediAgreement.translations,
}
