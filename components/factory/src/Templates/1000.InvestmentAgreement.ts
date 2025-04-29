import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { BankAccountSchema, CooperativeSchema, VarsSchema, decisionSchema, entrepreneurSchema, individualSchema, organizationSchema } from '../Schema'
import { CommonRequestSchema } from '../Schema/CommonRequestSchema'
import { CommonUserSchema } from '../Schema/CommonUserSchema'
import { FirstLastMiddleNameSchema } from '../Schema/FirstLastMiddleNameSchema'
import { CommonProgramSchema } from '../Schema/CommonProgramSchema'

export const registry_id = Cooperative.Registry.InvestmentAgreement.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.InvestmentAgreement.Action

// Модель данных
export type Model = Cooperative.Registry.InvestmentAgreement.Model

export const Schema: JSONSchemaType<Model> = {
  type: 'object',
  properties: {
    meta: IMetaJSONSchema,
    coop: CooperativeSchema,
    vars: {
      ...VarsSchema,
      required: [...(VarsSchema.required || []), 'investment_agreement'],
    },
    subject: { type: 'string' },
    terms: { type: 'string' },
    uhdContract: {
      type: 'object',
      properties: {
        date: { type: 'string' },
        number: { type: 'string' },
      },
      required: ['date', 'number'],
    },
    user: CommonUserSchema,
    coopBankAccount: BankAccountSchema,
    type: {
      type: 'string',
      enum: ['individual', 'entrepreneur', 'organization'],
    },
    individual: {
      type: 'object',
      properties: {
        ...individualSchema.properties,
      },
      required: individualSchema.required,
      additionalProperties: true,
      nullable: true,
    },
    organization: {
      type: 'object',
      properties: {
        ...organizationSchema.properties,
      },
      required: organizationSchema.required,
      additionalProperties: true,
      nullable: true,
    },
    entrepreneur: {
      type: 'object',
      properties: {
        ...entrepreneurSchema.properties,
      },
      required: entrepreneurSchema.required,
      additionalProperties: true,
      nullable: true,
    },
    organizationBankAccount: {
      type: 'object',
      properties: {
        ...BankAccountSchema.properties,
      },
      required: BankAccountSchema.required,
      additionalProperties: true,
      nullable: true,
    },
    entrepreneurBankAccount: {
      type: 'object',
      properties: {
        ...BankAccountSchema.properties,
      },
      required: BankAccountSchema.required,
      additionalProperties: true,
      nullable: true,
    },
  },
  required: ['meta', 'coop', 'vars', 'uhdContract', 'user', 'coopBankAccount', 'type'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.InvestmentAgreement.title,
  description: Cooperative.Registry.InvestmentAgreement.description,
  model: Schema,
  context: Cooperative.Registry.InvestmentAgreement.context,
  translations: Cooperative.Registry.InvestmentAgreement.translations,
}
