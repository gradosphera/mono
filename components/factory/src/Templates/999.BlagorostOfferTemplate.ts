import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { CooperativeSchema, VarsSchema } from '../Schema'

export const registry_id = Cooperative.Registry.BlagorostOfferTemplate.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.BlagorostOfferTemplate.Action

// Модель данных
export type Model = Cooperative.Registry.BlagorostOfferTemplate.Model

// Схема для сверки
export const Schema: JSONSchemaType<Model> = {
  type: 'object',
  properties: {
    meta: IMetaJSONSchema,
    coop: CooperativeSchema,
    vars: VarsSchema,
    blagorost_provision: {
      type: 'object',
      properties: {
        protocol_number: { type: 'string' },
        protocol_date: { type: 'string' },
      },
      required: ['protocol_number', 'protocol_date'],
    },
  },
  required: ['meta', 'coop', 'vars', 'blagorost_provision'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.BlagorostOfferTemplate.title,
  description: Cooperative.Registry.BlagorostOfferTemplate.description,
  model: Schema,
  context: Cooperative.Registry.BlagorostOfferTemplate.context,
  translations: Cooperative.Registry.BlagorostOfferTemplate.translations,
}
