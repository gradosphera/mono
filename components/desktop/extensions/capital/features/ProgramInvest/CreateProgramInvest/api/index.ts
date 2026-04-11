import { Mutations } from '@coopenomics/sdk';

import { client } from 'src/shared/api/client';
import type { IGenerateDocumentOptionsInput, IGeneratedDocumentOutput } from 'src/shared/lib/types/document';
export type ICreateProgramInvestInput =
  Mutations.Capital.CreateProgramInvest.IInput['data'];
export type ICreateProgramInvestOutput =
  Mutations.Capital.CreateProgramInvest.IOutput[typeof Mutations.Capital.CreateProgramInvest.name];


async function createProgramInvest(
  data: ICreateProgramInvestInput,
): Promise<ICreateProgramInvestOutput> {
  const { [Mutations.Capital.CreateProgramInvest.name]: result } =
    await client.Mutation(Mutations.Capital.CreateProgramInvest.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

async function generateProgramMoneyInvestStatement(
  data: Mutations.Capital.GenerateProgramMoneyInvestStatement.IInput['data'],
  options?: IGenerateDocumentOptionsInput,
): Promise<IGeneratedDocumentOutput> {
  const { [Mutations.Capital.GenerateProgramMoneyInvestStatement.name]: result } =
    await client.Mutation(Mutations.Capital.GenerateProgramMoneyInvestStatement.mutation, {
      variables: {
        data,
        options,
      },
    });

  return result;
}

export const api = {
  createProgramInvest,
  generateProgramMoneyInvestStatement,
};
