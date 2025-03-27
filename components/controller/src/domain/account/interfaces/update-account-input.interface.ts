import type { Cooperative } from 'cooptypes';

export interface UpdateAccountDomainInterface {
  entrepreneur_data?: Omit<Cooperative.Users.IEntrepreneurData, 'username'>;
  individual_data?: Omit<Cooperative.Users.IIndividualData, 'username'>;
  organization_data?: Omit<Cooperative.Users.IOrganizationData, 'username'>;
  public_key?: string;
  referer?: string;
  username: string;
}
