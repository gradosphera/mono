import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { DebtManagementService } from '../services/debt-management.service';
import { CreateDebtInputDTO } from '../dto/debt_management/create-debt-input.dto';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/application/auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { AuthRoles } from '~/application/auth/decorators/auth.decorator';
import { TransactionDTO } from '~/application/common/dto/transaction-result-response.dto';
import { DebtOutputDTO } from '../dto/debt_management/debt.dto';
import { DebtFilterInputDTO } from '../dto/debt_management/debt-filter.input';
import { createPaginationResult, PaginationInputDTO, PaginationResult } from '~/application/common/dto/pagination.dto';

// Пагинированные результаты
const paginatedDebtsResult = createPaginationResult(DebtOutputDTO, 'PaginatedCapitalDebts');

/**
 * GraphQL резолвер для действий управления долгами CAPITAL контракта
 */
@Resolver()
export class DebtManagementResolver {
  constructor(private readonly debtManagementService: DebtManagementService) {}

  /**
   * Мутация для получения ссуды в CAPITAL контракте
   */
  @Mutation(() => TransactionDTO, {
    name: 'capitalCreateDebt',
    description: 'Получение ссуды в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['participant'])
  async createCapitalDebt(
    @Args('data', { type: () => CreateDebtInputDTO }) data: CreateDebtInputDTO
  ): Promise<TransactionDTO> {
    const result = await this.debtManagementService.createDebt(data);
    return result;
  }

  // ============ ЗАПРОСЫ ДОЛГОВ ============

  /**
   * Получение всех долгов с фильтрацией
   */
  @Query(() => paginatedDebtsResult, {
    name: 'capitalDebts',
    description: 'Получение списка долгов кооператива с фильтрацией',
  })
  async getDebts(
    @Args('filter', { nullable: true }) filter?: DebtFilterInputDTO,
    @Args('options', { nullable: true }) options?: PaginationInputDTO
  ): Promise<PaginationResult<DebtOutputDTO>> {
    return await this.debtManagementService.getDebts(filter, options);
  }

  /**
   * Получение долга по ID
   */
  @Query(() => DebtOutputDTO, {
    name: 'capitalDebt',
    description: 'Получение долга по внутреннему ID базы данных',
    nullable: true,
  })
  async getDebt(@Args('_id') _id: string): Promise<DebtOutputDTO | null> {
    return await this.debtManagementService.getDebtById(_id);
  }
}
