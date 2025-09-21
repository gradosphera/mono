import { client } from 'src/shared/api/client';
import { Queries } from '@coopenomics/sdk';
import type {
  IGetTimeStatsInput,
  ITimeStatsPagination,
} from '../model/types';

async function loadTimeStats(
  data: IGetTimeStatsInput,
): Promise<ITimeStatsPagination> {
  const { [Queries.Capital.GetTimeStats.name]: output } = await client.Query(
    Queries.Capital.GetTimeStats.query,
    {
      variables: data,
    },
  );
  return output;
}

export const api = {
  loadTimeStats,
};
