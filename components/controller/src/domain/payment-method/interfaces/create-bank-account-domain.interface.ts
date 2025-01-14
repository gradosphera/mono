import type { BankAccountDomainInterface } from '~/domain/common/interfaces/bank-account-domain.interface';

export interface CreateBankAccountDomainInterface {
  username: string;
  is_default: boolean;
  data: BankAccountDomainInterface;
}
