/**
 * Доменный интерфейс для действия финансирования проекта CAPITAL контракта
 */
export interface FundProjectDomainInput {
  /** Имя аккаунта кооператива */
  coopname: string;

  /** Хэш проекта */
  project_hash: string;

  /** Сумма финансирования */
  amount: string;

  /** Memo */
  memo: string;
}
