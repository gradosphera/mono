import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { CommonUserSchema, CooperativeSchema, VarsSchema } from '../Schema'

export const registry_id = Cooperative.Registry.GeneratorOfferTemplate.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.GeneratorOfferTemplate.Action

// Модель данных
export type Model = Cooperative.Registry.GeneratorOfferTemplate.Model

const CapitalProgramPrivateDataSchema = {
  type: 'object',
  additionalProperties: { type: 'string' },
} as const

// Схема для сверки
export const Schema: JSONSchemaType<Model> = {
  type: 'object',
  properties: {
    meta: IMetaJSONSchema,
    coop: CooperativeSchema,
    vars: VarsSchema,
    doc_data: CapitalProgramPrivateDataSchema,
    common_user: CommonUserSchema,
  },
  required: ['meta', 'coop', 'vars', 'common_user', 'doc_data'],
  additionalProperties: true,
} as any

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.GeneratorOfferTemplate.title,
  description: Cooperative.Registry.GeneratorOfferTemplate.description,
  model: Schema,
  context: Cooperative.Registry.GeneratorOfferTemplate.context,
  translations: Cooperative.Registry.GeneratorOfferTemplate.translations,
}
