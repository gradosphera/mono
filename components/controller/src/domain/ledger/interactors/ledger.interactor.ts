import { Injectable, Inject } from '@nestjs/common';
import type { GetLedgerInputDomainInterface, LedgerStateDomainInterface } from '../interfaces';
import { LEDGER_BLOCKCHAIN_PORT, type LedgerPort } from '../ports/ledger.port';
import { ChartOfAccountsEntity } from '../entities/chart-of-accounts.entity';
import { config } from '~/config';

/**
 * Интерактор домена для работы с ledger
 * Реализует бизнес-логику получения состояния счетов кооператива
 */
@Injectable()
export class LedgerDomainInteractor {
  constructor(@Inject(LEDGER_BLOCKCHAIN_PORT) private readonly ledgerPort: LedgerPort) {}

  /**
   * Получить полное состояние ledger кооператива
   * Возвращает план счетов с актуальными данными из блокчейна
   * Если счет не активен в блокчейне, возвращает нулевые значения
   */
  async getLedger(data: GetLedgerInputDomainInterface): Promise<LedgerStateDomainInterface> {
    // Получаем символ валюты кооператива
    const symbol = await config.blockchain.root_govern_symbol;

    // Получаем базовый план счетов с нулевыми значениями
    const baseChartOfAccounts = ChartOfAccountsEntity.getFullChartOfAccounts(symbol);

    // Получаем активные счета из блокчейна
    const activeLedgerAccounts = await this.ledgerPort.getActiveLedgerAccounts(data.coopname);

    // Обновляем план счетов данными из блокчейна
    const chartOfAccounts = ChartOfAccountsEntity.updateWithLedgerAccountsData(baseChartOfAccounts, activeLedgerAccounts);

    return {
      coopname: data.coopname,
      chartOfAccounts,
    };
  }
}
