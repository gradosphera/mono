import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { CapitalService } from '../services/capital.service';
import { ImportContributorInputDTO } from '../dto/participation_management/import-contributor-input.dto';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/application/auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { AuthRoles } from '~/application/auth/decorators/auth.decorator';
import { MakeClearanceInputDTO } from '../dto/participation_management/make-clearance-input.dto';
import { RegisterContributorInputDTO } from '../dto/participation_management/register-contributor-input.dto';

/**
 * GraphQL резолвер для действий управления участием в CAPITAL контракте
 */
@Resolver()
export class ParticipationManagementResolver {
  constructor(private readonly capitalService: CapitalService) {}

  /**
   * Мутация для регистрации вкладчика в CAPITAL контракте
   */
  @Mutation(() => String, {
    name: 'capitalRegisterContributor',
    description: 'Регистрация вкладчика в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async registerCapitalContributor(
    @Args('data', { type: () => RegisterContributorInputDTO }) data: RegisterContributorInputDTO
  ): Promise<string> {
    const result = await this.capitalService.registerContributor(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }

  /**
   * Мутация для импорта вкладчика в CAPITAL контракт
   */
  @Mutation(() => String, {
    name: 'capitalImportContributor',
    description: 'Импорт вкладчика в CAPITAL контракт',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async importCapitalContributor(
    @Args('data', { type: () => ImportContributorInputDTO }) data: ImportContributorInputDTO
  ): Promise<string> {
    const result = await this.capitalService.importContributor(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }

  /**
   * Мутация для подписания приложения в CAPITAL контракте
   */
  @Mutation(() => String, {
    name: 'capitalMakeClearance',
    description: 'Подписание приложения в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async makeCapitalClearance(
    @Args('data', { type: () => MakeClearanceInputDTO }) data: MakeClearanceInputDTO
  ): Promise<string> {
    const result = await this.capitalService.makeClearance(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }
}
