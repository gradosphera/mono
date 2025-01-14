import { SovietContract } from 'cooptypes';
import { IUser } from 'src/shared/lib/types/user';

export type ICoopProgramData =
  SovietContract.Tables.Programs.IProgram;
export type IAddressesData = SovietContract.Tables.Addresses.IAddress;

export interface ILoadCoopPrograms {
  coopname: string;
}

export interface ILoadCooperativeAddresses {
  coopname: string;
}

export interface IAdministratorData
  extends SovietContract.Tables.Admins.IAdmins {
  user: IUser;
}
