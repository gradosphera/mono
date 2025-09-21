import { client } from 'src/shared/api/client';
import { Queries } from '@coopenomics/sdk';
import type {
  IGetTimeEntriesInput,
  ITimeEntriesPagination,
} from '../model/types';

async function loadTimeEntries(
  data: IGetTimeEntriesInput,
): Promise<ITimeEntriesPagination> {
  const { [Queries.Capital.GetTimeEntries.name]: output } = await client.Query(
    Queries.Capital.GetTimeEntries.query,
    {
      variables: data,
    },
  );
  return output;
}

export const api = {
  loadTimeEntries,
};
