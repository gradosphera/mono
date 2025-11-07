import { Inject, Injectable } from '@nestjs/common';
import { NOVU_WORKFLOW_PORT, NovuWorkflowPort } from '~/domain/notification/interfaces/novu-workflow.port';
import {
  TriggerNotificationWorkflowInputDTO,
  NotificationWorkflowRecipientInputDTO,
} from '../dto/trigger-notification-workflow-input.dto';
import { TriggerNotificationWorkflowResultDTO } from '../dto/trigger-notification-workflow-result.dto';
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
   * @returns Результат запуска воркфлоу
   */
  async triggerNotificationWorkflow(
    data: TriggerNotificationWorkflowInputDTO
  ): Promise<TriggerNotificationWorkflowResultDTO> {
    // Преобразуем DTO в доменные интерфейсы
    const triggerData = {
      name: data.name,
      to: await this.mapRecipients(data.to),
      payload: data.payload,
    };

    // Вызываем порт NovuWorkflow
    const result = await this.novuWorkflowPort.triggerWorkflow(triggerData);

    // Преобразуем результат обратно в DTO
    const dto = new TriggerNotificationWorkflowResultDTO();
    dto.transactionId = result.transactionId;
    dto.acknowledged = result.acknowledged;
    dto.status = result.status;
    dto.error = result.error;
    return dto;
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
