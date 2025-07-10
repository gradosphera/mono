import { Inject, Injectable, Logger } from '@nestjs/common';
import { NOTIFICATION_PORT, NotificationPort, NotificationSubscriberData } from '../interfaces/notification.port';
import { WebPushSubscriptionDomainInteractor } from '../interactors/web-push-subscription-domain.interactor';
import type { AccountDomainEntity } from '~/domain/account/entities/account-domain.entity';
import type { CreateSubscriptionInputDomainInterface } from '../interfaces/create-subscription-input-domain.interface';
import type { NotificationPayloadDomainInterface } from '../interfaces/notification-payload-domain.interface';
import type { WorkflowActorDomainInterface } from '../interfaces/workflow-trigger-domain.interface';

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

    await this.notificationPort.upsertSubscriber(subscriber);
    this.logger.log(`Подписчик ${account.username} успешно создан/обновлен`);
  }

  /**
   * Создать веб-пуш подписку для пользователя
   * @param data Данные для создания подписки
   */
  async createWebPushSubscription(data: CreateSubscriptionInputDomainInterface): Promise<void> {
    this.logger.log(`Создание веб-пуш подписки для пользователя ${data.username}`);

    await this.webPushSubscriptionDomainInteractor.createOrUpdateSubscription(data);
    this.logger.log(`Веб-пуш подписка создана для пользователя ${data.username}`);
  }

  /**
   * Отправить push уведомление пользователю через NOVU workflow
   * @param username Username пользователя
   * @param workflowName Имя воркфлоу
   * @param payload Данные уведомления
   * @param actor Данные отправителя (опционально)
   */
  async sendPushNotificationToUser(
    username: string,
    workflowName: string,
    payload: NotificationPayloadDomainInterface,
    actor?: WorkflowActorDomainInterface
  ): Promise<void> {
    this.logger.log(`Отправка push уведомления пользователю ${username}: ${payload.title}`);

    await this.webPushSubscriptionDomainInteractor.sendNotificationToUser(username, workflowName, payload, actor);
    this.logger.log(`Push уведомление отправлено пользователю ${username}`);
  }

  /**
   * Отправить push уведомление нескольким пользователям через NOVU workflow
   * @param usernames Массив username пользователей
   * @param workflowName Имя воркфлоу
   * @param payload Данные уведомления
   * @param actor Данные отправителя (опционально)
   */
  async sendPushNotificationToUsers(
    usernames: string[],
    workflowName: string,
    payload: NotificationPayloadDomainInterface,
    actor?: WorkflowActorDomainInterface
  ): Promise<void> {
    this.logger.log(`Отправка push уведомления пользователям (${usernames.length}): ${payload.title}`);

    await this.webPushSubscriptionDomainInteractor.sendNotificationToUsers(usernames, workflowName, payload, actor);
    this.logger.log(`Push уведомление отправлено пользователям (${usernames.length})`);
  }

  /**
   * Отправить push уведомление всем пользователям через NOVU workflow
   * @param workflowName Имя воркфлоу
   * @param payload Данные уведомления
   * @param actor Данные отправителя (опционально)
   */
  async sendPushNotificationToAll(
    workflowName: string,
    payload: NotificationPayloadDomainInterface,
    actor?: WorkflowActorDomainInterface
  ): Promise<void> {
    this.logger.log(`Отправка push уведомления всем пользователям: ${payload.title}`);

    await this.webPushSubscriptionDomainInteractor.sendNotificationToAll(workflowName, payload, actor);
    this.logger.log(`Push уведомление отправлено всем пользователям`);
  }

  /**
   * Синхронизировать device tokens пользователя с веб-пуш подписками
   * @param username Username пользователя
   */
  async syncUserDeviceTokens(username: string): Promise<void> {
    this.logger.log(`Синхронизация device tokens для пользователя ${username}`);

    await this.webPushSubscriptionDomainInteractor.syncUserDeviceTokens(username);
    this.logger.log(`Device tokens синхронизированы для пользователя ${username}`);
  }

  /**
   * Получить статистику веб-пуш подписок
   */
  async getWebPushSubscriptionStats() {
    this.logger.debug('Получение статистики веб-пуш подписок');

    return await this.webPushSubscriptionDomainInteractor.getSubscriptionStats();
  }

  /**
   * Очистить неактивные веб-пуш подписки
   * @param olderThanDays Количество дней
   */
  async cleanupInactiveWebPushSubscriptions(olderThanDays = 30): Promise<number> {
    this.logger.log(`Очистка неактивных веб-пуш подписок старше ${olderThanDays} дней`);

    const deletedCount = await this.webPushSubscriptionDomainInteractor.cleanupInactiveSubscriptions(olderThanDays);
    this.logger.log(`Очищено ${deletedCount} неактивных веб-пуш подписок`);
    return deletedCount;
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
