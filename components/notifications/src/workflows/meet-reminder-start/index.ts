
import { WorkflowDefinition } from '../../types';
import { WorkflowBuilder } from '../../base/workflow-builder';
import { z } from 'zod';
import { BaseWorkflowPayload } from '../../types';
import { createEmailStep, createInAppStep, createPushStep } from '../../base/defaults';

// Схема для meet-reminder-start воркфлоу
export const meetReminderStartPayloadSchema = z.object({
  coopShortName: z.string(),
  meetId: z.number(),
  meetDate: z.string(),
  meetTime: z.string(),
  timeDescription: z.string(),
  meetUrl: z.string(),
});

export type IPayload = z.infer<typeof meetReminderStartPayloadSchema>;

export interface IWorkflow extends BaseWorkflowPayload, IPayload {} 

export const workflow: WorkflowDefinition<IWorkflow> = WorkflowBuilder
  .create<IWorkflow>()
  .name('Напоминание о предстоящем собрании')
  .workflowId('napominanie-o-predstoyashchem-sobranii')
  .description('Напоминание пайщикам о скором начале общего собрания')
  .payloadSchema(meetReminderStartPayloadSchema)
  .tags(['user']) // Для всех пользователей
  .addSteps([
    createEmailStep(
      'meet-reminder-start-email',
      'Напоминание о предстоящем общем собрании №{{payload.meetId}} в {{payload.coopShortName}}',
      'Уважаемый пайщик!<br><br>Напоминаем, что {{payload.timeDescription}} состоится общее собрание пайщиков №{{payload.meetId}} ({{payload.meetDate}} в {{payload.meetTime}}).<br><br>Для ознакомления с повесткой и подписи уведомления, пожалуйста, перейдите по ссылке:<br><a href="{{payload.meetUrl}}">{{payload.meetUrl}}</a><br><br>С уважением, Совет {{payload.coopShortName}}.'
    ),
    createInAppStep(
      'meet-reminder-start-notification',
      'Напоминание о собрании №{{payload.meetId}}',
      'Собрание начнется {{payload.timeDescription}}'
    ),
    createPushStep(
      'meet-reminder-start-push',
      'Напоминание о собрании №{{payload.meetId}}',
      'Собрание начнется {{payload.timeDescription}}'
    ),
  ])
  .build();

