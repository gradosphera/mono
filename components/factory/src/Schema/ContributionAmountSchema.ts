import type { JSONSchemaType } from 'ajv'
import type { Cooperative } from 'cooptypes'

export const ContributionAmountSchema: JSONSchemaType<Cooperative.Document.IContributionAmount> = {
  type: 'object',
  properties: {
    amount: { type: 'number' },
    currency: { type: 'string' },
    words: { type: 'string' },
  },
  required: ['amount', 'currency', 'words'],
  additionalProperties: true,
}
