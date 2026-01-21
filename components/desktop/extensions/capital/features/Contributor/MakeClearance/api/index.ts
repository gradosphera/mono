import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';
import type { IGenerateDocumentInput, IGeneratedDocumentOutput } from 'src/shared/lib/types/document';

export type IMakeClearanceInput =
  Mutations.Capital.MakeClearance.IInput['data'];
export type IMakeClearanceOutput =
  Mutations.Capital.MakeClearance.IOutput[typeof Mutations.Capital.MakeClearance.name];

export type IGenerateProjectGenerationAgreementInput =
  Mutations.Capital.GenerateProjectGenerationAgreement.IInput['data'];
export type IGenerateProjectGenerationAgreementOutput =
  Mutations.Capital.GenerateProjectGenerationAgreement.IOutput[typeof Mutations.Capital.GenerateProjectGenerationAgreement.name];

export type IGenerateComponentGenerationAgreementInput =
  Mutations.Capital.GenerateComponentGenerationAgreement.IInput['data'];
export type IGenerateComponentGenerationAgreementOutput =
  Mutations.Capital.GenerateComponentGenerationAgreement.IOutput[typeof Mutations.Capital.GenerateComponentGenerationAgreement.name];

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

async function generateProjectGenerationAgreement(
  data: IGenerateProjectGenerationAgreementInput,
  options?: Mutations.Capital.GenerateProjectGenerationAgreement.IInput['options'],
): Promise<IGenerateProjectGenerationAgreementOutput> {
  const { [Mutations.Capital.GenerateProjectGenerationAgreement.name]: result } =
    await client.Mutation(Mutations.Capital.GenerateProjectGenerationAgreement.mutation, {
      variables: {
        data,
        options,
      },
    });

  return result;
}

async function generateComponentGenerationAgreement(
  data: IGenerateComponentGenerationAgreementInput,
  options?: Mutations.Capital.GenerateComponentGenerationAgreement.IInput['options'],
): Promise<IGenerateComponentGenerationAgreementOutput> {
  const { [Mutations.Capital.GenerateComponentGenerationAgreement.name]: result } =
    await client.Mutation(Mutations.Capital.GenerateComponentGenerationAgreement.mutation, {
      variables: {
        data,
        options,
      },
    });

  return result;
}

export const api = {
  makeClearance,
  generateProjectGenerationAgreement,
  generateComponentGenerationAgreement,
};
