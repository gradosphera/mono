/**
 * Доменный интерфейс для действия импорта вкладчика в CAPITAL контракт
 */
export interface ImportContributorDomainInput {
  /** Имя аккаунта кооператива */
  coopname: string;

  /** Имя аккаунта пользователя */
  username: string;

  /** Хэш вкладчика */
  contributor_hash: string;

  /** Сумма вклада */
  contribution_amount: string;

  /** Примечание */
  memo: string;
}
