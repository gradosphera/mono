import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { WebPushSubscriptionService } from '../services/web-push-subscription.service';
import { CreateWebPushSubscriptionInputDTO } from '../dto/create-subscription-input.dto';
import { WebPushSubscriptionDTO, CreateWebPushSubscriptionResponseDTO } from '../dto/web-push-subscription.dto';
import { GqlJwtAuthGuard } from '~/modules/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/modules/auth/guards/roles.guard';
import { AuthRoles } from '~/modules/auth/decorators/auth.decorator';

/**
 * GraphQL резолвер для управления веб-пуш подписками
 */
@Resolver(() => WebPushSubscriptionDTO)
export class WebPushSubscriptionResolver {
  constructor(private readonly webPushSubscriptionService: WebPushSubscriptionService) {}

  /**
   * Создать веб-пуш подписку
   * @param input Входные данные для создания подписки
   * @returns Promise<CreateWebPushSubscriptionResponseDTO>
   */
  @Mutation(() => CreateWebPushSubscriptionResponseDTO, {
    name: 'createWebPushSubscription',
    description: 'Создать веб-пуш подписку для пользователя',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async createSubscription(
    @Args('input', { type: () => CreateWebPushSubscriptionInputDTO })
    input: CreateWebPushSubscriptionInputDTO
  ): Promise<CreateWebPushSubscriptionResponseDTO> {
    return await this.webPushSubscriptionService.createSubscription(input);
  }

  /**
   * Получить все подписки пользователя
   * @param userId ID пользователя
   * @returns Promise<WebPushSubscriptionDTO[]>
   */
  @Query(() => [WebPushSubscriptionDTO], {
    name: 'getUserWebPushSubscriptions',
    description: 'Получить все веб-пуш подписки пользователя',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async getUserSubscriptions(
    @Args('userId', { type: () => String, description: 'ID пользователя' })
    userId: string
  ): Promise<WebPushSubscriptionDTO[]> {
    return await this.webPushSubscriptionService.getUserSubscriptions(userId);
  }
}
