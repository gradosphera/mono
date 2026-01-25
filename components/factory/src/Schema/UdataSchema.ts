import type { JSONSchemaType } from 'ajv'
import type { ExternalUdata } from '../Models/Udata'

export const udataSchema: JSONSchemaType<ExternalUdata> = {
  type: 'object',
  properties: {
    coopname: { type: 'string' },
    username: { type: 'string' },
    key: { type: 'string' },
    value: { type: 'string' },
    metadata: { type: 'object', nullable: true },
    deleted: { type: 'boolean', nullable: true },
    block_num: { type: 'number', nullable: true },
  },
  required: ['coopname', 'username', 'key', 'value'],
  additionalProperties: true,
}
