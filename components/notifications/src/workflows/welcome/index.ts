
import { z } from 'zod';
import { WorkflowDefinition } from '../../types';
import { WorkflowBuilder } from '../../base/workflow-builder';
import { createEmailStep, createInAppStep, createPushStep } from '../../base/defaults';
import { BaseWorkflowPayload } from '../../types';
import { slugify } from '../../utils';

// Схема для welcome воркфлоу
export const welcomePayloadSchema = z.object({
  userName: z.string(),
});
export type IPayload = z.infer<typeof welcomePayloadSchema>;
export interface IWorkflow extends BaseWorkflowPayload, IPayload {}

export const name = 'Добро пожаловать';
export const id = slugify(name);

export const workflow: WorkflowDefinition<IWorkflow> = WorkflowBuilder
  .create<IWorkflow>()
  .name(name)
  .workflowId(id)
  .description('Приветственные уведомления для новых пользователей')
  .payloadSchema(welcomePayloadSchema)
  .tags(['user']) 
  .addSteps([
    createEmailStep(
      'welcome-email',
      'Добро пожаловать, {{payload.userName}}',
      'Здравствуйте, {{payload.userName}}!<br><br>Для завершения процедуры вступления совершите взносы по предоставленным в личном кабинете реквизитам. После получения взноса совет примет Вас в пайщики. Обычно, это занимает не более 1-2 дней.'
    ),
    createInAppStep(
      'welcome-notification',
      'Добро пожаловать в систему',
      'Привет, {{payload.userName}}! Добро пожаловать в кооператив!'
    ),
    createPushStep(
      'welcome-push',
      'Добро пожаловать, {{payload.userName}}!',
      'Добро пожаловать в кооператив!'
    ),
  ])
  .build();