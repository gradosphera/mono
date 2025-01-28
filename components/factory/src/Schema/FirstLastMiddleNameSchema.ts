import type { JSONSchemaType } from 'ajv'
import type { Cooperative } from 'cooptypes'

export const FirstLastMiddleNameSchema: JSONSchemaType<Cooperative.Model.IFirstLastMiddleName> = {
  type: 'object',
  properties: {
    first_name: { type: 'string' },
    last_name: { type: 'string' },
    middle_name: { type: 'string' },
  },
  required: ['first_name', 'last_name', 'middle_name'],
  additionalProperties: true,
}
