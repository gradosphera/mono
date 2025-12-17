import { Injectable } from '@nestjs/common';
import { REGISTRATION_AGREEMENTS_CONFIG } from '../config/registration-agreements.config';
import type { IAgreementConfigItem } from '../config/agreement-config.interface';
import type { AccountType } from '~/application/account/enum/account-type.enum';

export const AGREEMENT_CONFIGURATION_SERVICE = Symbol('AgreementConfigurationService');

/**
 * Сервис для работы с конфигурацией соглашений при регистрации
 */
@Injectable()
export class AgreementConfigurationService {
  /**
   * Получить все соглашения для указанного типа аккаунта
   * @param accountType - тип аккаунта (individual, organization, entrepreneur)
   * @param coopname - название кооператива (для временного исключения capitalization_agreement)
   * @returns отсортированный по order массив конфигураций соглашений
   */
  getAgreementsForAccountType(accountType: AccountType, coopname?: string): IAgreementConfigItem[] {
    return REGISTRATION_AGREEMENTS_CONFIG.agreements
      .filter((agreement) => agreement.applicable_account_types.includes(accountType))
      .filter((agreement) => {
        // ВРЕМЕННО: исключаем capitalization_agreement для всех кооперативов кроме voskhod
        if (agreement.id === 'capitalization_agreement' && coopname && coopname !== 'voskhod') {
          return false;
        }
        return true;
      })
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Получить соглашения, которые нужно отправить в блокчейн через sendAgreement
   * @param accountType - тип аккаунта
   * @param coopname - название кооператива (для временного исключения capitalization_agreement)
   * @returns массив конфигураций blockchain agreements
   */
  getBlockchainAgreements(accountType: AccountType, coopname?: string): IAgreementConfigItem[] {
    return this.getAgreementsForAccountType(accountType, coopname).filter((agreement) => agreement.is_blockchain_agreement);
  }

  /**
   * Получить соглашения, которые нужно линковать в заявление на вступление
   * @param accountType - тип аккаунта
   * @param coopname - название кооператива (для временного исключения capitalization_agreement)
   * @returns массив конфигураций соглашений для линковки
   */
  getLinkedAgreements(accountType: AccountType, coopname?: string): IAgreementConfigItem[] {
    return this.getAgreementsForAccountType(accountType, coopname).filter((agreement) => agreement.link_to_statement);
  }

  /**
   * Получить конфигурацию соглашения по идентификатору
   * @param id - идентификатор соглашения (wallet_agreement, signature_agreement, etc.)
   * @returns конфигурация соглашения или null
   */
  getAgreementById(id: string): IAgreementConfigItem | null {
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
   * @param coopname - название кооператива (для временного исключения capitalization_agreement)
   * @returns true если соглашение требуется
   */
  isAgreementRequired(agreementId: string, accountType: AccountType, coopname?: string): boolean {
    const agreement = this.getAgreementById(agreementId);
    if (!agreement) return false;

    // ВРЕМЕННО: исключаем capitalization_agreement для всех кооперативов кроме voskhod
    if (agreementId === 'capitalization_agreement' && coopname && coopname !== 'voskhod') {
      return false;
    }

    return agreement.applicable_account_types.includes(accountType);
  }

  /**
   * Получить список идентификаторов всех требуемых соглашений для типа аккаунта
   * @param accountType - тип аккаунта
   * @param coopname - название кооператива (для временного исключения capitalization_agreement)
   * @returns массив идентификаторов
   */
  getRequiredAgreementIds(accountType: AccountType, coopname?: string): string[] {
    return this.getAgreementsForAccountType(accountType, coopname).map((a) => a.id);
  }
}
