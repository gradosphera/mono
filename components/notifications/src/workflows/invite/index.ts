import { WorkflowDefinition, type BaseWorkflowPayload } from '../../types';
import { WorkflowBuilder } from '../../base/workflow-builder';
import { createEmailStep } from '../../base/defaults';
import { z } from 'zod';
import { slugify } from '../../utils';

// Схема для invite воркфлоу
export const invitePayloadSchema = z.object({
  inviteUrl: z.string(),
});

export type IPayload = z.infer<typeof invitePayloadSchema>;

export interface IWorkflow extends BaseWorkflowPayload, IPayload {}

export const name = 'Приглашение в кооператив';
export const id = slugify(name);

export const workflow: WorkflowDefinition<IWorkflow> = WorkflowBuilder
  .create<IWorkflow>()
  .name(name)
  .workflowId(id)
  .description('Приглашение на подключение к цифровому кооперативу')
  .payloadSchema(invitePayloadSchema)
  .tags(['auth'])
  .addSteps([
    createEmailStep(
      'invite-email',
      'Приглашение в Цифровой Кооператив',
      'Вам отправлено приглашение на подключение к Цифровому Кооперативу в качестве действующего пайщика.<br><br>' +
      'Для того, чтобы воспользоваться приглашением и получить ключ доступа, пожалуйста, перейдите по ссылке: <a href="{{payload.inviteUrl}}">{{payload.inviteUrl}}</a>'
    ),
  ])
  .build();
