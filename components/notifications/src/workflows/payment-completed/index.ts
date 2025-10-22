
import { WorkflowDefinition } from '../../types';
import { WorkflowBuilder } from '../../base/workflow-builder';
import { z } from 'zod';
import { BaseWorkflowPayload } from '../../types';
import { createEmailStep, createInAppStep, createPushStep } from '../../base/defaults';

// Схема для payment-completed воркфлоу
export const paymentCompletedPayloadSchema = z.object({
  userName: z.string(),
  paymentAmount: z.string(),
  paymentCurrency: z.string(),
  paymentId: z.string(),
  paymentDate: z.string(),
  paymentUrl: z.string().optional(),
});

export type IPayload = z.infer<typeof paymentCompletedPayloadSchema>;

export interface IWorkflow extends BaseWorkflowPayload, IPayload {}

export const id = 'platezh-zavershen';

export const workflow: WorkflowDefinition<IWorkflow> = WorkflowBuilder
  .create<IWorkflow>()
  .name('Платеж завершен')
  .workflowId(id)
  .description('Уведомление о успешном завершении платежа')
  .payloadSchema(paymentCompletedPayloadSchema)
  .tags(['user']) // Для всех пользователей
  .addSteps([
    createEmailStep(
      'payment-completed-email',
      'Платеж успешно завершен',
      'Уважаемый {{payload.userName}}!<br><br>Ваш платеж успешно завершен.<br><br>Сумма: <strong>{{payload.paymentAmount}} {{payload.paymentCurrency}}</strong><br>Номер платежа: {{payload.paymentId}}<br>Дата: {{payload.paymentDate}}<br><br>{% if payload.paymentUrl %}Подробная информация доступна по ссылке:<br><a href="{{payload.paymentUrl}}">{{payload.paymentUrl}}</a>{% endif %}'
    ),
    createInAppStep(
      'payment-completed-notification',
      'Платеж завершен',
      'Платеж на сумму {{payload.paymentAmount}} {{payload.paymentCurrency}} успешно завершен'
    ),
    createPushStep(
      'payment-completed-push',
      'Платеж завершен',
      'Платеж {{payload.paymentAmount}} {{payload.paymentCurrency}} завершен'
    ),
  ])
  .build();

