import type {
  IGenerateDocumentOptionsInput,
  IGeneratedDocumentOutput,
} from 'src/shared/lib/types/document';
import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

async function generateGetLoanDecision(
  data: Mutations.Capital.GenerateGetLoanDecision.IInput['data'],
  options?: IGenerateDocumentOptionsInput,
): Promise<IGeneratedDocumentOutput> {
  const { [Mutations.Capital.GenerateGetLoanDecision.name]: result } =
    await client.Mutation(Mutations.Capital.GenerateGetLoanDecision.mutation, {
      variables: {
        data,
        options,
      },
    });

  return result;
}

export const api = {
  generateGetLoanDecision,
};
