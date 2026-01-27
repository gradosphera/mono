import type {
  IGenerateDocumentOptionsInput,
  IGeneratedDocumentOutput,
} from 'src/shared/lib/types/document';
import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

async function generateGenerationToMainWalletConvertStatement(
  data: Mutations.Capital.GenerateGenerationToMainWalletConvertStatement.IInput['data'],
  options?: IGenerateDocumentOptionsInput,
): Promise<IGeneratedDocumentOutput> {
  const { [Mutations.Capital.GenerateGenerationToMainWalletConvertStatement.name]: result } =
    await client.Mutation(Mutations.Capital.GenerateGenerationToMainWalletConvertStatement.mutation, {
      variables: {
        data,
        options,
      },
    });

  return result;
}

export const api = {
  generateGenerationToMainWalletConvertStatement,
};
