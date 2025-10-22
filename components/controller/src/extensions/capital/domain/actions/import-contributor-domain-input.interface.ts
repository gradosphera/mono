/**
 * Доменный интерфейс для действия импорта участника в CAPITAL контракт
 */
export interface ImportContributorDomainInput {
  /** Имя аккаунта кооператива */
  coopname: string;

  /** Имя аккаунта пользователя */
  username: string;

  /** Хэш участника */
  contributor_hash: string;

  /** Сумма вклада */
  contribution_amount: string;

  /** Примечание */
  memo: string;
}
