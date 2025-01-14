import type { IHealthResponse } from '@coopenomics/controller';
import { sendGET } from 'src/shared/api';

async function healthCheck(): Promise<IHealthResponse> {
  return (await sendGET('/v1/system/health', {}, true)) as IHealthResponse;
}

export const api ={
  healthCheck
}
