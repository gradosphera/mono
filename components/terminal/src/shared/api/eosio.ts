import { TransactResult } from '@wharfkit/session';
import { APIClient } from '@wharfkit/antelope';
import { ContractKit } from '@wharfkit/contract';
import { CHAIN_URL } from '../config/Env';
import { useGlobalStore } from '../store';

export const readBlockchain = new APIClient({
  url: CHAIN_URL,
});

export const contractKit = new ContractKit({
  client: readBlockchain,
});

export async function getAccountInfo(account: string): Promise<any> {
  return (await readBlockchain.v1.chain.get_account(account)) as any;
}
export async function transact(
  transaction: any,
  params: any = { blocksBehind: 3, expireSeconds: 30 }
): Promise<TransactResult | undefined> {
  console.log(params);
  return useGlobalStore().transact(transaction);
}

async function internalFetchTable(
  code: string,
  scope: string,
  table: string,
  lower_bound: any = 0,
  upper_bound?: any,
  limit = 10,
  index_position?:
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'fourth'
    | 'fifth'
    | 'sixth'
    | 'seventh'
    | 'eighth'
    | 'ninth'
    | 'tenth'
): Promise<any[]> {

  const key_type = 'i64'

  const data = await readBlockchain.v1.chain.get_table_rows({
    code,
    scope,
    table,
    lower_bound,
    upper_bound,
    limit,
    index_position,
    key_type
  });

  let result = data.rows;

  if (data.more === true && limit !== 1) {
    const redata = await internalFetchTable(
      code,
      scope,
      table,
      lower_bound,
      upper_bound,
      limit,
      index_position
    );
    result = [...result, ...redata];
  }

  return result;
}

export async function fetchTable(
  code: string,
  scope: string,
  table: string,
  lower_bound: string | number = 0,
  upper_bound?: string | number,
  limit = 1000,
  index_position?:
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'fourth'
    | 'fifth'
    | 'sixth'
    | 'seventh'
    | 'eighth'
    | 'ninth'
    | 'tenth'
): Promise<any[]> {

  return internalFetchTable(
    code,
    scope,
    table,
    lower_bound,
    upper_bound,
    limit,
    index_position
  );
}
