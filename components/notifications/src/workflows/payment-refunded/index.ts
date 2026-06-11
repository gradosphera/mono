
import { WorkflowDefinition } from '../../types';
import { WorkflowBuilder } from '../../base/workflow-builder';
import { z } from 'zod';
import { BaseWorkflowPayload } from '../../types';
import { createEmailStep, createInAppStep, createPushStep } from '../../base/defaults';
import { slugify } from '../../utils';

// Схема для payment-refunded воркфлоу (исходящий платёж-возврат пайщику)
export const paymentRefundedPayloadSchema = z.object({
  userName: z.string(),
  paymentAmount: z.string(),
  paymentCurrency: z.string(),
  paymentDate: z.string(),
  paymentUrl: z.string().optional(),
});

export type IPayload = z.infer<typeof paymentRefundedPayloadSchema>;

export interface IWorkflow extends BaseWorkflowPayload, IPayload {}

export const name = 'Возврат взноса выполнен';
export const id = slugify(name);

export const workflow: WorkflowDefinition<IWorkflow> = WorkflowBuilder
  .create<IWorkflow>()
  .name(name)
  .workflowId(id)
  .description('Уведомление о выполненном возврате взноса пайщику')
  .payloadSchema(paymentRefundedPayloadSchema)
  .tags(['user']) // Для всех пользователей
  .addSteps([
    createEmailStep(
      'payment-refunded-email',
      'Возврат взноса выполнен',
      'Уважаемый {{payload.userName}}!<br><br>Ваш взнос возвращён.<br><br>Сумма: <strong>{{payload.paymentAmount}} {{payload.paymentCurrency}}</strong><br><br>Дата: {{payload.paymentDate}}<br><br>Подробная информация доступна по ссылке: {{payload.paymentUrl}}'
    ),
    createInAppStep(
      'payment-refunded-notification',
      'Возврат взноса выполнен',
      'Возврат на сумму {{payload.paymentAmount}} {{payload.paymentCurrency}} выполнен'
    ),
    createPushStep(
      'payment-refunded-push',
      'Возврат взноса выполнен',
      'Возврат {{payload.paymentAmount}} {{payload.paymentCurrency}} выполнен'
    ),
  ])
  .build();
