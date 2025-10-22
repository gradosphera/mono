
import { WorkflowDefinition } from '../../types';
import { WorkflowBuilder } from '../../base/workflow-builder';
import { z } from 'zod';
import { BaseWorkflowPayload } from '../../types';
import { createEmailStep, createInAppStep, createPushStep } from '../../base/defaults';

// Схема для meet-initial воркфлоу
export const meetInitialPayloadSchema = z.object({
  coopShortName: z.string(),
  meetId: z.number(),
  meetDate: z.string(),
  meetTime: z.string(),
  meetEndDate: z.string(),
  meetEndTime: z.string(),
  timezone: z.string(),
  meetUrl: z.string(),
});

export type IPayload = z.infer<typeof meetInitialPayloadSchema>;

export interface IWorkflow extends BaseWorkflowPayload, IPayload {}

export const id = 'uvedomlenie-o-novom-obshchem-sobranii';

export const workflow: WorkflowDefinition<IWorkflow> = WorkflowBuilder
  .create<IWorkflow>()
  .name('Уведомление о новом общем собрании')
  .workflowId(id)
  .description('Начальное уведомление о назначении нового общего собрания пайщиков')
  .payloadSchema(meetInitialPayloadSchema)
  .tags(['user']) // Для всех пользователей
  .addSteps([
    createEmailStep(
      'meet-initial-email',
      'Уведомление о общем собрании пайщиков №{{payload.meetId}} в {{payload.coopShortName}}',
      'Уважаемый пайщик!<br><br>В кооперативе объявлено новое общее собрание №{{payload.meetId}}.<br><br>Дата и время начала: {{payload.meetDate}} в {{payload.meetTime}} ({{payload.timezone}})<br>Дата и время завершения: {{payload.meetEndDate}} в {{payload.meetEndTime}} ({{payload.timezone}})<br><br>Для ознакомления с повесткой, пожалуйста, перейдите по ссылке:<br><a href="{{payload.meetUrl}}">{{payload.meetUrl}}</a><br><br>С уважением, Совет {{payload.coopShortName}}.'
    ),
    createInAppStep(
      'meet-initial-notification',
      'Новое общее собрание №{{payload.meetId}}',
      'Назначено собрание на {{payload.meetDate}} в {{payload.meetTime}}'
    ),
    createPushStep(
      'meet-initial-push',
      'Новое общее собрание №{{payload.meetId}}',
      'Собрание {{payload.meetDate}} в {{payload.meetTime}}'
    ),
  ])
  .build();

