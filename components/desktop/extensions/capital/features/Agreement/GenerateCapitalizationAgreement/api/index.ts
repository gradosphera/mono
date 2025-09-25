import type {
  IGenerateDocumentInput,
  IGenerateDocumentOptionsInput,
  IGeneratedDocumentOutput,
} from 'src/shared/lib/types/document';
import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

async function generateCapitalizationAgreement(
  data: IGenerateDocumentInput,
  options?: IGenerateDocumentOptionsInput,
): Promise<IGeneratedDocumentOutput> {
  const { [Mutations.Capital.GenerateCapitalizationAgreement.name]: result } =
    await client.Mutation(Mutations.Capital.GenerateCapitalizationAgreement.mutation, {
      variables: {
        data,
        options,
      },
    });

  return result;
}

export const api = {
  generateCapitalizationAgreement,
};
