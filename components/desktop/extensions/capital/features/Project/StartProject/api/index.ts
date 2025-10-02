import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

export type IStartProjectInput = Mutations.Capital.StartProject.IInput['data'];
export type IStartProjectOutput =
  Mutations.Capital.StartProject.IOutput[typeof Mutations.Capital.StartProject.name];

async function startProject(
  data: IStartProjectInput,
): Promise<IStartProjectOutput> {
  console.log('startProject', data);
  const { [Mutations.Capital.StartProject.name]: result } =
    await client.Mutation(Mutations.Capital.StartProject.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

export const api = {
  startProject,
};
