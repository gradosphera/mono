import { client } from 'src/shared/api/client';
import { Queries, type ModelTypes } from '@coopenomics/coopjs';

async function loadExtensions(data?: ModelTypes['GetExtensionsInput']): Promise<ModelTypes['Extension'][]> {
  const { getExtensions: output } = await client.Query(
    Queries.getExtensions,
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
