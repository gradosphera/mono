import type { AccountType } from '~/application/account/enum/account-type.enum';
import { AgreementType, AgreementId, ProgramKey } from '../enum';

/**
 * Конфигурация одного соглашения при регистрации
 */
export interface IAgreementConfigItem {
  /**
   * Уникальный идентификатор типа соглашения
   */
  id: AgreementId;

  /**
   * registry_id для генерации документа на фабрике документов
   */
  registry_id: number;

  /**
   * Тип соглашения для блокчейна
   */
  agreement_type: AgreementType;

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

/**
 * Описание программы регистрации с её соглашениями
 */
export interface IRegistrationProgram {
  /** Уникальный ключ программы */
  key: ProgramKey;

  /** Название программы для отображения */
  title: string;

  /** Описание программы */
  description: string;

  /** URL изображения (опционально) */
  image_url?: string;

  /** Минимальные требования для участия */
  requirements?: string;

  /** Для каких типов аккаунтов доступна эта программа */
  applicable_account_types: AccountType[];

  /** Список ID соглашений, которые требуются для этой программы */
  agreement_ids: AgreementId[];

  /** Порядок отображения */
  order: number;
}

/**
 * Конфигурация программ регистрации для кооператива
 */
export interface ICooperativeRegistrationPrograms {
  /** Название кооператива */
  coopname: string;

  /** Доступные программы */
  programs: IRegistrationProgram[];

  /** Нужен ли выбор программы (если false - используется первая подходящая) */
  requires_selection: boolean;
}
