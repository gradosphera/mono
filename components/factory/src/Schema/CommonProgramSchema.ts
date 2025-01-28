import type { JSONSchemaType } from 'ajv'
import type { Cooperative } from 'cooptypes'

export const CommonProgramSchema: JSONSchemaType<Cooperative.Model.ICommonProgram> = {
  type: 'object',
  properties: {
    name: { type: 'string' },
  },
  required: ['name'],
  additionalProperties: true,
}
