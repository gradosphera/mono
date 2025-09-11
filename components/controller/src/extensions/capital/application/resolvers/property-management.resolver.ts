import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { PropertyManagementService } from '../services/property-management.service';
import { CreateProjectPropertyInputDTO } from '../dto/property_management/create-project-property-input.dto';
import { CreateProgramPropertyInputDTO } from '../dto/property_management/create-program-property-input.dto';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/application/auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { AuthRoles } from '~/application/auth/decorators/auth.decorator';
import { TransactionDTO } from '~/application/common/dto/transaction-result-response.dto';

/**
 * GraphQL резолвер для действий управления имущественными взносами CAPITAL контракта
 */
@Resolver()
export class PropertyManagementResolver {
  constructor(private readonly propertyManagementService: PropertyManagementService) {}

  /**
   * Мутация для создания проектного имущественного взноса в CAPITAL контракте
   */
  @Mutation(() => TransactionDTO, {
    name: 'capitalCreateProjectProperty',
    description: 'Создание проектного имущественного взноса в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['participant'])
  async createCapitalProjectProperty(
    @Args('data', { type: () => CreateProjectPropertyInputDTO }) data: CreateProjectPropertyInputDTO
  ): Promise<TransactionDTO> {
    const result = await this.propertyManagementService.createProjectProperty(data);
    return result;
  }

  /**
   * Мутация для создания программного имущественного взноса в CAPITAL контракте
   */
  @Mutation(() => TransactionDTO, {
    name: 'capitalCreateProgramProperty',
    description: 'Создание программного имущественного взноса в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['participant'])
  async createCapitalProgramProperty(
    @Args('data', { type: () => CreateProgramPropertyInputDTO }) data: CreateProgramPropertyInputDTO
  ): Promise<TransactionDTO> {
    const result = await this.propertyManagementService.createProgramProperty(data);
    return result;
  }
}
