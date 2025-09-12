import { client } from 'src/shared/api/client';
import { Queries } from '@coopenomics/sdk';
import type { ICyclesPagination, IGetCyclesInput } from '../model';

async function loadCycles(data: IGetCyclesInput): Promise<ICyclesPagination> {
  const { [Queries.Capital.GetCycles.name]: output } = await client.Query(
    Queries.Capital.GetCycles.query,
    {
      variables: data,
    },
  );
  return output;
}

export const api = {
  loadCycles,
};
