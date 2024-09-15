import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { IGenerate, IMetaDocument, ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { CooperativeSchema, VarsSchema } from '../Schema'

export const registry_id = Cooperative.Registry.WalletAgreement.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.WalletAgreement.Action

// Модель данных
export type Model = Cooperative.Registry.WalletAgreement.Model

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
  title: Cooperative.Registry.WalletAgreement.title,
  description: Cooperative.Registry.WalletAgreement.description,
  model: Schema,
  context: Cooperative.Registry.WalletAgreement.context,
  translations: Cooperative.Registry.WalletAgreement.translations,
}
