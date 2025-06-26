// modules/redis/redis.module.ts
import { Module } from '@nestjs/common';
import { RedisNotificationHandler } from './redis-notification-app.handler';
import { RedisModule } from '~/infrastructure/redis/redis.module';
import { GatewayDomainModule } from '~/domain/gateway/gateway-domain.module';

@Module({
  imports: [RedisModule, GatewayDomainModule],
  providers: [RedisNotificationHandler],
  exports: [RedisNotificationHandler],
})
export class RedisAppModule {}
