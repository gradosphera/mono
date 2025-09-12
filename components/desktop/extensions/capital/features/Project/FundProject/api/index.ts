import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

export type IFundProjectInput = Mutations.Capital.FundProject.IInput['data'];
export type IFundProjectOutput =
  Mutations.Capital.FundProject.IOutput[typeof Mutations.Capital.FundProject.name];

async function fundProject(
  data: IFundProjectInput,
): Promise<IFundProjectOutput> {
  const { [Mutations.Capital.FundProject.name]: result } =
    await client.Mutation(Mutations.Capital.FundProject.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

export const api = {
  fundProject,
};
