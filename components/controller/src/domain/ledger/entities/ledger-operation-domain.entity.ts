/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { LedgerOperationDomainInterface } from '../interfaces/ledger-operation-domain.interface';

/**
 * Доменная сущность для операции ledger
 * Представляет единичную операцию в истории проводок
 */
export class LedgerOperationDomainEntity {
  public readonly global_sequence!: number;
  public readonly coopname!: string;
  public readonly action!: string;
  public readonly created_at!: Date;

  // Поля для операций add, sub, block, unblock
  public readonly account_id?: number;
  public readonly quantity?: string;
  public readonly comment?: string;

  // Поля для операции transfer
  public readonly from_account_id?: number;
  public readonly to_account_id?: number;

  constructor(data: LedgerOperationDomainInterface) {
    this.global_sequence = data.global_sequence;
    this.coopname = data.coopname;
    this.action = data.action;
    this.created_at = data.created_at;

    // Проверяем тип операции и присваиваем соответствующие поля
    if (data.action === 'transfer') {
      this.from_account_id = data.from_account_id;
      this.to_account_id = data.to_account_id;
      this.quantity = data.quantity;
      this.comment = data.comment;
    } else if (['add', 'sub', 'block', 'unblock'].includes(data.action)) {
      this.account_id = (data as any).account_id;
      this.quantity = (data as any).quantity;
      this.comment = (data as any).comment;
    }
  }

  /**
   * Конвертирует доменную сущность в интерфейс
   */
  toInterface(): LedgerOperationDomainInterface {
    const base = {
      global_sequence: this.global_sequence,
      coopname: this.coopname,
      action: this.action as any,
      created_at: this.created_at,
    };

    if (this.action === 'transfer') {
      return {
        ...base,
        action: 'transfer',
        from_account_id: this.from_account_id!,
        to_account_id: this.to_account_id!,
        quantity: this.quantity!,
        comment: this.comment!,
      };
    } else {
      return {
        ...base,
        action: this.action as any,
        account_id: this.account_id!,
        quantity: this.quantity!,
        comment: this.comment!,
      };
    }
  }
}
