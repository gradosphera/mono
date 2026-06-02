import { Module } from '@nestjs/common';
import { AppsCatalogHttpService } from './infrastructure/apps-catalog-http.service';
import { AppsCatalogProxyResolver } from './application/resolvers/apps-catalog-proxy.resolver';

/**
 * Story 9.5.b — модуль-прокси для публичного каталога apps-catalog.
 *
 * Резолвер `appsCatalogRemotePackages` + HTTP-клиент к ca-admin.
 * Никакого state, никаких миграций, без TypeORM. Включается в
 * `ExtensionsModule` в общий imports/exports список.
 */
@Module({
  providers: [AppsCatalogHttpService, AppsCatalogProxyResolver],
  exports: [AppsCatalogHttpService],
})
export class AppsCatalogProxyModule {}
