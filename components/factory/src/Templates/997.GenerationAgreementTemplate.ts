import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { CooperativeSchema, VarsSchema } from '../Schema'

export const registry_id = Cooperative.Registry.GenerationAgreementTemplate.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.GenerationAgreementTemplate.Action

// Модель данных
export type Model = Cooperative.Registry.GenerationAgreementTemplate.Model

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
  title: Cooperative.Registry.GenerationAgreementTemplate.title,
  description: Cooperative.Registry.GenerationAgreementTemplate.description,
  model: Schema,
  context: Cooperative.Registry.GenerationAgreementTemplate.context,
  translations: Cooperative.Registry.GenerationAgreementTemplate.translations,
}