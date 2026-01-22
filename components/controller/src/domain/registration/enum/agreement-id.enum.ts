/**
 * Идентификаторы соглашений для регистрации
 */
export enum AgreementId {
  /** Соглашение о порядке и правилах использования простой электронной подписи */
  SIGNATURE_AGREEMENT = 'signature_agreement',

  /** Соглашение о целевой потребительской программе "Цифровой Кошелёк" */
  WALLET_AGREEMENT = 'wallet_agreement',

  /** Пользовательское соглашение */
  USER_AGREEMENT = 'user_agreement',

  /** Политика конфиденциальности */
  PRIVACY_AGREEMENT = 'privacy_agreement',

  /** Соглашение о капитализации */
  BLAGOROST_OFFER = 'blagorost_offer',

  /** Оферта по целевой потребительской программе "Генератор" */
  GENERATOR_OFFER = 'generator_offer',
}
