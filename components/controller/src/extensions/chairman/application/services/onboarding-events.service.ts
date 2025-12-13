import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SovietContract, MeetContract } from 'cooptypes';
import {
  EXTENSION_REPOSITORY,
  ExtensionDomainRepository,
} from '~/domain/extension/repositories/extension-domain.repository';
import type { IConfig } from '../../chairman-extension.module';
import type { ExtensionDomainEntity } from '~/domain/extension/entities/extension-domain.entity';
import type { ActionDomainInterface } from '~/domain/parser/interfaces/action-domain.interface';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { VarsExtensionPort, VARS_EXTENSION_PORT } from '~/domain/extension/ports/vars-extension-port';
import type { VarsDomainInterface } from '~/domain/system/interfaces/vars-domain.interface';
import type { AgreementNumberDomainInterface } from '~/domain/agreement/interfaces/agreement-number.interface';

@Injectable()
export class ChairmanOnboardingEventsService {
  constructor(
    @Inject(EXTENSION_REPOSITORY) private readonly extensionRepository: ExtensionDomainRepository<IConfig>,
    @Inject(VARS_EXTENSION_PORT) private readonly varsPort: VarsExtensionPort,
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

  // Сравниваем пришедший hash с ожидаемыми и отмечаем шаги выполненными (hash не очищаем, чтобы видеть источник)
  private async tryMatchHash(hash: string): Promise<void> {
    const plugin = await this.load();
    if (!plugin) return;
    const cfg = { ...plugin.config };
    if (this.isExpired(cfg)) return;

    const patch: Partial<IConfig> = {};
    const matches: Array<keyof IConfig> = [];

    const check = (hashKey: keyof IConfig, doneKey: keyof IConfig) => {
      const storedHash = (cfg as any)[hashKey] as string | undefined;
      if (storedHash && storedHash === hash) {
        (patch as any)[doneKey] = true;
        // сохраняем хэш явно, чтобы не потерять его при обновлении
        (patch as any)[hashKey] = storedHash;
        matches.push(doneKey);
      }
    };

    check('onboarding_wallet_agreement_hash', 'onboarding_wallet_agreement_done');
    check('onboarding_signature_agreement_hash', 'onboarding_signature_agreement_done');
    check('onboarding_privacy_agreement_hash', 'onboarding_privacy_agreement_done');
    check('onboarding_user_agreement_hash', 'onboarding_user_agreement_done');
    check('onboarding_participant_application_hash', 'onboarding_participant_application_done');
    check('onboarding_voskhod_membership_hash', 'onboarding_voskhod_membership_done');
    check('onboarding_general_meet_hash', 'onboarding_general_meet_done');

    if (matches.length === 0) return;

    const updated: ExtensionDomainEntity<IConfig> = { ...plugin, config: { ...cfg, ...patch } };
    await this.extensionRepository.update(updated);
    this.logger.log(`Онбординг обновлён по hash ${hash}, отмечены: ${matches.join(', ')}`);
  }

  // Сравниваем пришедший hash собрания с ожидаемым для общего собрания и отмечаем шаг выполненным
  private async tryMatchMeetHash(hash: string): Promise<void> {
    const plugin = await this.load();
    if (!plugin) return;
    const cfg = { ...plugin.config };
    if (this.isExpired(cfg)) return;

    const patch: Partial<IConfig> = {};

    // Проверяем совпадение хэша собрания
    const storedMeetHash = cfg.onboarding_general_meet_hash;

    if (storedMeetHash && storedMeetHash === hash) {
      patch.onboarding_general_meet_done = true;
      // сохраняем хэш явно, чтобы не потерять его при обновлении
      patch.onboarding_general_meet_hash = storedMeetHash;

      const updated: ExtensionDomainEntity<IConfig> = { ...plugin, config: { ...cfg, ...patch } };
      await this.extensionRepository.update(updated);
      this.logger.log(`Онбординг обновлён по hash собрания ${hash}, отмечено: onboarding_general_meet_done`);
    } else {
      this.logger.debug(`Хэш собрания ${hash} не соответствует ожидаемому для онбординга`);
    }
  }

  @OnEvent(`action::${SovietContract.contractName.production}::${SovietContract.Actions.Registry.NewDecision.actionName}`)
  async handleNewDecision(actionData: ActionDomainInterface): Promise<void> {
    try {
      const data: any = actionData.data;
      const docHash = data.package;

      if (!docHash) {
        throw new Error('Хэш документа не найден в данных действия');
      }

      // Извлекаем decision_id из document.meta
      const decisionId = this.extractDecisionId(data);
      if (!decisionId) {
        throw new Error('Decision ID не найден в document.meta');
      }

      // Извлекаем дату из created_at в meta
      const decisionDate = this.extractDecisionDate(data);
      if (!decisionDate) {
        throw new Error('Дата решения (created_at) не найдена в document.meta');
      }

      this.logger.log(`Обработка решения совета ID: ${decisionId}, дата: ${decisionDate}`);

      // Сохраняем информацию о решении в vars
      await this.saveDecisionToVars(decisionId, decisionDate, String(docHash));

      // Продолжаем с обычной логикой сопоставления хэшей
      await this.tryMatchHash(String(docHash));
    } catch (error: any) {
      this.logger.error(`Ошибка при обработке нового решения совета: ${error.message}`, error.stack);
      throw error; // Пробрасываем ошибку выше
    }
  }

  @OnEvent(`action::${MeetContract.contractName.production}::${MeetContract.Actions.NewDecision.actionName}`)
  async handleMeetDecision(actionData: ActionDomainInterface): Promise<void> {
    try {
      const data: any = actionData.data;

      const meetHash = data.hash;

      if (!meetHash) {
        throw new Error('Хэш собрания не найден в данных действия');
      }

      this.logger.log(`Обработка решения общего собрания с хэшем: ${meetHash}`);

      // Проверяем совпадение хэша собрания с ожидаемым для онбординга
      await this.tryMatchMeetHash(String(meetHash));
    } catch (error: any) {
      this.logger.error(`Ошибка при обработке решения общего собрания: ${error.message}`, error.stack);
      throw error; // Пробрасываем ошибку выше
    }
  }

  /**
   * Извлекает decision_id из document.meta
   */
  private extractDecisionId(data: any): string | null {
    try {
      const meta = data?.document?.meta;
      if (!meta) {
        return null;
      }

      let metaObj: any;
      if (typeof meta === 'string') {
        try {
          metaObj = JSON.parse(meta);
        } catch {
          return null;
        }
      } else {
        metaObj = meta;
      }

      const decisionId = metaObj?.decision_id;
      return decisionId;
    } catch (error) {
      this.logger.error('Ошибка при извлечении decision_id:', error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  /**
   * Извлекает дату решения из created_at в document.meta
   */
  private extractDecisionDate(data: any): string | null {
    try {
      const meta = data?.document?.meta;
      if (!meta) {
        return null;
      }

      let metaObj: any;
      if (typeof meta === 'string') {
        try {
          metaObj = JSON.parse(meta);
        } catch {
          return null;
        }
      } else {
        metaObj = meta;
      }

      const createdAt = metaObj?.created_at;
      if (!createdAt) {
        return null;
      }

      const date = new Date(createdAt);
      if (isNaN(date.getTime())) {
        return null;
      }

      // Форматируем дату в формате "день.месяц.год"
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    } catch (error) {
      this.logger.error('Ошибка при извлечении даты решения:', error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  /**
   * Сохраняет информацию о решении в vars репозиторий
   */
  private async saveDecisionToVars(decisionId: string, decisionDate: string, docHash: string): Promise<void> {
    try {
      // Получаем текущие vars
      const currentVars = await this.varsPort.get();
      if (!currentVars) {
        this.logger.warn('Vars не найдены, пропускаем сохранение решения');
        return;
      }

      const agreementNumber: AgreementNumberDomainInterface = {
        protocol_number: String(decisionId),
        protocol_day_month_year: String(decisionDate),
      };

      // Проверяем конфигурацию расширения, чтобы понять какие хэши соответствуют каким шагам
      const plugin = await this.load();
      if (!plugin) return;

      const cfg = plugin.config;
      let fieldToUpdate: keyof VarsDomainInterface | null = null;

      // Сопоставляем хэш документа с соответствующим полем vars
      if (cfg.onboarding_wallet_agreement_hash === docHash) {
        fieldToUpdate = 'wallet_agreement';
      } else if (cfg.onboarding_signature_agreement_hash === docHash) {
        fieldToUpdate = 'signature_agreement';
      } else if (cfg.onboarding_privacy_agreement_hash === docHash) {
        fieldToUpdate = 'privacy_agreement';
      } else if (cfg.onboarding_user_agreement_hash === docHash) {
        fieldToUpdate = 'user_agreement';
      } else if (cfg.onboarding_participant_application_hash === docHash) {
        fieldToUpdate = 'participant_application';
      }

      if (fieldToUpdate) {
        // Обновляем соответствующее поле в vars
        const updatedVars: VarsDomainInterface = {
          ...currentVars,
          [fieldToUpdate]: agreementNumber,
        };

        await this.varsPort.create(updatedVars);
        this.logger.log(`Сохранено решение в vars: ${fieldToUpdate} = ${decisionId} от ${decisionDate}`);
      } else {
        this.logger.debug(`Хэш документа ${docHash} не соответствует шагам онбординга`);
      }
    } catch (error: any) {
      this.logger.error(`Ошибка при сохранении решения в vars: ${error.message}`, error.stack);
    }
  }
}
