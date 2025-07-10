import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { WebPushSubscriptionDomainEntity } from '~/domain/notification/entities/web-push-subscription-domain.entity';
import type { WebPushSubscriptionDomainInterface } from '~/domain/notification/interfaces/web-push-subscription-domain.interface';

@Entity('web_push_subscriptions')
@Index(['userId'], { unique: false })
@Index(['endpoint'], { unique: true })
export class WebPushSubscriptionEntity implements WebPushSubscriptionDomainInterface {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { length: 255 })
  userId!: string;

  @Column('text')
  endpoint!: string;

  @Column('varchar', { length: 255 })
  p256dhKey!: string;

  @Column('varchar', { length: 255 })
  authKey!: string;

  @Column('varchar', { length: 100, nullable: true })
  userAgent?: string;

  @Column('boolean', { default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  constructor(data?: WebPushSubscriptionDomainEntity) {
    if (data) {
      this.id = data.id;
      this.userId = data.userId;
      this.endpoint = data.endpoint;
      this.p256dhKey = data.p256dhKey;
      this.authKey = data.authKey;
      this.userAgent = data.userAgent;
      this.isActive = data.isActive;
      this.createdAt = data.createdAt;
      this.updatedAt = data.updatedAt;
    }
  }

  /**
   * Метод для преобразования ORM-сущности в доменную сущность
   */
  toDomainEntity(): WebPushSubscriptionDomainEntity {
    return new WebPushSubscriptionDomainEntity(this);
  }

  /**
   * Статический метод для создания ORM-сущности из доменной сущности
   */
  static fromDomainEntity(domainEntity: WebPushSubscriptionDomainEntity): WebPushSubscriptionEntity {
    return new WebPushSubscriptionEntity(domainEntity);
  }

  /**
   * Удобный метод для получения подписки в формате web-push
   */
  toWebPushSubscription(): { endpoint: string; keys: { p256dh: string; auth: string } } {
    return {
      endpoint: this.endpoint,
      keys: {
        p256dh: this.p256dhKey,
        auth: this.authKey,
      },
    };
  }
}
