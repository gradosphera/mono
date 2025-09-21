/**
 * Доменный интерфейс для действия создания коммита CAPITAL контракта
 * Время рассчитывается автоматически через TimeTrackingService
 */
export interface CreateCommitDomainInput {
  /** Имя аккаунта кооператива */
  coopname: string;

  /** Имя пользователя */
  username: string;

  /** Хэш проекта */
  project_hash: string;

  /** Хэш коммита */
  commit_hash: string;

  // creator_hours удалено - время рассчитывается автоматически
}
