import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { IGenerate, IMetaDocument, ITemplate } from '../Interfaces'
import type { IVars } from '../Models'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { VarsSchema } from '../Schema'

export const registry_id = Cooperative.Registry.BlagorostProvision.registry_id

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
  title: Cooperative.Registry.BlagorostProvision.title,
  description: Cooperative.Registry.BlagorostProvision.description,
  model: Schema,
  context: Cooperative.Registry.BlagorostProvision.context,
  translations: Cooperative.Registry.BlagorostProvision.translations,
}
