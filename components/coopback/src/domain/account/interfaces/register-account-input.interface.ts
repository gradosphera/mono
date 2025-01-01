import type { Cooperative } from 'cooptypes';

export interface RegisterAccountDomainInterface {
  email: string;
  entrepreneur_data?: Omit<Cooperative.Users.IEntrepreneurData, 'username'> & {
    bank_account: Cooperative.Payments.IBankAccount;
  };
  individual_data?: Omit<Cooperative.Users.IIndividualData, 'username'>;
  organization_data?: Omit<Cooperative.Users.IOrganizationData, 'username'> & {
    bank_account: Cooperative.Payments.IBankAccount;
  };
  public_key?: string;
  referer?: string;
  role: 'user';
  type: 'individual' | 'entrepreneur' | 'organization';
  username: string;
}
