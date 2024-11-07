// modules/appstore/resolvers/appstore.resolver.ts

import { Resolver, Query, Mutation, Args, Directive } from '@nestjs/graphql';
import { AppManagementService } from '../services/appstore-app.service';
import { ExtensionGraphQLDTO } from '../dto/extension-graphql.dto';
import { ExtensionGraphQLInput } from '../dto/extension-graphql-input.dto';

@Resolver(() => ExtensionGraphQLDTO)
export class AppStoreResolver<TConfig = any> {
  constructor(private readonly appManagementService: AppManagementService<TConfig>) {}

  @Query(() => [ExtensionGraphQLDTO], { name: 'apps', description: 'get list of extensions' })
  async getAppList(): Promise<ExtensionGraphQLDTO<TConfig>[]> {
    return this.appManagementService.getAppList();
  }

  @Mutation(() => ExtensionGraphQLDTO, { name: 'installApp', description: 'install the extension' })
  @Directive('@auth(roles: ["chairman"])')
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
