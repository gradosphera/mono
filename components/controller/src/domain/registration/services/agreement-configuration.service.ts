import { Injectable } from '@nestjs/common';
import { REGISTRATION_AGREEMENTS_CONFIG } from '../config/registration-agreements.config';
import { REGISTRATION_PROGRAMS_CONFIG } from '../config/registration-programs.config';
import type {
  IAgreementConfigItem,
  ICooperativeRegistrationPrograms,
  IRegistrationProgram,
} from '../config/agreement-config.interface';
import { AccountType } from '~/application/account/enum/account-type.enum';
import { AgreementId, ProgramKey } from '../enum';
import { CooperativeConfigService } from './cooperative-config.service';

export const AGREEMENT_CONFIGURATION_SERVICE = Symbol('AgreementConfigurationService');

/**
 * Сервис для работы с конфигурацией соглашений при регистрации
 */
@Injectable()
export class AgreementConfigurationService {
  constructor(private readonly cooperativeConfigService: CooperativeConfigService) {}
  /**
   * Получить все соглашения для указанного типа аккаунта
   * @param accountType - тип аккаунта (individual, organization, entrepreneur)
   * @param coopname - название кооператива (для временного исключения blagorost_offer)
   * @param programKey - ключ выбранной программы регистрации (опционально)
   * @returns отсортированный по order массив конфигураций соглашений
   */
  /**
   * Получить соглашения по умолчанию для кооператива (без учета программ)
   */
  private getDefaultAgreementsForCooperative(
    accountType: AccountType,
    coopname?: string
  ): IAgreementConfigItem[] {
    const coopnameValue = coopname || '';
    const excludedAgreements = this.cooperativeConfigService.getExcludedFromBaseAgreements(coopnameValue);

    // Получить базовые соглашения, исключая те, которые управляются отдельно
    const baseAgreements = REGISTRATION_AGREEMENTS_CONFIG.agreements
      .filter((a) => a.applicable_account_types.includes(accountType))
      .filter((a) => !excludedAgreements.includes(a.id));

    // Добавить дополнительные соглашения по умолчанию для кооператива
    const additionalAgreements = this.cooperativeConfigService
      .getDefaultAdditionalAgreements(coopnameValue, accountType)
      .map(id => this.getAgreementById(id))
      .filter((a): a is IAgreementConfigItem => a !== null);

    return [...baseAgreements, ...additionalAgreements].sort((a, b) => a.order - b.order);
  }

  getAgreementsForAccountType(
    accountType: AccountType,
    coopname?: string,
    programKey?: ProgramKey
  ): IAgreementConfigItem[] {
    // Получить соглашения по умолчанию для кооператива
    const defaultAgreements = this.getDefaultAgreementsForCooperative(accountType, coopname);

    // Если указана программа - добавляем её соглашения
    if (programKey && coopname) {
      const programAgreements = this.getAgreementsForProgram(programKey, coopname);
      return [...defaultAgreements, ...programAgreements].sort((a, b) => a.order - b.order);
    }

    return defaultAgreements;
  }

  /**
   * Получить соглашения, которые нужно отправить в блокчейн через sendAgreement
   * @param accountType - тип аккаунта
   * @param coopname - название кооператива (для временного исключения blagorost_offer)
   * @param programKey - ключ выбранной программы регистрации
   * @returns массив конфигураций blockchain agreements
   */
  getBlockchainAgreements(accountType: AccountType, coopname?: string, programKey?: ProgramKey): IAgreementConfigItem[] {
    return this.getAgreementsForAccountType(accountType, coopname, programKey).filter((agreement) => agreement.is_blockchain_agreement);
  }

  /**
   * Получить соглашения, которые нужно линковать в заявление на вступление
   * @param accountType - тип аккаунта
   * @param coopname - название кооператива (для временного исключения blagorost_offer)
   * @param programKey - ключ выбранной программы регистрации
   * @returns массив конфигураций соглашений для линковки
   */
  getLinkedAgreements(accountType: AccountType, coopname?: string, programKey?: ProgramKey): IAgreementConfigItem[] {
    return this.getAgreementsForAccountType(accountType, coopname, programKey).filter((agreement) => agreement.link_to_statement);
  }

  /**
   * Получить конфигурацию соглашения по идентификатору
   * @param id - идентификатор соглашения (wallet_agreement, signature_agreement, etc.)
   * @returns конфигурация соглашения или null
   */
  getAgreementById(id: AgreementId): IAgreementConfigItem | null {
    return REGISTRATION_AGREEMENTS_CONFIG.agreements.find((agreement) => agreement.id === id) || null;
  }

  /**
   * Получить все доступные соглашения (без фильтрации по типу аккаунта)
   * @returns все конфигурации соглашений
   */
  getAllAgreements(): IAgreementConfigItem[] {
    return REGISTRATION_AGREEMENTS_CONFIG.agreements.sort((a, b) => a.order - b.order);
  }

  /**
   * Проверить, требуется ли соглашение для данного типа аккаунта
   * @param agreementId - идентификатор соглашения
   * @param accountType - тип аккаунта
   * @param coopname - название кооператива (для временного исключения blagorost_offer)
   * @returns true если соглашение требуется
   */
  isAgreementRequired(agreementId: AgreementId, accountType: AccountType, coopname?: string, programKey?: ProgramKey): boolean {
    // Проверить, входит ли соглашение в список требуемых для данного кооператива и типа аккаунта
    const requiredAgreements = this.getRequiredAgreementIds(accountType, coopname, programKey);
    return requiredAgreements.includes(agreementId);
  }

  /**
   * Получить список идентификаторов всех требуемых соглашений для типа аккаунта
   * @param accountType - тип аккаунта
   * @param coopname - название кооператива (для временного исключения blagorost_offer)
   * @param programKey - ключ выбранной программы регистрации
   * @returns массив идентификаторов
   */
  getRequiredAgreementIds(accountType: AccountType, coopname?: string, programKey?: ProgramKey): string[] {
    return this.getAgreementsForAccountType(accountType, coopname, programKey).map((a) => a.id);
  }

  /**
   * Получить доступные программы регистрации для кооператива и типа аккаунта
   * @param coopname - название кооператива
   * @param accountType - тип аккаунта
   * @returns массив доступных программ
   */
  getAvailablePrograms(coopname: string, accountType: AccountType): IRegistrationProgram[] {
    const config = REGISTRATION_PROGRAMS_CONFIG.find((c) => c.coopname === coopname);
    if (!config) return [];

    return config.programs
      .filter((p) => p.applicable_account_types.includes(accountType))
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Получить конфигурацию программ для кооператива
   * @param coopname - название кооператива
   * @returns конфигурация программ или null
   */
  getCooperativeProgramsConfig(coopname: string): ICooperativeRegistrationPrograms | null {
    return REGISTRATION_PROGRAMS_CONFIG.find((c) => c.coopname === coopname) || null;
  }

  /**
   * Получить соглашения для программы
   * @param programKey - ключ программы
   * @param coopname - название кооператива
   * @returns массив соглашений для программы
   */
  getAgreementsForProgram(programKey: ProgramKey, coopname: string): IAgreementConfigItem[] {
    const config = REGISTRATION_PROGRAMS_CONFIG.find((c) => c.coopname === coopname);
    if (!config) return [];

    const program = config.programs.find((p) => p.key === programKey);
    if (!program) return [];

    return program.agreement_ids
      .map((id) => this.getAgreementById(id))
      .filter((a): a is IAgreementConfigItem => a !== null);
  }
}
