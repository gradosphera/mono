import { SovietContract } from 'cooptypes';
import { IUser } from 'src/shared/lib/types/user';

export type ICoopMarketProgramData =
  SovietContract.Tables.MarketPrograms.IMarketPrograms;
export type IAddressesData = SovietContract.Tables.Addresses.IAddress;

export interface ILoadCoopMarketPrograms {
  coopname: string;
}

export interface ILoadCooperativeAddresses {
  coopname: string;
}

export interface IAdministratorData
  extends SovietContract.Tables.Admins.IAdmins {
  user: IUser;
}
