import { client } from 'src/shared/api/client';
import { Queries } from '@coopenomics/sdk';
import type { ZExtension } from '../model';

async function loadExtensions(data?: Queries.Extensions.GetExtensions.IInput['data']): Promise<ZExtension[]> {
  const { [Queries.Extensions.GetExtensions.name]: output } = await client.Query(
    Queries.Extensions.GetExtensions.query,
    {
      variables: {
        data
      }
    }
  );
  return output;
}

export const api ={
  loadExtensions
}
