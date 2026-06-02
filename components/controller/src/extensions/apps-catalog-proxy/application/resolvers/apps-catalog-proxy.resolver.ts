import { Args, Query, Resolver } from '@nestjs/graphql';
import { Logger, UseGuards } from '@nestjs/common';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { AppsCatalogHttpService } from '../../infrastructure/apps-catalog-http.service';
import { AppsCatalogRemotePackageDTO } from '../dto/apps-catalog-remote-package.dto';

/**
 * Story 9.5.b — публичный каталог remote-пакетов на desktop'е магазина.
 *
 * Прокси-резолвер: controller ходит к ca-admin /v1/public/packages, маппит
 * snake_case wire-формат в camelCase GraphQL-проекцию, добавляет UI-поля
 * (title/description/rubPerMonth) для витрины. В V1 description и
 * rubPerMonth — заглушки; в V2 будут читаться из package manifest и
 * apps-catalog pricing соответственно.
 *
 * Guard: GqlJwtAuthGuard — каталог видят только авторизованные пайщики
 * (по умолчанию роль `user`). Self-filter и self-sub bypass делает
 * desktop по сравнению `publisher` и текущего coopname.
 */
@Resolver()
export class AppsCatalogProxyResolver {
  private readonly logger = new Logger(AppsCatalogProxyResolver.name);

  constructor(private readonly client: AppsCatalogHttpService) {}

  @Query(() => [AppsCatalogRemotePackageDTO], {
    name: 'appsCatalogRemotePackages',
    description:
      'Список remote-пакетов из публичного каталога apps-catalog. ' +
      'Защищён JWT (видят только авторизованные пайщики). ' +
      'Источник — ca-admin /v1/public/packages; controller проксирует.',
  })
  @UseGuards(GqlJwtAuthGuard)
  async appsCatalogRemotePackages(
    @Args('page', { type: () => Number, defaultValue: 1 }) page: number,
    @Args('pageSize', { type: () => Number, defaultValue: 50 }) pageSize: number,
  ): Promise<AppsCatalogRemotePackageDTO[]> {
    const packages = await this.client.listPublicPackages(page, pageSize);
    return packages.map((p) => ({
      packageId: p.packageId,
      publisher: p.publisher,
      compatibleSubnets: p.compatibleSubnets,
      lastActiveVersion: p.lastActiveVersion,
      title: this.buildTitle(p.packageId),
      description: this.buildDescription(p.publisher),
      rubPerMonth: 1000,
    }));
  }

  private buildTitle(packageId: string): string {
    const tail = packageId.split('/').pop() ?? packageId;
    return tail.charAt(0).toUpperCase() + tail.slice(1);
  }

  private buildDescription(publisher: string): string {
    return `Удалённое расширение от ${publisher} — устанавливается без перезагрузки сервера.`;
  }
}
