import { WorkflowDefinition } from '../types';
// Импорты воркфлоу для регистрации
import { workflow as welcomeWorkflow } from './welcome';
import { workflow as newAgendaItemWorkflow } from './new-agenda-item';
import { workflow as incomingTransferWorkflow } from './incoming-transfer';
import { workflow as approvalRequestWorkflow } from './approval-request';
import { workflow as decisionApprovedWorkflow } from './decision-approved';
import { workflow as paymentCompletedWorkflow } from './payment-completed';
import { workflow as paymentCancelledWorkflow } from './payment-cancelled';
import { workflow as meetInitialWorkflow } from './meet-initial';
import { workflow as meetReminderStartWorkflow } from './meet-reminder-start';
import { workflow as meetStartedWorkflow } from './meet-started';
import { workflow as meetReminderEndWorkflow } from './meet-reminder-end';
import { workflow as meetRestartWorkflow } from './meet-restart';
import { workflow as meetEndedWorkflow } from './meet-ended';

// Импортируем все воркфлоу
export * as Welcome from './welcome';
export * as NewAgenda from './new-agenda-item';
export * as NewTransfer from './incoming-transfer';
export * as ApprovalRequest from './approval-request';
export * as DecisionApproved from './decision-approved';
export * as PaymentCompleted from './payment-completed';
export * as PaymentCancelled from './payment-cancelled';
export * as MeetInitial from './meet-initial';
export * as MeetReminderStart from './meet-reminder-start';
export * as MeetStarted from './meet-started';
export * as MeetReminderEnd from './meet-reminder-end';
export * as MeetRestart from './meet-restart';
export * as MeetEnded from './meet-ended';

// Массив всех воркфлоу для автоматической регистрации
export const allWorkflows: WorkflowDefinition[] = [
  welcomeWorkflow,
  newAgendaItemWorkflow,
  incomingTransferWorkflow,
  approvalRequestWorkflow,
  decisionApprovedWorkflow,
  paymentCompletedWorkflow,
  paymentCancelledWorkflow,
  meetInitialWorkflow,
  meetReminderStartWorkflow,
  meetStartedWorkflow,
  meetReminderEndWorkflow,
  meetRestartWorkflow,
  meetEndedWorkflow,
];

// Экспортируем воркфлоу по ID для удобного доступа
export const workflowsById = allWorkflows.reduce((acc, workflow) => {
  acc[workflow.workflowId] = workflow;
  return acc;
}, {} as Record<string, WorkflowDefinition>);
