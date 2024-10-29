// modules/notificator/notificator.service.ts

import { Injectable } from '@nestjs/common';
import { BullService } from '../bull/bull.service';
import { JobOptions } from 'bull';

@Injectable()
export class NotificatorService {
  constructor(private readonly bullService: BullService) {}

  async notifyUser(
    userId: string,
    sequential: boolean = false, // Для последовательного или параллельного выполнения
  ): Promise<string> {
    const queueName = 'notificationQueue';
    const jobData = {
      taskName: 'User Notification',
      userId,
      sequential,
    };

    // Добавляем задачу в очередь
    const job = await this.bullService.addJob(
      queueName,
      'email', // Тип задачи, которую будет обрабатывать процессор
      jobData,
      {},
    );

    // Возвращаем ID задачи для отслеживания прогресса
    return job.id as string;
  }
}
