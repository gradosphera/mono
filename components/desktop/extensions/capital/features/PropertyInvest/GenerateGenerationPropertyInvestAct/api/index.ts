import type {
  IGenerateDocumentOptionsInput,
  IGeneratedDocumentOutput,
} from 'src/shared/lib/types/document';
import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

async function generateGenerationPropertyInvestAct(
  data: Mutations.Capital.GenerateGenerationPropertyInvestAct.IInput['data'],
  options?: IGenerateDocumentOptionsInput,
): Promise<IGeneratedDocumentOutput> {
  const { [Mutations.Capital.GenerateGenerationPropertyInvestAct.name]: result } =
    await client.Mutation(Mutations.Capital.GenerateGenerationPropertyInvestAct.mutation, {
      variables: {
        data,
        options,
      },
    });

  return result;
}

export const api = {
  generateGenerationPropertyInvestAct,
};
