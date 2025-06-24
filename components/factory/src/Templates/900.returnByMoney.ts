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

// Локальная схема для платежного запроса с новой структурой (соответствует Model['request'])
const PaymentRequestSchema: JSONSchemaType<Model['request']> = {
  type: 'object',
  properties: {
    payment_details: { type: 'string' },
    amount: { type: 'string' },
    currency: { type: 'string' },
  },
  required: ['payment_details', 'amount', 'currency'],
  additionalProperties: false,
}

// Схема для сверки
export const Schema: JSONSchemaType<Model> = {
  type: 'object',
  properties: {
    meta: IMetaJSONSchema,
    coop: CooperativeSchema,
    vars: VarsSchema,
    user: CommonUserSchema,
    request: PaymentRequestSchema,
  },
  required: ['meta', 'coop', 'vars', 'user', 'request'],
  additionalProperties: false,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.ReturnByMoney.title,
  description: Cooperative.Registry.ReturnByMoney.description,
  model: Schema,
  context: Cooperative.Registry.ReturnByMoney.context,
  translations: Cooperative.Registry.ReturnByMoney.translations,
}
