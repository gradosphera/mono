import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import config from '~/config/config';
import { MonoAccountStatusDomainInterface } from '~/domain/account/interfaces/mono-account-domain.interface';

/**
 * Разрешает доступ только пользователям в статусе `active` (см. `users.status` / JWT payload).
 * Inter-service: при валидном `server-secret` проверка не выполняется (как в {@link RolesGuard}).
 */
@Injectable()
export class ActiveUserStatusGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    if (request.headers['server-secret'] === config.server_secret) {
      return true;
    }

    const user = request.user as { status?: string } | undefined;
    if (!user?.status) {
      throw new ForbiddenException('Требуется авторизованный пользователь');
    }

    if (user.status !== MonoAccountStatusDomainInterface.Active) {
      throw new ForbiddenException(
        'Доступ только для пайщиков в статусе «active»',
      );
    }

    return true;
  }
}
