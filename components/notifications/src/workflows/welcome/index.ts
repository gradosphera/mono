
import { z } from 'zod';
import { WorkflowDefinition } from '../../types';
import { WorkflowBuilder } from '../../base/workflow-builder';
import { createEmailStep, createInAppStep, createPushStep } from '../../base/defaults';
import { BaseWorkflowPayload } from '../../types';

// Схема для welcome воркфлоу
export const welcomePayloadSchema = z.object({
  userName: z.string(),
  userEmail: z.string().email(),
  age: z.number().optional(),
});
export type IPayload = z.infer<typeof welcomePayloadSchema>;
export interface IWorkflow extends BaseWorkflowPayload, IPayload {}

export const workflow: WorkflowDefinition<IWorkflow> = WorkflowBuilder
  .create<IWorkflow>()
  .name('Добро пожаловать')
  .workflowId('dobro-pozhalovat')
  .description('Приветственные уведомления для новых пользователей')
  .payloadSchema(welcomePayloadSchema)
  .tags(['user']) 
  .addSteps([
    createEmailStep(
      'welcome-email',
      'Добро пожаловать, {{payload.userName}}',
      'Здравствуй, {{payload.userName}}! Ваш email: {{payload.userEmail}}. {{payload.age}}Ваш возраст: {{payload.age}} лет.{{payload.age}}'
    ),
    createInAppStep(
      'welcome-notification',
      'Добро пожаловать в систему',
      'Привет, {{payload.userName}}! Проверьте ваш email {{payload.userEmail}} для получения дополнительной информации.'
    ),
    createPushStep(
      'welcome-push',
      'Добро пожаловать, {{payload.userName}}!',
      'Это приветственное push-уведомление для {{payload.userEmail}}.'
    ),
  ])
  .build();