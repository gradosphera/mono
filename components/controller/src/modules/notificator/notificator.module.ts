// src/modules/notificator/notificator.module.ts

import { Module } from '@nestjs/common';
import { BullModule as NestBullModule } from '@nestjs/bull';
import { NotificatorService } from './notificator.service';
import { BullModule } from '../bull/bull.module';
import { BullService } from '../bull/bull.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Module({
  imports: [
    // Регистрируем очередь 'notificationQueue' на уровне модуля
    NestBullModule.registerQueue({
      name: 'notificationQueue',
    }),
    BullModule,
  ],
  providers: [NotificatorService],
})
export class NotificatorModule {
  constructor(
    private readonly bullService: BullService,
    @InjectQueue('notificationQueue') private readonly notificationQueue: Queue,
  ) {
    // Регистрируем очередь в BullService с именем и объектом очереди
    this.bullService.registerQueue('notificationQueue', this.notificationQueue);
  }
}
