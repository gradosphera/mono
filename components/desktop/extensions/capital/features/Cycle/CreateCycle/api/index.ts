import type {
  ICreateCycleOutput,
  ICreateCycleInput,
} from 'app/extensions/capital/entities/Cycle/model';
import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

async function createCycle(
  data: ICreateCycleInput,
): Promise<ICreateCycleOutput> {
  const { [Mutations.Capital.CreateCycle.name]: result } =
    await client.Mutation(Mutations.Capital.CreateCycle.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

export const api = {
  createCycle,
};
