
import { WorkflowDefinition } from '../../types';
import { WorkflowBuilder } from '../../base/workflow-builder';
import { z } from 'zod';
import { BaseWorkflowPayload } from '../../types';
import { createEmailStep, createInAppStep, createPushStep } from '../../base/defaults';

// Схема для meet-ended воркфлоу
export const meetEndedPayloadSchema = z.object({
  coopShortName: z.string(),
  meetId: z.number(),
  meetUrl: z.string(),
  endType: z.enum(['EXPIRED_NO_QUORUM', 'VOTING_COMPLETED', 'CLOSED']),
  endTitle: z.string(),
  endMessage: z.string(),
});

export type IPayload = z.infer<typeof meetEndedPayloadSchema>;

export interface IWorkflow extends BaseWorkflowPayload, IPayload {}

export const id = 'sobranie-zaversheno';

export const workflow: WorkflowDefinition<IWorkflow> = WorkflowBuilder
  .create<IWorkflow>()
  .name('Собрание завершено')
  .workflowId(id)
  .description('Уведомление о завершении общего собрания пайщиков')
  .payloadSchema(meetEndedPayloadSchema)
  .tags(['user']) // Для всех пользователей
  .addSteps([
    createEmailStep(
      'meet-ended-email',
      '{{payload.endTitle}}',
      'Уважаемый пайщик!<br><br>{{payload.endMessage}}<br><br>{% if payload.meetUrl %}Для просмотра результатов перейдите по ссылке:<br><a href="{{payload.meetUrl}}">{{payload.meetUrl}}</a><br><br>{% endif %}С уважением, Совет {{payload.coopShortName}}.'
    ),
    createInAppStep(
      'meet-ended-notification',
      '{{payload.endTitle}}',
      '{{payload.endMessage}}'
    ),
    createPushStep(
      'meet-ended-push',
      'Собрание №{{payload.meetId}}',
      '{{payload.endTitle}}'
    ),
  ])
  .build();

