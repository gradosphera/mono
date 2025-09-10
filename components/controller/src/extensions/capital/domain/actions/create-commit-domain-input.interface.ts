/**
 * Доменный интерфейс для действия создания коммита CAPITAL контракта
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

  /** Количество часов создателя */
  creator_hours: number;
}
