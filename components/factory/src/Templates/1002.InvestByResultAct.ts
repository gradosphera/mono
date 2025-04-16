import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { BankAccountSchema, CooperativeSchema, VarsSchema, decisionSchema, entrepreneurSchema, individualSchema, organizationSchema } from '../Schema'
import { CommonUserSchema } from '../Schema/CommonUserSchema'
import { UHDContractSchema } from '../Schema/UHDContractSchema'
import { IntellectualResultSchema } from '../Schema/IntellectualResultSchema'

export const registry_id = Cooperative.Registry.InvestByResultAct.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.InvestByResultAct.Action

// Модель данных
export type Model = Cooperative.Registry.InvestByResultAct.Model

export const Schema: JSONSchemaType<Model> = {
  type: 'object',
  properties: {
    meta: IMetaJSONSchema,
    coop: CooperativeSchema,
    vars: VarsSchema,
    uhdContract: UHDContractSchema,
    user: CommonUserSchema,
    result: IntellectualResultSchema,
    decision: decisionSchema,
    act: {
      type: 'object',
      properties: {
        number: { type: 'string' },
      },
      required: ['number'],
      additionalProperties: true,
    },
  },
  required: ['meta', 'coop', 'vars', 'uhdContract', 'result', 'user'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.InvestByResultAct.title,
  description: Cooperative.Registry.InvestByResultAct.description,
  model: Schema,
  context: Cooperative.Registry.InvestByResultAct.context,
  translations: Cooperative.Registry.InvestByResultAct.translations,
}
