import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { WebPushSubscriptionService } from '../services/web-push-subscription.service';
import { WebPushSubscriptionDto } from '../dto/web-push-subscription.dto';
import { CreateSubscriptionInput } from '../dto/create-subscription-input.dto';
import { CreateSubscriptionResponse } from '../dto/create-subscription-response.dto';
import { SubscriptionStatsDto } from '../dto/subscription-stats.dto';
import { GetUserSubscriptionsInput } from '../dto/get-user-subscriptions.dto';
import { DeactivateSubscriptionInput } from '../dto/deactivate-subscription.dto';
import { GqlJwtAuthGuard } from '~/modules/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/modules/auth/guards/roles.guard';
import { AuthRoles } from '~/modules/auth/decorators/auth.decorator';

@Resolver(() => WebPushSubscriptionDto)
export class WebPushSubscriptionResolver {
  constructor(private readonly webPushSubscriptionService: WebPushSubscriptionService) {}

  @Mutation(() => CreateSubscriptionResponse, {
    description: 'Создать веб-пуш подписку для пользователя',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async createWebPushSubscription(@Args('data') data: CreateSubscriptionInput): Promise<CreateSubscriptionResponse> {
    return await this.webPushSubscriptionService.createSubscription(data);
  }

  @Query(() => [WebPushSubscriptionDto], {
    description: 'Получить веб-пуш подписки пользователя',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async getUserWebPushSubscriptions(@Args('data') data: GetUserSubscriptionsInput): Promise<WebPushSubscriptionDto[]> {
    return await this.webPushSubscriptionService.getUserSubscriptions(data.username);
  }

  @Query(() => SubscriptionStatsDto, {
    description: 'Получить статистику веб-пуш подписок (только для председателя)',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async getWebPushSubscriptionStats(): Promise<SubscriptionStatsDto> {
    return await this.webPushSubscriptionService.getSubscriptionStats();
  }

  @Mutation(() => Boolean, {
    description: 'Деактивировать веб-пуш подписку по ID',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async deactivateWebPushSubscriptionById(@Args('data') data: DeactivateSubscriptionInput): Promise<boolean> {
    await this.webPushSubscriptionService.deactivateSubscriptionById(data.subscriptionId);
    return true;
  }
}
