import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import config from '~/config/config';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
      },
    }),
    // Здесь можно зарегистрировать несколько очередей, если нужно:
    // BullModule.registerQueue({ name: 'taskQueue' }),
  ],
  exports: [BullModule], // Экспортируем BullModule для использования в других модулях
})
export class QueueModule {}
