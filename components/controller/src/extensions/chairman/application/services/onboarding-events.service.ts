import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  EXTENSION_REPOSITORY,
  ExtensionDomainRepository,
} from '~/domain/extension/repositories/extension-domain.repository';
import type { IConfig } from '../../chairman-extension.module';
import type { ExtensionDomainEntity } from '~/domain/extension/entities/extension-domain.entity';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { DecisionTrackedEvent } from '~/domain/decision-tracking/events/decision-tracked.event';

/**
 * Сервис обработки событий онбординга председателя
 * Подписывается на события отслеживания решений и обновляет состояние онбординга
 */
@Injectable()
export class ChairmanOnboardingEventsService {
  constructor(
    @Inject(EXTENSION_REPOSITORY) private readonly extensionRepository: ExtensionDomainRepository<IConfig>,
    private readonly logger: WinstonLoggerService
  ) {
    this.logger.setContext(ChairmanOnboardingEventsService.name);
  }

  private async load(): Promise<ExtensionDomainEntity<IConfig> | null> {
    return this.extensionRepository.findByName('chairman');
  }

  private isExpired(config: IConfig): boolean {
    if (!config.onboarding_expire_at) return false;
    return new Date(config.onboarding_expire_at).getTime() < Date.now();
  }

  /**
   * Обработчик успешного отслеживания решения
   * Вызывается когда фабрика находит совпадение hash и обновляет vars
   */
  @OnEvent(DecisionTrackedEvent.eventName)
  async handleDecisionTracked(event: DecisionTrackedEvent): Promise<void> {
    try {
      const { result } = event;

      // Проверяем что это событие онбординга chairman
      if (!result.metadata?.onboarding_step || result.metadata.extension !== 'chairman') {
        return;
      }

      const step = result.metadata.onboarding_step as string;

      this.logger.debug(`Получено событие отслеживания решения для онбординга chairman: ${result.vars_field}`);

      const plugin = await this.load();
      if (!plugin) {
        this.logger.warn('Конфигурация расширения chairman не найдена');
        return;
      }

      const cfg = { ...plugin.config };

      // Определяем ключ флага для обновления на основе metadata
      const flagKey = this.mapStepToFlag(step);

      if (!flagKey) {
        this.logger.warn(`Неизвестный шаг онбординга chairman: ${step}`);
        return;
      }

      // Обновляем флаг выполнения шага
      const patch: Partial<IConfig> = {
        [flagKey]: true,
      };

      const updated: ExtensionDomainEntity<IConfig> = { ...plugin, config: { ...cfg, ...patch } };
      await this.extensionRepository.update(updated);

      this.logger.info(`Онбординг обновлён: ${flagKey} = true (решение ${result.decision_id})`);
    } catch (error: any) {
      this.logger.error(`Ошибка при обработке события отслеживания решения: ${error.message}`, error.stack);
    }
  }

  /**
   * Маппинг шага онбординга в ключ флага конфигурации
   */
  private mapStepToFlag(step: string): keyof IConfig | null {
    const mapping: Record<string, keyof IConfig> = {
      wallet_agreement: 'onboarding_wallet_agreement_done',
      signature_agreement: 'onboarding_signature_agreement_done',
      privacy_agreement: 'onboarding_privacy_agreement_done',
      user_agreement: 'onboarding_user_agreement_done',
      participant_application: 'onboarding_participant_application_done',
      voskhod_membership: 'onboarding_voskhod_membership_done',
      general_meet: 'onboarding_general_meet_done',
    };

    return mapping[step] || null;
  }
}
