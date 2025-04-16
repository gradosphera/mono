import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { BankAccountSchema, CooperativeSchema, VarsSchema, decisionSchema, entrepreneurSchema, individualSchema, organizationSchema } from '../Schema'
import { CommonUserSchema } from '../Schema/CommonUserSchema'
import { UHDContractSchema } from '../Schema/UHDContractSchema'
import { IntellectualResultSchema } from '../Schema/IntellectualResultSchema'
import { ContributionAmountSchema } from '../Schema/ContributionAmountSchema'

export const registry_id = Cooperative.Registry.InvestByMoneyStatement.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.InvestByMoneyStatement.Action

// Модель данных
export type Model = Cooperative.Registry.InvestByMoneyStatement.Model

export const Schema: JSONSchemaType<Model> = {
  type: 'object',
  properties: {
    meta: IMetaJSONSchema,
    coop: CooperativeSchema,
    uhdContract: UHDContractSchema,
    user: CommonUserSchema,
    contribution: ContributionAmountSchema,
  },
  required: ['meta', 'coop', 'uhdContract', 'user', 'contribution'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.InvestByMoneyStatement.title,
  description: Cooperative.Registry.InvestByMoneyStatement.description,
  model: Schema,
  context: Cooperative.Registry.InvestByMoneyStatement.context,
  translations: Cooperative.Registry.InvestByMoneyStatement.translations,
}
