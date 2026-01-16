import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';
import type { IGenerateDocumentInput, IGeneratedDocumentOutput } from 'src/shared/lib/types/document';

export type IMakeClearanceInput =
  Mutations.Capital.MakeClearance.IInput['data'];
export type IMakeClearanceOutput =
  Mutations.Capital.MakeClearance.IOutput[typeof Mutations.Capital.MakeClearance.name];

export type IGenerateAppendixGenerationAgreementInput =
  Mutations.Capital.GenerateAppendixGenerationAgreement.IInput['data'];
export type IGenerateAppendixGenerationAgreementOutput =
  Mutations.Capital.GenerateAppendixGenerationAgreement.IOutput[typeof Mutations.Capital.GenerateAppendixGenerationAgreement.name];

export type { IGenerateDocumentInput, IGeneratedDocumentOutput };

async function makeClearance(
  data: IMakeClearanceInput,
): Promise<IMakeClearanceOutput> {
  const { [Mutations.Capital.MakeClearance.name]: result } =
    await client.Mutation(Mutations.Capital.MakeClearance.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

async function generateAppendixGenerationAgreement(
  data: IGenerateAppendixGenerationAgreementInput,
  options?: Mutations.Capital.GenerateAppendixGenerationAgreement.IInput['options'],
): Promise<IGenerateAppendixGenerationAgreementOutput> {
  const { [Mutations.Capital.GenerateAppendixGenerationAgreement.name]: result } =
    await client.Mutation(Mutations.Capital.GenerateAppendixGenerationAgreement.mutation, {
      variables: {
        data,
        options,
      },
    });

  return result;
}

export const api = {
  makeClearance,
  generateAppendixGenerationAgreement,
};
