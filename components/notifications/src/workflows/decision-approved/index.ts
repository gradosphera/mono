
import { WorkflowDefinition } from '../../types';
import { WorkflowBuilder } from '../../base/workflow-builder';
import { z } from 'zod';
import { BaseWorkflowPayload } from '../../types';
import { createEmailStep, createInAppStep, createPushStep } from '../../base/defaults';

// Схема для decision-approved воркфлоу
export const decisionApprovedPayloadSchema = z.object({
  userName: z.string(),
  decisionTitle: z.string(),
  coopname: z.string(),
  decision_id: z.number(),
  decisionUrl: z.string().optional(),
});

export type IPayload = z.infer<typeof decisionApprovedPayloadSchema>;

export interface IWorkflow extends BaseWorkflowPayload, IPayload {}

export const id = 'reshenie-soveta-prinyato';

export const workflow: WorkflowDefinition<IWorkflow> = WorkflowBuilder
  .create<IWorkflow>()
  .name('Решение совета принято')
  .workflowId(id)
  .description('Уведомление пользователю о принятии решения совета по его вопросу')
  .payloadSchema(decisionApprovedPayloadSchema)
  .tags(['user']) // Для всех пользователей
  .addSteps([
    createEmailStep(
      'decision-approved-email',
      'Решение совета принято по вашему вопросу',
      'Уважаемый {{payload.userName}}!<br><br>Совет кооператива принял решение по вашему вопросу:<br><br><strong>{{payload.decisionTitle}}</strong><br><br>{% if payload.decisionUrl %}Для просмотра подробной информации перейдите по ссылке:<br><a href="{{payload.decisionUrl}}">{{payload.decisionUrl}}</a>{% endif %}'
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

