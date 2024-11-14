import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { AppManagementService } from '../services/appstore-app.service';
import { ExtensionGraphQLDTO } from '../dto/extension-graphql.dto';
import { ExtensionGraphQLInput } from '../dto/extension-graphql-input.dto';
import { UseGuards } from '@nestjs/common';
import { GqlJwtAuthGuard } from '~/modules/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/modules/auth/guards/roles.guard';
import { AuthRoles } from '~/modules/auth/decorators/auth.decorator';
import { GetExtensionsGraphQLInput } from '../dto/get-extensions-input.dto';
import { UninstallExtensionGraphQLInput } from '../dto/uninstall-extension-input.dto';

@Resolver(() => ExtensionGraphQLDTO)
export class AppStoreResolver<TConfig = any> {
  constructor(private readonly appManagementService: AppManagementService<TConfig>) {}

  @Query(() => [ExtensionGraphQLDTO], { name: 'getExtensions', description: 'Получить список расширений' })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async getAppList(
    @Args('data', { type: () => GetExtensionsGraphQLInput, nullable: true }) data?: GetExtensionsGraphQLInput
  ): Promise<ExtensionGraphQLDTO<TConfig>[]> {
    return this.appManagementService.getCombinedAppList(data);
  }

  @Mutation(() => ExtensionGraphQLDTO, { name: 'installExtension', description: 'Установить расширение' })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async installApp(
    @Args('data', { type: () => ExtensionGraphQLInput }) data: ExtensionGraphQLInput
  ): Promise<ExtensionGraphQLDTO<TConfig>> {
    return this.appManagementService.installApp(data);
  }

  @Mutation(() => ExtensionGraphQLDTO, { name: 'updateExtension', description: 'Обновить расширение' })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async updateExtension(
    @Args('data', { type: () => ExtensionGraphQLInput }) data: ExtensionGraphQLInput
  ): Promise<ExtensionGraphQLDTO<TConfig>> {
    return this.appManagementService.updateApp(data);
  }

  @Mutation(() => Boolean, { name: 'uninstallExtension', description: 'Удалить расширение' })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async uninstallApp(
    @Args('data', { type: () => UninstallExtensionGraphQLInput }) data: UninstallExtensionGraphQLInput
  ): Promise<boolean> {
    return this.appManagementService.uninstallApp(data);
  }
}
