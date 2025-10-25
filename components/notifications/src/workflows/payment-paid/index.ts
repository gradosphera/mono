
import { WorkflowDefinition } from '../../types';
import { WorkflowBuilder } from '../../base/workflow-builder';
import { z } from 'zod';
import { BaseWorkflowPayload } from '../../types';
import { createEmailStep, createInAppStep, createPushStep } from '../../base/defaults';
import { slugify } from '../../utils';

// Схема для payment-completed воркфлоу
export const paymentCompletedPayloadSchema = z.object({
  userName: z.string(),
  paymentAmount: z.string(),
  paymentCurrency: z.string(),
  paymentDate: z.string(),
  paymentUrl: z.string().optional(),
});

export type IPayload = z.infer<typeof paymentCompletedPayloadSchema>;

export interface IWorkflow extends BaseWorkflowPayload, IPayload {}

export const name = 'Платеж принят';
export const id = slugify(name);

export const workflow: WorkflowDefinition<IWorkflow> = WorkflowBuilder
  .create<IWorkflow>()
  .name(name)
  .workflowId(id)
  .description('Уведомление о успешном приёме платежа')
  .payloadSchema(paymentCompletedPayloadSchema)
  .tags(['user']) // Для всех пользователей
  .addSteps([
    createEmailStep(
      'payment-completed-email',
      'Платеж успешно принят',
      'Уважаемый {{payload.userName}}!<br><br>Ваш платеж успешно принят и отправлен в обработку.<br><br>Сумма: <strong>{{payload.paymentAmount}} {{payload.paymentCurrency}}</strong><br><br>Дата: {{payload.paymentDate}}<br><br>Подробная информация доступна по ссылке: {{payload.paymentUrl}}'
    ),
    createInAppStep(
      'payment-completed-notification',
      'Платеж принят',
      'Платеж на сумму {{payload.paymentAmount}} {{payload.paymentCurrency}} успешно завершен'
    ),
    createPushStep(
      'payment-completed-push',
      'Платеж принят',
      'Платеж {{payload.paymentAmount}} {{payload.paymentCurrency}} завершен'
    ),
  ])
  .build();

