import { ObjectType, Field, ID } from '@nestjs/graphql';
import { WebPushSubscriptionDomainEntity } from '~/domain/notification/entities/web-push-subscription-domain.entity';
import type { WebPushSubscriptionDomainInterface } from '~/domain/notification/interfaces/web-push-subscription-domain.interface';

@ObjectType('WebPushSubscription')
export class WebPushSubscriptionDTO implements WebPushSubscriptionDomainInterface {
  @Field(() => ID, { description: 'Уникальный ID подписки' })
  id!: string;

  @Field(() => String, { description: 'ID пользователя' })
  userId!: string;

  @Field(() => String, { description: 'Endpoint для веб-пуш подписки' })
  endpoint!: string;

  @Field(() => String, { description: 'P256DH ключ для веб-пуш подписки' })
  p256dhKey!: string;

  @Field(() => String, { description: 'Auth ключ для веб-пуш подписки' })
  authKey!: string;

  @Field(() => String, { description: 'User Agent браузера', nullable: true })
  userAgent?: string;

  @Field(() => Boolean, { description: 'Активна ли подписка' })
  isActive!: boolean;

  @Field(() => Date, { description: 'Дата создания подписки' })
  createdAt!: Date;

  @Field(() => Date, { description: 'Дата последнего обновления подписки' })
  updatedAt!: Date;

  constructor(domainEntity: WebPushSubscriptionDomainEntity) {
    this.id = domainEntity.id;
    this.userId = domainEntity.userId;
    this.endpoint = domainEntity.endpoint;
    this.p256dhKey = domainEntity.p256dhKey;
    this.authKey = domainEntity.authKey;
    this.userAgent = domainEntity.userAgent;
    this.isActive = domainEntity.isActive;
    this.createdAt = domainEntity.createdAt;
    this.updatedAt = domainEntity.updatedAt;
  }
}

@ObjectType('CreateWebPushSubscriptionResponse')
export class CreateWebPushSubscriptionResponseDTO {
  @Field(() => Boolean, { description: 'Успешно ли создана подписка' })
  success!: boolean;

  @Field(() => String, { description: 'Сообщение о результате операции' })
  message!: string;

  @Field(() => WebPushSubscriptionDTO, { description: 'Данные созданной подписки' })
  subscription!: WebPushSubscriptionDTO;
}
