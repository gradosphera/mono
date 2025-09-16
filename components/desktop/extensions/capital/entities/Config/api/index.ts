import { client } from 'src/shared/api/client';
import { Queries } from '@coopenomics/sdk';
import type { IGetStateInput, IState } from '../model';

async function loadState(data: IGetStateInput): Promise<IState> {
  const { [Queries.Capital.GetState.name]: output } = await client.Query(
    Queries.Capital.GetState.query,
    {
      variables: {
        data,
      },
    },
  );
  return output;
}

export const api = {
  loadState,
};
