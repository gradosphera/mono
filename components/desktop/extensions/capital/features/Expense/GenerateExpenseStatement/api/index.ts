import type {
  IGenerateDocumentInput,
  IGenerateDocumentOptionsInput,
  IGeneratedDocumentOutput,
} from 'src/shared/lib/types/document';
import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

async function generateExpenseStatement(
  data: IGenerateDocumentInput,
  options?: IGenerateDocumentOptionsInput,
): Promise<IGeneratedDocumentOutput> {
  const { [Mutations.Capital.GenerateExpenseStatement.name]: result } =
    await client.Mutation(Mutations.Capital.GenerateExpenseStatement.mutation, {
      variables: {
        data,
        options,
      },
    });

  return result;
}

export const api = {
  generateExpenseStatement,
};
