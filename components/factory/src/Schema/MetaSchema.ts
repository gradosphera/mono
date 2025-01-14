import type { JSONSchemaType } from 'ajv'
import type { IMetaDocument } from '../Interfaces'

export const IMetaJSONSchema: JSONSchemaType<IMetaDocument> = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    registry_id: { type: 'number' },
    lang: { type: 'string', enum: ['ru'] },
    generator: { type: 'string' },
    version: { type: 'string' },
    coopname: { type: 'string' },
    username: { type: 'string' },
    created_at: { type: 'string' },
    block_num: { type: 'number' },
    timezone: { type: 'string' },
    links: { type: 'array', items: { type: 'string' } },
  },
  required: [
    'title',
    'registry_id',
    'lang',
    'generator',
    'version',
    'coopname',
    'username',
    'created_at',
    'block_num',
    'timezone',
  ],
  additionalProperties: true,
}
