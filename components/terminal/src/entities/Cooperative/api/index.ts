import { fetchTable, sendGET } from 'src/shared/api';
import { ContractsList, TablesList } from 'src/shared/config';
import {
  IAddressesData,
  IAdministratorData,
  ICoopMarketProgramData,
  ILoadCoopMarketPrograms,
  ILoadCooperativeAddresses,
} from '../model';
import {Cooperative, FundContract, RegistratorContract } from 'cooptypes';

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

async function loadCoopWallet(coopname: string): Promise<FundContract.Tables.CoopWallet.ICoopWallet>{
  return (
    await fetchTable(
      FundContract.contractName.production,
      coopname,
      FundContract.Tables.CoopWallet.tableName,
      0,
      0,
      1
    )
  )[0] as FundContract.Tables.CoopWallet.ICoopWallet;
}

async function loadAccumulationFunds(coopname: string): Promise<FundContract.Tables.AccumulatedFunds.IAccumulatedFund[]>{
  return (
    await fetchTable(
      FundContract.contractName.production,
      coopname,
      FundContract.Tables.AccumulatedFunds.tableName,
    )
  )as FundContract.Tables.AccumulatedFunds.IAccumulatedFund[];
}


async function loadExpenseFunds(coopname: string): Promise<FundContract.Tables.ExpensedFunds.IExpensedFund[]>{
  return (
    await fetchTable(
      FundContract.contractName.production,
      coopname,
      FundContract.Tables.ExpensedFunds.tableName,
    )
  )as FundContract.Tables.ExpensedFunds.IExpensedFund[];
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
  loadCoopWallet,
  loadAccumulationFunds,
  loadExpenseFunds
};
