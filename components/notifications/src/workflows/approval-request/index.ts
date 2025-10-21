
import { WorkflowDefinition } from '../../types';
import { WorkflowBuilder } from '../../base/workflow-builder';
import { z } from 'zod';
import { BaseWorkflowPayload } from '../../types';
import { createEmailStep, createInAppStep, createPushStep } from '../../base/defaults';

// Схема для approval-request воркфлоу
export const approvalRequestPayloadSchema = z.object({
  chairmanName: z.string(),
  requestTitle: z.string(),
  requestDescription: z.string(),
  authorName: z.string(),
  coopname: z.string(),
  approval_hash: z.string(),
  approvalUrl: z.string().optional(),
});

export type IPayload = z.infer<typeof approvalRequestPayloadSchema>;

export interface IWorkflow extends BaseWorkflowPayload, IPayload {} 

export const workflow: WorkflowDefinition<IWorkflow> = WorkflowBuilder
  .create<IWorkflow>()
  .name('Запрос на одобрение председателя')
  .workflowId('zapros-na-odobrenie-predsedatelya')
  .description('Уведомление председателю совета о новом запросе на одобрение')
  .payloadSchema(approvalRequestPayloadSchema)
  .tags(['chairman']) // Только для председателя
  .addSteps([
    createEmailStep(
      'approval-request-email',
      'Новый запрос на одобрение: {{payload.requestTitle}}',
      'Уважаемый {{payload.chairmanName}}!<br><br>Поступил новый запрос на одобрение:<br><br><strong>{{payload.requestTitle}}</strong><br><br>{{payload.requestDescription}}<br><br>Автор запроса: {{payload.authorName}}<br><br>{{#payload.approvalUrl}}Для одобрения или отклонения запроса перейдите по ссылке:<br><a href="{{payload.approvalUrl}}">{{payload.approvalUrl}}</a>{{/payload.approvalUrl}}'
    ),
    createInAppStep(
      'approval-request-notification',
      'Новый запрос на одобрение',
      'Запрос: {{payload.requestTitle}}<br>Автор: {{payload.authorName}}'
    ),
    createPushStep(
      'approval-request-push',
      'Новый запрос на одобрение',
      'Запрос: {{payload.requestTitle}} от {{payload.authorName}}'
    ),
  ])
  .build();

