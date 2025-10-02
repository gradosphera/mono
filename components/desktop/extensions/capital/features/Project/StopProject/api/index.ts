import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

export type IStopProjectInput = Mutations.Capital.StopProject.IInput['data'];
export type IStopProjectOutput =
  Mutations.Capital.StopProject.IOutput[typeof Mutations.Capital.StopProject.name];

async function stopProject(
  data: IStopProjectInput,
): Promise<IStopProjectOutput> {
  const { [Mutations.Capital.StopProject.name]: result } =
    await client.Mutation(Mutations.Capital.StopProject.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

export const api = {
  stopProject,
};
