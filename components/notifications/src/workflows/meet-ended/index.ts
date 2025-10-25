
import { WorkflowDefinition } from '../../types';
import { WorkflowBuilder } from '../../base/workflow-builder';
import { z } from 'zod';
import { BaseWorkflowPayload } from '../../types';
import { createEmailStep, createInAppStep, createPushStep } from '../../base/defaults';
import { slugify } from '../../utils';

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

export const name = 'Собрание завершено';
export const id = slugify(name);

export const workflow: WorkflowDefinition<IWorkflow> = WorkflowBuilder
  .create<IWorkflow>()
  .name(name)
  .workflowId(id)
  .description('Уведомление о завершении общего собрания пайщиков')
  .payloadSchema(meetEndedPayloadSchema)
  .tags(['user']) // Для всех пользователей
  .addSteps([
    createEmailStep(
      'meet-ended-email',
      '{{payload.endTitle}}',
      'Уважаемый пайщик!<br><br>{{payload.endMessage}}<br><br>Для просмотра результатов перейдите по ссылке: {{payload.meetUrl}}<br><br>С уважением, Совет {{payload.coopShortName}}.'
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

