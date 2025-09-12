import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

export type ICalculateVotesInput =
  Mutations.Capital.CalculateVotes.IInput['data'];
export type ICalculateVotesOutput =
  Mutations.Capital.CalculateVotes.IOutput[typeof Mutations.Capital.CalculateVotes.name];

async function calculateVotes(
  data: ICalculateVotesInput,
): Promise<ICalculateVotesOutput> {
  const { [Mutations.Capital.CalculateVotes.name]: result } =
    await client.Mutation(Mutations.Capital.CalculateVotes.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

export const api = {
  calculateVotes,
};
