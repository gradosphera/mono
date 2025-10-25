import type {
  WorkflowTriggerDomainInterface,
  WorkflowTriggerResultDomainInterface,
} from './workflow-trigger-domain.interface';

/**
 * Порт для работы с NOVU workflow trigger
 * Определяет интерфейс для отправки уведомлений через воркфлоу
 */
export interface NovuWorkflowPort {
  /**
   * Запустить воркфлоу для отправки уведомления
   * @param triggerData Данные для запуска воркфлоу
   * @returns Promise<WorkflowTriggerResultDomainInterface>
   */
  triggerWorkflow(triggerData: WorkflowTriggerDomainInterface): Promise<WorkflowTriggerResultDomainInterface>;

  /**
   * Отменить триггер воркфлоу
   * @param transactionId ID транзакции для отмены
   * @returns Promise<boolean>
   */
  cancelTriggeredWorkflow(transactionId: string): Promise<boolean>;

  /**
   * Получить статус выполнения воркфлоу
   * @param transactionId ID транзакции
   * @returns Promise<any>
   */
  getWorkflowStatus(transactionId: string): Promise<any>;
}

/**
 * Символ для инъекции зависимости
 */
export const NOVU_WORKFLOW_PORT = Symbol('NovuWorkflowPort');
