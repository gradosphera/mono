import { client } from 'src/shared/api/client';
import { Queries } from '@coopenomics/sdk';
import type {
  IResult,
  IResultsPagination,
  IGetResultInput,
  IGetResultsInput,
} from '../model';

async function loadResults(
  data: IGetResultsInput,
): Promise<IResultsPagination> {
  const { [Queries.Capital.GetResults.name]: output } = await client.Query(
    Queries.Capital.GetResults.query,
    {
      variables: data,
    },
  );
  return output;
}

async function loadResult(data: IGetResultInput): Promise<IResult> {
  const { [Queries.Capital.GetResult.name]: output } = await client.Query(
    Queries.Capital.GetResult.query,
    {
      variables: {
        data,
      },
    },
  );
  return output;
}

export const api = {
  loadResults,
  loadResult,
};
