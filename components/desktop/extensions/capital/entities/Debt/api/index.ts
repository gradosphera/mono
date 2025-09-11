import { client } from 'src/shared/api/client';
import { Queries } from '@coopenomics/sdk';
import type {
  IDebt,
  IDebtsPagination,
  IGetDebtInput,
  IGetDebtsInput,
} from '../model';

async function loadDebts(data: IGetDebtsInput): Promise<IDebtsPagination> {
  const { [Queries.Capital.GetDebts.name]: output } = await client.Query(
    Queries.Capital.GetDebts.query,
    {
      variables: data,
    },
  );
  return output;
}

async function loadDebt(data: IGetDebtInput): Promise<IDebt> {
  const { [Queries.Capital.GetDebt.name]: output } = await client.Query(
    Queries.Capital.GetDebt.query,
    {
      variables: {
        data,
      },
    },
  );
  return output;
}

export const api = {
  loadDebts,
  loadDebt,
};
