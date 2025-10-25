
import { WorkflowDefinition } from '../../types';
import { WorkflowBuilder } from '../../base/workflow-builder';
import { z } from 'zod';
import { BaseWorkflowPayload } from '../../types';
import { createEmailStep, createInAppStep, createPushStep } from '../../base/defaults';
import { slugify } from '../../utils';

// Схема для meet-reminder-end воркфлоу
export const meetReminderEndPayloadSchema = z.object({
  coopShortName: z.string(),
  meetId: z.number(),
  meetEndDate: z.string(),
  meetEndTime: z.string(),
  timeDescription: z.string(),
  timezone: z.string(),
  meetUrl: z.string(),
});

export type IPayload = z.infer<typeof meetReminderEndPayloadSchema>;

export interface IWorkflow extends BaseWorkflowPayload, IPayload {}

export const name = 'Напоминание о завершении собрания';
export const id = slugify(name);

export const workflow: WorkflowDefinition<IWorkflow> = WorkflowBuilder
  .create<IWorkflow>()
  .name(name)
  .workflowId(id)
  .description('Напоминание пайщикам о скором завершении общего собрания')
  .payloadSchema(meetReminderEndPayloadSchema)
  .tags(['user']) // Для всех пользователей
  .addSteps([
    createEmailStep(
      'meet-reminder-end-email',
      'Напоминание о завершении собрания пайщиков №{{payload.meetId}} в {{payload.coopShortName}}',
      'Уважаемый пайщик!<br><br>Общее собрание №{{payload.meetId}} завершится {{payload.timeDescription}} ({{payload.meetEndDate}} в {{payload.meetEndTime}} {{payload.timezone}}).<br><br>Если вы еще не проголосовали, пожалуйста, примите участие в голосовании по вопросам повестки дня.<br>Для голосования перейдите по ссылке:<br><a href="{{payload.meetUrl}}">{{payload.meetUrl}}</a><br><br>С уважением, Совет {{payload.coopShortName}}.'
    ),
    createInAppStep(
      'meet-reminder-end-notification',
      'Собрание №{{payload.meetId}} скоро завершится',
      'Завершится {{payload.timeDescription}}'
    ),
    createPushStep(
      'meet-reminder-end-push',
      'Собрание №{{payload.meetId}} скоро завершится',
      'Успейте проголосовать'
    ),
  ])
  .build();

