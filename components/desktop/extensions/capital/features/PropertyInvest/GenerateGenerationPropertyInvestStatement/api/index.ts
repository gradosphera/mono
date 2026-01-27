import type {
  IGenerateDocumentOptionsInput,
  IGeneratedDocumentOutput,
} from 'src/shared/lib/types/document';
import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

async function generateGenerationPropertyInvestStatement(
  data: Mutations.Capital.GenerateGenerationPropertyInvestStatement.IInput['data'],
  options?: IGenerateDocumentOptionsInput,
): Promise<IGeneratedDocumentOutput> {
  const { [Mutations.Capital.GenerateGenerationPropertyInvestStatement.name]: result } =
    await client.Mutation(Mutations.Capital.GenerateGenerationPropertyInvestStatement.mutation, {
      variables: {
        data,
        options,
      },
    });

  return result;
}

export const api = {
  generateGenerationPropertyInvestStatement,
};
