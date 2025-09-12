import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

export type IConvertSegmentInput =
  Mutations.Capital.ConvertSegment.IInput['data'];
export type IConvertSegmentOutput =
  Mutations.Capital.ConvertSegment.IOutput[typeof Mutations.Capital.ConvertSegment.name];

async function convertSegment(
  data: IConvertSegmentInput,
): Promise<IConvertSegmentOutput> {
  const { [Mutations.Capital.ConvertSegment.name]: result } =
    await client.Mutation(Mutations.Capital.ConvertSegment.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

export const api = {
  convertSegment,
};
