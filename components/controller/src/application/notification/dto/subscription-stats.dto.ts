import { Field, ObjectType, Int } from '@nestjs/graphql';
import type { SubscriptionStatsDomainInterface } from '~/domain/notification/interfaces/subscription-stats-domain.interface';

@ObjectType()
export class SubscriptionStatsDto {
  @Field(() => Int, { description: 'Общее количество подписок' })
  total: number;

  @Field(() => Int, { description: 'Количество активных подписок' })
  active: number;

  @Field(() => Int, { description: 'Количество неактивных подписок' })
  inactive: number;

  @Field(() => Int, { description: 'Количество уникальных пользователей' })
  uniqueUsers: number;

  constructor(data: SubscriptionStatsDomainInterface) {
    this.total = data.total;
    this.active = data.active;
    this.inactive = data.inactive;
    this.uniqueUsers = data.uniqueUsers;
  }

  /**
   * Статический метод для создания DTO из доменного интерфейса
   */
  static fromDomainInterface(domainInterface: SubscriptionStatsDomainInterface): SubscriptionStatsDto {
    return new SubscriptionStatsDto(domainInterface);
  }
}
