import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { config } from '~/config';
import { ProgramShareRegistrationService } from '../../application/services/program-share-registration.service';

/**
 * Периодическая синхронизация долей участников (regshare) по балансу программы Благорост.
 * Интервал задаётся в конфигурации расширения Capital (часы); 0 — отключено.
 */
@Injectable()
export class ProgramShareRegistrationSchedulerService implements OnModuleDestroy {
  private readonly logger = new Logger(ProgramShareRegistrationSchedulerService.name);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly programShareRegistrationService: ProgramShareRegistrationService) {}

  async startFromExtensionConfig(args: { intervalHours: number }): Promise<void> {
    await this.stop();

    const hours = Number(args.intervalHours);
    if (!Number.isFinite(hours) || hours <= 0) {
      this.logger.log(
        'Планировщик regshare не запущен: program_share_registration_interval_hours = 0 или значение отключено'
      );
      return;
    }

    const ms = hours * 60 * 60 * 1000;
    this.logger.log(`Планировщик синхронизации долей (regshare): каждые ${hours} ч`);

    const runTick = async (): Promise<void> => {
      try {
        await this.programShareRegistrationService.syncProgramSharesForCoop(config.coopname);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        const trace = error instanceof Error ? error.stack : undefined;
        this.logger.error(`Ошибка в задаче синхронизации regshare: ${message}`, trace);
      }
    };

    this.intervalId = setInterval(() => {
      void runTick();
    }, ms);

    try {
      await runTick();
    } catch (error: unknown) {
      this.logger.warn(
        'Первичный запуск синхронизации regshare не удался, будет повторен по расписанию',
        error instanceof Error ? error.stack : String(error)
      );
    }

    this.logger.log('Планировщик синхронизации regshare инициализирован');
  }

  async stop(): Promise<void> {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.logger.log('Планировщик синхронизации regshare остановлен');
    }
  }

  onModuleDestroy(): void {
    void this.stop();
  }
}
