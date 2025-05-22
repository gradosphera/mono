import { fetchTable, sendGET } from '../../../shared/api';

import {
  LimitsList,
  SecondaryIndexesNumbers,
} from 'src/shared/config';

import {
  IDepositData,
  IWithdrawData,
  IProgramWalletData,
  ICoopProgramData,
  ExtendedProgramWalletData,
  IGetPaymentMethods,
  IGetResponsePaymentMethodData,
  IPaymentMethodData,
} from '../model';

import {
  ILoadSingleUserDeposit,
  ILoadSingleUserProgramWallet,
  ILoadSingleUserWithdraw,
  ILoadUserDeposits,
  ILoadUserProgramWallets,
  ILoadUserWithdraws,
} from '../model';
import { GatewayContract, SovietContract } from 'cooptypes';

async function loadSingleUserDepositData(
  params: ILoadSingleUserDeposit
): Promise<IDepositData> {
  return (
    await fetchTable(
      GatewayContract.contractName.production,
      params.coopname,
      GatewayContract.Tables.Incomes.tableName,
      params.username,
      params.username,
      LimitsList.One
    )
  )[0] as IDepositData;
}

async function loadSingleUserProgramWalletData(
  params: ILoadSingleUserProgramWallet
): Promise<IProgramWalletData> {
  return (
    await fetchTable(
      SovietContract.contractName.production,
      params.coopname,
      SovietContract.Tables.ProgramWallets.tableName,
      params.wallet_id,
      params.wallet_id,
      LimitsList.One
    )
  )[0] as IProgramWalletData;
}

async function loadSingleUserWithdrawData(
  params: ILoadSingleUserWithdraw
): Promise<IWithdrawData> {
  return (
    await fetchTable(
      GatewayContract.contractName.production,
      params.coopname,
      GatewayContract.Tables.Outcomes.tableName,
      params.withdraw_id,
      params.withdraw_id,
      LimitsList.One
    )
  )[0] as IWithdrawData;
}

async function loadUserDepositsData(
  params: ILoadUserDeposits
): Promise<IDepositData[]> {
  return (await fetchTable(
    GatewayContract.contractName.production,
    params.coopname,
    GatewayContract.Tables.Incomes.tableName,
    params.username,
    params.username,
    LimitsList.None,
    SecondaryIndexesNumbers.Two
  )) as IDepositData[];
}

async function loadUserWithdrawsData(
  params: ILoadUserWithdraws
): Promise<IWithdrawData[]> {
  return (await fetchTable(
    GatewayContract.contractName.production,
    params.coopname,
    GatewayContract.Tables.Outcomes.tableName,
    params.username,
    params.username,
    LimitsList.None,
    SecondaryIndexesNumbers.Two
  )) as IWithdrawData[];
}

async function loadUserProgramWalletsData(
  params: ILoadUserProgramWallets
): Promise<ExtendedProgramWalletData[]> {
  const programs = (await fetchTable(
    SovietContract.contractName.production,
    params.coopname,
    SovietContract.Tables.Programs.tableName
  )) as ICoopProgramData[];

  const program_wallets = (await fetchTable(
    SovietContract.contractName.production,
    params.coopname,
    SovietContract.Tables.ProgramWallets.tableName,
    params.username,
    params.username,
    LimitsList.None,
    SecondaryIndexesNumbers.Two
  )) as IProgramWalletData[];

  const extendedProgramWallets: ExtendedProgramWalletData[] =
    program_wallets.map((wallet) => {
      const programInfo = programs.find(
        (program) => program.id === wallet.program_id
      );

      if (programInfo) {
        return {
          ...wallet,
          program_details: programInfo,
        } as ExtendedProgramWalletData;
      }

      return wallet as ExtendedProgramWalletData;
    });

  return extendedProgramWallets;
}

async function loadMethods(params: IGetPaymentMethods): Promise<IPaymentMethodData[]> {
  const { username } = params;
  const methods = (await sendGET(`/v1/methods/${username}`)) as IGetResponsePaymentMethodData;

  //тут стоит костыль, т.к. method_id это string, а фабрика документов не возвращает платежные методы с ID в виде number, по которым можно отсортировать.
  //и дат там тоже нет. Как появятся даты/номера - так и сортировку эту поправим.
  return methods.results.sort((a, b) => b.method_id.localeCompare(a.method_id));
}

async function loadUserAgreements(coopname: string, username: string): Promise<SovietContract.Tables.Agreements.IAgreement[]> {

    const result = await fetchTable(
      SovietContract.contractName.production,
      coopname,
      SovietContract.Tables.Agreements.tableName,
      username,
      username,
      LimitsList.None,
      'secondary'
    )

    return result as SovietContract.Tables.Agreements.IAgreement[];
}


export const api = {
  loadSingleUserDepositData,
  loadSingleUserProgramWalletData,
  loadSingleUserWithdrawData,
  loadUserDepositsData,
  loadUserWithdrawsData,
  loadUserProgramWalletsData,
  loadMethods,
  loadUserAgreements
};
