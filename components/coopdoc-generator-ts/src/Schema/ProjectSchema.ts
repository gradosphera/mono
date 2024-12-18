import type { JSONSchemaType } from 'ajv'
import type { InternalProjectData } from '../Models'

export const projectSchema: JSONSchemaType<InternalProjectData> = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    header: { type: 'string' },
    question: { type: 'string' },
    decision: { type: 'string' },
    block_num: { type: 'number', nullable: true },
    deleted: { type: 'boolean', nullable: true },
  },
  required: ['id', 'header', 'question', 'decision'],
  additionalProperties: true,
}
