import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import {
  CommonUserSchema,
  CooperativeSchema,
  ExpenseItemSchema,
  ExpenseProposalDecisionBodySchema,
  ExpenseProposalHeaderSchema,
  VarsSchema,
} from '../Schema'

export const registry_id = Cooperative.Registry.ExpenseProposalDecision.registry_id

export type Action = Cooperative.Registry.ExpenseProposalDecision.Action
export type Model = Cooperative.Registry.ExpenseProposalDecision.Model

export const Schema: JSONSchemaType<Model> = {
  type: 'object',
  properties: {
    meta: IMetaJSONSchema,
    coop: CooperativeSchema,
    user: CommonUserSchema,
    vars: VarsSchema,
    proposal_hash: { type: 'string' },
    proposal_short_hash: { type: 'string' },
    proposal: ExpenseProposalHeaderSchema,
    items: {
      type: 'array',
      items: ExpenseItemSchema,
    },
    decision: ExpenseProposalDecisionBodySchema,
  },
  required: ['meta', 'coop', 'user', 'vars', 'proposal_hash', 'proposal_short_hash', 'proposal', 'items', 'decision'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.ExpenseProposalDecision.title,
  description: Cooperative.Registry.ExpenseProposalDecision.description,
  model: Schema,
  context: Cooperative.Registry.ExpenseProposalDecision.context,
  translations: Cooperative.Registry.ExpenseProposalDecision.translations,
}
