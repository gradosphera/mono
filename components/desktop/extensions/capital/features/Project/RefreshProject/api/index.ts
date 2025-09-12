import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

export type IRefreshProjectInput =
  Mutations.Capital.RefreshProject.IInput['data'];
export type IRefreshProjectOutput =
  Mutations.Capital.RefreshProject.IOutput[typeof Mutations.Capital.RefreshProject.name];

async function refreshProject(
  data: IRefreshProjectInput,
): Promise<IRefreshProjectOutput> {
  const { [Mutations.Capital.RefreshProject.name]: result } =
    await client.Mutation(Mutations.Capital.RefreshProject.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

export const api = {
  refreshProject,
};
