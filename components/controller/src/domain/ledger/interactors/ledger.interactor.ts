import { Injectable, Inject } from '@nestjs/common';
import type {
  GetLedgerInputDomainInterface,
  LedgerStateDomainInterface,
  GetLedgerHistoryInputDomainInterface,
  LedgerHistoryResponseDomainInterface,
  LedgerOperationDomainInterface,
} from '../interfaces';
import { LEDGER_BLOCKCHAIN_PORT, type LedgerPort } from '../ports/ledger.port';
import { LEDGER_OPERATION_REPOSITORY, type LedgerOperationRepository } from '../repositories/ledger-operation.repository';
import { ChartOfAccountsEntity } from '../entities/chart-of-accounts.entity';
import { LedgerOperationDomainEntity } from '../entities/ledger-operation-domain.entity';
import { config } from '~/config';

/**
 * Интерактор домена для работы с ledger
 * Реализует бизнес-логику получения состояния счетов кооператива
 */
@Injectable()
export class LedgerDomainInteractor {
  constructor(
    @Inject(LEDGER_BLOCKCHAIN_PORT) private readonly ledgerPort: LedgerPort,
    @Inject(LEDGER_OPERATION_REPOSITORY) private readonly ledgerOperationRepository: LedgerOperationRepository
  ) {}

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

  /**
   * Получить историю операций ledger
   * Возвращает список операций по указанному кооперативу с возможностью фильтрации по account_id
   */
  async getLedgerHistory(data: GetLedgerHistoryInputDomainInterface): Promise<LedgerHistoryResponseDomainInterface> {
    // Устанавливаем значения по умолчанию
    const params = {
      ...data,
      page: data.page || 1,
      limit: data.limit || 10,
      sortBy: data.sortBy || 'created_at',
      sortOrder: data.sortOrder || 'DESC',
    };

    return await this.ledgerOperationRepository.getHistory(params);
  }

  /**
   * Сохранить операцию ledger в историю
   * Используется для записи операций, полученных из блокчейна через websocket
   */
  async saveLedgerOperation(operationData: LedgerOperationDomainInterface): Promise<void> {
    const operation = new LedgerOperationDomainEntity(operationData);
    await this.ledgerOperationRepository.save(operation);
  }

  /**
   * Обработать событие операции ledger из блокчейна
   * Парсит данные события и сохраняет их в историю
   */
  async processLedgerEvent(eventData: any): Promise<void> {
    // Проверяем, что событие относится к операциям ledger
    const allowedActions = ['debet', 'credit', 'block', 'unblock'];
    if (!allowedActions.includes(eventData.name)) {
      return;
    }

    // Формируем операцию для сохранения
    const operationData: LedgerOperationDomainInterface = {
      global_sequence: parseInt(eventData.global_sequence),
      coopname: eventData.data.coopname,
      action: eventData.name,
      created_at: new Date(eventData.block_time || new Date()),
      account_id: eventData.data.account_id,
      quantity: eventData.data.quantity,
      comment: eventData.data.comment,
    } as LedgerOperationDomainInterface;

    await this.saveLedgerOperation(operationData);
  }
}
