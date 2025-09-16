import type { ICreateComponentOutput } from '../model';
import type { ICreateComponentInput } from '../model';
import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

async function createComponent(
  data: ICreateComponentInput,
): Promise<ICreateComponentOutput> {
  const { [Mutations.Capital.CreateProject.name]: result } =
    await client.Mutation(Mutations.Capital.CreateProject.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

export const api = {
  createComponent,
};
