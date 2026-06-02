import { Inject, Injectable, Logger } from '@nestjs/common';
import { NOTIFICATION_PORT, type NotificationPort } from '~/domain/notification/interfaces/notify.port';
import type { NotifyResult } from '~/domain/notification/interfaces/notify-input.domain.interface';
import { DeviceTokenService } from './device-token.service';
import type { WorkflowActorDomainInterface } from '~/domain/notification/interfaces/workflow-trigger-domain.interface';
import { ACCOUNT_DOMAIN_SERVICE, AccountDomainService } from '~/domain/account/services/account-domain.service';
import {
  NOTIFICATION_DOMAIN_SERVICE,
  NotificationDomainService,
} from '~/domain/notification/services/notification-domain.service';
import config from '~/config/config';

/**
 * Сервис отправки уведомлений пользователям через Центр уведомлений (DC v3).
 *
 * Тонкая обёртка `username → notify()`: резолвит получателя из аккаунта и ставит
 * уведомление в очередь Центра. Broadcast/cancel/status (Novu-измы) убраны — не
 * использовались и не имеют аналога в локальной модели Центра.
 */
@Injectable()
export class NotificationSenderService {
  private readonly logger = new Logger(NotificationSenderService.name);

  constructor(
    @Inject(NOTIFICATION_PORT)
    private readonly notificationPort: NotificationPort,
    private readonly deviceTokenService: DeviceTokenService,
    @Inject(ACCOUNT_DOMAIN_SERVICE)
    private readonly accountDomainService: AccountDomainService,
    @Inject(NOTIFICATION_DOMAIN_SERVICE)
    private readonly notificationDomainService: NotificationDomainService
  ) {}

  /**
   * Отправить уведомление пользователю с типизированным payload.
   * @param username Username получателя
   * @param workflowName Тип уведомления (id из каталога @coopenomics/notifications)
   * @param payload Данные уведомления (типизированные для конкретного типа)
   * @param actor Инициатор уведомления (опционально)
   */
  async sendNotificationToUser<T extends Record<string, any>>(
    username: string,
    workflowName: string,
    payload: T,
    actor?: WorkflowActorDomainInterface
  ): Promise<NotifyResult> {
    this.logger.log(`Отправка уведомления пользователю: ${username}, тип: ${workflowName}`);

    const account = await this.accountDomainService.getAccount(username);
    const recipient = this.notificationDomainService.buildWorkflowRecipientFromAccount(account);
    if (!recipient) {
      throw new Error(
        `Не удалось сформировать получателя для ${username}: нет subscriber_id или email в профиле`
      );
    }

    return this.notificationPort.notify({
      coopname: config.coopname,
      workflowId: workflowName,
      to: {
        subscriberId: recipient.subscriberId,
        email: recipient.email,
        username,
      },
      payload,
      actor: actor ? { subscriberId: actor.subscriberId, email: actor.email } : undefined,
    });
  }
}
