import { Queries } from '@coopenomics/sdk';
import type { IDesktop } from '../model/types';
import { client } from 'src/shared/api/client';

async function getDesktop(): Promise<IDesktop> {
  const { [Queries.Desktop.GetDesktop.name]: output } = await client.Query(Queries.Desktop.GetDesktop.query, {
    variables: {
      data: {}
    }
  });

  return output;
}


export const api ={
  getDesktop
}
