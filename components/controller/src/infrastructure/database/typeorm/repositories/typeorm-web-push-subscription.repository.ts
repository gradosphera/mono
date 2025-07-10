import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebPushSubscriptionEntity } from '../entities/web-push-subscription.entity';
import { WebPushSubscriptionPort } from '~/domain/notification/interfaces/web-push-subscription.port';
import { WebPushSubscriptionDomainEntity } from '~/domain/notification/entities/web-push-subscription-domain.entity';
import type {
  WebPushSubscriptionDomainInterface,
  CreateWebPushSubscriptionDomainInterface,
  SubscriptionStatsDomainInterface,
} from '~/domain/notification/interfaces/web-push-subscription-domain.interface';

@Injectable()
export class TypeOrmWebPushSubscriptionRepository implements WebPushSubscriptionPort {
  constructor(
    @InjectRepository(WebPushSubscriptionEntity)
    private readonly ormRepo: Repository<WebPushSubscriptionEntity>
  ) {}

  /**
   * Сохранить веб-пуш подписку
   */
  async saveSubscription(data: CreateWebPushSubscriptionDomainInterface): Promise<WebPushSubscriptionDomainInterface> {
    const entity = this.ormRepo.create({
      userId: data.userId,
      endpoint: data.endpoint,
      p256dhKey: data.p256dhKey,
      authKey: data.authKey,
      userAgent: data.userAgent,
      isActive: true,
    });

    const savedEntity = await this.ormRepo.save(entity);
    return savedEntity.toDomainEntity();
  }

  /**
   * Найти подписку по endpoint
   */
  async findByEndpoint(endpoint: string): Promise<WebPushSubscriptionDomainInterface | null> {
    const entity = await this.ormRepo.findOne({ where: { endpoint } });
    return entity ? entity.toDomainEntity() : null;
  }

  /**
   * Получить все активные подписки пользователя
   */
  async getUserSubscriptions(userId: string): Promise<WebPushSubscriptionDomainInterface[]> {
    const entities = await this.ormRepo.find({
      where: { userId, isActive: true },
    });
    return entities.map((entity) => entity.toDomainEntity());
  }

  /**
   * Получить все активные подписки
   */
  async getAllActiveSubscriptions(): Promise<WebPushSubscriptionDomainInterface[]> {
    const entities = await this.ormRepo.find({
      where: { isActive: true },
    });
    return entities.map((entity) => entity.toDomainEntity());
  }

  /**
   * Деактивировать подписку по endpoint
   */
  async deactivateSubscription(endpoint: string): Promise<void> {
    await this.ormRepo.update({ endpoint }, { isActive: false });
  }

  /**
   * Деактивировать подписку по ID
   */
  async deactivateSubscriptionById(id: string): Promise<void> {
    await this.ormRepo.update({ id }, { isActive: false });
  }

  /**
   * Удалить неактивные подписки старше указанного количества дней
   */
  async cleanupInactiveSubscriptions(olderThanDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await this.ormRepo
      .createQueryBuilder()
      .delete()
      .where('isActive = :isActive AND updatedAt < :cutoffDate', {
        isActive: false,
        cutoffDate,
      })
      .execute();

    return result.affected || 0;
  }

  /**
   * Получить статистику подписок
   */
  async getSubscriptionStats(): Promise<SubscriptionStatsDomainInterface> {
    const total = await this.ormRepo.count();
    const active = await this.ormRepo.count({
      where: { isActive: true },
    });
    const inactive = total - active;

    const uniqueUsersResult = await this.ormRepo
      .createQueryBuilder('subscription')
      .select('COUNT(DISTINCT subscription.userId)', 'count')
      .where('subscription.isActive = :isActive', { isActive: true })
      .getRawOne();

    return {
      total,
      active,
      inactive,
      uniqueUsers: parseInt(uniqueUsersResult.count),
    };
  }

  /**
   * Обновить подписку
   */
  async updateSubscription(
    endpoint: string,
    data: Partial<CreateWebPushSubscriptionDomainInterface>
  ): Promise<WebPushSubscriptionDomainInterface> {
    const existingEntity = await this.ormRepo.findOne({ where: { endpoint } });

    if (!existingEntity) {
      throw new Error('Подписка не найдена');
    }

    // Обновляем только переданные поля
    if (data.userId !== undefined) existingEntity.userId = data.userId;
    if (data.p256dhKey !== undefined) existingEntity.p256dhKey = data.p256dhKey;
    if (data.authKey !== undefined) existingEntity.authKey = data.authKey;
    if (data.userAgent !== undefined) existingEntity.userAgent = data.userAgent;

    // Активируем подписку при обновлении
    existingEntity.isActive = true;

    const savedEntity = await this.ormRepo.save(existingEntity);
    return savedEntity.toDomainEntity();
  }
}
