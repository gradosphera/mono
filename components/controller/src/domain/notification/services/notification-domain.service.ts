import { Inject, Injectable, Logger } from '@nestjs/common';
import { NOTIFICATION_PORT, NotificationPort, NotificationSubscriberData } from '../interfaces/notification.port';
import { WebPushSubscriptionDomainInteractor } from '../interactors/web-push-subscription-domain.interactor';
import type { AccountDomainEntity } from '~/domain/account/entities/account-domain.entity';
import type {
  CreateSubscriptionInputDomainInterface,
  NotificationPayloadDomainInterface,
} from '../interfaces/web-push-subscription-domain.interface';

@Injectable()
export class NotificationDomainService {
  private readonly logger = new Logger(NotificationDomainService.name);

  constructor(
    @Inject(NOTIFICATION_PORT) private readonly notificationPort: NotificationPort,
    private readonly webPushSubscriptionDomainInteractor: WebPushSubscriptionDomainInteractor
  ) {}

  /**
   * Создает подписчика уведомлений из данных аккаунта
   * @param account Данные аккаунта пользователя
   */
  async createSubscriberFromAccount(account: AccountDomainEntity): Promise<void> {
    if (!account.provider_account) {
      this.logger.warn(`Нет данных provider_account для пользователя ${account.username}`);
      return;
    }

    const subscriber = this.buildSubscriberData(account);

    // Если нет email или имени, пропускаем
    if (!subscriber.email || (!subscriber.firstName && !subscriber.data?.org_name)) {
      this.logger.warn(`Недостаточно данных для создания подписчика ${account.username}`);
      return;
    }

    this.logger.log(`Создание подписчика уведомлений для ${account.username}`);

    try {
      await this.notificationPort.upsertSubscriber(subscriber);
      this.logger.log(`Подписчик ${account.username} успешно создан/обновлен`);
    } catch (error: any) {
      this.logger.error(`Ошибка создания подписчика ${account.username}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Создать веб-пуш подписку для пользователя
   * @param data Данные для создания подписки
   */
  async createWebPushSubscription(data: CreateSubscriptionInputDomainInterface): Promise<void> {
    this.logger.log(`Создание веб-пуш подписки для пользователя ${data.userId}`);

    try {
      await this.webPushSubscriptionDomainInteractor.createOrUpdateSubscription(data);
      this.logger.log(`Веб-пуш подписка создана для пользователя ${data.userId}`);
    } catch (error: any) {
      this.logger.error(`Ошибка создания веб-пуш подписки для ${data.userId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Отправить push уведомление пользователю
   * @param userId ID пользователя
   * @param payload Данные уведомления
   */
  async sendPushNotificationToUser(userId: string, payload: NotificationPayloadDomainInterface): Promise<void> {
    this.logger.log(`Отправка push уведомления пользователю ${userId}: ${payload.title}`);

    try {
      await this.webPushSubscriptionDomainInteractor.sendNotificationToUser(userId, payload);
      this.logger.log(`Push уведомление отправлено пользователю ${userId}`);
    } catch (error: any) {
      this.logger.error(`Ошибка отправки push уведомления пользователю ${userId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Отправить push уведомление всем пользователям
   * @param payload Данные уведомления
   */
  async sendPushNotificationToAll(payload: NotificationPayloadDomainInterface): Promise<void> {
    this.logger.log(`Отправка push уведомления всем пользователям: ${payload.title}`);

    try {
      await this.webPushSubscriptionDomainInteractor.sendNotificationToAll(payload);
      this.logger.log(`Push уведомление отправлено всем пользователям`);
    } catch (error: any) {
      this.logger.error(`Ошибка отправки push уведомления всем пользователям: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Получить статистику веб-пуш подписок
   */
  async getWebPushSubscriptionStats() {
    this.logger.debug('Получение статистики веб-пуш подписок');

    try {
      return await this.webPushSubscriptionDomainInteractor.getSubscriptionStats();
    } catch (error: any) {
      this.logger.error(`Ошибка получения статистики подписок: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Очистить неактивные веб-пуш подписки
   * @param olderThanDays Количество дней
   */
  async cleanupInactiveWebPushSubscriptions(olderThanDays = 30): Promise<number> {
    this.logger.log(`Очистка неактивных веб-пуш подписок старше ${olderThanDays} дней`);

    try {
      const deletedCount = await this.webPushSubscriptionDomainInteractor.cleanupInactiveSubscriptions(olderThanDays);
      this.logger.log(`Очищено ${deletedCount} неактивных веб-пуш подписок`);
      return deletedCount;
    } catch (error: any) {
      this.logger.error(`Ошибка очистки неактивных подписок: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Формирует данные подписчика из аккаунта
   * @param account Данные аккаунта
   */
  private buildSubscriberData(account: AccountDomainEntity): NotificationSubscriberData {
    let email = '';
    let phone = '';
    let firstName = '';
    let lastName = '';
    const data: Record<string, string> = {};

    // Получаем email из provider_account
    if (account.provider_account?.email) {
      email = account.provider_account.email;
    }

    // Определяем тип аккаунта и извлекаем данные
    if (account.private_account) {
      const type = account.private_account.type;

      if (type === 'individual' && account.private_account.individual_data) {
        const ind = account.private_account.individual_data;
        firstName = ind.first_name || '';
        lastName = ind.last_name || '';
        email = ind.email || email;
        phone = ind.phone || '';
        if (ind.middle_name) data.middleName = ind.middle_name;
      } else if (type === 'organization' && account.private_account.organization_data) {
        const org = account.private_account.organization_data;
        email = org.email || email;
        phone = org.phone || '';
        data.org_name = org.full_name || '';

        // Данные представителя организации
        if (org.represented_by) {
          firstName = org.represented_by.first_name || '';
          lastName = org.represented_by.last_name || '';
          if (org.represented_by.middle_name) data.middleName = org.represented_by.middle_name;
        }
      } else if (type === 'entrepreneur' && account.private_account.entrepreneur_data) {
        const ent = account.private_account.entrepreneur_data;
        firstName = ent.first_name || '';
        lastName = ent.last_name || '';
        email = ent.email || email;
        phone = ent.phone || '';
        if (ent.middle_name) data.middleName = ent.middle_name;
      }
    }

    return {
      subscriberId: account.provider_account?.subscriber_id || account.username,
      email,
      phone,
      firstName,
      lastName,
      locale: 'ru_RU',
      timezone: 'Europe/Moscow',
      data,
    };
  }
}

export const NOTIFICATION_DOMAIN_SERVICE = Symbol('NOTIFICATION_DOMAIN_SERVICE');
