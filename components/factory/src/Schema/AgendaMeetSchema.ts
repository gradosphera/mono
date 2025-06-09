import type { JSONSchemaType } from 'ajv'
import type { Cooperative } from 'cooptypes'

// Объявляем свои интерфейсы, которые соответствуют типам из cooptypes
interface IAgendaMeet {
  type: 'regular' | 'extra'
  open_at_datetime: string
  close_at_datetime: string
}

interface IAgendaQuestion {
  number: string
  title: string
  context?: string
  decision: string
}

export const AgendaMeetSchema: JSONSchemaType<IAgendaMeet> = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['regular', 'extra'] },
    open_at_datetime: { type: 'string' },
    close_at_datetime: { type: 'string' },
  },
  required: [
    'type',
    'open_at_datetime',
    'close_at_datetime',
  ],
  additionalProperties: true,
}

export const AgendaQuestionSchema: JSONSchemaType<IAgendaQuestion> = {
  type: 'object',
  properties: {
    number: { type: 'string' },
    title: { type: 'string' },
    context: { type: 'string', nullable: true },
    decision: { type: 'string' },
  },
  required: ['number', 'title', 'decision'],
  additionalProperties: true,
}
