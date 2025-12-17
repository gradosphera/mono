import type { AccountType } from '~/application/account/enum/account-type.enum';

/**
 * Конфигурация одного соглашения при регистрации
 */
export interface IAgreementConfigItem {
  /**
   * Уникальный идентификатор типа соглашения (wallet, signature, privacy, user, capitalization)
   */
  id: string;

  /**
   * registry_id для генерации документа на фабрике документов
   */
  registry_id: number;

  /**
   * Тип соглашения для блокчейна (wallet, signature, privacy, user, capitalization)
   */
  agreement_type: string;

  /**
   * Человекочитаемое название документа
   */
  title: string;

  /**
   * Текст для галочки на фронтенде
   */
  checkbox_text: string;

  /**
   * Текст ссылки для открытия диалога чтения соглашения
   */
  link_text: string;

  /**
   * Нужно ли отправлять в блокчейн как agreement через sendAgreement action
   */
  is_blockchain_agreement: boolean;

  /**
   * Нужно ли линковать хеш документа в заявление на вступление
   */
  link_to_statement: boolean;

  /**
   * Условия применения - для каких типов аккаунтов требуется это соглашение
   */
  applicable_account_types: AccountType[];

  /**
   * Порядок отображения на фронтенде (сортировка)
   */
  order: number;
}

/**
 * Конфигурация всех соглашений при регистрации
 */
export interface IRegistrationAgreementsConfig {
  /**
   * Массив конфигураций соглашений
   */
  agreements: IAgreementConfigItem[];
}
