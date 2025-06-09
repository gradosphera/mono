import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import config from '~/config/config';

@Injectable()
export class RolesGuard implements CanActivate {
  /**
   * RolesGuard обеспечивает проверку доступа на основе ролей пользователя или сопоставления `username`.
   *
   * Работает следующим образом:
   * 1. Если присутствует заголовок `server-secret`, доступ разрешён.
   * 2. Если роли не заданы через декоратор `@AuthRoles`, доступ открыт.
   * 3. Если пользователь обращается к своим ресурсам (поле `username` внутри объекта `data` в запросе совпадает с `user.username`), доступ разрешён.
   * 4. Если пользователь имеет хотя бы одну из разрешённых ролей, доступ разрешён.
   * 5. В иных случаях доступ запрещён, выбрасывается ошибка с кодом 401.
   *
   * @param {Reflector} reflector - Сервис для извлечения метаданных, таких как роли, установленные в декораторе `@AuthRoles`.
   */
  constructor(private reflector: Reflector) {}

  /**
   * Проверяет, может ли пользователь получить доступ к ресурсу.
   *
   * @param {ExecutionContext} context - Текущий контекст исполнения, предоставляемый NestJS.
   * @returns {boolean} - Возвращает `true`, если доступ разрешён, иначе выбрасывает исключение.
   *
   * @throws {ApiError} - Выбрасывает исключение с кодом `403`, если пользователь не имеет доступа.
   */
  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    // Пропуск гуарда при наличии server-secret
    if (request.headers['server-secret'] === config.server_secret) {
      return true;
    }

    // Получаем требуемые роли из метаданных метода
    const allowedRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!allowedRoles) {
      return true; // Если роли не заданы, доступ открыт
    }

    const { user } = request;

    // Если пользователь обращается к своим ресурсам через `data.username`
    const data = ctx.getArgs().data; // Извлекаем объект data из аргументов GraphQL
    if (data && data.username && user.username === data.username) {
      return true; // Если username совпадает, разрешаем доступ
    }
    // Проверка: имеет ли пользователь одну из разрешенных ролей
    if (allowedRoles.includes(user.role)) {
      return true;
    }

    throw new UnauthorizedException(`Недостаточно прав доступа`);
  }
}
