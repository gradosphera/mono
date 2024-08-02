import { IHealthResponse } from 'coopback';
import { sendGET } from 'src/shared/api';

async function healthCheck(): Promise<IHealthResponse> {
  return (await sendGET('/v1/mono/health', {}, true)) as IHealthResponse;
}

export const api ={
  healthCheck
}
