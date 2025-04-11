import type { IHealthResponse } from '@coopenomics/controller';
import { Queries } from '@coopenomics/sdk';
import { sendGET } from 'src/shared/api';
import type { IDesktop } from '../model/types';
import { client } from 'src/shared/api/client';

async function healthCheck(): Promise<IHealthResponse> {
  return (await sendGET('/v1/system/health', {}, true)) as IHealthResponse;
}

async function getDesktop(): Promise<IDesktop> {
  const { [Queries.Desktop.GetDesktop.name]: output } = await client.Query(Queries.Desktop.GetDesktop.query, {
    variables: {
      data: {}
    }
  });

  return output;
}


export const api ={
  healthCheck,
  getDesktop
}
