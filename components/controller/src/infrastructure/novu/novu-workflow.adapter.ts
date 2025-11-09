import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import config from '~/config/config';
import type { NovuWorkflowPort } from '~/domain/notification/interfaces/novu-workflow.port';
import type {
  WorkflowTriggerDomainInterface,
  WorkflowTriggerResultDomainInterface,
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
      // Санитизируем payload для предотвращения проблем с кавычками в NOVU
      const sanitizedTriggerData = {
        ...triggerData,
        payload: this.sanitizePayload(triggerData.payload),
      };

      const response: AxiosResponse = await axios.post(`${this.novuBaseUrl}/events/trigger`, sanitizedTriggerData, {
        headers: this.getHeaders(),
      });

      this.logger.log(`Воркфлоу запущен: ${triggerData.name}, transactionId: ${response.data.transactionId}`);

      return this.mapToTriggerResult(response.data);
    } catch (error: any) {
      this.logger.error(
        `Ошибка запуска воркфлоу ${triggerData.name}: ${error.message} ${error.response?.data}`,
        error.stack
      );
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
   * Санитизирует payload для безопасного использования в NOVU
   * Заменяет кавычки на HTML entities для предотвращения проблем с шаблонизацией
   * @param payload Объект payload для санитизации
   * @returns Санитизированный payload
   */
  private sanitizePayload(payload: any): any {
    if (typeof payload === 'string') {
      return payload.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    if (Array.isArray(payload)) {
      return payload.map((item) => this.sanitizePayload(item));
    }

    if (payload !== null && typeof payload === 'object') {
      const sanitized: any = {};
      for (const key in payload) {
        if (Object.prototype.hasOwnProperty.call(payload, key)) {
          sanitized[key] = this.sanitizePayload(payload[key]);
        }
      }
      return sanitized;
    }

    return payload;
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
      acknowledged: novuResponse.acknowledged || false,
      status: novuResponse.status || 'processed',
      error: novuResponse.error || undefined,
    };
  }
}
