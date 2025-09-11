import type {
  ICreateProjectInvestInput,
  ICreateProjectInvestOutput,
} from 'app/extensions/capital/entities/Invest/model';
import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

async function createProjectInvest(
  data: ICreateProjectInvestInput,
): Promise<ICreateProjectInvestOutput> {
  const { [Mutations.Capital.CreateProjectInvest.name]: result } =
    await client.Mutation(Mutations.Capital.CreateProjectInvest.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

export const api = {
  createProjectInvest,
};
