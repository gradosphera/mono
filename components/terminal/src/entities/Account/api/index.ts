import { client } from 'src/shared/api/client';
import { Queries, type ModelTypes } from '@coopenomics/coopjs';

async function getAccount(username: string): Promise<ModelTypes['Account'] | undefined> {
  const { getAccount: output } = await client.Query(Queries.getAccount, {
    variables: {
      data: {username}
    }
  });

  return output;
}

export const api ={
  getAccount
}
