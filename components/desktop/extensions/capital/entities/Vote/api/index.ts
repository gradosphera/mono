import { client } from 'src/shared/api/client';
import { Queries } from '@coopenomics/sdk';
import type {
  IVote,
  IVotesPagination,
  IGetVoteInput,
  IGetVotesInput,
} from '../model';

async function loadVotes(data: IGetVotesInput): Promise<IVotesPagination> {
  const { [Queries.Capital.GetVotes.name]: output } = await client.Query(
    Queries.Capital.GetVotes.query,
    {
      variables: data,
    },
  );
  return output;
}

async function loadVote(data: IGetVoteInput): Promise<IVote> {
  const { [Queries.Capital.GetVote.name]: output } = await client.Query(
    Queries.Capital.GetVote.query,
    {
      variables: {
        data,
      },
    },
  );
  return output;
}

export const api = {
  loadVotes,
  loadVote,
};
