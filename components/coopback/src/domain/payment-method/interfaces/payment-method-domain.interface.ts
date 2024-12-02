// domain/payments/interfaces/payment-method-domain.interface.ts
import type { BankTransferDataDomainInterface, SBPDataDomainInterface } from './payment-methods-domain.interface';

export interface PaymentMethodDomainInterface<TData = SBPDataDomainInterface | BankTransferDataDomainInterface> {
  username: string;
  method_id: string;
  method_type: 'sbp' | 'bank_transfer';
  data: TData;
  is_default: boolean;
  created_at: Date;
  updated_at: Date;
}
