// modules/notificator/processors/email.processor.ts

import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { BullService } from '../../bull/bull.service';

@Processor('notificationQueue')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly bullService: BullService) {}

  @Process('email')
  async handleEmailTask(job: Job<any>): Promise<void> {
    this.logger.log(`Processing email task with id ${job.id}`);

    try {
      // Реализация отправки email
      await this.sendEmail(job.data);

      // Обновление прогресса задачи до 100%
      await this.bullService.updateJobProgress(job, 100);

      // Пометка задачи как завершенной
      await this.bullService.completeJob(job);
    } catch (error: any) {
      this.logger.error(`Error in email task ${job.id}: ${error.message}`);

      // Пометка задачи как провалившейся
      await this.bullService.failJob(job, error);
    }
  }

  private async sendEmail(data: any): Promise<void> {
    // Логика отправки email
    await new Promise((resolve) => setTimeout(resolve, 500)); // Заглушка для симуляции отправки
    // Если нужно симулировать ошибку, можно выбросить исключение:
    // throw new Error('Email sending failed');
  }
}
