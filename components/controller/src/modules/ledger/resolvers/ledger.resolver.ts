import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthRoles } from '~/modules/auth/decorators/auth.decorator';
import { GqlJwtAuthGuard } from '~/modules/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/modules/auth/guards/roles.guard';
import { LedgerService } from '../services/ledger.service';
import { GetLedgerInputDTO } from '../dto/get-ledger-input.dto';
import { LedgerStateDTO } from '../dto/ledger-state.dto';

/**
 * GraphQL резолвер для ledger
 * Обеспечивает API для получения состояния плана счетов кооператива
 */
@Resolver()
export class LedgerResolver {
  constructor(private readonly ledgerService: LedgerService) {}

  /**
   * Query: Получить состояние ledger кооператива
   */
  @Query(() => LedgerStateDTO, {
    name: 'getLedger',
    description:
      'Получить полное состояние плана счетов кооператива. Возвращает все счета из стандартного плана счетов с актуальными данными из блокчейна. Если счет не активен в блокчейне, возвращает нулевые значения.',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async getLedger(
    @Args('data', { type: () => GetLedgerInputDTO })
    data: GetLedgerInputDTO
  ): Promise<LedgerStateDTO> {
    return this.ledgerService.getLedger(data);
  }
}
