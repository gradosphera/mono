import { RegistratorContract, Cooperative } from 'cooptypes';
import { AccountResult } from 'eosjs/dist/eosjs-rpc-interfaces';

export type IEntrepreneurData = Cooperative.Users.IEntrepreneurData;
export type IIndividualData = Cooperative.Users.IIndividualData;
export type IOrganizationData = Cooperative.Users.IOrganizationData;

export interface IUserData {
  type: 'individual' | 'entrepreneur' | 'organization';
  entrepreneur_data?: IEntrepreneurData;
  individual_data?: IIndividualData;
  organization_data?: IOrganizationData;
}

export interface ILoadPrivateProfile {
  coopname: string;
  username: string;
}

export interface ILoadPublicProfile {
  coopname: string;
  username: string;
}

export interface IPrivateProfile {
  username: string;
}

export interface IUserAccountData {
  username: string;
  status: 'created' | 'joined' | 'payed' | 'registered' | 'active' | 'blocked';
  is_registered: boolean;
  type: 'individual' | 'entrepreneur' | 'organization';
  public_key: string;
  referer: string;
  email: string;
  role: string;
  is_email_verified: boolean;
  private_data: IIndividualData | IEntrepreneurData | IOrganizationData | null;
}

export interface ICopenomicsAccount
  extends Partial<RegistratorContract.Tables.Accounts.IAccount>,
    Partial<RegistratorContract.Tables.Cooperatives.ICooperative> {}

export type IBlockchainAccountResult = AccountResult;
