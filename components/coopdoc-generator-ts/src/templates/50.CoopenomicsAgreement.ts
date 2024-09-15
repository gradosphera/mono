import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { IGenerate, IMetaDocument, ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { CooperativeSchema, VarsSchema, organizationSchema } from '../Schema'

export const registry_id = Cooperative.Registry.CoopenomicsAgreement.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.CoopenomicsAgreement.Action

// Модель данных
export type Model = Cooperative.Registry.CoopenomicsAgreement.Model

// Схема для сверки
export const Schema: JSONSchemaType<Model> = {
  type: 'object',
  properties: {
    meta: IMetaJSONSchema,
    coop: CooperativeSchema,
    covars: VarsSchema,
    partner: organizationSchema,
  },
  required: ['meta', 'coop', 'covars', 'partner'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.CoopenomicsAgreement.title,
  description: Cooperative.Registry.CoopenomicsAgreement.description,
  model: Schema,
  context: Cooperative.Registry.CoopenomicsAgreement.context,
  translations: Cooperative.Registry.CoopenomicsAgreement.translations,
}
