import { WorkflowDefinition } from '../../types';
import { WorkflowBuilder } from '../../base/workflow-builder';
import { z } from 'zod';
import { BaseWorkflowPayload } from '../../types';
import { createEmailStep, createInAppStep, createPushStep } from '../../base/defaults';
import { slugify } from '../../utils';

// Схема для new-initial-payment-request воркфлоу
export const newInitialPaymentRequestPayloadSchema = z.object({
  chairmanName: z.string(),
  participantName: z.string(),
  paymentAmount: z.string(),
  paymentCurrency: z.string(),
  paymentType: z.string(),
  coopname: z.string(),
  paymentUrl: z.string().optional(),
});

export type IPayload = z.infer<typeof newInitialPaymentRequestPayloadSchema>;

export interface IWorkflow extends BaseWorkflowPayload, IPayload {}

export const name = 'Новая заявка на вступительный взнос';
export const id = slugify(name);

export const workflow: WorkflowDefinition<IWorkflow> = WorkflowBuilder
  .create<IWorkflow>()
  .name(name)
  .workflowId(id)
  .description('Уведомление председателю о создании новой заявки на вступительный/минимальный паевой взнос')
  .payloadSchema(newInitialPaymentRequestPayloadSchema)
  .tags(['chairman']) // Только для председателя
  .addSteps([
    createEmailStep(
      'new-initial-payment-request-email',
      'Новая заявка на вступительный/мин.паевой взнос: {{payload.participantName}}',
      'Уважаемый {{payload.chairmanName}}!<br><br>Сформирована новая заявка на оплату. Проверяйте поступления.<br><br>Пайщик: <strong>{{payload.participantName}}</strong><br><br>Сумма: <strong>{{payload.paymentAmount}} {{payload.paymentCurrency}}</strong><br><br>Тип платежа: {{payload.paymentType}}<br><br>Подробности: {{payload.paymentUrl}}'
    ),
    createInAppStep(
      'new-initial-payment-request-notification',
      'Новая заявка на вступительный/мин.паевой взнос',
      'Пайщик {{payload.participantName}} создал заявку на {{payload.paymentAmount}} {{payload.paymentCurrency}}. Проверяйте поступления.'
    ),
    createPushStep(
      'new-initial-payment-request-push',
      'Новая заявка на вступительный/мин.паевой взнос',
      'Заявка от пайщика {{payload.participantName}} на {{payload.paymentAmount}} {{payload.paymentCurrency}}'
    ),
  ])
  .build();
