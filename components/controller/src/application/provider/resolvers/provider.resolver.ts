import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ProviderService } from '../services/provider.service';
import { ProviderSubscriptionDTO } from '../dto/provider-subscription.dto';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/application/auth/guards/roles.guard';
import { AuthRoles } from '~/application/auth/decorators/auth.decorator';
import { CurrentUser } from '~/application/auth/decorators/current-user.decorator';
import type { MonoAccountDomainInterface } from '~/domain/account/interfaces/mono-account-domain.interface';

@Resolver(() => ProviderSubscriptionDTO)
export class ProviderResolver {
  constructor(private readonly providerService: ProviderService) {}

  @Query(() => [ProviderSubscriptionDTO], {
    name: 'getProviderSubscriptions',
    description: 'Получить подписки пользователя у провайдера',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['member', 'chairman'])
  async getProviderSubscriptions(
    @CurrentUser() currentUser: MonoAccountDomainInterface
  ): Promise<ProviderSubscriptionDTO[]> {
    return this.providerService.getUserSubscriptions(currentUser.username);
  }

  @Query(() => ProviderSubscriptionDTO, {
    name: 'getProviderSubscriptionById',
    description: 'Получить подписку провайдера по ID',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['member', 'chairman'])
  async getProviderSubscriptionById(@Args('id') id: number): Promise<ProviderSubscriptionDTO> {
    return this.providerService.getSubscriptionById(id);
  }
}
