// domain/payments/interfaces/payment-method-domain.interface.ts
import type { BankTransferDataDomainInterface } from './payment-methods-domain.interface';

export interface BankPaymentMethodDomainInterface {
  username: string;
  method_id: string;
  method_type: 'bank_transfer';
  data: BankTransferDataDomainInterface;
  is_default: boolean;
  created_at: Date;
  updated_at: Date;
}
