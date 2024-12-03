// modules/redis/redis.module.ts
import { Module } from '@nestjs/common';
import { RedisNotificationHandler } from './redis-notification-app.handler';
import { RedisModule } from '~/infrastructure/redis/redis.module';
import { PaymentDomainModule } from '~/domain/payment/payment.module';

@Module({
  imports: [RedisModule, PaymentDomainModule],
  providers: [RedisNotificationHandler],
  exports: [RedisNotificationHandler],
})
export class RedisAppModule {}
