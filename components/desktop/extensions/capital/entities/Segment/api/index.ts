import { client } from 'src/shared/api/client';
import { Queries } from '@coopenomics/sdk';
import type { ISegmentsPagination, IGetSegmentsInput, ISegment, IGetSegmentInput } from '../model';

async function loadSegments(data: IGetSegmentsInput): Promise<ISegmentsPagination> {
  const { [Queries.Capital.GetSegments.name]: output } = await client.Query(
    Queries.Capital.GetSegments.query,
    {
      variables: data,
    },
  );
  return output;
}

async function loadSegment(data: IGetSegmentInput): Promise<ISegment> {
  const { [Queries.Capital.GetSegment.name]: output } = await client.Query(
    Queries.Capital.GetSegment.query,
    {
      variables: data,
    },
  );

  if (!output) {
    throw new Error('Segment not found');
  }

  return output;
}

export const api = {
  loadSegments,
  loadSegment,
};
