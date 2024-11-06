// infrastructure/redis/redis.module.ts

import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisProvider } from './redis.provider';

@Module({
  providers: [RedisProvider, RedisService],
  exports: [RedisService], // Экспортируем RedisService для использования в других модулях
})
export class RedisModule {}
