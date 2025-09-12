import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

export type IStartVotingInput = Mutations.Capital.StartVoting.IInput['data'];
export type IStartVotingOutput =
  Mutations.Capital.StartVoting.IOutput[typeof Mutations.Capital.StartVoting.name];

async function startVoting(
  data: IStartVotingInput,
): Promise<IStartVotingOutput> {
  const { [Mutations.Capital.StartVoting.name]: result } =
    await client.Mutation(Mutations.Capital.StartVoting.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

export const api = {
  startVoting,
};
