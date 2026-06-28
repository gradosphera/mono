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

const CapitalProgramPrivateDataSchema: JSONSchemaType<Cooperative.Registry.CapitalProgramPrivateData> = {
  type: 'object',
  properties: {
    approval_protocol_number: { type: 'string' },
    approval_protocol_day: { type: 'string' },
    approval_protocol_month: { type: 'string' },
    approval_protocol_year: { type: 'string' },
    cooperative_name: { type: 'string' },
    cooperative_short_name: { type: 'string' },
    cooperative_quoted_name: { type: 'string' },
    website: { type: 'string' },
    chairman_full_name: { type: 'string' },
    generator_program_purpose: { type: 'string' },
    eoap_definition: { type: 'string' },
    generator_task_goal: { type: 'string' },
    idea_unit_cost: { type: 'string' },
    idea_unit_cost_words: { type: 'string' },
    blagorost_goal_expansion: { type: 'string' },
    blagorost_task_expansion: { type: 'string' },
    blagorost_task_development: { type: 'string' },
    return_source_description: { type: 'string' },
    return_additional_source: { type: 'string' },
    offer_template_number: { type: 'string' },
  },
  required: Cooperative.Registry.capitalProgramPrivateDataRequiredFields,
  additionalProperties: false,
}

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
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.BlagorostOfferTemplate.title,
  description: Cooperative.Registry.BlagorostOfferTemplate.description,
  model: Schema,
  context: Cooperative.Registry.BlagorostOfferTemplate.context,
  translations: Cooperative.Registry.BlagorostOfferTemplate.translations,
}
