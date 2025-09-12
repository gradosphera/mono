import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

export type IRefreshSegmentInput =
  Mutations.Capital.RefreshSegment.IInput['data'];
export type IRefreshSegmentOutput =
  Mutations.Capital.RefreshSegment.IOutput[typeof Mutations.Capital.RefreshSegment.name];

async function refreshSegment(
  data: IRefreshSegmentInput,
): Promise<IRefreshSegmentOutput> {
  const { [Mutations.Capital.RefreshSegment.name]: result } =
    await client.Mutation(Mutations.Capital.RefreshSegment.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

export const api = {
  refreshSegment,
};
