import { WorkflowDefinition } from '../../types';
import { WorkflowBuilder } from '../../base/workflow-builder';
import { z } from 'zod';
import { BaseWorkflowPayload } from '../../types';
import { createEmailStep, createInAppStep, createPushStep } from '../../base/defaults';

// Схема для approval-response воркфлоу
export const approvalResponsePayloadSchema = z.object({
  userName: z.string(),
  approvalStatus: z.enum(['approved', 'declined']),
  approvalId: z.string(),
  coopname: z.string(),
  coopShortName: z.string(),
  approvalUrl: z.string().optional(),
});

export type IPayload = z.infer<typeof approvalResponsePayloadSchema>;

export interface IWorkflow extends BaseWorkflowPayload, IPayload {}

export const id = 'otvet-na-zapros-odobreniya';

export const workflow: WorkflowDefinition<IWorkflow> = WorkflowBuilder
  .create<IWorkflow>()
  .name('Ответ на запрос одобрения')
  .workflowId(id)
  .description('Уведомление пользователю об одобрении или отклонении его запроса председателем')
  .payloadSchema(approvalResponsePayloadSchema)
  .tags(['user']) // Для всех пользователей
  .addSteps([
    createEmailStep(
      'approval-response-email',
      'Ваш запрос {{payload.approvalStatus === "approved" ? "одобрен" : "отклонён"}} председателем совета',
      `Уважаемый {{payload.userName}}!

Ваш запрос {{payload.approvalId}} {{payload.approvalStatus === "approved" ? "одобрен" : "отклонён"}} председателем совета {{payload.coopShortName}}.

{% if payload.approvalUrl %}Подробнее по ссылке:<br><a href="{{payload.approvalUrl}}">{{payload.approvalUrl}}</a>{% endif %}`
    ),
    createInAppStep(
      'approval-response-notification',
      'Ответ на запрос одобрения',
      'Ваш запрос {{payload.approvalId}} {{payload.approvalStatus === "approved" ? "одобрен" : "отклонён"}} председателем совета {{payload.coopShortName}}'
    ),
    createPushStep(
      'approval-response-push',
      'Ответ на запрос одобрения',
      'Запрос {{payload.approvalId}} {{payload.approvalStatus === "approved" ? "одобрен" : "отклонён"}}'
    ),
  ])
  .build();
