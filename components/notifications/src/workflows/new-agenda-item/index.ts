
import { WorkflowDefinition } from '../../types';
import { WorkflowBuilder } from '../../base/workflow-builder';
import { z } from 'zod';
import { BaseWorkflowPayload } from '../../types';
import { createEmailStep, createInAppStep, createPushStep } from '../../base/defaults';

// Схема для new-agenda-item воркфлоу
export const newAgendaItemPayloadSchema = z.object({
  itemTitle: z.string(),
  itemDescription: z.string(),
  authorName: z.string(),
  authorEmail: z.string().email(),
  meetingDate: z.string().optional(),
  meetingTitle: z.string().optional(),
});

export type IPayload = z.infer<typeof newAgendaItemPayloadSchema>;

export interface IWorkflow extends BaseWorkflowPayload, IPayload {} 

export const workflow: WorkflowDefinition<IWorkflow> = WorkflowBuilder
  .create<IWorkflow>()
  .name('Новый вопрос на повестке')
  .workflowId('noviy-vopros-na-povestke')
  .description('Уведомление о новом вопросе на повестке дня собрания совета для председателя и членов совета')
  .payloadSchema(newAgendaItemPayloadSchema)
  .tags(['member']) // Доступно только для председателя и членов
  .addSteps([
    createEmailStep(
      'new-agenda-item-email',
      'Новый вопрос на повестке: {{payload.itemTitle}}',
      'Добавлен новый вопрос на повестку:<br><br><strong>{{payload.itemTitle}}</strong><br><br>{{payload.itemDescription}}<br><br>Автор: {{payload.authorName}} ({{payload.authorEmail}})<br><br>{{payload.meetingDate}}Дата заседания: {{payload.meetingDate}}<br>{{payload.meetingDate}}{{payload.meetingTitle}}Заседание: {{payload.meetingTitle}}{{payload.meetingTitle}}'
    ),
    createInAppStep(
      'new-agenda-item-notification',
      'Новый вопрос на повестке',
      'Добавлен новый вопрос: {{payload.itemTitle}}<br>Автор: {{payload.authorName}}'
    ),
    createPushStep(
      'new-agenda-item-push',
      'Новый вопрос на повестке',
      'Добавлен новый вопрос: {{payload.itemTitle}}'
    ),
  ])
  .build(); 