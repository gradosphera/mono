import { Global, Module } from '@nestjs/common';
import { NotificationDomainService, NOTIFICATION_DOMAIN_SERVICE } from './services/notification-domain.service';
import { WebPushSubscriptionDomainInteractor } from './interactors/web-push-subscription-domain.interactor';
import { InfrastructureModule } from '~/infrastructure/infrastructure.module';

@Global()
@Module({
  imports: [InfrastructureModule],
  providers: [
    NotificationDomainService,
    {
      provide: NOTIFICATION_DOMAIN_SERVICE,
      useExisting: NotificationDomainService,
    },
    WebPushSubscriptionDomainInteractor,
  ],
  exports: [NotificationDomainService, NOTIFICATION_DOMAIN_SERVICE, WebPushSubscriptionDomainInteractor],
})
export class NotificationDomainModule {}
