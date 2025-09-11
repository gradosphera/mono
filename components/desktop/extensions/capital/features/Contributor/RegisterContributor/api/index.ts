import type { IRegisterContributorOutput } from 'app/extensions/capital/entities/Contributor/model';
import type { IRegisterContributorInput } from '../model';
import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

async function registerContributor(
  data: IRegisterContributorInput,
): Promise<IRegisterContributorOutput> {
  const { [Mutations.Capital.RegisterContributor.name]: result } =
    await client.Mutation(Mutations.Capital.RegisterContributor.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

export const api = {
  registerContributor,
};
