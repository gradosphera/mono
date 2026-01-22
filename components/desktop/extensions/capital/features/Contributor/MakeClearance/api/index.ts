import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';
import type { IGenerateDocumentInput, IGeneratedDocumentOutput } from 'src/shared/lib/types/document';

export type IMakeClearanceInput =
  Mutations.Capital.MakeClearance.IInput['data'];
export type IMakeClearanceOutput =
  Mutations.Capital.MakeClearance.IOutput[typeof Mutations.Capital.MakeClearance.name];

export type IGenerateProjectGenerationContractInput =
  Mutations.Capital.GenerateProjectGenerationContract.IInput['data'];
export type IGenerateProjectGenerationContractOutput =
  Mutations.Capital.GenerateProjectGenerationContract.IOutput[typeof Mutations.Capital.GenerateProjectGenerationContract.name];

export type IGenerateComponentGenerationContractInput =
  Mutations.Capital.GenerateComponentGenerationContract.IInput['data'];
export type IGenerateComponentGenerationContractOutput =
  Mutations.Capital.GenerateComponentGenerationContract.IOutput[typeof Mutations.Capital.GenerateComponentGenerationContract.name];

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

async function generateProjectGenerationContract(
  data: IGenerateProjectGenerationContractInput,
  options?: Mutations.Capital.GenerateProjectGenerationContract.IInput['options'],
): Promise<IGenerateProjectGenerationContractOutput> {
  const { [Mutations.Capital.GenerateProjectGenerationContract.name]: result } =
    await client.Mutation(Mutations.Capital.GenerateProjectGenerationContract.mutation, {
      variables: {
        data,
        options,
      },
    });

  return result;
}

async function generateComponentGenerationContract(
  data: IGenerateComponentGenerationContractInput,
  options?: Mutations.Capital.GenerateComponentGenerationContract.IInput['options'],
): Promise<IGenerateComponentGenerationContractOutput> {
  const { [Mutations.Capital.GenerateComponentGenerationContract.name]: result } =
    await client.Mutation(Mutations.Capital.GenerateComponentGenerationContract.mutation, {
      variables: {
        data,
        options,
      },
    });

  return result;
}

export const api = {
  makeClearance,
  generateProjectGenerationContract,
  generateComponentGenerationContract,
};
