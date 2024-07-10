import { fetchTable, sendGET } from 'src/shared/api';
import { ContractsList, TablesList } from 'src/shared/config';
import {
  IAddressesData,
  IAdministratorData,
  ICoopMarketProgramData,
  ILoadCoopMarketPrograms,
  ILoadCooperativeAddresses,
} from '../model';
import {Cooperative, RegistratorContract } from 'cooptypes';

async function loadMarketPrograms(
  params: ILoadCoopMarketPrograms
): Promise<ICoopMarketProgramData[]> {
  return (await fetchTable(
    ContractsList.Soviet,
    params.coopname,
    TablesList.CoopMarketPrograms
  )) as ICoopMarketProgramData[];
}

async function loadAdmins(coopname: string): Promise<IAdministratorData[]> {
  return (await sendGET('/v1/coop/staff', {
    coopname: coopname,
  })) as IAdministratorData[];
}

async function loadCooperativeData(): Promise<Cooperative.Model.IContacts> {
  return (await sendGET('/v1/coop/info', {})) as Cooperative.Model.IContacts;
}

async function loadPublicCooperativeData(
  coopname: string
): Promise<RegistratorContract.Tables.Organizations.IOrganization> {
  return (
    await fetchTable(
      RegistratorContract.contractName.production,
      RegistratorContract.contractName.production,
      RegistratorContract.Tables.Organizations.tableName,
      coopname,
      coopname,
      1
    )
  )[0] as RegistratorContract.Tables.Organizations.IOrganization;
}

async function loadCooperativeAddresses(
  params: ILoadCooperativeAddresses
): Promise<IAddressesData[]> {
  return (await fetchTable(
    ContractsList.Soviet,
    params.coopname,
    TablesList.CooperativeAddresses
  )) as IAddressesData[];
}

export const api = {
  loadMarketPrograms,
  loadCooperativeAddresses,
  loadPublicCooperativeData,
  loadAdmins,
  loadCooperativeData
};
