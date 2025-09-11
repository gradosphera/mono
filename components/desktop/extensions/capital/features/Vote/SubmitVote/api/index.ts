import type {
  ISubmitVoteOutput,
  ISubmitVoteInput,
} from 'app/extensions/capital/entities/Vote/model';

import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

async function submitVote(data: ISubmitVoteInput): Promise<ISubmitVoteOutput> {
  const { [Mutations.Capital.SubmitVote.name]: result } = await client.Mutation(
    Mutations.Capital.SubmitVote.mutation,
    {
      variables: {
        data,
      },
    },
  );

  return result;
}

export const api = {
  submitVote,
};
