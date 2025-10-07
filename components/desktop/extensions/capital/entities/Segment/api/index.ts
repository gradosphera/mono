import { client } from 'src/shared/api/client';
import { Queries } from '@coopenomics/sdk';
import type { ISegmentsPagination, IGetSegmentsInput } from '../model';

async function loadSegments(data: IGetSegmentsInput): Promise<ISegmentsPagination> {
  const { [Queries.Capital.GetSegments.name]: output } = await client.Query(
    Queries.Capital.GetSegments.query,
    {
      variables: data,
    },
  );
  return output;
}

export const api = {
  loadSegments,
};
