import type { ICreateProjectOutput } from 'app/extensions/capital/entities/Project/model';
import type { ICreateProjectInput } from '../model';
import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

async function createProject(
  data: ICreateProjectInput,
): Promise<ICreateProjectOutput> {
  const { [Mutations.Capital.CreateProject.name]: result } =
    await client.Mutation(Mutations.Capital.CreateProject.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

export const api = {
  createProject,
};
