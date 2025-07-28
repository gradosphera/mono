import { Module } from '@nestjs/common';
import { WebPushSubscriptionResolver } from './resolvers/web-push-subscription.resolver';
import { WebPushSubscriptionService } from './services/web-push-subscription.service';
import { CleanupService } from './services/cleanup.service';
import { NotificationWebhookController } from './controllers/notification-webhook.controller';
import { NotificationWebhookService } from './services/notification-webhook.service';
import { DeviceTokenService } from './services/device-token.service';
import { NotificationSenderService } from './services/notification-sender.service';
import { WebPushService } from './services/web-push.service';
import { NotificationDomainModule } from '~/domain/notification/notification-domain.module';
import { NovuCredentialsAdapter } from '~/infrastructure/novu/novu-credentials.adapter';
import { NovuWorkflowAdapter } from '~/infrastructure/novu/novu-workflow.adapter';
import { NOVU_CREDENTIALS_PORT } from '~/domain/notification/interfaces/novu-credentials.port';
import { NOVU_WORKFLOW_PORT } from '~/domain/notification/interfaces/novu-workflow.port';

/**
 * Модуль приложения для управления уведомлениями
 * Включает веб-пуш подписки, webhook обработку и NOVU интеграцию
 */
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
    WebPushService,
    // Биндинги портов к адаптерам
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
    NOVU_CREDENTIALS_PORT,
    NOVU_WORKFLOW_PORT,
  ],
})
export class NotificationModule {}
