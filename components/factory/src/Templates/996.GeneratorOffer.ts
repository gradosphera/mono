import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { CommonUserSchema, CooperativeSchema, VarsSchema } from '../Schema'

export const registry_id = Cooperative.Registry.GeneratorOffer.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.GeneratorOffer.Action

// Модель данных
export type Model = Cooperative.Registry.GeneratorOffer.Model

// Схема для сверки
export const Schema: JSONSchemaType<Model> = {
  type: 'object',
  properties: {
    meta: IMetaJSONSchema,
    coop: CooperativeSchema,
    vars: VarsSchema,
    common_user: CommonUserSchema,
    generator_agreement_short_hash: { type: 'string' },
  },
  required: ['meta', 'coop', 'vars', 'common_user', 'generator_agreement_short_hash'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.GeneratorOffer.title,
  description: Cooperative.Registry.GeneratorOffer.description,
  model: Schema,
  context: Cooperative.Registry.GeneratorOffer.context,
  translations: Cooperative.Registry.GeneratorOffer.translations,
}
