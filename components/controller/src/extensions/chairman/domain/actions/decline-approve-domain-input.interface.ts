/**
 * Доменный интерфейс для действия отклонения одобрения документа CHAIRMAN контракта
 */
export interface DeclineApproveDomainInput {
  /** Имя аккаунта кооператива */
  coopname: string;

  /** Имя пользователя */
  username: string;

  /** Хеш одобрения для идентификации */
  approval_hash: string;

  /** Причина отклонения */
  reason: string;
}
