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

async function loadPrivateCooperativeData(): Promise<Cooperative.Model.ICooperativeData> {
  return (await sendGET('/v1/coop/info', {}, false)) as Cooperative.Model.ICooperativeData;
}

async function loadContacts(): Promise<Cooperative.Model.IContacts> {
  return (await sendGET('/v1/coop/contacts', {}, true)) as Cooperative.Model.IContacts;
}


async function loadPublicCooperativeData(
  coopname: string
): Promise<RegistratorContract.Tables.Cooperatives.ICooperative> {
  return (
    await fetchTable(
      RegistratorContract.contractName.production,
      RegistratorContract.contractName.production,
      RegistratorContract.Tables.Cooperatives.tableName,
      coopname,
      coopname,
      1
    )
  )[0] as RegistratorContract.Tables.Cooperatives.ICooperative;
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
  loadPrivateCooperativeData,
  loadContacts,
};
