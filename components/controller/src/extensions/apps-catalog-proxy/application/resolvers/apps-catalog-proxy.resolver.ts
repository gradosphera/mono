import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Logger, UseGuards } from '@nestjs/common';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/application/auth/guards/roles.guard';
import { AuthRoles } from '~/application/auth/decorators/auth.decorator';
import { AppsCatalogHttpService } from '../../infrastructure/apps-catalog-http.service';
import { AppsCatalogRemotePackageDTO } from '../dto/apps-catalog-remote-package.dto';
import { PublishPackageInputDTO } from '../dto/publish-package-input.dto';
import { PublishPackageResultDTO } from '../dto/publish-package-result.dto';

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

  /**
   * Story 9.3.b-pub — стол разработчика публикует пакет в каталоге восхода.
   *
   * Защита: только chairman кооператива-оператора (`voskhod` на dev).
   * Сама подпись on-chain `apps::regpkg` делает ca-admin от имени chairman'а
   * восхода — controller только проксирует HTTP-запрос и возвращает
   * discriminated outcome (`applied | conflict | failed`).
   *
   * Multipart upload install.js здесь НЕ делается. Под архитектуру E10
   * расширения публикуются как npm-package + docker-image в Nexus
   * отдельной процедурой (`npm publish` / `docker push`) через scoped
   * JWT от CA-auth. Эта мутация — только on-chain маркер «такой
   * пакет существует».
   */
  @Mutation(() => PublishPackageResultDTO, {
    name: 'publishPackage',
    description:
      'Регистрирует пакет on-chain (action apps::regpkg) через ca-admin. ' +
      'Подписывает chairman кооператива-оператора каталога. Доступно ' +
      'только chairman\'у (стол разработчика).',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async publishPackage(
    @Args('data', { type: () => PublishPackageInputDTO })
    data: PublishPackageInputDTO,
  ): Promise<PublishPackageResultDTO> {
    const outcome = await this.client.registerPackage({
      packageId: data.packageId,
      ownerUsername: data.ownerUsername,
      compatibleSubnets: data.compatibleSubnets,
    });
    if (outcome.status === 'applied') {
      this.logger.log(
        `publishPackage applied: ${data.packageId} (request ${outcome.requestId})`,
      );
      return { status: 'applied', requestId: outcome.requestId };
    }
    if (outcome.status === 'conflict') {
      return {
        status: 'conflict',
        requestId: outcome.requestId,
        error: outcome.error,
      };
    }
    return {
      status: 'failed',
      requestId: outcome.requestId,
      error: outcome.error,
    };
  }
}
