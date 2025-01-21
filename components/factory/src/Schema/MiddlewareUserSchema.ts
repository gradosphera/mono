import type { JSONSchemaType } from 'ajv'
import type { Cooperative } from 'cooptypes'

export const IMiddlewareUserSchema: JSONSchemaType<Cooperative.Model.IMiddlewareUser> = {
  type: 'object',
  properties: {
    full_name: { type: 'string' },
  },
  required: ['full_name'],
  additionalProperties: true,
}
