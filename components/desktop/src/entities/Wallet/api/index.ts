import { fetchTable } from '../../../shared/api';
import { client } from '../../../shared/api/client';
import { Queries } from '@coopenomics/sdk';

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
  IPaymentMethodData,
  IUserAgreement,
} from '../model';

import {
  ILoadSingleUserDeposit,
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

/**
 * После Эпика 3 источник кошельков — `getProgramWallets` (контроллер собирает
 * программные срезы из `ledger2::userwallets` через `wallet::users.programs[]`).
 * Список программ кооператива по-прежнему лежит в `soviet::programs` —
 * читаем напрямую и мерджим, чтобы получить `program_details` для UI.
 */
async function loadUserProgramWalletsData(
  params: ILoadUserProgramWallets
): Promise<ExtendedProgramWalletData[]> {
  const programs = (await fetchTable(
    SovietContract.contractName.production,
    params.coopname,
    SovietContract.Tables.Programs.tableName
  )) as ICoopProgramData[];

  const { [Queries.Wallet.GetProgramWallets.name]: paginated } = await client.Query(
    Queries.Wallet.GetProgramWallets.query,
    {
      variables: {
        filter: { coopname: params.coopname, username: params.username },
        options: { page: 1, limit: 1000 },
      },
    }
  );

  return (paginated?.items ?? []).map((wallet) => {
    const programInfo = programs.find((program) => String(program.id) === String(wallet.program_id));
    return {
      ...(wallet as unknown as IProgramWalletData),
      program_type: wallet.program_type,
      ...(programInfo ? { program_details: programInfo } : {}),
    } as ExtendedProgramWalletData;
  });
}


async function loadMethods(params: IGetPaymentMethods): Promise<IPaymentMethodData[]> {
  const result = await client.Query(Queries.PaymentMethods.GetPaymentMethods.query, {
    variables: {
      data: {
        username: params.username, // Фильтруем по username
        limit: 100, // Получаем все методы
        page: 1,
      },
    },
  });

  // Маппинг данных SDK к ожидаемому формату
  const methods: IPaymentMethodData[] = (result).getPaymentMethods.items.map((item: any) => ({
    method_id: item.method_id,
    method_type: item.method_type,
    username: item.username,
    data: item.data,
    is_default: item.is_default,
    created_at: item.created_at,
    updated_at: item.updated_at,
  }));

  // Сортировка по method_id (от большего к меньшему)
  return methods.sort((a, b) => b.method_id.localeCompare(a.method_id));
}

/**
 * После Эпика 3 программные соглашения живут в `wallet::users.programs[]`,
 * непрограммные — в `soviet::agreements3`. Контроллер объединяет оба источника
 * в `getAgreements`, поэтому desktop читает только GraphQL.
 */
async function loadUserAgreements(coopname: string, username: string): Promise<IUserAgreement[]> {
  const { [Queries.Agreements.Agreements.name]: paginated } = await client.Query(
    Queries.Agreements.Agreements.query,
    {
      variables: {
        filter: { coopname, username },
        options: { page: 1, limit: 1000 },
      },
    }
  );
  return (paginated?.items ?? []) as IUserAgreement[];
}


export const api = {
  loadSingleUserDepositData,
  loadSingleUserWithdrawData,
  loadUserDepositsData,
  loadUserWithdrawsData,
  loadUserProgramWalletsData,
  loadMethods,
  loadUserAgreements
};
