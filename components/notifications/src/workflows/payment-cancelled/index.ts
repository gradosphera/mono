
import { WorkflowDefinition } from '../../types';
import { WorkflowBuilder } from '../../base/workflow-builder';
import { z } from 'zod';
import { BaseWorkflowPayload } from '../../types';
import { createEmailStep, createInAppStep, createPushStep } from '../../base/defaults';
import { slugify } from '../../utils';

// Схема для payment-cancelled воркфлоу
export const paymentCancelledPayloadSchema = z.object({
  userName: z.string(),
  paymentAmount: z.string(),
  paymentCurrency: z.string(),
  paymentId: z.string(),
  paymentDate: z.string(),
  paymentUrl: z.string().optional(),
});

export type IPayload = z.infer<typeof paymentCancelledPayloadSchema>;

export interface IWorkflow extends BaseWorkflowPayload, IPayload {}

export const name = 'Платеж отменен';
export const id = slugify(name);

export const workflow: WorkflowDefinition<IWorkflow> = WorkflowBuilder
  .create<IWorkflow>()
  .name(name)
  .workflowId(id)
  .description('Уведомление об отмене платежа')
  .payloadSchema(paymentCancelledPayloadSchema)
  .tags(['user']) // Для всех пользователей
  .addSteps([
    createEmailStep(
      'payment-cancelled-email',
      'Платеж отменен',
      'Уважаемый {{payload.userName}}!<br><br>Ваш платеж был отменен.<br><br>Сумма: <strong>{{payload.paymentAmount}} {{payload.paymentCurrency}}</strong><br>Номер платежа: {{payload.paymentId}}<br>Дата: {{payload.paymentDate}}<br><br>Подробная информация доступна по ссылке: {{payload.paymentUrl}}'
    ),
    createInAppStep(
      'payment-cancelled-notification',
      'Платеж отменен',
      'Платеж на сумму {{payload.paymentAmount}} {{payload.paymentCurrency}} отменен'
    ),
    createPushStep(
      'payment-cancelled-push',
      'Платеж отменен',
      'Платеж {{payload.paymentAmount}} {{payload.paymentCurrency}} отменен'
    ),
  ])
  .build();

