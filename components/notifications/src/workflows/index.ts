import { WorkflowDefinition } from '../types';
// Импорты воркфлоу для регистрации
import { workflow as welcomeWorkflow } from './welcome';
import { workflow as newAgendaItemWorkflow } from './new-agenda-item';
import { workflow as incomingTransferWorkflow } from './incoming-transfer';


// Импортируем все воркфлоу
export * as Welcome from './welcome';
export * as NewAgenda from './new-agenda-item';
export * as NewTransfer from './incoming-transfer';


// Массив всех воркфлоу для автоматической регистрации
export const allWorkflows: WorkflowDefinition[] = [
  welcomeWorkflow,
  newAgendaItemWorkflow,
  incomingTransferWorkflow,
  // Здесь будут добавляться новые воркфлоу
];

// Экспортируем воркфлоу по ID для удобного доступа
export const workflowsById = allWorkflows.reduce((acc, workflow) => {
  acc[workflow.workflowId] = workflow;
  return acc;
}, {} as Record<string, WorkflowDefinition>);
