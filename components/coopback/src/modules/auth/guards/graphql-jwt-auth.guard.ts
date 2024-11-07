// src/auth/guards/graphql-jwt-auth.guard.ts
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class GqlJwtAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);

    // Проверяем, является ли запрос WebSocket-соединением
    if (ctx.getType() === 'ws') {
      const { connectionParams } = ctx.getContext();
      return { headers: { authorization: connectionParams?.authorization } };
    }

    // Обработка обычного HTTP-запроса
    return ctx.getContext().req;
  }
}
