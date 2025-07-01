import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { CooperativeSchema, VarsSchema } from '../Schema'
import { CommonUserSchema } from '../Schema/CommonUserSchema'

export const registry_id = Cooperative.Registry.ReturnByMoney.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.ReturnByMoney.Action

// Модель данных
export type Model = Cooperative.Registry.ReturnByMoney.Model

// Схема для сверки
export const Schema: JSONSchemaType<Model> = {
  type: 'object',
  properties: {
    meta: IMetaJSONSchema,
    coop: CooperativeSchema,
    vars: VarsSchema,
    user: CommonUserSchema,
    payment_details: { type: 'string' },
    quantity: { type: 'string' },
    currency: { type: 'string' },
    payment_hash: { type: 'string' },
  },
  required: ['meta', 'coop', 'vars', 'user', 'payment_details', 'quantity', 'currency', 'payment_hash'],
  additionalProperties: false,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.ReturnByMoney.title,
  description: Cooperative.Registry.ReturnByMoney.description,
  model: Schema,
  context: Cooperative.Registry.ReturnByMoney.context,
  translations: Cooperative.Registry.ReturnByMoney.translations,
}
