import type { JSONSchemaType } from 'ajv'
import type { Cooperative } from 'cooptypes'

export const UHDContractSchema: JSONSchemaType<Cooperative.Document.IUHDContract> = {
  type: 'object',
  properties: {
    number: { type: 'string' },
    date: { type: 'string' },
  },
  required: ['number', 'date'],
  additionalProperties: true,
}
