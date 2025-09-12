import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

export type IMakeClearanceInput =
  Mutations.Capital.MakeClearance.IInput['data'];
export type IMakeClearanceOutput =
  Mutations.Capital.MakeClearance.IOutput[typeof Mutations.Capital.MakeClearance.name];

async function makeClearance(
  data: IMakeClearanceInput,
): Promise<IMakeClearanceOutput> {
  const { [Mutations.Capital.MakeClearance.name]: result } =
    await client.Mutation(Mutations.Capital.MakeClearance.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

export const api = {
  makeClearance,
};
