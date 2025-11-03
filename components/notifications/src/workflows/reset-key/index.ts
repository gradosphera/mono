import { WorkflowDefinition, type BaseWorkflowPayload } from '../../types';
import { WorkflowBuilder } from '../../base/workflow-builder';
import { createEmailStep } from '../../base/defaults';
import { z } from 'zod';
import { slugify } from '../../utils';

// Схема для reset-key воркфлоу
export const resetKeyPayloadSchema = z.object({
  resetUrl: z.string(),
});

export type IPayload = z.infer<typeof resetKeyPayloadSchema>;

export interface IWorkflow extends BaseWorkflowPayload, IPayload {}

export const name = 'Восстановление доступа';
export const id = slugify(name);

export const workflow: WorkflowDefinition<IWorkflow> = WorkflowBuilder
  .create<IWorkflow>()
  .name(name)
  .workflowId(id)
  .description('Уведомление о восстановлении доступа к аккаунту')
  .payloadSchema(resetKeyPayloadSchema)
  .tags(['auth'])
  .addSteps([
    createEmailStep(
      'reset-key-email',
      'Восстановление доступа',
      'Мы получили запрос на перевыпуск приватного ключа,<br><br>' +
      'Для перевыпуска нажмите на ссылку: <a href="{{payload.resetUrl}}">{{payload.resetUrl}}</a><br><br>' +
      'Время действия ссылки - 10 минут.<br><br>' +
      'Если вы не запрашивали перевыпуск ключа - проигнорируйте это сообщение.'
    ),
  ])
  .build();
