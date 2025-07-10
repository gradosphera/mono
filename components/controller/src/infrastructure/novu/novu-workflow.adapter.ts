import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import config from '~/config/config';
import type { NovuWorkflowPort } from '~/domain/notification/interfaces/novu-workflow.port';
import type {
  WorkflowTriggerDomainInterface,
  WorkflowTriggerResultDomainInterface,
  WorkflowBulkTriggerDomainInterface,
} from '~/domain/notification/interfaces/workflow-trigger-domain.interface';

/**
 * Адаптер для работы с NOVU workflow trigger
 * Реализует отправку уведомлений через NOVU API
 */
@Injectable()
export class NovuWorkflowAdapter implements NovuWorkflowPort {
  private readonly logger = new Logger(NovuWorkflowAdapter.name);
  private readonly novuBaseUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.apiKey = config.novu.api_key;

    // Настраиваем базовый URL для NOVU API
    let baseUrl = config.novu.backend_url;
    if (!baseUrl.endsWith('/v1')) {
      baseUrl = baseUrl.replace(/\/+$/, '') + '/v1';
    }
    this.novuBaseUrl = baseUrl;

    this.logger.log(`NOVU Workflow адаптер инициализирован. URL: ${this.novuBaseUrl}`);
  }

  /**
   * Запустить воркфлоу для отправки уведомления
   * @param triggerData Данные для запуска воркфлоу
   * @returns Promise<WorkflowTriggerResultDomainInterface>
   */
  async triggerWorkflow(triggerData: WorkflowTriggerDomainInterface): Promise<WorkflowTriggerResultDomainInterface> {
    this.logger.log(`Запуск воркфлоу: ${triggerData.name}`);

    try {
      const response: AxiosResponse = await axios.post(`${this.novuBaseUrl}/events/trigger`, triggerData, {
        headers: this.getHeaders(),
      });

      this.logger.log(`Воркфлоу запущен: ${triggerData.name}, transactionId: ${response.data.transactionId}`);

      return this.mapToTriggerResult(response.data);
    } catch (error: any) {
      this.logger.error(`Ошибка запуска воркфлоу ${triggerData.name}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Запустить воркфлоу для множественной отправки уведомлений
   * @param bulkTriggerData Данные для пакетного запуска воркфлоу
   * @returns Promise<WorkflowTriggerResultDomainInterface[]>
   */
  async triggerBulkWorkflow(
    bulkTriggerData: WorkflowBulkTriggerDomainInterface
  ): Promise<WorkflowTriggerResultDomainInterface[]> {
    this.logger.log(`Запуск пакетного воркфлоу: ${bulkTriggerData.name}, событий: ${bulkTriggerData.events.length}`);

    try {
      const response: AxiosResponse = await axios.post(`${this.novuBaseUrl}/events/trigger/bulk`, bulkTriggerData, {
        headers: this.getHeaders(),
      });

      this.logger.log(`Пакетный воркфлоу запущен: ${bulkTriggerData.name}`);

      return response.data.map((item: any) => this.mapToTriggerResult(item));
    } catch (error: any) {
      this.logger.error(`Ошибка запуска пакетного воркфлоу ${bulkTriggerData.name}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Отменить триггер воркфлоу
   * @param transactionId ID транзакции для отмены
   * @returns Promise<boolean>
   */
  async cancelTriggeredWorkflow(transactionId: string): Promise<boolean> {
    this.logger.log(`Отмена воркфлоу: ${transactionId}`);

    try {
      await axios.delete(`${this.novuBaseUrl}/events/trigger/${transactionId}`, {
        headers: this.getHeaders(),
      });

      this.logger.log(`Воркфлоу отменен: ${transactionId}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Ошибка отмены воркфлоу ${transactionId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Получить статус выполнения воркфлоу
   * @param transactionId ID транзакции
   * @returns Promise<any>
   */
  async getWorkflowStatus(transactionId: string): Promise<any> {
    this.logger.debug(`Получение статуса воркфлоу: ${transactionId}`);

    try {
      const response: AxiosResponse = await axios.get(`${this.novuBaseUrl}/events/trigger/${transactionId}`, {
        headers: this.getHeaders(),
      });

      return response.data;
    } catch (error: any) {
      this.logger.error(`Ошибка получения статуса воркфлоу ${transactionId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Возвращает заголовки для запросов к NOVU API
   */
  private getHeaders(): Record<string, string> {
    return {
      Authorization: `ApiKey ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Преобразует ответ NOVU API в доменный интерфейс результата
   * @param novuResponse Ответ от NOVU API
   * @returns WorkflowTriggerResultDomainInterface
   */
  private mapToTriggerResult(novuResponse: any): WorkflowTriggerResultDomainInterface {
    return {
      transactionId: novuResponse.transactionId,
      acknowledged: novuResponse.acknowledged || false,
      status: novuResponse.status || 'processed',
      error: novuResponse.error || undefined,
    };
  }
}
