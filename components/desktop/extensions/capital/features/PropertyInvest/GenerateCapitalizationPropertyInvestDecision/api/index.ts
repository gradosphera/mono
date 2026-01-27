import type {
  IGenerateDocumentOptionsInput,
  IGeneratedDocumentOutput,
} from 'src/shared/lib/types/document';
import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

async function generateCapitalizationPropertyInvestDecision(
  data: Mutations.Capital.GenerateCapitalizationPropertyInvestDecision.IInput['data'],
  options?: IGenerateDocumentOptionsInput,
): Promise<IGeneratedDocumentOutput> {
  const { [Mutations.Capital.GenerateCapitalizationPropertyInvestDecision.name]: result } =
    await client.Mutation(Mutations.Capital.GenerateCapitalizationPropertyInvestDecision.mutation, {
      variables: {
        data,
        options,
      },
    });

  return result;
}

export const api = {
  generateCapitalizationPropertyInvestDecision,
};
