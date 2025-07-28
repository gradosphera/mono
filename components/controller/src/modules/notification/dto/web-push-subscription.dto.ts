import { Field, ObjectType } from '@nestjs/graphql';
import { WebPushSubscriptionDomainEntity } from '~/domain/notification/entities/web-push-subscription-domain.entity';

@ObjectType()
export class WebPushSubscriptionDto {
  @Field(() => String, { description: 'Уникальный идентификатор подписки' })
  id: string;

  @Field(() => String, { description: 'Username пользователя' })
  username: string;

  @Field(() => String, { description: 'Endpoint для отправки уведомлений' })
  endpoint: string;

  @Field(() => String, { description: 'P256DH ключ для шифрования' })
  p256dhKey: string;

  @Field(() => String, { description: 'Auth ключ для аутентификации' })
  authKey: string;

  @Field(() => String, { nullable: true, description: 'User Agent браузера' })
  userAgent?: string;

  @Field(() => Boolean, { description: 'Активна ли подписка' })
  isActive: boolean;

  @Field(() => Date, { description: 'Дата создания подписки' })
  createdAt: Date;

  @Field(() => Date, { description: 'Дата последнего обновления' })
  updatedAt: Date;

  constructor(data: WebPushSubscriptionDomainEntity) {
    this.id = data.id;
    this.username = data.username;
    this.endpoint = data.endpoint;
    this.p256dhKey = data.p256dhKey;
    this.authKey = data.authKey;
    this.userAgent = data.userAgent;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Статический метод для создания DTO из доменной сущности
   */
  static fromDomainEntity(domainEntity: WebPushSubscriptionDomainEntity): WebPushSubscriptionDto {
    return new WebPushSubscriptionDto(domainEntity);
  }

  /**
   * Статический метод для создания массива DTO из массива доменных сущностей
   */
  static fromDomainEntities(domainEntities: WebPushSubscriptionDomainEntity[]): WebPushSubscriptionDto[] {
    return domainEntities.map((entity) => WebPushSubscriptionDto.fromDomainEntity(entity));
  }
}
