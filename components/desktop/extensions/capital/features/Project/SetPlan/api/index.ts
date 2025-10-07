import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';
import type { IProject } from 'app/extensions/capital/entities/Project/model';

export type ISetPlanInput = Mutations.Capital.SetPlan.IInput['data'];
export type ISetPlanOutput = IProject;

async function setPlan(data: ISetPlanInput): Promise<ISetPlanOutput> {
  const { [Mutations.Capital.SetPlan.name]: result } = await client.Mutation(
    Mutations.Capital.SetPlan.mutation,
    {
      variables: {
        data,
      },
    },
  );

  return result;
}

export const api = {
  setPlan,
};
