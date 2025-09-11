import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { ContractManagementService } from '../services/contract-management.service';
import { SetConfigInputDTO } from '../dto/contract_management';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/application/auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { AuthRoles } from '~/application/auth/decorators/auth.decorator';

/**
 * GraphQL резолвер для действий управления контрактом CAPITAL
 */
@Resolver()
export class ContractManagementResolver {
  constructor(private readonly contractManagementService: ContractManagementService) {}

  /**
   * Мутация для установки конфигурации CAPITAL контракта
   */
  @Mutation(() => String, {
    name: 'capitalSetConfig',
    description: 'Установка конфигурации CAPITAL контракта',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async setCapitalConfig(@Args('data', { type: () => SetConfigInputDTO }) data: SetConfigInputDTO): Promise<string> {
    const result = await this.contractManagementService.setConfig(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }
}
