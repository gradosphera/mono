import type { Cooperative } from 'cooptypes';
import type { IGenerate, IGeneratedDocument } from '../model';

import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

async function generateDocument(data: IGenerate, options?: Cooperative.Document.IGenerationOptions): Promise<IGeneratedDocument> {
  const { [Mutations.Documents.GenerateDocument.name]: result } = await client.Mutation(
    Mutations.Documents.GenerateDocument.mutation,
    {
      variables: {
        input: {
          data,
          options,
        },
      },
    }
  );

  return result;
}

export const api = {
  generateDocument,
};
