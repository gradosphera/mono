import { Inject, Injectable, Logger } from '@nestjs/common';
import { NOVU_WORKFLOW_PORT, type NovuWorkflowPort } from '~/domain/notification/interfaces/novu-workflow.port';
import { DeviceTokenService } from './device-token.service';
import type {
  WorkflowActorDomainInterface,
  WorkflowRecipientDomainInterface,
  WorkflowTriggerDomainInterface,
  WorkflowTriggerResultDomainInterface,
} from '~/domain/notification/interfaces/workflow-trigger-domain.interface';
import type { NotificationPayloadDomainInterface } from '~/domain/notification/interfaces/notification-payload-domain.interface';
import { ACCOUNT_DOMAIN_SERVICE, AccountDomainService } from '~/domain/account/services/account-domain.service';

/**
 * Сервис отправки уведомлений пользователям
 * Реализует отправку уведомлений через NOVU workflow
 */
@Injectable()
export class NotificationSenderService {
  private readonly logger = new Logger(NotificationSenderService.name);

  constructor(
    @Inject(NOVU_WORKFLOW_PORT)
    private readonly novuWorkflowPort: NovuWorkflowPort,
    private readonly deviceTokenService: DeviceTokenService,
    @Inject(ACCOUNT_DOMAIN_SERVICE)
    private readonly accountDomainService: AccountDomainService
  ) {}

  /**
   * Отправить уведомление пользователю с типизированным payload
   * @param username Username получателя
   * @param workflowName Имя воркфлоу
   * @param payload Данные уведомления (типизированные для конкретного воркфлоу)
   * @param actor Данные отправителя (опционально)
   * @returns Promise<WorkflowTriggerResultDomainInterface>
   */
  async sendNotificationToUser<T extends Record<string, any>>(
    username: string,
    workflowName: string,
    payload: T,
    actor?: WorkflowActorDomainInterface
  ): Promise<WorkflowTriggerResultDomainInterface> {
    this.logger.log(`Отправка уведомления пользователю: ${username}, воркфлоу: ${workflowName}`);

    // Получаем аккаунт пользователя для получения правильного subscriber_id
    const account = await this.accountDomainService.getAccount(username);

    if (!account.provider_account?.subscriber_id) {
      throw new Error(`Не найден subscriber_id для пользователя ${username}`);
    }

    // Создаем данные получателя с правильным subscriber_id
    const recipient: WorkflowRecipientDomainInterface = {
      subscriberId: account.provider_account.subscriber_id,
      data: {
        username,
        // Дополнительные данные получателя
      },
    };

    // Создаем данные для триггера воркфлоу
    const triggerData: WorkflowTriggerDomainInterface = {
      name: workflowName,
      to: recipient,
      payload: payload, // Передаем payload напрямую без преобразования
      actor,
    };

    try {
      const result = await this.novuWorkflowPort.triggerWorkflow(triggerData);

      this.logger.log(`Уведомление отправлено пользователю: ${username}, transactionId: ${result.transactionId}`);
      return result;
    } catch (error: any) {
      this.logger.error(`Ошибка отправки уведомления пользователю ${username}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Отправить уведомление нескольким пользователям
   * @param usernames Массив username получателей
   * @param workflowName Имя воркфлоу
   * @param payload Данные уведомления
   * @param actor Данные отправителя (опционально)
   * @returns Promise<WorkflowTriggerResultDomainInterface[]>
   */
  async sendNotificationToUsers(
    usernames: string[],
    workflowName: string,
    payload: NotificationPayloadDomainInterface,
    actor?: WorkflowActorDomainInterface
  ): Promise<WorkflowTriggerResultDomainInterface[]> {
    this.logger.log(`Отправка уведомления пользователям: ${usernames.length}, воркфлоу: ${workflowName}`);

    // Получаем аккаунты пользователей для получения правильных subscriber_id
    const recipients: WorkflowRecipientDomainInterface[] = [];

    for (const username of usernames) {
      const account = await this.accountDomainService.getAccount(username);

      if (account.provider_account?.subscriber_id) {
        recipients.push({
          subscriberId: account.provider_account.subscriber_id,
          data: {
            username,
          },
        });
      } else {
        this.logger.warn(`Пропускаем пользователя ${username} - не найден subscriber_id`);
      }
    }

    if (recipients.length === 0) {
      throw new Error('Не найдено ни одного пользователя с валидным subscriber_id');
    }

    // Создаем данные для триггера воркфлоу
    const triggerData: WorkflowTriggerDomainInterface = {
      name: workflowName,
      to: recipients,
      payload: {
        title: payload.title,
        body: payload.body,
        icon: payload.icon,
        badge: payload.badge,
        image: payload.image,
        url: payload.url,
        tag: payload.tag,
        requireInteraction: payload.requireInteraction,
        silent: payload.silent,
        actions: payload.actions,
        data: payload.data,
        vibrate: payload.vibrate,
        timestamp: payload.timestamp,
      },
      actor,
    };

    try {
      const result = await this.novuWorkflowPort.triggerWorkflow(triggerData);

      this.logger.log(`Уведомление отправлено пользователям: ${recipients.length}, transactionId: ${result.transactionId}`);
      return [result];
    } catch (error: any) {
      this.logger.error(`Ошибка отправки уведомления пользователям: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Отправить уведомление всем активным пользователям
   * @param workflowName Имя воркфлоу
   * @param payload Данные уведомления
   * @param actor Данные отправителя (опционально)
   * @returns Promise<WorkflowTriggerResultDomainInterface>
   */
  async sendNotificationToAll(
    workflowName: string,
    payload: NotificationPayloadDomainInterface,
    actor?: WorkflowActorDomainInterface
  ): Promise<WorkflowTriggerResultDomainInterface> {
    this.logger.log(`Отправка уведомления всем пользователям, воркфлоу: ${workflowName}`);

    // Для broadcast уведомлений NOVU поддерживает отправку без указания конкретных получателей
    // В этом случае уведомление будет отправлено всем подписчикам с настроенными credentials
    const triggerData: WorkflowTriggerDomainInterface = {
      name: workflowName,
      to: [], // Пустой массив для broadcast
      payload: {
        title: payload.title,
        body: payload.body,
        icon: payload.icon,
        badge: payload.badge,
        image: payload.image,
        url: payload.url,
        tag: payload.tag,
        requireInteraction: payload.requireInteraction,
        silent: payload.silent,
        actions: payload.actions,
        data: payload.data,
        vibrate: payload.vibrate,
        timestamp: payload.timestamp,
      },
      actor,
    };

    try {
      const result = await this.novuWorkflowPort.triggerWorkflow(triggerData);

      this.logger.log(`Уведомление отправлено всем пользователям, transactionId: ${result.transactionId}`);
      return result;
    } catch (error: any) {
      this.logger.error(`Ошибка отправки уведомления всем пользователям: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Отменить отправку уведомления
   * @param transactionId ID транзакции для отмены
   * @returns Promise<boolean>
   */
  async cancelNotification(transactionId: string): Promise<boolean> {
    this.logger.log(`Отмена уведомления: ${transactionId}`);

    try {
      const result = await this.novuWorkflowPort.cancelTriggeredWorkflow(transactionId);

      this.logger.log(`Уведомление отменено: ${transactionId}`);
      return result;
    } catch (error: any) {
      this.logger.error(`Ошибка отмены уведомления ${transactionId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Получить статус уведомления
   * @param transactionId ID транзакции
   * @returns Promise<any>
   */
  async getNotificationStatus(transactionId: string): Promise<any> {
    this.logger.debug(`Получение статуса уведомления: ${transactionId}`);

    try {
      const status = await this.novuWorkflowPort.getWorkflowStatus(transactionId);

      return status;
    } catch (error: any) {
      this.logger.error(`Ошибка получения статуса уведомления ${transactionId}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
