import { WorkflowDefinition } from '../../types';
import { WorkflowBuilder } from '../../base/workflow-builder';
import { z } from 'zod';
import { BaseWorkflowPayload } from '../../types';
import { createEmailStep, createInAppStep, createPushStep } from '../../base/defaults';
import { slugify } from '../../utils';

export const chatcoopCalendarEventCreatedPayloadSchema = z.object({
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

export type IPayload = z.infer<typeof chatcoopCalendarEventCreatedPayloadSchema>;

export interface IWorkflow extends BaseWorkflowPayload, IPayload {}

export const name = 'Уведомление о новом событии календаря кооператива';
export const id = slugify(name);

export const workflow: WorkflowDefinition<IWorkflow> = WorkflowBuilder.create<IWorkflow>()
  .name(name)
  .workflowId(id)
  .description('Создание события в календаре кооператива (стол связи): рассылка пайщикам')
  .payloadSchema(chatcoopCalendarEventCreatedPayloadSchema)
  .tags(['user'])
  .addSteps([
    createEmailStep(
      'chatcoop-cal-created-email',
      'Новое событие в календаре {{payload.coopShortName}}: {{payload.title}}',
      'Уважаемый пайщик!<br><br>В календаре кооператива создано новое событие.<br><br><strong>{{payload.title}}</strong><br><br>Начало: {{payload.startDate}} в {{payload.startTime}} ({{payload.timezone}})<br>Окончание: {{payload.endDate}} в {{payload.endTime}} ({{payload.timezone}})<br>Комната: {{payload.roomLabel}}<br>Автор: {{payload.actorUsername}}{% if payload.description %}<br><br>Описание:<div style="white-space:pre-wrap;">{{payload.description}}</div>{% endif %}<br><br>Открыть комнату на столе связи:<br><a href="{{payload.eventUrl}}">{{payload.eventUrl}}</a><br><br>С уважением, {{payload.coopShortName}}.'
    ),
    createInAppStep(
      'chatcoop-cal-created-inapp',
      'Новое событие: {{payload.title}}',
      '{{payload.startDate}} {{payload.startTime}} ({{payload.timezone}}), {{payload.roomLabel}}{% if payload.description %}. {{payload.description}}{% endif %}'
    ),
    createPushStep(
      'chatcoop-cal-created-push',
      'Календарь: {{payload.title}}',
      '{{payload.startDate}} {{payload.startTime}} ({{payload.timezone}})'
    ),
  ])
  .build();
