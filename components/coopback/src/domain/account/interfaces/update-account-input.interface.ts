import type { Cooperative } from 'cooptypes';
import type { OrganizationType } from '~/modules/account/enum/organization-type.enum';

export interface UpdateAccountDomainInterface {
  email: string;
  entrepreneur_data?: Omit<Cooperative.Users.IEntrepreneurData, 'username'>;
  individual_data?: Omit<Cooperative.Users.IIndividualData, 'username'>;
  organization_data?: Omit<Cooperative.Users.IOrganizationData, 'username' | 'type'> & { type: OrganizationType };
  public_key?: string;
  referer?: string;
  role: 'user';
  type: 'individual' | 'entrepreneur' | 'organization';
  username: string;
}
