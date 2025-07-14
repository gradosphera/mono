import { Injectable, Logger } from '@nestjs/common';
import { Novu } from '@novu/api';
import config from '~/config/config';
import { NotificationPort, NotificationSubscriberData } from '~/domain/notification/interfaces/notification.port';

@Injectable()
export class NovuAdapter implements NotificationPort {
  private readonly logger = new Logger(NovuAdapter.name);
  private readonly novu: Novu;

  constructor() {
    // Инициализируем Novu SDK
    this.novu = new Novu({
      secretKey: config.novu.api_key,
      serverURL: config.novu.backend_url,
    });

    this.logger.log(`NOVU адаптер инициализирован с @novu/api`);
  }

  /**
   * Создает подписчика в NOVU
   * @param subscriber Данные подписчика
   */
  async createSubscriber(subscriber: NotificationSubscriberData): Promise<void> {
    this.logger.log(`Создание подписчика: ${subscriber.subscriberId}`);

    try {
      await this.novu.subscribers.create(subscriber);
      this.logger.log(`Подписчик создан: ${subscriber.subscriberId}`);
    } catch (error: any) {
      this.logger.error(`Ошибка создания подписчика ${subscriber.subscriberId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Обновляет подписчика в NOVU
   * @param subscriber Данные подписчика
   */
  async updateSubscriber(subscriber: NotificationSubscriberData): Promise<void> {
    this.logger.log(`Обновление подписчика: ${subscriber.subscriberId}`);

    try {
      await this.novu.subscribers.patch(subscriber, subscriber.subscriberId);
      this.logger.log(`Подписчик обновлен: ${subscriber.subscriberId}`);
    } catch (error: any) {
      this.logger.error(`Ошибка обновления подписчика ${subscriber.subscriberId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Получает подписчика по ID
   * @param subscriberId ID подписчика
   */
  async getSubscriber(subscriberId: string): Promise<NotificationSubscriberData | null> {
    try {
      const response = await this.novu.subscribers.retrieve(subscriberId);
      const subscriber = response.result;

      if (!subscriber) {
        return null;
      }

      // Преобразуем SubscriberResponseDto в NotificationSubscriberData
      const result: NotificationSubscriberData = {
        subscriberId: subscriber.subscriberId,
        email: subscriber.email || '', // Преобразуем null/undefined в пустую строку
        firstName: subscriber.firstName || undefined,
        lastName: subscriber.lastName || undefined,
        locale: subscriber.locale || undefined,
        phone: subscriber.phone || undefined,
        timezone: subscriber.timezone || undefined,
        data: subscriber.data || undefined,
      };

      return result;
    } catch (error: any) {
      // Если подписчик не найден - возвращаем null
      const status = error?.response?.status || error?.status;
      if (status === 404 || status === 400) {
        return null;
      }

      this.logger.error(`Ошибка получения подписчика ${subscriberId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Удаляет подписчика
   * @param subscriberId ID подписчика
   */
  async deleteSubscriber(subscriberId: string): Promise<void> {
    try {
      await this.novu.subscribers.delete(subscriberId);
      this.logger.log(`Подписчик удален: ${subscriberId}`);
    } catch (error: any) {
      // Игнорируем ошибки "не найдено" при удалении
      const status = error?.response?.status || error?.status;
      if (status !== 404 && status !== 400) {
        this.logger.error(`Ошибка удаления подписчика ${subscriberId}: ${error.message}`, error.stack);
        throw error;
      }
    }
  }
}
