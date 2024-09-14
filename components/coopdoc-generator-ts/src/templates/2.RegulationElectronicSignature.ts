import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { IGenerate, IMetaDocument, ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { CooperativeSchema, CovarsSchema } from '../Schema'

export const registry_id = Cooperative.Registry.RegulationElectronicSignature.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.RegulationElectronicSignature.Action

// Модель данных
export type Model = Cooperative.Registry.RegulationElectronicSignature.Model

// Схема для сверки
export const Schema: JSONSchemaType<Model> = {
  type: 'object',
  properties: {
    meta: IMetaJSONSchema,
    coop: CooperativeSchema,
    covars: CovarsSchema,
  },
  required: ['meta', 'coop', 'covars'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.RegulationElectronicSignature.title,
  description: Cooperative.Registry.RegulationElectronicSignature.description,
  model: Schema,
  context: Cooperative.Registry.RegulationElectronicSignature.context,
  translations: Cooperative.Registry.RegulationElectronicSignature.translations,
}
