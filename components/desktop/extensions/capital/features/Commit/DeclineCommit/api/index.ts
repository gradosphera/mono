import type { IDeclineCommitOutput } from '../model';
import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

async function declineCommit(
  data: Mutations.Capital.DeclineCommit.IInput['data'],
): Promise<IDeclineCommitOutput> {
  const { [Mutations.Capital.DeclineCommit.name]: result } =
    await client.Mutation(Mutations.Capital.DeclineCommit.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

export const api = {
  declineCommit,
};
