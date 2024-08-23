import { fetchTable, sendGET } from '../../../shared/api';

import {
  ContractsList,
  TablesList,
  LimitsList,
  SecondaryIndexesNumbers,
} from 'src/shared/config';

import {
  IWalletData,
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
  ILoadSingleUserWallet,
  ILoadSingleUserDeposit,
  ILoadSingleUserProgramWallet,
  ILoadSingleUserWithdraw,
  ILoadUserDeposits,
  ILoadUserProgramWallets,
  ILoadUserWithdraws,
} from '../model';
import { SovietContract } from 'cooptypes';

async function loadSingleUserWalletData(
  params: ILoadSingleUserWallet
): Promise<IWalletData> {
  return (
    await fetchTable(
      ContractsList.Soviet,
      params.coopname,
      TablesList.Wallets,
      params.username,
      params.username,
      LimitsList.One
    )
  )[0] as IWalletData;
}

async function loadSingleUserDepositData(
  params: ILoadSingleUserDeposit
): Promise<IDepositData> {
  return (
    await fetchTable(
      ContractsList.Gateway,
      params.coopname,
      TablesList.Deposits,
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
      ContractsList.Soviet,
      params.coopname,
      TablesList.ProgramWallets,
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
      ContractsList.Gateway,
      params.coopname,
      TablesList.Withdraws,
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
    ContractsList.Gateway,
    params.coopname,
    TablesList.Deposits,
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
    ContractsList.Gateway,
    params.coopname,
    TablesList.Withdraws,
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
          program_type: 'coopmarket',
          program_details: programInfo,
        } as ExtendedProgramWalletData;
      }

      return wallet as ExtendedProgramWalletData;
    });

  return extendedProgramWallets;
}

async function loadMethods(params: IGetPaymentMethods): Promise<IPaymentMethodData[]> {
  const {username} = params
  const methods = (await sendGET(`/v1/payments/methods/${username}`)) as IGetResponsePaymentMethodData;

  return methods.results;
}


export const api = {
  loadSingleUserWalletData,
  loadSingleUserDepositData,
  loadSingleUserProgramWalletData,
  loadSingleUserWithdrawData,
  loadUserDepositsData,
  loadUserWithdrawsData,
  loadUserProgramWalletsData,
  loadMethods
};
