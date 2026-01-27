import type {
  IGenerateDocumentOptionsInput,
  IGeneratedDocumentOutput,
} from 'src/shared/lib/types/document';
import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

async function generateGenerationMoneyReturnUnusedStatement(
  data: Mutations.Capital.GenerateGenerationMoneyReturnUnusedStatement.IInput['data'],
  options?: IGenerateDocumentOptionsInput,
): Promise<IGeneratedDocumentOutput> {
  const { [Mutations.Capital.GenerateGenerationMoneyReturnUnusedStatement.name]: result } =
    await client.Mutation(Mutations.Capital.GenerateGenerationMoneyReturnUnusedStatement.mutation, {
      variables: {
        data,
        options,
      },
    });

  return result;
}

export const api = {
  generateGenerationMoneyReturnUnusedStatement,
};
