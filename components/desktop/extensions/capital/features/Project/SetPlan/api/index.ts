import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

export type ISetPlanInput = Mutations.Capital.SetPlan.IInput['data'];
export type ISetPlanOutput =
  Mutations.Capital.SetPlan.IOutput[typeof Mutations.Capital.SetPlan.name];

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
