import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DecisionTrackedEvent } from '~/domain/decision-tracking/events/decision-tracked.event';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import {
  EXTENSION_REPOSITORY,
  ExtensionDomainRepository,
} from '~/domain/extension/repositories/extension-domain.repository';
import type { IConfig } from '../../capital-extension.module';

@Injectable()
export class CapitalOnboardingEventsService {
  constructor(
    @Inject(EXTENSION_REPOSITORY) private readonly extensionRepository: ExtensionDomainRepository<IConfig>,
    private readonly logger: WinstonLoggerService
  ) {
    this.logger.setContext(CapitalOnboardingEventsService.name);
  }

  @OnEvent(DecisionTrackedEvent.eventName)
  async handleDecisionTracked(event: DecisionTrackedEvent): Promise<void> {
    const { result } = event;
    console.dir(result, { depth: null });
    // Проверяем, относится ли событие к онбордингу capital
    if (!result.metadata?.onboarding_step) return;

    const step = result.metadata.onboarding_step as string;

    // Проверяем, является ли шаг частью онбординга capital
    if (!step.startsWith('blagorost_')) return;

    this.logger.info(`Получено событие завершения онбординга capital для шага: ${step}`);

    try {
      const plugin = await this.extensionRepository.findByName('capital');
      if (!plugin) {
        this.logger.error('Конфигурация расширения capital не найдена');
        return;
      }

      // Обновляем флаг завершения шага
      const flagKey = `onboarding_${step}_done`;
      const updatedConfig = {
        ...plugin.config,
        [flagKey]: true,
      } as any;

      await this.extensionRepository.update({ ...plugin, config: updatedConfig });

      this.logger.info(`Флаг ${flagKey} установлен в true`);
    } catch (error) {
      const errorObj = error as Error;
      this.logger.error(`Ошибка при обработке события завершения онбординга capital: ${errorObj.message}`, errorObj.stack);
    }
  }
}
