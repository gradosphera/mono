import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { ParticipationManagementService } from '../services/participation-management.service';
import { ImportContributorInputDTO } from '../dto/participation_management/import-contributor-input.dto';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/application/auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { AuthRoles } from '~/application/auth/decorators/auth.decorator';
import { MakeClearanceInputDTO } from '../dto/participation_management/make-clearance-input.dto';
import { RegisterContributorInputDTO } from '../dto/participation_management/register-contributor-input.dto';
import { ContributorOutputDTO } from '../dto/participation_management/contributor.dto';
import { ContributorFilterInputDTO } from '../dto/participation_management/contributor-filter.input';
import { createPaginationResult, PaginationInputDTO, PaginationResult } from '~/application/common/dto/pagination.dto';

/**
 * GraphQL резолвер для действий управления участием в CAPITAL контракте
 */
// Пагинированные результаты
const paginatedContributorsResult = createPaginationResult(ContributorOutputDTO, 'PaginatedCapitalContributors');

/**
 * GraphQL резолвер для действий управления участием в CAPITAL контракте
 */
@Resolver()
export class ParticipationManagementResolver {
  constructor(private readonly participationManagementService: ParticipationManagementService) {}

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
    const result = await this.participationManagementService.registerContributor(data);
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
    const result = await this.participationManagementService.importContributor(data);
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
    const result = await this.participationManagementService.makeClearance(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }

  // ============ ЗАПРОСЫ ВКЛАДЧИКОВ ============

  /**
   * Получение всех вкладчиков с фильтрацией
   */
  @Query(() => paginatedContributorsResult, {
    name: 'capitalContributors',
    description: 'Получение списка вкладчиков кооператива с фильтрацией',
  })
  async getContributors(
    @Args('filter', { nullable: true }) filter?: ContributorFilterInputDTO,
    @Args('options', { nullable: true }) options?: PaginationInputDTO
  ): Promise<PaginationResult<ContributorOutputDTO>> {
    return await this.participationManagementService.getContributors(filter, options);
  }

  /**
   * Получение вкладчика по ID
   */
  @Query(() => ContributorOutputDTO, {
    name: 'capitalContributor',
    description: 'Получение вкладчика по внутреннему ID базы данных',
    nullable: true,
  })
  async getContributor(@Args('_id') _id: string): Promise<ContributorOutputDTO | null> {
    return await this.participationManagementService.getContributorById(_id);
  }
}
