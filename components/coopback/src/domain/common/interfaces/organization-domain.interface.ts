import type { BankAccountDomainInterface } from './bank-account-domain.interface';

export type OrganizationDomainInterface = {
  username: string;
  type: 'coop' | 'ooo' | 'oao' | 'zao' | 'pao' | 'ao';
  short_name: string;
  full_name: string;
  represented_by: {
    first_name: string;
    last_name: string;
    middle_name: string;
    position: string;
    based_on: string;
  };
  country: string;
  city: string;
  full_address: string;
  fact_address: string;
  phone: string;
  email: string;
  details: {
    inn: string;
    ogrn: string;
    kpp: string;
  };
  bank_account: BankAccountDomainInterface;
};
