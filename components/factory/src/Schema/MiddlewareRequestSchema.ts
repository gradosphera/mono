import type { JSONSchemaType } from 'ajv'
import type { Cooperative } from 'cooptypes'

export const MiddlewareRequestSchema: JSONSchemaType<Cooperative.Model.IMiddlewareRequest> = {
  type: 'object',
  properties: {
    hash: { type: 'string' },
    title: { type: 'string' },
    unit_of_measurement: { type: 'string' },
    units: { type: 'number' },
    unit_cost: { type: 'number' },
    total_cost: { type: 'number' },
    currency: { type: 'string' },
    type: { type: 'string' },
  },
  required: [
    'hash',
    'title',
    'unit_of_measurement',
    'units',
    'unit_cost',
    'total_cost',
    'currency',
    'type',
  ],
  additionalProperties: true,
}
