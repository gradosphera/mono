import { client } from 'src/shared/api/client';

import { Queries } from '@coopenomics/sdk';
import type { IAccount, IAccounts, IGetAccounts } from '../types';

async function getAccount(username: string): Promise<IAccount | undefined> {
  const { [Queries.Accounts.GetAccount.name]: output } = await client.Query(Queries.Accounts.GetAccount.query, {
    variables: {
      data: {username}
    }
  });

  return output;
}

async function getAccounts(variables?: IGetAccounts): Promise<IAccounts> {
  const { [Queries.Accounts.GetAccounts.name]: output } = await client.Query(Queries.Accounts.GetAccounts.query, {
    variables
  });

  return output;
}

export const api ={
  getAccount,
  getAccounts
}
