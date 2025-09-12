import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

export type IRefreshProgramInput =
  Mutations.Capital.RefreshProgram.IInput['data'];
export type IRefreshProgramOutput =
  Mutations.Capital.RefreshProgram.IOutput[typeof Mutations.Capital.RefreshProgram.name];

async function refreshProgram(
  data: IRefreshProgramInput,
): Promise<IRefreshProgramOutput> {
  const { [Mutations.Capital.RefreshProgram.name]: result } =
    await client.Mutation(Mutations.Capital.RefreshProgram.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

export const api = {
  refreshProgram,
};
