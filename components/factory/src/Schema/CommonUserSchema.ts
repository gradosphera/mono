import type { JSONSchemaType } from 'ajv'
import type { Cooperative } from 'cooptypes'

export const CommonUserSchema: JSONSchemaType<Cooperative.Model.ICommonUser> = {
  type: 'object',
  properties: {
    full_name_or_short_name: { type: 'string' },
    birthdate_or_ogrn: { type: 'string' },
    abbr_full_name: { type: 'string' },
    email: { type: 'string' },
    phone: { type: 'string' },
  },
  required: ['full_name_or_short_name', 'birthdate_or_ogrn', 'abbr_full_name', 'email', 'phone'],
  additionalProperties: true,
}
