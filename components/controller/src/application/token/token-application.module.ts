import { Module } from '@nestjs/common';
import { TokenApplicationService } from './services/token-application.service';
import { TokenDomainModule } from '~/domain/token/token-domain.module';

/**
 * Application модуль токенов
 * Предоставляет application сервисы для работы с токенами
 */
@Module({
  imports: [TokenDomainModule],
  providers: [TokenApplicationService],
  exports: [TokenApplicationService],
})
export class TokenApplicationModule {}
