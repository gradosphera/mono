import type {
  IImportContributorInput,
  IImportContributorOutput,
} from 'app/extensions/capital/entities/Contributor/model';

import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

async function importContributor(
  data: IImportContributorInput,
): Promise<IImportContributorOutput> {
  const { [Mutations.Capital.ImportContributor.name]: result } =
    await client.Mutation(Mutations.Capital.ImportContributor.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

export const api = {
  importContributor,
};
