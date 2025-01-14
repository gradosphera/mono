import type { JSONSchemaType } from 'ajv'
import type { CooperativeData } from '../Models/Cooperative'
import { memberSchema } from './MemberSchema'
import { individualSchema, organizationSchema } from '.'

export const CooperativeSchema: JSONSchemaType<CooperativeData> = {
  type: 'object',
  properties: {
    is_branched: { type: 'boolean' },
    registration: { type: 'string' },
    initial: { type: 'string' },
    minimum: { type: 'string' },
    org_registration: { type: 'string' },
    org_initial: { type: 'string' },
    org_minimum: { type: 'string' },
    totalMembers: { type: 'number' },
    chairman: {
      type: 'object',
      properties: individualSchema.properties,
      required: individualSchema.required,
    },
    members: {
      type: 'array',
      items: memberSchema,
    },
    ...organizationSchema.properties,
  },
  required: [...organizationSchema.required, 'is_branched', 'registration', 'initial', 'minimum', 'org_registration', 'org_initial', 'org_minimum', 'members', 'totalMembers', 'chairman'],
  additionalProperties: true,
}
