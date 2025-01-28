import type { JSONSchemaType } from 'ajv'
import type { Cooperative } from 'cooptypes'

export const CommonUserSchema: JSONSchemaType<Cooperative.Model.ICommonUser> = {
  type: 'object',
  properties: {
    full_name_or_short_name: { type: 'string' },
    birthdate_or_ogrn: { type: 'string' },
  },
  required: ['full_name_or_short_name', 'birthdate_or_ogrn'],
  additionalProperties: true,
}
