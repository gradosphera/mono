import { client } from 'src/shared/api/client';
import { Queries } from '@coopenomics/sdk';
import type {
  IGetCommitsInput,
  ICommitsPagination,
  IGetCommitInput,
  IGetCommitOutput,
} from '../model/types';

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

async function loadCommit(data: IGetCommitInput): Promise<IGetCommitOutput> {
  const { [Queries.Capital.GetCommit.name]: output } = await client.Query(
    Queries.Capital.GetCommit.query,
    {
      variables: {
        data,
      },
    },
  );
  return output;
}

export const api = {
  loadCommits,
  loadCommit,
};
