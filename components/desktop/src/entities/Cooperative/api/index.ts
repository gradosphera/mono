import { fetchTable } from 'src/shared/api';
import { ContractsList, TablesList } from 'src/shared/config';
import {
  IAddressesData,
  ICoopProgramData,
  ILoadCoopPrograms,
  ILoadCooperativeAddresses,
} from '../model';
import { RegistratorContract, SovietContract } from 'cooptypes';

async function loadPrograms(
  params: ILoadCoopPrograms,
): Promise<ICoopProgramData[]> {
  return (await fetchTable(
    SovietContract.contractName.production,
    params.coopname,
    SovietContract.Tables.Programs.tableName,
  )) as ICoopProgramData[];
}


async function loadPublicCooperativeData(
  coopname: string,
): Promise<RegistratorContract.Tables.Cooperatives.ICooperative> {
  return (
    await fetchTable(
      RegistratorContract.contractName.production,
      RegistratorContract.contractName.production,
      RegistratorContract.Tables.Cooperatives.tableName,
      coopname,
      coopname,
      1,
    )
  )[0] as RegistratorContract.Tables.Cooperatives.ICooperative;
}

async function loadCooperativeAddresses(
  params: ILoadCooperativeAddresses,
): Promise<IAddressesData[]> {
  return (await fetchTable(
    ContractsList.Soviet,
    params.coopname,
    TablesList.CooperativeAddresses,
  )) as IAddressesData[];
}

export const api = {
  loadPrograms,
  loadCooperativeAddresses,
  loadPublicCooperativeData,
};
