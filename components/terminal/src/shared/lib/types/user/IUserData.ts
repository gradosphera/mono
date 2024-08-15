import { Cooperative } from 'cooptypes';

export type IEntrepreneurData = Cooperative.Users.IEntrepreneurData;
export type IIndividualData = Cooperative.Users.IIndividualData;
export type IOrganizationData = Cooperative.Users.IOrganizationData;

export interface IUserData {
  type: 'individual' | 'entrepreneur' | 'organization';
  entrepreneur_data?: IEntrepreneurData;
  individual_data?: IIndividualData;
  organization_data?: IOrganizationData;
}
