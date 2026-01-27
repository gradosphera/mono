import type {
  IGenerateDocumentOptionsInput,
  IGeneratedDocumentOutput,
} from 'src/shared/lib/types/document';
import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

async function generateCapitalizationMoneyInvestStatement(
  data: Mutations.Capital.GenerateCapitalizationMoneyInvestStatement.IInput['data'],
  options?: IGenerateDocumentOptionsInput,
): Promise<IGeneratedDocumentOutput> {
  const { [Mutations.Capital.GenerateCapitalizationMoneyInvestStatement.name]: result } =
    await client.Mutation(Mutations.Capital.GenerateCapitalizationMoneyInvestStatement.mutation, {
      variables: {
        data,
        options,
      },
    });

  return result;
}

export const api = {
  generateCapitalizationMoneyInvestStatement,
};
