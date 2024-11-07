import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import httpStatus from 'http-status';
import ApiError from '~/utils/ApiError';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Получаем требуемые роли из метаданных метода
    const allowedRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!allowedRoles) {
      return true; // Если роли не заданы, доступ открыт
    }

    const ctx = GqlExecutionContext.create(context);
    const { user } = ctx.getContext().req;

    // Проверка: имеет ли пользователь одну из разрешенных ролей
    if (allowedRoles.includes(user.role)) {
      return true;
    }

    throw new ApiError(httpStatus.FORBIDDEN, 'Недостаточно прав доступа');
  }
}
