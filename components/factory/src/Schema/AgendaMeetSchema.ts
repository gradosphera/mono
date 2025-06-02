import type { JSONSchemaType } from 'ajv'
import type { Cooperative } from 'cooptypes'

// Извлекаем типы из Model документа 300
type AgendaMeet = Cooperative.Registry.AnnualGeneralMeetingAgenda.Model['meet']
type AgendaQuestion = Cooperative.Registry.AnnualGeneralMeetingAgenda.Model['questions'][0]

export const AgendaMeetSchema: JSONSchemaType<AgendaMeet> = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['regular', 'extraordinary'] },
    created_at_day: { type: 'string' },
    created_at_month: { type: 'string' },
    created_at_year: { type: 'string' },
    open_at_date: { type: 'string' },
    open_at_time: { type: 'string' },
    registration_datetime: { type: 'string' },
    close_at_datetime: { type: 'string' },
    presider_last_name: { type: 'string' },
    presider_first_name: { type: 'string' },
    presider_middle_name: { type: 'string' },
  },
  required: [
    'type',
    'created_at_day',
    'created_at_month',
    'created_at_year',
    'open_at_date',
    'open_at_time',
    'registration_datetime',
    'close_at_datetime',
    'presider_last_name',
    'presider_first_name',
    'presider_middle_name',
  ],
  additionalProperties: true,
}

export const AgendaQuestionSchema: JSONSchemaType<AgendaQuestion> = {
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
