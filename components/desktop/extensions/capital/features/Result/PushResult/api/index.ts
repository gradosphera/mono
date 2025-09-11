import type {
  IPushResultOutput,
  IPushResultInput,
} from 'app/extensions/capital/entities/Result/model';

import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

async function pushResult(data: IPushResultInput): Promise<IPushResultOutput> {
  const { [Mutations.Capital.PushResult.name]: result } = await client.Mutation(
    Mutations.Capital.PushResult.mutation,
    {
      variables: {
        data,
      },
    },
  );

  return result;
}

export const api = {
  pushResult,
};
