import type { Cooperative } from 'cooptypes';
import type { AccountType } from '~/application/account/enum/account-type.enum';

export interface PrivateAccountDomainInterface {
  type: AccountType;
  individual_data?: Cooperative.Users.IIndividualData;
  organization_data?: Cooperative.Users.IOrganizationData;
  entrepreneur_data?: Cooperative.Users.IEntrepreneurData;
}
