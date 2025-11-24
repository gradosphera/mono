import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from '~/application/auth/decorators/current-user.decorator';
import type { MonoAccountDomainInterface } from '~/domain/account/interfaces/mono-account-domain.interface';
import { CoopgramApplicationService } from '../services/coopgram-application.service';
import { CreateMatrixAccountInputDTO, CheckMatrixUsernameInput } from '../dto/create-matrix-account.dto';
import { MatrixAccountStatusResponseDTO } from '../dto/matrix-account-status.dto';
import { AuthRoles } from '~/application/auth/decorators/auth.decorator';
import { RolesGuard } from '~/application/auth/guards/roles.guard';

@Resolver()
export class CoopgramResolver {
  constructor(private readonly coopgramAppService: CoopgramApplicationService) {}

  @Query(() => MatrixAccountStatusResponseDTO, {
    name: 'coopgramGetAccountStatus',
    description: 'Проверить статус Matrix аккаунта пользователя и получить iframe URL',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member', 'user'])
  async getMatrixAccountStatus(
    @CurrentUser() currentUser: MonoAccountDomainInterface
  ): Promise<MatrixAccountStatusResponseDTO> {
    return this.coopgramAppService.getMatrixAccountStatus(currentUser.username);
  }

  @Mutation(() => Boolean, {
    name: 'coopgramCreateAccount',
    description: 'Создать Matrix аккаунт с именем пользователя и паролем',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member', 'user'])
  async createMatrixAccount(
    @CurrentUser() currentUser: MonoAccountDomainInterface,
    @Args('data', { type: () => CreateMatrixAccountInputDTO }) data: CreateMatrixAccountInputDTO
  ): Promise<boolean> {
    return this.coopgramAppService.createMatrixAccount(currentUser.username, data.username, data.password);
  }

  @Query(() => Boolean, {
    name: 'coopgramCheckUsernameAvailability',
    description: 'Проверяет доступность Matrix username',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member', 'user'])
  async checkUsernameAvailability(
    @Args('data', { type: () => CheckMatrixUsernameInput }) data: CheckMatrixUsernameInput
  ): Promise<boolean> {
    return this.coopgramAppService.checkUsernameAvailability(data.username);
  }
}
