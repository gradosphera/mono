import { WorkflowDefinition } from '../../types';
import { WorkflowBuilder } from '../../base/workflow-builder';
import { z } from 'zod';
import { BaseWorkflowPayload } from '../../types';
import { createEmailStep, createInAppStep, createPushStep } from '../../base/defaults';
import { slugify } from '../../utils';

// Схема для approval-response воркфлоу
export const approvalResponsePayloadSchema = z.object({
  userName: z.string(),
  approvalStatus: z.enum(['approved', 'declined']),
  approvalStatusText: z.string(),
  approvalId: z.string(),
  coopname: z.string(),
  coopShortName: z.string(),
  approvalUrl: z.string().optional(),
});

export type IPayload = z.infer<typeof approvalResponsePayloadSchema>;

export interface IWorkflow extends BaseWorkflowPayload, IPayload {}

export const name = 'Ответ на запрос одобрения';
export const id = slugify(name);

export const workflow: WorkflowDefinition<IWorkflow> = WorkflowBuilder
  .create<IWorkflow>()
  .name(name)
  .workflowId(id)
  .description('Уведомление пользователю об одобрении или отклонении его запроса председателем')
  .payloadSchema(approvalResponsePayloadSchema)
  .tags(['user']) // Для всех пользователей
  .addSteps([
    createEmailStep(
      'approval-response-email',
      'Ваш запрос {{payload.approvalStatusText}} председателем совета',
      `Уважаемый {{payload.userName}}!

Ваш запрос {{payload.approvalId}} {{payload.approvalStatusText}} председателем совета {{payload.coopShortName}}.

Подробнее по ссылке: {{payload.approvalUrl}}`
    ),
    createInAppStep(
      'approval-response-notification',
      'Ответ на запрос одобрения',
      'Ваш запрос {{payload.approvalId}} {{payload.approvalStatusText}} председателем совета {{payload.coopShortName}}'
    ),
    createPushStep(
      'approval-response-push',
      'Ответ на запрос одобрения',
      'Запрос {{payload.approvalId}} {{payload.approvalStatusText}}'
    ),
  ])
  .build();
