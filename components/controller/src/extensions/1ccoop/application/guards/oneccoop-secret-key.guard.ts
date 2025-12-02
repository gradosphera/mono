import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { OneCoopPlugin } from '../../oneccoop-extension.module';

/**
 * Имя заголовка для передачи секретного ключа
 */
export const ONECOOP_SECRET_KEY_HEADER = 'x-onecoop-secret-key';

/**
 * Guard для проверки секретного ключа расширения 1CCoop
 * Проверяет наличие и валидность секретного ключа в заголовке запроса
 */
@Injectable()
export class OneCoopSecretKeyGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => OneCoopPlugin))
    private readonly oneCoopPlugin: OneCoopPlugin
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const gqlContext = GqlExecutionContext.create(context);
    const ctx = gqlContext.getContext();

    // Получаем заголовки из request
    const request = ctx.req;
    if (!request) {
      throw new UnauthorizedException('Запрос не содержит необходимых данных');
    }

    // Получаем секретный ключ из заголовка
    const providedSecretKey = request.headers[ONECOOP_SECRET_KEY_HEADER];

    if (!providedSecretKey) {
      throw new UnauthorizedException(`Отсутствует заголовок ${ONECOOP_SECRET_KEY_HEADER}`);
    }

    // Получаем сохранённый секретный ключ
    const storedSecretKey = this.oneCoopPlugin.getSecretKey();

    if (!storedSecretKey) {
      throw new UnauthorizedException('Секретный ключ расширения не настроен');
    }

    // Сравниваем ключи (используем timing-safe сравнение для защиты от timing attacks)
    if (!this.timingSafeEqual(providedSecretKey, storedSecretKey)) {
      throw new UnauthorizedException('Неверный секретный ключ');
    }

    return true;
  }

  /**
   * Timing-safe сравнение строк для защиты от timing attacks
   */
  private timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }
}
