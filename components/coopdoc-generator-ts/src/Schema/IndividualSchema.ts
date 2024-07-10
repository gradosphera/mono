import type { JSONSchemaType } from 'ajv'
import type { IndividualData } from '../Models/Individual'

export const individualSchema: JSONSchemaType<IndividualData> = {
  type: 'object',
  properties: {
    username: { type: 'string' },
    first_name: { type: 'string' },
    last_name: { type: 'string' },
    middle_name: { type: 'string' },
    birthdate: { type: 'string' },
    full_address: { type: 'string' },
    phone: { type: 'string' },
    email: { type: 'string', format: 'email' },
    // signature: { type: 'string' },
  },
  required: ['username', 'first_name', 'last_name', 'birthdate', 'full_address', 'phone'],
  additionalProperties: true,
}
