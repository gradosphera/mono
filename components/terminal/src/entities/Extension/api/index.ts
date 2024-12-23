import { client } from 'src/shared/api/client';
import { Queries, type ModelTypes } from '@coopenomics/coopjs';
import type { ZExtension } from '../model';

async function loadExtensions(data?: ModelTypes['GetExtensionsInput']): Promise<ZExtension[]> {
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
