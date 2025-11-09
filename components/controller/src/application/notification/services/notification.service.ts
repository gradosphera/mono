import { Inject, Injectable } from '@nestjs/common';
import { NOVU_WORKFLOW_PORT, NovuWorkflowPort } from '~/domain/notification/interfaces/novu-workflow.port';
import {
  TriggerNotificationWorkflowInputDTO,
  NotificationWorkflowRecipientInputDTO,
} from '../dto/trigger-notification-workflow-input.dto';
import { AccountDomainService, ACCOUNT_DOMAIN_SERVICE } from '~/domain/account/services/account-domain.service';

/**
 * Сервис для отправки уведомлений
 * Предоставляет интерфейс для внешнего триггинга воркфлоу уведомлений
 */
@Injectable()
export class NotificationService {
  constructor(
    @Inject(NOVU_WORKFLOW_PORT)
    private readonly novuWorkflowPort: NovuWorkflowPort,
    @Inject(ACCOUNT_DOMAIN_SERVICE)
    private readonly accountDomainService: AccountDomainService
  ) {}

  /**
   * Запускает воркфлоу уведомлений
   * @param data Входные данные для триггера воркфлоу
   * @returns true если успешно, false если ошибка
   */
  async triggerNotificationWorkflow(data: TriggerNotificationWorkflowInputDTO): Promise<boolean> {
    try {
      // Преобразуем DTO в доменные интерфейсы
      const triggerData = {
        name: data.name,
        to: await this.mapRecipients(data.to),
        payload: data.payload,
      };

      // Вызываем порт NovuWorkflow
      await this.novuWorkflowPort.triggerWorkflow(triggerData);

      // Возвращаем true если acknowledged и нет ошибок
      return true;
    } catch (error) {
      // В случае ошибки возвращаем false
      return false;
    }
  }

  /**
   * Преобразует DTO получателей в доменные интерфейсы
   */
  private async mapRecipients(dtoRecipients: NotificationWorkflowRecipientInputDTO[]): Promise<any[]> {
    const recipients = await Promise.all(
      dtoRecipients.map(async (recipient) => {
        const account = await this.accountDomainService.getAccount(recipient.username);
        const subscriberId = account.provider_account?.subscriber_id;

        if (!subscriberId) {
          throw new Error(`Subscriber ID not found for user ${recipient.username}`);
        }

        return {
          subscriberId,
        };
      })
    );
    return recipients;
  }
}
