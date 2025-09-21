/**
 * Доменный интерфейс для действия создания коммита CAPITAL контракта
 * Пользователь указывает количество часов для коммита
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

  /** Количество часов для коммита */
  commit_hours: number;
}
