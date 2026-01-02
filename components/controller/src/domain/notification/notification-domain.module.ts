import { Module } from '@nestjs/common';
import { NotificationDomainService, NOTIFICATION_DOMAIN_SERVICE } from './services/notification-domain.service';

/**
 * Доменный модуль для управления уведомлениями
 * Включает интеракторы и сервисы для работы с уведомлениями
 */
@Module({
  imports: [],
  providers: [
    NotificationDomainService,
    {
      provide: NOTIFICATION_DOMAIN_SERVICE,
      useExisting: NotificationDomainService,
    },
  ],
  exports: [NotificationDomainService, NOTIFICATION_DOMAIN_SERVICE],
})
export class NotificationDomainModule {}
