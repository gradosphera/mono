
import { WorkflowDefinition } from '../../types';
import { WorkflowBuilder } from '../../base/workflow-builder';
import { z } from 'zod';
import { BaseWorkflowPayload } from '../../types';
import { createEmailStep, createInAppStep, createPushStep } from '../../base/defaults';
import { slugify } from '../../utils';

// Схема для decision-approved воркфлоу
export const decisionApprovedPayloadSchema = z.object({
  userName: z.string(),
  decisionTitle: z.string(),
  coopname: z.string(),
  decision_id: z.string(),
  decisionUrl: z.string().optional(),
});

export type IPayload = z.infer<typeof decisionApprovedPayloadSchema>;

export interface IWorkflow extends BaseWorkflowPayload, IPayload {}

export const name = 'Решение совета принято';
export const id = slugify(name);

export const workflow: WorkflowDefinition<IWorkflow> = WorkflowBuilder
  .create<IWorkflow>()
  .name(name)
  .workflowId(id)
  .description('Уведомление пользователю о принятии решения совета по его вопросу')
  .payloadSchema(decisionApprovedPayloadSchema)
  .tags(['user']) // Для всех пользователей
  .addSteps([
    createEmailStep(
      'decision-approved-email',
      'Решение совета принято по вашему вопросу',
      'Уважаемый {{payload.userName}}!<br><br>Совет кооператива принял решение по вашему вопросу:<br><br><strong>{{payload.decisionTitle}}</strong><br><br>Ссылка для просмотра подробной информации: {{payload.decisionUrl}}'
    ),
    createInAppStep(
      'decision-approved-notification',
      'Решение совета принято',
      'По вашему вопросу принято решение: {{payload.decisionTitle}}'
    ),
    createPushStep(
      'decision-approved-push',
      'Решение совета принято',
      'Принято решение: {{payload.decisionTitle}}'
    ),
  ])
  .build();

