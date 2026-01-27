import type { IGeneratedDocumentOutput } from 'src/shared/lib/types/document';
import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

export interface IGenerateCapitalRegistrationDocumentsInput {
  coopname: string;
  username: string;
  lang?: string;
}

export interface IGenerateCapitalRegistrationDocumentsOutput {
  generation_contract?: IGeneratedDocumentOutput;
  storage_agreement?: IGeneratedDocumentOutput;
  blagorost_agreement?: IGeneratedDocumentOutput;
  generator_offer?: IGeneratedDocumentOutput;
}

async function generateCapitalRegistrationDocuments(
  data: IGenerateCapitalRegistrationDocumentsInput
): Promise<IGenerateCapitalRegistrationDocumentsOutput> {
  const { [Mutations.Capital.GenerateCapitalRegistrationDocuments.name]: result } =
    await client.Mutation(Mutations.Capital.GenerateCapitalRegistrationDocuments.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

export const api = {
  generateCapitalRegistrationDocuments,
};
