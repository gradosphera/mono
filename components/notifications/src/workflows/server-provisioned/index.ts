import { z } from 'zod';
import { WorkflowDefinition } from '../../types';
import { WorkflowBuilder } from '../../base/workflow-builder';
import { createEmailStep, createInAppStep, createPushStep } from '../../base/defaults';
import { BaseWorkflowPayload } from '../../types';
import { slugify } from '../../utils';

// Схема для service-provisioned воркфлоу
export const serviceProvisionedPayloadSchema = z.object({
  cooperativeName: z.string(),
  domain: z.string(),
  provisionedAt: z.string(),
});
export type IPayload = z.infer<typeof serviceProvisionedPayloadSchema>;
export interface IWorkflow extends BaseWorkflowPayload, IPayload {}

export const name = 'Цифровой кооператив развернут';
export const id = slugify(name);

export const workflow: WorkflowDefinition<IWorkflow> = WorkflowBuilder
  .create<IWorkflow>()
  .name(name)
  .workflowId(id)
  .description('Уведомления о успешном развертывании цифрового кооператива')
  .payloadSchema(serviceProvisionedPayloadSchema)
  .tags(['digital', 'cooperative', 'deployment', 'provisioning', 'provider'])
  .addSteps([
    createEmailStep(
      'digital-cooperative-deployed-email',
      'Цифровой кооператив развернут - {{payload.cooperativeName}}',
      'Здравствуйте!<br><br>Уведомляем вас о том, что цифровой кооператив <strong>{{payload.cooperativeName}}</strong> был успешно развернут и готов к работе.<br><br><strong>Детали развертывания:</strong><br>- Домен: {{payload.domain}}<br>- Дата развертывания: {{payload.provisionedAt}}<br><br>Ваш кооператив теперь доступен по адресу: <a href="https://{{payload.domain}}">https://{{payload.domain}}</a><br><br>Перейдите по ссылке, чтобы завершить установку.<br><br>С уважением,<br>Команда технической поддержки'
    ),
    createInAppStep(
      'digital-cooperative-deployed-notification',
      'Цифровой кооператив развернут',
      'Цифровой кооператив {{payload.cooperativeName}} успешно развернут. Перейдите по ссылке https://{{payload.domain}}, чтобы завершить установку.'
    ),
    createPushStep(
      'digital-cooperative-deployed-push',
      'Цифровой кооператив развернут - {{payload.cooperativeName}}',
      'Цифровой кооператив активирован! Перейдите по ссылке, чтобы завершить установку.'
    ),
  ])
  .build();
