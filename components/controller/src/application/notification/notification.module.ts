import { Global, Module } from '@nestjs/common';
import { WebPushSubscriptionResolver } from './resolvers/web-push-subscription.resolver';
import { WebPushSubscriptionService } from './services/web-push-subscription.service';
import { CleanupService } from './services/cleanup.service';
import { NotificationWebhookController } from './controllers/notification-webhook.controller';
import { NotificationWebhookService } from './services/notification-webhook.service';
import { DeviceTokenService } from './services/device-token.service';
import { NotificationSenderService } from './services/notification-sender.service';
import { NotificationEventService } from './services/notification-event.service';
import { WebPushService } from './services/web-push.service';
import { NotificationDomainModule } from '~/domain/notification/notification-domain.module';
import { NovuCredentialsAdapter } from '~/infrastructure/novu/novu-credentials.adapter';
import { NovuWorkflowAdapter } from '~/infrastructure/novu/novu-workflow.adapter';
import { NovuAdapter } from '~/infrastructure/novu/novu.adapter';
import { NOVU_CREDENTIALS_PORT } from '~/domain/notification/interfaces/novu-credentials.port';
import { NOVU_WORKFLOW_PORT } from '~/domain/notification/interfaces/novu-workflow.port';
import { NOTIFICATION_PORT } from '~/domain/notification/interfaces/notification.port';

/**
 * Модуль приложения для управления уведомлениями
 * Включает веб-пуш подписки, webhook обработку и NOVU интеграцию
 */
@Global()
@Module({
  imports: [NotificationDomainModule],
  controllers: [NotificationWebhookController],
  providers: [
    WebPushSubscriptionResolver,
    WebPushSubscriptionService,
    CleanupService,
    NotificationWebhookService,
    DeviceTokenService,
    NotificationSenderService,
    NotificationEventService,
    WebPushService,
    // Биндинги портов к адаптерам
    {
      provide: NOTIFICATION_PORT,
      useClass: NovuAdapter,
    },
    {
      provide: NOVU_CREDENTIALS_PORT,
      useClass: NovuCredentialsAdapter,
    },
    {
      provide: NOVU_WORKFLOW_PORT,
      useClass: NovuWorkflowAdapter,
    },
  ],
  exports: [
    CleanupService,
    NotificationWebhookService,
    DeviceTokenService,
    NotificationSenderService,
    WebPushService,
    NOTIFICATION_PORT,
    NOVU_CREDENTIALS_PORT,
    NOVU_WORKFLOW_PORT,
  ],
})
export class NotificationModule {}
