import { client } from 'src/shared/api/client';
import { Queries } from '@coopenomics/sdk';
import type { IGetConfigInput, IConfig } from '../model';

async function loadConfig(data: IGetConfigInput): Promise<IConfig> {
  const { [Queries.Capital.GetConfig.name]: output } = await client.Query(
    Queries.Capital.GetConfig.query,
    {
      variables: {
        data,
      },
    },
  );
  return output;
}

export const api = {
  loadConfig,
};
