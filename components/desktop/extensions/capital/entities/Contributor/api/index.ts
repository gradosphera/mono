import { client } from 'src/shared/api/client';
import { Queries } from '@coopenomics/sdk';
import type {
  IContributor,
  IContributorsPagination,
  IGetContributorInput,
  IGetContributorsInput,
} from '../model';

async function loadContributors(
  data: IGetContributorsInput,
): Promise<IContributorsPagination> {

  const { [Queries.Capital.GetContributors.name]: output } = await client.Query(
    Queries.Capital.GetContributors.query,
    {
      variables: data,
    },
  );
  return output;
}

async function loadContributor(
  data: IGetContributorInput,
): Promise<IContributor> {
  const { [Queries.Capital.GetContributor.name]: output } = await client.Query(
    Queries.Capital.GetContributor.query,
    {
      variables: {
        data,
      },
    },
  );
  return output;
}

export const api = {
  loadContributors,
  loadContributor,
};
