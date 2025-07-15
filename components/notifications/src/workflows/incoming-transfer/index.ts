import { WorkflowDefinition, type BaseWorkflowPayload } from '../../types';
import { WorkflowBuilder } from '../../base/workflow-builder';
import { createEmailStep, createInAppStep, createPushStep } from '../../base/defaults';
import { z } from 'zod';

// Схема для incoming-transfer воркфлоу
export const incomingTransferPayloadSchema = z.object({
  quantity: z.string(),
});

export type IPayload = z.infer<typeof incomingTransferPayloadSchema>;

export interface IWorkflow extends BaseWorkflowPayload, IPayload {} 

export const workflow: WorkflowDefinition<IWorkflow> = WorkflowBuilder
  .create<IWorkflow>()
  .name('Входящий перевод')
  .workflowId('vkhodyaschiy-perevod')
  .description('Уведомление о получении входящего перевода')
  .payloadSchema(incomingTransferPayloadSchema)
  .tags(['user']) // Доступно для всех ролей
  .addSteps([
    createEmailStep(
      'incoming-transfer-email',
      'Получен входящий перевод на сумму {{payload.quantity}}',
      'Уведомляем вас о получении входящего перевода.<br><br><strong>Сумма перевода: {{payload.quantity}}</strong><br><br>Перевод успешно зачислен на ваш счет.'
    ),
    createInAppStep(
      'incoming-transfer-notification',
      'Входящий перевод',
      'Получен входящий перевод на сумму {{payload.quantity}}'
    ),
    createPushStep(
      'incoming-transfer-push',
      'Входящий перевод',
      'Получен перевод на сумму {{payload.quantity}}'
    ),
  ])
  .build(); 