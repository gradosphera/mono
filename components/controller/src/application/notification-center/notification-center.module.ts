import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationOutboxTypeormEntity } from '~/infrastructure/database/typeorm/entities/notification-outbox.typeorm-entity';
import { NotificationDeliveryTypeormEntity } from '~/infrastructure/database/typeorm/entities/notification-delivery.typeorm-entity';
import { NOTIFICATION_PORT } from '~/domain/notification/interfaces/notify.port';
import { NotificationService } from './notification.service';

/**
 * Центр уведомлений (DC v3) — единый вход уведомлений кооператива.
 *
 * Экспортирует {@link NOTIFICATION_PORT} → {@link NotificationService}: consumer-сервисы
 * инжектят порт и шлют уведомления через `notify()`, не зная про каналы и провайдеров.
 * Каналы и worker отправки добавляются в эпиках 2–3.
 */
@Module({
  imports: [TypeOrmModule.forFeature([NotificationOutboxTypeormEntity, NotificationDeliveryTypeormEntity])],
  providers: [
    NotificationService,
    {
      provide: NOTIFICATION_PORT,
      useExisting: NotificationService,
    },
  ],
  exports: [NOTIFICATION_PORT, NotificationService],
})
export class NotificationCenterModule {}
