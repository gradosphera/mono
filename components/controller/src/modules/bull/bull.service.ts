// modules/bull/bull.service.ts

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Queue, Job, JobId, JobOptions } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobEntity } from './entities/job.entity';

// Интерфейс для возврата данных после выполнения задачи
export interface JobResult<T> {
  result: T;
}

@Injectable()
export class BullService implements OnModuleInit {
  private readonly logger = new Logger(BullService.name);
  private queues: Map<string, Queue> = new Map();

  constructor(
    @InjectRepository(JobEntity)
    private readonly jobRepository: Repository<JobEntity>,
  ) {}

  onModuleInit() {
    this.logger.log('BullService initialized');
  }

  // Регистрация очереди по её имени, если она уже не была зарегистрирована
  registerQueue(queueName: string, queue: Queue) {
    if (!this.queues.has(queueName)) {
      this.queues.set(queueName, queue);
      this.logger.log(`Очередь зарегистрирована: ${queueName}`);
    } else {
      this.logger.warn(`Очередь ${queueName} уже зарегистрирована.`);
    }
  }

  // Получение очереди по имени
  public getQueue(queueName: string): Queue {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Очередь не зарегистрирована: ${queueName}`);
    }
    return queue;
  }

  // Метод для добавления задачи в очередь с дженериком T для результата
  async addJob<T>(
    queueName: string,
    jobType: string,
    jobData: any,
    options: JobOptions = {
      attempts: 3, // 3 попытки в случае сбоя
      backoff: 1000, // задержка перед повтором в 1000 мс
    },
  ): Promise<Job<JobResult<T>>> {
    this.logger.log(
      `Добавление задачи типа "${jobType}" в очередь "${queueName}" с данными: ${JSON.stringify(
        jobData,
      )}`,
    );
    const queue = this.getQueue(queueName);

    // Создаем задачу с типом результата T
    const job = await queue.add(jobType, jobData, options);

    // Сохраняем задачу в базе данных
    await this.saveJobToDatabase(job, queueName);

    return job as Job<JobResult<T>>;
  }

  // Метод для обновления прогресса задачи
  async updateJobProgress(job: Job, progress: number): Promise<void> {
    await job.progress(progress);
    this.logger.log(`Обновлен прогресс задачи ${job.id} до ${progress}%`);

    // Обновляем запись в базе данных
    await this.saveJobToDatabase(job, job.queue.name);
  }

  // Метод для сохранения результата задачи с дженериком T
  async saveJobResult<T>(job: Job<JobResult<T>>, result: T): Promise<void> {
    job.data.result = result; // Сохраняем результат в данных задачи
    await job.update(job.data); // Обновляем задачу с результатом

    this.logger.log(
      `Результат задачи ${job.id} сохранен: ${JSON.stringify(result)}`,
    );

    // Обновляем запись в базе данных
    await this.saveJobToDatabase(job, job.queue.name);
  }

  // Метод для пометки задачи как завершенной
  async completeJob(job: Job): Promise<void> {
    this.logger.log(`Задача ${job.id} успешно завершена.`);
    await job.moveToCompleted('completed', true);

    // Обновляем запись в базе данных
    await this.saveJobToDatabase(job, job.queue.name);
  }

  // Метод для пометки задачи как провалившейся
  async failJob(job: Job, error: any): Promise<void> {
    this.logger.error(
      `Задача ${job.id} завершилась с ошибкой: ${error.message}`,
    );
    await job.moveToFailed({ message: error.message }, true);

    // Обновляем запись в базе данных
    await this.saveJobToDatabase(job, job.queue.name);
  }

  // Метод для сохранения или обновления задачи в базе данных
  private async saveJobToDatabase(job: Job, queueName: string) {
    const existingJob = await this.jobRepository.findOne({
      where: { jobId: job.id.toString() },
    });

    const progress: number = (
      typeof job.progress === 'number' ? job.progress : 0
    ) as number;

    const jobData = {
      jobId: job.id.toString(),
      queueName,
      data: JSON.stringify(job.data),
      status: await job.getState(),
      progress,
      updatedAt: new Date(),
    };

    if (existingJob) {
      // Обновляем существующую запись
      await this.jobRepository.update(existingJob.id, jobData);
    } else {
      // Создаем новую запись
      const jobEntity = this.jobRepository.create({
        ...jobData,
      });
      await this.jobRepository.save(jobEntity);
    }
  }

  // Получение задачи по ID
  async getJob<T>(
    queueName: string,
    jobId: JobId,
  ): Promise<Job<JobResult<T>> | null> {
    const queue = this.getQueue(queueName);
    const job = await queue.getJob(jobId);
    return job as Job<JobResult<T>>;
  }

  // Методы для извлечения задач из базы данных
  async getAllJobs(): Promise<JobEntity[]> {
    return await this.jobRepository.find();
  }

  async getJobsByQueue(queueName: string): Promise<JobEntity[]> {
    return await this.jobRepository.find({ where: { queueName } });
  }

  async getJobByJobId(jobId: string): Promise<JobEntity | null> {
    return await this.jobRepository.findOne({ where: { jobId } });
  }
}
