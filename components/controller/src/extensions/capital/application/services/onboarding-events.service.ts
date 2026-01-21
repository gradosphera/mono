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

    // Проверяем, относится ли событие к онбордингу capital
    if (!result.metadata?.onboarding_step || result.metadata.extension !== 'capital') return;

    const step = result.metadata.onboarding_step as string;

    this.logger.info(`Получено событие завершения онбординга capital для шага: ${step}`);

    try {
      const plugin = await this.extensionRepository.findByName('capital');
      if (!plugin) {
        this.logger.error('Конфигурация расширения capital не найдена');
        return;
      }

      // Определяем ключ флага для обновления
      const flagKey = this.mapStepToFlag(step);

      if (!flagKey) {
        this.logger.warn(`Неизвестный шаг онбординга capital: ${step}`);
        return;
      }

      // Обновляем флаг завершения шага
      const updatedConfig = {
        ...plugin.config,
        [flagKey]: true,
      };

      await this.extensionRepository.update({ ...plugin, config: updatedConfig });

      this.logger.info(`Флаг ${flagKey} установлен в true`);
    } catch (error) {
      const errorObj = error as Error;
      this.logger.error(`Ошибка при обработке события завершения онбординга capital: ${errorObj.message}`, errorObj.stack);
    }
  }

  /**
   * Маппинг шага онбординга в ключ флага конфигурации
   */
  private mapStepToFlag(step: string): keyof IConfig | null {
    const mapping: Record<string, keyof IConfig> = {
      generator_program_template: 'onboarding_generator_program_template_done',
      generation_agreement_template: 'onboarding_generation_agreement_template_done',
      blagorost_provision: 'onboarding_blagorost_provision_done',
      blagorost_offer_template: 'onboarding_blagorost_offer_template_done',
    };

    return mapping[step] || null;
  }
}
