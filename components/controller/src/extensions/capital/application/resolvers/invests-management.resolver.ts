import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { InvestsManagementService } from '../services/invests-management.service';
import { CreateProjectInvestInputDTO } from '../dto/invests_management/create-project-invest-input.dto';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/application/auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { AuthRoles } from '~/application/auth/decorators/auth.decorator';
import { TransactionDTO } from '~/application/common/dto/transaction-result-response.dto';
import { InvestFilterInputDTO } from '../dto/invests_management/invest-filter.input';
import { createPaginationResult, PaginationInputDTO, PaginationResult } from '~/application/common/dto/pagination.dto';
import { InvestOutputDTO } from '../dto/invests_management/invest.dto';
import { ProgramInvestOutputDTO } from '../dto/invests_management/program-invest.dto';

// Пагинированные результаты
const paginatedInvestsResult = createPaginationResult(InvestOutputDTO, 'PaginatedCapitalInvests');
const paginatedProgramInvestsResult = createPaginationResult(ProgramInvestOutputDTO, 'PaginatedCapitalProgramInvests');

/**
 * GraphQL резолвер для действий управления инвестициями CAPITAL контракта
 */
@Resolver()
export class InvestsManagementResolver {
  constructor(private readonly investsManagementService: InvestsManagementService) {}

  /**
   * Мутация для инвестирования в проект CAPITAL контракта
   */
  @Mutation(() => TransactionDTO, {
    name: 'capitalCreateProjectInvest',
    description: 'Инвестирование в проект CAPITAL контракта',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['participant'])
  async createCapitalProjectInvest(
    @Args('data', { type: () => CreateProjectInvestInputDTO }) data: CreateProjectInvestInputDTO
  ): Promise<TransactionDTO> {
    const result = await this.investsManagementService.createProjectInvest(data);
    return result;
  }

  // ============ ЗАПРОСЫ ИНВЕСТИЦИЙ ============

  /**
   * Получение всех инвестиций с фильтрацией
   */
  @Query(() => paginatedInvestsResult, {
    name: 'capitalInvests',
    description: 'Получение списка инвестиций кооператива с фильтрацией',
  })
  async getInvests(
    @Args('filter', { nullable: true }) filter?: InvestFilterInputDTO,
    @Args('options', { nullable: true }) options?: PaginationInputDTO
  ): Promise<PaginationResult<InvestOutputDTO>> {
    return await this.investsManagementService.getInvests(filter, options);
  }

  /**
   * Получение инвестиции по ID
   */
  @Query(() => InvestOutputDTO, {
    name: 'capitalInvest',
    description: 'Получение инвестиции по внутреннему ID базы данных',
    nullable: true,
  })
  async getInvest(@Args('_id') _id: string): Promise<InvestOutputDTO | null> {
    return await this.investsManagementService.getInvestById(_id);
  }

  /**
   * Получение всех программных инвестиций с фильтрацией
   */
  @Query(() => paginatedProgramInvestsResult, {
    name: 'capitalProgramInvests',
    description: 'Получение списка программных инвестиций кооператива с фильтрацией',
  })
  async getProgramInvests(
    @Args('filter', { nullable: true }) filter?: InvestFilterInputDTO,
    @Args('options', { nullable: true }) options?: PaginationInputDTO
  ): Promise<PaginationResult<ProgramInvestOutputDTO>> {
    return await this.investsManagementService.getProgramInvests(filter, options);
  }

  /**
   * Получение программной инвестиции по ID
   */
  @Query(() => ProgramInvestOutputDTO, {
    name: 'capitalProgramInvest',
    description: 'Получение программной инвестиции по внутреннему ID базы данных',
    nullable: true,
  })
  async getProgramInvest(@Args('_id') _id: string): Promise<ProgramInvestOutputDTO | null> {
    return await this.investsManagementService.getProgramInvestById(_id);
  }
}
