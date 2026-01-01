import { Injectable } from '@nestjs/common';
import { LedgerInteractor } from '../interactors/ledger.interactor';
import { GetLedgerInputDTO } from '../dto/get-ledger-input.dto';
import { GetLedgerHistoryInputDTO } from '../dto/get-ledger-history-input.dto';
import { LedgerStateDTO } from '../dto/ledger-state.dto';
import { LedgerHistoryResponseDTO } from '../dto/ledger-operation.dto';

/**
 * Сервис для работы с ledger
 * Связывает GraphQL резолверы с интеракторами приложения
 */
@Injectable()
export class LedgerService {
  constructor(private readonly ledgerInteractor: LedgerInteractor) {}

  /**
   * Получить состояние ledger кооператива
   */
  async getLedger(data: GetLedgerInputDTO): Promise<LedgerStateDTO> {
    const result = await this.ledgerInteractor.getLedger(data);

    return {
      coopname: result.coopname,
      chartOfAccounts: result.chartOfAccounts,
    };
  }

  /**
   * Получить историю операций ledger
   */
  async getLedgerHistory(data: GetLedgerHistoryInputDTO): Promise<LedgerHistoryResponseDTO> {
    const result = await this.ledgerInteractor.getLedgerHistory(data);

    // Преобразуем доменные операции в DTO
    const items = result.items.map((operation) => {
      // operation уже является интерфейсом, не entity
      // Создаем DTO в зависимости от типа операции
      const baseDto = {
        global_sequence: operation.global_sequence,
        coopname: operation.coopname,
        action: operation.action,
        created_at: operation.created_at,
      };

      if (operation.action === 'transfer') {
        return {
          ...baseDto,
          from_account_id: (operation as any).from_account_id,
          to_account_id: (operation as any).to_account_id,
          quantity: (operation as any).quantity,
          comment: (operation as any).comment,
        };
      } else {
        return {
          ...baseDto,
          account_id: (operation as any).account_id,
          quantity: (operation as any).quantity,
          comment: (operation as any).comment,
        };
      }
    });

    return {
      items: items as any,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
    };
  }
}
