import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { CooperativeSchema, VarsSchema } from '../Schema'
import { CommonUserSchema } from '../Schema/CommonUserSchema'
import { UHDContractSchema } from '../Schema/UHDContractSchema'
import { ContributionAmountSchema } from '../Schema/ContributionAmountSchema'

export const registry_id = Cooperative.Registry.InvestMembershipConvertation.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.InvestMembershipConvertation.Action

// Модель данных
export type Model = Cooperative.Registry.InvestMembershipConvertation.Model

export const Schema: JSONSchemaType<Model> = {
  type: 'object',
  properties: {
    meta: IMetaJSONSchema,
    coop: CooperativeSchema,
    uhdContract: UHDContractSchema,
    user: CommonUserSchema,
    vars: VarsSchema,
    contribution: ContributionAmountSchema,
    appendix: {
      type: 'object',
      properties: {
        number: { type: 'string' },
      },
      required: ['number'],
      additionalProperties: true,
    },
  },
  required: ['meta', 'coop', 'uhdContract', 'user', 'contribution', 'appendix', 'vars'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.InvestMembershipConvertation.title,
  description: Cooperative.Registry.InvestMembershipConvertation.description,
  model: Schema,
  context: Cooperative.Registry.InvestMembershipConvertation.context,
  translations: Cooperative.Registry.InvestMembershipConvertation.translations,
}
