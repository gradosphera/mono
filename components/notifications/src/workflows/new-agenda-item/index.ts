
import { WorkflowDefinition } from '../../types';
import { WorkflowBuilder } from '../../base/workflow-builder';
import { z } from 'zod';
import { BaseWorkflowPayload } from '../../types';
import { createEmailStep, createInAppStep, createPushStep } from '../../base/defaults';

// Схема для new-agenda-item воркфлоу
export const newAgendaItemPayloadSchema = z.object({
  coopname: z.string(),
  coopShortName: z.string(),
  itemTitle: z.string(),
  itemDescription: z.string(),
  authorName: z.string(),
  decision_id: z.number(),
  agendaUrl: z.string().optional(),
});

export type IPayload = z.infer<typeof newAgendaItemPayloadSchema>;

export interface IWorkflow extends BaseWorkflowPayload, IPayload {}

export const id = 'noviy-vopros-na-povestke';

export const workflow: WorkflowDefinition<IWorkflow> = WorkflowBuilder
  .create<IWorkflow>()
  .name('Новый вопрос на повестке совета')
  .workflowId(id)
  .description('Уведомление о новом вопросе на повестке дня заседания совета для всех членов совета')
  .payloadSchema(newAgendaItemPayloadSchema)
  .tags(['member']) // Доступно только для членов совета
  .addSteps([
    createEmailStep(
      'new-agenda-item-email',
      'Новый вопрос на повестке совета в {{payload.coopShortName}}',
      'Уважаемый член совета!<br><br>Добавлен новый вопрос на повестку заседания совета:<br><br><strong>{{payload.itemTitle}}</strong><br><br>{{payload.itemDescription}}<br><br>Автор вопроса: {{payload.authorName}}<br>Номер решения: {{payload.decision_id}}<br><br>{% if payload.agendaUrl %}Для рассмотрения вопроса перейдите по ссылке:<br><a href="{{payload.agendaUrl}}">{{payload.agendaUrl}}</a><br><br>{% endif %}С уважением, Совет {{payload.coopShortName}}.'
    ),
    createInAppStep(
      'new-agenda-item-notification',
      'Новый вопрос на повестке совета',
      '{{payload.itemTitle}}<br>От: {{payload.authorName}}'
    ),
    createPushStep(
      'new-agenda-item-push',
      'Новый вопрос на повестке',
      '{{payload.itemTitle}} от {{payload.authorName}}'
    ),
  ])
  .build(); 