import type {
  IGenerateDocumentInput,
  IGenerateDocumentOptionsInput,
  IGeneratedDocumentOutput,
} from 'src/shared/lib/types/document';
import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

async function generateResultContributionDecision(
  data: IGenerateDocumentInput,
  options?: IGenerateDocumentOptionsInput,
): Promise<IGeneratedDocumentOutput> {
  const { [Mutations.Capital.GenerateResultContributionDecision.name]: result } =
    await client.Mutation(Mutations.Capital.GenerateResultContributionDecision.mutation, {
      variables: {
        data,
        options,
      },
    });

  return result;
}

export const api = {
  generateResultContributionDecision,
};
