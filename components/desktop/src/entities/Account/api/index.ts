import { client } from 'src/shared/api/client';
import { Queries } from '@coopenomics/sdk';
import type { IAccount } from '../types';

async function getAccount(username: string): Promise<IAccount | undefined> {
  const { [Queries.Accounts.GetAccount.name]: output } = await client.Query(Queries.Accounts.GetAccount.query, {
    variables: {
      data: {username}
    }
  });

  return output;
}

export const api ={
  getAccount
}
