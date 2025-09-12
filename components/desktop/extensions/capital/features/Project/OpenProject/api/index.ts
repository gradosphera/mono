import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

export type IOpenProjectInput = Mutations.Capital.OpenProject.IInput['data'];
export type IOpenProjectOutput =
  Mutations.Capital.OpenProject.IOutput[typeof Mutations.Capital.OpenProject.name];

async function openProject(
  data: IOpenProjectInput,
): Promise<IOpenProjectOutput> {
  const { [Mutations.Capital.OpenProject.name]: result } =
    await client.Mutation(Mutations.Capital.OpenProject.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

export const api = {
  openProject,
};
