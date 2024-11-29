// domain/payments/entities/payment-method-domain.entity.ts
import type {
  SBPDataDomainInterface,
  BankTransferDataDomainInterface,
} from '../interfaces/payment-methods-domain.interface';

export class PaymentMethodDomainEntity<TData = SBPDataDomainInterface | BankTransferDataDomainInterface> {
  public readonly username: string;
  public readonly method_id: string;
  public readonly method_type: 'sbp' | 'bank_transfer';
  public readonly data: TData;
  public readonly is_default: boolean;
  public readonly created_at: Date;
  public readonly updated_at: Date;

  constructor({
    username,
    method_id,
    method_type,
    data,
    is_default = false,
    created_at = new Date(),
    updated_at = new Date(),
  }: {
    username: string;
    method_id: string;
    method_type: 'sbp' | 'bank_transfer';
    data: TData;
    is_default?: boolean;
    created_at?: Date;
    updated_at?: Date;
  }) {
    this.username = username;
    this.method_id = method_id;
    this.method_type = method_type;
    this.data = data;
    this.is_default = is_default;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
