import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { CapitalService } from '../services/capital.service';
import { CreateProjectPropertyInputDTO } from '../dto/property_management/create-project-property-input.dto';
import { CreateProgramPropertyInputDTO } from '../dto/property_management/create-program-property-input.dto';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/application/auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { AuthRoles } from '~/application/auth/decorators/auth.decorator';

/**
 * GraphQL резолвер для действий управления имущественными взносами CAPITAL контракта
 */
@Resolver()
export class PropertyManagementResolver {
  constructor(private readonly capitalService: CapitalService) {}

  /**
   * Мутация для создания проектного имущественного взноса в CAPITAL контракте
   */
  @Mutation(() => String, {
    name: 'createCapitalProjectProperty',
    description: 'Создание проектного имущественного взноса в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['participant'])
  async createCapitalProjectProperty(
    @Args('data', { type: () => CreateProjectPropertyInputDTO }) data: CreateProjectPropertyInputDTO
  ): Promise<string> {
    const result = await this.capitalService.createProjectProperty(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }

  /**
   * Мутация для создания программного имущественного взноса в CAPITAL контракте
   */
  @Mutation(() => String, {
    name: 'createCapitalProgramProperty',
    description: 'Создание программного имущественного взноса в CAPITAL контракте',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['participant'])
  async createCapitalProgramProperty(
    @Args('data', { type: () => CreateProgramPropertyInputDTO }) data: CreateProgramPropertyInputDTO
  ): Promise<string> {
    const result = await this.capitalService.createProgramProperty(data);
    return result.resolved?.transaction?.id?.toString() || 'неизвестно';
  }
}
