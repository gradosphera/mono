// modules/redis/redis.module.ts
import { Module } from '@nestjs/common';
import { RedisModule } from '~/infrastructure/redis/redis.module';

@Module({
  imports: [RedisModule],
})
export class RedisAppModule {}
