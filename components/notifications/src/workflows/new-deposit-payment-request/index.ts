import { WorkflowDefinition } from '../../types';
import { WorkflowBuilder } from '../../base/workflow-builder';
import { z } from 'zod';
import { BaseWorkflowPayload } from '../../types';
import { createEmailStep, createInAppStep, createPushStep } from '../../base/defaults';
import { slugify } from '../../utils';

// Схема для new-deposit-payment-request воркфлоу
export const newDepositPaymentRequestPayloadSchema = z.object({
  chairmanName: z.string(),
  participantName: z.string(),
  paymentAmount: z.string(),
  paymentCurrency: z.string(),
  paymentType: z.string(),
  coopname: z.string(),
  paymentUrl: z.string().optional(),
});

export type IPayload = z.infer<typeof newDepositPaymentRequestPayloadSchema>;

export interface IWorkflow extends BaseWorkflowPayload, IPayload {}

export const name = 'Новая новая заявка на паевой взнос';
export const id = slugify(name);

export const workflow: WorkflowDefinition<IWorkflow> = WorkflowBuilder
  .create<IWorkflow>()
  .name(name)
  .workflowId(id)
  .description('Уведомление председателю о создании новой заявки на паевой взнос')
  .payloadSchema(newDepositPaymentRequestPayloadSchema)
  .tags(['chairman']) // Только для председателя
  .addSteps([
    createEmailStep(
      'new-deposit-payment-request-email',
      'Новая заявка на паевой взнос: {{payload.participantName}}',
      'Уважаемый {{payload.chairmanName}}!<br><br>Сформирована новая заявка на оплату. Проверяйте поступления.<br><br>Пайщик: <strong>{{payload.participantName}}</strong><br><br>Сумма: <strong>{{payload.paymentAmount}} {{payload.paymentCurrency}}</strong><br><br>Тип платежа: {{payload.paymentType}}<br><br>Подробности: {{payload.paymentUrl}}'
    ),
    createInAppStep(
      'new-deposit-payment-request-notification',
      'Новая заявка на паевой взнос',
      'Пайщик {{payload.participantName}} создал заявку на {{payload.paymentAmount}} {{payload.paymentCurrency}}. Проверяйте поступления.'
    ),
    createPushStep(
      'new-deposit-payment-request-push',
      'Новая заявка на паевой взнос',
      'Заявка от пайщика {{payload.participantName}} на {{payload.paymentAmount}} {{payload.paymentCurrency}}'
    ),
  ])
  .build();
