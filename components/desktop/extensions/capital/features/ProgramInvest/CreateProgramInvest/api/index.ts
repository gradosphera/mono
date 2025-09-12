import type {
  ICreateProgramInvestOutput,
  ICreateProgramInvestInput,
} from 'app/extensions/capital/entities/ProgramInvest/model';
import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

async function createProgramInvest(
  data: ICreateProgramInvestInput,
): Promise<ICreateProgramInvestOutput> {
  const { [Mutations.Capital.CreateProgramProperty.name]: result } =
    await client.Mutation(Mutations.Capital.CreateProgramProperty.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

export const api = {
  createProgramInvest,
};
