/**
 * Доменный интерфейс для действия возврата неиспользованных инвестиций CAPITAL контракта
 */
export interface ReturnUnusedDomainInput {
  /** Имя аккаунта кооператива */
  coopname: string;

  /** Хэш проекта */
  project_hash: string;

  /** Имя инвестора */
  username: string;
}
