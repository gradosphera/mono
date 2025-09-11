import { client } from 'src/shared/api/client';
import { Queries } from '@coopenomics/sdk';
import type {
  IInvest,
  IInvestsPagination,
  IGetInvestInput,
  IGetInvestsInput,
} from '../model';

async function loadInvests(
  data: IGetInvestsInput,
): Promise<IInvestsPagination> {
  const { [Queries.Capital.GetInvests.name]: output } = await client.Query(
    Queries.Capital.GetInvests.query,
    {
      variables: data,
    },
  );
  return output;
}

async function loadInvest(data: IGetInvestInput): Promise<IInvest> {
  const { [Queries.Capital.GetInvest.name]: output } = await client.Query(
    Queries.Capital.GetInvest.query,
    {
      variables: {
        data,
      },
    },
  );
  return output;
}

export const api = {
  loadInvests,
  loadInvest,
};
