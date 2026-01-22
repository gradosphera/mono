import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { IGenerate, IMetaDocument, ITemplate } from '../Interfaces'
import type { IVars } from '../Models'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { VarsSchema } from '../Schema'

export const registry_id = Cooperative.Registry.BlagorostProgramTemplate.registry_id

// Модель действия для генерации
export interface Action extends IGenerate {
  registry_id: number
}

// Модель данных
export interface Model {
  meta: IMetaDocument
  vars: IVars
}

// Схема для сверки
export const Schema: JSONSchemaType<Model> = {
  type: 'object',
  properties: {
    meta: IMetaJSONSchema,
    vars: VarsSchema,
  },
  required: ['meta', 'vars'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.BlagorostProgramTemplate.title,
  description: Cooperative.Registry.BlagorostProgramTemplate.description,
  model: Schema,
  context: Cooperative.Registry.BlagorostProgramTemplate.context,
  translations: Cooperative.Registry.BlagorostProgramTemplate.translations,
}
