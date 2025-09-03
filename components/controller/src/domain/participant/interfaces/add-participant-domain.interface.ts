import type { Cooperative } from 'cooptypes';
import type { RegisterRole } from '~/application/account/enum/account-role-on-register.enum';
import type { AccountType } from '~/application/account/enum/account-type.enum';

export interface AddParticipantDomainInterface {
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
  role: RegisterRole;
  type: AccountType;
  username: string;
  created_at: string;
  initial: string;
  minimum: string;
  spread_initial: boolean;
}
