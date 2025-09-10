/**
 * Доменный интерфейс для действия обновления CRPS пайщика в проекте CAPITAL контракта
 */

export interface RefreshProjectDomainInput {
  /** Имя аккаунта кооператива */
  coopname: string;

  /** Хэш проекта */
  project_hash: string;

  /** Имя пользователя */
  username: string;
}
