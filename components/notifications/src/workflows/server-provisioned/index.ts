import { z } from 'zod';
import { WorkflowDefinition } from '../../types';
import { WorkflowBuilder } from '../../base/workflow-builder';
import { createEmailStep, createInAppStep, createPushStep } from '../../base/defaults';
import { BaseWorkflowPayload } from '../../types';
import { slugify } from '../../utils';

// Схема для server-provisioned воркфлоу
export const serverProvisionedPayloadSchema = z.object({
  cooperativeName: z.string(),
  domain: z.string(),
  serverIp: z.string().optional(),
  provisionedAt: z.string(),
});
export type IPayload = z.infer<typeof serverProvisionedPayloadSchema>;
export interface IWorkflow extends BaseWorkflowPayload, IPayload {}

export const name = 'Сервер предоставлен';
export const id = slugify(name);

export const workflow: WorkflowDefinition<IWorkflow> = WorkflowBuilder
  .create<IWorkflow>()
  .name(name)
  .workflowId(id)
  .description('Уведомления о успешной поставке сервера для кооператива')
  .payloadSchema(serverProvisionedPayloadSchema)
  .tags(['server', 'hosting', 'provisioning', 'provider'])
  .addSteps([
    createEmailStep(
      'server-provisioned-email',
      'Сервер успешно предоставлен - {{payload.cooperativeName}}',
      'Здравствуйте!<br><br>Уведомляем вас о том, что сервер для кооператива <strong>{{payload.cooperativeName}}</strong> был успешно предоставлен и готов к работе.<br><br><strong>Детали сервера:</strong><br>- Домен: {{payload.domain}}<br>{{#if payload.serverIp}}- IP адрес: {{payload.serverIp}}<br>{{/if}}- Дата предоставления: {{payload.provisionedAt}}<br><br>Сервер теперь доступен по адресу: <a href="https://{{payload.domain}}">https://{{payload.domain}}</a><br><br>В ближайшее время будет выполнена установка программного обеспечения кооператива.<br><br>С уважением,<br>Команда технической поддержки'
    ),
    createInAppStep(
      'server-provisioned-notification',
      'Сервер предоставлен',
      'Сервер для кооператива {{payload.cooperativeName}} успешно предоставлен и готов к установке ПО.'
    ),
    createPushStep(
      'server-provisioned-push',
      'Сервер предоставлен - {{payload.cooperativeName}}',
      'Сервер активирован и готов к установке программного обеспечения!'
    ),
  ])
  .build();
