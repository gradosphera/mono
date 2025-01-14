import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import config from '~/config/config';

@Injectable()
export class GqlJwtAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);

    // Проверка заголовка server-secret
    const request = ctx.getContext().req;
    if (request.headers['server-secret'] === config.server_secret) {
      // Если заголовок `server-secret` соответствует значению, пропускаем проверку
      return request;
    }

    // Проверка WebSocket-соединения
    if (ctx.getType() === 'ws') {
      const { connectionParams } = ctx.getContext();
      return { headers: { authorization: connectionParams?.authorization } };
    }

    // Обработка обычного HTTP-запроса
    return request;
  }

  canActivate(context: ExecutionContext) {
    const request = this.getRequest(context);

    // Пропуск аутентификации при наличии server-secret
    if (request.headers['server-secret'] === config.server_secret) {
      return true;
    }

    return super.canActivate(context);
  }
}
