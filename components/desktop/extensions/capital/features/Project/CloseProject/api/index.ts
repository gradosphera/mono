import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

export type ICloseProjectInput = Mutations.Capital.CloseProject.IInput['data'];
export type ICloseProjectOutput =
  Mutations.Capital.CloseProject.IOutput[typeof Mutations.Capital.CloseProject.name];

async function closeProject(
  data: ICloseProjectInput,
): Promise<ICloseProjectOutput> {
  const { [Mutations.Capital.CloseProject.name]: result } =
    await client.Mutation(Mutations.Capital.CloseProject.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

export const api = {
  closeProject,
};
