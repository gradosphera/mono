
import { WorkflowDefinition } from '../../types';
import { WorkflowBuilder } from '../../base/workflow-builder';
import { z } from 'zod';
import { BaseWorkflowPayload } from '../../types';
import { createEmailStep, createInAppStep, createPushStep } from '../../base/defaults';

// Схема для meet-restart воркфлоу
export const meetRestartPayloadSchema = z.object({
  coopShortName: z.string(),
  meetId: z.number(),
  meetDate: z.string(),
  meetTime: z.string(),
  meetEndDate: z.string(),
  meetEndTime: z.string(),
  timezone: z.string(),
  meetUrl: z.string(),
});

export type IPayload = z.infer<typeof meetRestartPayloadSchema>;

export interface IWorkflow extends BaseWorkflowPayload, IPayload {} 

export const workflow: WorkflowDefinition<IWorkflow> = WorkflowBuilder
  .create<IWorkflow>()
  .name('Назначена новая дата повторного собрания')
  .workflowId('naznachena-novaya-data-povtornogo-sobraniya')
  .description('Уведомление о новой дате проведения повторного собрания')
  .payloadSchema(meetRestartPayloadSchema)
  .tags(['user']) // Для всех пользователей
  .addSteps([
    createEmailStep(
      'meet-restart-email',
      'Назначена новая дата повторного собрания №{{payload.meetId}} в {{payload.coopShortName}}',
      'Уважаемый пайщик!<br><br>Назначена новая дата проведения повторного собрания №{{payload.meetId}}.<br><br>Дата и время начала: {{payload.meetDate}} в {{payload.meetTime}} ({{payload.timezone}})<br>Дата и время завершения: {{payload.meetEndDate}} в {{payload.meetEndTime}} ({{payload.timezone}})<br><br>Повестка собрания остается прежней.<br>Для ознакомления с повесткой и подписи уведомления, пожалуйста, перейдите по ссылке:<br><a href="{{payload.meetUrl}}">{{payload.meetUrl}}</a><br><br>С уважением, Совет {{payload.coopShortName}}.'
    ),
    createInAppStep(
      'meet-restart-notification',
      'Новая дата собрания №{{payload.meetId}}',
      'Повторное собрание: {{payload.meetDate}} в {{payload.meetTime}}'
    ),
    createPushStep(
      'meet-restart-push',
      'Новая дата собрания №{{payload.meetId}}',
      'Повторное собрание {{payload.meetDate}} в {{payload.meetTime}}'
    ),
  ])
  .build();

