import type { Ledger2AccountDomainInterface } from '../interfaces/ledger2-account.interface';
import type { Ledger2WalletDomainInterface } from '../interfaces/ledger2-wallet.interface';
import type {
  Ledger2HistoryFilterDomainInterface,
  Ledger2HistoryResponseDomainInterface,
  Ledger2OperationDomainInterface,
} from '../interfaces/ledger2-history.interface';

export const LEDGER2_STATE_PORT = Symbol('LEDGER2_STATE_PORT');

/**
 * Единая точка чтения состояния ledger2. Источник — `blockchain_deltas`
 * (для счетов/кошельков) и `blockchain_actions` (для истории операций).
 * Deltas уже наполняет `BlockchainConsumerService` при поступлении блоков,
 * поэтому никакой подписки здесь не нужно — читаем текущее состояние.
 */
export interface Ledger2StatePort {
  /** Актуальные балансы по всем счетам кооператива (DISTINCT ON primary_key). */
  getAccounts(coopname: string): Promise<Ledger2AccountDomainInterface[]>;

  /** Актуальные балансы общекооперативных кошельков (1001/2001/3001/...). */
  getWallets(coopname: string): Promise<Ledger2WalletDomainInterface[]>;

  /** История операций ledger2 с фильтрами + пагинацией. */
  getHistory(
    filter: Ledger2HistoryFilterDomainInterface,
  ): Promise<Ledger2HistoryResponseDomainInterface>;

  /**
   * Поднять одну apply-операцию по её `global_sequence`.
   * Нужно сервису revertOperation: по originalGlobalSequence читаем
   * operation_code/username/amount/process_hash оригинала, по нему собираем
   * зеркальные параметры из cooptypes и подписываем revert.
   * Возвращает null, если запись не найдена или не относится к coopname.
   */
  getOperationByGlobalSequence(
    coopname: string,
    globalSequence: string,
  ): Promise<Ledger2OperationDomainInterface | null>;
}
