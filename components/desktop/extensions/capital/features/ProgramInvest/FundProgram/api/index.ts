import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

export type IFundProgramInput = Mutations.Capital.FundProgram.IInput['data'];
export type IFundProgramOutput =
  Mutations.Capital.FundProgram.IOutput[typeof Mutations.Capital.FundProgram.name];

async function fundProgram(
  data: IFundProgramInput,
): Promise<IFundProgramOutput> {
  const { [Mutations.Capital.FundProgram.name]: result } =
    await client.Mutation(Mutations.Capital.FundProgram.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

export const api = {
  fundProgram,
};
