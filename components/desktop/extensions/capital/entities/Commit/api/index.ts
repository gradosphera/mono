import { client } from 'src/shared/api/client';
import { Queries } from '@coopenomics/sdk';
import type { IGetCommitsInput, ICommitsPagination } from '../model';

async function loadCommits(
  data: IGetCommitsInput,
): Promise<ICommitsPagination> {
  const { [Queries.Capital.GetCommits.name]: output } = await client.Query(
    Queries.Capital.GetCommits.query,
    {
      variables: data,
    },
  );
  return output;
}

export const api = {
  loadCommits,
};
