import { Injectable } from '@nestjs/common';
import { BlockchainService } from '../blockchain.service';
import type { LedgerPort } from '~/domain/ledger/ports/ledger.port';
import type { LedgerAccountDomainInterface } from '~/domain/ledger/interfaces/ledger-account-domain.interface';
import { LedgerContract } from 'cooptypes';

/**
 * Адаптер инфраструктуры для работы с ledger-контрактом блокчейна
 * Реализует порт LedgerPort и обеспечивает взаимодействие с ledger контрактом
 */
@Injectable()
export class LedgerBlockchainAdapter implements LedgerPort {
  constructor(private readonly blockchainService: BlockchainService) {}

  /**
   * Получить активные счета кооператива из блокчейна
   */
  async getActiveLedgerAccounts(coopname: string): Promise<LedgerAccountDomainInterface[]> {
    // Получаем данные счетов из таблицы laccounts контракта ledger
    const ledgerAccountsFromBlockchain = await this.blockchainService.getAllRows<LedgerContract.Tables.Laccount.ILaccount>(
      LedgerContract.contractName.production, // Имя контракта ledger
      coopname, // Scope - имя кооператива
      LedgerContract.Tables.Laccount.tableName // Имя таблицы
    );

    // Преобразуем данные блокчейна в доменные объекты
    return ledgerAccountsFromBlockchain.map(this.convertBlockchainLedgerAccountToDomain);
  }

  /**
   * Преобразует счет из формата блокчейна в доменный объект
   */
  private convertBlockchainLedgerAccountToDomain(
    blockchainLedgerAccount: LedgerContract.Tables.Laccount.ILaccount
  ): LedgerAccountDomainInterface {
    return {
      id:
        typeof blockchainLedgerAccount.id === 'string'
          ? parseInt(blockchainLedgerAccount.id, 10)
          : blockchainLedgerAccount.id,
      name: blockchainLedgerAccount.name,
      available: blockchainLedgerAccount.available,
      blocked: blockchainLedgerAccount.blocked,
      writeoff: blockchainLedgerAccount.writeoff,
    };
  }
}
