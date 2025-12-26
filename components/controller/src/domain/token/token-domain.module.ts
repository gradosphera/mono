import { Module } from '@nestjs/common';
import { TokenDomainService } from './services/token-domain.service';

/**
 * Доменный модуль токенов
 * Предоставляет доменные сервисы для работы с токенами
 */
@Module({
  providers: [TokenDomainService],
  exports: [TokenDomainService],
})
export class TokenDomainModule {}
