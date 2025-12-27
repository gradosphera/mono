// src/auth/strategies/jwt.strategy.ts
import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import config from '~/config/config';
import { tokenTypes } from '~/types/token.types';
import { USER_REPOSITORY, UserRepository } from '~/domain/user/repositories/user.repository';
import { UserDomainService, USER_DOMAIN_SERVICE } from '~/domain/user/services/user-domain.service';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(JwtStrategy) {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(USER_DOMAIN_SERVICE) private readonly userDomainService: UserDomainService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.jwt.secret,
    });
  }

  async validate(payload: any) {
    if (payload.type !== tokenTypes.ACCESS) {
      throw new Error('Invalid token type');
    }

    const userId = payload.sub;

    // Определяем тип ID заранее для оптимизации запросов
    let user;
    if (this.isLegacyMongoId(userId)) {
      // Это legacy MongoDB ObjectId
      try {
        user = await this.userDomainService.getUserByLegacyMongoId(userId);
      } catch (error) {
        throw new Error('Пользователь с указанным JWT не найден');
      }
    } else if (this.isValidUuid(userId)) {
      // Это новый UUID
      user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('Пользователь с указанным JWT не найден');
      }
    } else {
      // Неизвестный формат ID
      throw new Error('Неверный формат ID пользователя в JWT токене');
    }

    // Возвращаем объект в формате, совместимом с MonoAccountDomainInterface
    return {
      id: user.id,
      username: user.username,
      status: user.status,
      message: user.message,
      is_registered: user.is_registered,
      has_account: user.has_account,
      type: user.type,
      public_key: user.public_key,
      referer: user.referer,
      email: user.email,
      role: user.role,
      is_email_verified: user.is_email_verified,
      subscriber_id: user.subscriber_id,
      subscriber_hash: user.subscriber_hash,
    };
  }

  /**
   * Проверяет, является ли строка legacy MongoDB ObjectId (24 hex символа)
   */
  private isLegacyMongoId(id: string): boolean {
    return /^[a-f\d]{24}$/i.test(id);
  }

  /**
   * Проверяет, является ли строка валидным UUID (с дефисами или без)
   */
  private isValidUuid(id: string): boolean {
    // UUID с дефисами: 8-4-4-4-12
    const uuidWithDashes = /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i;
    // UUID без дефисов: 32 символа
    const uuidWithoutDashes = /^[a-f\d]{32}$/i;

    return uuidWithDashes.test(id) || uuidWithoutDashes.test(id);
  }
}
