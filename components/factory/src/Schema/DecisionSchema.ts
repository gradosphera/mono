import type { JSONSchemaType } from 'ajv'
import type { Cooperative } from 'cooptypes'

export const decisionSchema: JSONSchemaType<Cooperative.Document.IDecisionData> = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    date: { type: 'string' },
    time: { type: 'string' },
    votes_for: { type: 'number' },
    votes_against: { type: 'number' },
    votes_abstained: { type: 'number' },
    voters_percent: { type: 'number' },
  },
  required: ['id', 'date', 'time', 'votes_for', 'votes_against', 'votes_abstained', 'voters_percent'],
  additionalProperties: true,
}
