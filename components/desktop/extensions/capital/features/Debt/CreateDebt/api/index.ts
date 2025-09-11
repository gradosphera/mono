import type {
  ICreateDebtOutput,
  ICreateDebtInput,
} from 'app/extensions/capital/entities/Debt/model';
import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

async function createDebt(data: ICreateDebtInput): Promise<ICreateDebtOutput> {
  const { [Mutations.Capital.CreateDebt.name]: result } = await client.Mutation(
    Mutations.Capital.CreateDebt.mutation,
    {
      variables: {
        data,
      },
    },
  );

  return result;
}

export const api = {
  createDebt,
};
