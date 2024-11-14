import { client } from 'src/shared/api/client';
import { getExtensions, IGetExtensions, type IGetExtensionsInput } from '@coopenomics/coopjs/queries/getExtensions';

async function loadExtensions(data?: IGetExtensionsInput): Promise<IGetExtensions['getExtensions']> {
  const { getExtensions: output } = await client.Query(
    getExtensions,
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
