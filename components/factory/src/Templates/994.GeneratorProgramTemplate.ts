import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { CommonUserSchema, CooperativeSchema, VarsSchema } from '../Schema'

export const registry_id = Cooperative.Registry.GeneratorProgramTemplate.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.GeneratorProgramTemplate.Action

// Модель данных
export type Model = Cooperative.Registry.GeneratorProgramTemplate.Model

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
  },
  required: ['meta', 'coop', 'vars', 'doc_data'],
  additionalProperties: true,
} as any

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.GeneratorProgramTemplate.title,
  description: Cooperative.Registry.GeneratorProgramTemplate.description,
  model: Schema,
  context: Cooperative.Registry.GeneratorProgramTemplate.context,
  translations: Cooperative.Registry.GeneratorProgramTemplate.translations,
}
