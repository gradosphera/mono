/**
 * Интерфейс данных программного кошелька из блокчейна
 * Представляет данные кошелька целевой потребительской программы из Soviet контракта
 */
export interface IProgramWalletBlockchainData {
  /** Уникальный идентификатор кошелька */
  id: string;

  /** Имя кооператива */
  coopname: string;

  /** Идентификатор программы */
  program_id: string;

  /** Идентификатор соглашения */
  agreement_id: string;

  /** Имя пользователя */
  username: string;

  /** Доступный баланс (формат: "100.0000 RUB") */
  available: string;

  /** Заблокированный баланс (формат: "100.0000 RUB") */
  blocked: string;

  /** Членский взнос (формат: "100.0000 RUB") */
  membership_contribution: string;
}
