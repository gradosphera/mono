import { WorkflowDefinition } from '../../types';
import { WorkflowBuilder } from '../../base/workflow-builder';
import { z } from 'zod';
import { BaseWorkflowPayload } from '../../types';
import { createEmailStep, createInAppStep, createPushStep } from '../../base/defaults';
import { slugify } from '../../utils';

export const chatcoopCalendarEventUpdatedPayloadSchema = z.object({
  coopShortName: z.string(),
  title: z.string(),
  description: z.string().optional(),
  startDate: z.string(),
  startTime: z.string(),
  endDate: z.string(),
  endTime: z.string(),
  timezone: z.string(),
  roomLabel: z.string(),
  eventUrl: z.string(),
  actorUsername: z.string(),
});

export type IPayload = z.infer<typeof chatcoopCalendarEventUpdatedPayloadSchema>;

export interface IWorkflow extends BaseWorkflowPayload, IPayload {}

export const name = 'Уведомление об изменении события календаря кооператива';
export const id = slugify(name);

export const workflow: WorkflowDefinition<IWorkflow> = WorkflowBuilder.create<IWorkflow>()
  .name(name)
  .workflowId(id)
  .description('Изменение события в календаре кооператива: рассылка пайщикам с актуальным расписанием')
  .payloadSchema(chatcoopCalendarEventUpdatedPayloadSchema)
  .tags(['user'])
  .addSteps([
    createEmailStep(
      'chatcoop-cal-updated-email',
      'Изменено событие календаря {{payload.coopShortName}}: {{payload.title}}',
      'Уважаемый пайщик!<br><br>Событие в календаре кооператива обновлено. Актуальные данные:<br><br><strong>{{payload.title}}</strong><br><br>Начало: {{payload.startDate}} в {{payload.startTime}} ({{payload.timezone}})<br>Окончание: {{payload.endDate}} в {{payload.endTime}} ({{payload.timezone}})<br>Комната: {{payload.roomLabel}}<br>Изменил(а): {{payload.actorUsername}}{% if payload.description %}<br><br>Описание:<div style="white-space:pre-wrap;">{{payload.description}}</div>{% endif %}<br><br>Открыть на столе связи:<br><a href="{{payload.eventUrl}}">{{payload.eventUrl}}</a><br><br>С уважением, {{payload.coopShortName}}.'
    ),
    createInAppStep(
      'chatcoop-cal-updated-inapp',
      'Событие обновлено: {{payload.title}}',
      '{{payload.startDate}} {{payload.startTime}} ({{payload.timezone}}), {{payload.roomLabel}}{% if payload.description %}. {{payload.description}}{% endif %}'
    ),
    createPushStep(
      'chatcoop-cal-updated-push',
      'Календарь обновлён: {{payload.title}}',
      '{{payload.startDate}} {{payload.startTime}} ({{payload.timezone}})'
    ),
  ])
  .build();
