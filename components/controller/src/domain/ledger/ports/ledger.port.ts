import type { LedgerAccountDomainInterface } from '../interfaces/ledger-account-domain.interface';

/**
 * Порт для взаимодействия с ledger-сервисами инфраструктуры
 * Определяет контракт взаимодействия домена с внешними системами
 */
export interface LedgerPort {
  /**
   * Получить активные счета кооператива из блокчейна
   * @param coopname - имя кооператива
   * @returns массив активных счетов или пустой массив, если нет данных
   */
  getActiveLedgerAccounts(coopname: string): Promise<LedgerAccountDomainInterface[]>;
}

export const LEDGER_BLOCKCHAIN_PORT = Symbol('LEDGER_BLOCKCHAIN_PORT');
