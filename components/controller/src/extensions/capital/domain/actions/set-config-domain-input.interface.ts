/**
 * Доменный интерфейс для действия установки конфигурации CAPITAL контракта
 */
export interface SetConfigDomainInput {
  /** Имя аккаунта кооператива */
  coopname: string;

  /** Конфигурация контракта */
  config: {
    /** Процент бонуса координатора */
    coordinator_bonus_percent: number;

    /** Процент расходов */
    expense_pool_percent: number;

    /** Срок действия приглашения координатора в днях */
    coordinator_invite_validity_days: number;

    /** Период голосования в днях */
    voting_period_in_days: number;

    /** Процент голосования авторов */
    authors_voting_percent: number;

    /** Процент голосования создателей */
    creators_voting_percent: number;
  };
}
