import { Injectable } from '@nestjs/common';
import { AgreementId } from '../enum';
import { AccountType } from '~/application/account/enum/account-type.enum';

/**
 * Сервис для определения конфигурации кооперативов
 */
@Injectable()
export class CooperativeConfigService {
  /**
   * Получить список кооперативов, которые поддерживают программы регистрации
   */
  getCooperativesWithPrograms(): string[] {
    return ['voskhod'];
  }

  /**
   * Проверить, поддерживает ли кооператив программы регистрации
   */
  hasPrograms(coopname: string): boolean {
    return this.getCooperativesWithPrograms().includes(coopname);
  }

  /**
   * Получить дополнительные соглашения по умолчанию для кооператива
   */
  getDefaultAdditionalAgreements(coopname: string, accountType: AccountType): AgreementId[] {
    if (coopname === 'voskhod' && accountType === AccountType.individual) {
      return [AgreementId.BLAGOROST_OFFER];
    }

    return [];
  }

  /**
   * Получить список соглашений, которые нужно исключить из базовых для данного кооператива
   */
  getExcludedFromBaseAgreements(coopname: string): AgreementId[] {
    // Для всех кооперативов исключаем соглашения, которые добавляются через программы или дополнительные
    return [AgreementId.BLAGOROST_OFFER, AgreementId.GENERATOR_OFFER];
  }
}
