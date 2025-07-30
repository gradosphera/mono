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
  public readonly account_id?: number;
  public readonly quantity?: string;
  public readonly comment?: string;

  constructor(data: LedgerOperationDomainInterface) {
    this.global_sequence = data.global_sequence;
    this.coopname = data.coopname;
    this.action = data.action;
    this.created_at = data.created_at;
    this.account_id = data.account_id;
    this.quantity = data.quantity;
    this.comment = data.comment;
  }

  /**
   * Конвертирует доменную сущность в интерфейс
   */
  toInterface(): LedgerOperationDomainInterface {
    return {
      global_sequence: this.global_sequence,
      coopname: this.coopname,
      action: this.action,
      created_at: this.created_at,
      account_id: this.account_id,
      quantity: this.quantity,
      comment: this.comment,
    };
  }
}
