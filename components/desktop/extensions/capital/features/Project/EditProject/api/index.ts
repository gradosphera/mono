import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

export type IEditProjectInput =
  Mutations.Capital.EditProject.IInput['data'];
export type IEditProjectOutput =
  Mutations.Capital.EditProject.IOutput[typeof Mutations.Capital.EditProject.name];

async function editProject(
  data: IEditProjectInput,
): Promise<IEditProjectOutput> {
  const { [Mutations.Capital.EditProject.name]: result } =
    await client.Mutation(Mutations.Capital.EditProject.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

export const api = {
  editProject,
};
