import type { Mutations } from '@coopenomics/sdk';
import { Cooperative } from 'cooptypes';

export type IEntrepreneurData = Cooperative.Users.IEntrepreneurData;
export type IIndividualData = Cooperative.Users.IIndividualData;
export type IOrganizationData = Cooperative.Users.IOrganizationData;

type OmitUsernameAndEmail<T> = Omit<T, 'username' | 'email'>;

export type ICreateEntrepreneurData =
  OmitUsernameAndEmail<Cooperative.Users.IEntrepreneurData>;
export type ICreateIndividualData =
  OmitUsernameAndEmail<Cooperative.Users.IIndividualData>;
export type ICreateOrganizationData =
  OmitUsernameAndEmail<Cooperative.Users.IOrganizationData>;

export interface IUserData {
  type: 'individual' | 'entrepreneur' | 'organization' | null;
  entrepreneur_data?: ICreateEntrepreneurData & {
    bank_account: Cooperative.Payments.IBankAccount;
  };
  individual_data?: ICreateIndividualData;
  organization_data?: ICreateOrganizationData & {
    bank_account: Cooperative.Payments.IBankAccount;
  };
  email?: string;
  username?: string;
}

export type IRegisterAccount =
  Mutations.Accounts.RegisterAccount.IInput['data'];
export type IRegisteredAccountResult =
  Mutations.Accounts.RegisterAccount.IOutput[typeof Mutations.Accounts.RegisterAccount.name];
