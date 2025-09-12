import type {
  ISetConfigOutput,
  ISetConfigInput,
} from 'app/extensions/capital/entities/Config/model';
import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

async function setConfig(data: ISetConfigInput): Promise<ISetConfigOutput> {
  const { [Mutations.Capital.SetConfig.name]: result } = await client.Mutation(
    Mutations.Capital.SetConfig.mutation,
    {
      variables: {
        data,
      },
    },
  );

  return result;
}

export const api = {
  setConfig,
};
