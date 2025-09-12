import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

export type ICompleteVotingInput =
  Mutations.Capital.CompleteVoting.IInput['data'];
export type ICompleteVotingOutput =
  Mutations.Capital.CompleteVoting.IOutput[typeof Mutations.Capital.CompleteVoting.name];

async function completeVoting(
  data: ICompleteVotingInput,
): Promise<ICompleteVotingOutput> {
  const { [Mutations.Capital.CompleteVoting.name]: result } =
    await client.Mutation(Mutations.Capital.CompleteVoting.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

export const api = {
  completeVoting,
};
