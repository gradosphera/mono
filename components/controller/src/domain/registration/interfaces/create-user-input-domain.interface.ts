import type { Cooperative } from 'cooptypes';

export interface CreateUserInputDomainInterface {
  email: string;
  entrepreneur_data?: Omit<Cooperative.Users.IEntrepreneurData, 'username'> & {
    bank_account: Cooperative.Payments.IBankAccount;
  };
  individual_data?: Omit<Cooperative.Users.IIndividualData, 'username'>;
  organization_data?: {
    bank_account: Cooperative.Payments.IBankAccount;
    city: string;
    country: string;
    details: {
      inn: string;
      kpp: string;
      ogrn: string;
    };
    email: string;
    fact_address: string;
    full_address: string;
    full_name: string;
    phone: string;
    represented_by: {
      based_on: string;
      first_name: string;
      last_name: string;
      middle_name: string;
      position: string;
    };
    short_name: string;
    type: string;
  };
  public_key?: string;
  referer?: string;
  role: 'user';
  type: 'individual' | 'entrepreneur' | 'organization';
  username: string;
}
