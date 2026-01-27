import type {
  IGenerateDocumentOptionsInput,
  IGeneratedDocumentOutput,
} from 'src/shared/lib/types/document';
import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

async function generateExpenseDecision(
  data: Mutations.Capital.GenerateExpenseDecision.IInput['data'],
  options?: IGenerateDocumentOptionsInput,
): Promise<IGeneratedDocumentOutput> {
  const { [Mutations.Capital.GenerateExpenseDecision.name]: result } =
    await client.Mutation(Mutations.Capital.GenerateExpenseDecision.mutation, {
      variables: {
        data,
        options,
      },
    });

  return result;
}

export const api = {
  generateExpenseDecision,
};
