import type {
  IGenerateDocumentInput,
  IGenerateDocumentOptionsInput,
  IGeneratedDocumentOutput,
} from 'src/shared/lib/types/document';
import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

async function generateResultContributionAct(
  data: IGenerateDocumentInput,
  options?: IGenerateDocumentOptionsInput,
): Promise<IGeneratedDocumentOutput> {
  const { [Mutations.Capital.GenerateResultContributionAct.name]: result } =
    await client.Mutation(Mutations.Capital.GenerateResultContributionAct.mutation, {
      variables: {
        data,
        options,
      },
    });

  return result;
}

export const api = {
  generateResultContributionAct,
};
