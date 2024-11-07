// modules/appstore/resolvers/appstore.resolver.ts

import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { AppManagementService } from '../services/appstore-app.service';
import { ExtensionGraphQLDTO } from '../dto/extension-graphql.dto';
import { ExtensionGraphQLInput } from '../dto/extension-graphql-input.dto';
import { UseGuards } from '@nestjs/common';
import { GqlJwtAuthGuard } from '~/modules/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/modules/auth/guards/roles.guard';
import { AuthRoles } from '~/modules/auth/decorators/auth.decorator';

@Resolver(() => ExtensionGraphQLDTO)
export class AppStoreResolver<TConfig = any> {
  constructor(private readonly appManagementService: AppManagementService<TConfig>) {}

  @Query(() => [ExtensionGraphQLDTO], { name: 'getExtensions', description: 'Get list of extensions' })
  async getAppList(): Promise<ExtensionGraphQLDTO<TConfig>[]> {
    return this.appManagementService.getAppList();
  }

  @Mutation(() => ExtensionGraphQLDTO, { name: 'installExtension', description: 'Install the extension' })
  @UseGuards(GqlJwtAuthGuard, RolesGuard) // Сначала JWT-аутентификация, затем проверка ролей
  @AuthRoles(['chairman']) // Указываем роли, которым разрешен доступ
  async installApp(
    @Args('appData', { type: () => ExtensionGraphQLInput }) appData: Partial<ExtensionGraphQLDTO<TConfig>>
  ): Promise<ExtensionGraphQLDTO<TConfig>> {
    return this.appManagementService.installApp(appData);
  }

  // Тестовый метод helloWorld
  @Query(() => String)
  helloWorld(): string {
    return 'Hello, world!';
  }
}
