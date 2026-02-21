import { WorkflowDefinition } from '../../types';
import { WorkflowBuilder } from '../../base/workflow-builder';
import { z } from 'zod';
import { BaseWorkflowPayload } from '../../types';
import { createEmailStep, createInAppStep, createPushStep } from '../../base/defaults';
import { slugify } from '../../utils';

// Схема для decision-expired воркфлоу
export const decisionExpiredPayloadSchema = z.object({
  userName: z.string(),
  decisionTitle: z.string(),
  coopname: z.string(),
  decision_id: z.string(),
  short_abbr: z.string(),
  name: z.string(),
});

export type IPayload = z.infer<typeof decisionExpiredPayloadSchema>;

export interface IWorkflow extends BaseWorkflowPayload, IPayload {}

export const name = 'Решение совета не принято по истечению срока';
export const id = slugify(name);

export const workflow: WorkflowDefinition<IWorkflow> = WorkflowBuilder
  .create<IWorkflow>()
  .name(name)
  .workflowId(id)
  .description('Уведомление пользователю об отмене решения совета по истечению срока действия')
  .payloadSchema(decisionExpiredPayloadSchema)
  .tags(['user']) // Для всех пользователей
  .addSteps([
    createEmailStep(
      'decision-expired-email',
      'Решение совета по вопросу №{{payload.decision_id}} в {{payload.short_abbr}} {{payload.name}} не принято',
      'Уважаемый {{payload.userName}}!<br><br>Решение совета по вопросу №{{payload.decision_id}} в {{payload.short_abbr}} {{payload.name}} не принято.<br><br>Вопрос: <strong>{{payload.decisionTitle}}</strong>'
    ),
    createInAppStep(
      'decision-expired-notification',
      'Решение совета не принято',
      'Решение совета по вопросу №{{payload.decision_id}} в {{payload.short_abbr}} {{payload.name}} не принято'
    ),
    createPushStep(
      'decision-expired-push',
      'Решение совета не принято',
      'Решение по вопросу №{{payload.decision_id}} в {{payload.short_abbr}} {{payload.name}} не принято'
    ),
  ])
  .build();