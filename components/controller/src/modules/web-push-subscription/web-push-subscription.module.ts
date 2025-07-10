import { Module } from '@nestjs/common';
import { WebPushSubscriptionService } from './services/web-push-subscription.service';
import { WebPushSubscriptionResolver } from './resolvers/web-push-subscription.resolver';
import { NotificationDomainModule } from '~/domain/notification/notification-domain.module';

/**
 * Модуль приложения для управления веб-пуш подписками
 */
@Module({
  imports: [
    NotificationDomainModule, // Импортируем доменный модуль уведомлений
  ],
  providers: [WebPushSubscriptionService, WebPushSubscriptionResolver],
  exports: [WebPushSubscriptionService],
})
export class WebPushSubscriptionModule {}
