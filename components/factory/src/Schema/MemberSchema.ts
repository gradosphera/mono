import type { JSONSchemaType } from 'ajv'
import type { ExternalIndividualData } from '../Models/Individual'
import { individualSchema } from '.'

export const memberSchema: JSONSchemaType<ExternalIndividualData & { is_chairman: boolean }> = {
  type: 'object',
  properties: {
    ...individualSchema.properties,
    is_chairnam: { type: 'boolean' },
  },
  required: [...individualSchema.required, 'is_chairman'],
  additionalProperties: true,
}
