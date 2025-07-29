import type { LedgerOperationDomainEntity } from '../entities/ledger-operation-domain.entity';
import type {
  GetLedgerHistoryInputDomainInterface,
  LedgerHistoryResponseDomainInterface,
} from '../interfaces/ledger-operation-domain.interface';

/**
 * Доменный репозиторий для операций ledger
 */
export interface LedgerOperationRepository {
  /**
   * Сохранить операцию ledger (upsert по global_sequence)
   * @param operation Операция для сохранения
   */
  save(operation: LedgerOperationDomainEntity): Promise<void>;

  /**
   * Получить историю операций ledger
   * @param params Параметры запроса истории
   */
  getHistory(params: GetLedgerHistoryInputDomainInterface): Promise<LedgerHistoryResponseDomainInterface>;

  /**
   * Найти операцию по global_sequence
   * @param global_sequence Номер глобальной последовательности
   */
  findByGlobalSequence(global_sequence: number): Promise<LedgerOperationDomainEntity | null>;
}

export const LEDGER_OPERATION_REPOSITORY = Symbol('LedgerOperationRepository');
