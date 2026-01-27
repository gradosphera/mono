import type {
  IGenerateDocumentOptionsInput,
  IGeneratedDocumentOutput,
} from 'src/shared/lib/types/document';
import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

async function generateCapitalizationPropertyInvestAct(
  data: Mutations.Capital.GenerateCapitalizationPropertyInvestAct.IInput['data'],
  options?: IGenerateDocumentOptionsInput,
): Promise<IGeneratedDocumentOutput> {
  const { [Mutations.Capital.GenerateCapitalizationPropertyInvestAct.name]: result } =
    await client.Mutation(Mutations.Capital.GenerateCapitalizationPropertyInvestAct.mutation, {
      variables: {
        data,
        options,
      },
    });

  return result;
}

export const api = {
  generateCapitalizationPropertyInvestAct,
};
