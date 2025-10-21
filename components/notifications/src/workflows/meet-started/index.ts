
import { WorkflowDefinition } from '../../types';
import { WorkflowBuilder } from '../../base/workflow-builder';
import { z } from 'zod';
import { BaseWorkflowPayload } from '../../types';
import { createEmailStep, createInAppStep, createPushStep } from '../../base/defaults';

// Схема для meet-started воркфлоу
export const meetStartedPayloadSchema = z.object({
  coopShortName: z.string(),
  meetId: z.number(),
  meetEndDate: z.string(),
  meetEndTime: z.string(),
  timezone: z.string(),
  meetUrl: z.string(),
});

export type IPayload = z.infer<typeof meetStartedPayloadSchema>;

export interface IWorkflow extends BaseWorkflowPayload, IPayload {} 

export const workflow: WorkflowDefinition<IWorkflow> = WorkflowBuilder
  .create<IWorkflow>()
  .name('Собрание началось')
  .workflowId('sobranie-nachalos')
  .description('Уведомление о начале общего собрания пайщиков')
  .payloadSchema(meetStartedPayloadSchema)
  .tags(['user']) // Для всех пользователей
  .addSteps([
    createEmailStep(
      'meet-started-email',
      'Собрание пайщиков №{{payload.meetId}} в {{payload.coopShortName}} началось',
      'Уважаемый пайщик!<br><br>Сегодня началось общее собрание пайщиков №{{payload.meetId}}.<br>Собрание будет проходить до {{payload.meetEndDate}} {{payload.meetEndTime}} ({{payload.timezone}}).<br><br>Просим принять участие в голосовании по вопросам повестки дня.<br>Для голосования перейдите по ссылке:<br><a href="{{payload.meetUrl}}">{{payload.meetUrl}}</a><br><br>С уважением, Совет {{payload.coopShortName}}.'
    ),
    createInAppStep(
      'meet-started-notification',
      'Собрание №{{payload.meetId}} началось',
      'Примите участие в голосовании'
    ),
    createPushStep(
      'meet-started-push',
      'Собрание №{{payload.meetId}} началось',
      'Голосование открыто до {{payload.meetEndDate}} {{payload.meetEndTime}}'
    ),
  ])
  .build();

