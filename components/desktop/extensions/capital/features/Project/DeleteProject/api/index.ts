import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

export type IDeleteProjectInput =
  Mutations.Capital.DeleteProject.IInput['data'];
export type IDeleteProjectOutput =
  Mutations.Capital.DeleteProject.IOutput[typeof Mutations.Capital.DeleteProject.name];

async function deleteProject(
  data: IDeleteProjectInput,
): Promise<IDeleteProjectOutput> {
  const { [Mutations.Capital.DeleteProject.name]: result } =
    await client.Mutation(Mutations.Capital.DeleteProject.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

export const api = {
  deleteProject,
};
