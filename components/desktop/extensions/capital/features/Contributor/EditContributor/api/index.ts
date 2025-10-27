import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';
import type { IContributor } from 'app/extensions/capital/entities/Contributor/model/types';

export type IEditContributorInput = Mutations.Capital.EditContributor.IInput['data'];
export type IEditContributorOutput = IContributor;

async function editContributor(
  data: IEditContributorInput,
): Promise<IEditContributorOutput> {
  const { [Mutations.Capital.EditContributor.name]: result } =
    await client.Mutation(Mutations.Capital.EditContributor.mutation, {
      variables: {
        data,
      },
    });

  // Возвращаем только данные contributor, без transaction
  return result;
}

export const api = {
  editContributor,
};
