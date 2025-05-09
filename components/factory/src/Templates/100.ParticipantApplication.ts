import type { JSONSchemaType } from 'ajv'

import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { individualSchema } from '../Schema/IndividualSchema'
import { BankAccountSchema, VarsSchema, organizationSchema } from '../Schema'
import { CooperativeSchema } from '../Schema/CooperativeSchema'
import { entrepreneurSchema } from '../Schema/EntrepreneurSchema'

export const registry_id = Cooperative.Registry.ParticipantApplication.registry_id

/**
 * Интерфейс генерации заявления на вступление в кооператив
 */
export type Action = Cooperative.Registry.ParticipantApplication.Action

// Модель данных
export type Model = Cooperative.Registry.ParticipantApplication.Model

// Схема для сверки
export const Schema: JSONSchemaType<Model> = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['individual', 'entrepreneur', 'organization'],
    },
    individual: {
      type: 'object',
      properties: {
        ...individualSchema.properties,
      },
      required: [...individualSchema.required],
      additionalProperties: true,
      nullable: true,
    },
    organization: {
      type: 'object',
      properties: {
        ...organizationSchema.properties,
        bank_account: {
          type: 'object',
          required: BankAccountSchema.required,
          properties: BankAccountSchema.properties,
        },
      },
      required: [...organizationSchema.required, 'bank_account'],
      additionalProperties: true,
      nullable: true,
    },
    entrepreneur: {
      type: 'object',
      properties: {
        ...entrepreneurSchema.properties,
      },
      required: [...entrepreneurSchema.required],
      additionalProperties: true,
      nullable: true,
    },
    coop: {
      type: 'object',
      properties: {
        ...CooperativeSchema.properties,
      },
      required: [...CooperativeSchema.required],
      additionalProperties: true,
    },
    branch: {
      type: 'object',
      properties: {
        ...organizationSchema.properties,
      },
      required: [...organizationSchema.required],
      additionalProperties: true,
      nullable: true,
    },
    signature: {
      type: 'string',
      nullable: true,
    },
    vars: VarsSchema,
    meta: {
      type: 'object',
      properties: {
        ...IMetaJSONSchema.properties,
      },
      required: [...IMetaJSONSchema.required],
      additionalProperties: true,
    },
    initial: {
      type: 'string',
      nullable: true,
    },
    minimum: {
      type: 'string',
      nullable: true,
    },
    org_initial: {
      type: 'string',
      nullable: true,
    },
    org_minimum: {
      type: 'string',
      nullable: true,
    },
  },
  required: ['meta', 'coop', 'type'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.ParticipantApplication.title,
  description: Cooperative.Registry.ParticipantApplication.description,
  model: Schema,
  context: Cooperative.Registry.ParticipantApplication.context,
  translations: Cooperative.Registry.ParticipantApplication.translations,
}
