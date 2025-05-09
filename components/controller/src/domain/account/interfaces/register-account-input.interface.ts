import type { Cooperative } from 'cooptypes';
import type { CreateOrganizationDataInputDomainInterface } from './create-organization-data-input-domain.interface';

export interface RegisterAccountDomainInterface {
  email: string;
  entrepreneur_data?: Omit<Cooperative.Users.IEntrepreneurData, 'username'> & {
    bank_account: Cooperative.Payments.IBankAccount;
  };
  individual_data?: Omit<Cooperative.Users.IIndividualData, 'username'>;
  organization_data?: CreateOrganizationDataInputDomainInterface;
  public_key: string;
  referer?: string;
  type: 'individual' | 'entrepreneur' | 'organization';
  username: string;
}
