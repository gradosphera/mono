import { Module } from '@nestjs/common';
import { WebPushSubscriptionDomainInteractor } from './interactors/web-push-subscription-domain.interactor';
import { NotificationDomainService, NOTIFICATION_DOMAIN_SERVICE } from './services/notification-domain.service';
import { InfrastructureModule } from '~/infrastructure/infrastructure.module';

/**
 * Доменный модуль для управления уведомлениями
 * Включает интеракторы и сервисы для работы с уведомлениями
 */
@Module({
  imports: [InfrastructureModule],
  providers: [
    WebPushSubscriptionDomainInteractor,
    NotificationDomainService,
    {
      provide: NOTIFICATION_DOMAIN_SERVICE,
      useExisting: NotificationDomainService,
    },
  ],
  exports: [WebPushSubscriptionDomainInteractor, NotificationDomainService, NOTIFICATION_DOMAIN_SERVICE],
})
export class NotificationDomainModule {}
