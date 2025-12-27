import { Module } from '@nestjs/common';
import { UserDomainService, USER_DOMAIN_SERVICE } from './services/user-domain.service';

/**
 * Доменный модуль пользователей
 * Предоставляет доменные сервисы для работы с пользователями
 */
@Module({
  providers: [
    UserDomainService,
    {
      provide: USER_DOMAIN_SERVICE,
      useExisting: UserDomainService,
    },
  ],
  exports: [UserDomainService, USER_DOMAIN_SERVICE],
})
export class UserDomainModule {}
