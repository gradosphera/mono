import type { BankAccountDomainInterface } from '~/domain/common/interfaces/bank-account-domain.interface';
import type { SBPDataDomainInterface } from '../interfaces/payment-methods-domain.interface';

export interface AddPaymentMethodDomainInterface {
  username: string;
  is_default: boolean;
  method_type: 'bank_transfer' | 'sbp';
  data: BankAccountDomainInterface | SBPDataDomainInterface;
}
