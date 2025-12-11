import type { JSONSchemaType } from 'ajv'
import type { InternalProjectData } from '../Models'

export const projectSchema: JSONSchemaType<InternalProjectData> = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    title: { type: 'string', nullable: true, maxLength: 200 },
    question: { type: 'string' },
    decision: { type: 'string' },
    block_num: { type: 'number', nullable: true },
    deleted: { type: 'boolean', nullable: true },
  },
  required: ['id', 'question', 'decision'],
  additionalProperties: true,
}
